/* ============================================================
 * blocos_mb_gen_js.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Gerador Blockly → JavaScript do MakeCode (Static TypeScript),
 * escrito como o MakeCode escreve: 4 espaços, sem ponto e vírgula,
 * `function () {` com espaço, variáveis globais declaradas no topo
 * com `let`. Todos os blocos vêm da tabela blocos_mb_spec.js.
 *
 * Estrutura do programa gerado:
 *
 *   let pontos = 0                 ← variáveis (na ordem em que aparecem)
 *   led.enable(false)              ← preparação (só se algum bloco pedir)
 *   <corpo de "no início">         ← sempre primeiro
 *   input.onButtonPressed(...)     ← demais blocos de topo, de cima para
 *   basic.forever(...)               baixo (y) e da esquerda para a direita (x)
 *
 * Determinismo: o mesmo workspace gera sempre o mesmo texto, byte a
 * byte. Só Map/Set/Array — nunca Object.keys de objeto comum.
 * Depende de: Blockly e blocos_mb_spec.js.
 * ============================================================ */
'use strict';

const geradorMbJs = new Blockly.Generator('MakeCodeJS');

/* Precedência do JavaScript (menor liga mais forte) — igual à do gerador JS do Blockly. */
Object.assign(geradorMbJs, {
  ORDER_ATOMIC: 0, ORDER_FUNCTION_CALL: 2, ORDER_UNARY: 4, ORDER_EXPONENT: 4,
  ORDER_MULTIPLICATIVE: 5, ORDER_ADDITIVE: 6, ORDER_RELATIONAL: 8, ORDER_EQUALITY: 9,
  ORDER_LOGICAL_AND: 13, ORDER_LOGICAL_OR: 14, ORDER_NONE: 99, INDENT: '    ',
});

geradorMbJs.init = function (workspace) {
  Blockly.Generator.prototype.init.call(this);
  this.workspace_ = workspace;
  this.variaveis_ = new Map();      // nome → { tipo, fixo }
  this.nomesVariaveis_ = new Map(); // id da variável do Blockly → nome
  this.nomesUsados_ = new Set();
  this.preparos_ = new Map();       // linha de preparação → true (ordem da 1ª aparição)
  this.suportes_ = new Set();       // arquivos auxiliares usados
  this.usa_ = { bluetooth: false, radio: false, semPython: new Set() };
  this.profundidadeRepetir_ = 0;
};
geradorMbJs.finish = function (codigo) { return codigo; };
geradorMbJs.scrub_ = function (block, code, thisOnly) {
  const proximo = block.nextConnection && block.nextConnection.targetBlock();
  if (proximo && !thisOnly) return code + this.blockToCode(proximo);
  return code;
};

/* Nome (igual ao do Python) de uma variável do Blockly. */
geradorMbJs.nomeVariavel = function (id) {
  if (this.nomesVariaveis_.has(id)) return this.nomesVariaveis_.get(id);
  const v = this.workspace_.getVariableMap().getVariableById(id);
  const nome = mbNomeSeguro(v ? v.getName() : 'item', this.nomesUsados_);
  this.nomesVariaveis_.set(id, nome);
  return nome;
};
geradorMbJs.registrarVariavel_ = function (nome, tipo, fixo) {
  const atual = this.variaveis_.get(nome);
  if (!atual) this.variaveis_.set(nome, { tipo: tipo || 'Number', fixo: !!fixo });
  else if (fixo && !atual.fixo) { atual.tipo = tipo; atual.fixo = true; }
};

/* Tira um nível de indentação (o corpo de "no início" vai solto, na coluna 0). */
const _semRecuo = (texto) => texto.split('\n').map((l) => (l.startsWith('    ') ? l.slice(4) : l)).join('\n');

/* Corpo de um bloco composto. */
geradorMbJs.corpo_ = function (block, nome) { return this.statementToCode(block, nome); };

