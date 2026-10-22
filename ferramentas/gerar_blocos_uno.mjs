/* ============================================================
 * gerar_blocos_uno.mjs — as 40 missões do Uno em blocos (só dev)
 * ------------------------------------------------------------
 *   node ferramentas/gerar_blocos_uno.mjs              gera e confere
 *   node ferramentas/gerar_blocos_uno.mjs --verificar  só confere
 *
 * Para cada missão de js/dados.js:
 *   1. carrega o gabarito (fases_uno/gabaritos.mjs) num workspace headless;
 *   2. gera o C++ com o gerador do Modo Blocos (blocos_gen.js);
 *   3. compila na MIDE VM (js/mide_compilador.js) — é o que o site grava;
 *   4. roda no simulador avr8js a missão em texto (compilada com o avr-gcc,
 *      js/mide_fases_bin.js) e a versão em blocos (MIDE VM), com as mesmas
 *      entradas, e compara pinos (janelas de 20 ms), Serial e I2C.
 * Grava js/blocos_fases_uno.js (BLOCOS_FASES_UNO + liga em FASES).
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { Blockly, carregarScripts, RAIZ } from './_blockly_headless.mjs';
import { GABARITOS } from './fases_uno/gabaritos.mjs';

const require = createRequire(import.meta.url);
const so = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const verificar = process.argv.includes('--verificar');

carregarScripts(['blocos_tema', 'blocos_defs', 'blocos_toolbox', 'blocos_gen']);
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'js/dados.js'), 'utf8') + ';this.FASES = FASES;', ctx);
const FASES = ctx.FASES;
const MideCompilador = require(path.join(RAIZ, 'js/mide_compilador.js'));
const binarios = new vm.Script(fs.readFileSync(path.join(RAIZ, 'js/mide_fases_bin.js'), 'utf8') + ';this.B = MIDE_FASES_BIN;');
const firmware = new vm.Script(fs.readFileSync(path.join(RAIZ, 'js/mide_firmware.js'), 'utf8') + ';this.F = MIDE_VM_FIRMWARE;');
const c2 = {}; vm.createContext(c2); binarios.runInContext(c2); firmware.runInContext(c2);
const BIN = Object.values(c2.B);
const FW = Buffer.from(c2.F.base64, 'base64');
const { simular } = require('./web/sim/run.js');

const SEG = +(process.env.SEG || 2.5);
const JAN = 400;
function resumo(amostras) {
  const r = {};
  for (let p = 2; p <= 19; p++) {
    const jan = [];
    for (let i = 0; i < amostras.length; i += JAN) {
      let altos = 0, n = 0;
      for (let k = i; k < Math.min(i + JAN, amostras.length); k++) { altos += (amostras[k] >> p) & 1; n++; }
      jan.push(altos / n);
    }
    r[p] = jan;
  }
  return r;
}
const linhas = (s) => s.split(/\r?\n/).filter(Boolean);
const imagem = (partes) => { const img = new Uint8Array(32768).fill(0xFF); for (const [end, bytes] of partes) img.set(bytes, end); return img; };

function gerarCodigo(json) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, ws);
  const r = blocosGerarSketch(ws);
  ws.dispose();
  return r.codigo;
}

let falhas = 0;
const saida = {};
for (const f of FASES) {
  if (so.length && !so.includes(f.id)) continue;
  const gab = GABARITOS[f.id];
  if (!gab) { console.log('FALTA ' + f.id); falhas++; continue; }
  saida[f.id] = gab;
  const problemas = [];
  let codigo = '';
  try { codigo = gerarCodigo(gab); } catch (e) { problemas.push('gerar: ' + e.message); }
  const comp = codigo ? MideCompilador.compilar(codigo) : { ok: false, erros: [{ linha: 0, msg: 'sem código' }] };
  if (!comp.ok) problemas.push(`MIDE VM: linha ${comp.erros[0].linha}: ${comp.erros[0].msg}`);
  const nativo = BIN.find((x) => x.id === f.id);
  if (!nativo) problemas.push('sem binário nativo da missão');
  let obs = '';
  if (comp.ok && nativo) {
    const cenario = { botaoAlto: /pinMode\(2,\s*INPUT\)/.test(f.solucao) };
    const blo = simular(imagem([[0, FW], [0x4000, comp.bytes]]), SEG, cenario);
    let p1 = comparar(simular(imagem([[0, Buffer.from(nativo.base64, 'base64')]]), SEG, cenario), blo);
    if (p1.length) {
      /* A MIDE VM é um pouco mais lenta que o avr-gcc: leituras de rampas (A0, eco) saem
         deslocadas em ±1. Para separar isso de um erro do gabarito, compara também com a
         missão em texto rodando na mesma VM. */
      const texto = MideCompilador.compilar(f.solucao);
      if (texto.ok) {
        const p2 = comparar(simular(imagem([[0, FW], [0x4000, texto.bytes]]), SEG, cenario), blo);
        if (!p2.length) { obs = ' (igual à missão em texto na MIDE VM; contra o avr-gcc: ' + p1.join(' | ') + ')'; p1 = []; }
      }
    }
    problemas.push(...p1);
    if (p1.deriva) problemas.deriva = p1.deriva;
  }
  if (problemas.length) falhas++;
  if (!obs && problemas.deriva) obs = ` (${problemas.deriva} leitura(s) do Serial com ±1, tempo da leitura)`;
  console.log((problemas.length ? 'FALHA' : 'OK   ') + ' ' + f.id.padEnd(8) + (problemas.length ? ' ' + problemas.join(' | ') : ` ${comp.bytes ? comp.bytes.length : 0} bytes de bytecode${obs}`));
  if (process.env.CODIGO) console.log(codigo);
}

