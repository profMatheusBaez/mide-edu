/* ============================================================
 * blocos_gen.js — MIDE EDU, Modo Blocos
 * ------------------------------------------------------------
 * Gerador Blockly → C++ (sketch .ino do Arduino). API moderna do
 * Blockly (forBlock), ver PLANO-modo-blocos.md §7.
 *
 * Determinismo (obrigatório, §7 "Ordem determinística"): o mesmo
 * conjunto de blocos deve gerar sempre o mesmo texto, byte a
 * byte.
 *   (a) pinMode() sai na ordem da primeira aparição do pino no
 *       percurso top-down/left-right do workspace — como o
 *       Blockly percorre a pilha na ordem visual de conexão e
 *       cada registro em setups_/globais_/etc. é feito na hora em
 *       que o bloco é visitado, isso sai de graça: usamos Map()
 *       (preserva ordem de inserção) e SÓ registramos na primeira
 *       vez (chave já existente não é sobrescrita nem reordenada).
 *   (b) nunca iterar Object.keys de objeto comum — só Map/Array.
 * ============================================================ */
'use strict';

const geradorArduino = new Blockly.Generator('Arduino');

/* Tabela de precedência C++ (estilo legado do Blockly, citado no
   plano §7: geradorArduino.ORDER_ATOMIC = 0; ...). */
geradorArduino.ORDER_ATOMIC = 0;
geradorArduino.ORDER_UNARY = 1;
geradorArduino.ORDER_MULTIPLICATIVE = 2;
geradorArduino.ORDER_ADDITIVE = 3;
geradorArduino.ORDER_RELATIONAL = 4;
geradorArduino.ORDER_LOGICAL_AND = 5;
geradorArduino.ORDER_LOGICAL_OR = 6;
geradorArduino.ORDER_ASSIGNMENT = 7;
geradorArduino.ORDER_NONE = 99;

geradorArduino.INDENT = '  '; /* indentação de 2 espaços — plano §7 "Formatação" */

/* Frequências das notas (4ª oitava) para o bloco de buzzer por nota. */
const BLOCOS_NOTA_FREQ = { DO: 262, RE: 294, MI: 330, FA: 349, SOL: 392, LA: 440, SI: 494 };

/* Padrão de segmentos a,b,c,d,e,f,g (cátodo comum, 1=acende) para
 * os pinos 2..9 (DP sempre apagado aqui) — confirmado em js/dados.js
 * (fases d7_*): 2=a 3=b 4=c 5=d 6=e 7=f 8=g 9=DP. */
const BLOCOS_7SEG_DIGITOS = [
  [1, 1, 1, 1, 1, 1, 0], // 0
  [0, 1, 1, 0, 0, 0, 0], // 1
  [1, 1, 0, 1, 1, 0, 1], // 2
  [1, 1, 1, 1, 0, 0, 1], // 3
  [0, 1, 1, 0, 0, 1, 1], // 4
  [1, 0, 1, 1, 0, 1, 1], // 5
  [1, 0, 1, 1, 1, 1, 1], // 6
  [1, 1, 1, 0, 0, 0, 0], // 7
  [1, 1, 1, 1, 1, 1, 1], // 8
  [1, 1, 1, 1, 0, 1, 1], // 9
];

/* ------------------------------------------------------------
 * init / finish / scrub_ — ciclo de vida do Blockly.Generator
 * ---------------------------------------------------------- */
geradorArduino.init = function (workspace) {
  Blockly.Generator.prototype.init.call(this);
  /* a classe base não monta nameDB_ sozinha (isso é feito por cada
     gerador concreto no Blockly oficial) — sem isto,
     getVariableName()/getName() falham com "Name database is not
     defined". */
  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }
  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.includes_ = new Map();
  this.defines_ = new Map();
  this.globais_ = new Map();
  this.funcoes_ = new Map();
  this.setups_ = new Map();
};

geradorArduino.finish = function (code) {
  return code;
};