/* Valor de um argumento da tabela, já em JavaScript. */
geradorMbJs.argumento_ = function (block, a) {
  switch (a.t) {
    case 'num': case 'any': return this.valueToCode(block, a.n, this.ORDER_NONE) || '0';
    case 'txt': return this.valueToCode(block, a.n, this.ORDER_NONE) || '""';
    case 'bool': return this.valueToCode(block, a.n, this.ORDER_NONE) || 'false';
    case 'sprite': return this.valueToCode(block, a.n, this.ORDER_NONE) || 'null';
    case 'drop': {
      const v = block.getFieldValue(a.n);
      return (a.op.find((o) => o[1] === v) || a.op[0])[2];
    }
    case 'var': return this.nomeVariavel(block.getField(a.n).getValue());
    default: return '';
  }
};

/* Registra o que o bloco exige do programa (preparos, arquivos, avisos). */
geradorMbJs.notar_ = function (b) {
  if (b.iniJS) this.preparos_.set(b.iniJS, true);
  if (b.suporte) this.suportes_.add(b.suporte);
  if (b.cat === 'bluetooth') this.usa_.bluetooth = true;
  if (b.cat === 'radio') this.usa_.radio = true;
  if (b.py === null) this.usa_.semPython.add(b.cat === 'jogo' ? 'Jogo' : 'Bluetooth');
};

/* ------------------------------------------------------------
 * Blocos da tabela
 * ---------------------------------------------------------- */
for (const b of MB_BLOCOS) {
  if (b.especial === 'leds') {
    geradorMbJs.forBlock[b.id] = function (block, gen) {
      gen.notar_(b);
      const v = String(block.getFieldValue('LEDS') || '').padEnd(25, '0');
      const linhas = [];
      for (let y = 0; y < 5; y++) {
        linhas.push(gen.INDENT + v.slice(y * 5, y * 5 + 5).split('').map((c) => (c === '1' ? '#' : '.')).join(' '));
      }
      return 'basic.showLeds(`\n' + linhas.join('\n') + '\n' + gen.INDENT + '`)\n';
    };
    continue;
  }
  if (b.especial === 'iniciar') {
    geradorMbJs.forBlock[b.id] = function (block, gen) { return _semRecuo(gen.corpo_(block, 'DO')); };
    continue;
  }
  if (b.especial === 'sempre') {
    geradorMbJs.forBlock[b.id] = function (block, gen) { return 'basic.forever(function () {\n' + gen.corpo_(block, 'DO') + '})\n'; };
    continue;
  }
  if (b.especial === 'para') {
    geradorMbJs.forBlock[b.id] = function (block, gen) {
      const nome = gen.nomeVariavel(block.getField('VAR').getValue());
      const ate = gen.valueToCode(block, 'ATE', gen.ORDER_NONE) || '0';
      return 'for (let ' + nome + ' = 0; ' + nome + ' <= ' + ate + '; ' + nome + '++) {\n' + gen.corpo_(block, 'DO') + '}\n';
    };
    continue;
  }
  if (b.especial === 'enquanto') {
    geradorMbJs.forBlock[b.id] = function (block, gen) {
      const cond = gen.valueToCode(block, 'C', gen.ORDER_NONE) || 'false';
      return 'while (' + cond + ') {\n' + gen.corpo_(block, 'DO') + '}\n';
    };
    continue;
  }
  if (b.forma === 'evento') {
    geradorMbJs.forBlock[b.id] = function (block, gen) {
      gen.notar_(b);
      const valores = {};
      for (const a of b.args) valores[a.n] = gen.argumento_(block, a);
      return mbSubstituir(b.js, valores) + '\n' + gen.corpo_(block, 'DO') + '})\n';
    };
    continue;
  }
  geradorMbJs.forBlock[b.id] = function (block, gen) {
    gen.notar_(b);
    const valores = {};
    for (const a of b.args) valores[a.n] = gen.argumento_(block, a);
    const codigo = mbSubstituir(b.js, valores);
    return b.forma === 'valor' ? [codigo, gen.ORDER_FUNCTION_CALL] : codigo + '\n';
  };
}

