/* ============================================================
 * testar_mb_ble.mjs — só desenvolvimento (Node ≥ 18)
 * Testa js/microbit_ble.js contra uma conexão Bluetooth FALSA (a mesma
 * interface do @microbit/microbit-connection), o Painel ao vivo
 * (js/microbit_ao_vivo.js, partes puras) e os 6 programas prontos
 * (js/microbit_exemplos.js: JS compila no MakeCode, Python passa na
 * sintaxe e na API).
 *
 *   node ferramentas/testar_mb_ble.mjs
 * ============================================================ */
import { createRequire } from 'module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const aqui = path.dirname(fileURLToPath(import.meta.url));
const BLE = require('../js/microbit_ble.js');
const AV = require('../js/microbit_ao_vivo.js');

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
  const reg = { chamadas: [], escritas: [], concorrencia: 0, emEscrita: 0, ordem: [] };
  const conn = {
    status: 'Disconnected',
    addEventListener(t, f) { (ouvintes[t] = ouvintes[t] || []).push(f); },
    emitir(t, d) { for (const f of (ouvintes[t] || [])) f(d); },
    mudarStatus(s) { conn.status = s; conn.emitir('status', { status: s }); },
    connect(opcoes) {
      reg.chamadas.push('connect');
      reg.opcoesConnect = opcoes;
      if (op.connectFalha) { const e = new Error('x'); e.code = op.connectFalha; return Promise.reject(e); }
      return espera(2).then(() => conn.mudarStatus('Connected'));
    },
    async disconnect() { reg.chamadas.push('disconnect'); conn.mudarStatus('Disconnected'); },
    dispose() { reg.chamadas.push('dispose'); },
    async uartWrite(bytes) {
      reg.chamadas.push('uartWrite');
      reg.emEscrita++;
      if (reg.emEscrita > 1) reg.concorrencia++;
      await espera(2);
      reg.escritas.push(Buffer.from(bytes).toString('utf8'));
      reg.tamanhos = (reg.tamanhos || []).concat(bytes.length);
      reg.emEscrita--;
    },
    async flash(obterHex, opcoes) {
      reg.chamadas.push('flash');
      reg.hexRecebido = await obterHex('V2');
      const prog = (opcoes && opcoes.progress) || (() => {});
      if (op.flashCancela) { const e = new Error('x'); e.code = 'no-device-selected'; throw e; }
      conn.mudarStatus('Connecting'); conn.mudarStatus('Connected');
      prog('Connecting'); prog('PartialFlashing', 0.5);
      if (op.flashCompleta) { prog('FullFlashing'); throw new Error('Device not found. Call "requestDevice"'); }
      if (op.flashErro) throw new Error(op.flashErro);
      prog('PartialFlashing', 1);
      conn.mudarStatus('Disconnected');
    },
    async getMagnetometerBearing() { if (op.semRumo) throw new Error('sem serviço'); return op.rumo ?? 90; },
    async triggerMagnetometerCalibration() { reg.chamadas.push('calibrar'); if (op.semRumo) throw new Error('no service'); },
  };
  return { conn, reg };
}
const nova = (op) => { const f = criarFalsa(op); return { ...f, b: BLE.criar({ fabricaBLE: () => f.conn }) }; };

/* ---------- Bluetooth ---------- */
await teste('sem Web Bluetooth: suportado() é falso e conectar() explica em português', async () => {
  const b = BLE.criar();
  assert.equal(b.suportado(), false);
  await assert.rejects(b.conectar(), (e) => /Chrome|Edge/.test(e.mensagem) && e.code === 'unsupported');
});

await teste('conectar: estados desconectado → conectando → conectado; connect é a 1ª chamada', async () => {
  const { b, reg } = nova();
  const vistos = [];
  b.on('estado', (e) => vistos.push(e));
  const p = b.conectar();
  assert.equal(b.estado, 'conectando');
  await p;
  assert.equal(b.estado, 'conectado');
  assert.equal(b.conectado, true);
  assert.deepEqual(vistos, ['conectando', 'conectado']);
  assert.equal(reg.chamadas[0], 'connect');
});

await teste('cancelar o seletor não é erro: cancelou = true, volta a desconectado', async () => {
  const { b } = nova({ connectFalha: 'no-device-selected' });
  await assert.rejects(b.conectar(), (e) => e.cancelou === true && /Nenhuma micro:bit/.test(e.mensagem));
  assert.equal(b.estado, 'desconectado');
});

await teste('erros da biblioteca viram mensagens em português', async () => {
  for (const [codigo, trecho] of [['disabled', /Bluetooth do computador/], ['timeout', /demorou/], ['connection-error', /modo de pareamento/], ['pairing-information-lost', /esqueceu o pareamento/]]) {
    const { b } = nova({ connectFalha: codigo });
    await assert.rejects(b.conectar(), (e) => trecho.test(e.mensagem), codigo);
  }
});

