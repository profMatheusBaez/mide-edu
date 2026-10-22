/* ============================================================
 * gerar_fases_k10.mjs — as 60 atividades da K10 em blocos (só dev)
 * ------------------------------------------------------------
 *   node ferramentas/gerar_fases_k10.mjs              gera e confere
 *   node ferramentas/gerar_fases_k10.mjs --verificar  só confere
 *
 * Para cada atividade (fases_k10/gabaritos.mjs):
 *   1. gera o C++ e o MicroPython com blocos_k10_gen.js;
 *   2. compara o C++ com o da trilha (k10.js), sem espaços e
 *      comentários — diferenças só nas listadas em DIFERENCAS_ACEITAS;
 *   3. C++: g++ -fsyntax-only com o stub da biblioteca da K10;
 *   4. MicroPython: roda no CPython com os stubs da API (stub_py/),
 *      o laço "while True" para depois de 40 esperas.
 * Grava js/k10_fases_gerado.js (C++, MicroPython e blocos de cada
 * atividade; o C++ da trilha continua o do k10.js).
 * ============================================================ */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import cp from 'node:child_process';
import { Blockly, carregarScripts, RAIZ } from './_blockly_headless.mjs';
import { GABARITOS_K10, DIFERENCAS_ACEITAS } from './fases_k10/gabaritos.mjs';

const verificar = process.argv.includes('--verificar');
const so = process.argv.slice(2).filter((a) => !a.startsWith('--'));
carregarScripts(['dados', 'k10', 'blocos_tema', 'blocos_defs', 'blocos_toolbox', 'blocos_k10_defs', 'blocos_k10_toolbox', 'blocos_k10_gen']);
const ATIV = globalThis.K10_ATIVIDADES || eval('K10_ATIVIDADES');   // const do script: lida pelo eval no mesmo contexto
const STUB = path.join(RAIZ, 'ferramentas/fases_k10/stub');
const STUB_PY = path.join(RAIZ, 'ferramentas/fases_k10/stub_py');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'k10gen_'));

const normalizar = (c) => String(c).replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '');

function gerar(json) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, ws);
  const cpp = blocosGerarK10Cpp(ws).codigo;
  const py = blocosGerarK10Py(ws).codigo;
  ws.dispose();
  return { cpp, py };
}

function gpp(codigo, nome) {
  const f = path.join(tmp, nome + '.cpp');
  fs.writeFileSync(f, codigo + '\nSerialStub Serial; WiFiStub WiFi; WireStub Wire;\nint main() { setup(); loop(); }\n');
  const extra = codigo.includes('<WiFi.h>') ? '' : '#include "WiFi.h"\n';
  fs.writeFileSync(f, extra + fs.readFileSync(f, 'utf8').replace(/#include <(WiFi|Wire)\.h>/g, '#include "$1.h"'));
  if (!/#include "Wire\.h"/.test(fs.readFileSync(f, 'utf8'))) fs.writeFileSync(f, '#include "Wire.h"\n' + fs.readFileSync(f, 'utf8'));
  try {
    cp.execSync(`g++ -std=c++11 -fsyntax-only -Wall -Wno-unused-variable -Wno-unused-function -I "${STUB}" "${f}"`, { stdio: 'pipe' });
    return null;
  } catch (e) { return String(e.stderr).split('\n').filter((l) => /error/.test(l)).slice(0, 3).join(' | '); }
}

function rodarPy(codigo, nome) {
  const f = path.join(tmp, nome + '.py');
  fs.writeFileSync(f, codigo);
  const r = cp.spawnSync('python3', ['-c', `import sys, importlib.util; sys.path.insert(0, ${JSON.stringify(STUB_PY)})\nesp = importlib.util.spec_from_file_location('time', ${JSON.stringify(STUB_PY + '/time.py')}); t = importlib.util.module_from_spec(esp); esp.loader.exec_module(t); sys.modules['time'] = t\ncodigo = open(${JSON.stringify(f)}).read()\ntry:\n    exec(compile(codigo, 'main.py', 'exec'), {'__name__': '__main__'})\nexcept SystemExit:\n    pass`], { encoding: 'utf8', timeout: 8000 });
  if (r.status !== 0) return (r.stderr || '').trim().split('\n').slice(-2).join(' | ');
  return null;
}

let falhas = 0, iguais = 0, aceitas = 0;
const saida = [];
GABARITOS_K10.forEach((gab, i) => {
  const id = 'k10_' + (i + 1);
  if (so.length && !so.includes(id)) { saida.push(null); return; }
  const problemas = [];
  let g = { cpp: '', py: '' };
  try { g = gerar(gab); } catch (e) { problemas.push('gerar: ' + e.message); }
  saida.push({ micropython: g.py, blocos: gab });   // o C++ da trilha (testado na placa) fica como está
  let nota = '';
  if (g.cpp) {
    if (normalizar(g.cpp) === normalizar(ATIV[i].cpp)) { iguais++; nota = 'C++ igual ao da trilha'; }
    else if (DIFERENCAS_ACEITAS[id]) { aceitas++; nota = 'C++ com diferença de forma: ' + DIFERENCAS_ACEITAS[id]; }
    else {
      const a = normalizar(g.cpp), b = normalizar(ATIV[i].cpp);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      problemas.push('C++ diferente da trilha: blocos "…' + a.slice(Math.max(0, k - 30), k + 40) + '" × trilha "…' + b.slice(Math.max(0, k - 30), k + 40) + '"');
    }
    const eg = gpp(g.cpp, id);
    if (eg) problemas.push('g++: ' + eg);
  }
  if (g.py) { const ep = rodarPy(g.py, id); if (ep) problemas.push('MicroPython: ' + ep); }
  if (problemas.length) falhas++;
  console.log((problemas.length ? 'FALHA ' : 'OK    ') + id.padEnd(7) + ' ' + ATIV[i].nome.padEnd(34) + ' ' + (problemas.length ? problemas.join(' || ') : nota));
  if (process.env.CODIGO) console.log(g.cpp + '\n----\n' + g.py);
});

if (!so.length && !verificar && !falhas) {
  const texto = '/* GERADO por ferramentas/gerar_fases_k10.mjs a partir de ferramentas/fases_k10/gabaritos.mjs — não edite à mão.\n' +
    ' * As 60 atividades da UNIHIKER K10: MicroPython (lendo os sensores de verdade) e os blocos\n' +
    ' * (o modo Guiado da aba Blocos usa os blocos como gabarito). */\n' +
    "'use strict';\n" +
    'const K10_FASES_GERADO = ' + JSON.stringify(saida) + ';\n' +
    "if (typeof K10_ATIVIDADES !== 'undefined') K10_FASES_GERADO.forEach((g, i) => { if (g && K10_ATIVIDADES[i]) Object.assign(K10_ATIVIDADES[i], g); });\n";
  fs.writeFileSync(path.join(RAIZ, 'js/k10_fases_gerado.js'), texto);
  console.log('gravado js/k10_fases_gerado.js');
}
console.log(`\n${GABARITOS_K10.length} atividades: ${iguais} com o C++ igual ao da trilha, ${aceitas} com diferença só de forma, ${falhas} com problema`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(falhas ? 1 : 0);
