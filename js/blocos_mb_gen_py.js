/* ============================================================
 * blocos_mb_gen_py.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Gerador Blockly → MicroPython do micro:bit (firmware V2).
 * Todos os blocos vêm da tabela blocos_mb_spec.js, a mesma que
 * alimenta o JavaScript — por isso as duas versões dizem a mesma coisa.
 *
 * O MicroPython não tem "eventos": o programa é UM laço. Por isso:
 *   · "no início"        → código antes do laço;
 *   · "quando … (evento)"→ um `if` dentro do laço, na ordem dos blocos;
 *   · "sempre"           → o corpo entra no mesmo laço.
 *
 *   # Gerado pelo Modo Blocos — MIDE EDU (micro:bit V2)
 *   from microbit import *
 *   import music                     ← só o que for usado, ordem fixa
 *
 *   def mapear(...): ...             ← auxiliares, uma vez, só se usados
 *
 *   pontos = 0                       ← variáveis
 *   radio.on()                       ← preparos (radio.on(), display.off()…)
 *   <corpo de "no início">
 *
 *   while True:
 *       if button_a.was_pressed():   ← um `if` por evento
 *           ...
 *       <corpo do(s) "sempre">
 *       sleep(20)                    ← só se o laço não tiver nenhuma pausa
 *
 * Sem `while True` quando não há "sempre" nem eventos. Sem f-strings.
 * Determinismo: mesmas regras do gerador JS (Map/Set/Array).
 * ============================================================ */
'use strict';

const geradorMbPy = new Blockly.Generator('MicroPythonMB');

Object.assign(geradorMbPy, {
  ORDER_ATOMIC: 0, ORDER_FUNCTION_CALL: 2, ORDER_EXPONENT: 3, ORDER_UNARY: 4, ORDER_MULTIPLICATIVE: 5,
  ORDER_ADDITIVE: 6, ORDER_RELATIONAL: 11, ORDER_EQUALITY: 11, ORDER_LOGICAL_NOT: 12, ORDER_LOGICAL_AND: 13,
  ORDER_LOGICAL_OR: 14, ORDER_NONE: 99, INDENT: '    ',
});

/* Ordem fixa das importações. */
const MB_PY_IMPORTACOES = [
  ['music', 'import music'], ['radio', 'import radio'], ['random', 'import random'], ['math', 'import math'],
  ['machine', 'from machine import time_pulse_us'], ['utime', 'import utime'],
];

/* Funções auxiliares emitidas uma vez, quando algum bloco pede. */
const MB_PY_AUXILIARES = {
  mapear:
    'def mapear(valor, de_min, de_max, para_min, para_max):\n' +
    '    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)',
  grafico_barras:
    'def grafico_barras(valor, maximo):\n' +
    '    proporcao = abs(valor) / maximo if maximo > 0 else 0\n' +
    '    k = 0\n' +
    '    for y in range(4, -1, -1):\n' +
    '        for x in range(3):\n' +
    '            brilho = 9 if k <= proporcao else 0\n' +
    '            display.set_pixel(2 - x, y, brilho)\n' +
    '            display.set_pixel(2 + x, y, brilho)\n' +
    '            k += 1 / 16',
};

geradorMbPy.init = function (workspace) {
  Blockly.Generator.prototype.init.call(this);
  this.workspace_ = workspace;
  this.variaveis_ = new Map();
  this.nomesVariaveis_ = new Map();
  this.nomesUsados_ = new Set();
  this.importacoes_ = new Set();
  this.suportes_ = new Set();
  this.auxiliares_ = new Set();
  this.preparos_ = new Map();
  this.usaPacote_ = false;
  this.semPython_ = new Set();
};
geradorMbPy.finish = function (codigo) { return codigo; };
geradorMbPy.scrub_ = function (block, code, thisOnly) {
  const proximo = block.nextConnection && block.nextConnection.targetBlock();
  if (proximo && !thisOnly) return code + this.blockToCode(proximo);
  return code;
};