function comparar(nat, blo) {
  const problemas = [];
  {
    const a = resumo(nat.amostras), b = resumo(blo.amostras);
    for (let p = 2; p <= 19; p++) {
      let ruins = 0;
      for (let j = 0; j < a[p].length; j++) if (Math.abs(a[p][j] - b[p][j]) > 0.12) ruins++;
      if (ruins / a[p].length > 0.06) problemas.push(`pino ${p}: ${ruins}/${a[p].length} janelas diferentes`);
    }
    const ln = linhas(nat.serial), lb = linhas(blo.serial);
    const k = Math.min(ln.length, lb.length);
    let dif = 0, ex = '';
    let deriva = 0;
    for (let i = 0; i < k; i++) {
      if (ln[i] === lb[i]) continue;
      if (quaseIgual(ln[i], lb[i])) { deriva++; continue; }   // mesma linha, número ±1 (tempo da leitura)
      dif++; if (!ex) ex = `"${ln[i]}" × "${lb[i]}"`;
    }
    if (deriva) problemas.deriva = deriva;
    if (dif || Math.abs(ln.length - lb.length) > 2) problemas.push(`serial: texto ${ln.length} linhas, blocos ${lb.length}, ${dif} diferentes ${ex}`);
    const i2a = nat.i2c.join(','), i2b = blo.i2c.join(',');
    /* com deriva no número escrito, o LCD recebe os mesmos comandos com outro dígito: basta o mesmo tamanho */
    if (i2a.length && i2a.slice(0, 4000) !== i2b.slice(0, Math.min(4000, i2a.length)) && !(problemas.deriva && nat.i2c.length === blo.i2c.length)) problemas.push(`i2c difere (texto ${nat.i2c.length}, blocos ${blo.i2c.length})`);
  }
  return problemas;
}

function quaseIgual(a, b) {
  const na = a.match(/-?\d+/g) || [], nb = b.match(/-?\d+/g) || [];
  if (a.replace(/-?\d+/g, '#') !== b.replace(/-?\d+/g, '#') || na.length !== nb.length) return false;
  return na.every((x, i) => Math.abs(+x - +nb[i]) <= 1);
}

if (!so.length && !verificar) {
  const texto = '/* GERADO por ferramentas/gerar_blocos_uno.mjs a partir de ferramentas/fases_uno/gabaritos.mjs — não edite à mão.\n' +
    ' * As 40 missões do Arduino Uno em blocos (o modo Guiado da aba Blocos usa como gabarito). */\n' +
    "'use strict';\n" +
    'const BLOCOS_FASES_UNO = ' + JSON.stringify(saida) + ';\n' +
    "for (const f of (typeof FASES !== 'undefined' ? FASES : [])) if (BLOCOS_FASES_UNO[f.id]) f.blocos = BLOCOS_FASES_UNO[f.id];\n";
  fs.writeFileSync(path.join(RAIZ, 'js/blocos_fases_uno.js'), texto);
  console.log('gravado js/blocos_fases_uno.js');
}
console.log(falhas ? `${falhas} missão(ões) com problema` : 'todas as missões em blocos se comportam como a missão em texto');
process.exit(falhas ? 1 : 0);
