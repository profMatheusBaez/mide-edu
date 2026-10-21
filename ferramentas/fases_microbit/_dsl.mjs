/* ============================================================
 * _dsl.mjs — escrita das fases do micro:bit (só desenvolvimento)
 * ------------------------------------------------------------
 * Monta o JSON de blocos (workspace do Blockly) de cada fase de forma
 * curta. Depende dos scripts do Modo Blocos já carregados em
 * globalThis (MB_POR_ID, MB_LEDS_VAZIO, MB_PINOS…): quem importa isto
 * é ferramentas/gerar_fases_microbit.mjs, depois de carregarScripts().
 *
 *   X.mostrar_texto({ T: 'Ola!' })                  → mb_mostrar_texto
 *   X.sempre({}, [ ...blocos do corpo ])            → mb_sempre com corpo
 *   definir('pontos', 0) · mudar('pontos', 1) · v('pontos')
 *   se(cond, [entao], [senao]) · cmp(a,'LT',b) · e(a,'+',b) · ou(a,b) · e_(a,b) · nao(a)
 *   pino('led.vermelho') → 'P13'  (a partir de MB_PINOS)
 *
 * Valores: número → bloco de número; texto → bloco de texto; true/false
 * → bloco lógico; objeto → já é um bloco. Listas suspensas recebem o
 * valor da opção (ex.: { ICONE: 'Heart' }).
 * ============================================================ */

const vid = (nome) => 'v_' + nome;

function literal(v) {
  if (v !== null && typeof v === 'object') return { block: v };
  if (typeof v === 'number') return { block: { type: 'math_number', fields: { NUM: v } } };
  if (typeof v === 'string') return { block: { type: 'text', fields: { TEXT: v } } };
  if (typeof v === 'boolean') return { block: { type: 'logic_boolean', fields: { BOOL: v ? 'TRUE' : 'FALSE' } } };
  throw new Error('valor inválido: ' + String(v));
}

/* encadeia blocos de instrução em pilha e devolve o primeiro */
export function pilha(blocos) {
  const lista = (blocos || []).filter(Boolean);
  for (let i = 0; i < lista.length - 1; i++) lista[i].next = { block: lista[i + 1] };
  return lista[0];
}

