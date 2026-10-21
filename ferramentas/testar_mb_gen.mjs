/* ============================================================
 * testar_mb_gen.mjs — teste dos geradores do Modo Blocos (micro:bit V2)
 * ------------------------------------------------------------
 * Para cada bloco da tabela (blocos_mb_spec.js):
 *   1. monta um workspace com o bloco e gera JavaScript e MicroPython;
 *   2. o JavaScript de TODOS os blocos vira um programa e é compilado
 *      pelo compilador do MakeCode (local, sem rede); os blocos de
 *      Bluetooth vão em um segundo programa (o Bluetooth não convive
 *      com o rádio);
 *   3. o MicroPython é conferido na sintaxe (mpy-cross) e nos nomes
 *      da API (stubs oficiais do micro:bit V2);
 *   4. gerar duas vezes dá o MESMO texto (determinismo).
 *
 *   cd ferramentas && node testar_mb_gen.mjs
 * ============================================================ */
import { Blockly, carregarScripts, carregarWorkspace, num, txt, bool, bloco } from './_blockly_headless.mjs';
import { compilarJS } from './_makecode_node.mjs';
import { verificarApiPython, verificarSintaxePython } from './_mb_py_api.mjs';

carregarScripts(['blocos_toolbox', 'blocos_mb_spec', 'blocos_mb_defs', 'blocos_mb_toolbox', 'blocos_mb_gen_js', 'blocos_mb_gen_py', 'microbit_curso', 'microbit_suporte']);
/* o tema precisa do tema base do Scratch */
carregarScripts(['blocos_tema', 'blocos_mb_tema']);

let falhas = 0, ok = 0;
const verifica = (cond, msg) => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', msg); } };

/* ---------- monta um workspace para cada bloco ---------- */
function argumento(a) {
  switch (a.t) {
    case 'num': case 'any': return num(a.v);
    case 'txt': return txt(a.v);
    case 'bool': return bool(true);
    case 'sprite': return { block: { type: 'variables_get', fields: { VAR: { id: 'vs' } } } };
    default: return null;
  }
}
function blocoDaSpec(b) {
  const campos = {}, entradas = {};
  for (const a of b.args) {
    if (a.t === 'drop') campos[a.n] = a.def != null ? a.def : a.op[0][1];
    else if (a.t === 'var') campos[a.n] = { id: 'v1' };
    else if (a.t === 'leds') campos[a.n] = '0101011111111110111000100';
    else { const e = argumento(a); if (e) entradas[a.n] = e; }
  }
  return bloco(b.id, Object.keys(campos).length ? campos : null, Object.keys(entradas).length ? entradas : null);
}
const CORPO = { do: bloco('mb_pausa', null, { MS: num(10) }) };

/* Devolve o(s) topo(s) que deixam o bloco no lugar certo. */
function topoPara(b) {
  const x = blocoDaSpec(b);
  if (b.forma === 'evento') {
    x.inputs = Object.assign(x.inputs || {}, { DO: { block: bloco('mb_pausa', null, { MS: num(10) }) } });
    return [x];
  }
  if (b.corpo) {
    x.inputs = Object.assign(x.inputs || {}, { DO: { block: bloco('mb_pausa', null, { MS: num(10) }) } });
    return [bloco('mb_sempre', null, { DO: { block: x } })];
  }
  if (b.forma === 'inst') return [bloco('mb_sempre', null, { DO: { block: x } })];
  /* valor */
  const saida = b.saida;
  if (saida === 'Boolean') return [bloco('mb_sempre', null, { DO: { block: bloco('controls_if', null, { IF0: { block: x }, DO0: { block: bloco('mb_pausa', null, { MS: num(10) }) } }) } })];
  if (saida === 'String') return [bloco('mb_sempre', null, { DO: { block: bloco('mb_mostrar_texto', null, { T: { block: x } }) } })];
  if (saida === 'Sprite') return [bloco('mb_sempre', null, { DO: { block: bloco('mb_var_definir', { VAR: { id: 'vs' } }, { VALOR: { block: x } }) } })];
  return [bloco('mb_sempre', null, { DO: { block: bloco('mb_mostrar_numero', null, { N: { block: x } }) } })];
}
/* Blocos que precisam de contexto especial para valer. */
function topoEspecial(b) {
  if (b.id === 'mb_radio_numero_recebido') return [bloco('mb_radio_ao_numero', null, { DO: { block: bloco('mb_mostrar_numero', null, { N: { block: bloco(b.id) } }) } })];
  if (b.id === 'mb_radio_texto_recebido') return [bloco('mb_radio_ao_texto', null, { DO: { block: bloco('mb_mostrar_texto', null, { T: { block: bloco(b.id) } }) } })];
  if (b.id === 'mb_bt_linha_recebida') return [bloco('mb_bt_ao_receber', null, { DO: { block: bloco('mb_mostrar_texto', null, { T: { block: bloco(b.id) } }) } })];
  return null;
}
/* Sprites: precisam de uma variável que guarda o sprite. */
function comSprite(b) {
  return b.args.some((a) => a.t === 'sprite') || b.id === 'mb_sprite_criar';
}
function variaveis(b) {
  const v = [{ name: 'i', id: 'v1' }];
  if (comSprite(b)) v.push({ name: 'sprite', id: 'vs' });
  return v;
}
function criaSprite() {
  return bloco('mb_var_definir', { VAR: { id: 'vs' } }, { VALOR: { block: bloco('mb_sprite_criar', null, { X: num(2), Y: num(2) }) } });
}