await teste('UART: texto chega em pedaços, UTF-8 partido entre pacotes é remontado', async () => {
  const { b, conn } = nova();
  await b.conectar();
  let acumulado = '';
  b.on('texto', (t) => { acumulado += t; });
  const bytes = Buffer.from('temp:25 ção\n', 'utf8');
  /* corta no meio do “ç” (2 bytes) */
  const corte = bytes.indexOf(0xC3) + 1;
  conn.emitir('uartdata', { value: new Uint8Array(bytes.subarray(0, corte)) });
  conn.emitir('uartdata', { value: new Uint8Array(bytes.subarray(corte)) });
  assert.equal(acumulado, 'temp:25 ção\n');
  assert.equal(b.recebeu.uart, true);
});

await teste('escrever: pedaços de até 20 bytes, em ordem, sem escritas concorrentes', async () => {
  const { b, reg } = nova();
  await b.conectar();
  const longo = 'a'.repeat(45) + '\n';
  const [r1, r2] = await Promise.all([b.escrever(longo), b.escrever('fim\n')]);
  assert.equal(r1.ok, true); assert.equal(r2.ok, true);
  assert.equal(reg.concorrencia, 0);
  assert.ok(reg.tamanhos.every((n) => n <= 20), 'pedaço maior que 20 bytes: ' + reg.tamanhos);
  assert.equal(reg.escritas.join(''), longo + 'fim\n');
});

await teste('escrever sem conexão: mensagem, não exceção', async () => {
  const { b } = nova();
  const r = await b.escrever('oi');
  assert.equal(r.ok, false);
  assert.match(r.erro, /não está conectada/);
});

await teste('dados do acelerômetro, botões e temperatura viram objetos em português', async () => {
  const { b, conn } = nova();
  await b.conectar();
  const dados = [];
  b.on('dados', (d) => dados.push(d));
  conn.emitir('accelerometerdatachanged', { x: 10, y: -20, z: 1000 });
  conn.emitir('buttonachanged', { button: 'A', state: 1 });
  conn.emitir('buttonbchanged', { button: 'B', state: 0 });
  conn.emitir('temperaturechanged', { celsius: 27 });
  assert.deepEqual(dados[0], { tipo: 'acelerometro', x: 10, y: -20, z: 1000 });
  assert.deepEqual(dados[1], { tipo: 'botao', botao: 'A', estado: 1, apertado: true });
  assert.deepEqual(dados[2], { tipo: 'botao', botao: 'B', estado: 0, apertado: false });
  assert.deepEqual(dados[3], { tipo: 'temperatura', celsius: 27 });
  assert.deepEqual(b.recebeu, { acelerometro: true, botoes: true, bussola: false, temperatura: true, uart: false });
});

await teste('bússola: traz o rumo calculado pela placa; sem o rumo, ainda entrega o campo', async () => {
  const a = nova({ rumo: 123 });
  await a.b.conectar();
  const da = [];
  a.b.on('dados', (d) => da.push(d));
  a.conn.emitir('magnetometerdatachanged', { x: 1, y: 2, z: 3 });
  await espera(10);
  assert.deepEqual(da[0], { tipo: 'bussola', x: 1, y: 2, z: 3, graus: 123 });

  const s = nova({ semRumo: true });
  await s.b.conectar();
  const ds = [];
  s.b.on('dados', (d) => ds.push(d));
  s.conn.emitir('magnetometerdatachanged', { x: 4, y: 5, z: 6 });
  await espera(10);
  assert.equal(ds[0].graus, null);
});

await teste('calibrar a bússola: pede à placa; serviço ausente vira mensagem', async () => {
  const a = nova();
  await a.b.conectar();
  assert.equal((await a.b.calibrarBussola()).ok, true);
  assert.ok(a.reg.chamadas.includes('calibrar'));
  const s = nova({ semRumo: true });
  await s.b.conectar();
  const r = await s.b.calibrarBussola();
  assert.equal(r.ok, false);
  assert.match(r.erro, /não liga esse serviço/);
});

await teste('a placa sai do alcance: vira “desconectou”, sem exceção', async () => {
  const { b, conn } = nova();
  await b.conectar();
  let avisou = 0;
  b.on('desconectou', () => { avisou++; });
  conn.mudarStatus('Disconnected');
  assert.equal(b.estado, 'desconectado');
  assert.equal(avisou, 1);
});

await teste('desconectar pelo botão e liberar (troca de placa) chamam disconnect e dispose', async () => {
  const { b, reg } = nova();
  await b.conectar();
  await b.liberar();
  assert.deepEqual(reg.chamadas.filter((c) => c !== 'connect'), ['disconnect', 'dispose']);
  assert.equal(b.estado, 'desconectado');
});

await teste('ouvinte com defeito não derruba a conexão', async () => {
  const { b, conn } = nova();
  await b.conectar();
  b.on('texto', () => { throw new Error('quebrou'); });
  let ok = false;
  b.on('texto', () => { ok = true; });
  conn.emitir('uartdata', { value: new Uint8Array([104, 105]) });
  assert.equal(ok, true);
});