/* Desenho da tela: 5 textos de 5 caracteres ('#' acende, '.' apaga) → '0101…' */
export function desenho(...linhas) {
  if (linhas.length !== 5 || linhas.some((l) => !/^[.#]{5}$/.test(l))) throw new Error('desenho: são 5 linhas de 5 caracteres (# ou .)');
  return linhas.join('').replace(/#/g, '1').replace(/\./g, '0');
}

export function mb(id, valores, corpo) {
  const spec = MB_POR_ID.get(id);
  if (!spec) throw new Error('bloco inexistente: ' + id);
  const val = valores || {};
  const campos = {};
  const entradas = {};
  for (const nome of Object.keys(val)) if (!spec.args.some((a) => a.n === nome)) throw new Error(id + ': argumento desconhecido ' + nome);
  for (const a of spec.args) {
    const v = val[a.n];
    if (a.t === 'drop') {
      const ops = a.op.map((o) => o[1]);
      const escolhido = v === undefined ? a.def : v;
      if (!ops.includes(escolhido)) throw new Error(id + '.' + a.n + ': valor ' + escolhido + ' não está entre ' + ops.join(', '));
      campos[a.n] = escolhido;
    } else if (a.t === 'var') {
      if (typeof v !== 'string') throw new Error(id + ': informe o nome da variável em ' + a.n);
      campos[a.n] = { id: vid(v) };
    } else if (a.t === 'leds') {
      campos[a.n] = v === undefined ? MB_LEDS_VAZIO : v;
    } else if (a.t === 'sprite') {
      entradas[a.n] = literal(v);
    } else {
      entradas[a.n] = literal(v === undefined ? a.v : v);
    }
  }
  const b = { type: id };
  if (Object.keys(campos).length) b.fields = campos;
  if (Object.keys(entradas).length) b.inputs = entradas;
  if (corpo) b.inputs = Object.assign(b.inputs || {}, { DO: { block: pilha(corpo) } });
  return b;
}

/* X.mostrar_texto({...}) = mb('mb_mostrar_texto', {...}) */
export const X = new Proxy({}, { get: (_, nome) => (valores, corpo) => mb('mb_' + String(nome), valores, corpo) });

/* ---- variáveis ---- */
export const v = (nome) => ({ type: 'variables_get', fields: { VAR: { id: vid(nome) } } });
export const definir = (nome, valor) => ({ type: 'mb_var_definir', fields: { VAR: { id: vid(nome) } }, inputs: { VALOR: literal(valor) } });
export const mudar = (nome, valor) => ({ type: 'mb_var_mudar', fields: { VAR: { id: vid(nome) } }, inputs: { VALOR: literal(valor) } });

/* ---- lógica e contas ---- */
const OPS_CMP = { '==': 'EQ', '!=': 'NEQ', '<': 'LT', '<=': 'LTE', '>': 'GT', '>=': 'GTE' };
export const cmp = (a, op, b) => ({ type: 'logic_compare', fields: { OP: OPS_CMP[op] || op }, inputs: { A: literal(a), B: literal(b) } });
const OPS_ARIT = { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY', '/': 'DIVIDE' };
export const e = (a, op, b) => ({ type: 'math_arithmetic', fields: { OP: OPS_ARIT[op] }, inputs: { A: literal(a), B: literal(b) } });
export const resto = (a, b) => ({ type: 'math_modulo', inputs: { DIVIDEND: literal(a), DIVISOR: literal(b) } });
export const e_ = (a, b) => ({ type: 'logic_operation', fields: { OP: 'AND' }, inputs: { A: literal(a), B: literal(b) } });
export const ou = (a, b) => ({ type: 'logic_operation', fields: { OP: 'OR' }, inputs: { A: literal(a), B: literal(b) } });
export const nao = (a) => ({ type: 'logic_negate', inputs: { BOOL: literal(a) } });
export const junta = (...partes) => ({ type: 'text_join', extraState: { itemCount: partes.length }, inputs: Object.fromEntries(partes.map((p, i) => ['ADD' + i, literal(p)])) });

export function se(cond, entao, senao) {
  const b = { type: 'controls_if', inputs: { IF0: literal(cond), DO0: { block: pilha(entao) } } };
  if (senao) { b.extraState = { hasElse: true }; b.inputs.ELSE = { block: pilha(senao) }; }
  return b;
}
/* se … senão se … senão: pares = [[cond, [corpo]], …] */
export function seSenaoSe(pares, senao) {
  const b = { type: 'controls_if', extraState: {}, inputs: {} };
  pares.forEach(([c, corpo], i) => { b.inputs['IF' + i] = literal(c); b.inputs['DO' + i] = { block: pilha(corpo) }; });
  if (pares.length > 1) b.extraState.elseIfCount = pares.length - 1;
  if (senao) { b.extraState.hasElse = true; b.inputs.ELSE = { block: pilha(senao) }; }
  if (!Object.keys(b.extraState).length) delete b.extraState;
  return b;
}
export const repetir = (n, corpo) => ({ type: 'controls_repeat_ext', inputs: { TIMES: literal(n), DO: { block: pilha(corpo) } } });

/* ---- pinos (tabela única MB_PINOS) ---- */
export function pino(caminho) {
  let x = MB_PINOS;
  for (const parte of caminho.split('.')) { x = x && x[parte]; }
  if (typeof x !== 'number') throw new Error('MB_PINOS não tem ' + caminho);
  return 'P' + x;
}
export const numeroDoPino = (caminho) => Number(pino(caminho).slice(1));

/* ---- a fase ---- */
/* topos: blocos de topo (no_iniciar, sempre, eventos…) → workspace serializável */
export function programa(...topos) {
  const blocos = topos.filter(Boolean).map((b, i) => Object.assign({ x: 20, y: 20 + i * 220 }, b));
  const nomes = new Set();
  const varrer = (no) => {
    if (!no || typeof no !== 'object') return;
    if (Array.isArray(no)) { no.forEach(varrer); return; }
    if (no.VAR && typeof no.VAR.id === 'string' && no.VAR.id.startsWith('v_')) nomes.add(no.VAR.id.slice(2));
    for (const k of Object.keys(no)) if (typeof no[k] === 'object') varrer(no[k]);
  };
  varrer(blocos);
  const json = { blocks: { languageVersion: 0, blocks: blocos } };
  if (nomes.size) json.variables = Array.from(nomes).sort().map((n) => ({ name: n, id: vid(n) }));
  return json;
}
