/* ============================================================
 * testar_pybricks_ble.mjs — só desenvolvimento (Node ≥ 18)
 * Testa js/pybricks_ble.js contra um GATT falso. Não precisa de
 * hub nem de Bluetooth.
 *
 *   node ferramentas/testar_pybricks_ble.mjs
 *
 * Confere: sequência exata META(0) → RAM(offset, pedaço) × N →
 * META(N) → START; pedaços de maxChar−5 com offsets corretos (com
 * maxChar = 20 e 158, para pegar erro de fatiamento); nenhuma
 * escrita começa antes da anterior terminar; stdout fragmentado
 * (inclusive caractere UTF-8 partido) vira linhas; STOP antes de
 * reenviar; desconexão; versões de firmware.
 * ============================================================ */
import { createRequire } from 'module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const Pybricks = require('../js/pybricks_ble.js');

let falhas = 0, total = 0;
async function teste(nome, fn) {
  total++;
  try { await fn(); console.log('  ok   ' + nome); }
  catch (e) { falhas++; console.log('  FALHA ' + nome + '\n       ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n       ') : e)); }
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const u32le = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
const dv = (bytes) => new DataView(Uint8Array.from(bytes).buffer);
const texto = (s) => Array.from(new TextEncoder().encode(s));

/* ---------- GATT falso ---------- */
function criarFalso(op = {}) {
  const cfg = { maxChar: 20, flags: 0b10, maxPrograma: 8192, slots: null, perfil: '1.4.0', firmware: '3.6.1', nome: 'Technic Hub', ...op };
  const st = {
    escritas: [], emAndamento: false, concorrencia: 0, requestDeviceChamado: false,
    ouvintesNotif: [], ouvintesDev: [], conectado: false, rodando: !!cfg.rodando,
  };
  const enviarStatus = (flags) => notificar([0, ...u32le(flags)]);
  function notificar(bytes) {
    for (const f of st.ouvintesNotif.slice()) f({ target: { value: dv(bytes) } });
  }
  const carCmd = {
    addEventListener: (t, f) => { if (t === 'characteristicvaluechanged') st.ouvintesNotif.push(f); },
    removeEventListener: (t, f) => { st.ouvintesNotif = st.ouvintesNotif.filter((x) => x !== f); },
    startNotifications: async () => { await espera(1); enviarStatus(st.rodando ? 1 << 6 : 0); },
    async writeValueWithResponse(data) {
      if (!st.conectado) { const e = new Error('GATT desconectado'); e.name = 'NetworkError'; throw e; }
      if (st.emAndamento) st.concorrencia++;
      st.emAndamento = true;
      await espera(Math.random() * 3);
      st.escritas.push(Array.from(data));
      st.emAndamento = false;
      if (data[0] === 0 && cfg.pararAoRecebeStop !== false) {          // STOP
        setTimeout(() => { st.rodando = false; enviarStatus(0); }, cfg.atrasoStop || 20);
      }
      if (data[0] === 1) { st.rodando = true; setTimeout(() => enviarStatus(1 << 6), 2); }   // START
    },
  };
  const capBytes = [cfg.maxChar & 255, cfg.maxChar >> 8, ...u32le(cfg.flags), ...u32le(cfg.maxPrograma)];
  if (cfg.slots != null) capBytes.push(cfg.slots);
  const carCap = { readValue: async () => dv(capBytes) };
  const servico = { getCharacteristic: async (u) => (u === Pybricks.UUID.comando ? carCmd : u === Pybricks.UUID.capacidades ? carCap : (() => { throw new Error('sem ' + u); })()) };
  const diChars = {
    [Pybricks.UUID.firmware]: cfg.firmware, [Pybricks.UUID.perfil]: cfg.perfil,
  };
  const servicoDI = {
    getCharacteristic: async (u) => {
      if (diChars[u] == null) throw new Error('sem ' + u);
      return { readValue: async () => dv(texto(diChars[u])) };
    },
  };
  const servidor = {
    get connected() { return st.conectado; },
    getPrimaryService: async (u) => {
      if (u === Pybricks.UUID.servico) return servico;
      if (u === Pybricks.UUID.infoDispositivo) { if (cfg.semDI) throw new Error('sem DI'); return servicoDI; }
      throw new Error('serviço desconhecido');
    },
    disconnect() { derrubar(); },
  };
  function derrubar() {
    if (!st.conectado) return;
    st.conectado = false;
    for (const f of st.ouvintesDev.slice()) f({});
  }
  const dispositivo = {
    name: cfg.nome,
    gatt: { connect: async () => { await espera(1); st.conectado = true; return servidor; } },
    addEventListener: (t, f) => { if (t === 'gattserverdisconnected') st.ouvintesDev.push(f); },
    removeEventListener: (t, f) => { st.ouvintesDev = st.ouvintesDev.filter((x) => x !== f); },
  };
  const bluetooth = {
    requestDevice(opcoes) {
      st.requestDeviceChamado = true;
      st.filtros = opcoes;
      if (cfg.cancelar) { const e = new Error('User cancelled'); e.name = 'NotFoundError'; return Promise.reject(e); }
      return Promise.resolve(dispositivo);
    },
  };
  return { bluetooth, st, notificar, enviarStatus, derrubar, cfg };
}