/* thisOnly (2º parâmetro do blockToCode) decide se encadeia o
 * próximo bloco — em blocosGerarSketch() sempre percorremos a
 * cadeia manualmente, então nunca pedimos o encadeamento aqui;
 * scrub_ ainda é necessário para statementToCode() (usado dentro
 * de "sempre", "repita", "se", etc.) funcionar corretamente. */
geradorArduino.scrub_ = function (block, code, thisOnly) {
  const proximo = block.nextConnection && block.nextConnection.targetBlock();
  if (proximo && !thisOnly) return code + this.blockToCode(proximo);
  return code;
};

/* ------------------------------------------------------------
 * Registro deduplicado (Map, nunca objeto comum — regra (b) acima)
 * ---------------------------------------------------------- */
geradorArduino.registrarInclude = function (nome) {
  if (!this.includes_.has(nome)) this.includes_.set(nome, '#include <' + nome + '>');
};
geradorArduino.registrarDefine = function (chave, linha) {
  if (!this.defines_.has(chave)) this.defines_.set(chave, linha);
};
geradorArduino.registrarGlobal = function (chave, linha) {
  if (!this.globais_.has(chave)) this.globais_.set(chave, linha);
};
geradorArduino.registrarFuncao = function (chave, linhas) {
  if (!this.funcoes_.has(chave)) this.funcoes_.set(chave, linhas);
};
geradorArduino.registrarSetup = function (chave, linha) {
  if (!this.setups_.has(chave)) this.setups_.set(chave, linha);
};
/* pinMode inferido: uma entrada por pino, na ordem da primeira
 * aparição — repetir o mesmo pino (mesmo com outro modo) não
 * reordena nem sobrescreve (regra (a) acima). */
geradorArduino.registrarPinMode = function (pino, modo) {
  this.registrarSetup('pinMode:' + pino, 'pinMode(' + pino + ', ' + modo + ');');
};

geradorArduino.registrarFuncaoDistancia = function () {
  this.registrarFuncao('distanciaCM',
    'long distanciaCM(int trig, int echo) {\n' +
    '  digitalWrite(trig, LOW);\n' +
    '  delayMicroseconds(2);\n' +
    '  digitalWrite(trig, HIGH);\n' +
    '  delayMicroseconds(10);\n' +
    '  digitalWrite(trig, LOW);\n' +
    '  long duracao = pulseIn(echo, HIGH);\n' +
    '  return duracao / 29 / 2;\n' +
    '}');
};

geradorArduino.registrarFuncaoDigito = function () {
  const linhasTabela = BLOCOS_7SEG_DIGITOS
    .map((d) => '  {' + d.join(', ') + '}')
    .join(',\n');
  this.registrarGlobal('digitosTabela',
    'const int PINOS_7SEG[7] = {2, 3, 4, 5, 6, 7, 8};\n' +
    'const int DIGITOS_7SEG[10][7] = {\n' + linhasTabela + '\n};');
  this.registrarFuncao('mostrarDigito',
    'void mostrarDigito(int n) {\n' +
    '  for (int i = 0; i < 7; i++) {\n' +
    '    digitalWrite(PINOS_7SEG[i], DIGITOS_7SEG[n][i]);\n' +
    '  }\n' +
    '}');
  for (const p of [2, 3, 4, 5, 6, 7, 8, 9]) this.registrarPinMode(String(p), 'OUTPUT');
};

/* Tipo inferido de uma variável a partir do bloco ligado à sua
 * primeira atribuição — int por padrão, String se o valor vier de
 * texto/concatenação (plano §6.4). */
geradorArduino.tipoVariavelDeBloco_ = function (blocoValor) {
  if (blocoValor && (blocoValor.type === 'text' || blocoValor.type === 'operador_juntar')) return 'String';
  return 'int';
};
geradorArduino.garantirVariavelGlobal_ = function (nome, tipo) {
  this.registrarGlobal('var:' + nome, tipo + ' ' + nome + (tipo === 'String' ? ' = "";' : ' = 0;'));
};

/* ============================================================
 * EVENTOS / CONTROLE
 * ============================================================ */
