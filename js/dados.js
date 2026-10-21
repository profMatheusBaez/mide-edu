/* ============================================================
 * dados.js — Currículo completo do MIDE EDU
 * ------------------------------------------------------------
 * Portado de mods/arduino_edu/fases.lua (F.FASES, as 40 fases dos
 * 8 módulos) e de tutorial_text.lua (cadeia de ícones por linha).
 *
 * Estrutura idêntica à do jogo: `painel` com seções (topo/setup/loop),
 * cada linha com código + explicação + ícone; `solucao` é o alvo do
 * Modo Treinamento; `starter` é o esqueleto do editor livre.
 *
 * Marcação leve nos textos (igual ao mod):
 *   **trecho**  -> destaque (amarelo)
 *   ~~trecho~~  -> perigo   (vermelho)
 *
 * ATENÇÃO: arquivo gerado a partir de fases.lua. Para acrescentar ou
 * corrigir conteúdo, edite aqui — nada em ide.js precisa mudar.
 * ============================================================ */

const ASSETS = 'assets/';

/* Os 8 módulos, na ordem de desbloqueio do jogo. */
let MODULOS = [
  { id: 'led', nome: 'LED — Saída Digital', icone: 'missao1_icone_power.png' },
  { id: 'botao', nome: 'Botão — Entrada Digital', icone: 'icone_modulo_botao.png' },
  { id: 'pot', nome: 'Potenciômetro — Entrada Analógica', icone: 'icone_modulo_pot.png' },
  { id: 'us', nome: 'Ultrassônico — Distância', icone: 'icone_modulo_us.png' },
  { id: 'buzzer', nome: 'Buzzer — Saída Sonora', icone: 'icone_modulo_buzzer.png' },
  { id: 'servo', nome: 'Servo Motor — Saída de Ângulo', icone: 'icone_modulo_servo.png' },
  { id: 'd7', nome: 'Display de 7 Segmentos', icone: 'icone_modulo_d7.png' },
  { id: 'lcd', nome: 'LCD 16x2 — Saída de Texto', icone: 'icone_modulo_lcd.png' },
];

/* Cards UNIVERSAIS do Modo Treinamento — a estrutura que todo sketch
 * Arduino tem (TREINO_CARDS_UNIVERSAIS em board.lua). */
const CARDS_UNIVERSAIS = {
  'void setup() {': {
    icone: { img: 'icone_void_setup.png', escala: 2.1 },
    explicacao: 'Executa uma vez no **INÍCIO** do programa.\n' +
      'Serve para **CONFIGURAR** os pinos e preparar tudo antes do loop.',
  },
  'void loop() {': {
    icone: { img: 'icone_void_loop.png', escala: 2.1 },
    explicacao: '**Repete** continuamente enquanto o programa roda.\n' +
      'É onde ficam as **ações** que se repetem, como ler sensores e controlar o LED.',
  },
  '}': {
    icone: { img: 'icone_fecha_bloco.png', escala: 2.1 },
    explicacao: 'Fecha o bloco de código.',
  },
};

/* ------------------------------------------------------------
 * Cadeia de ícones por linha de código — mesma ordem e mesmos
 * arquivos de tutorial_text.lua / board.lua (treino_resolver_icone):
 *   LED -> variável int -> ultrassônico -> pino -> delay
 *       -> if/else -> serial -> servo
 * ---------------------------------------------------------- */

const LED_ACESO = {
  green:  'missao2_led_aceso.png',
  red:    'missao2_led_aceso_red.png',
  yellow: 'missao2_led_aceso_yellow.png',
  blue:   'missao2_led_aceso_blue.png',
};
const LED_APAGADO = 'missao2_led_apagado.png';

function iconeDeLed(codigo, kit) {
  if (!kit) return null;
  const m = String(codigo).match(/^\s*digitalWrite\s*\(\s*(\w+)\s*,\s*([A-Z]+)\s*\)/);
  if (!m || (m[2] !== 'HIGH' && m[2] !== 'LOW')) return null;
  for (const item of kit) {
    if (item.comp === 'led' && String(item.pino) === m[1]) {
      if (m[2] === 'LOW') return { img: LED_APAGADO, escala: 2.21 };
      return { img: LED_ACESO[item.cor || 'green'] || LED_ACESO.green, escala: 2.21 };
    }
  }
  return null;
}