geradorMbPy.nomeVariavel = function (id) {
  if (this.nomesVariaveis_.has(id)) return this.nomesVariaveis_.get(id);
  const v = this.workspace_.getVariableMap().getVariableById(id);
  const nome = mbNomeSeguro(v ? v.getName() : 'item', this.nomesUsados_);
  this.nomesVariaveis_.set(id, nome);
  return nome;
};
geradorMbPy.registrarVariavel_ = function (nome, tipo, fixo) {
  const atual = this.variaveis_.get(nome);
  if (!atual) this.variaveis_.set(nome, { tipo: tipo || 'Number', fixo: !!fixo });
  else if (fixo && !atual.fixo) { atual.tipo = tipo; atual.fixo = true; }
};

/* Corpo de um bloco composto: nunca vazio (o Python exige ao menos um "pass"). */
geradorMbPy.corpo_ = function (block, nome) {
  return this.statementToCode(block, nome) || (this.INDENT + 'pass\n');
};

geradorMbPy.argumento_ = function (block, a) {
  switch (a.t) {
    case 'num': case 'any': return this.valueToCode(block, a.n, this.ORDER_NONE) || '0';
    case 'txt': return this.valueToCode(block, a.n, this.ORDER_NONE) || '""';
    case 'bool': return this.valueToCode(block, a.n, this.ORDER_NONE) || 'False';
    case 'sprite': return this.valueToCode(block, a.n, this.ORDER_NONE) || 'None';
    case 'drop': {
      const v = block.getFieldValue(a.n);
      return (a.op.find((o) => o[1] === v) || a.op[0])[3];
    }
    case 'var': return this.nomeVariavel(block.getField(a.n).getValue());
    default: return '';
  }
};

/* Registra o que o bloco exige (importações, preparos, auxiliares, arquivos). */
geradorMbPy.notar_ = function (b, valores) {
  for (const i of (b.imp || [])) this.importacoes_.add(i);
  if (b.iniPy) this.preparos_.set(b.iniPy, true);
  if (b.iniPyPino) this.preparos_.set(mbSubstituir(b.iniPyPino, valores || {}), true);
  if (b.pyDef) this.auxiliares_.add(b.pyDef);
  if (b.suporte) this.suportes_.add(b.suporte);
};

/* ------------------------------------------------------------
 * Blocos da tabela
 * ---------------------------------------------------------- */
for (const b of MB_BLOCOS) {
  /* corpo de "no início" e "sempre": tratados em blocosGerarMbPy */
  if (b.especial === 'iniciar' || b.especial === 'sempre') {
    geradorMbPy.forBlock[b.id] = function () { return ''; };
    continue;
  }
  if (b.especial === 'leds') {
    geradorMbPy.forBlock[b.id] = function (block, gen) {
      const v = String(block.getFieldValue('LEDS') || '').padEnd(25, '0');
      const linhas = [];
      for (let y = 0; y < 5; y++) linhas.push(v.slice(y * 5, y * 5 + 5).split('').map((c) => (c === '1' ? '9' : '0')).join(''));
      return 'display.show(Image("' + linhas.join(':') + '"))\n';
    };
    continue;
  }
  if (b.especial === 'para') {
    geradorMbPy.forBlock[b.id] = function (block, gen) {
      const nome = gen.nomeVariavel(block.getField('VAR').getValue());
      const ate = gen.valueToCode(block, 'ATE', gen.ORDER_ADDITIVE) || '0';
      const limite = /^\d+$/.test(ate) ? String(Number(ate) + 1) : ate + ' + 1';
      return 'for ' + nome + ' in range(' + limite + '):\n' + gen.corpo_(block, 'DO');
    };
    continue;
  }
  if (b.especial === 'enquanto') {
    geradorMbPy.forBlock[b.id] = function (block, gen) {
      const cond = gen.valueToCode(block, 'C', gen.ORDER_NONE) || 'False';
      return 'while ' + cond + ':\n' + gen.corpo_(block, 'DO');
    };
    continue;
  }
  if (b.forma === 'evento') {
    /* eventos são tratados em blocosGerarMbPy (viram `if` dentro do laço); aqui só o que o corpo usa */
    geradorMbPy.forBlock[b.id] = function () { return ''; };
    continue;
  }
  if (b.py === null) {
    geradorMbPy.forBlock[b.id] = function (block, gen) {
      gen.semPython_.add(b.cat === 'jogo' ? 'Jogo' : 'Bluetooth');
      for (const a of b.args) if (a.t === 'num' || a.t === 'txt' || a.t === 'any' || a.t === 'sprite') gen.valueToCode(block, a.n, gen.ORDER_NONE);
      return b.forma === 'valor' ? ['None', gen.ORDER_ATOMIC] : '# (sem equivalente em MicroPython: ' + b.msg.replace(/\{[A-Z0-9_]+\}/g, '…') + ')\n';
    };
    continue;
  }
  if (b.id === 'mb_serial_valor') {
    geradorMbPy.forBlock[b.id] = function (block, gen) {
      const nome = gen.valueToCode(block, 'NOME', gen.ORDER_NONE) || '""';
      const valor = gen.valueToCode(block, 'V', gen.ORDER_NONE) || '0';
      const rotulo = mbEhLiteral(nome) ? nome.slice(0, -1) + ':"' : nome + ' + ":"';
      return 'print(' + rotulo + ', ' + valor + ')\n';
    };
    continue;
  }
  geradorMbPy.forBlock[b.id] = function (block, gen) {
    const valores = {};
    for (const a of b.args) valores[a.n] = gen.argumento_(block, a);
    gen.notar_(b, valores);
    const codigo = mbSubstituir(b.py, valores);
    return b.forma === 'valor' ? [codigo, gen.ORDER_ATOMIC] : codigo + '\n';
  };
}