function blobDeTeste(n) {
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = (i * 31 + 7) & 255;
  return b;
}

/* confere a sequência completa de comandos gravados */
function conferirEnvio(escritas, blob, maxChar, { slots = 0, inicioEm = 0 } = {}) {
  const pedaco = maxChar - 5;
  let i = inicioEm;
  assert.deepEqual(escritas[i++], [3, 0, 0, 0, 0], 'META(0) primeiro');
  const rem = [];
  let esperado = 0;
  while (esperado < blob.length) {
    const c = escritas[i++];
    assert.equal(c[0], 4, 'comando RAM');
    const off = c[1] | (c[2] << 8) | (c[3] << 16) | (c[4] << 24);
    assert.equal(off, esperado, 'offset do pedaço');
    const dados = c.slice(5);
    assert.ok(dados.length >= 1 && dados.length <= pedaco, 'pedaço cabe em maxChar−5 (' + dados.length + ' ≤ ' + pedaco + ')');
    assert.ok(c.length <= maxChar, 'escrita inteira cabe em maxChar');
    if (esperado + dados.length < blob.length) assert.equal(dados.length, pedaco, 'pedaços cheios até o último');
    rem.push(...dados);
    esperado += dados.length;
  }
  assert.deepEqual(rem, Array.from(blob), 'blob reconstruído idêntico');
  assert.deepEqual(escritas[i++], [3, ...u32le(blob.length)], 'META(tamanho) depois dos pedaços');
  assert.deepEqual(escritas[i++], slots > 0 ? [1, 0] : [1], 'START por último');
  assert.equal(escritas.length, i, 'nada além do esperado');
}

console.log('Pybricks BLE — testes com GATT falso\n');

for (const maxChar of [20, 158]) {
  await teste('envio de 1 KB com maxChar = ' + maxChar, async () => {
    const f = criarFalso({ maxChar });
    const hub = Pybricks.criar({ bluetooth: f.bluetooth });
    const info = await hub.conectar();
    assert.equal(info.maxChar, maxChar);
    assert.equal(info.perfil, '1.4.0');
    assert.equal(info.nome, 'Technic Hub');
    const blob = blobDeTeste(1024);
    const progresso = [];
    await hub.enviarERodar(blob, (p) => progresso.push(p));
    conferirEnvio(f.st.escritas, blob, maxChar);
    assert.equal(f.st.concorrencia, 0, 'nenhuma escrita começou antes da anterior terminar');
    assert.ok(progresso.length > 0 && progresso.every((p, k) => k === 0 || p >= progresso[k - 1]), 'progresso crescente');
    assert.equal(progresso[progresso.length - 1], 1);
    await espera(10);
    assert.equal(hub.rodando, true, 'flag "rodando" chega pelo STATUS');
  });
}

await teste('blob menor que um pedaço e blob que é múltiplo exato do pedaço', async () => {
  for (const n of [1, 15, 30, 31]) {
    const f = criarFalso({ maxChar: 20 });
    const hub = Pybricks.criar({ bluetooth: f.bluetooth });
    await hub.conectar();
    const blob = blobDeTeste(n);
    await hub.enviarERodar(blob);
    conferirEnvio(f.st.escritas, blob, 20);
  }
});

