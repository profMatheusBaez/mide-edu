/* ============================================================
 * blocos_lego_gen.js — Modo Blocos, placa LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Gerador Blockly → Python do Pybricks (MicroPython), API forBlock.
 *
 * Estrutura do programa gerado:
 *
 *   # Gerado pelo Modo Blocos — ...
 *   from pybricks.hubs import TechnicHub          ← só o que for usado,
 *   from pybricks.pupdevices import Motor            módulos em ordem fixa
 *   from pybricks.parameters import Port             (hubs, pupdevices,
 *   from pybricks.tools import wait                  parameters, tools)
 *
 *   hub = TechnicHub()                            ← um objeto por porta/
 *   motor_a = Motor(Port.A)                          dispositivo, na ordem
 *                                                    da 1ª aparição
 *   <blocos fora do "sempre">
 *
 *   while True:                                   ← corpo do "sempre"
 *       ...
 *       wait(10)                                  ← só se o corpo não tiver espera
 *
 * Determinismo (igual ao gerador C++): o mesmo conjunto de blocos gera
 * sempre o mesmo texto, byte a byte. Só Map/Array — nunca Object.keys
 * de objeto comum. Indentação de 4 espaços. Sem f-strings (o build do
 * Technic Hub é enxuto): usa print(a, b).
 * ============================================================ */
'use strict';

const geradorPybricks = new Blockly.Generator('Pybricks');

/* Precedência do Python (números menores ligam mais forte). */
geradorPybricks.ORDER_ATOMIC = 0;
geradorPybricks.ORDER_UNARY = 1;
geradorPybricks.ORDER_MULTIPLICATIVE = 2;
geradorPybricks.ORDER_ADDITIVE = 3;
geradorPybricks.ORDER_RELATIONAL = 4;
geradorPybricks.ORDER_LOGICAL_NOT = 5;
geradorPybricks.ORDER_LOGICAL_AND = 6;
geradorPybricks.ORDER_LOGICAL_OR = 7;
geradorPybricks.ORDER_NONE = 99;
geradorPybricks.INDENT = '    ';

/* Nomes que uma variável do aluno não pode usar (palavras do Python,
   funções do programa e nomes que o gerador cria). */
const LEGO_PALAVRAS_RESERVADAS = new Set((
  'False None True and as assert break class continue def del elif else except finally for from ' +
  'global if import in is lambda nonlocal not or pass raise return try while with yield print ' +
  'wait randint round range str int float abs min max len input SystemExit ' +
  'hub remote relogio Motor Port Direction Stop Color Button StopWatch TechnicHub Remote ' +
  'ColorDistanceSensor urandom pybricks ' +
  'motor_a motor_b motor_c motor_d sensor_a sensor_b sensor_c sensor_d'
).split(' '));

/* Ordem fixa das importações: módulo → nomes na ordem canônica. */
const LEGO_IMPORTACOES = [
  ['pybricks.hubs', ['TechnicHub']],
  ['pybricks.pupdevices', ['Motor', 'ColorDistanceSensor', 'Remote']],
  ['pybricks.parameters', ['Port', 'Direction', 'Stop', 'Color', 'Button']],
  ['pybricks.tools', ['wait', 'StopWatch']],
  ['urandom', ['randint']],
];

/* ------------------------------------------------------------
 * init / finish / scrub_
 * ---------------------------------------------------------- */
geradorPybricks.init = function (workspace) {
  Blockly.Generator.prototype.init.call(this);
  this.importacoes_ = new Set();     // "modulo:Nome" (a ordem de saída vem de LEGO_IMPORTACOES)
  this.objetos_ = new Map();         // hub, motor_a, remote, ... → linha de declaração
  this.variaveis_ = new Map();       // nome → linha "nome = 0"
  this.nomesVariaveis_ = new Map();  // id da variável do Blockly → nome Python
  this.nomesUsados_ = new Set();
  this.sentidos_ = new Map();        // porta → 'CLOCKWISE' | 'COUNTERCLOCKWISE'
  this.workspace_ = workspace;

  /* "motor A sentido positivo …" vale para o programa todo, onde quer que
     o bloco esteja: lido antes de gerar, para que a declaração do motor
     (que sai na 1ª aparição do motor) já saiba o sentido. O primeiro
     bloco de cada porta, na ordem do workspace, é o que vale. */
  for (const b of workspace.getAllBlocks(true)) {
    if (b.type === 'lego_motor_sentido' && b.isEnabled()) {
      const porta = b.getFieldValue('PORTA');
      if (!this.sentidos_.has(porta)) this.sentidos_.set(porta, b.getFieldValue('SENTIDO'));
    }
  }
};

