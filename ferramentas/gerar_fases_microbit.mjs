/* ============================================================
 * gerar_fases_microbit.mjs — currículo da micro:bit V2 (só desenvolvimento)
 * ------------------------------------------------------------
 * Lê as fases escritas em ferramentas/fases_microbit/modulo_NN.mjs (com os
 * blocos de cada fase) e GERA, pelos mesmos geradores do Modo Blocos:
 *
 *   js/microbit_fases_gerado.js            as fases para a IDE (JS + Py + blocos)
 *   cursos/microbit/js/mb_N/main.js        o JavaScript de cada fase
 *   cursos/microbit/micropython/mb_N/main.py  o MicroPython de cada fase
 *
 * O JavaScript e o MicroPython nunca são escritos à mão: saem dos blocos.
 * Confere também que cada fase compila (MakeCode) e que o Python passa
 * na sintaxe e na API. Rode depois de mudar as fases, os geradores ou MB_PINOS:
 *
 *   cd ferramentas && node gerar_fases_microbit.mjs [--sem-compilar] [--verificar]
 *     --sem-compilar  só gera (pula MakeCode e mpy-cross)
 *     --verificar     não grava nada: confere se os arquivos já estão iguais ao que seria gerado
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarScripts, carregarWorkspace, Blockly, RAIZ } from './_blockly_headless.mjs';

carregarScripts(['blocos_toolbox', 'blocos_mb_spec', 'blocos_mb_defs', 'blocos_mb_toolbox', 'blocos_mb_gen_js', 'blocos_mb_gen_py', 'microbit_curso', 'microbit_suporte']);

const aqui = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const semCompilar = args.has('--sem-compilar');
const soVerificar = args.has('--verificar');

const arquivosModulos = fs.readdirSync(path.join(aqui, 'fases_microbit')).filter((f) => /^modulo_\d+\.mjs$/.test(f)).sort();
const modulos = [];
for (const f of arquivosModulos) modulos.push((await import('./fases_microbit/' + f)).default);
modulos.sort((a, b) => a.modulo - b.modulo);

const fases = [];
let numero = 0;
for (const m of modulos) {
  if (m.fases.length !== 5) throw new Error('módulo ' + (m.modulo + 1) + ' tem ' + m.fases.length + ' fases (são 5 por módulo)');
  m.fases.forEach((f, i) => {
    numero++;
    const ws = carregarWorkspace(f.blocos.blocks.blocks, f.blocos.variables);
    const js = blocosGerarMbJs(ws);
    const py = blocosGerarMbPy(ws);
    ws.dispose();
    if (!js.codigo.trim()) throw new Error('mb_' + numero + ' (' + f.nome + '): JS vazio');
    if (js.aviso) throw new Error('mb_' + numero + ' (' + f.nome + '): aviso do gerador JS: ' + js.aviso);
    if (py.aviso) throw new Error('mb_' + numero + ' (' + f.nome + '): aviso do gerador Python: ' + py.aviso);
    fases.push({
      numero, modulo: m.modulo, n: i + 1, nome: f.nome, objetivo: f.objetivo, conceito: f.conceito,
      resultado: f.resultado, desafio: f.desafio, aviso: f.aviso || null,
      js: js.codigo, py: py.codigo.replace(/^# Gerado pelo Modo Blocos[^\n]*\n/, ''), blocos: f.blocos,   // o aluno digita o código: sem o comentário de cabeçalho
      _bluetooth: js.bluetooth,
    });
  });
}

/* ---------- verificação: JS compila, Python passa ---------- */
if (!semCompilar) {
  const { compilarJS } = await import('./_makecode_node.mjs');
  const { verificarApiPython, verificarSintaxePython } = await import('./_mb_py_api.mjs');
  const extrasPy = {};
  for (const n of Object.keys(MB_SUPORTE)) {
    const nomes = new Set();
    for (const l of MB_SUPORTE[n].py().split('\n')) { const mm = /^def ([a-z]\w*)/.exec(l); if (mm) nomes.add(mm[1]); }
    extrasPy[n] = nomes;
  }
  process.setMaxListeners(0);
  let falhas = 0;
  for (const f of fases) {
    const r = await compilarJS(f.js, { bluetooth: f._bluetooth, arquivosExtras: mbArquivosExtrasJS(f.js) });
    if (!r.ok) { falhas++; console.log('✗ mb_' + f.numero + ' JS não compila:', JSON.stringify(r.erros).slice(0, 400)); }
    const s = await verificarSintaxePython(f.py);
    if (!s.ok) { falhas++; console.log('✗ mb_' + f.numero + ' Python (sintaxe):', JSON.stringify(s.erros)); }
    const api = verificarApiPython(f.py, { modulosExtras: extrasPy });
    if (api.length) { falhas++; console.log('✗ mb_' + f.numero + ' Python (API):', api.join('; ')); }
  }
  if (falhas) { console.log('\n' + falhas + ' problema(s) — nada foi gravado.'); process.exit(1); }
  console.log('✓ ' + fases.length + ' fases: JavaScript compila no MakeCode e Python passa na sintaxe e na API.');
}

/* ---------- saídas ---------- */
const publicas = fases.map(({ _bluetooth, ...resto }) => resto);
const conteudoGerado =
  '/* GERADO por ferramentas/gerar_fases_microbit.mjs — não edite à mão.\n' +
  '   Cada fase vem dos BLOCOS (js/blocos_mb_*.js); o JavaScript e o MicroPython saem deles. */\n' +
  "'use strict';\n" +
  'const MB_FASES_GERADAS = ' + JSON.stringify(publicas, null, 1) + ';\n';

const arquivos = new Map();
arquivos.set(path.join(RAIZ, 'js', 'microbit_fases_gerado.js'), conteudoGerado);
for (const f of fases) {
  arquivos.set(path.join(RAIZ, 'cursos', 'microbit', 'js', 'mb_' + f.numero, 'main.js'), f.js);
  arquivos.set(path.join(RAIZ, 'cursos', 'microbit', 'micropython', 'mb_' + f.numero, 'main.py'), f.py);
}

if (soVerificar) {
  let diferentes = 0;
  for (const [caminho, texto] of arquivos) {
    const atual = fs.existsSync(caminho) ? fs.readFileSync(caminho, 'utf8') : null;
    if (atual !== texto) { diferentes++; console.log('≠ ' + path.relative(RAIZ, caminho)); }
  }
  console.log(diferentes ? diferentes + ' arquivo(s) desatualizado(s): rode gerar_fases_microbit.mjs.' : '✓ Tudo igual ao que seria gerado (' + arquivos.size + ' arquivos).');
  process.exit(diferentes ? 1 : 0);
}

for (const [caminho, texto] of arquivos) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  fs.writeFileSync(caminho, texto);
}
console.log('✓ ' + fases.length + ' fases gravadas (' + arquivos.size + ' arquivos).');