function iconeDeVariavelInt(codigo) {
  const m = String(codigo).match(
    /^\s*(?:unsigned\s+)?(int|long|byte|bool|float|char)\s+([A-Za-z_]\w*)(.*)$/);
  if (!m || /^\s*\(/.test(m[3])) return null;   // "int main()" é função, não variável
  const vetor = /^\s*\[/.test(m[3]);
  return { icone: { img: 'icone_variavel_int.png', escala: 2.1 },
           explicacao: vetor ? `Declara o vetor **${m[2]}**.`
                             : `Declara a variável **${m[2]}**.` };
}

function kitTemSensor(kit) {
  return (kit || []).some((i) => i.comp === 'sensor');
}

function iconeDeUltrassonico(codigo, kit) {
  if (!kitTemSensor(kit)) return null;
  const c = String(codigo);
  const m = c.match(/^\s*digitalWrite\s*\(\s*(\w+)\s*,\s*([A-Z]+)\s*\)/);
  if (m && m[1] === '6') {
    if (m[2] === 'HIGH') return { img: 'icone_ultrassonico_trig_on.png', escala: 2.21 };
    if (m[2] === 'LOW')  return { img: 'icone_ultrassonico_trig_off.png', escala: 2.21 };
  }
  if (/pulseIn\s*\(/.test(c)) return { img: 'icone_ultrassonico_echo_on.png', escala: 2.21 };
  if (/^\s*int\s+dist\s*=\s*dur\s*\/\s*58\s*;?\s*$/.test(c)) {
    return { img: 'icone_sensor_ultrassonico.png', escala: 2.21 };
  }
  return null;
}

const FUNCOES_COM_PINO = {
  pinMode: 'depende', digitalWrite: 'out', analogWrite: 'out',
  digitalRead: 'in', analogRead: 'in',
};
const PINOS_SEM_DIRECAO = {
  '0': 'pino_d0.png', '1': 'pino_d1.png',
  A0: 'pino_a0.png', A1: 'pino_a1.png', A2: 'pino_a2.png',
  A3: 'pino_a3.png', A4: 'pino_a4.png', A5: 'pino_a5.png',
  SCL: 'pino_scl.png', SDA: 'pino_sda.png',
};

function iconeDoPino(codigo) {
  const m = String(codigo).match(/([A-Za-z_][\w.]*)\s*\(\s*([^)]*)\)/);
  if (!m) return null;
  let direcao = FUNCOES_COM_PINO[m[1]];
  if (!direcao) return null;
  const args = m[2].match(/^\s*(\w+)\s*,?\s*(\w*)/);
  if (!args) return null;
  const pino = args[1];
  if (direcao === 'depende') {
    direcao = (args[2] === 'INPUT' || args[2] === 'INPUT_PULLUP') ? 'in' : 'out';
  }
  if (PINOS_SEM_DIRECAO[pino]) {
    return { img: PINOS_SEM_DIRECAO[pino], escala: 2.21, pino };
  }
  if (/^\d+$/.test(pino) && +pino >= 2 && +pino <= 13) {
    return { img: `pino_d${pino}_${direcao}.png`, escala: 2.21, pino };
  }
  return null;
}

function iconeDeDelay(codigo) {
  let m = String(codigo).match(/^\s*delayMicroseconds\s*\(\s*(\d+)\s*\)/);
  if (m) return { icone: { img: 'missao2_relogio.png', escala: 2.1 },
                  explicacao: `Espera ${m[1]} microssegundos.` };
  m = String(codigo).match(/^\s*delay\s*\(\s*(\d+)\s*\)/);
  if (!m) return null;
  return { icone: { img: 'missao2_relogio.png', escala: 2.1 },
           explicacao: `Espera ${m[1]} ms.` };
}

function iconeDeIfElse(codigo) {
  const c = String(codigo);
  if (/if\s*\(/.test(c)) return { img: 'icone_if.png', escala: 2.1 };
  if (c.indexOf('else') >= 0) return { img: 'icone_else.png', escala: 2.1 };
  if (/^\s*\}\s*$/.test(c)) return { img: 'icone_fecha_bloco.png', escala: 2.1 };
  return null;
}

function iconeDeSerial(codigo) {
  const c = String(codigo);
  if (/^\s*Serial\.begin\s*\(/.test(c))   return { img: 'icone_serial_begin.png', escala: 2.1 };
  if (/^\s*Serial\.println\s*\(/.test(c)) return { img: 'icone_serial_println.png', escala: 2.1 };
  if (/^\s*Serial\.print\s*\(/.test(c))   return { img: 'icone_serial_print.png', escala: 2.1 };
  if (/^\s*Serial\.\w+/.test(c))           return { img: 'icone_comunicacao_serial.png', escala: 2.1 };
  return null;
}

function iconeDeServo(codigo) {
  const c = String(codigo);
  if (/^\s*#include\s*<\s*Servo\.h\s*>/.test(c)) return { img: 'icone_servo_motor.png', escala: 2.1 };
  if (/^\s*Servo\s+[A-Za-z_]\w*\s*;/.test(c))     return { img: 'icone_servo_motor.png', escala: 2.1 };
  if (/^\s*\w+\.attach\s*\(/.test(c))            return { img: 'icone_servo_motor.png', escala: 2.1 };
  if (/^\s*\w+\.write\s*\(/.test(c))             return { img: 'icone_servo_motor.png', escala: 2.1 };
  return null;
}

/* Ícone do LCD: qualquer lcd.algo(...) e as linhas de biblioteca do display. */
function iconeDeLcd(codigo) {
  const c = String(codigo);
  if (/^\s*lcd\.\w+/.test(c)) return { img: 'icone_tela.png', escala: 2.1 };
  if (/LiquidCrystal/.test(c) || /#include\s*<\s*Wire\.h\s*>/.test(c)) {
    return { img: 'icone_modulo_lcd.png', escala: 2.1 };
  }
  return null;
}

/* Estrutura: `for (...) {`, uma função auxiliar e o fechamento com `};`. */
function iconeDeEstrutura(codigo) {
  const c = String(codigo);
  if (/^\s*for\s*\(/.test(c)) return { img: 'icone_abre_bloco.png', escala: 2.1 };
  if (/^\s*void\s+\w+\s*\(/.test(c)) return { img: 'icone_abre_bloco.png', escala: 2.1 };
  if (/^\s*\}\s*;?\s*$/.test(c)) return { img: 'icone_fecha_bloco.png', escala: 2.1 };
  if (/^\s*\{[\s\d,]+\}\s*,?\s*$/.test(c)) {   // linha de tabela: {1, 1, 0, ...}
    return { img: 'icone_variavel_int.png', escala: 2.1 };
  }
  return null;
}

/* Contas do currículo e pinos que vêm de uma variável/vetor. */
function iconeDeCalculo(codigo) {
  const c = String(codigo);
  if (/\bconstrain\s*\(/.test(c)) return { img: 'icon_constrain.png', escala: 2.1 };
  if (/\bmap\s*\(/.test(c)) return { img: 'icon_map.png', escala: 2.1 };
  // pinMode(pinos[i], OUTPUT) — o pino existe, só não é um número fixo
  if (/^\s*(?:pinMode|digitalWrite|analogWrite|digitalRead)\s*\(\s*[A-Za-z_]/.test(c)) {
    return { img: 'icon_pin_chip_blank.png', escala: 2.1 };
  }
  return null;
}

/* Ícone de uma linha, seguindo a mesma ordem do mod, com alguns
 * complementos para o que o mod desenhava só nos painéis autorais. */
function resolverIcone(codigo, kit) {
  return iconeDeLed(codigo, kit)
      || (iconeDeVariavelInt(codigo) || {}).icone
      || iconeDeUltrassonico(codigo, kit)
      || iconeDoPino(codigo)
      || (iconeDeDelay(codigo) || {}).icone
      || iconeDeIfElse(codigo)
      || iconeDeSerial(codigo)
      || iconeDeServo(codigo)
      || iconeDeLcd(codigo)
      || iconeDeEstrutura(codigo)
      || iconeDeCalculo(codigo)
      || null;
}

const ESQUELETO = 'void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n';

let FASES = [

  /* ---------------- led_1 — Ligando um LED ---------------- */
  {
    id: 'led_1', setor: 'led',
    missao: 'Missão 1', nome: 'Ligando um LED',
    componente: 'LED Verde',
    corComponente: '#57E237',
    iconeSetor: 'missao1_icone_power.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    diagrama: { img: 'missao1_diagrama.png', ratio: 2.577464789 },
    conceito: {
      titulo: 'Conceito: Pinos Digitais',
      texto: [
        'Pinos digitais só têm **DOIS estados** possíveis: **LIGADO (HIGH, 5V)** ou **DESLIGADO (LOW, 0V)** — como um interruptor de luz.',
        'São usados pra ligar/desligar um componente (como este LED), ou pra ler se um botão está pressionado ou solto.',
      ],
      imagem: 'concept_digital.png',
    },
    objetivo: 'Acenda o LED verde e mantenha ele ligado.',
    aviso: 'Conecte o **resistor** no LED antes de executar o código, sem ele, o ~~LED queima~~.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.', icone: { img: 'pino_d12_out.png', escala: 2.09 } },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(12, HIGH);', explicacao: 'Pino 13 em **HIGH**\n— o LED acende.', icone: { img: 'missao1_led_aceso.png', escala: 2.46 } },
        ],
      },
    ],
    dica: 'Se o LED não acender, verifique o resistor e as conexões.',
    kit: [{ comp: 'led', pino: 12, cor: 'green' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(12, HIGH);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- led_2 — Piscando um LED ---------------- */
  {
    id: 'led_2', setor: 'led',
    missao: 'Missão 2', nome: 'Piscando um LED',
    componente: 'LED Verde',
    corComponente: '#57E237',
    iconeSetor: 'missao1_icone_power.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    diagrama: { img: 'missao1_diagrama.png', ratio: 2.577464789 },
    objetivo: 'Faça o LED piscar: 1 segundo aceso, 1 segundo apagado.',
    aviso: 'Conecte o **resistor** no LED antes de executar o código, sem ele, o ~~LED queima~~.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.', icone: { img: 'pino_d12_out.png', escala: 2.21 } },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(12, HIGH);', explicacao: 'Liga o pino 12 (**HIGH**)\n— o LED acende.', icone: { img: 'missao2_led_aceso.png', escala: 2.21 } },
          { codigo: 'delay(1000);', explicacao: 'Espera 1000 ms.', icone: { img: 'missao2_relogio.png', escala: 2.21 } },
          { codigo: 'digitalWrite(12, LOW);', explicacao: 'Desliga o pino 12 (**LOW**)\n— o LED apaga.', icone: { img: 'missao2_led_apagado.png', escala: 2.21 } },
          { codigo: 'delay(1000);', explicacao: 'Espera 1000 ms.', icone: { img: 'missao2_relogio.png', escala: 2.21 } },
        ],
      },
    ],
    dica: 'Ajuste os valores do **delay** para mudar a velocidade do piscar.',
    kit: [{ comp: 'led', pino: 12, cor: 'green' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(12, HIGH);\n' +
      '  delay(1000);\n' +
      '  digitalWrite(12, LOW);\n' +
      '  delay(1000);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- led_3 — Ligando dois LEDs em ordem ---------------- */
  {
    id: 'led_3', setor: 'led',
    missao: 'Missão 3', nome: 'Ligando dois LEDs em ordem',
    componente: 'Pinos 12 e 13',
    corComponente: '#57E237',
    iconeSetor: 'missao1_icone_power.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    diagrama: { img: 'missao3_diagrama.png', ratio: 3.282152231 },
    objetivo: 'Acenda dois LEDs em sequência: primeiro o pino 11, depois o 13.',
    aviso: 'Conecte um **resistor** em cada LED antes de executar o código, sem eles, os ~~LEDs queimam~~.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 como **SAÍDA**.', icone: { img: 'pino_d11_out.png', escala: 2.09 } },
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.', icone: { img: 'pino_d12_out.png', escala: 2.09 } },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(11, HIGH);', explicacao: 'Liga o LED do pino 11.', icone: { img: 'missao3_led_amarelo.png', escala: 2.46 } },
          { codigo: 'delay(700);', explicacao: 'Espera 700 ms.', icone: { img: 'missao3_relogio.png', escala: 2 } },
          { codigo: 'digitalWrite(12, HIGH);', explicacao: 'Liga o LED do pino 12 (o 12 continua ligado).', icone: { img: 'missao3_led_verde.png', escala: 2.46 } },
          { codigo: 'delay(700);', explicacao: 'Espera 700 ms.', icone: { img: 'missao3_relogio.png', escala: 2 } },
        ],
      },
    ],
    dica: 'Use **delays** diferentes para mudar o ritmo da sequência.',
    kit: [{ comp: 'led', pino: 11, cor: 'yellow' }, { comp: 'led', pino: 12, cor: 'green' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '  pinMode(12, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(11, HIGH);\n' +
      '  delay(700);\n' +
      '  digitalWrite(12, HIGH);\n' +
      '  delay(700);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- led_4 — Controlando o brilho do LED ---------------- */
  {
    id: 'led_4', setor: 'led',
    missao: 'Missão 4', nome: 'Controlando o brilho do LED',
    componente: 'PWM no pino 11',
    corComponente: '#57E237',
    iconeSetor: 'missao1_icone_power.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    diagrama: { img: 'missao4_diagrama.png', ratio: 4.78245614 },
    iconeObjetivo: { img: 'missao4_led_brilho_medio.png', escala: 1.35 },
    conceito: {
      titulo: 'Conceito: PWM',
      texto: [
        '**PWM** liga e desliga um pino digital **MUITO rápido** pra simular um valor intermediário — nem só ligado, nem só desligado.',
        'Quanto mais tempo ligado que desligado, mais forte fica o sinal: dá pra controlar o **BRILHO** de um LED ou a **VELOCIDADE** de um motor.',
      ],
      imagem: 'concept_pwm.png',
    },
    objetivo: 'Deixe o LED em brilho **MÉDIO** (nem apagado, nem no máximo).',
    aviso: 'O pino 11 tem **~** (PWM). Use **analogWrite** para controlar o ~~brilho do LED~~.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 (tem **~**, aceita PWM) como **SAÍDA**.', icone: { img: 'pino_d11_out.png', escala: 2 } },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'analogWrite(11, 128);', explicacao: 'Escreve um valor de 0 a 255 no pino — controla o **BRILHO**. 128 é a metade.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
        ],
      },
    ],
    dica: 'O valor **0** apaga o LED, **255** é o brilho máximo e **128** é o brilho médio.',
    kit: [{ comp: 'led', pino: 11, cor: 'yellow' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  analogWrite(11, 128);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- led_5 — Escada de brilho com PWM ---------------- */
  {
    id: 'led_5', setor: 'led',
    missao: 'Missão 5', nome: 'Escada de brilho com PWM',
    componente: 'PWM no pino 11',
    corComponente: '#57E237',
    iconeSetor: 'missao1_icone_power.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    diagrama: { img: 'missao4_diagrama.png', ratio: 4.78245614 },
    iconeObjetivo: { img: 'missao4_led_brilho_medio.png', escala: 1.35 },
    conceito: {
      titulo: 'Conceito: escada de brilho',
      texto: [
        'Com o **PWM** o LED não fica só ligado ou desligado: o **analogWrite** aceita valores de **0** (apagado) a **255** (brilho máximo).',
        'Subindo o valor de **50 em 50** — 0, 50, 100, 150, 200, 250 — o brilho sobe como uma **ESCADA**: cada degrau é um pouco mais forte que o anterior.',
      ],
      imagem: 'missao4_onda_pwm.png',
    },
    objetivo: 'Faça o LED subir uma **escada de brilho**: de 0 até 250, de **50 em 50**, meio segundo em cada degrau.',
    aviso: 'Use o pino **11** (tem **~**, aceita PWM). O maior valor do **analogWrite** é ~~255~~ — por isso a escada para no 250.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 (tem **~**, aceita PWM) como **SAÍDA**.', icone: { img: 'pino_d11_out.png', escala: 2 } },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'analogWrite(11, 0);', explicacao: '**Degrau 1**: brilho **0** — LED apagado.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
          { codigo: 'delay(500);', explicacao: 'Espera **500 ms** (meio segundo) neste degrau.', icone: { img: 'missao3_relogio.png', escala: 2 } },
          { codigo: 'analogWrite(11, 50);', explicacao: '**Degrau 2**: brilho **50** — bem fraquinho.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
          { codigo: 'delay(500);', explicacao: 'Espera **500 ms** (meio segundo) neste degrau.', icone: { img: 'missao3_relogio.png', escala: 2 } },
          { codigo: 'analogWrite(11, 100);', explicacao: '**Degrau 3**: brilho **100** — subiu mais 50.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
          { codigo: 'delay(500);', explicacao: 'Espera **500 ms** (meio segundo) neste degrau.', icone: { img: 'missao3_relogio.png', escala: 2 } },
          { codigo: 'analogWrite(11, 150);', explicacao: '**Degrau 4**: brilho **150** — já passou da metade (128).', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
          { codigo: 'delay(500);', explicacao: 'Espera **500 ms** (meio segundo) neste degrau.', icone: { img: 'missao3_relogio.png', escala: 2 } },
          { codigo: 'analogWrite(11, 200);', explicacao: '**Degrau 5**: brilho **200** — forte.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
          { codigo: 'delay(500);', explicacao: 'Espera **500 ms** (meio segundo) neste degrau.', icone: { img: 'missao3_relogio.png', escala: 2 } },
          { codigo: 'analogWrite(11, 250);', explicacao: '**Degrau 6**: brilho **250** — quase o máximo (255). Depois o loop volta para o degrau 1.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
          { codigo: 'delay(500);', explicacao: 'Espera **500 ms** (meio segundo) neste degrau.', icone: { img: 'missao3_relogio.png', escala: 2 } },
        ],
      },
    ],
    dica: 'Cada degrau soma **50** ao anterior. Troque o **delay** para a escada subir mais rápido ou mais devagar.',
    kit: [{ comp: 'led', pino: 11, cor: 'yellow' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  analogWrite(11, 0);\n' +
      '  delay(500);\n' +
      '  analogWrite(11, 50);\n' +
      '  delay(500);\n' +
      '  analogWrite(11, 100);\n' +
      '  delay(500);\n' +
      '  analogWrite(11, 150);\n' +
      '  delay(500);\n' +
      '  analogWrite(11, 200);\n' +
      '  delay(500);\n' +
      '  analogWrite(11, 250);\n' +
      '  delay(500);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- bot_1 — Lendo um botão com pull-up ---------------- */
  {
    id: 'bot_1', setor: 'botao',
    missao: 'Missão 1', nome: 'Lendo um botão com pull-up',
    componente: 'LED + Botão (Pull-up)',
    corComponente: '#4c8ee8',
    iconeSetor: 'icone_modulo_botao.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O LED acende quando você aperta o botão — agora com fiação de verdade (pull-up).',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
          { codigo: 'pinMode(2, INPUT_PULLUP);', explicacao: 'Ativa o resistor de pull-up do pino: solto = HIGH, pressionado = LOW (invertido!).' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'if (digitalRead(2) == LOW) {', explicacao: 'Se o Push Button estiver __pressionado__ (LOW)...' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...liga o LED __verde__.' },
          { codigo: '} else {', explicacao: 'Senão, se estiver ~~solto~~...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...desliga o LED __verde__.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'Com INPUT_PULLUP o botão solto lê HIGH e pressionado lê LOW — o contrário do que parece.',
    kit: [{ comp: 'led', pino: 12, cor: 'green' }, { comp: 'button', pino: 2 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  if (digitalRead(2) == LOW) {\n' +
      '    digitalWrite(12, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(12, LOW);\n' +
      '  }\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- bot_2 — Utilizando o Monitor Serial ---------------- */
  {
    id: 'bot_2', setor: 'botao',
    missao: 'Missão 2', nome: 'Utilizando o Monitor Serial',
    componente: 'LED + Botão + Serial',
    corComponente: '#4c8ee8',
    iconeSetor: 'icone_modulo_botao.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Mesma lógica da fase anterior, mais um aviso no Monitor Serial.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
          { codigo: 'pinMode(2, INPUT_PULLUP);', explicacao: 'Pull-up no pino do botão (solto = HIGH, pressionado = LOW).' },
          { codigo: 'Serial.begin(9600);', explicacao: 'Liga a comunicação com o Monitor Serial — só uma vez, no setup.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'if (digitalRead(2) == LOW) {', explicacao: 'Se o Push Button estiver __pressionado__...' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...liga o LED __verde__...' },
          { codigo: '  Serial.println("PRESSIONADO");', explicacao: '...e escreve o texto no Monitor Serial, pulando linha.' },
          { codigo: '} else {', explicacao: 'Senão, se estiver ~~solto~~...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...desliga o LED __verde__.' },
          { codigo: '}' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa no fim do loop evita spam no Serial.' },
        ],
      },
    ],
    dica: 'Um delay(200) no fim do loop evita spam no Serial.',
    kit: [{ comp: 'led', pino: 12, cor: 'green' }, { comp: 'button', pino: 2 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  if (digitalRead(2) == LOW) {\n' +
      '    digitalWrite(12, HIGH);\n' +
      '    Serial.println("PRESSIONADO");\n' +
      '  } else {\n' +
      '    digitalWrite(12, LOW);\n' +
      '  }\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- bot_3 — Invertendo a lógica do botão ---------------- */
  {
    id: 'bot_3', setor: 'botao',
    missao: 'Missão 3', nome: 'Invertendo a lógica do botão',
    componente: 'LED + Botão (Invertido)',
    corComponente: '#4c8ee8',
    iconeSetor: 'icone_modulo_botao.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Desta vez o LED acende quando o botão está SOLTO (invertido!).',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(2, INPUT_PULLUP);', explicacao: 'Pull-up no pino do botão (solto = HIGH, pressionado = LOW).' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'if (digitalRead(2) == HIGH) {', explicacao: 'Se o Push Button estiver ~~solto~~ (HIGH, por causa do pull-up)...' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...liga o LED ~~vermelho~~.' },
          { codigo: '} else {', explicacao: 'Senão, se estiver __pressionado__...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...desliga o LED ~~vermelho~~.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'Solto = HIGH, então o LED acende quando NINGUÉM aperta.',
    kit: [{ comp: 'led', pino: 10, cor: 'red' }, { comp: 'button', pino: 2 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  if (digitalRead(2) == HIGH) {\n' +
      '    digitalWrite(10, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(10, LOW);\n' +
      '  }\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- bot_4 — Um botão, dois LEDs ---------------- */
  {
    id: 'bot_4', setor: 'botao',
    missao: 'Missão 4', nome: 'Um botão, dois LEDs',
    componente: '2 LEDs + Botão',
    corComponente: '#4c8ee8',
    iconeSetor: 'icone_modulo_botao.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Verde acende pressionado, vermelho acende solto — nunca os dois juntos.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(2, INPUT_PULLUP);', explicacao: 'Pull-up no pino do botão.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'if (digitalRead(2) == LOW) {', explicacao: 'Se o Push Button estiver __pressionado__...' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...liga o LED __verde__...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...e desliga o LED ~~vermelho~~.' },
          { codigo: '} else {', explicacao: 'Senão, se estiver ~~solto~~...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...desliga o LED __verde__...' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...e liga o LED ~~vermelho~~.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'Os dois LEDs sempre em estados opostos.',
    kit: [{ comp: 'led', pino: 12, cor: 'green' }, { comp: 'led', pino: 10, cor: 'red' }, { comp: 'button', pino: 2 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  if (digitalRead(2) == LOW) {\n' +
      '    digitalWrite(12, HIGH);\n' +
      '    digitalWrite(10, LOW);\n' +
      '  } else {\n' +
      '    digitalWrite(12, LOW);\n' +
      '    digitalWrite(10, HIGH);\n' +
      '  }\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- bot_5 — Dois botões, dois LEDs ---------------- */
  {
    id: 'bot_5', setor: 'botao',
    missao: 'Missão 5', nome: 'Dois botões, dois LEDs',
    componente: '2 LEDs + 2 Botões',
    corComponente: '#4c8ee8',
    iconeSetor: 'icone_modulo_botao.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Dois botões, dois LEDs, totalmente independentes um do outro.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(2, INPUT_PULLUP);', explicacao: 'Pull-up no primeiro botão (pino 2).' },
          { codigo: 'pinMode(3, INPUT_PULLUP);', explicacao: 'Pull-up no segundo botão (pino 3).' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'if (digitalRead(2) == LOW) {', explicacao: 'Primeiro par: se o Push Button 2 estiver __pressionado__...' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...liga o LED __verde__.' },
          { codigo: '} else {', explicacao: 'Senão, se estiver ~~solto~~...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...desliga o LED __verde__.' },
          { codigo: '}' },
          { codigo: 'if (digitalRead(3) == LOW) {', explicacao: 'Segundo par: mesma ideia — se o Push Button 3 estiver __pressionado__...' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...liga o LED ~~vermelho~~.' },
          { codigo: '} else {', explicacao: 'Senão, se estiver ~~solto~~...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...desliga o LED ~~vermelho~~.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'Não precisa de nada novo — só repetir a fase 1 duas vezes.',
    kit: [{ comp: 'led', pino: 12, cor: 'green' }, { comp: 'led', pino: 10, cor: 'red' }, { comp: 'button', pino: 2 }, { comp: 'button', pino: 3 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '  pinMode(3, INPUT_PULLUP);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  if (digitalRead(2) == LOW) {\n' +
      '    digitalWrite(12, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(12, LOW);\n' +
      '  }\n' +
      '  if (digitalRead(3) == LOW) {\n' +
      '    digitalWrite(10, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(10, LOW);\n' +
      '  }\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- pot_1 — Lendo um potenciômetro no Monitor Serial ---------------- */
  {
    id: 'pot_1', setor: 'pot',
    missao: 'Missão 1', nome: 'Lendo um potenciômetro no Monitor Serial',
    componente: 'Potenciômetro',
    corComponente: '#8e4ce8',
    iconeSetor: 'icone_modulo_pot.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    conceito: {
      titulo: 'Conceito: Pinos Analógicos',
      texto: [
        'Pinos analógicos leem uma faixa **CONTÍNUA** de valores (**0 a 1023**), não só ligado ou desligado como os digitais.',
        'Um potenciômetro, por exemplo, manda um valor diferente pra cada posição do giro — isso dá **controle fino**, não só liga/desliga.',
      ],
      imagem: 'concept_analogico.png',
    },
    objetivo: 'Leia o potenciômetro e mostre o valor no Monitor Serial.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'Serial.begin(9600);', explicacao: 'Liga a comunicação com o Monitor Serial.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'int valor = analogRead(A0);', explicacao: 'Lê o pino analógico e GUARDA o resultado (0 a 1023) numa variável.' },
          { codigo: 'Serial.print("POT:");', explicacao: 'Escreve o texto "POT:" no Monitor Serial, sem pular linha.' },
          { codigo: 'Serial.println(valor);', explicacao: 'Escreve o número da variável logo depois, e pula linha.' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Gire o potenciômetro no painel e veja o número mudar.',
    kit: [{ comp: 'pot', pino: 'A0' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  Serial.print("POT:");\n' +
      '  Serial.println(valor);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- pot_2 — Ligando o LED com uma condição ---------------- */
  {
    id: 'pot_2', setor: 'pot',
    missao: 'Missão 2', nome: 'Ligando o LED com uma condição',
    componente: 'Potenciômetro + LED',
    corComponente: '#8e4ce8',
    iconeSetor: 'icone_modulo_pot.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O LED acende só quando o potenciômetro passa da metade do curso.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'int valor = analogRead(A0);', explicacao: 'Lê o potenciômetro (0 a 1023) e guarda numa variável.' },
          { codigo: 'if (valor >= 512) {', explicacao: '512 é a metade de 1023 — se passou da metade...' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...liga o LED.' },
          { codigo: '} else {', explicacao: 'Senão...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...desliga o LED.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'Gire o potenciômetro passando de metade do curso pra testar.',
    kit: [{ comp: 'pot', pino: 'A0' }, { comp: 'led', pino: 12, cor: 'green' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  if (valor >= 512) {\n' +
      '    digitalWrite(12, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(12, LOW);\n' +
      '  }\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- pot_3 — Controlando o brilho do LED pelo potenciômetro ---------------- */
  {
    id: 'pot_3', setor: 'pot',
    missao: 'Missão 3', nome: 'Controlando o brilho do LED pelo potenciômetro',
    componente: 'Potenciômetro + LED (PWM)',
    corComponente: '#8e4ce8',
    iconeSetor: 'icone_modulo_pot.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Agora o LED não só liga/desliga — o BRILHO acompanha o potenciômetro.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 (tem **~**, aceita PWM) como **SAÍDA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'int valor = analogRead(A0);', explicacao: 'Lê o potenciômetro (0 a 1023) e guarda numa variável.' },
          { codigo: 'int brilho = map(valor, 0, 1023, 0, 255);', explicacao: 'Converte a escala do pot (0-1023) pra escala do PWM (0-255) e guarda o resultado.' },
          { codigo: 'analogWrite(11, brilho);', explicacao: 'Escreve o brilho convertido no LED.', icone: { img: 'missao4_analogwrite.png', escala: 2 } },
        ],
      },
    ],
    dica: 'Gire bem devagar de ponta a ponta pra ver o brilho variar todo.',
    kit: [{ comp: 'pot', pino: 'A0' }, { comp: 'led', pino: 11, cor: 'yellow' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  int brilho = map(valor, 0, 1023, 0, 255);\n' +
      '  analogWrite(11, brilho);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- pot_4 — Barra de nível com três LEDs ---------------- */
  {
    id: 'pot_4', setor: 'pot',
    missao: 'Missão 4', nome: 'Barra de nível com três LEDs',
    componente: 'Potenciômetro + 3 LEDs',
    corComponente: '#8e4ce8',
    iconeSetor: 'icone_modulo_pot.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Três LEDs, três faixas do potenciômetro — só UM aceso por vez.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 como **SAÍDA**.' },
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'int valor = analogRead(A0);', explicacao: 'Lê o potenciômetro (0 a 1023).' },
          { codigo: 'if (valor < 341) {', explicacao: '1023 dividido em 3: primeiro terço...' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...acende só o vermelho...' },
          { codigo: '  digitalWrite(11, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '} else if (valor < 682) {', explicacao: 'else if testa uma condição a mais: segundo terço...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...acende só o amarelo.' },
          { codigo: '  digitalWrite(11, HIGH);', explicacao: '...acende só o amarelo.' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '} else {', explicacao: 'O resto (último terço)...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...acende só o verde.' },
          { codigo: '  digitalWrite(11, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...acende só o verde.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'Em CADA bloco, lembre de apagar os LEDs que não são desse bloco.',
    kit: [{ comp: 'pot', pino: 'A0' }, { comp: 'led', pino: 10, cor: 'red' }, { comp: 'led', pino: 11, cor: 'yellow' }, { comp: 'led', pino: 12, cor: 'green' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(11, OUTPUT);\n' +
      '  pinMode(12, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  if (valor < 341) {\n' +
      '    digitalWrite(10, HIGH);\n' +
      '    digitalWrite(11, LOW);\n' +
      '    digitalWrite(12, LOW);\n' +
      '  } else if (valor < 682) {\n' +
      '    digitalWrite(10, LOW);\n' +
      '    digitalWrite(11, HIGH);\n' +
      '    digitalWrite(12, LOW);\n' +
      '  } else {\n' +
      '    digitalWrite(10, LOW);\n' +
      '    digitalWrite(11, LOW);\n' +
      '    digitalWrite(12, HIGH);\n' +
      '  }\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- pot_5 — Impedindo valores fora da faixa ---------------- */
  {
    id: 'pot_5', setor: 'pot',
    missao: 'Missão 5', nome: 'Impedindo valores fora da faixa',
    componente: 'Potenciômetro + LED (PWM)',
    corComponente: '#8e4ce8',
    iconeSetor: 'icone_modulo_pot.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'map() pode calcular mais do que o LED aceita — constrain() trava o valor.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 (tem **~**, aceita PWM) como **SAÍDA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'int valor = analogRead(A0);', explicacao: 'Lê o potenciômetro (0 a 1023).' },
          { codigo: 'int bruto = map(valor, 0, 1023, 0, 300);', explicacao: 'Converte pra uma escala de 0 a 300 — mas o LED só aceita até 255!' },
          { codigo: 'int brilho = constrain(bruto, 0, 200);', explicacao: 'TRAVA o valor entre 0 e 200, mesmo quando o map() calcular mais que isso.' },
          { codigo: 'analogWrite(11, brilho);', explicacao: 'Escreve o brilho (já travado) no LED.' },
        ],
      },
    ],
    dica: 'Sem o constrain, o LED tentaria passar de 200 na parte final do giro.',
    kit: [{ comp: 'pot', pino: 'A0' }, { comp: 'led', pino: 11, cor: 'yellow' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  int bruto = map(valor, 0, 1023, 0, 300);\n' +
      '  int brilho = constrain(bruto, 0, 200);\n' +
      '  analogWrite(11, brilho);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- us_1 — Medindo distância com sensor ultrassônico ---------------- */
  {
    id: 'us_1', setor: 'us',
    missao: 'Missão 1', nome: 'Medindo distância com sensor ultrassônico',
    componente: 'Sensor Ultrassônico',
    corComponente: '#8ee84c',
    iconeSetor: 'icone_modulo_us.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O Sensor Ultrassônico mede distância. Leia e mostre no Monitor Serial.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'Serial.begin(9600);', explicacao: 'Liga a comunicação com o Monitor Serial.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO (recebe o eco de volta) como **ENTRADA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Garante o TRIG desligado antes de disparar.' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Converte esse tempo em distância, em blocos.' },
          { codigo: 'Serial.print("DIST:");', explicacao: 'Escreve o texto "DIST:" no Monitor Serial.' },
          { codigo: 'Serial.println(dist);', explicacao: 'Escreve a distância logo depois, e pula linha.' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Ande na frente do sensor e veja o número mudar.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  Serial.begin(9600);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  Serial.print("DIST:");\n' +
      '  Serial.println(dist);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- us_2 — Alarme de proximidade ---------------- */
  {
    id: 'us_2', setor: 'us',
    missao: 'Missão 2', nome: 'Alarme de proximidade',
    componente: 'Sensor + LED',
    corComponente: '#8ee84c',
    iconeSetor: 'icone_modulo_us.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O LED vermelho acende quando algo chega PERTO do sensor.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO como ENTRADA (igual à fase anterior).' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(6, LOW);', explicacao: '(o pulso TRIG + pulseIn são iguais à fase anterior)' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Distância em blocos.' },
          { codigo: 'if (dist < 5) {', explicacao: 'Menos de 5 blocos = perigo...' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...liga o alarme.' },
          { codigo: '} else {', explicacao: 'Senão...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...desliga.' },
          { codigo: '}' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Chegue perto do sensor pra testar, depois se afaste.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }, { comp: 'led', pino: 10, cor: 'red' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  if (dist < 5) {\n' +
      '    digitalWrite(10, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(10, LOW);\n' +
      '  }\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- us_3 — Brilho pela distância ---------------- */
  {
    id: 'us_3', setor: 'us',
    missao: 'Missão 3', nome: 'Brilho pela distância',
    componente: 'Sensor + LED (PWM)',
    corComponente: '#8ee84c',
    iconeSetor: 'icone_modulo_us.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Agora o LED não só liga/desliga — o BRILHO acompanha a distância.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 (tem **~**, aceita PWM) como **SAÍDA**.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO como **ENTRADA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(6, LOW);', explicacao: '(o pulso TRIG + pulseIn são iguais às fases anteriores)' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Distância em blocos.' },
          { codigo: 'int brilho = map(dist, 0, 20, 0, 255);', explicacao: 'Converte blocos (0 a 20) pra escala do PWM (0-255).' },
          { codigo: 'analogWrite(11, brilho);', explicacao: 'Escreve o brilho convertido no LED.' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Afaste-se bem devagar do sensor pra ver o brilho aumentar todo.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }, { comp: 'led', pino: 11, cor: 'yellow' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  int brilho = map(dist, 0, 20, 0, 255);\n' +
      '  analogWrite(11, brilho);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- us_4 — Barra de proximidade com LEDs ---------------- */
  {
    id: 'us_4', setor: 'us',
    missao: 'Missão 4', nome: 'Barra de proximidade com LEDs',
    componente: 'Sensor + 3 LEDs',
    corComponente: '#8ee84c',
    iconeSetor: 'icone_modulo_us.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Três LEDs avisam o quão perto algo chegou — só UM aceso por vez.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(12, OUTPUT);', explicacao: 'Configura o pino 12 como **SAÍDA**.' },
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 como **SAÍDA**.' },
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO como **ENTRADA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(6, LOW);', explicacao: '(o pulso TRIG + pulseIn são iguais às fases anteriores)' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Distância em blocos.' },
          { codigo: 'if (dist <= 6) {', explicacao: 'Perto (até 6 blocos)...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...acende só o vermelho.' },
          { codigo: '  digitalWrite(11, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...acende só o vermelho.' },
          { codigo: '} else if (dist <= 13) {', explicacao: 'Médio (até 13 blocos)...' },
          { codigo: '  digitalWrite(12, LOW);', explicacao: '...acende só o amarelo.' },
          { codigo: '  digitalWrite(11, HIGH);', explicacao: '...acende só o amarelo.' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '} else {', explicacao: 'Longe (mais de 13 blocos)...' },
          { codigo: '  digitalWrite(12, HIGH);', explicacao: '...acende só o verde.' },
          { codigo: '  digitalWrite(11, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...e apaga os outros dois.' },
          { codigo: '}' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Em CADA bloco, lembre de apagar os LEDs que não são desse bloco.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }, { comp: 'led', pino: 12, cor: 'green' }, { comp: 'led', pino: 11, cor: 'yellow' }, { comp: 'led', pino: 10, cor: 'red' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(12, OUTPUT);\n' +
      '  pinMode(11, OUTPUT);\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  if (dist <= 6) {\n' +
      '    digitalWrite(12, LOW);\n' +
      '    digitalWrite(11, LOW);\n' +
      '    digitalWrite(10, HIGH);\n' +
      '  } else if (dist <= 13) {\n' +
      '    digitalWrite(12, LOW);\n' +
      '    digitalWrite(11, HIGH);\n' +
      '    digitalWrite(10, LOW);\n' +
      '  } else {\n' +
      '    digitalWrite(12, HIGH);\n' +
      '    digitalWrite(11, LOW);\n' +
      '    digitalWrite(10, LOW);\n' +
      '  }\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- us_5 — Limitando a leitura do sensor ---------------- */
  {
    id: 'us_5', setor: 'us',
    missao: 'Missão 5', nome: 'Limitando a leitura do sensor',
    componente: 'Sensor + LED (PWM)',
    corComponente: '#8ee84c',
    iconeSetor: 'icone_modulo_us.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'map() pode calcular mais do que o LED aceita — constrain() trava o valor.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'pinMode(11, OUTPUT);', explicacao: 'Configura o pino 11 (tem **~**, aceita PWM) como **SAÍDA**.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO como **ENTRADA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(6, LOW);', explicacao: '(o pulso TRIG + pulseIn são iguais às fases anteriores)' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Distância em blocos.' },
          { codigo: 'int bruto = map(dist, 0, 20, 0, 300);', explicacao: 'Converte pra uma escala de 0 a 300 — mas o LED só aceita até 255!' },
          { codigo: 'int brilho = constrain(bruto, 0, 200);', explicacao: 'TRAVA o valor entre 0 e 200, mesmo quando o map() calcular mais que isso.' },
          { codigo: 'analogWrite(11, brilho);', explicacao: 'Escreve o brilho (já travado) no LED.' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Sem o constrain, o LED tentaria passar de 200 quando você chegasse bem perto.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }, { comp: 'led', pino: 11, cor: 'yellow' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(11, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  int bruto = map(dist, 0, 20, 0, 300);\n' +
      '  int brilho = constrain(bruto, 0, 200);\n' +
      '  analogWrite(11, brilho);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- buz_1 — Tocando a primeira nota ---------------- */
  {
    id: 'buz_1', setor: 'buzzer',
    missao: 'Missão 1', nome: 'Tocando a primeira nota',
    componente: 'Tocando a primeira nota',
    corComponente: '#e84c6b',
    iconeSetor: 'icone_modulo_buzzer.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Toque uma nota contínua de 440 Hz no buzzer passivo ligado ao D5.',
    aviso: 'Na placa física, use buzzer piezo passivo adequado ao pino, com sinal em D5 e negativo no GND. Buzzer ativo não reproduz as notas da mesma forma.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  pinMode(5, OUTPUT);', explicacao: 'Configura **D5** como saída digital. O pino poderá controlar o componente conectado.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  tone(5, 440);', explicacao: 'Mantém uma nota contínua de **440 Hz** no buzzer passivo ligado ao D5. Sem duração, o tom continua até noTone(). Repetir a mesma frequência no loop não cria pausas; Hz muda a altura do som, não o volume.' },
        ],
      },
    ],
    dica: 'Configure D5 com pinMode(5, OUTPUT); no setup(). No loop(), use tone(5, 440); para manter a nota contínua.',
    kit: [{ comp: 'buzzer', pino: 5 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(5, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  tone(5, 440);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- buz_2 — Som e silêncio ---------------- */
  {
    id: 'buz_2', setor: 'buzzer',
    missao: 'Missão 2', nome: 'Som e silêncio',
    componente: 'Som e silêncio',
    corComponente: '#e84c6b',
    iconeSetor: 'icone_modulo_buzzer.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Alterne 700 ms de som de 440 Hz e 700 ms de silêncio, repetidamente.',
    aviso: 'Na placa física, use buzzer piezo passivo adequado ao pino, com sinal em D5 e negativo no GND. Buzzer ativo não reproduz as notas da mesma forma.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  pinMode(5, OUTPUT);', explicacao: 'Configura **D5** como saída digital. O pino poderá controlar o componente conectado.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  tone(5, 440);', explicacao: 'Gera uma onda quadrada de **440 Hz** no pino 5 para um buzzer passivo. Continua até noTone() ou outra frequência. Hz altera a altura do som, não o volume.' },
          { codigo: '  delay(700);', explicacao: 'Espera **700 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '  noTone(5);', explicacao: 'Interrompe a onda gerada por tone() neste pino e encerra o som do buzzer passivo.' },
          { codigo: '  delay(700);', explicacao: 'Espera **700 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'tone(5, 440); delay(700); noTone(5); delay(700);',
    kit: [{ comp: 'buzzer', pino: 5 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(5, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  tone(5, 440);\n' +
      '  delay(700);\n' +
      '  noTone(5);\n' +
      '  delay(700);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- buz_3 — Campainha com botão ---------------- */
  {
    id: 'buz_3', setor: 'buzzer',
    missao: 'Missão 3', nome: 'Campainha com botão',
    componente: 'Campainha com botão',
    corComponente: '#e84c6b',
    iconeSetor: 'icone_modulo_buzzer.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Toque 660 Hz enquanto o botão D2 estiver pressionado e fique em silêncio ao soltá-lo.',
    aviso: 'Na placa física, use buzzer piezo passivo adequado ao pino, com sinal em D5 e negativo no GND. Buzzer ativo não reproduz as notas da mesma forma. Botão entre D2 e GND; INPUT_PULLUP mantém HIGH quando solto.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  pinMode(5, OUTPUT);', explicacao: 'Configura **D5** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(2, INPUT_PULLUP);', explicacao: 'Configura **D2** como entrada com resistor pull-up interno. Ligue o botão entre D2 e GND; pressionado será LOW.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  int estado = digitalRead(2);', explicacao: 'Lê D2: com INPUT_PULLUP, botão solto é HIGH e pressionado contra GND é LOW.' },
          { codigo: '  if (estado == LOW) {', explicacao: 'Executa o bloco sonoro quando o botão liga D2 ao GND e a leitura é **LOW**.' },
          { codigo: '    tone(5, 660);', explicacao: 'Gera uma onda quadrada de **660 Hz** no pino 5 para um buzzer passivo. Continua até noTone() ou outra frequência. Hz altera a altura do som, não o volume.' },
          { codigo: '    Serial.println("ESTADO:TOCANDO");', explicacao: 'Envia o texto **ESTADO:TOCANDO** e termina a linha no Monitor Serial.' },
          { codigo: '  } else {', explicacao: 'Abre o caminho alternativo, executado quando a condição do if é falsa.' },
          { codigo: '    noTone(5);', explicacao: 'Interrompe a onda gerada por tone() neste pino e encerra o som do buzzer passivo.' },
          { codigo: '    Serial.println("ESTADO:SILENCIO");', explicacao: 'Envia o texto **ESTADO:SILENCIO** e termina a linha no Monitor Serial.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  delay(200);', explicacao: 'Espera **200 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Leia D2 com INPUT_PULLUP; no ramo LOW use tone(5, 660) e no outro noTone(5).',
    kit: [{ comp: 'buzzer', pino: 5 }, { comp: 'button', pino: 2 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(5, OUTPUT);\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int estado = digitalRead(2);\n' +
      '  if (estado == LOW) {\n' +
      '    tone(5, 660);\n' +
      '    Serial.println("ESTADO:TOCANDO");\n' +
      '  } else {\n' +
      '    noTone(5);\n' +
      '    Serial.println("ESTADO:SILENCIO");\n' +
      '  }\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- buz_4 — Frequência pelo potenciômetro ---------------- */
  {
    id: 'buz_4', setor: 'buzzer',
    missao: 'Missão 4', nome: 'Frequência pelo potenciômetro',
    componente: 'Frequência pelo potenciômetro',
    corComponente: '#e84c6b',
    iconeSetor: 'icone_modulo_buzzer.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Faça o potenciômetro A0 controlar a frequência do buzzer D5 de 440 a 1320 Hz.',
    aviso: 'Na placa física, use buzzer piezo passivo adequado ao pino, com sinal em D5 e negativo no GND. Buzzer ativo não reproduz as notas da mesma forma. Potenciômetro: extremos em 5V/GND e cursor central em A0.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  pinMode(5, OUTPUT);', explicacao: 'Configura **D5** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  int leitura = analogRead(A0);', explicacao: 'Lê a tensão do cursor do potenciômetro em **A0**: no UNO, a leitura vai de 0 a 1023 com a referência padrão.' },
          { codigo: '  int freq = map(leitura, 0, 1023, 440, 1320);', explicacao: 'Converte a leitura para **440–1320 Hz**. map() usa aritmética inteira e não limita valores fora da faixa.' },
          { codigo: '  tone(5, freq);', explicacao: 'Gera uma onda quadrada de **freq Hz** no pino 5 para um buzzer passivo. Continua até noTone() ou outra frequência. Hz altera a altura do som, não o volume.' },
          { codigo: '  Serial.print("FREQ:");', explicacao: 'Envia o texto **FREQ:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '  Serial.println(freq);', explicacao: 'Envia o valor atual de **freq** e termina a linha no Monitor Serial.' },
          { codigo: '  delay(200);', explicacao: 'Espera **200 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'int freq = map(analogRead(A0), 0, 1023, 440, 1320); tone(5, freq);',
    kit: [{ comp: 'buzzer', pino: 5 }, { comp: 'pot', pino: 'A0' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(5, OUTPUT);\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int leitura = analogRead(A0);\n' +
      '  int freq = map(leitura, 0, 1023, 440, 1320);\n' +
      '  tone(5, freq);\n' +
      '  Serial.print("FREQ:");\n' +
      '  Serial.println(freq);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- buz_5 — Alarme de proximidade ---------------- */
  {
    id: 'buz_5', setor: 'buzzer',
    missao: 'Missão 5', nome: 'Alarme de proximidade',
    componente: 'Alarme de proximidade',
    corComponente: '#e84c6b',
    iconeSetor: 'icone_modulo_buzzer.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Faça bips de 300 ms abaixo de 5 cm; sem eco válido ou a partir de 5 cm, mantenha silêncio.',
    aviso: 'Na placa física, use buzzer piezo passivo adequado ao pino, com sinal em D5 e negativo no GND. Buzzer ativo não reproduz as notas da mesma forma. HC-SR04: VCC em 5V, GND comum, TRIG em D6 e ECHO em D7. O eco real fornece cm por dur/58; no jogo, cada bloco corresponde a 1 cm simulado, sem reproduzir a escala física do mundo.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  pinMode(5, OUTPUT);', explicacao: 'Configura **D5** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(6, OUTPUT);', explicacao: 'Configura **6** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(7, INPUT);', explicacao: 'Configura **D7** como entrada para receber o pulso ECHO do sensor.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  digitalWrite(6, LOW);', explicacao: 'Coloca **TRIG/D6** em LOW. Prepara ou encerra o pulso de disparo.' },
          { codigo: '  delayMicroseconds(2);', explicacao: 'Espera **2 microssegundos** antes da próxima instrução. 1000 us equivalem a 1 ms.' },
          { codigo: '  digitalWrite(6, HIGH);', explicacao: 'Coloca **TRIG/D6** em HIGH. Mantido por 10 us, inicia a medição do HC-SR04.' },
          { codigo: '  delayMicroseconds(10);', explicacao: 'Espera **10 microssegundos** antes da próxima instrução. 1000 us equivalem a 1 ms.' },
          { codigo: '  digitalWrite(6, LOW);', explicacao: 'Coloca **TRIG/D6** em LOW. Prepara ou encerra o pulso de disparo.' },
          { codigo: '  unsigned long dur = pulseIn(7, HIGH, 30000);', explicacao: 'Mede o pulso HIGH em ECHO/D7, em **microssegundos**. Retorna 0 se não completar a medição em até 30000 us.' },
          { codigo: '  if (dur == 0) {', explicacao: 'Trata a ausência de eco; zero retornado por pulseIn não significa um objeto a zero centímetros.' },
          { codigo: '    noTone(5);', explicacao: 'Interrompe a onda gerada por tone() neste pino e encerra o som do buzzer passivo.' },
          { codigo: '    Serial.println("SEM ECO");', explicacao: 'Envia o texto **SEM ECO** e termina a linha no Monitor Serial.' },
          { codigo: '    delay(600);', explicacao: 'Espera **600 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '    return;', explicacao: 'Encerra esta passagem do loop; a próxima passagem fará uma nova medição.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  int dist = dur / 58;', explicacao: 'Para o HC-SR04, divide a ida e volta do eco por aproximadamente **58 us/cm**. A divisão inteira descarta a parte decimal. No jogo, 1 bloco corresponde a 1 cm simulado.' },
          { codigo: '  Serial.print("DIST:");', explicacao: 'Envia o texto **DIST:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '  Serial.println(dist);', explicacao: 'Envia o valor atual de **dist** e termina a linha no Monitor Serial.' },
          { codigo: '  if (dist < 5) {', explicacao: 'Ativa o alarme abaixo de **5 cm** (5 blocos na escala do jogo). Exatamente 5 fica fora do alarme.' },
          { codigo: '    tone(5, 880, 300);', explicacao: 'Gera uma onda quadrada de **880 Hz** no pino 5 para um buzzer passivo. O tom termina após 300 ms; tone() não bloqueia a execução.' },
          { codigo: '    Serial.println("ALARME:ATIVO");', explicacao: 'Envia o texto **ALARME:ATIVO** e termina a linha no Monitor Serial.' },
          { codigo: '  } else {', explicacao: 'Abre o caminho alternativo, executado quando a condição do if é falsa.' },
          { codigo: '    noTone(5);', explicacao: 'Interrompe a onda gerada por tone() neste pino e encerra o som do buzzer passivo.' },
          { codigo: '    Serial.println("ALARME:LIVRE");', explicacao: 'Envia o texto **ALARME:LIVRE** e termina a linha no Monitor Serial.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  delay(600);', explicacao: 'Espera **600 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Teste longe, perto e exatamente no limiar. Sem eco, o buzzer deve silenciar; SEM ECO não é uma distância zero.',
    kit: [{ comp: 'buzzer', pino: 5 }, { comp: 'sensor', trig: 6, echo: 7 }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(5, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  unsigned long dur = pulseIn(7, HIGH, 30000);\n' +
      '  if (dur == 0) {\n' +
      '    noTone(5);\n' +
      '    Serial.println("SEM ECO");\n' +
      '    delay(600);\n' +
      '    return;\n' +
      '  }\n' +
      '  int dist = dur / 58;\n' +
      '  Serial.print("DIST:");\n' +
      '  Serial.println(dist);\n' +
      '  if (dist < 5) {\n' +
      '    tone(5, 880, 300);\n' +
      '    Serial.println("ALARME:ATIVO");\n' +
      '  } else {\n' +
      '    noTone(5);\n' +
      '    Serial.println("ALARME:LIVRE");\n' +
      '  }\n' +
      '  delay(600);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- servo_1 — Posicionando um servo motor ---------------- */
  {
    id: 'servo_1', setor: 'servo',
    missao: 'Missão 1', nome: 'Posicionando um servo motor',
    componente: 'Servo Motor',
    corComponente: '#e88e4c',
    iconeSetor: 'icone_modulo_servo.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O Servo Motor gira até um ângulo entre 0° e 180° — e FICA lá.',
    aviso: '**NÃO** encoste no braço enquanto ele gira — ele empurra de verdade e ~~pode queimar~~.',
    secoes: [
      {
        titulo: 'No topo do arquivo:',
        linhas: [
          { codigo: '#include <Servo.h>', explicacao: 'Importa a biblioteca que sabe controlar servos.' },
          { codigo: 'Servo motor;', explicacao: 'Cria o objeto "motor", que vai representar o servo no código.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'motor.attach(9);', explicacao: 'Liga o objeto "motor" ao pino 9, onde o servo está conectado.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'motor.write(180);', explicacao: 'Gira o servo até 180° (o máximo) e mantém ele lá.' },
        ],
      },
    ],
    dica: 'NÃO encoste no braço enquanto ele gira — ele empurra de verdade e pode queimar!',
    kit: [{ comp: 'servo', pino: 9 }],
    starter: ESQUELETO,
    solucao:
      '#include <Servo.h>\n' +
      'Servo motor;\n' +
      '\n' +
      'void setup() {\n' +
      '  motor.attach(9);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  motor.write(180);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- servo_2 — Vai-e-vem do servo motor ---------------- */
  {
    id: 'servo_2', setor: 'servo',
    missao: 'Missão 2', nome: 'Vai-e-vem do servo motor',
    componente: 'Servo Motor',
    corComponente: '#e88e4c',
    iconeSetor: 'icone_modulo_servo.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Agora o braço vai e volta sozinho, sem parar.',
    secoes: [
      {
        titulo: 'No topo do arquivo:',
        linhas: [
          { codigo: '#include <Servo.h>' },
          { codigo: 'Servo motor;' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'motor.attach(9);', explicacao: 'Liga o objeto "motor" ao pino 9.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'motor.write(180);', explicacao: 'Gira o servo pra um lado.' },
          { codigo: 'delay(800);', explicacao: 'Espera 800 milissegundos.' },
          { codigo: 'motor.write(0);', explicacao: 'Gira o servo pro outro lado (0°).' },
          { codigo: 'delay(800);', explicacao: 'Espera 800 milissegundos.' },
        ],
      },
    ],
    dica: 'Fica alternando pra sempre, porque o loop() se repete.',
    kit: [{ comp: 'servo', pino: 9 }],
    starter: ESQUELETO,
    solucao:
      '#include <Servo.h>\n' +
      'Servo motor;\n' +
      '\n' +
      'void setup() {\n' +
      '  motor.attach(9);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  motor.write(180);\n' +
      '  delay(800);\n' +
      '  motor.write(0);\n' +
      '  delay(800);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- servo_3 — Servo comandado por potenciômetro ---------------- */
  {
    id: 'servo_3', setor: 'servo',
    missao: 'Missão 3', nome: 'Servo comandado por potenciômetro',
    componente: 'Potenciômetro + Servo',
    corComponente: '#e88e4c',
    iconeSetor: 'icone_modulo_servo.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O ângulo do servo agora segue o potenciômetro, igual você já fez com o LED.',
    secoes: [
      {
        titulo: 'No topo do arquivo:',
        linhas: [
          { codigo: '#include <Servo.h>' },
          { codigo: 'Servo motor;' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'motor.attach(9);', explicacao: 'Liga o objeto "motor" ao pino 9.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'int valor = analogRead(A0);', explicacao: 'Lê o potenciômetro (0 a 1023).' },
          { codigo: 'int angulo = map(valor, 0, 1023, 0, 180);', explicacao: 'Converte a escala do pot (0-1023) pra escala de ângulo (0°-180°).' },
          { codigo: 'motor.write(angulo);', explicacao: 'Gira o servo pro ângulo convertido.' },
        ],
      },
    ],
    dica: 'Gire o potenciômetro de ponta a ponta pra ver o servo acompanhar todo o curso.',
    kit: [{ comp: 'pot', pino: 'A0' }, { comp: 'servo', pino: 9 }],
    starter: ESQUELETO,
    solucao:
      '#include <Servo.h>\n' +
      'Servo motor;\n' +
      '\n' +
      'void setup() {\n' +
      '  motor.attach(9);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  int angulo = map(valor, 0, 1023, 0, 180);\n' +
      '  motor.write(angulo);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- servo_4 — Servo comandado por sensor ---------------- */
  {
    id: 'servo_4', setor: 'servo',
    missao: 'Missão 4', nome: 'Servo comandado por sensor',
    componente: 'Sensor + Servo',
    corComponente: '#e88e4c',
    iconeSetor: 'icone_modulo_servo.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Agora é o Sensor Ultrassônico que controla o ângulo do servo.',
    secoes: [
      {
        titulo: 'No topo do arquivo:',
        linhas: [
          { codigo: '#include <Servo.h>' },
          { codigo: 'Servo motor;' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'motor.attach(9);', explicacao: 'Liga o objeto "motor" ao pino 9.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO como **ENTRADA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'digitalWrite(6, LOW);', explicacao: '(o pulso TRIG + pulseIn são iguais ao Setor 4)' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Distância em blocos.' },
          { codigo: 'int angulo = map(dist, 0, 20, 0, 180);', explicacao: 'Converte a distância pra ângulo (0°-180°).' },
          { codigo: 'motor.write(angulo);', explicacao: 'Gira o servo pro ângulo convertido.' },
          { codigo: 'delay(200);', explicacao: 'Uma pequena pausa entre uma leitura e outra.' },
        ],
      },
    ],
    dica: 'Afaste-se e aproxime-se bem devagar pra ver o braço acompanhar todo o curso.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }, { comp: 'servo', pino: 9 }],
    starter: ESQUELETO,
    solucao:
      '#include <Servo.h>\n' +
      'Servo motor;\n' +
      '\n' +
      'void setup() {\n' +
      '  motor.attach(9);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  int angulo = map(dist, 0, 20, 0, 180);\n' +
      '  motor.write(angulo);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- servo_5 — Radar com servo e sensor ---------------- */
  {
    id: 'servo_5', setor: 'servo',
    missao: 'Missão 5', nome: 'Radar com servo e sensor',
    componente: 'Sensor + Servo + LED',
    corComponente: '#e88e4c',
    iconeSetor: 'icone_modulo_servo.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'O radar gira sozinho E acende o alarme quando algo chega perto.',
    secoes: [
      {
        titulo: 'No topo do arquivo:',
        linhas: [
          { codigo: '#include <Servo.h>' },
          { codigo: 'Servo motor;' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: 'motor.attach(9);', explicacao: 'Liga o objeto "motor" ao pino 9.' },
          { codigo: 'pinMode(10, OUTPUT);', explicacao: 'Configura o pino 10 como **SAÍDA**.' },
          { codigo: 'pinMode(6, OUTPUT);', explicacao: 'Configura o pino 6 como **SAÍDA**.' },
          { codigo: 'pinMode(7, INPUT);', explicacao: 'ECHO como **ENTRADA**.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: 'motor.write(180);', explicacao: 'Gira o servo pra um lado...' },
          { codigo: 'delay(500);', explicacao: 'Espera 500 milissegundos.' },
          { codigo: 'motor.write(0);', explicacao: '...e pro outro, varrendo como um radar.' },
          { codigo: 'delay(500);', explicacao: 'Espera 500 milissegundos.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: '(o pulso TRIG + pulseIn são iguais aos de sempre)' },
          { codigo: 'delayMicroseconds(2);', explicacao: 'Pausa de 2 microssegundos — garante que o TRIG está mesmo em **LOW** antes de disparar.' },
          { codigo: 'digitalWrite(6, HIGH);', explicacao: 'Dispara o pulso de som.' },
          { codigo: 'delayMicroseconds(10);', explicacao: 'Mantém o TRIG em **HIGH** por 10 microssegundos — o tempo mínimo que o sensor precisa para disparar o pulso de som.' },
          { codigo: 'digitalWrite(6, LOW);', explicacao: 'Termina o pulso.' },
          { codigo: 'long dur = pulseIn(7, HIGH);', explicacao: 'Aguarda o ECHO ficar em **HIGH**, mede a duração do pulso em microssegundos e guarda o resultado na variável dur.' },
          { codigo: 'int dist = dur / 58;', explicacao: 'Distância em blocos.' },
          { codigo: 'if (dist < 5) {', explicacao: 'Menos de 5 blocos = perigo...' },
          { codigo: '  digitalWrite(10, HIGH);', explicacao: '...liga o alarme.' },
          { codigo: '} else {', explicacao: 'Senão...' },
          { codigo: '  digitalWrite(10, LOW);', explicacao: '...desliga.' },
          { codigo: '}' },
        ],
      },
    ],
    dica: 'As duas partes ficam dentro do mesmo loop(), uma depois da outra.',
    kit: [{ comp: 'sensor', trig: 6, echo: 7 }, { comp: 'servo', pino: 9 }, { comp: 'led', pino: 10, cor: 'red' }],
    starter: ESQUELETO,
    solucao:
      '#include <Servo.h>\n' +
      'Servo motor;\n' +
      '\n' +
      'void setup() {\n' +
      '  motor.attach(9);\n' +
      '  pinMode(10, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  motor.write(180);\n' +
      '  delay(500);\n' +
      '  motor.write(0);\n' +
      '  delay(500);\n' +
      '\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  long dur = pulseIn(7, HIGH);\n' +
      '  int dist = dur / 58;\n' +
      '  if (dist < 5) {\n' +
      '    digitalWrite(10, HIGH);\n' +
      '  } else {\n' +
      '    digitalWrite(10, LOW);\n' +
      '  }\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- disp_1 — Formando o número 1 ---------------- */
  {
    id: 'disp_1', setor: 'd7',
    missao: 'Missão 1', nome: 'Formando o número 1',
    componente: 'Formando o número 1',
    corComponente: '#4ce8a0',
    iconeSetor: 'icone_modulo_d7.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Mostre 1: acenda somente b/D3 e c/D4 e apague os outros segmentos, inclusive DP.',
    aviso: 'Use display de **cátodo comum**, COM no GND e um resistor em série por segmento conectado, inclusive DP. No jogo são 220 ohms; na placa, dimensione os resistores pela corrente do LED e pelos limites do UNO.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  pinMode(2, OUTPUT);', explicacao: 'Configura **2** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(3, OUTPUT);', explicacao: 'Configura **3** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(4, OUTPUT);', explicacao: 'Configura **4** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(5, OUTPUT);', explicacao: 'Configura **5** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(6, OUTPUT);', explicacao: 'Configura **6** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(7, OUTPUT);', explicacao: 'Configura **7** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(8, OUTPUT);', explicacao: 'Configura **8** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(9, OUTPUT);', explicacao: 'Configura **9** como saída digital. O pino poderá controlar o componente conectado.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  digitalWrite(2, LOW);', explicacao: 'Apaga o segmento **a** pelo pino 2. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(3, HIGH);', explicacao: 'Acende o segmento **b** pelo pino 3. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(4, HIGH);', explicacao: 'Acende o segmento **c** pelo pino 4. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(5, LOW);', explicacao: 'Apaga o segmento **d** pelo pino 5. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(6, LOW);', explicacao: 'Apaga o segmento **e** pelo pino 6. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(7, LOW);', explicacao: 'Apaga o segmento **f** pelo pino 7. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(8, LOW);', explicacao: 'Apaga o segmento **g** pelo pino 8. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(9, LOW);', explicacao: 'Apaga o segmento **DP** pelo pino 9. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
        ],
      },
    ],
    dica: 'O 1 usa apenas b e c: HIGH em D3 e D4; LOW nos outros seis pinos.',
    kit: [{ comp: 'display1' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  pinMode(2, OUTPUT);\n' +
      '  pinMode(3, OUTPUT);\n' +
      '  pinMode(4, OUTPUT);\n' +
      '  pinMode(5, OUTPUT);\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, OUTPUT);\n' +
      '  pinMode(8, OUTPUT);\n' +
      '  pinMode(9, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(2, LOW);\n' +
      '  digitalWrite(3, HIGH);\n' +
      '  digitalWrite(4, HIGH);\n' +
      '  digitalWrite(5, LOW);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  digitalWrite(7, LOW);\n' +
      '  digitalWrite(8, LOW);\n' +
      '  digitalWrite(9, LOW);\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- disp_2 — Alternando 0 e 8 ---------------- */
  {
    id: 'disp_2', setor: 'd7',
    missao: 'Missão 2', nome: 'Alternando 0 e 8',
    componente: 'Alternando 0 e 8',
    corComponente: '#4ce8a0',
    iconeSetor: 'icone_modulo_d7.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Alterne 0 e 8 a cada 800 ms; mantenha o ponto decimal apagado.',
    aviso: 'Use display de **cátodo comum**, COM no GND e um resistor em série por segmento conectado, inclusive DP. No jogo são 220 ohms; na placa, dimensione os resistores pela corrente do LED e pelos limites do UNO.',
    secoes: [
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  for (int p = 2; p <= 9; p++) {', explicacao: 'Repete o bloco com p de 2 até 9 para configurar os oito pinos do display.' },
          { codigo: '    pinMode(p, OUTPUT);', explicacao: 'Configura o pino selecionado pelo índice como saída digital.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  digitalWrite(9, LOW);', explicacao: 'Apaga o segmento **DP** pelo pino 9. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(2, HIGH);', explicacao: 'Acende o segmento **a** pelo pino 2. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(3, HIGH);', explicacao: 'Acende o segmento **b** pelo pino 3. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(4, HIGH);', explicacao: 'Acende o segmento **c** pelo pino 4. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(5, HIGH);', explicacao: 'Acende o segmento **d** pelo pino 5. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(6, HIGH);', explicacao: 'Acende o segmento **e** pelo pino 6. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(7, HIGH);', explicacao: 'Acende o segmento **f** pelo pino 7. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(8, LOW);', explicacao: 'Apaga o segmento **g** pelo pino 8. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  delay(800);', explicacao: 'Espera **800 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '  digitalWrite(8, HIGH);', explicacao: 'Acende o segmento **g** pelo pino 8. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  delay(800);', explicacao: 'Espera **800 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Deixe a–f HIGH; alterne apenas g entre LOW e HIGH com delay(800).',
    kit: [{ comp: 'display1' }],
    starter: ESQUELETO,
    solucao:
      'void setup() {\n' +
      '  for (int p = 2; p <= 9; p++) {\n' +
      '    pinMode(p, OUTPUT);\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(9, LOW);\n' +
      '  digitalWrite(2, HIGH);\n' +
      '  digitalWrite(3, HIGH);\n' +
      '  digitalWrite(4, HIGH);\n' +
      '  digitalWrite(5, HIGH);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  digitalWrite(7, HIGH);\n' +
      '  digitalWrite(8, LOW);\n' +
      '  delay(800);\n' +
      '  digitalWrite(8, HIGH);\n' +
      '  delay(800);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- disp_3 — Contando de 0 a 9 ---------------- */
  {
    id: 'disp_3', setor: 'd7',
    missao: 'Missão 3', nome: 'Contando de 0 a 9',
    componente: 'Contando de 0 a 9',
    corComponente: '#4ce8a0',
    iconeSetor: 'icone_modulo_d7.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Conte de 0 a 9 com 600 ms por dígito e envie DIGITO:<valor> ao Monitor Serial.',
    aviso: 'Use display de **cátodo comum**, COM no GND e um resistor em série por segmento conectado, inclusive DP. No jogo são 220 ohms; na placa, dimensione os resistores pela corrente do LED e pelos limites do UNO.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: 'int pinos[7] = {2, 3, 4, 5, 6, 7, 8};', explicacao: 'Declara o vetor com sete pinos, na ordem **a, b, c, d, e, f, g**; seus índices vão de 0 a 6.' },
          { codigo: 'int digitos[10][7] = {', explicacao: 'Declara a tabela de **10 dígitos**. Cada linha tem 7 valores na ordem a, b, c, d, e, f, g: 1 acende e 0 apaga.' },
          { codigo: '  {1, 1, 1, 1, 1, 1, 0},', explicacao: 'Padrão do dígito **0**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {0, 1, 1, 0, 0, 0, 0},', explicacao: 'Padrão do dígito **1**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 0, 1, 1, 0, 1},', explicacao: 'Padrão do dígito **2**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 0, 0, 1},', explicacao: 'Padrão do dígito **3**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {0, 1, 1, 0, 0, 1, 1},', explicacao: 'Padrão do dígito **4**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 0, 1, 1, 0, 1, 1},', explicacao: 'Padrão do dígito **5**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 0, 1, 1, 1, 1, 1},', explicacao: 'Padrão do dígito **6**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 0, 0, 0, 0},', explicacao: 'Padrão do dígito **7**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 1, 1, 1},', explicacao: 'Padrão do dígito **8**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 0, 1, 1}', explicacao: 'Padrão do dígito **9**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '};', explicacao: 'Fecha a tabela e termina a declaração com ponto e vírgula.' },
          { codigo: 'void mostrarDigito(int n) {', explicacao: 'Define uma função auxiliar que recebe o dígito em **n** (0–9). Ela só executa quando é chamada pelo programa.' },
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Repete o bloco para os sete índices do vetor, de 0 a 6.' },
          { codigo: '    digitalWrite(pinos[i], digitos[n][i]);', explicacao: 'Escreve no pino do segmento i o valor digitos[n][i]: 1 acende e 0 apaga.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  digitalWrite(9, LOW);', explicacao: 'Apaga o segmento **DP** pelo pino 9. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '}', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Repete o bloco para os sete índices do vetor, de 0 a 6.' },
          { codigo: '    pinMode(pinos[i], OUTPUT);', explicacao: 'Configura o pino selecionado pelo índice como saída digital.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  pinMode(9, OUTPUT);', explicacao: 'Configura **9** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  for (int n = 0; n <= 9; n++) {', explicacao: 'Repete com n de **0 até 9**, incluindo os dois extremos; n++ avança para o próximo dígito.' },
          { codigo: '    mostrarDigito(n);', explicacao: 'Chama a função definida acima para escrever os sete segmentos do dígito n.' },
          { codigo: '    Serial.print("DIGITO:");', explicacao: 'Envia o texto **DIGITO:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '    Serial.println(n);', explicacao: 'Envia o valor atual de **n** e termina a linha no Monitor Serial.' },
          { codigo: '    delay(600);', explicacao: 'Espera **600 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
        ],
      },
    ],
    dica: 'Declare pinos[7], digitos[10][7], crie mostrarDigito e percorra n de 0 a 9.',
    kit: [{ comp: 'display1' }],
    starter: ESQUELETO,
    solucao:
      'int pinos[7] = {2, 3, 4, 5, 6, 7, 8};\n' +
      'int digitos[10][7] = {\n' +
      '  {1, 1, 1, 1, 1, 1, 0},\n' +
      '  {0, 1, 1, 0, 0, 0, 0},\n' +
      '  {1, 1, 0, 1, 1, 0, 1},\n' +
      '  {1, 1, 1, 1, 0, 0, 1},\n' +
      '  {0, 1, 1, 0, 0, 1, 1},\n' +
      '  {1, 0, 1, 1, 0, 1, 1},\n' +
      '  {1, 0, 1, 1, 1, 1, 1},\n' +
      '  {1, 1, 1, 0, 0, 0, 0},\n' +
      '  {1, 1, 1, 1, 1, 1, 1},\n' +
      '  {1, 1, 1, 1, 0, 1, 1}\n' +
      '};\n' +
      'void mostrarDigito(int n) {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    digitalWrite(pinos[i], digitos[n][i]);\n' +
      '  }\n' +
      '  digitalWrite(9, LOW);\n' +
      '}\n' +
      '\n' +
      'void setup() {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    pinMode(pinos[i], OUTPUT);\n' +
      '  }\n' +
      '  pinMode(9, OUTPUT);\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  for (int n = 0; n <= 9; n++) {\n' +
      '    mostrarDigito(n);\n' +
      '    Serial.print("DIGITO:");\n' +
      '    Serial.println(n);\n' +
      '    delay(600);\n' +
      '  }\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- disp_4 — Mostrando dois dígitos ---------------- */
  {
    id: 'disp_4', setor: 'd7',
    missao: 'Missão 4', nome: 'Mostrando dois dígitos',
    componente: 'Mostrando dois dígitos',
    corComponente: '#4ce8a0',
    iconeSetor: 'icone_modulo_d7.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Mostre 42 com duas casas independentes: divisão inteira para a dezena e resto para a unidade.',
    aviso: 'Use display de **cátodo comum**, COM no GND e um resistor em série por segmento conectado, inclusive DP. No jogo são 220 ohms; na placa, dimensione os resistores pela corrente do LED e pelos limites do UNO. O display2 do jogo representa **dois displays de um dígito independentes**, com dois COM no GND e 16 resistores. Displays duplos com segmentos compartilhados exigem multiplexação e outro circuito. A0–A3 são usados como saídas digitais; D0/D1 ficam livres para Serial.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: 'int dezena[7] = {2, 3, 4, 5, 6, 7, 8};', explicacao: 'Declara o vetor com sete pinos, na ordem **a, b, c, d, e, f, g**; seus índices vão de 0 a 6.' },
          { codigo: 'int unidade[7] = {10, 11, 12, 13, A0, A1, A2};', explicacao: 'Declara o vetor de pinos na ordem **a, b, c, d, e, f, g**. Os índices vão de 0 a 6; A0–A2 também podem ser saídas digitais no UNO.' },
          { codigo: 'int digitos[10][7] = {', explicacao: 'Declara a tabela de **10 dígitos**. Cada linha tem 7 valores na ordem a, b, c, d, e, f, g: 1 acende e 0 apaga.' },
          { codigo: '  {1, 1, 1, 1, 1, 1, 0},', explicacao: 'Padrão do dígito **0**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {0, 1, 1, 0, 0, 0, 0},', explicacao: 'Padrão do dígito **1**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 0, 1, 1, 0, 1},', explicacao: 'Padrão do dígito **2**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 0, 0, 1},', explicacao: 'Padrão do dígito **3**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {0, 1, 1, 0, 0, 1, 1},', explicacao: 'Padrão do dígito **4**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 0, 1, 1, 0, 1, 1},', explicacao: 'Padrão do dígito **5**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 0, 1, 1, 1, 1, 1},', explicacao: 'Padrão do dígito **6**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 0, 0, 0, 0},', explicacao: 'Padrão do dígito **7**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 1, 1, 1},', explicacao: 'Padrão do dígito **8**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 0, 1, 1}', explicacao: 'Padrão do dígito **9**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '};', explicacao: 'Fecha a tabela e termina a declaração com ponto e vírgula.' },
          { codigo: 'void mostrarDezena(int n) {', explicacao: 'Define uma função auxiliar que recebe o dígito em **n** (0–9). Ela só executa quando é chamada pelo programa.' },
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Repete o bloco para os sete índices do vetor, de 0 a 6.' },
          { codigo: '    digitalWrite(dezena[i], digitos[n][i]);', explicacao: 'Escreve no pino do segmento i o valor digitos[n][i]: 1 acende e 0 apaga.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '}', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: 'void mostrarUnidade(int n) {', explicacao: 'Define uma função auxiliar que recebe o dígito em **n** (0–9). Ela só executa quando é chamada pelo programa.' },
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Repete o bloco para os sete índices do vetor, de 0 a 6.' },
          { codigo: '    digitalWrite(unidade[i], digitos[n][i]);', explicacao: 'Escreve no pino do segmento i o valor digitos[n][i]: 1 acende e 0 apaga.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '}', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Percorre os sete índices do vetor, de **0 a 6**, para configurar as duas casas do display.' },
          { codigo: '    pinMode(dezena[i], OUTPUT);', explicacao: 'Configura **dezena[i]** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '    pinMode(unidade[i], OUTPUT);', explicacao: 'Configura **unidade[i]** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  pinMode(9, OUTPUT);', explicacao: 'Configura **9** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(A3, OUTPUT);', explicacao: 'Configura **A3** como saída digital. A3 corresponde ao número digital 17 no UNO.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  digitalWrite(9, LOW);', explicacao: 'Apaga o segmento **DP1** pelo pino 9. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(A3, LOW);', explicacao: 'Apaga o segmento **DP2** pelo pino A3. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  int numero = 42;', explicacao: 'Guarda o número inteiro 42 que será dividido entre as duas casas.' },
          { codigo: '  mostrarDezena(numero / 10);', explicacao: 'A divisão inteira 42 / 10 resulta em **4**; escreve esse dígito na dezena.' },
          { codigo: '  mostrarUnidade(numero % 10);', explicacao: 'O resto 42 % 10 resulta em **2**; escreve esse dígito na unidade.' },
          { codigo: '  delay(1000);', explicacao: 'Espera **1000 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Use dois vetores: 2..8 e 10..16; para 42, calcule 42/10 e 42%10.',
    kit: [{ comp: 'display2' }],
    starter: ESQUELETO,
    solucao:
      'int dezena[7] = {2, 3, 4, 5, 6, 7, 8};\n' +
      'int unidade[7] = {10, 11, 12, 13, A0, A1, A2};\n' +
      'int digitos[10][7] = {\n' +
      '  {1, 1, 1, 1, 1, 1, 0},\n' +
      '  {0, 1, 1, 0, 0, 0, 0},\n' +
      '  {1, 1, 0, 1, 1, 0, 1},\n' +
      '  {1, 1, 1, 1, 0, 0, 1},\n' +
      '  {0, 1, 1, 0, 0, 1, 1},\n' +
      '  {1, 0, 1, 1, 0, 1, 1},\n' +
      '  {1, 0, 1, 1, 1, 1, 1},\n' +
      '  {1, 1, 1, 0, 0, 0, 0},\n' +
      '  {1, 1, 1, 1, 1, 1, 1},\n' +
      '  {1, 1, 1, 1, 0, 1, 1}\n' +
      '};\n' +
      'void mostrarDezena(int n) {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    digitalWrite(dezena[i], digitos[n][i]);\n' +
      '  }\n' +
      '}\n' +
      'void mostrarUnidade(int n) {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    digitalWrite(unidade[i], digitos[n][i]);\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'void setup() {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    pinMode(dezena[i], OUTPUT);\n' +
      '    pinMode(unidade[i], OUTPUT);\n' +
      '  }\n' +
      '  pinMode(9, OUTPUT);\n' +
      '  pinMode(A3, OUTPUT);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(9, LOW);\n' +
      '  digitalWrite(A3, LOW);\n' +
      '  int numero = 42;\n' +
      '  mostrarDezena(numero / 10);\n' +
      '  mostrarUnidade(numero % 10);\n' +
      '  delay(1000);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- disp_5 — Contagem regressiva com alarme ---------------- */
  {
    id: 'disp_5', setor: 'd7',
    missao: 'Missão 5', nome: 'Contagem regressiva com alarme',
    componente: 'Contagem regressiva com alarme',
    corComponente: '#4ce8a0',
    iconeSetor: 'icone_modulo_d7.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Conte de 12 até 00 com 700 ms por número; ao final, toque 880 Hz por 600 ms e aguarde 1500 ms para reiniciar.',
    aviso: 'Use display de **cátodo comum**, COM no GND e um resistor em série por segmento conectado, inclusive DP. No jogo são 220 ohms; na placa, dimensione os resistores pela corrente do LED e pelos limites do UNO. O display2 do jogo representa **dois displays de um dígito independentes**, com dois COM no GND e 16 resistores. Displays duplos com segmentos compartilhados exigem multiplexação e outro circuito. A0–A3 são usados como saídas digitais; D0/D1 ficam livres para Serial. Buzzer passivo em A4 (digital 18); este circuito não usa LCD I2C.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: 'int dezena[7] = {2, 3, 4, 5, 6, 7, 8};', explicacao: 'Declara o vetor com sete pinos, na ordem **a, b, c, d, e, f, g**; seus índices vão de 0 a 6.' },
          { codigo: 'int unidade[7] = {10, 11, 12, 13, A0, A1, A2};', explicacao: 'Declara o vetor de pinos na ordem **a, b, c, d, e, f, g**. Os índices vão de 0 a 6; A0–A2 também podem ser saídas digitais no UNO.' },
          { codigo: 'int digitos[10][7] = {', explicacao: 'Declara a tabela de **10 dígitos**. Cada linha tem 7 valores na ordem a, b, c, d, e, f, g: 1 acende e 0 apaga.' },
          { codigo: '  {1, 1, 1, 1, 1, 1, 0},', explicacao: 'Padrão do dígito **0**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {0, 1, 1, 0, 0, 0, 0},', explicacao: 'Padrão do dígito **1**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 0, 1, 1, 0, 1},', explicacao: 'Padrão do dígito **2**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 0, 0, 1},', explicacao: 'Padrão do dígito **3**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {0, 1, 1, 0, 0, 1, 1},', explicacao: 'Padrão do dígito **4**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 0, 1, 1, 0, 1, 1},', explicacao: 'Padrão do dígito **5**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 0, 1, 1, 1, 1, 1},', explicacao: 'Padrão do dígito **6**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 0, 0, 0, 0},', explicacao: 'Padrão do dígito **7**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 1, 1, 1},', explicacao: 'Padrão do dígito **8**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '  {1, 1, 1, 1, 0, 1, 1}', explicacao: 'Padrão do dígito **9**, na ordem a–g. Cada posição corresponde ao mesmo índice no vetor de pinos.' },
          { codigo: '};', explicacao: 'Fecha a tabela e termina a declaração com ponto e vírgula.' },
          { codigo: 'void mostrarDezena(int n) {', explicacao: 'Define uma função auxiliar que recebe o dígito em **n** (0–9). Ela só executa quando é chamada pelo programa.' },
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Repete o bloco para os sete índices do vetor, de 0 a 6.' },
          { codigo: '    digitalWrite(dezena[i], digitos[n][i]);', explicacao: 'Escreve no pino do segmento i o valor digitos[n][i]: 1 acende e 0 apaga.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '}', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: 'void mostrarUnidade(int n) {', explicacao: 'Define uma função auxiliar que recebe o dígito em **n** (0–9). Ela só executa quando é chamada pelo programa.' },
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Repete o bloco para os sete índices do vetor, de 0 a 6.' },
          { codigo: '    digitalWrite(unidade[i], digitos[n][i]);', explicacao: 'Escreve no pino do segmento i o valor digitos[n][i]: 1 acende e 0 apaga.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '}', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  for (int i = 0; i < 7; i++) {', explicacao: 'Percorre os sete índices do vetor, de **0 a 6**, para configurar as duas casas do display.' },
          { codigo: '    pinMode(dezena[i], OUTPUT);', explicacao: 'Configura **dezena[i]** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '    pinMode(unidade[i], OUTPUT);', explicacao: 'Configura **unidade[i]** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  pinMode(9, OUTPUT);', explicacao: 'Configura **9** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(A3, OUTPUT);', explicacao: 'Configura **A3** como saída digital. A3 corresponde ao número digital 17 no UNO.' },
          { codigo: '  pinMode(A4, OUTPUT);', explicacao: 'Configura **A4** como saída digital. A4 corresponde ao número digital 18 no UNO.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  digitalWrite(9, LOW);', explicacao: 'Apaga o segmento **DP1** pelo pino 9. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  digitalWrite(A3, LOW);', explicacao: 'Apaga o segmento **DP2** pelo pino A3. Neste circuito de cátodo comum, HIGH acende e LOW apaga.' },
          { codigo: '  for (int n = 12; n >= 0; n--) {', explicacao: 'Repete com n de **12 até 0**, incluindo zero; n-- diminui o contador a cada repetição.' },
          { codigo: '    mostrarDezena(n / 10);', explicacao: 'Calcula a dezena com divisão inteira. Para valores abaixo de 10, escreve zero à esquerda.' },
          { codigo: '    mostrarUnidade(n % 10);', explicacao: 'Calcula a unidade pelo resto da divisão por 10; mantém as duas casas visíveis.' },
          { codigo: '    Serial.print("CONTAGEM:");', explicacao: 'Envia o texto **CONTAGEM:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '    Serial.println(n);', explicacao: 'Envia o valor atual de **n** e termina a linha no Monitor Serial.' },
          { codigo: '    delay(700);', explicacao: 'Espera **700 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  tone(A4, 880, 600);', explicacao: 'Gera uma onda quadrada de **880 Hz** no pino A4 para um buzzer passivo. O tom termina após 600 ms; tone() não bloqueia a execução.' },
          { codigo: '  Serial.println("FIM");', explicacao: 'Envia o texto **FIM** e termina a linha no Monitor Serial.' },
          { codigo: '  delay(600);', explicacao: 'Espera **600 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '  noTone(18);', explicacao: 'Interrompe a onda gerada por tone() neste pino e encerra o som do buzzer passivo.' },
          { codigo: '  delay(1500);', explicacao: 'Espera **1500 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Observe 12, 11, 10, 09 até 00; o alarme começa após a contagem, e FIM aparece no Serial.',
    kit: [{ comp: 'display2' }, { comp: 'buzzer', pino: 18 }],
    starter: ESQUELETO,
    solucao:
      'int dezena[7] = {2, 3, 4, 5, 6, 7, 8};\n' +
      'int unidade[7] = {10, 11, 12, 13, A0, A1, A2};\n' +
      'int digitos[10][7] = {\n' +
      '  {1, 1, 1, 1, 1, 1, 0},\n' +
      '  {0, 1, 1, 0, 0, 0, 0},\n' +
      '  {1, 1, 0, 1, 1, 0, 1},\n' +
      '  {1, 1, 1, 1, 0, 0, 1},\n' +
      '  {0, 1, 1, 0, 0, 1, 1},\n' +
      '  {1, 0, 1, 1, 0, 1, 1},\n' +
      '  {1, 0, 1, 1, 1, 1, 1},\n' +
      '  {1, 1, 1, 0, 0, 0, 0},\n' +
      '  {1, 1, 1, 1, 1, 1, 1},\n' +
      '  {1, 1, 1, 1, 0, 1, 1}\n' +
      '};\n' +
      'void mostrarDezena(int n) {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    digitalWrite(dezena[i], digitos[n][i]);\n' +
      '  }\n' +
      '}\n' +
      'void mostrarUnidade(int n) {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    digitalWrite(unidade[i], digitos[n][i]);\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'void setup() {\n' +
      '  for (int i = 0; i < 7; i++) {\n' +
      '    pinMode(dezena[i], OUTPUT);\n' +
      '    pinMode(unidade[i], OUTPUT);\n' +
      '  }\n' +
      '  pinMode(9, OUTPUT);\n' +
      '  pinMode(A3, OUTPUT);\n' +
      '  pinMode(A4, OUTPUT);\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(9, LOW);\n' +
      '  digitalWrite(A3, LOW);\n' +
      '  for (int n = 12; n >= 0; n--) {\n' +
      '    mostrarDezena(n / 10);\n' +
      '    mostrarUnidade(n % 10);\n' +
      '    Serial.print("CONTAGEM:");\n' +
      '    Serial.println(n);\n' +
      '    delay(700);\n' +
      '  }\n' +
      '  tone(A4, 880, 600);\n' +
      '  Serial.println("FIM");\n' +
      '  delay(600);\n' +
      '  noTone(18);\n' +
      '  delay(1500);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- lcd_1 — Escrevendo no LCD ---------------- */
  {
    id: 'lcd_1', setor: 'lcd',
    missao: 'Missão 1', nome: 'Escrevendo no LCD',
    componente: 'Escrevendo no LCD',
    corComponente: '#4ce8e0',
    iconeSetor: 'icone_modulo_lcd.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Escreva Ola, mundo! na primeira linha do LCD 16x2.',
    aviso: 'No UNO físico: LCD I2C com VCC em 5V, GND comum, **SDA em A4 e SCL em A5**. Instale LiquidCrystal_I2C compatível com init() e confira 0x27. O endereço do barramento não é um pino digital.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: '#include <Wire.h>', explicacao: 'Inclui a biblioteca do barramento **I2C**, usada na comunicação com o LCD.' },
          { codigo: '#include <LiquidCrystal_I2C.h>', explicacao: 'Inclui **LiquidCrystal_I2C**. Na IDE, instale uma versão compatível com lcd.init(), como a de Frank de Brabander.' },
          { codigo: 'LiquidCrystal_I2C lcd(0x27, 16, 2);', explicacao: 'Cria o objeto **lcd**: endereço I2C 0x27, 16 colunas e 2 linhas. Confira o endereço do seu módulo físico.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  lcd.init();', explicacao: 'Inicializa o LCD pelo barramento I2C. Esta chamada pertence à biblioteca LiquidCrystal_I2C usada aqui.' },
          { codigo: '  lcd.backlight();', explicacao: 'Liga a iluminação de fundo do LCD; não escreve nem apaga caracteres.' },
          { codigo: '  lcd.setCursor(0, 0);', explicacao: 'Posiciona o cursor na coluna **0**, primeira linha (**0**).' },
          { codigo: '  lcd.print("Ola, mundo!");', explicacao: 'Escreve **Ola, mundo!** no LCD a partir do cursor. O cursor avança a cada caractere.' },
        ],
      },
    ],
    dica: 'Use lcd.init(), lcd.backlight(), setCursor(0,0) e print("Ola, mundo!").',
    kit: [{ comp: 'lcd', pino: 100 }],
    starter: ESQUELETO,
    solucao:
      '#include <Wire.h>\n' +
      '#include <LiquidCrystal_I2C.h>\n' +
      'LiquidCrystal_I2C lcd(0x27, 16, 2);\n' +
      '\n' +
      'void setup() {\n' +
      '  lcd.init();\n' +
      '  lcd.backlight();\n' +
      '  lcd.setCursor(0, 0);\n' +
      '  lcd.print("Ola, mundo!");\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '}\n',
    xp: 20,
  },

  /* ---------------- lcd_2 — Usando as duas linhas ---------------- */
  {
    id: 'lcd_2', setor: 'lcd',
    missao: 'Missão 2', nome: 'Usando as duas linhas',
    componente: 'Usando as duas linhas',
    corComponente: '#4ce8e0',
    iconeSetor: 'icone_modulo_lcd.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Escreva Arduino Academy na primeira linha e Linha 2 na segunda.',
    aviso: 'No UNO físico: LCD I2C com VCC em 5V, GND comum, **SDA em A4 e SCL em A5**. Instale LiquidCrystal_I2C compatível com init() e confira 0x27. O endereço do barramento não é um pino digital.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: '#include <Wire.h>', explicacao: 'Inclui a biblioteca do barramento **I2C**, usada na comunicação com o LCD.' },
          { codigo: '#include <LiquidCrystal_I2C.h>', explicacao: 'Inclui **LiquidCrystal_I2C**. Na IDE, instale uma versão compatível com lcd.init(), como a de Frank de Brabander.' },
          { codigo: 'LiquidCrystal_I2C lcd(0x27, 16, 2);', explicacao: 'Cria o objeto **lcd**: endereço I2C 0x27, 16 colunas e 2 linhas. Confira o endereço do seu módulo físico.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  lcd.init();', explicacao: 'Inicializa o LCD pelo barramento I2C. Esta chamada pertence à biblioteca LiquidCrystal_I2C usada aqui.' },
          { codigo: '  lcd.backlight();', explicacao: 'Liga a iluminação de fundo do LCD; não escreve nem apaga caracteres.' },
          { codigo: '  lcd.setCursor(0, 0);', explicacao: 'Posiciona o cursor na coluna **0**, primeira linha (**0**).' },
          { codigo: '  lcd.print("Arduino Academy");', explicacao: 'Escreve **Arduino Academy** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '  lcd.print("Linha 2");', explicacao: 'Escreve **Linha 2** no LCD a partir do cursor. O cursor avança a cada caractere.' },
        ],
      },
    ],
    dica: 'Reposicione com setCursor(0, 1) antes de escrever Linha 2.',
    kit: [{ comp: 'lcd', pino: 100 }],
    starter: ESQUELETO,
    solucao:
      '#include <Wire.h>\n' +
      '#include <LiquidCrystal_I2C.h>\n' +
      'LiquidCrystal_I2C lcd(0x27, 16, 2);\n' +
      '\n' +
      'void setup() {\n' +
      '  lcd.init();\n' +
      '  lcd.backlight();\n' +
      '  lcd.setCursor(0, 0);\n' +
      '  lcd.print("Arduino Academy");\n' +
      '  lcd.setCursor(0, 1);\n' +
      '  lcd.print("Linha 2");\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- lcd_3 — Potenciômetro na tela ---------------- */
  {
    id: 'lcd_3', setor: 'lcd',
    missao: 'Missão 3', nome: 'Potenciômetro na tela',
    componente: 'Potenciômetro na tela',
    corComponente: '#4ce8e0',
    iconeSetor: 'icone_modulo_lcd.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Mostre POT: na primeira linha e a leitura 0–1023 de A0 na segunda; envie POT:<valor> ao Serial.',
    aviso: 'No UNO físico: LCD I2C com VCC em 5V, GND comum, **SDA em A4 e SCL em A5**. Instale LiquidCrystal_I2C compatível com init() e confira 0x27. O endereço do barramento não é um pino digital. Potenciômetro: extremos em 5V/GND e cursor central em A0.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: '#include <Wire.h>', explicacao: 'Inclui a biblioteca do barramento **I2C**, usada na comunicação com o LCD.' },
          { codigo: '#include <LiquidCrystal_I2C.h>', explicacao: 'Inclui **LiquidCrystal_I2C**. Na IDE, instale uma versão compatível com lcd.init(), como a de Frank de Brabander.' },
          { codigo: 'LiquidCrystal_I2C lcd(0x27, 16, 2);', explicacao: 'Cria o objeto **lcd**: endereço I2C 0x27, 16 colunas e 2 linhas. Confira o endereço do seu módulo físico.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  lcd.init();', explicacao: 'Inicializa o LCD pelo barramento I2C. Esta chamada pertence à biblioteca LiquidCrystal_I2C usada aqui.' },
          { codigo: '  lcd.backlight();', explicacao: 'Liga a iluminação de fundo do LCD; não escreve nem apaga caracteres.' },
          { codigo: '  lcd.setCursor(0, 0);', explicacao: 'Posiciona o cursor na coluna **0**, primeira linha (**0**).' },
          { codigo: '  lcd.print("POT:");', explicacao: 'Escreve **POT:** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  int valor = analogRead(A0);', explicacao: 'Lê A0 (0–1023 no UNO) e guarda o resultado em valor para usar no LCD e no Serial.' },
          { codigo: '  lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '  lcd.print("                ");', explicacao: 'Escreve **16 espaços** para apagar a linha. Reposicione o cursor antes de imprimir o novo valor, evitando restos como 1023 virar 023.' },
          { codigo: '  lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '  lcd.print(valor);', explicacao: 'Escreve o valor atual de **valor** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  Serial.print("POT:");', explicacao: 'Envia o texto **POT:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '  Serial.println(valor);', explicacao: 'Envia o valor atual de **valor** e termina a linha no Monitor Serial.' },
          { codigo: '  delay(200);', explicacao: 'Espera **200 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Limpe a linha 1 com 16 espaços, reposicione o cursor e imprima analogRead(A0).',
    kit: [{ comp: 'lcd', pino: 100 }, { comp: 'pot', pino: 'A0' }],
    starter: ESQUELETO,
    solucao:
      '#include <Wire.h>\n' +
      '#include <LiquidCrystal_I2C.h>\n' +
      'LiquidCrystal_I2C lcd(0x27, 16, 2);\n' +
      '\n' +
      'void setup() {\n' +
      '  lcd.init();\n' +
      '  lcd.backlight();\n' +
      '  lcd.setCursor(0, 0);\n' +
      '  lcd.print("POT:");\n' +
      '  Serial.begin(9600);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int valor = analogRead(A0);\n' +
      '  lcd.setCursor(0, 1);\n' +
      '  lcd.print("                ");\n' +
      '  lcd.setCursor(0, 1);\n' +
      '  lcd.print(valor);\n' +
      '  Serial.print("POT:");\n' +
      '  Serial.println(valor);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 25,
  },

  /* ---------------- lcd_4 — Medindo distância ---------------- */
  {
    id: 'lcd_4', setor: 'lcd',
    missao: 'Missão 4', nome: 'Medindo distância',
    componente: 'Medindo distância',
    corComponente: '#4ce8e0',
    iconeSetor: 'icone_modulo_lcd.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Mostre DISTANCIA e o valor em cm; sem eco válido, apague a medida antiga e mostre SEM ECO.',
    aviso: 'No UNO físico: LCD I2C com VCC em 5V, GND comum, **SDA em A4 e SCL em A5**. Instale LiquidCrystal_I2C compatível com init() e confira 0x27. O endereço do barramento não é um pino digital. HC-SR04: VCC em 5V, GND comum, TRIG em D6 e ECHO em D7. O eco real fornece cm por dur/58; no jogo, cada bloco corresponde a 1 cm simulado, sem reproduzir a escala física do mundo.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: '#include <Wire.h>', explicacao: 'Inclui a biblioteca do barramento **I2C**, usada na comunicação com o LCD.' },
          { codigo: '#include <LiquidCrystal_I2C.h>', explicacao: 'Inclui **LiquidCrystal_I2C**. Na IDE, instale uma versão compatível com lcd.init(), como a de Frank de Brabander.' },
          { codigo: 'LiquidCrystal_I2C lcd(0x27, 16, 2);', explicacao: 'Cria o objeto **lcd**: endereço I2C 0x27, 16 colunas e 2 linhas. Confira o endereço do seu módulo físico.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  lcd.init();', explicacao: 'Inicializa o LCD pelo barramento I2C. Esta chamada pertence à biblioteca LiquidCrystal_I2C usada aqui.' },
          { codigo: '  lcd.backlight();', explicacao: 'Liga a iluminação de fundo do LCD; não escreve nem apaga caracteres.' },
          { codigo: '  pinMode(6, OUTPUT);', explicacao: 'Configura **6** como saída digital. O pino poderá controlar o componente conectado.' },
          { codigo: '  pinMode(7, INPUT);', explicacao: 'Configura **D7** como entrada para receber o pulso ECHO do sensor.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
          { codigo: '  lcd.setCursor(0, 0);', explicacao: 'Posiciona o cursor na coluna **0**, primeira linha (**0**).' },
          { codigo: '  lcd.print("DISTANCIA");', explicacao: 'Escreve **DISTANCIA** no LCD a partir do cursor. O cursor avança a cada caractere.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  digitalWrite(6, LOW);', explicacao: 'Coloca **TRIG/D6** em LOW. Prepara ou encerra o pulso de disparo.' },
          { codigo: '  delayMicroseconds(2);', explicacao: 'Espera **2 microssegundos** antes da próxima instrução. 1000 us equivalem a 1 ms.' },
          { codigo: '  digitalWrite(6, HIGH);', explicacao: 'Coloca **TRIG/D6** em HIGH. Mantido por 10 us, inicia a medição do HC-SR04.' },
          { codigo: '  delayMicroseconds(10);', explicacao: 'Espera **10 microssegundos** antes da próxima instrução. 1000 us equivalem a 1 ms.' },
          { codigo: '  digitalWrite(6, LOW);', explicacao: 'Coloca **TRIG/D6** em LOW. Prepara ou encerra o pulso de disparo.' },
          { codigo: '  unsigned long dur = pulseIn(7, HIGH, 30000);', explicacao: 'Mede o pulso HIGH em ECHO/D7, em **microssegundos**. Retorna 0 se não completar a medição em até 30000 us.' },
          { codigo: '  if (dur == 0) {', explicacao: 'Trata a ausência de eco; zero retornado por pulseIn não significa um objeto a zero centímetros.' },
          { codigo: '    lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '    lcd.print("SEM ECO         ");', explicacao: 'Escreve SEM ECO e completa as 16 colunas com espaços para apagar a leitura anterior.' },
          { codigo: '    Serial.println("SEM ECO");', explicacao: 'Envia o texto **SEM ECO** e termina a linha no Monitor Serial.' },
          { codigo: '    delay(200);', explicacao: 'Espera **200 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
          { codigo: '    return;', explicacao: 'Encerra esta passagem do loop; a próxima passagem fará uma nova medição.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  int dist = dur / 58;', explicacao: 'Para o HC-SR04, divide a ida e volta do eco por aproximadamente **58 us/cm**. A divisão inteira descarta a parte decimal. No jogo, 1 bloco corresponde a 1 cm simulado.' },
          { codigo: '  lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '  lcd.print("                ");', explicacao: 'Escreve **16 espaços** para apagar a linha. Reposicione o cursor antes de imprimir o novo valor, evitando restos como 1023 virar 023.' },
          { codigo: '  lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '  lcd.print(dist);', explicacao: 'Escreve o valor atual de **dist** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  lcd.print(" cm");', explicacao: 'Escreve ** cm** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  Serial.print("DIST:");', explicacao: 'Envia o texto **DIST:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '  Serial.println(dist);', explicacao: 'Envia o valor atual de **dist** e termina a linha no Monitor Serial.' },
          { codigo: '  delay(200);', explicacao: 'Espera **200 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Passe de 20 para 3 e confira a limpeza da linha: 3 cm. No jogo, teste movendo o obstáculo; no HC-SR04 físico, confira também SEM ECO.',
    kit: [{ comp: 'lcd', pino: 100 }, { comp: 'sensor', trig: 6, echo: 7 }],
    starter: ESQUELETO,
    solucao:
      '#include <Wire.h>\n' +
      '#include <LiquidCrystal_I2C.h>\n' +
      'LiquidCrystal_I2C lcd(0x27, 16, 2);\n' +
      '\n' +
      'void setup() {\n' +
      '  lcd.init();\n' +
      '  lcd.backlight();\n' +
      '  pinMode(6, OUTPUT);\n' +
      '  pinMode(7, INPUT);\n' +
      '  Serial.begin(9600);\n' +
      '  lcd.setCursor(0, 0);\n' +
      '  lcd.print("DISTANCIA");\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  digitalWrite(6, LOW);\n' +
      '  delayMicroseconds(2);\n' +
      '  digitalWrite(6, HIGH);\n' +
      '  delayMicroseconds(10);\n' +
      '  digitalWrite(6, LOW);\n' +
      '  unsigned long dur = pulseIn(7, HIGH, 30000);\n' +
      '  if (dur == 0) {\n' +
      '    lcd.setCursor(0, 1);\n' +
      '    lcd.print("SEM ECO         ");\n' +
      '    Serial.println("SEM ECO");\n' +
      '    delay(200);\n' +
      '    return;\n' +
      '  }\n' +
      '  int dist = dur / 58;\n' +
      '  lcd.setCursor(0, 1);\n' +
      '  lcd.print("                ");\n' +
      '  lcd.setCursor(0, 1);\n' +
      '  lcd.print(dist);\n' +
      '  lcd.print(" cm");\n' +
      '  Serial.print("DIST:");\n' +
      '  Serial.println(dist);\n' +
      '  delay(200);\n' +
      '}\n',
    xp: 30,
  },

  /* ---------------- lcd_5 — Contador de cliques ---------------- */
  {
    id: 'lcd_5', setor: 'lcd',
    missao: 'Missão 5', nome: 'Contador de cliques',
    componente: 'Contador de cliques',
    corComponente: '#4ce8e0',
    iconeSetor: 'icone_modulo_lcd.png',
    iconeAlerta: 'missao1_icone_alerta.png',
    iconeDica: 'missao1_icone_info.png',
    objetivo: 'Comece em 0 e conte uma vez por pressão confirmada, filtrando o repique mecânico do botão.',
    aviso: 'No UNO físico: LCD I2C com VCC em 5V, GND comum, **SDA em A4 e SCL em A5**. Instale LiquidCrystal_I2C compatível com init() e confira 0x27. O endereço do barramento não é um pino digital. Botão entre D2 e GND. O filtro aceita uma mudança após 50 ms estáveis, ao pressionar e ao soltar.',
    secoes: [
      {
        funcao: 'topo do código',
        titulo: 'No topo do código, antes do setup():',
        linhas: [
          { codigo: '#include <Wire.h>', explicacao: 'Inclui a biblioteca do barramento **I2C**, usada na comunicação com o LCD.' },
          { codigo: '#include <LiquidCrystal_I2C.h>', explicacao: 'Inclui **LiquidCrystal_I2C**. Na IDE, instale uma versão compatível com lcd.init(), como a de Frank de Brabander.' },
          { codigo: 'LiquidCrystal_I2C lcd(0x27, 16, 2);', explicacao: 'Cria o objeto **lcd**: endereço I2C 0x27, 16 colunas e 2 linhas. Confira o endereço do seu módulo físico.' },
          { codigo: 'unsigned long contagem = 0;', explicacao: 'Cria um contador global sem sinal, iniciado em **0**, que persiste entre passagens do loop.' },
          { codigo: 'int ultimaLeitura = HIGH;', explicacao: 'Guarda a última leitura bruta do botão; começa no estado solto do INPUT_PULLUP.' },
          { codigo: 'int estadoEstavel = HIGH;', explicacao: 'Guarda o estado confirmado pelo filtro; só muda depois de 50 ms sem repique.' },
          { codigo: 'unsigned long ultimaMudanca = 0;', explicacao: 'Guarda o instante da última mudança elétrica, em milissegundos.' },
        ],
      },
      {
        funcao: 'setup()',
        linhas: [
          { codigo: '  lcd.init();', explicacao: 'Inicializa o LCD pelo barramento I2C. Esta chamada pertence à biblioteca LiquidCrystal_I2C usada aqui.' },
          { codigo: '  lcd.backlight();', explicacao: 'Liga a iluminação de fundo do LCD; não escreve nem apaga caracteres.' },
          { codigo: '  pinMode(2, INPUT_PULLUP);', explicacao: 'Configura **D2** como entrada com resistor pull-up interno. Ligue o botão entre D2 e GND; pressionado será LOW.' },
          { codigo: '  Serial.begin(9600);', explicacao: 'Inicializa a comunicação serial em **9600 baud**. Selecione a mesma taxa no Monitor Serial; a chamada não abre a janela.' },
          { codigo: '  lcd.setCursor(0, 0);', explicacao: 'Posiciona o cursor na coluna **0**, primeira linha (**0**).' },
          { codigo: '  lcd.print("CLIQUES");', explicacao: 'Escreve **CLIQUES** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '  lcd.print(contagem);', explicacao: 'Escreve o valor atual de **contagem** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '  Serial.print("CLIQUES:");', explicacao: 'Envia o texto **CLIQUES:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '  Serial.println(contagem);', explicacao: 'Envia o valor atual de **contagem** e termina a linha no Monitor Serial.' },
        ],
      },
      {
        funcao: 'loop()',
        linhas: [
          { codigo: '  int leitura = digitalRead(2);', explicacao: 'Lê o nível atual de D2. O filtro abaixo confirma a mudança antes de contar um clique.' },
          { codigo: '  if (leitura != ultimaLeitura) {', explicacao: 'Detecta qualquer mudança na leitura, inclusive os repiques do contato mecânico.' },
          { codigo: '    ultimaMudanca = millis();', explicacao: 'Reinicia a contagem do tempo de estabilidade a cada mudança.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  unsigned long decorrido = millis() - ultimaMudanca;', explicacao: 'Calcula há quanto tempo a leitura não muda. No UNO, a subtração unsigned long continua válida na virada de millis().' },
          { codigo: '  if (decorrido >= 50 && leitura != estadoEstavel) {', explicacao: 'Aceita um novo estado somente após **50 ms estáveis**; filtra os repiques ao pressionar e ao soltar.' },
          { codigo: '    estadoEstavel = leitura;', explicacao: 'Atualiza o estado confirmado do botão depois do filtro.' },
          { codigo: '    if (estadoEstavel == LOW) {', explicacao: 'Conta apenas a mudança confirmada para pressionado. Soltar o botão não soma um clique.' },
          { codigo: '      contagem++;', explicacao: 'Soma **1** ao contador. Segurar o botão não repete esta transição.' },
          { codigo: '      lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '      lcd.print("                ");', explicacao: 'Escreve **16 espaços** para apagar a linha. Reposicione o cursor antes de imprimir o novo valor, evitando restos como 1023 virar 023.' },
          { codigo: '      lcd.setCursor(0, 1);', explicacao: 'Posiciona o cursor na coluna **0**, segunda linha (**1**). Faça isso também depois de apagar a linha com espaços.' },
          { codigo: '      lcd.print(contagem);', explicacao: 'Escreve o valor atual de **contagem** no LCD a partir do cursor. O cursor avança a cada caractere.' },
          { codigo: '      Serial.print("CLIQUES:");', explicacao: 'Envia o texto **CLIQUES:** sem quebrar a linha; a próxima impressão continua depois dele.' },
          { codigo: '      Serial.println(contagem);', explicacao: 'Envia o valor atual de **contagem** e termina a linha no Monitor Serial.' },
          { codigo: '    }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  }', explicacao: 'Fecha o bloco atual. A próxima instrução segue fora deste bloco.' },
          { codigo: '  ultimaLeitura = leitura;', explicacao: 'Guarda a leitura bruta para detectar mudanças na próxima passagem do loop.' },
          { codigo: '  delay(10);', explicacao: 'Espera **10 milissegundos** antes da próxima instrução. A pausa bloqueia as próximas instruções do programa; 1000 ms equivalem a 1 segundo.' },
        ],
      },
    ],
    dica: 'Pressione e solte três vezes, mantendo cada estado por mais de 50 ms. Segure por um segundo: deve continuar contando apenas uma vez.',
    kit: [{ comp: 'lcd', pino: 100 }, { comp: 'button', pino: 2 }],
    starter: ESQUELETO,
    solucao:
      '#include <Wire.h>\n' +
      '#include <LiquidCrystal_I2C.h>\n' +
      'LiquidCrystal_I2C lcd(0x27, 16, 2);\n' +
      'unsigned long contagem = 0;\n' +
      'int ultimaLeitura = HIGH;\n' +
      'int estadoEstavel = HIGH;\n' +
      'unsigned long ultimaMudanca = 0;\n' +
      '\n' +
      'void setup() {\n' +
      '  lcd.init();\n' +
      '  lcd.backlight();\n' +
      '  pinMode(2, INPUT_PULLUP);\n' +
      '  Serial.begin(9600);\n' +
      '  lcd.setCursor(0, 0);\n' +
      '  lcd.print("CLIQUES");\n' +
      '  lcd.setCursor(0, 1);\n' +
      '  lcd.print(contagem);\n' +
      '  Serial.print("CLIQUES:");\n' +
      '  Serial.println(contagem);\n' +
      '}\n' +
      '\n' +
      'void loop() {\n' +
      '  int leitura = digitalRead(2);\n' +
      '  if (leitura != ultimaLeitura) {\n' +
      '    ultimaMudanca = millis();\n' +
      '  }\n' +
      '  unsigned long decorrido = millis() - ultimaMudanca;\n' +
      '  if (decorrido >= 50 && leitura != estadoEstavel) {\n' +
      '    estadoEstavel = leitura;\n' +
      '    if (estadoEstavel == LOW) {\n' +
      '      contagem++;\n' +
      '      lcd.setCursor(0, 1);\n' +
      '      lcd.print("                ");\n' +
      '      lcd.setCursor(0, 1);\n' +
      '      lcd.print(contagem);\n' +
      '      Serial.print("CLIQUES:");\n' +
      '      Serial.println(contagem);\n' +
      '    }\n' +
      '  }\n' +
      '  ultimaLeitura = leitura;\n' +
      '  delay(10);\n' +
      '}\n',
    xp: 30,
  },
];

/* Mapa de cards do Modo Treinamento de uma fase: universais +
 * os cadastrados no painel de instrução + os overrides da fase
 * (mesma fonte e mesma precedência do mod). */
function mapaCards(fase) {
  const mapa = Object.assign({}, CARDS_UNIVERSAIS);
  for (const secao of fase.secoes || []) {
    for (const linha of secao.linhas || []) {
      mapa[linha.codigo.trim()] = {
        icone: linha.icone || resolverIcone(linha.codigo, fase.kit),
        explicacao: linha.explicacao ||
          (/^\s*\}\s*$/.test(linha.codigo) ? 'Fecha o bloco de código.' : null),
      };
    }
  }
  Object.assign(mapa, fase.treinoCards || {});
  return mapa;
}

/* Card da linha atual, com a mesma cadeia de fallback do mod. */
function cardDaLinha(fase, codigo) {
  const alvo = String(codigo).trim();
  if (!alvo) return null;
  const mapa = mapaCards(fase);
  if (mapa[alvo] && (mapa[alvo].icone || mapa[alvo].explicacao)) return mapa[alvo];

  const v = iconeDeVariavelInt(alvo);
  if (v) return v;
  const d = iconeDeDelay(alvo);
  if (d) return d;
  const p = iconeDoPino(alvo);
  if (p) return { icone: p, explicacao: `Usa o pino **${p.pino}**.` };
  const outro = resolverIcone(alvo, fase.kit);
  if (outro) return { icone: outro, explicacao: 'Estrutura do programa.' };
  return null;
}

/* Fases de um módulo, na ordem. */
function fasesDoModulo(idModulo) {
  return FASES.filter((f) => f.setor === idModulo);
}

const XP_POR_NIVEL = 150;

