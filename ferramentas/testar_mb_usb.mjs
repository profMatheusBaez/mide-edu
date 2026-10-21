/* ============================================================
 * testar_mb_usb.mjs — só desenvolvimento (Node ≥ 18)
 * Testa js/microbit_usb.js contra uma conexão USB FALSA (a mesma
 * interface do @microbit/microbit-connection). Não precisa de
 * micro:bit nem de WebUSB.
 *
 *   node ferramentas/testar_mb_usb.mjs
 *
 * Confere: fila única (nenhuma escrita concorrente com o flash);
 * estados; serial em pedaços (CRLF partido, UTF-8 partido) vira linhas;
 * desconexão no meio da gravação vira mensagem, não exceção solta;
 * "sem WebUSB" com texto claro; requestDevice = primeira chamada.
 * ============================================================ */
import { createRequire } from 'module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const USB = require('../js/microbit_usb.js');

let falhas = 0, total = 0;
async function teste(nome, fn) {
  total++;
  try { await fn(); console.log('  ok   ' + nome); }
  catch (e) { falhas++; console.log('  FALHA ' + nome + '\n       ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n       ') : e)); }
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- conexão falsa ---------- */
function criarFalsa(op = {}) {
  const ouvintes = {};
  const reg = { chamadas: [], concorrencia: 0, escritas: [], flashes: [], emFlash: false, connectAntesDeAwait: false };
  const conn = {
    status: 'Disconnected',
    addEventListener(t, f) { (ouvintes[t] = ouvintes[t] || []).push(f); },
    emitir(t, d) { for (const f of (ouvintes[t] || [])) f(d); },
    mudarStatus(s) { conn.status = s; conn.emitir('status', { status: s }); },
    connect() {
      reg.chamadas.push('connect');
      if (op.connectFalha) { const e = new Error('x'); e.code = op.connectFalha; return Promise.reject(e); }
      return espera(2).then(() => conn.mudarStatus('Connected'));
    },
    async disconnect() { reg.chamadas.push('disconnect'); conn.mudarStatus('Disconnected'); },
    getBoardVersion() { return op.versao || 'V2'; },
    dispose() { reg.chamadas.push('dispose'); },
    async flash(fonte, opcoes) {
      reg.chamadas.push('flash');
      reg.emFlash = true;
      try {
        const hex = await fonte(conn.getBoardVersion());
        reg.flashes.push({ hex, opcoes });
        for (const p of [0, 0.4, 1]) { opcoes.progress('PartialFlashing', p); await espera(5); }
        if (op.quedaNoFlash) {
          conn.mudarStatus('Disconnected');
          const e = new Error('cabo'); e.code = 'device-disconnected'; throw e;
        }
      } finally { reg.emFlash = false; }
    },
    async serialWrite(t) {
      reg.chamadas.push('serialWrite');
      if (reg.emFlash) reg.concorrencia++;
      await espera(1);
      reg.escritas.push(t);
    },
  };
  return { conn, reg };
}

/* ---------- testes ---------- */
await teste('sem WebUSB: suportado() é falso e conectar() explica em português', async () => {
  const u = USB.criar();
  assert.equal(u.suportado(), false);
  await assert.rejects(() => u.conectar(), (e) => /WebUSB/.test(e.message) && /Chrome/.test(e.message));
  assert.equal(u.estado, 'desconectado');
});

await teste('conectar(): connect() é a primeira coisa (síncrono, para o requestDevice do clique)', async () => {
  const f = criarFalsa();
  const u = USB.criar({ fabricaUSB: () => f.conn });
  const p = u.conectar();
  assert.deepEqual(f.reg.chamadas, ['connect'], 'connect() já foi chamado antes de qualquer await');
  assert.equal(u.estado, 'conectando');
  const info = await p;
  assert.equal(u.estado, 'conectado');
  assert.equal(info.v2, true);
});

await teste('cancelar a janela do navegador não é erro grave (cancelou = true)', async () => {
  const f = criarFalsa({ connectFalha: 'no-device-selected' });
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await assert.rejects(() => u.conectar(), (e) => e.cancelou === true && /Nenhuma micro:bit/.test(e.mensagem));
  assert.equal(u.estado, 'desconectado');
});

await teste('micro:bit em uso por outra aba: mensagem cita makecode e python.microbit.org', async () => {
  const f = criarFalsa({ connectFalha: 'device-in-use' });
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await assert.rejects(() => u.conectar(), (e) => /makecode\.microbit\.org/.test(e.message) && /python\.microbit\.org/.test(e.message));
});

await teste('gravar(): partial flashing, hex V2, progresso 0..1 e estado gravando → conectado', async () => {
  const f = criarFalsa();
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  const estados = [];
  u.on('estado', (e) => estados.push(e));
  const prog = [];
  const r = await u.gravar(':00000001FF\n', (fr) => prog.push(fr));
  assert.equal(r.ok, true);
  assert.equal(f.reg.flashes[0].hex, ':00000001FF\n');
  assert.equal(f.reg.flashes[0].opcoes.partial, true);
  assert.deepEqual(prog, [0, 0.4, 1]);
  assert.deepEqual(estados, ['gravando', 'conectado']);
});

await teste('progresso em porcentagem (0..100) também vira fração', async () => {
  const f = criarFalsa();
  f.conn.flash = async (fonte, o) => { await fonte('V2'); o.progress('PartialFlashing', 50); };
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  const prog = [];
  await u.gravar('x', (fr) => prog.push(fr));
  assert.deepEqual(prog, [0.5]);
});