/* ------------------------------------------------------------
 * Variáveis
 * ---------------------------------------------------------- */
geradorMbJs.forBlock['variables_get'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  gen.registrarVariavel_(nome, 'Number', false);
  return [nome, gen.ORDER_ATOMIC];
};
geradorMbJs.forBlock['mb_var_definir'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  const filho = block.getInputTargetBlock('VALOR');
  const tipo = mbTipoDoBloco(filho);
  gen.registrarVariavel_(nome, tipo || 'Number', !!filho);
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || (tipo === 'String' ? '""' : '0');
  return nome + ' = ' + valor + '\n';
};
geradorMbJs.forBlock['mb_var_mudar'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  gen.registrarVariavel_(nome, 'Number', false);
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || '1';
  return nome + ' += ' + valor + '\n';
};

/* ------------------------------------------------------------
 * Blocos nativos do Blockly
 * ---------------------------------------------------------- */
geradorMbJs.forBlock['math_number'] = function (block, gen) {
  const n = Number(block.getFieldValue('NUM'));
  return n < 0 ? ['-' + (-n), gen.ORDER_UNARY] : [String(n), gen.ORDER_ATOMIC];
};
geradorMbJs.forBlock['text'] = function (block, gen) {
  return [mbLiteralTexto(block.getFieldValue('TEXT')), gen.ORDER_ATOMIC];
};
geradorMbJs.forBlock['logic_boolean'] = function (block, gen) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', gen.ORDER_ATOMIC];
};
geradorMbJs.forBlock['logic_negate'] = function (block, gen) {
  return ['!' + (gen.valueToCode(block, 'BOOL', gen.ORDER_UNARY) || 'true'), gen.ORDER_UNARY];
};
geradorMbJs.forBlock['logic_operation'] = function (block, gen) {
  const e = block.getFieldValue('OP') === 'AND';
  const ordem = e ? gen.ORDER_LOGICAL_AND : gen.ORDER_LOGICAL_OR;
  const a = gen.valueToCode(block, 'A', ordem) || 'false';
  const b = gen.valueToCode(block, 'B', ordem) || 'false';
  return [a + (e ? ' && ' : ' || ') + b, ordem];
};
geradorMbJs.forBlock['logic_compare'] = function (block, gen) {
  const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[block.getFieldValue('OP')] || '==';
  const ordem = (op === '==' || op === '!=') ? gen.ORDER_EQUALITY : gen.ORDER_RELATIONAL;
  const a = gen.valueToCode(block, 'A', ordem) || '0';
  const b = gen.valueToCode(block, 'B', ordem) || '0';
  return [a + ' ' + op + ' ' + b, ordem];
};
geradorMbJs.forBlock['math_arithmetic'] = function (block, gen) {
  const op = block.getFieldValue('OP');
  const tabela = { ADD: ['+', gen.ORDER_ADDITIVE], MINUS: ['-', gen.ORDER_ADDITIVE], MULTIPLY: ['*', gen.ORDER_MULTIPLICATIVE], DIVIDE: ['/', gen.ORDER_MULTIPLICATIVE], POWER: ['**', gen.ORDER_EXPONENT] };
  const [sinal, ordem] = tabela[op] || tabela.ADD;
  const a = gen.valueToCode(block, 'A', ordem) || '0';
  const b = gen.valueToCode(block, 'B', ordem) || '0';
  return [a + ' ' + sinal + ' ' + b, ordem];
};
geradorMbJs.forBlock['math_modulo'] = function (block, gen) {
  const a = gen.valueToCode(block, 'DIVIDEND', gen.ORDER_MULTIPLICATIVE) || '0';
  const b = gen.valueToCode(block, 'DIVISOR', gen.ORDER_MULTIPLICATIVE) || '1';
  return [a + ' % ' + b, gen.ORDER_MULTIPLICATIVE];
};
geradorMbJs.forBlock['text_join'] = function (block, gen) {
  const itens = [];
  for (let i = 0; i < block.itemCount_; i++) itens.push(gen.valueToCode(block, 'ADD' + i, gen.ORDER_ADDITIVE) || '""');
  if (!itens.length) return ['""', gen.ORDER_ATOMIC];
  /* como o MakeCode: começa com "" quando o primeiro item não é um texto literal */
  const lista = mbEhLiteral(itens[0]) ? itens : ['""'].concat(itens);
  return [lista.join(' + '), gen.ORDER_ADDITIVE];
};