const jsPorBloco = new Map(), pyPorBloco = new Map();
for (const b of MB_BLOCOS) {
  let topos = topoEspecial(b) || topoPara(b);
  if (comSprite(b) && b.id !== 'mb_sprite_criar') topos = [bloco('mb_no_iniciar', null, { DO: { block: criaSprite() } })].concat(topos);
  const ws = carregarWorkspace(topos, variaveis(b));
  const js = blocosGerarMbJs(ws);
  const py = blocosGerarMbPy(ws);
  const js2 = blocosGerarMbJs(ws).codigo, py2 = blocosGerarMbPy(ws).codigo;
  verifica(js.codigo === js2, b.id + ': JS não é determinístico');
  verifica(py.codigo === py2, b.id + ': Python não é determinístico');
  verifica(js.codigo.trim().length > 0, b.id + ': JS vazio');
  verifica(!/undefined|\{[A-Z]+\}/.test(js.codigo), b.id + ': JS com lixo: ' + js.codigo);
  jsPorBloco.set(b.id, js);
  pyPorBloco.set(b.id, py);
  ws.dispose();
}
console.log('geradores: ' + MB_BLOCOS.length + ' blocos gerados');

/* ---------- tema e toolbox ---------- */
for (const tema of [BLOCOS_TEMA_MB_CLARO, BLOCOS_TEMA_MB_ESCURO]) {
  for (const d of BLOCOS_MB_DEFINICOES) verifica(tema.blockStyles[d.style], d.type + ': estilo ' + d.style + ' inexistente no tema ' + tema.name);
}
for (const lang of ['js', 'micropython']) {
  const tb = blocosMontarToolboxMB({ linguagem: lang });
  for (const c of tb.contents) verifica(BLOCOS_TEMA_MB_CLARO.categoryStyles[c.categorystyle], 'categoria ' + c.name + ': categorystyle ' + c.categorystyle + ' inexistente');
  const nomes = tb.contents.map((c) => c.name);
  verifica(lang === 'js' ? nomes.includes('Jogo') && nomes.includes('Bluetooth') : nomes.includes('Jogo (só JS)') && nomes.includes('Bluetooth (só JS)'), 'toolbox ' + lang + ': Jogo/Bluetooth');
  /* cada peça do flyout, com seus valores-padrão, entra num workspace sem erro */
  let itens = 0;
  for (const c of tb.contents) for (const it of (c.contents || [])) {
    if (it.kind !== 'block') continue;
    itens++;
    let erro = null;
    try { const w = carregarWorkspace([Object.assign({}, it)], [{ name: 'i', id: 'v1' }]); w.dispose(); } catch (e) { erro = e.message; }
    verifica(!erro, 'flyout ' + it.type + ': ' + erro);
  }
  console.log('toolbox ' + lang + ': ' + tb.contents.length + ' categorias, ' + itens + ' peças');
}
/* paleta liberada pela fase filtra a toolbox */
{
  const tb = blocosMontarToolboxMB({ linguagem: 'js', permitidos: new Set(['mb_mostrar_texto', 'mb_sempre']) });
  verifica(tb.contents.length === 1 && tb.contents[0].contents.length === 2, 'paleta liberada: ' + JSON.stringify(tb.contents.map((c) => c.name)));
}