geradorPybricks.finish = function (codigo) { return codigo; };

geradorPybricks.scrub_ = function (block, code, thisOnly) {
  const proximo = block.nextConnection && block.nextConnection.targetBlock();
  if (proximo && !thisOnly) return code + this.blockToCode(proximo);
  return code;
};

/* ------------------------------------------------------------
 * Registros deduplicados (Map/Set, primeira aparição)
 * ---------------------------------------------------------- */
geradorPybricks.usar = function (modulo, nome) {
  this.importacoes_.add(modulo + ':' + nome);
};

geradorPybricks.registrarObjeto = function (nome, linha) {
  if (!this.objetos_.has(nome)) this.objetos_.set(nome, linha);
  return nome;
};

geradorPybricks.hub = function () {
  this.usar('pybricks.hubs', 'TechnicHub');
  return this.registrarObjeto('hub', 'hub = TechnicHub()');
};

geradorPybricks.motor = function (porta) {
  const p = String(porta).toUpperCase();
  const nome = 'motor_' + p.toLowerCase();
  this.usar('pybricks.pupdevices', 'Motor');
  this.usar('pybricks.parameters', 'Port');
  const sentido = this.sentidos_.get(p);
  if (sentido) this.usar('pybricks.parameters', 'Direction');
  return this.registrarObjeto(nome,
    nome + ' = Motor(Port.' + p + (sentido ? ', Direction.' + sentido : '') + ')');
};

geradorPybricks.sensorCorDistancia = function (porta) {
  const p = String(porta).toUpperCase();
  const nome = 'sensor_' + p.toLowerCase();
  this.usar('pybricks.pupdevices', 'ColorDistanceSensor');
  this.usar('pybricks.parameters', 'Port');
  return this.registrarObjeto(nome, nome + ' = ColorDistanceSensor(Port.' + p + ')');
};

geradorPybricks.controle = function () {
  this.usar('pybricks.pupdevices', 'Remote');
  return this.registrarObjeto('remote', 'remote = Remote()');
};

geradorPybricks.cronometro = function () {
  this.usar('pybricks.tools', 'StopWatch');
  return this.registrarObjeto('relogio', 'relogio = StopWatch()');
};

geradorPybricks.cor = function (nome) {
  this.usar('pybricks.parameters', 'Color');
  return 'Color.' + nome;
};

/* Nome Python de uma variável do Blockly: ASCII, sem acento, sem colidir
   com palavras reservadas nem com outra variável (sufixo _2, _3…). */
geradorPybricks.nomeVariavel = function (id) {
  if (this.nomesVariaveis_.has(id)) return this.nomesVariaveis_.get(id);
  const modelo = this.workspace_.getVariableMap().getVariableById(id);
  let base = String(modelo ? modelo.getName() : 'item')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '_');
  if (!base || /^\d/.test(base)) base = 'v_' + base;
  let nome = base;
  let n = 2;
  while (LEGO_PALAVRAS_RESERVADAS.has(nome) || this.nomesUsados_.has(nome)) nome = base + '_' + n++;
  this.nomesUsados_.add(nome);
  this.nomesVariaveis_.set(id, nome);
  return nome;
};
geradorPybricks.garantirVariavel_ = function (nome, tipo) {
  if (!this.variaveis_.has(nome)) this.variaveis_.set(nome, nome + (tipo === 'String' ? ' = ""' : ' = 0'));
};
geradorPybricks.tipoVariavelDeBloco_ = function (blocoValor) {
  return blocoValor && (blocoValor.type === 'text' || blocoValor.type === 'operador_juntar') ? 'String' : 'int';
};

/* Corpo de um bloco composto (se, repita…): nunca vazio — o Python exige
   pelo menos um "pass". */