/* if / else if / else */
geradorMbJs.forBlock['controls_if'] = function (block, gen) {
  let codigo = '';
  const n = block.elseifCount_ || 0;
  for (let i = 0; i <= n; i++) {
    const cond = gen.valueToCode(block, 'IF' + i, gen.ORDER_NONE) || 'false';
    codigo += (i === 0 ? 'if (' : ' else if (') + cond + ') {\n' + gen.corpo_(block, 'DO' + i) + '}';
  }
  if (block.elseCount_) codigo += ' else {\n' + gen.corpo_(block, 'ELSE') + '}';
  return codigo + '\n';
};
geradorMbJs.forBlock['controls_repeat_ext'] = function (block, gen) {
  const vezes = gen.valueToCode(block, 'TIMES', gen.ORDER_NONE) || '0';
  gen.profundidadeRepetir_++;
  const nome = gen.profundidadeRepetir_ === 1 ? 'index' : 'index' + gen.profundidadeRepetir_;
  const corpo = gen.corpo_(block, 'DO');
  gen.profundidadeRepetir_--;
  return 'for (let ' + nome + ' = 0; ' + nome + ' < ' + vezes + '; ' + nome + '++) {\n' + corpo + '}\n';
};

/* ============================================================
 * Programa completo
 * ============================================================ */
function blocosGerarMbJs(workspace) {
  const gen = geradorMbJs;
  gen.init(workspace);

  const topos = workspace.getTopBlocks(true).filter((b) => b.isEnabled());
  const validos = topos.filter((b) => MB_POR_ID.has(b.type) && MB_POR_ID.get(b.type).forma === 'evento');
  const soltos = topos.length - validos.length;
  const ordem = validos.filter((b) => b.type === 'mb_no_iniciar').concat(validos.filter((b) => b.type !== 'mb_no_iniciar'));

  let corpo = '';
  for (const t of ordem) corpo += gen.blockToCode(t);

  const avisos = [];
  if (soltos > 0) avisos.push('Há blocos soltos (fora de "no início", "sempre" ou de um evento): eles não entram no programa.');
  if (gen.usa_.bluetooth && gen.usa_.radio) avisos.push('Bluetooth e Rádio não funcionam juntos na micro:bit: use só um dos dois.');

  if (!corpo.trim()) {
    return { codigo: '', aviso: avisos.join(' ') || 'Arraste um bloco "no início" ou "sempre" para começar.', bluetooth: false, suportes: [] };
  }

  const linhas = [];
  for (const [nome, v] of gen.variaveis_) {
    if (v.tipo === 'String') linhas.push('let ' + nome + ' = ""');
    else if (v.tipo === 'Boolean') linhas.push('let ' + nome + ' = false');
    else if (v.tipo === 'Sprite') linhas.push('let ' + nome + ': game.LedSprite = null');
    else linhas.push('let ' + nome + ' = 0');
  }
  for (const p of gen.preparos_.keys()) linhas.push(p);

  return {
    codigo: linhas.concat([corpo.replace(/\n$/, '')]).join('\n') + '\n',
    aviso: avisos.join(' ') || null,
    impossivel: !!(gen.usa_.bluetooth && gen.usa_.radio),   // Bluetooth e rádio juntos não compilam
    bluetooth: gen.usa_.bluetooth,
    suportes: Array.from(gen.suportes_),
  };
}