/* "número recebido" / "texto recebido" leem o pacote guardado pelo laço */
geradorMbPy.forBlock['mb_radio_numero_recebido'] = function (block, gen) { gen.importacoes_.add('radio'); return ['int(pacote)', gen.ORDER_FUNCTION_CALL]; };
geradorMbPy.forBlock['mb_radio_texto_recebido'] = function (block, gen) { gen.importacoes_.add('radio'); return ['pacote', gen.ORDER_ATOMIC]; };

/* ------------------------------------------------------------
 * Variáveis
 * ---------------------------------------------------------- */
geradorMbPy.forBlock['variables_get'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  gen.registrarVariavel_(nome, 'Number', false);
  return [nome, gen.ORDER_ATOMIC];
};
geradorMbPy.forBlock['mb_var_definir'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  const filho = block.getInputTargetBlock('VALOR');
  const tipo = mbTipoDoBloco(filho);
  gen.registrarVariavel_(nome, tipo || 'Number', !!filho);
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || (tipo === 'String' ? '""' : '0');
  return nome + ' = ' + valor + '\n';
};
geradorMbPy.forBlock['mb_var_mudar'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  gen.registrarVariavel_(nome, 'Number', false);
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || '1';
  return nome + ' += ' + valor + '\n';
};

/* ------------------------------------------------------------
 * Blocos nativos do Blockly
 * ---------------------------------------------------------- */
