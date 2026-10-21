/* ============================================================
 * _mb_py_api.mjs — utilitário dos testes (só desenvolvimento)
 * Confere que cada `modulo.nome` que o MicroPython gerado usa EXISTE na
 * API do micro:bit V2, usando os stubs oficiais (@microbit/micropython-
 * microbit-stubs, typeshed.en.json). Complementa o mpy-cross, que só
 * confere a SINTAXE, não os nomes.
 *
 *   const { verificarApiPython, verificarSintaxePython } = await import('./_mb_py_api.mjs');
 *   verificarApiPython(codigo)  → [ 'linha 3: display.scrol não existe em microbit.display' ]
 *   await verificarSintaxePython(codigo) → { ok, erros }
 * ============================================================ */
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(aqui, '..');
const require = createRequire(import.meta.url);

const stubs = JSON.parse(fs.readFileSync(path.join(aqui, 'node_modules/@microbit/micropython-microbit-stubs/typeshed.en.json'), 'utf8')).files;
const arquivo = (nome) => stubs['/typeshed/stdlib/' + nome] || '';

/* Nomes de nível superior de um módulo .pyi (defs, classes, constantes) + o que ele re-exporta. */
function nomesDeModulo(nome, visto = new Set()) {
  if (visto.has(nome)) return new Set();
  visto.add(nome);
  const texto = arquivo(nome);
  const nomes = new Set();
  for (const l of texto.split('\n')) {
    let m;
    if ((m = /^(?:async )?def ([A-Za-z_]\w*)/.exec(l))) nomes.add(m[1]);
    else if ((m = /^class ([A-Za-z_]\w*)/.exec(l))) nomes.add(m[1]);
    else if ((m = /^([A-Za-z_]\w*)\s*[:=]/.exec(l))) nomes.add(m[1]);
    else if ((m = /^from \. import (\w+) as (\w+)/.exec(l))) nomes.add(m[2]);
    else if ((m = /^from (\w+) import \*/.exec(l))) for (const n of nomesDeModulo(m[1] + '.pyi', visto)) nomes.add(n);
  }
  return nomes;
}

/* Membros (métodos e constantes) de uma classe de um .pyi. */
function membrosDeClasse(nomeArquivo, classe) {
  const linhas = arquivo(nomeArquivo).split('\n');
  const membros = new Set();
  let dentro = false;
  for (const l of linhas) {
    const c = /^class ([A-Za-z_]\w*)(?:\(([^)]*)\))?/.exec(l);
    if (c) {
      dentro = c[1] === classe;
      if (dentro && c[2]) for (const base of c[2].split(',').map((s) => s.trim())) for (const n of membrosDeClasse(nomeArquivo, base)) membros.add(n);
      continue;
    }
    if (dentro && /^\S/.test(l) && l.trim()) dentro = false;
    if (!dentro) continue;
    let m;
    if ((m = /^    def ([A-Za-z_]\w*)/.exec(l))) membros.add(m[1]);
    else if ((m = /^    ([A-Za-z_]\w*)\s*[:=]/.exec(l))) membros.add(m[1]);
  }
  return membros;
}

const INIT = 'microbit/__init__.pyi';
const nomesMicrobit = nomesDeModulo(INIT);
const submodulosMicrobit = ['accelerometer', 'audio', 'compass', 'display', 'i2c', 'microphone', 'speaker', 'spi', 'uart'];
const modulos = {};
for (const s of submodulosMicrobit) modulos[s] = nomesDeModulo('microbit/' + s + '.pyi');
for (const m of ['music', 'radio', 'random', 'math', 'machine', 'utime']) modulos[m] = nomesDeModulo(m + '.pyi');

const classePino = { MicroBitDigitalPin: membrosDeClasse(INIT, 'MicroBitDigitalPin'), MicroBitAnalogDigitalPin: membrosDeClasse(INIT, 'MicroBitAnalogDigitalPin'), MicroBitTouchPin: membrosDeClasse(INIT, 'MicroBitTouchPin') };
const membrosPino = (nome) => {
  const n = /^pin(\d+)$/.exec(nome);
  if (nome === 'pin_logo') return classePino.MicroBitTouchPin;
  if (nome === 'pin_speaker') return classePino.MicroBitAnalogDigitalPin;
  if (!n) return null;
  const i = Number(n[1]);
  if ([0, 1, 2].includes(i)) return classePino.MicroBitTouchPin;
  if ([3, 4, 10].includes(i)) return classePino.MicroBitAnalogDigitalPin;
  return classePino.MicroBitDigitalPin;
};
const classes = {};
for (const c of ['Image', 'Sound', 'SoundEvent', 'Button']) classes[c] = membrosDeClasse(INIT, c);
const objetos = { button_a: classes.Button, button_b: classes.Button };

