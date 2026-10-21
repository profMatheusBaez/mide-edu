/* ============================================================
 * blocos_defs.js — MIDE EDU, Modo Blocos
 * ------------------------------------------------------------
 * Definição de todos os blocos (Blockly.defineBlocksWithJsonArray).
 * Blockly 13.3.0 (vendorizado em js/vendor/blockly/).
 *
 * Escopo fechado: Eventos, Controle, Operadores, Variáveis,
 * Arduino, Atuadores, Sensores, Display, Monitor Serial.
 * Ver PLANO-modo-blocos.md §6 para o catálogo completo.
 * ============================================================ */
'use strict';

/* Ícone da bandeira verde (bloco chapéu "Quando ⚑ for clicado"),
   SVG inline em data URI — sem dependência externa. */
const BLOCOS_ICONE_BANDEIRA =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB4PSIyLjIiIHk9IjEiIHdpZHRoPSIxLjYiIGhlaWdodD0iMTgiIHJ4PSIwLjQiIGZpbGw9IiM0NTQ5M0UiLz48cGF0aCBkPSJNMy44IDIuMiBMMTcgMi4yIEwxMy42IDYuNiBMMTcgMTEgTDMuOCAxMSBaIiBmaWxsPSIjNENCRjU2IiBzdHJva2U9IiMzODk0MzgiIHN0cm9rZS13aWR0aD0iMC43IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+Cg==';

/* ------------------------------------------------------------
 * Menus de pino — a mesma bancada em todos os blocos que pedem
 * um pino. Formato pedido no plano (§6.5): pinos da bancada em
 * destaque primeiro, com rótulo do componente; os demais depois,
 * sem rótulo. O valor gerado é sempre só o número/identificador.
 * ---------------------------------------------------------- */
const BLOCOS_PINOS_DIGITAIS = [
  ['12 (LED verde)', '12'],
  ['11 (LED amarelo ~)', '11'],
  ['10 (LED vermelho)', '10'],
  ['2 (botão 1)', '2'],
  ['3 (botão 2)', '3'],
  ['5 (buzzer ~)', '5'],
  ['6 (trig)', '6'],
  ['7 (echo)', '7'],
  ['0', '0'], ['1', '1'], ['4', '4'], ['8', '8'], ['9', '9'], ['13', '13'],
];

const BLOCOS_PINOS_PWM = [
  ['11 (LED amarelo ~)', '11'],
  ['5 (buzzer ~)', '5'],
  ['3', '3'], ['6 (trig)', '6'], ['9', '9'], ['10 (LED vermelho)', '10'],
];

const BLOCOS_PINOS_ANALOGICOS = [
  ['A0 (potenciômetro)', 'A0'],
  ['A1', 'A1'], ['A2', 'A2'], ['A3', 'A3'], ['A4', 'A4'], ['A5', 'A5'],
];

/* ------------------------------------------------------------
 * Definições JSON
 * ---------------------------------------------------------- */
