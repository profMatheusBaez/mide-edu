/* ============================================================
 * blocos_lego_defs.js — MIDE EDU, Modo Blocos, placa
 * LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Blocos de hardware do hub Technic: Motores, Hub, Controle
 * Remoto, Tempo/Saída e Sensor (opcional). Eventos, Controle,
 * Operadores e Variáveis são os MESMOS tipos de bloco do Uno
 * (blocos_defs.js) — só o gerador muda (blocos_lego_gen.js).
 *
 * Cores (tema Scratch, blocos_tema.js): motores #0FBD8C (extensão
 * de hardware), hub #9966FF (Aparência), controle remoto/tempo/
 * sensor #5CB1D6 (Sensores).
 * ============================================================ */
'use strict';

const BLOCOS_LEGO_PORTAS = [['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D']];

/* Nomes em português → constantes Color do Pybricks. */
const BLOCOS_LEGO_CORES = [
  ['vermelho', 'RED'], ['laranja', 'ORANGE'], ['amarelo', 'YELLOW'], ['verde', 'GREEN'],
  ['ciano', 'CYAN'], ['azul', 'BLUE'], ['violeta', 'VIOLET'], ['magenta', 'MAGENTA'], ['branco', 'WHITE'],
];

/* Botões do controle remoto Powered Up (Button do Pybricks). */
const BLOCOS_LEGO_BOTOES = [
  ['esquerda +', 'LEFT_PLUS'], ['esquerda −', 'LEFT_MINUS'], ['esquerda ●', 'LEFT'],
  ['direita +', 'RIGHT_PLUS'], ['direita −', 'RIGHT_MINUS'], ['direita ●', 'RIGHT'],
  ['centro', 'CENTER'],
];