/* ---------- JavaScript: compila tudo com o MakeCode ---------- */
const soJs = MB_BLOCOS.filter((b) => b.cat !== 'bluetooth');
const soBt = MB_BLOCOS.filter((b) => b.cat === 'bluetooth');

/* Um programa por bloco é caro (2 s cada). Juntamos em lotes por categoria. */
async function compilarLote(nome, blocos, opcoes) {
  /* cada bloco vira um trecho; variáveis e funções ficam no topo do arquivo */
  const codigos = blocos.map((b) => jsPorBloco.get(b.id).codigo);
  const extras = {};
  for (const c of codigos) Object.assign(extras, mbArquivosExtrasJS(c));
  /* Um lote com tudo repete `let i` etc.; por isso cada bloco vai num namespace próprio. */
  const partes = codigos.map((c, i) => 'namespace t' + i + ' {\n' + c.split('\n').map((l) => '    ' + l).join('\n') + '\n}\n');
  const r = await compilarJS(partes.join('\n'), Object.assign({ arquivosExtras: extras }, opcoes));
  verifica(r.ok, nome + ': o MakeCode não compilou: ' + JSON.stringify(r.erros).slice(0, 1500));
  if (!r.ok) {
    /* isola quais blocos falham */
    for (const b of blocos) {
      const c = jsPorBloco.get(b.id).codigo;
      const r1 = await compilarJS(c, Object.assign({ arquivosExtras: mbArquivosExtrasJS(c) }, opcoes));
      if (!r1.ok) console.log('   ✗', b.id, JSON.stringify(r1.erros).slice(0, 300), '\n', c);
    }
  } else console.log('MakeCode: ' + nome + ' compilou (' + blocos.length + ' blocos, ' + r.ms + ' ms)');
}
process.setMaxListeners(0);
/* lotes por categoria (um programa só com tudo estoura a memória flash da placa) */
const cats = [...new Set(soJs.map((b) => b.cat))];
for (const c of cats) {
  const grupo = soJs.filter((b) => b.cat === c);
  /* música e entrada são grandes: metade e metade */
  const partes = grupo.length > 12 ? [grupo.slice(0, Math.ceil(grupo.length / 2)), grupo.slice(Math.ceil(grupo.length / 2))] : [grupo];
  for (let i = 0; i < partes.length; i++) await compilarLote('categoria ' + c + (partes.length > 1 ? ' (' + (i + 1) + '/' + partes.length + ')' : ''), partes[i], {});
}
await compilarLote('blocos Bluetooth', soBt, { bluetooth: true });

/* ---------- Python: sintaxe e API ---------- */
const extrasPy = {};
{
  /* nomes públicos de cada arquivo auxiliar */
  for (const n of Object.keys(MB_SUPORTE)) {
    const nomes = new Set();
    for (const l of MB_SUPORTE[n].py().split('\n')) { const m = /^def ([a-z]\w*)/.exec(l); if (m) nomes.add(m[1]); }
    extrasPy[n] = nomes;
  }
}
let pyOk = 0;
for (const b of MB_BLOCOS) {
  if (b.py === null) {
    verifica(/só existe em JavaScript|so existe|JavaScript/i.test(pyPorBloco.get(b.id).aviso || '') || pyPorBloco.get(b.id).aviso, b.id + ': deveria avisar que não existe em MicroPython');
    continue;
  }
  const c = pyPorBloco.get(b.id).codigo;
  const s = await verificarSintaxePython(c);
  verifica(s.ok, b.id + ': sintaxe Python: ' + JSON.stringify(s.erros) + '\n' + c);
  const e = verificarApiPython(c, { modulosExtras: extrasPy });
  verifica(e.length === 0, b.id + ': API Python: ' + e.join('; ') + '\n' + c);
  for (const n of mbSuportesUsadosPy(c)) {
    const ss = await verificarSintaxePython(MB_SUPORTE[n].py());
    verifica(ss.ok, 'arquivo auxiliar ' + n + '.py: ' + JSON.stringify(ss.erros));
  }
  pyOk++;
}
console.log('MicroPython: ' + pyOk + ' blocos conferidos (sintaxe e API)');

console.log('\n' + (falhas ? 'FALHOU: ' + falhas + ' verificações' : 'OK: ' + ok + ' verificações'));
process.exit(falhas ? 1 : 0);