geradorPybricks.corpo_ = function (block, nome) {
  return this.statementToCode(block, nome) || (this.INDENT + 'pass\n');
};
const legoTemEspera = (texto) => /\bwait\(/.test(texto);

/* Um laço sem nenhuma espera deixa o hub sem responder ao Bluetooth:
   acrescenta wait(10) no fim (armadilha conhecida do plano §10). */
geradorPybricks.corpoDeLaco_ = function (block, nome) {
  let corpo = this.statementToCode(block, nome);
  if (!legoTemEspera(corpo)) {
    this.usar('pybricks.tools', 'wait');
    corpo += this.INDENT + 'wait(10)\n';
  }
  return corpo;
};

/* ============================================================
 * EVENTOS / CONTROLE
 * ============================================================ */
geradorPybricks.forBlock['evento_iniciar'] = function () { return ''; };
geradorPybricks.forBlock['controle_sempre'] = function () { return ''; }; /* tratado em blocosGerarPython */

geradorPybricks.forBlock['controle_espere_seg'] = function (block, gen) {
  gen.usar('pybricks.tools', 'wait');
  return 'wait(' + Math.round((Number(block.getFieldValue('SEG')) || 0) * 1000) + ')\n';
};
geradorPybricks.forBlock['controle_espere_ms'] = function (block, gen) {
  gen.usar('pybricks.tools', 'wait');
  return 'wait(' + Math.round(Number(block.getFieldValue('MS')) || 0) + ')\n';
};
geradorPybricks.forBlock['controle_repita_vezes'] = function (block, gen) {
  const vezes = Math.round(Number(block.getFieldValue('VEZES')) || 0);
  return 'for _ in range(' + vezes + '):\n' + gen.corpo_(block, 'DO');
};
geradorPybricks.forBlock['controle_repita_ate'] = function (block, gen) {
  const cond = gen.valueToCode(block, 'CONDICAO', gen.ORDER_NONE) || 'False';
  return 'while not (' + cond + '):\n' + gen.corpoDeLaco_(block, 'DO');
};
geradorPybricks.forBlock['controle_se'] = function (block, gen) {
  const cond = gen.valueToCode(block, 'CONDICAO', gen.ORDER_NONE) || 'False';
  return 'if ' + cond + ':\n' + gen.corpo_(block, 'DO');
};
geradorPybricks.forBlock['controle_se_senao'] = function (block, gen) {
  const cond = gen.valueToCode(block, 'CONDICAO', gen.ORDER_NONE) || 'False';
  return 'if ' + cond + ':\n' + gen.corpo_(block, 'DO') + 'else:\n' + gen.corpo_(block, 'SENAO');
};
geradorPybricks.forBlock['controle_pare'] = function () { return 'raise SystemExit\n'; };

/* ============================================================
 * OPERADORES
 * ============================================================ */
function _binopPy(sinal, ordem) {
  return function (block, gen) {
    const a = gen.valueToCode(block, 'A', ordem) || '0';
    const b = gen.valueToCode(block, 'B', ordem) || '0';
    return [a + ' ' + sinal + ' ' + b, ordem];
  };
}
geradorPybricks.forBlock['operador_soma'] = _binopPy('+', geradorPybricks.ORDER_ADDITIVE);
geradorPybricks.forBlock['operador_subtracao'] = _binopPy('-', geradorPybricks.ORDER_ADDITIVE);
geradorPybricks.forBlock['operador_multiplicacao'] = _binopPy('*', geradorPybricks.ORDER_MULTIPLICATIVE);
geradorPybricks.forBlock['operador_divisao'] = _binopPy('/', geradorPybricks.ORDER_MULTIPLICATIVE);
geradorPybricks.forBlock['operador_resto'] = _binopPy('%', geradorPybricks.ORDER_MULTIPLICATIVE);
geradorPybricks.forBlock['operador_maior'] = _binopPy('>', geradorPybricks.ORDER_RELATIONAL);
geradorPybricks.forBlock['operador_menor'] = _binopPy('<', geradorPybricks.ORDER_RELATIONAL);
geradorPybricks.forBlock['operador_igual'] = _binopPy('==', geradorPybricks.ORDER_RELATIONAL);
geradorPybricks.forBlock['operador_e'] = _binopPy('and', geradorPybricks.ORDER_LOGICAL_AND);
geradorPybricks.forBlock['operador_ou'] = _binopPy('or', geradorPybricks.ORDER_LOGICAL_OR);

geradorPybricks.forBlock['operador_aleatorio'] = function (block, gen) {
  gen.usar('urandom', 'randint');
  const de = gen.valueToCode(block, 'DE', gen.ORDER_NONE) || '0';
  const ate = gen.valueToCode(block, 'ATE', gen.ORDER_NONE) || '0';
  return ['randint(' + de + ', ' + ate + ')', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['operador_nao'] = function (block, gen) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_LOGICAL_NOT) || 'False';
  return ['not ' + a, gen.ORDER_LOGICAL_NOT];
};
geradorPybricks.forBlock['operador_juntar'] = function (block, gen) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '""';
  const b = gen.valueToCode(block, 'B', gen.ORDER_NONE) || '""';
  return ['str(' + a + ') + str(' + b + ')', gen.ORDER_ADDITIVE];
};
geradorPybricks.forBlock['operador_arredondar'] = function (block, gen) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '0';
  return ['round(' + a + ')', gen.ORDER_ATOMIC];
};