await teste('FILA ÚNICA: escrever na serial durante o flash espera o flash acabar', async () => {
  const f = criarFalsa();
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  const pg = u.gravar('hex');
  const pe = u.escrever('oi\n');   // chamado com o flash em andamento
  const pe2 = u.escrever('tchau\n');
  const [rg, re, re2] = await Promise.all([pg, pe, pe2]);
  assert.equal(rg.ok, true);
  assert.equal(f.reg.concorrencia, 0, 'nenhum serialWrite correu junto com o flash');
  assert.deepEqual(f.reg.escritas, ['oi\n', 'tchau\n'], 'ordem preservada');
  assert.equal(re.ok && re2.ok, true);
  assert.deepEqual(f.reg.chamadas.filter((c) => c !== 'connect'), ['flash', 'serialWrite', 'serialWrite']);
});

await teste('duas gravações seguidas não se sobrepõem', async () => {
  const f = criarFalsa();
  let simult = 0, maximo = 0;
  f.conn.flash = async (fonte, o) => { simult++; maximo = Math.max(maximo, simult); await fonte('V2'); await espera(8); simult--; };
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  await Promise.all([u.gravar('a'), u.gravar('b'), u.gravar('c')]);
  assert.equal(maximo, 1);
});

await teste('cabo arrancado no meio da gravação: vira mensagem clara, não exceção; estado desconectado', async () => {
  const f = criarFalsa({ quedaNoFlash: true });
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  let caiu = 0;
  u.on('desconectou', () => caiu++);
  const r = await u.gravar('hex');
  assert.equal(r.ok, false);
  assert.match(r.erro, /desconectada/);
  assert.equal(u.estado, 'desconectado');
  assert.equal(caiu, 1);
  const r2 = await u.gravar('hex');   // e depois disso, gravar sem placa também não explode
  assert.equal(r2.ok, false);
  assert.match(r2.erro, /não está conectada|Conectar/);
});

await teste('placa V1 é recusada com mensagem (só V2)', async () => {
  const f = criarFalsa({ versao: 'V1' });
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  const r = await u.gravar('hex');
  assert.equal(r.ok, false);
  assert.match(r.erro, /V2/);
});

await teste('gravar/escrever sem conectar: resultado ok=false, sem exceção', async () => {
  const u = USB.criar({ fabricaUSB: () => criarFalsa().conn });
  assert.equal((await u.gravar('x')).ok, false);
  assert.equal((await u.escrever('x')).ok, false);
});

await teste('serial em pedaços quaisquer vira linhas (inclui CRLF partido)', async () => {
  const linhas = [];
  const b = USB.criarBufferLinhas((l) => linhas.push(l));
  for (const p of ['te', 'mp:2', '3\r', '\nluz:', '100\n\nfim', '\r\n']) b.adicionar(p);
  assert.deepEqual(linhas, ['temp:23', 'luz:100', '', 'fim']);
  assert.equal(b.pendente(), false);
  b.adicionar('sem quebra');
  assert.equal(b.pendente(), true);
  b.descarregar();
  assert.equal(linhas[linhas.length - 1], 'sem quebra');
});

await teste('serial: UTF-8 partido ao meio pelo USB (U+FFFD) não vira lixo na tela', async () => {
  const linhas = [];
  const b = USB.criar().criarBufferLinhas((l) => linhas.push(l));
  const bytes = new TextEncoder().encode('ação\n');
  /* simula o que a biblioteca faz: TextDecoder novo a cada pedaço, cortando o "ç" ao meio */
  const dec = (u8) => new TextDecoder().decode(u8);
  b.adicionar(dec(bytes.slice(0, 2)));   // "a" + 1º byte do "ç"
  b.adicionar(dec(bytes.slice(2)));      // 2º byte do "ç" + "ão\n"
  assert.equal(linhas.length, 1);
  assert.ok(!linhas[0].includes('�'), 'sem caractere de substituição: ' + JSON.stringify(linhas[0]));
});

await teste('serialdata da conexão chega em on("texto")', async () => {
  const f = criarFalsa();
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  const recebido = [];
  u.on('texto', (t) => recebido.push(t));
  f.conn.emitir('serialdata', { data: 'oi\n' });
  f.conn.emitir('serialdata', { data: '' });
  assert.deepEqual(recebido, ['oi\n']);
});

await teste('desconectar(): aguarda a fila e deixa o estado desconectado; liberar() faz dispose', async () => {
  const f = criarFalsa();
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  const pg = u.gravar('hex');
  await u.desconectar();
  await pg;
  assert.equal(u.estado, 'desconectado');
  assert.ok(f.reg.chamadas.indexOf('flash') < f.reg.chamadas.indexOf('disconnect'), 'flash terminou antes do disconnect');
  await u.liberar();
  assert.ok(f.reg.chamadas.includes('dispose'));
});

await teste('cabo solto fora de gravação: estado volta a desconectado e avisa', async () => {
  const f = criarFalsa();
  const u = USB.criar({ fabricaUSB: () => f.conn });
  await u.conectar();
  let caiu = 0;
  u.on('desconectou', () => caiu++);
  f.conn.mudarStatus('Disconnected');
  assert.equal(u.estado, 'desconectado');
  assert.equal(caiu, 1);
});

console.log('\n' + (total - falhas) + '/' + total + ' testes passaram');
process.exit(falhas ? 1 : 0);