const BLOCOS_DEFINICOES = [

  /* ============ EVENTOS — #FFBF00 ============ */
  {
    type: 'evento_iniciar',
    message0: 'quando %1 for clicado',
    args0: [{ type: 'field_image', src: BLOCOS_ICONE_BANDEIRA, width: 16, height: 16, alt: 'bandeira' }],
    nextStatement: null,
    style: 'eventos_blocks',
    tooltip: 'Os blocos ligados aqui rodam uma vez, quando o programa começa (no Arduino, é o setup()).',
    helpUrl: '',
  },

  /* ============ CONTROLE — #FFAB19 ============ */
  {
    type: 'controle_sempre',
    message0: 'sempre %1 %2',
    args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    style: 'controle_blocks',
    tooltip: 'O que estiver aqui dentro roda sem parar (no Arduino, é o loop()). Só pode haver um "sempre" por pilha.',
  },
  {
    type: 'controle_espere_seg',
    message0: 'esperar %1 segundos',
    args0: [{ type: 'field_number', name: 'SEG', value: 1, min: 0 }],
    previousStatement: null,
    nextStatement: null,
    style: 'controle_blocks',
    tooltip: 'Pausa o programa pelo tempo indicado, em segundos.',
  },
  {
    type: 'controle_espere_ms',
    message0: 'esperar %1 milissegundos',
    args0: [{ type: 'field_number', name: 'MS', value: 500, min: 0, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    style: 'controle_blocks',
    tooltip: 'Pausa o programa pelo tempo indicado, em milissegundos.',
  },
  {
    type: 'controle_repita_vezes',
    message0: 'repita %1 vezes %2 %3',
    args0: [
      { type: 'field_number', name: 'VEZES', value: 10, min: 0, precision: 1 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'controle_blocks',
    tooltip: 'Repete os blocos de dentro o número de vezes indicado.',
  },
  {
    type: 'controle_repita_ate',
    message0: 'repita até que %1 %2 %3',
    args0: [
      { type: 'input_value', name: 'CONDICAO', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'controle_blocks',
    tooltip: 'Repete os blocos de dentro até a condição ficar verdadeira.',
  },
  {
    type: 'controle_se',
    message0: 'se %1 então %2 %3',
    args0: [
      { type: 'input_value', name: 'CONDICAO', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'controle_blocks',
    tooltip: 'Executa os blocos de dentro só se a condição for verdadeira.',
  },
  {
    type: 'controle_se_senao',
    message0: 'se %1 então %2 %3 senão %4 %5',
    args0: [
      { type: 'input_value', name: 'CONDICAO', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'SENAO' },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'controle_blocks',
    tooltip: 'Executa um grupo de blocos se a condição for verdadeira, e outro se for falsa.',
  },
  {
    type: 'controle_pare',
    message0: 'parar este script',
    previousStatement: null,
    style: 'controle_blocks',
    tooltip: 'Para a execução do loop aqui.',
  },

  /* ============ OPERADORES — #59C059 ============ */
  {
    type: 'operador_soma',
    message0: '%1 + %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },
  {
    type: 'operador_subtracao',
    message0: '%1 − %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },
  {
    type: 'operador_multiplicacao',
    message0: '%1 × %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },
  {
    type: 'operador_divisao',
    message0: '%1 ÷ %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },
  {
    type: 'operador_resto',
    message0: 'resto de %1 por %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },
  {
    type: 'operador_aleatorio',
    message0: 'número aleatório entre %1 e %2',
    args0: [{ type: 'input_value', name: 'DE', check: 'Number' }, { type: 'input_value', name: 'ATE', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },
  {
    type: 'operador_maior',
    message0: '%1 > %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Boolean', style: 'operadores_blocks',
  },
  {
    type: 'operador_menor',
    message0: '%1 < %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }, { type: 'input_value', name: 'B', check: 'Number' }],
    inputsInline: true, output: 'Boolean', style: 'operadores_blocks',
  },
  {
    type: 'operador_igual',
    message0: '%1 = %2',
    args0: [{ type: 'input_value', name: 'A' }, { type: 'input_value', name: 'B' }],
    inputsInline: true, output: 'Boolean', style: 'operadores_blocks',
  },
  {
    type: 'operador_e',
    message0: '%1 e %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Boolean' }, { type: 'input_value', name: 'B', check: 'Boolean' }],
    inputsInline: true, output: 'Boolean', style: 'operadores_blocks',
  },
  {
    type: 'operador_ou',
    message0: '%1 ou %2',
    args0: [{ type: 'input_value', name: 'A', check: 'Boolean' }, { type: 'input_value', name: 'B', check: 'Boolean' }],
    inputsInline: true, output: 'Boolean', style: 'operadores_blocks',
  },
  {
    type: 'operador_nao',
    message0: 'não %1',
    args0: [{ type: 'input_value', name: 'A', check: 'Boolean' }],
    inputsInline: true, output: 'Boolean', style: 'operadores_blocks',
  },
  {
    type: 'operador_juntar',
    message0: 'juntar %1 %2',
    args0: [{ type: 'input_value', name: 'A' }, { type: 'input_value', name: 'B' }],
    inputsInline: true, output: 'String', style: 'operadores_blocks',
  },
  {
    type: 'operador_arredondar',
    message0: 'arredondar %1',
    args0: [{ type: 'input_value', name: 'A', check: 'Number' }],
    inputsInline: true, output: 'Number', style: 'operadores_blocks',
  },

  /* ============ VARIÁVEIS — #FF8C1A ============
   * "criar variável", "ler variável" e "mude X para" usam os blocos
   * nativos do Blockly (variables_get / variables_set), só
   * restilizados (ver blocos_tema.js) e com VARIABLES_SET
   * traduzido para "mude %1 para %2" em blocos.js. Só o bloco
   * "somar" abaixo é customizado. */
  {
    type: 'variaveis_somar',
    message0: 'somar %1 a %2',
    args0: [
      { type: 'input_value', name: 'VALOR', check: 'Number' },
      { type: 'field_variable', name: 'VAR', variable: 'item' },
    ],
    previousStatement: null, nextStatement: null,
    style: 'variaveis_blocks',
    tooltip: 'Soma o valor à variável (nome += valor).',
  },

  /* ============ ARDUINO (pinos) — #0FBD8C ============ */
  {
    type: 'arduino_pino_digital_saida',
    message0: 'definir pino digital %1 saída como %2',
    args0: [
      { type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_DIGITAIS },
      { type: 'field_dropdown', name: 'ESTADO', options: [['Alto', 'HIGH'], ['Baixo', 'LOW']] },
    ],
    previousStatement: null, nextStatement: null,
    style: 'arduino_blocks',
  },
  {
    type: 'arduino_pino_digital_entrada',
    message0: 'ler pino digital %1',
    args0: [{ type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_DIGITAIS }],
    output: 'Boolean', style: 'arduino_blocks',
  },
  {
    type: 'arduino_pino_analogico_ler',
    message0: 'ler pino analógico %1',
    args0: [{ type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_ANALOGICOS }],
    output: 'Number', style: 'arduino_blocks',
  },
  {
    type: 'arduino_pino_pwm',
    message0: 'definir pino PWM %1 como %2',
    args0: [
      { type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_PWM },
      { type: 'input_value', name: 'VALOR', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null,
    style: 'arduino_blocks',
    inputsInline: true,
  },
  {
    type: 'arduino_pino_modo',
    message0: 'definir pino %1 como %2',
    args0: [
      { type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_DIGITAIS },
      { type: 'field_dropdown', name: 'MODO', options: [['SAÍDA', 'OUTPUT'], ['ENTRADA', 'INPUT'], ['ENTRADA_PULLUP', 'INPUT_PULLUP']] },
    ],
    previousStatement: null, nextStatement: null,
    style: 'arduino_blocks',
  },

  /* ============ ATUADORES — #0FBD8C ============ */
  {
    type: 'atuadores_servo',
    message0: 'definir servo pino %1 com ângulo %2',
    args0: [
      { type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_PWM },
      { type: 'input_value', name: 'ANGULO', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null,
    style: 'atuadores_blocks',
    inputsInline: true,
  },
  {
    type: 'atuadores_buzzer_freq',
    message0: 'tocar buzzer no pino %1 com frequência %2 Hz por %3 ms',
    args0: [
      { type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_PWM },
      { type: 'input_value', name: 'FREQ', check: 'Number' },
      { type: 'input_value', name: 'DUR', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null,
    style: 'atuadores_blocks',
    inputsInline: true,
  },
  {
    type: 'atuadores_buzzer_nota',
    message0: 'tocar buzzer no pino %1 com a nota %2 por %3 ms',
    args0: [
      { type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_PWM },
      { type: 'field_dropdown', name: 'NOTA', options: [['dó', 'DO'], ['ré', 'RE'], ['mi', 'MI'], ['fá', 'FA'], ['sol', 'SOL'], ['lá', 'LA'], ['si', 'SI']] },
      { type: 'input_value', name: 'DUR', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null,
    style: 'atuadores_blocks',
    inputsInline: true,
  },
  {
    type: 'atuadores_buzzer_parar',
    message0: 'parar buzzer no pino %1',
    args0: [{ type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_PWM }],
    previousStatement: null, nextStatement: null,
    style: 'atuadores_blocks',
  },

  /* ============ SENSORES — #5CB1D6 ============ */
  {
    type: 'sensores_distancia',
    message0: 'distância do sensor ultrassônico trig %1 eco %2',
    args0: [
      { type: 'field_dropdown', name: 'TRIG', options: BLOCOS_PINOS_DIGITAIS },
      { type: 'field_dropdown', name: 'ECO', options: BLOCOS_PINOS_DIGITAIS },
    ],
    output: 'Number', style: 'sensores_blocks', inputsInline: true,
  },
  {
    type: 'sensores_botao',
    message0: 'botão %1 pressionado?',
    args0: [{ type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_DIGITAIS }],
    output: 'Boolean', style: 'sensores_blocks',
  },
  {
    type: 'sensores_potenciometro',
    message0: 'ler potenciômetro %1',
    args0: [{ type: 'field_dropdown', name: 'PINO', options: BLOCOS_PINOS_ANALOGICOS }],
    output: 'Number', style: 'sensores_blocks',
  },
  {
    type: 'sensores_mapear',
    message0: 'mapear %1 de %2 %3 para %4 %5',
    args0: [
      { type: 'input_value', name: 'VALOR', check: 'Number' },
      { type: 'input_value', name: 'DE_MIN', check: 'Number' },
      { type: 'input_value', name: 'DE_MAX', check: 'Number' },
      { type: 'input_value', name: 'PARA_MIN', check: 'Number' },
      { type: 'input_value', name: 'PARA_MAX', check: 'Number' },
    ],
    output: 'Number', style: 'sensores_blocks', inputsInline: true,
  },

  /* ============ DISPLAY — #0FBD8C ============ */
  {
    type: 'display_lcd_iniciar',
    message0: 'iniciar LCD 16x2 no endereço %1',
    args0: [{ type: 'field_dropdown', name: 'ENDERECO', options: [['0x27', '0x27'], ['0x3F', '0x3F']] }],
    previousStatement: null, nextStatement: null,
    style: 'display_blocks',
  },
  {
    type: 'display_lcd_escrever',
    message0: 'escrever %1 no LCD linha %2 coluna %3',
    args0: [
      { type: 'input_value', name: 'TEXTO' },
      { type: 'field_dropdown', name: 'LINHA', options: [['0', '0'], ['1', '1']] },
      { type: 'input_value', name: 'COLUNA', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null,
    style: 'display_blocks', inputsInline: true,
  },
  {
    type: 'display_lcd_limpar',
    message0: 'limpar LCD',
    previousStatement: null, nextStatement: null,
    style: 'display_blocks',
  },
  {
    type: 'display_7seg_mostrar',
    message0: 'mostrar %1 no display de 7 segmentos',
    args0: [{ type: 'input_value', name: 'DIGITO', check: 'Number' }],
    previousStatement: null, nextStatement: null,
    style: 'display_blocks', inputsInline: true,
    tooltip: 'Usa os pinos 2..9 (a,b,c,d,e,f,g,DP) no padrão cátodo comum. Para as missões iniciais, que ensinam segmento por segmento, use os blocos "definir pino digital" em vez deste.',
  },
  {
    type: 'display_7seg_apagar',
    message0: 'apagar display de 7 segmentos',
    previousStatement: null, nextStatement: null,
    style: 'display_blocks',
  },

  /* ============ MONITOR SERIAL — #5CB1D6 ============ */
  {
    type: 'serial_iniciar',
    message0: 'iniciar Monitor Serial a %1',
    args0: [{ type: 'field_dropdown', name: 'BAUD', options: [['9600', '9600'], ['19200', '19200'], ['38400', '38400'], ['57600', '57600'], ['115200', '115200']] }],
    previousStatement: null, nextStatement: null,
    style: 'sensores_blocks',
  },
  {
    type: 'serial_escrever_linha',
    message0: 'escrever %1 no Monitor Serial',
    args0: [{ type: 'input_value', name: 'TEXTO' }],
    previousStatement: null, nextStatement: null,
    style: 'sensores_blocks', inputsInline: true,
    tooltip: 'Equivale ao bloco "Diga" do modo palco: aqui, em modo upload, o destino é o Monitor Serial.',
  },
  {
    type: 'serial_escrever',
    message0: 'escrever %1 no Monitor Serial (sem quebrar linha)',
    args0: [{ type: 'input_value', name: 'TEXTO' }],
    previousStatement: null, nextStatement: null,
    style: 'sensores_blocks', inputsInline: true,
  },
];

Blockly.defineBlocksWithJsonArray(BLOCOS_DEFINICOES);