/* ---- blocos nativos usados como valor-padrão (shadow) ---- */
geradorPybricks.forBlock['math_number'] = function (block, gen) {
  const n = Number(block.getFieldValue('NUM'));
  if (n < 0) return ['-' + (-n), gen.ORDER_UNARY];
  return [String(n), gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['text'] = function (block, gen) {
  const t = String(block.getFieldValue('TEXT') || '')
    .replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return ['"' + t + '"', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['logic_boolean'] = function (block, gen) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'True' : 'False', gen.ORDER_ATOMIC];
};

/* ============================================================
 * VARIÁVEIS
 * ============================================================ */
geradorPybricks.forBlock['variables_get'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  gen.garantirVariavel_(nome, 'int');
  return [nome, gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['variables_set'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  const tipo = gen.tipoVariavelDeBloco_(block.getInputTargetBlock('VALUE'));
  gen.garantirVariavel_(nome, tipo);
  const valor = gen.valueToCode(block, 'VALUE', gen.ORDER_NONE) || (tipo === 'String' ? '""' : '0');
  return nome + ' = ' + valor + '\n';
};
geradorPybricks.forBlock['variaveis_somar'] = function (block, gen) {
  const nome = gen.nomeVariavel(block.getField('VAR').getValue());
  gen.garantirVariavel_(nome, 'int');
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || '0';
  return nome + ' += ' + valor + '\n';
};

/* ============================================================
 * MOTORES
 * ============================================================ */
function _entradaNum(gen, block, nome) { return gen.valueToCode(block, nome, gen.ORDER_NONE) || '0'; }

geradorPybricks.forBlock['lego_motor_girar'] = function (block, gen) {
  const m = gen.motor(block.getFieldValue('PORTA'));
  return m + '.run(' + _entradaNum(gen, block, 'VEL') + ')\n';
};
geradorPybricks.forBlock['lego_motor_girar_graus'] = function (block, gen) {
  const m = gen.motor(block.getFieldValue('PORTA'));
  return m + '.run_angle(' + _entradaNum(gen, block, 'VEL') + ', ' + _entradaNum(gen, block, 'GRAUS') + ')\n';
};
geradorPybricks.forBlock['lego_motor_ir_ate'] = function (block, gen) {
  const m = gen.motor(block.getFieldValue('PORTA'));
  return m + '.run_target(' + _entradaNum(gen, block, 'VEL') + ', ' + _entradaNum(gen, block, 'ALVO') + ')\n';
};
geradorPybricks.forBlock['lego_motor_girar_tempo'] = function (block, gen) {
  const m = gen.motor(block.getFieldValue('PORTA'));
  return m + '.run_time(' + _entradaNum(gen, block, 'VEL') + ', ' + _entradaNum(gen, block, 'TEMPO') + ')\n';
};
geradorPybricks.forBlock['lego_motor_potencia'] = function (block, gen) {
  const m = gen.motor(block.getFieldValue('PORTA'));
  return m + '.dc(' + _entradaNum(gen, block, 'POTENCIA') + ')\n';
};
geradorPybricks.forBlock['lego_motor_parar'] = function (block, gen) {
  const m = gen.motor(block.getFieldValue('PORTA'));
  const metodo = { STOP: 'stop', BRAKE: 'brake', HOLD: 'hold' }[block.getFieldValue('MODO')] || 'stop';
  return m + '.' + metodo + '()\n';
};
geradorPybricks.forBlock['lego_motor_zerar'] = function (block, gen) {
  return gen.motor(block.getFieldValue('PORTA')) + '.reset_angle(0)\n';
};
geradorPybricks.forBlock['lego_motor_sentido'] = function (block, gen) {
  gen.motor(block.getFieldValue('PORTA'));   /* garante a declaração, com o sentido */
  return '';
};
geradorPybricks.forBlock['lego_motor_angulo'] = function (block, gen) {
  return [gen.motor(block.getFieldValue('PORTA')) + '.angle()', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['lego_motor_velocidade'] = function (block, gen) {
  return [gen.motor(block.getFieldValue('PORTA')) + '.speed()', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['lego_motor_travado'] = function (block, gen) {
  return [gen.motor(block.getFieldValue('PORTA')) + '.stalled()', gen.ORDER_ATOMIC];
};

/* ============================================================
 * HUB
 * ============================================================ */
geradorPybricks.forBlock['lego_hub_luz'] = function (block, gen) {
  const h = gen.hub();
  return h + '.light.on(' + gen.cor(block.getFieldValue('COR')) + ')\n';
};
geradorPybricks.forBlock['lego_hub_luz_apagar'] = function (block, gen) {
  return gen.hub() + '.light.off()\n';
};
geradorPybricks.forBlock['lego_hub_inclinacao'] = function (block, gen) {
  const eixo = block.getFieldValue('EIXO') === '1' ? '1' : '0';
  return [gen.hub() + '.imu.tilt()[' + eixo + ']', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['lego_hub_direcao'] = function (block, gen) {
  return [gen.hub() + '.imu.heading()', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['lego_hub_bateria'] = function (block, gen) {
  return [gen.hub() + '.battery.voltage()', gen.ORDER_ATOMIC];
};

/* ============================================================
 * CONTROLE REMOTO
 * ============================================================ */
geradorPybricks.forBlock['lego_remoto_conectar'] = function (block, gen) {
  gen.controle();
  return '';
};
geradorPybricks.forBlock['lego_remoto_botao'] = function (block, gen) {
  const r = gen.controle();
  gen.usar('pybricks.parameters', 'Button');
  return ['Button.' + block.getFieldValue('BOTAO') + ' in ' + r + '.buttons.pressed()', gen.ORDER_RELATIONAL];
};
geradorPybricks.forBlock['lego_remoto_luz'] = function (block, gen) {
  const r = gen.controle();
  return r + '.light.on(' + gen.cor(block.getFieldValue('COR')) + ')\n';
};

/* ============================================================
 * TEMPO / SAÍDA / SENSOR
 * ============================================================ */
geradorPybricks.forBlock['lego_tempo_zerar'] = function (block, gen) {
  return gen.cronometro() + '.reset()\n';
};
geradorPybricks.forBlock['lego_tempo_ler'] = function (block, gen) {
  return [gen.cronometro() + '.time()', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['lego_monitor_escrever'] = function (block, gen) {
  const texto = gen.valueToCode(block, 'TEXTO', gen.ORDER_NONE) || '""';
  return 'print(' + texto + ')\n';
};
geradorPybricks.forBlock['lego_sensor_distancia'] = function (block, gen) {
  return [gen.sensorCorDistancia(block.getFieldValue('PORTA')) + '.distance()', gen.ORDER_ATOMIC];
};
geradorPybricks.forBlock['lego_sensor_cor'] = function (block, gen) {
  return [gen.sensorCorDistancia(block.getFieldValue('PORTA')) + '.color()', gen.ORDER_ATOMIC];
};

/* ============================================================
 * Montagem do programa completo
 * ============================================================ */
function blocosGerarPython(workspace) {
  const gen = geradorPybricks;
  gen.init(workspace);

  const hats = workspace.getTopBlocks(true)
    .filter((b) => b.type === 'evento_iniciar' && b.isEnabled());
  if (!hats.length) {
    gen.finish('');
    return { codigo: '', aviso: 'Arraste o bloco "quando ⚑ for clicado" para começar.' };
  }
  const hat = hats[0];

  let inicio = '';
  let laco = null;
  let bloco = hat.getNextBlock();
  while (bloco) {
    if (bloco.type === 'controle_sempre' && laco === null) {
      laco = gen.corpoDeLaco_(bloco, 'DO');
    } else if (bloco.isEnabled()) {
      const trecho = gen.blockToCode(bloco, true);
      inicio += (typeof trecho === 'string' ? trecho : trecho[0]);
    }
    bloco = bloco.getNextBlock();
  }

  const secoes = [];
  secoes.push(['# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)']);

  const importacoes = [];
  for (const [modulo, nomes] of LEGO_IMPORTACOES) {
    const usados = nomes.filter((n) => gen.importacoes_.has(modulo + ':' + n));
    if (usados.length) importacoes.push('from ' + modulo + ' import ' + usados.join(', '));
  }
  secoes[0].push(...importacoes);

  if (gen.objetos_.size) secoes.push(Array.from(gen.objetos_.values()));
  if (gen.variaveis_.size) secoes.push(Array.from(gen.variaveis_.values()));
  if (inicio) secoes.push([inicio.replace(/\n$/, '')]);
  if (laco !== null) secoes.push(['while True:', laco.replace(/\n$/, '')]);

  return {
    codigo: secoes.map((s) => s.join('\n')).join('\n\n') + '\n',
    aviso: hats.length > 1 ? 'Há mais de um bloco "quando ⚑ for clicado" — só o primeiro é usado.' : null,
  };
}