geradorMbPy.forBlock['math_number'] = function (block, gen) {
  const n = Number(block.getFieldValue('NUM'));
  return n < 0 ? ['-' + (-n), gen.ORDER_UNARY] : [String(n), gen.ORDER_ATOMIC];
};
geradorMbPy.forBlock['text'] = function (block, gen) {
  return [mbLiteralTexto(block.getFieldValue('TEXT')), gen.ORDER_ATOMIC];
};
geradorMbPy.forBlock['logic_boolean'] = function (block, gen) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'True' : 'False', gen.ORDER_ATOMIC];
};
geradorMbPy.forBlock['logic_negate'] = function (block, gen) {
  return ['not ' + (gen.valueToCode(block, 'BOOL', gen.ORDER_LOGICAL_NOT) || 'True'), gen.ORDER_LOGICAL_NOT];
};
geradorMbPy.forBlock['logic_operation'] = function (block, gen) {
  const e = block.getFieldValue('OP') === 'AND';
  const ordem = e ? gen.ORDER_LOGICAL_AND : gen.ORDER_LOGICAL_OR;
  const a = gen.valueToCode(block, 'A', ordem) || 'False';
  const b = gen.valueToCode(block, 'B', ordem) || 'False';
  return [a + (e ? ' and ' : ' or ') + b, ordem];
};
geradorMbPy.forBlock['logic_compare'] = function (block, gen) {
  const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[block.getFieldValue('OP')] || '==';
  const a = gen.valueToCode(block, 'A', gen.ORDER_RELATIONAL) || '0';
  const b = gen.valueToCode(block, 'B', gen.ORDER_RELATIONAL) || '0';
  return [a + ' ' + op + ' ' + b, gen.ORDER_RELATIONAL];
};
geradorMbPy.forBlock['math_arithmetic'] = function (block, gen) {
  const tabela = { ADD: ['+', gen.ORDER_ADDITIVE], MINUS: ['-', gen.ORDER_ADDITIVE], MULTIPLY: ['*', gen.ORDER_MULTIPLICATIVE], DIVIDE: ['/', gen.ORDER_MULTIPLICATIVE], POWER: ['**', gen.ORDER_EXPONENT] };
  const [sinal, ordem] = tabela[block.getFieldValue('OP')] || tabela.ADD;
  const a = gen.valueToCode(block, 'A', ordem) || '0';
  const b = gen.valueToCode(block, 'B', ordem) || '0';
  return [a + ' ' + sinal + ' ' + b, ordem];
};
geradorMbPy.forBlock['math_modulo'] = function (block, gen) {
  const a = gen.valueToCode(block, 'DIVIDEND', gen.ORDER_MULTIPLICATIVE) || '0';
  const b = gen.valueToCode(block, 'DIVISOR', gen.ORDER_MULTIPLICATIVE) || '1';
  return [a + ' % ' + b, gen.ORDER_MULTIPLICATIVE];
};
geradorMbPy.forBlock['text_join'] = function (block, gen) {
  const itens = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const codigo = gen.valueToCode(block, 'ADD' + i, gen.ORDER_NONE) || '""';
    itens.push(mbEhLiteral(codigo) ? codigo : 'str(' + codigo + ')');
  }
  if (!itens.length) return ['""', gen.ORDER_ATOMIC];
  return [itens.join(' + '), gen.ORDER_ADDITIVE];
};
geradorMbPy.forBlock['controls_if'] = function (block, gen) {
  let codigo = '';
  const n = block.elseifCount_ || 0;
  for (let i = 0; i <= n; i++) {
    const cond = gen.valueToCode(block, 'IF' + i, gen.ORDER_NONE) || 'False';
    codigo += (i === 0 ? 'if ' : 'elif ') + cond + ':\n' + gen.corpo_(block, 'DO' + i);
  }
  if (block.elseCount_) codigo += 'else:\n' + gen.corpo_(block, 'ELSE');
  return codigo;
};
geradorMbPy.forBlock['controls_repeat_ext'] = function (block, gen) {
  const vezes = gen.valueToCode(block, 'TIMES', gen.ORDER_NONE) || '0';
  return 'for _ in range(' + vezes + '):\n' + gen.corpo_(block, 'DO');
};

/* ------------------------------------------------------------
 * Eventos → condição de um `if` dentro do laço
 * ---------------------------------------------------------- */
function mbCondicaoEventoPy(bloco, gen) {
  const b = MB_POR_ID.get(bloco.type);
  gen.notar_(b);
  if (b.especial === 'radio_numero') return 'pacote and pacote.lstrip("-").isdigit()';
  if (b.especial === 'radio_texto') return 'pacote';
  const valores = {};
  for (const a of b.args) valores[a.n] = gen.argumento_(bloco, a);
  return mbSubstituir(b.cond, valores);
}

/* Recua cada linha não vazia (o corpo de um `if` dentro do laço fica um nível mais fundo). */
const _recuar = (texto, recuo) => texto.split('\n').map((l) => (l ? recuo + l : l)).join('\n');

/* ============================================================
 * Programa completo
 * ============================================================ */