geradorArduino.forBlock['evento_iniciar'] = function () { return ''; };
geradorArduino.forBlock['controle_sempre'] = function () { return ''; }; /* tratado à parte em blocosGerarSketch */

geradorArduino.forBlock['controle_espere_seg'] = function (block) {
  const seg = Number(block.getFieldValue('SEG')) || 0;
  return 'delay(' + Math.round(seg * 1000) + ');\n';
};
geradorArduino.forBlock['controle_espere_ms'] = function (block) {
  const ms = Math.round(Number(block.getFieldValue('MS')) || 0);
  return 'delay(' + ms + ');\n';
};
geradorArduino.forBlock['controle_repita_vezes'] = function (block, gen) {
  const vezes = Math.round(Number(block.getFieldValue('VEZES')) || 0);
  const corpo = gen.statementToCode(block, 'DO');
  return 'for (int i = 0; i < ' + vezes + '; i++) {\n' + corpo + '}\n';
};
geradorArduino.forBlock['controle_repita_ate'] = function (block, gen) {
  const cond = gen.valueToCode(block, 'CONDICAO', gen.ORDER_NONE) || 'false';
  const corpo = gen.statementToCode(block, 'DO');
  return 'while (!(' + cond + ')) {\n' + corpo + '}\n';
};
geradorArduino.forBlock['controle_se'] = function (block, gen) {
  const cond = gen.valueToCode(block, 'CONDICAO', gen.ORDER_NONE) || 'false';
  const corpo = gen.statementToCode(block, 'DO');
  return 'if (' + cond + ') {\n' + corpo + '}\n';
};
geradorArduino.forBlock['controle_se_senao'] = function (block, gen) {
  const cond = gen.valueToCode(block, 'CONDICAO', gen.ORDER_NONE) || 'false';
  const corpoSe = gen.statementToCode(block, 'DO');
  const corpoSenao = gen.statementToCode(block, 'SENAO');
  return 'if (' + cond + ') {\n' + corpoSe + '} else {\n' + corpoSenao + '}\n';
};
geradorArduino.forBlock['controle_pare'] = function () { return 'return;\n'; };

/* ============================================================
 * OPERADORES
 * ============================================================ */
function _binop(sinal, ordem) {
  return function (block, gen) {
    const a = gen.valueToCode(block, 'A', ordem) || '0';
    const b = gen.valueToCode(block, 'B', ordem) || '0';
    return [a + ' ' + sinal + ' ' + b, ordem];
  };
}
geradorArduino.forBlock['operador_soma'] = _binop('+', geradorArduino.ORDER_ADDITIVE);
geradorArduino.forBlock['operador_subtracao'] = _binop('-', geradorArduino.ORDER_ADDITIVE);
geradorArduino.forBlock['operador_multiplicacao'] = _binop('*', geradorArduino.ORDER_MULTIPLICATIVE);
geradorArduino.forBlock['operador_divisao'] = _binop('/', geradorArduino.ORDER_MULTIPLICATIVE);
geradorArduino.forBlock['operador_resto'] = _binop('%', geradorArduino.ORDER_MULTIPLICATIVE);
geradorArduino.forBlock['operador_maior'] = _binop('>', geradorArduino.ORDER_RELATIONAL);
geradorArduino.forBlock['operador_menor'] = _binop('<', geradorArduino.ORDER_RELATIONAL);
geradorArduino.forBlock['operador_igual'] = _binop('==', geradorArduino.ORDER_RELATIONAL);
geradorArduino.forBlock['operador_e'] = _binop('&&', geradorArduino.ORDER_LOGICAL_AND);
geradorArduino.forBlock['operador_ou'] = _binop('||', geradorArduino.ORDER_LOGICAL_OR);

