/* ============================================================
 * _blockly_headless.mjs — utilitário dos testes (só desenvolvimento)
 * Carrega o Blockly (pacote npm, MESMA versão do js/vendor/blockly)
 * e os scripts do Modo Blocos num contexto Node, sem navegador:
 * `new Blockly.Workspace()` headless, sem DOM.
 *
 *   cd ferramentas && npm install        (instala blockly@13.3.0)
 * ============================================================ */
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ = path.resolve(aqui, '..');
const require = createRequire(import.meta.url);

function resolverBlockly() {
  const candidatos = [aqui, process.env.BLOCKLY_NODE_DIR].filter(Boolean);
  for (const base of candidatos) {
    try { return createRequire(path.join(base, 'x.js'))('blockly'); } catch (e) { /* próximo */ }
  }
  return require('blockly');
}

export const Blockly = resolverBlockly();
globalThis.Blockly = Blockly;

/* Executa js/<nome>.js no contexto global (são scripts comuns, não módulos). */
let _aparencia = false;
export function carregarScripts(nomes) {
  /* ícones e categorias no estilo do PictoBlox: os blocos das extensões dependem disto */
  if (!_aparencia) { _aparencia = true; nomes = ['blocos_aparencia'].concat(nomes.filter((n) => n !== 'blocos_aparencia')); }
  for (const nome of nomes) {
    const arquivo = path.join(RAIZ, 'js', nome + '.js');
    vm.runInThisContext(fs.readFileSync(arquivo, 'utf8'), { filename: arquivo });
  }
}

/* ---------- construtores de workspace serializado ---------- */
export const num = (n) => ({ block: { type: 'math_number', fields: { NUM: n } } });
export const txt = (t) => ({ block: { type: 'text', fields: { TEXT: t } } });
export const bool = (v) => ({ block: { type: 'logic_boolean', fields: { BOOL: v ? 'TRUE' : 'FALSE' } } });
export const ref = (b) => ({ block: b });
export const bloco = (type, campos, entradas) => {
  const b = { type };
  if (campos) b.fields = campos;
  if (entradas) b.inputs = entradas;
  return b;
};
/* encadeia blocos de instrução em pilha (next) e devolve o primeiro */
export function pilha(...blocos) {
  for (let i = 0; i < blocos.length - 1; i++) blocos[i].next = { block: blocos[i + 1] };
  return blocos[0];
}
export const dentro = (nome, ...blocos) => ({ [nome]: { block: pilha(...blocos) } });

export function carregarWorkspace(topos, variaveis) {
  const ws = new Blockly.Workspace();
  const json = { blocks: { languageVersion: 0, blocks: topos.map((b, i) => Object.assign({ x: 0, y: i * 200 }, b)) } };
  if (variaveis) json.variables = variaveis;
  Blockly.serialization.workspaces.load(json, ws);
  return ws;
}