await teste('requestDevice é chamado de forma síncrona (antes de qualquer await)', async () => {
  const f = criarFalso();
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  const p = hub.conectar();
  assert.equal(f.st.requestDeviceChamado, true, 'a ativação do usuário não pode expirar');
  assert.deepEqual(f.st.filtros.filters, [{ services: [Pybricks.UUID.servico] }]);
  assert.deepEqual(f.st.filtros.optionalServices, [0x180a]);
  await p;
});

await teste('perfil 1.5 com slots: START leva o byte do slot', async () => {
  const f = criarFalso({ maxChar: 158, slots: 1, perfil: '1.5.0' });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  const info = await hub.conectar();
  assert.equal(info.slots, 1);
  const blob = blobDeTeste(400);
  await hub.enviarERodar(blob);
  conferirEnvio(f.st.escritas, blob, 158, { slots: 1 });
});

await teste('programa maior que o limite do hub: erro e nenhuma escrita', async () => {
  const f = criarFalso({ maxPrograma: 100 });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  await assert.rejects(() => hub.enviarERodar(blobDeTeste(101)), (e) => e.codigo === 'PROGRAMA_GRANDE');
  assert.equal(f.st.escritas.length, 0);
});

await teste('programa rodando: manda STOP, espera o status cair e só então envia', async () => {
  const f = criarFalso({ rodando: true, maxChar: 20 });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  assert.equal(hub.rodando, true);
  const blob = blobDeTeste(64);
  await hub.enviarERodar(blob);
  assert.deepEqual(f.st.escritas[0], [0], 'STOP primeiro');
  conferirEnvio(f.st.escritas, blob, 20, { inicioEm: 1 });
});

await teste('programa rodando que não para: erro claro', async () => {
  const f = criarFalso({ rodando: true, pararAoRecebeStop: false });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  const antes = Date.now();
  await assert.rejects(() => hub.enviarERodar(blobDeTeste(10)), (e) => e.codigo === 'TEMPO');
  assert.ok(Date.now() - antes >= 3500);
});

await teste('parar() manda STOP', async () => {
  const f = criarFalso();
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  await hub.parar();
  assert.deepEqual(f.st.escritas, [[0]]);
});

await teste('escreverStdin fatia em maxChar−1 e usa o comando 6', async () => {
  const f = criarFalso({ maxChar: 20 });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  const msg = 'a'.repeat(45);
  await hub.escreverStdin(msg);
  assert.equal(f.st.escritas.length, 3);
  assert.ok(f.st.escritas.every((c) => c[0] === 6 && c.length <= 20));
  assert.equal(String.fromCharCode(...f.st.escritas.flatMap((c) => c.slice(1))), msg);
  assert.equal(f.st.concorrencia, 0);
});

await teste('escritas disparadas ao mesmo tempo entram na fila serial, na ordem', async () => {
  const f = criarFalso({ maxChar: 20 });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  await Promise.all([hub.parar(), hub.escreverStdin('abc'), hub.parar(), hub.escreverStdin('def')]);
  assert.equal(f.st.concorrencia, 0, 'GATT operation already in progress evitado');
  assert.deepEqual(f.st.escritas, [[0], [6, 97, 98, 99], [0], [6, 100, 101, 102]]);
});

await teste('stdout fragmentado (com UTF-8 e \\r\\n partidos) vira linhas', async () => {
  const f = criarFalso();
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  const linhas = [];
  const buf = Pybricks.criarBufferLinhas((l) => linhas.push(l));
  hub.on('stdout', (t) => buf.adicionar(t));
  const bytes = Array.from(new TextEncoder().encode('olá, ângulo 90\r\nsegunda linha\r\nsem fim'));
  const cortes = [3, 4, 5, 16, 17, 18, 31];        // corta no meio do "á" (2 bytes) e entre \r e \n
  let ini = 0;
  for (const c of [...cortes, bytes.length]) {
    f.notificar([1, ...bytes.slice(ini, c)]);
    ini = c;
  }
  assert.deepEqual(linhas, ['olá, ângulo 90', 'segunda linha']);
  assert.equal(buf.pendente(), 'sem fim');
  buf.descarregar();
  assert.deepEqual(linhas, ['olá, ângulo 90', 'segunda linha', 'sem fim']);
});