geradorArduino.forBlock['operador_aleatorio'] = function (block, gen) {
  const de = gen.valueToCode(block, 'DE', gen.ORDER_NONE) || '0';
  const ate = gen.valueToCode(block, 'ATE', gen.ORDER_NONE) || '0';
  return ['random(' + de + ', (' + ate + ') + 1)', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['operador_nao'] = function (block, gen) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_UNARY) || 'false';
  return ['!(' + a + ')', gen.ORDER_UNARY];
};
geradorArduino.forBlock['operador_juntar'] = function (block, gen) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '""';
  const b = gen.valueToCode(block, 'B', gen.ORDER_NONE) || '""';
  return ['(String(' + a + ') + String(' + b + '))', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['operador_arredondar'] = function (block, gen) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '0';
  return ['round(' + a + ')', gen.ORDER_ATOMIC];
};

/* ============================================================
 * BLOCOS NATIVOS USADOS COMO VALOR-PADRÃO (shadow) NAS ENTRADAS:
 * math_number, text e logic_boolean vêm prontos no Blockly, mas
 * cada gerador precisa da sua própria tradução para código —
 * aqui a versão C++/Arduino.
 * ============================================================ */
geradorArduino.forBlock['math_number'] = function (block, gen) {
  const n = Number(block.getFieldValue('NUM'));
  if (n < 0) return ['-' + (-n), gen.ORDER_UNARY];
  return [String(n), gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['text'] = function (block, gen) {
  const t = String(block.getFieldValue('TEXT') || '');
  return ['"' + t.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['logic_boolean'] = function (block, gen) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', gen.ORDER_ATOMIC];
};

/* ============================================================
 * VARIÁVEIS (variables_get / variables_set nativos + somar)
 * ============================================================ */
geradorArduino.forBlock['variables_get'] = function (block, gen) {
  const nome = gen.getVariableName(block.getFieldValue('VAR'));
  gen.garantirVariavelGlobal_(nome, 'int');
  return [nome, gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['variables_set'] = function (block, gen) {
  const nome = gen.getVariableName(block.getFieldValue('VAR'));
  const alvo = block.getInputTargetBlock('VALUE');
  const tipo = gen.tipoVariavelDeBloco_(alvo);
  gen.garantirVariavelGlobal_(nome, tipo);
  const valor = gen.valueToCode(block, 'VALUE', gen.ORDER_NONE) || (tipo === 'String' ? '""' : '0');
  return nome + ' = ' + valor + ';\n';
};
geradorArduino.forBlock['variaveis_somar'] = function (block, gen) {
  const nome = gen.getVariableName(block.getFieldValue('VAR'));
  gen.garantirVariavelGlobal_(nome, 'int');
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || '0';
  return nome + ' += ' + valor + ';\n';
};

/* ============================================================
 * ARDUINO (pinos)
 * ============================================================ */
geradorArduino.forBlock['arduino_pino_digital_saida'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  const estado = block.getFieldValue('ESTADO');
  gen.registrarPinMode(pino, 'OUTPUT');
  return 'digitalWrite(' + pino + ', ' + estado + ');\n';
};
geradorArduino.forBlock['arduino_pino_digital_entrada'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  gen.registrarPinMode(pino, 'INPUT');
  return ['digitalRead(' + pino + ')', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['arduino_pino_analogico_ler'] = function (block, gen) {
  return ['analogRead(' + block.getFieldValue('PINO') + ')', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['arduino_pino_pwm'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  gen.registrarPinMode(pino, 'OUTPUT');
  const valor = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || '0';
  return 'analogWrite(' + pino + ', ' + valor + ');\n';
};
geradorArduino.forBlock['arduino_pino_modo'] = function (block, gen) {
  gen.registrarPinMode(block.getFieldValue('PINO'), block.getFieldValue('MODO'));
  return '';
};

/* ============================================================
 * ATUADORES
 * ============================================================ */
geradorArduino.forBlock['atuadores_servo'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  gen.registrarInclude('Servo.h');
  const objeto = 'servo' + pino;
  gen.registrarGlobal('servo:' + pino, 'Servo ' + objeto + ';');
  gen.registrarSetup('servoAttach:' + pino, objeto + '.attach(' + pino + ');');
  const angulo = gen.valueToCode(block, 'ANGULO', gen.ORDER_NONE) || '0';
  return objeto + '.write(' + angulo + ');\n';
};
geradorArduino.forBlock['atuadores_buzzer_freq'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  const freq = gen.valueToCode(block, 'FREQ', gen.ORDER_NONE) || '0';
  const dur = gen.valueToCode(block, 'DUR', gen.ORDER_NONE) || '0';
  return 'tone(' + pino + ', ' + freq + ', ' + dur + ');\n';
};
geradorArduino.forBlock['atuadores_buzzer_nota'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  const nota = block.getFieldValue('NOTA');
  const dur = gen.valueToCode(block, 'DUR', gen.ORDER_NONE) || '0';
  const nomeDefine = 'NOTA_' + nota;
  gen.registrarDefine(nomeDefine, '#define ' + nomeDefine + ' ' + (BLOCOS_NOTA_FREQ[nota] || 440));
  return 'tone(' + pino + ', ' + nomeDefine + ', ' + dur + ');\n';
};
geradorArduino.forBlock['atuadores_buzzer_parar'] = function (block) {
  return 'noTone(' + block.getFieldValue('PINO') + ');\n';
};

/* ============================================================
 * SENSORES
 * ============================================================ */
geradorArduino.forBlock['sensores_distancia'] = function (block, gen) {
  const trig = block.getFieldValue('TRIG');
  const eco = block.getFieldValue('ECO');
  gen.registrarPinMode(trig, 'OUTPUT');
  gen.registrarPinMode(eco, 'INPUT');
  gen.registrarFuncaoDistancia();
  return ['distanciaCM(' + trig + ', ' + eco + ')', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['sensores_botao'] = function (block, gen) {
  const pino = block.getFieldValue('PINO');
  gen.registrarPinMode(pino, 'INPUT');
  return ['digitalRead(' + pino + ') == HIGH', gen.ORDER_RELATIONAL];
};
geradorArduino.forBlock['sensores_potenciometro'] = function (block, gen) {
  return ['analogRead(' + block.getFieldValue('PINO') + ')', gen.ORDER_ATOMIC];
};
geradorArduino.forBlock['sensores_mapear'] = function (block, gen) {
  const v = gen.valueToCode(block, 'VALOR', gen.ORDER_NONE) || '0';
  const deMin = gen.valueToCode(block, 'DE_MIN', gen.ORDER_NONE) || '0';
  const deMax = gen.valueToCode(block, 'DE_MAX', gen.ORDER_NONE) || '0';
  const paraMin = gen.valueToCode(block, 'PARA_MIN', gen.ORDER_NONE) || '0';
  const paraMax = gen.valueToCode(block, 'PARA_MAX', gen.ORDER_NONE) || '0';
  return ['map(' + v + ', ' + deMin + ', ' + deMax + ', ' + paraMin + ', ' + paraMax + ')', gen.ORDER_ATOMIC];
};

/* ============================================================
 * DISPLAY
 * ============================================================ */
geradorArduino.forBlock['display_lcd_iniciar'] = function (block, gen) {
  const endereco = block.getFieldValue('ENDERECO');
  gen.registrarInclude('Wire.h');
  gen.registrarInclude('LiquidCrystal_I2C.h');
  gen.registrarGlobal('lcd', 'LiquidCrystal_I2C lcd(' + endereco + ', 16, 2);');
  gen.registrarSetup('lcdInit', 'lcd.init();');
  gen.registrarSetup('lcdBacklight', 'lcd.backlight();');
  return '';
};
geradorArduino.forBlock['display_lcd_escrever'] = function (block, gen) {
  const texto = gen.valueToCode(block, 'TEXTO', gen.ORDER_NONE) || '""';
  const linha = block.getFieldValue('LINHA');
  const coluna = gen.valueToCode(block, 'COLUNA', gen.ORDER_NONE) || '0';
  return 'lcd.setCursor(' + coluna + ', ' + linha + ');\n' + 'lcd.print(' + texto + ');\n';
};
geradorArduino.forBlock['display_lcd_limpar'] = function () { return 'lcd.clear();\n'; };

geradorArduino.forBlock['display_7seg_mostrar'] = function (block, gen) {
  gen.registrarFuncaoDigito();
  const digito = gen.valueToCode(block, 'DIGITO', gen.ORDER_NONE) || '0';
  return 'mostrarDigito(' + digito + ');\n';
};
geradorArduino.forBlock['display_7seg_apagar'] = function (block, gen) {
  for (const p of [2, 3, 4, 5, 6, 7, 8, 9]) gen.registrarPinMode(String(p), 'OUTPUT');
  return [2, 3, 4, 5, 6, 7, 8, 9].map((p) => 'digitalWrite(' + p + ', LOW);').join('\n') + '\n';
};

/* ============================================================
 * MONITOR SERIAL
 * ============================================================ */
geradorArduino.forBlock['serial_iniciar'] = function (block, gen) {
  gen.registrarSetup('serialBegin', 'Serial.begin(' + block.getFieldValue('BAUD') + ');');
  return '';
};
geradorArduino.forBlock['serial_escrever_linha'] = function (block, gen) {
  const texto = gen.valueToCode(block, 'TEXTO', gen.ORDER_NONE) || '""';
  return 'Serial.println(' + texto + ');\n';
};
geradorArduino.forBlock['serial_escrever'] = function (block, gen) {
  const texto = gen.valueToCode(block, 'TEXTO', gen.ORDER_NONE) || '""';
  return 'Serial.print(' + texto + ');\n';
};

/* ============================================================
 * Montagem do sketch completo — estrutura fixa (plano §7):
 *   cabeçalho / includes_ / defines_ / globais_ / funcoes_ /
 *   setup() (setups_ + resto da pilha fora do "sempre") / loop()
 *   (corpo do "sempre").
 * ============================================================ */
function blocosGerarSketch(workspace) {
  const gen = geradorArduino;
  gen.init(workspace);

  const hats = workspace.getTopBlocks(true)
    .filter((b) => b.type === 'evento_iniciar' && b.isEnabled());
  if (!hats.length) {
    gen.finish('');
    return { codigo: '', aviso: 'Arraste o bloco "quando ⚑ for clicado" para começar.' };
  }
  const hat = hats[0];

  let setupExtra = '';
  let loopCorpo = '';
  let achouSempre = false;
  let bloco = hat.getNextBlock();
  while (bloco) {
    if (bloco.type === 'controle_sempre' && !achouSempre) {
      achouSempre = true;
      loopCorpo += gen.statementToCode(bloco, 'DO');
    } else if (bloco.isEnabled()) {
      const trecho = gen.blockToCode(bloco, true);
      setupExtra += (typeof trecho === 'string' ? trecho : trecho[0]);
    }
    bloco = bloco.getNextBlock();
  }

  const linhas = [];
  linhas.push('// Gerado pelo Modo Blocos — MIDE EDU');
  for (const inc of gen.includes_.values()) linhas.push(inc);
  if (gen.includes_.size) linhas.push('');
  for (const def of gen.defines_.values()) linhas.push(def);
  if (gen.defines_.size) linhas.push('');
  for (const g of gen.globais_.values()) linhas.push(g);
  if (gen.globais_.size) linhas.push('');
  for (const f of gen.funcoes_.values()) { linhas.push(f); linhas.push(''); }

  const corpoSetups = Array.from(gen.setups_.values()).join('\n');
  const corpoSetupCompleto = (corpoSetups ? corpoSetups + '\n' : '') + setupExtra;
  linhas.push('void setup() {');
  linhas.push(gen.prefixLines(corpoSetupCompleto.replace(/\n$/, ''), gen.INDENT));
  linhas.push('}');
  linhas.push('');
  linhas.push('void loop() {');
  linhas.push(loopCorpo ? gen.prefixLines(loopCorpo.replace(/\n$/, ''), '') : '');
  linhas.push('}');
  linhas.push('');

  return { codigo: linhas.join('\n'), aviso: hats.length > 1 ? 'Há mais de um bloco "quando ⚑ for clicado" — só o primeiro é usado.' : null };
}