const BLOCOS_LEGO_DEFINICOES = [

  /* ============ MOTORES — #0FBD8C ============ */
  {
    type: 'lego_motor_girar',
    message0: 'motor %1 girar a %2 graus/s',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'input_value', name: 'VEL', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Liga o motor na velocidade indicada (graus por segundo) e segue para o próximo bloco. Negativo gira ao contrário.',
  },
  {
    type: 'lego_motor_girar_graus',
    message0: 'motor %1 girar %2 graus a %3 graus/s',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'input_value', name: 'GRAUS', check: 'Number' },
      { type: 'input_value', name: 'VEL', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Gira o motor esse número de graus e ESPERA terminar (360 graus = uma volta).',
  },
  {
    type: 'lego_motor_ir_ate',
    message0: 'motor %1 ir até o ângulo %2 a %3 graus/s',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'input_value', name: 'ALVO', check: 'Number' },
      { type: 'input_value', name: 'VEL', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Leva o motor até um ângulo (contado a partir do último “zerar ângulo”) e ESPERA chegar.',
  },
  {
    type: 'lego_motor_girar_tempo',
    message0: 'motor %1 girar por %2 ms a %3 graus/s',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'input_value', name: 'TEMPO', check: 'Number' },
      { type: 'input_value', name: 'VEL', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Gira o motor durante esse tempo (1000 ms = 1 segundo) e ESPERA terminar.',
  },
  {
    type: 'lego_motor_potencia',
    message0: 'motor %1 potência %2 %%',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'input_value', name: 'POTENCIA', check: 'Number' },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Liga o motor com uma porcentagem da potência, de -100 a 100 (sem controlar a velocidade).',
  },
  {
    type: 'lego_motor_parar',
    message0: 'motor %1 parar %2',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'field_dropdown', name: 'MODO', options: [['solto', 'STOP'], ['freando', 'BRAKE'], ['segurando a posição', 'HOLD']] },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Solto: o motor gira livre. Freando: resiste a girar. Segurando: mantém o ângulo atual.',
  },
  {
    type: 'lego_motor_zerar',
    message0: 'motor %1 zerar ângulo',
    args0: [{ type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS }],
    previousStatement: null, nextStatement: null,
    style: 'lego_motores_blocks',
    tooltip: 'Faz o ângulo atual do motor virar 0.',
  },
  {
    type: 'lego_motor_sentido',
    message0: 'motor %1 sentido positivo %2',
    args0: [
      { type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS },
      { type: 'field_dropdown', name: 'SENTIDO', options: [['horário', 'CLOCKWISE'], ['anti-horário', 'COUNTERCLOCKWISE']] },
    ],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_motores_blocks',
    tooltip: 'Escolhe para que lado o motor gira quando a velocidade é positiva. Vale para o programa inteiro, onde quer que o bloco esteja.',
  },
  {
    type: 'lego_motor_angulo',
    message0: 'ângulo do motor %1',
    args0: [{ type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS }],
    output: 'Number', style: 'lego_motores_blocks',
    tooltip: 'Ângulo atual do motor, em graus.',
  },
  {
    type: 'lego_motor_velocidade',
    message0: 'velocidade do motor %1',
    args0: [{ type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS }],
    output: 'Number', style: 'lego_motores_blocks',
    tooltip: 'Velocidade atual do motor, em graus por segundo.',
  },
  {
    type: 'lego_motor_travado',
    message0: 'motor %1 travado?',
    args0: [{ type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS }],
    output: 'Boolean', style: 'lego_motores_blocks',
    tooltip: 'Verdadeiro quando o motor está forçando mas não consegue girar (por exemplo, bateu no fim do curso).',
  },

  /* ============ HUB — #9966FF ============ */
  {
    type: 'lego_hub_luz',
    message0: 'luz do hub cor %1',
    args0: [{ type: 'field_dropdown', name: 'COR', options: BLOCOS_LEGO_CORES }],
    previousStatement: null, nextStatement: null,
    style: 'lego_hub_blocks',
    tooltip: 'Acende a luz do botão do hub com a cor escolhida.',
  },
  {
    type: 'lego_hub_luz_apagar',
    message0: 'apagar luz do hub',
    previousStatement: null, nextStatement: null,
    style: 'lego_hub_blocks',
  },
  {
    type: 'lego_hub_inclinacao',
    message0: 'inclinação do hub %1',
    args0: [{ type: 'field_dropdown', name: 'EIXO', options: [['para frente', '0'], ['para o lado', '1']] }],
    output: 'Number', style: 'lego_hub_blocks',
    tooltip: 'Quanto o hub está inclinado, em graus.',
  },
  {
    type: 'lego_hub_direcao',
    message0: 'direção do hub (bússola)',
    output: 'Number', style: 'lego_hub_blocks',
    tooltip: 'Para onde o hub aponta, em graus, contando desde que o programa começou.',
  },
  {
    type: 'lego_hub_bateria',
    message0: 'tensão da bateria (mV)',
    output: 'Number', style: 'lego_hub_blocks',
    tooltip: 'Tensão da bateria em milivolts (o hub desliga por volta de 6000).',
  },

  /* ============ CONTROLE REMOTO — #5CB1D6 ============ */
  {
    type: 'lego_remoto_conectar',
    message0: 'conectar controle remoto',
    previousStatement: null, nextStatement: null,
    style: 'lego_remoto_blocks',
    tooltip: 'Espera o controle remoto Powered Up (ligue-o apertando o botão verde) e conecta a ele.',
  },
  {
    type: 'lego_remoto_botao',
    message0: 'botão %1 do controle pressionado?',
    args0: [{ type: 'field_dropdown', name: 'BOTAO', options: BLOCOS_LEGO_BOTOES }],
    output: 'Boolean', style: 'lego_remoto_blocks',
  },
  {
    type: 'lego_remoto_luz',
    message0: 'luz do controle cor %1',
    args0: [{ type: 'field_dropdown', name: 'COR', options: BLOCOS_LEGO_CORES }],
    previousStatement: null, nextStatement: null,
    style: 'lego_remoto_blocks',
  },

  /* ============ TEMPO / SAÍDA — #5CB1D6 ============ */
  {
    type: 'lego_tempo_zerar',
    message0: 'zerar cronômetro',
    previousStatement: null, nextStatement: null,
    style: 'lego_tempo_blocks',
  },
  {
    type: 'lego_tempo_ler',
    message0: 'cronômetro (ms)',
    output: 'Number', style: 'lego_tempo_blocks',
    tooltip: 'Milissegundos desde o último “zerar cronômetro” (ou desde o início).',
  },
  {
    type: 'lego_monitor_escrever',
    message0: 'escrever %1 no Monitor',
    args0: [{ type: 'input_value', name: 'TEXTO' }],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'lego_tempo_blocks',
    tooltip: 'Manda o valor para o Monitor Serial da IDE (é o print() do Python). O Gráfico Serial desenha números.',
  },

  /* ============ SENSOR (opcional) — #5CB1D6 ============ */
  {
    type: 'lego_sensor_distancia',
    message0: 'distância do sensor de cor e distância %1 (mm)',
    args0: [{ type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS }],
    output: 'Number', style: 'lego_sensor_blocks',
    tooltip: 'Só para quem tem o sensor LEGO de cor e distância (88007). Distância aproximada, em milímetros.',
  },
  {
    type: 'lego_sensor_cor',
    message0: 'cor vista pelo sensor de cor e distância %1',
    args0: [{ type: 'field_dropdown', name: 'PORTA', options: BLOCOS_LEGO_PORTAS }],
    output: null, style: 'lego_sensor_blocks',
    tooltip: 'Só para quem tem o sensor LEGO de cor e distância (88007).',
  },
];

Blockly.defineBlocksWithJsonArray(BLOCOS_LEGO_DEFINICOES);