await teste('eventos de status: rodando, bateria, botão', async () => {
  const f = criarFalso();
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  const vistos = [];
  hub.on('status', (s) => vistos.push(s));
  f.enviarStatus(1 << 6);
  f.enviarStatus((1 << 6) | 1);
  f.enviarStatus((1 << 5));
  f.notificar([0, ...u32le(1 << 6), 3]);   // perfil ≥ 1.4: byte extra de programa
  assert.equal(vistos[0].rodando, true);
  assert.equal(vistos[0].mudouRodando, true);
  assert.equal(vistos[1].bateriaFraca, true);
  assert.equal(vistos[1].mudouRodando, false);
  assert.equal(vistos[2].botao, true);
  assert.equal(vistos[2].rodando, false);
  assert.equal(vistos[3].rodando, true, 'byte extra é ignorado');
});

await teste('desconexão: evento, estado e escrita seguinte com erro claro', async () => {
  const f = criarFalso();
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  let quantas = 0;
  hub.on('desconectou', () => quantas++);
  f.derrubar();
  assert.equal(quantas, 1);
  assert.equal(hub.conectado, false);
  assert.equal(hub.info, null);
  await assert.rejects(() => hub.parar(), (e) => e.codigo === 'DESCONECTADO');
  await assert.rejects(() => hub.enviarERodar(blobDeTeste(4)), (e) => e.codigo === 'DESCONECTADO');
  // reconectar depois funciona
  await hub.conectar();
  assert.equal(hub.conectado, true);
});

await teste('desconectar() pelo app dispara "desconectou" uma vez só', async () => {
  const f = criarFalso();
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  let quantas = 0;
  hub.on('desconectou', () => quantas++);
  await hub.desconectar();
  assert.equal(quantas, 1);
  assert.equal(hub.conectado, false);
});

await teste('hub derrubado no meio do envio: erro DESCONECTADO, sem exceção solta', async () => {
  const f = criarFalso({ maxChar: 20 });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await hub.conectar();
  let contador = 0;
  const original = f.st.escritas.push.bind(f.st.escritas);
  f.st.escritas.push = (...a) => { contador++; if (contador === 5) setTimeout(() => f.derrubar(), 0); return original(...a); };
  await assert.rejects(() => hub.enviarERodar(blobDeTeste(500)), (e) => e.codigo === 'DESCONECTADO');
});

await teste('usuário cancela a lista de dispositivos', async () => {
  const f = criarFalso({ cancelar: true });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await assert.rejects(() => hub.conectar(), (e) => e.codigo === 'CANCELADO' && /Windows/.test(e.message));
  assert.equal(hub.conectado, false);
});

await teste('navegador sem Web Bluetooth: mensagem pedindo Chrome/Edge', async () => {
  const hub = Pybricks.criar({ bluetooth: null });
  await assert.rejects(() => hub.conectar(), (e) => e.codigo === 'SEM_BLUETOOTH' && /Chrome/.test(e.message));
});

await teste('firmware sem multi-mpy6: pede atualização e não fica conectado', async () => {
  const f = criarFalso({ flags: 0 });
  const hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await assert.rejects(() => hub.conectar(), (e) => e.codigo === 'FIRMWARE' && /Atualize o firmware/.test(e.message));
  assert.equal(hub.conectado, false);
  assert.equal(f.st.conectado, false, 'GATT foi fechado');
});

await teste('perfil 1.1: recusa · perfil 1.2: conecta, mas avisa que não há print no Monitor', async () => {
  let f = criarFalso({ perfil: '1.1.0' });
  let hub = Pybricks.criar({ bluetooth: f.bluetooth });
  await assert.rejects(() => hub.conectar(), (e) => e.codigo === 'FIRMWARE');
  f = criarFalso({ perfil: '1.2.0' });
  hub = Pybricks.criar({ bluetooth: f.bluetooth });
  const info = await hub.conectar();
  assert.equal(info.temStdout, false);
  assert.match(info.avisos[0], /Monitor/);
  f = criarFalso({ perfil: '1.3.0' });
  hub = Pybricks.criar({ bluetooth: f.bluetooth });
  assert.equal((await hub.conectar()).temStdout, true);
});

console.log('\n' + (total - falhas) + '/' + total + ' testes passaram');
process.exit(falhas ? 1 : 0);