function blocosGerarMbPy(workspace) {
  const gen = geradorMbPy;
  gen.init(workspace);

  const topos = workspace.getTopBlocks(true).filter((b) => b.isEnabled());
  const validos = topos.filter((b) => MB_POR_ID.has(b.type) && MB_POR_ID.get(b.type).forma === 'evento');
  const soltos = topos.length - validos.length;

  let inicio = '';
  let laco = '';
  let recebe = false;

  /* "no início" primeiro; depois os demais, na ordem do workspace */
  for (const t of validos.filter((b) => b.type === 'mb_no_iniciar')) inicio += gen.statementToCode(t, 'DO').replace(/^ {4}/gm, '');
  for (const t of validos.filter((b) => b.type !== 'mb_no_iniciar')) {
    const espec = MB_POR_ID.get(t.type);
    if (espec.especial === 'sempre') {
      laco += gen.statementToCode(t, 'DO');
    } else if (espec.py === null) {
      gen.semPython_.add('Bluetooth');
    } else {
      const ehRadio = espec.especial === 'radio_numero' || espec.especial === 'radio_texto';
      if (ehRadio && !recebe) { recebe = true; laco += gen.INDENT + 'pacote = radio.receive()\n'; }
      laco += gen.INDENT + 'if ' + mbCondicaoEventoPy(t, gen) + ':\n' + _recuar(gen.corpo_(t, 'DO'), gen.INDENT);
    }
  }

  const temLaco = validos.some((b) => b.type !== 'mb_no_iniciar');
  if (temLaco && !/\bsleep\(/.test(laco)) laco += gen.INDENT + 'sleep(20)\n';

  const avisos = [];
  if (soltos > 0) avisos.push('Há blocos soltos (fora de "no início", "sempre" ou de um evento): eles não entram no programa.');
  if (gen.semPython_.size) avisos.push('Estes blocos só existem em JavaScript e foram deixados de fora do Python: ' + Array.from(gen.semPython_).join(', ') + '.');

  if (!inicio.trim() && !laco.trim()) {
    return { codigo: '', aviso: avisos.join(' ') || 'Arraste um bloco "no início" ou "sempre" para começar.', impossivel: gen.semPython_.size > 0, suportes: [] };
  }

  const cabeca = ['# Gerado pelo Modo Blocos — MIDE EDU (micro:bit V2)', 'from microbit import *'];
  for (const [nome, linha] of MB_PY_IMPORTACOES) if (gen.importacoes_.has(nome)) cabeca.push(linha);
  for (const s of Array.from(gen.suportes_).sort()) cabeca.push('import ' + s);

  const secoes = [cabeca];
  for (const nome of Object.keys(MB_PY_AUXILIARES)) if (gen.auxiliares_.has(nome)) secoes.push([MB_PY_AUXILIARES[nome]]);

  /* variáveis, preparos e o corpo de "no início" formam uma seção só */
  const corpoInicial = inicio.replace(/\n$/, '');

  /* Uma variável ganha o valor inicial no topo, para existir antes do primeiro uso. Se o próprio
     "no início" já começa dando valor a ela (primeira linha que a menciona, sem recuo), a linha
     do topo seria repetida: fica só a do "no início". */
  const jaComecaAtribuida = (nome) => {
    const primeira = corpoInicial.split('\n').find((l) => new RegExp('\\b' + nome + '\\b').test(l));
    const m = primeira && new RegExp('^' + nome + ' = (.*)$').exec(primeira);
    return !!m && !new RegExp('\\b' + nome + '\\b').test(m[1]);   // "x = x + 1" precisa do x já existindo
  };
  const vars = [];
  for (const [nome, v] of gen.variaveis_) {
    if (jaComecaAtribuida(nome)) continue;
    vars.push(nome + (v.tipo === 'String' ? ' = ""' : v.tipo === 'Boolean' ? ' = False' : v.tipo === 'Sprite' ? ' = None' : ' = 0'));
  }

  const bloco = vars.concat(Array.from(gen.preparos_.keys()), corpoInicial ? [corpoInicial] : []);
  if (bloco.length) secoes.push(bloco);
  if (temLaco) secoes.push(['while True:', laco.replace(/\n$/, '')]);

  return {
    codigo: secoes.map((s) => s.join('\n')).join('\n\n') + '\n',
    aviso: avisos.join(' ') || null,
    impossivel: gen.semPython_.size > 0,   // tem bloco sem equivalente em MicroPython: não dá para enviar
    suportes: Array.from(gen.suportes_).sort(),
  };
}