/* ---------- Painel ao vivo: partes puras ---------- */
await teste('gravar por Bluetooth: entrega o hex, mostra o progresso e não acusa “desconectou”', async () => {
  const { b, reg } = nova();
  const eventos = [], etapas = [];
  b.on('desconectou', () => eventos.push('desconectou'));
  const r = await b.gravar(':020000040000FA\n:00000001FF\n', (p) => etapas.push(p));
  assert.equal(r.ok, true);
  assert.deepEqual(reg.chamadas, ['flash']);
  assert.match(reg.hexRecebido, /^:0200/);
  assert.ok(etapas.some((p) => p.etapa === 'PartialFlashing' && p.fracao === 0.5 && /Enviando/.test(p.texto)));
  assert.equal(b.estado, 'desconectado');
  assert.equal(b.gravando, false);
  assert.deepEqual(eventos, []);
});

await teste('gravar por Bluetooth: se a biblioteca cai na gravação completa, vira “use o cabo USB”', async () => {
  const { b } = nova({ flashCompleta: true });
  await assert.rejects(b.gravar(':00000001FF\n'), (e) => e.precisaUsb === true && /USB/.test(e.mensagem));
  assert.equal(b.gravando, false);
});

await teste('gravar por Bluetooth: fechar a janela é cancelamento; pareamento recusado tem dica em português', async () => {
  let f = nova({ flashCancela: true });
  await assert.rejects(f.b.gravar(':00000001FF\n'), (e) => e.cancelou === true);
  f = nova({ flashErro: 'Encryption is insufficient.' });
  await assert.rejects(f.b.gravar(':00000001FF\n'), (e) => /modo de pareamento/.test(e.mensagem));
});

await teste('gravar por Bluetooth: sem hex, sem Web Bluetooth e duas gravações juntas são recusados', async () => {
  const { b } = nova();
  await assert.rejects(b.gravar(''), (e) => /Não há programa/.test(e.mensagem));
  await assert.rejects(BLE.criar().gravar(':00000001FF\n'), (e) => e.code === 'unsupported');
  const p1 = b.gravar(':00000001FF\n');
  await assert.rejects(b.gravar(':00000001FF\n'), (e) => e.code === 'ocupado');
  await p1;
});

await teste('painel: barras de -2000 a +2000 mg, termômetro de 0 a 40 °C, pontos cardeais', () => {
  assert.equal(AV.porcentoEixo(0), 50);
  assert.equal(AV.porcentoEixo(-2000), 0);
  assert.equal(AV.porcentoEixo(2000), 100);
  assert.equal(AV.porcentoEixo(9999), 100);
  assert.equal(AV.porcentoTemperatura(20), 50);
  assert.equal(AV.porcentoTemperatura(-5), 0);
  assert.equal(AV.pontoCardeal(0), 'N');
  assert.equal(AV.pontoCardeal(359), 'N');
  assert.equal(AV.pontoCardeal(90), 'L');
  assert.equal(AV.pontoCardeal(180), 'S');
  assert.equal(AV.pontoCardeal(270), 'O');
  assert.equal(AV.pontoCardeal(-90), 'O');
});

/* ---------- Programas prontos ---------- */
const src = fs.readFileSync(path.join(aqui, '../js/microbit_exemplos.js'), 'utf8') + '\nglobalThis.__MB_EX = MB_EXEMPLOS;';
vm.runInThisContext(src);
const EXEMPLOS = globalThis.__MB_EX;

await teste('6 programas prontos, ids únicos, todos com JavaScript', () => {
  assert.equal(EXEMPLOS.length, 6);
  assert.equal(new Set(EXEMPLOS.map((e) => e.id)).size, 6);
  for (const e of EXEMPLOS) { assert.ok(e.js && e.nome && e.descricao, e.id); }
  /* os de jogo e de Bluetooth não têm Python */
  assert.equal(EXEMPLOS.find((e) => e.id === 'nave').py, null);
  assert.equal(EXEMPLOS.find((e) => e.id === 'painel-ble').py, null);
});

const { compilarJS } = await import('./_makecode_node.mjs');
const { verificarApiPython, verificarSintaxePython } = await import('./_mb_py_api.mjs');
for (const e of EXEMPLOS) {
  await teste('exemplo “' + e.nome + '”: JavaScript compila no MakeCode', async () => {
    const r = await compilarJS(e.js, { bluetooth: /\bbluetooth\./.test(e.js) });
    assert.ok(r.ok, JSON.stringify(r.erros));
  });
  if (e.py) {
    await teste('exemplo “' + e.nome + '”: MicroPython passa na sintaxe e na API', async () => {
      const api = verificarApiPython(e.py);
      assert.deepEqual(api, []);
      const s = await verificarSintaxePython(e.py);
      assert.ok(s.ok, JSON.stringify(s.erros));
    });
  }
}

console.log(`\n${total - falhas}/${total} testes ok`);
if (falhas) process.exit(1);
