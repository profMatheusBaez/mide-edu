/* ============================================================
 * blocos_mb_toolbox.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Toolbox no estilo MakeCode, montada a partir de blocos_mb_spec.js.
 * Depende de _num/_bool/_txt (blocos_toolbox.js).
 *
 * blocosMontarToolboxMB({ linguagem, permitidos })
 *   linguagem  'js' | 'micropython' — em MicroPython, as categorias que só
 *              existem em JavaScript (Jogo, Bluetooth) ficam cinzas.
 *   permitidos Set de tipos de bloco liberados (paleta da fase); sem ele,
 *              todos os blocos aparecem.
 * ============================================================ */
'use strict';

/* Entrada de toolbox de um bloco da tabela, com os valores-padrão. */
function mbEntradaToolbox(b) {
  const item = { kind: 'block', type: b.id };
  const campos = {};
  const entradas = {};
  for (const a of b.args) {
    if (a.t === 'drop') campos[a.n] = a.def != null ? a.def : a.op[0][1];
    else if (a.t === 'num' || a.t === 'any') entradas[a.n] = _num(a.v);
    else if (a.t === 'txt') entradas[a.n] = _txt(a.v);
    else if (a.t === 'bool') entradas[a.n] = _bool();
  }
  if (Object.keys(campos).length) item.fields = campos;
  if (Object.keys(entradas).length) item.inputs = entradas;
  return item;
}

/* Blocos nativos do Blockly em cada categoria (antes/depois dos da tabela). */
const MB_NATIVOS_TOOLBOX = {
  lacos: { antes: [
    { kind: 'block', type: 'controls_if' },
    { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
    { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: _num(4) } },
  ] },
  logica: { antes: [
    { kind: 'block', type: 'logic_compare', inputs: { A: _num(0), B: _num(0) } },
    { kind: 'block', type: 'logic_operation', fields: { OP: 'AND' }, inputs: { A: _bool(), B: _bool() } },
    { kind: 'block', type: 'logic_operation', fields: { OP: 'OR' }, inputs: { A: _bool(), B: _bool() } },
    { kind: 'block', type: 'logic_negate', inputs: { BOOL: _bool() } },
    { kind: 'block', type: 'logic_boolean', fields: { BOOL: 'TRUE' } },
    { kind: 'block', type: 'logic_boolean', fields: { BOOL: 'FALSE' } },
  ] },
  matematica: { antes: [
    { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
    { kind: 'block', type: 'math_arithmetic', fields: { OP: 'ADD' }, inputs: { A: _num(0), B: _num(0) } },
    { kind: 'block', type: 'math_arithmetic', fields: { OP: 'MINUS' }, inputs: { A: _num(0), B: _num(0) } },
    { kind: 'block', type: 'math_arithmetic', fields: { OP: 'MULTIPLY' }, inputs: { A: _num(0), B: _num(0) } },
    { kind: 'block', type: 'math_arithmetic', fields: { OP: 'DIVIDE' }, inputs: { A: _num(0), B: _num(1) } },
    { kind: 'block', type: 'math_modulo', inputs: { DIVIDEND: _num(0), DIVISOR: _num(2) } },
  ] },
  texto: { antes: [
    { kind: 'block', type: 'text', fields: { TEXT: '' } },
    { kind: 'block', type: 'text_join', extraState: { itemCount: 2 }, inputs: { ADD0: _txt('Oi '), ADD1: _txt('') } },
  ] },
};

/* Categoria "Variáveis": os blocos dependem das variáveis que existem. */
function mbFlyoutVariaveis(ws) {
  const itens = [{ kind: 'button', text: 'Criar uma variável…', callbackKey: 'blocosCriarVariavel' }];
  const vars = ws.getVariableMap().getAllVariables();
  if (vars.length) {
    const id = vars[0].getId();
    itens.push({ kind: 'block', type: 'mb_var_definir', fields: { VAR: { id } }, inputs: { VALOR: _num(0) } });
    itens.push({ kind: 'block', type: 'mb_var_mudar', fields: { VAR: { id } }, inputs: { VALOR: _num(1) } });
    for (const v of vars) itens.push({ kind: 'block', type: 'variables_get', fields: { VAR: { id: v.getId() } } });
  }
  return itens;
}

function blocosMontarToolboxMB(opcoes) {
  const op = opcoes || {};
  const py = op.linguagem === 'micropython';
  const permitido = (tipo) => !op.permitidos || op.permitidos.has(tipo);
  const contents = [];

  for (const cat of MB_CATEGORIAS) {
    const nat = MB_NATIVOS_TOOLBOX[cat.id];
    const itens = []
      .concat(nat && nat.antes ? nat.antes : [])
      .concat(MB_BLOCOS.filter((b) => b.cat === cat.id).map(mbEntradaToolbox))
      .filter((it) => permitido(it.type));

    if (cat.custom) {
      const libera = permitido('mb_var_definir') || permitido('variables_get');
      if (libera) contents.push({ kind: 'category', name: cat.rotulo, categorystyle: 'mb_' + cat.id + '_category', custom: cat.custom });
      continue;
    }
    if (!itens.length) continue;
    const soJs = cat.so === 'js' && py;
    contents.push({
      kind: 'category',
      name: soJs ? cat.rotulo + ' (só JS)' : cat.rotulo,
      categorystyle: soJs ? 'mb_desativado_category' : 'mb_' + cat.id + '_category',
      contents: itens,
    });
  }
  return { kind: 'categoryToolbox', contents };
}

/* Tipos de bloco que uma fase usa — para montar a paleta liberada. */
function mbTiposDoWorkspace(json) {
  const tipos = new Set();
  const visitar = (no) => {
    if (!no || typeof no !== 'object') return;
    if (Array.isArray(no)) { no.forEach(visitar); return; }
    if (typeof no.type === 'string') tipos.add(no.type);
    for (const k of Object.keys(no)) if (typeof no[k] === 'object') visitar(no[k]);
  };
  visitar(json && json.blocks);
  return tipos;
}