/* módulos de arquivos auxiliares gravados junto (nomes públicos vêm do próprio código) */
export function verificarApiPython(codigo, opcoes = {}) {
  const erros = [];
  const linhas = String(codigo).split('\n');
  const importados = new Set(['microbit']);
  const externos = opcoes.modulosExtras || {};   // { lcd1602: Set(nomes) }
  const definidos = new Set();
  for (const l of linhas) {
    let m;
    if ((m = /^import (\w+)/.exec(l))) importados.add(m[1]);
    if ((m = /^from (\w+) import (.+)/.exec(l))) {
      if (m[1] === 'machine') for (const n of m[2].split(',').map((s) => s.trim())) if (!modulos.machine.has(n)) erros.push('from machine import ' + n + ': não existe em machine');
      if (m[1] === 'microbit' && m[2].trim() !== '*') for (const n of m[2].split(',').map((s) => s.trim())) if (!nomesMicrobit.has(n)) erros.push('from microbit import ' + n + ': não existe');
    }
    if ((m = /^\s*def (\w+)/.exec(l))) definidos.add(m[1]);
  }

  linhas.forEach((l, i) => {
    const semTexto = l.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""').replace(/#.*$/, '');
    /* nomes soltos de `from microbit import *` usados como função: sleep(...) etc. são checados abaixo */
    const re = /\b([A-Za-z_]\w*)((?:\.[A-Za-z_]\w*)+)/g;
    let m;
    while ((m = re.exec(semTexto))) {
      const raiz = m[1];
      const partes = m[2].slice(1).split('.');
      const onde = 'linha ' + (i + 1) + ': ';
      if (raiz in modulos && (raiz === 'accelerometer' || submodulosMicrobit.includes(raiz) || importados.has(raiz))) {
        if (!modulos[raiz].has(partes[0])) erros.push(onde + raiz + '.' + partes[0] + ' não existe em ' + raiz);
        else if (raiz === 'music' && /^[A-Z_]+$/.test(partes[0]) === false) { /* função */ }
        continue;
      }
      if (raiz in externos) {
        if (!externos[raiz].has(partes[0])) erros.push(onde + raiz + '.' + partes[0] + ' não existe no arquivo auxiliar ' + raiz);
        continue;
      }
      const pino = membrosPino(raiz);
      if (pino) { if (!pino.has(partes[0])) erros.push(onde + raiz + '.' + partes[0] + ' não existe em ' + raiz); continue; }
      if (raiz in objetos) { if (!objetos[raiz].has(partes[0])) erros.push(onde + raiz + '.' + partes[0] + ' não existe em ' + raiz); continue; }
      if (raiz in classes) { if (!classes[raiz].has(partes[0])) erros.push(onde + raiz + '.' + partes[0] + ' não existe em ' + raiz); continue; }
      if (raiz === 'pin_logo') continue;
    }
    /* funções soltas de `from microbit import *` */
    const rf = /(?<![.\w])([a-z_]\w*)\(/g;
    while ((m = rf.exec(semTexto))) {
      const n = m[1];
      if (['print', 'int', 'str', 'abs', 'min', 'max', 'round', 'range', 'len', 'float', 'bytes', 'isdigit', 'if', 'while', 'for', 'and', 'or', 'not', 'in', 'def', 'time_pulse_us', 'lstrip'].includes(n)) continue;
      if (definidos.has(n) || externos[n]) continue;
      if (!nomesMicrobit.has(n) && !(importados.has(n))) erros.push('linha ' + (i + 1) + ': ' + n + '() não existe em microbit');
    }
    if (/\btime_pulse_us\(/.test(semTexto) && !/^from machine import time_pulse_us/m.test(codigo)) erros.push('linha ' + (i + 1) + ': time_pulse_us sem importar');
  });
  return erros;
}

/* ---------- sintaxe, com o mpy-cross vendorizado (o do LEGO) ---------- */
let PybricksMpy = null;
export async function verificarSintaxePython(codigo) {
  if (!PybricksMpy) {
    globalThis.fetch = undefined;   // o mpy-cross (Emscripten antigo) usa fetch se existir
    PybricksMpy = require(path.join(RAIZ, 'js/pybricks_mpy.js'));
    PybricksMpy.configurar({
      mpyCross: require(path.join(RAIZ, 'js/vendor/pybricks/mpy-cross-v6.js')),
      wasm: path.join(RAIZ, 'js/vendor/pybricks/mpy-cross-v6.wasm'),
    });
  }
  const r = await PybricksMpy.compilarPrograma(codigo);
  return r.ok ? { ok: true, erros: [] } : { ok: false, erros: r.erros, linha: r.linha };
}
