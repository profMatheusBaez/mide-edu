/* ============================================================
 * blocos_k10_defs.js — Modo Blocos, UNIHIKER K10
 * ------------------------------------------------------------
 * Blocos da placa, no estilo das extensões do PictoBlox (cor da
 * extensão + ícone à esquerda). Os blocos de Eventos, Controle,
 * Operadores e Variáveis são os mesmos do Arduino Uno
 * (blocos_defs.js); os dois geradores (C++ e MicroPython) ficam em
 * blocos_k10_gen.js.
 * ============================================================ */
'use strict';

/* Cores das 60 atividades, com amostra (o valor é o 0xRRGGBB usado no código). */
const K10_CORES = [
  ['branco', '0xFFFFFF'], ['apagado (preto)', '0x000000'], ['vermelho', '0xFF0000'], ['verde', '0x00FF00'],
  ['azul', '0x0000FF'], ['amarelo', '0xFFCC00'], ['turquesa', '0x00CCBB'], ['verde-água', '0x00CC88'],
  ['verde-claro', '0x00FF88'], ['vermelho-claro', '0xFF5555'], ['azul-noite', '0x102638'], ['laranja', '0xFF8800'],
  ['roxo', '0x9966FF'], ['rosa', '0xFF66CC'],
];
const _k10Amostra = (hex) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><rect x="1" y="1" width="16" height="16" rx="4" fill="#${hex.slice(2)}" stroke="#ffffff" stroke-width="1.5"/></svg>`);
const K10_OPCOES_COR = K10_CORES.map(([nome, hex]) => [{ src: _k10Amostra(hex), width: 18, height: 18, alt: nome }, hex]);
const K10_MOTORES = [['M1', 'M1'], ['M2', 'M2'], ['M3', 'M3'], ['M4', 'M4']];

const _n = (name) => ({ type: 'input_value', name, check: 'Number' });
const _v = (name) => ({ type: 'input_value', name });
const _cor = (name) => ({ type: 'input_value', name: name || 'COR', check: ['Cor', 'Number'] });
const _inst = (o) => Object.assign({ previousStatement: null, nextStatement: null, inputsInline: true }, o);

const BLOCOS_K10_DEFINICOES = [
  /* ---------- placa: LEDs RGB, cores, Monitor Serial ---------- */
  _inst({ type: 'k10_rgb_brilho', message0: 'brilho dos LEDs RGB %1 (0 a 9)', args0: [_n('N')], g: 'ext_placa' }),
  _inst({ type: 'k10_rgb', message0: 'acender LED RGB %1 na cor %2', args0: [{ type: 'field_dropdown', name: 'LED', options: [['todos', '-1'], ['0', '0'], ['1', '1'], ['2', '2']] }, _cor()], g: 'ext_placa' }),
  _inst({ type: 'k10_rgb_apagar', message0: 'apagar os LEDs RGB', g: 'ext_placa' }),
  { type: 'k10_cor', message0: '%1', args0: [{ type: 'field_dropdown', name: 'COR', options: K10_OPCOES_COR }], output: 'Cor', g: 'ext_placa', tooltip: 'Uma cor no formato 0xRRGGBB (vermelho, verde e azul).' },
  _inst({ type: 'k10_serial_iniciar', message0: 'iniciar Monitor Serial (115200)', g: 'ext_comunicacao' }),
  { type: 'k10_mapear', message0: 'mapear %1 de %2 %3 para %4 %5', args0: [_n('VALOR'), _n('DE_MIN'), _n('DE_MAX'), _n('PARA_MIN'), _n('PARA_MAX')], output: 'Number', inputsInline: true, g: 'ext_placa' },
  { type: 'k10_texto_de', message0: 'texto de %1 com %2 casa(s) decimal(is)', args0: [_n('VALOR'), _n('CASAS')], output: 'String', inputsInline: true, g: 'ext_placa' },

  /* ---------- tela ---------- */
  _inst({ type: 'k10_tela_iniciar_cor', message0: 'iniciar a tela com fundo %1', args0: [_cor()], g: 'ext_display' }),
  _inst({ type: 'k10_tela_iniciar', message0: 'iniciar a tela sem fundo', g: 'ext_display' }),
  _inst({ type: 'k10_tela_camera', message0: 'iniciar a tela com a câmera no fundo', g: 'ext_display' }),
  _inst({ type: 'k10_tela_texto', message0: 'escrever %1 na linha %2 cor %3', args0: [_v('TEXTO'), _n('LINHA'), _cor()], g: 'ext_display' }),
  _inst({ type: 'k10_tela_limpar', message0: 'limpar a tela', g: 'ext_display' }),
  _inst({ type: 'k10_tela_atualizar', message0: 'mostrar o desenho na tela', g: 'ext_display', tooltip: 'O que foi desenhado só aparece depois deste bloco.' }),
  _inst({ type: 'k10_tela_ponto', message0: 'ponto x %1 y %2 cor %3', args0: [_n('X'), _n('Y'), _cor()], g: 'ext_display' }),
  _inst({ type: 'k10_tela_linha', message0: 'linha de x %1 y %2 até x %3 y %4 cor %5', args0: [_n('X0'), _n('Y0'), _n('X1'), _n('Y1'), _cor()], g: 'ext_display' }),
  _inst({ type: 'k10_tela_circulo', message0: 'círculo x %1 y %2 raio %3 cor %4 %5', args0: [_n('X'), _n('Y'), _n('R'), _cor(), { type: 'field_dropdown', name: 'CHEIO', options: [['cheio', 'true'], ['só o contorno', 'false']] }], g: 'ext_display' }),
  _inst({ type: 'k10_tela_retangulo', message0: 'retângulo x %1 y %2 largura %3 altura %4 cor %5 %6', args0: [_n('X'), _n('Y'), _n('L'), _n('A'), _cor(), { type: 'field_dropdown', name: 'CHEIO', options: [['cheio', 'true'], ['só o contorno', 'false']] }], g: 'ext_display' }),
  _inst({ type: 'k10_tela_qr', message0: 'mostrar QR Code de %1', args0: [_v('TEXTO')], g: 'ext_display' }),
  _inst({ type: 'k10_tela_imagem', message0: 'mostrar a imagem %1 do microSD', args0: [_v('ARQ')], g: 'ext_display' }),

  /* ---------- sensores ---------- */
  { type: 'k10_botao', message0: 'botão %1 pressionado?', args0: [{ type: 'field_dropdown', name: 'BOTAO', options: [['A', 'A'], ['B', 'B']] }], output: 'Boolean', g: 'ext_sensores' },
  { type: 'k10_luz', message0: 'luz ambiente', output: 'Number', g: 'ext_sensores' },
  { type: 'k10_acel', message0: 'aceleração %1', args0: [{ type: 'field_dropdown', name: 'EIXO', options: [['X', 'X'], ['Y', 'Y'], ['Z', 'Z']] }], output: 'Number', g: 'ext_sensores' },
  { type: 'k10_forca', message0: 'força do movimento', output: 'Number', g: 'ext_sensores' },
  { type: 'k10_gesto', message0: 'a placa está %1?', args0: [{ type: 'field_dropdown', name: 'GESTO', options: [['com a tela para cima', 'ScreenUp'], ['com a tela para baixo', 'ScreenDown']] }], output: 'Boolean', g: 'ext_sensores' },
  _inst({ type: 'k10_clima_iniciar', message0: 'iniciar o sensor de clima', g: 'ext_sensores' }),
  _inst({ type: 'k10_clima_medir', message0: 'medir temperatura e umidade', g: 'ext_sensores' }),
  { type: 'k10_temperatura', message0: 'temperatura (°C)', output: 'Number', g: 'ext_sensores' },
  { type: 'k10_umidade', message0: 'umidade (%)', output: 'Number', g: 'ext_sensores' },
  { type: 'k10_microfone', message0: 'som do microfone', output: 'Number', g: 'ext_sensores' },

  /* ---------- som, áudio e microSD ---------- */
  _inst({ type: 'k10_tom', message0: 'tocar tom %1 Hz por %2', args0: [_n('FREQ'), _n('DUR')], g: 'ext_atuadores' }),
  _inst({ type: 'k10_gravar', message0: 'gravar áudio %1 por %2 segundos', args0: [_v('ARQ'), _n('SEG')], g: 'ext_atuadores' }),
  _inst({ type: 'k10_tocar_arquivo', message0: 'tocar o áudio %1 do microSD', args0: [_v('ARQ')], g: 'ext_atuadores' }),
  _inst({ type: 'k10_sd_iniciar', message0: 'preparar o cartão microSD', g: 'ext_placa' }),
  _inst({ type: 'k10_foto', message0: 'salvar foto da câmera em %1', args0: [_v('ARQ')], g: 'ext_placa' }),

  /* ---------- Wi-Fi ---------- */
  _inst({ type: 'k10_wifi_ligar', message0: 'ligar o Wi-Fi', g: 'ext_comunicacao' }),
  _inst({ type: 'k10_wifi_desconectar', message0: 'desconectar o Wi-Fi', g: 'ext_comunicacao' }),
  _inst({ type: 'k10_wifi_conectar', message0: 'conectar à rede %1 senha %2', args0: [_v('SSID'), _v('SENHA')], g: 'ext_comunicacao' }),
  { type: 'k10_wifi_redes', message0: 'quantidade de redes Wi-Fi', output: 'Number', g: 'ext_comunicacao' },
  { type: 'k10_wifi_para_cada', message0: 'para cada rede Wi-Fi encontrada %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, g: 'ext_comunicacao' },
  { type: 'k10_wifi_nome', message0: 'nome da rede', output: 'String', g: 'ext_comunicacao' },
  { type: 'k10_wifi_conectado', message0: 'Wi-Fi conectado?', output: 'Boolean', g: 'ext_comunicacao' },
  { type: 'k10_wifi_ip', message0: 'endereço IP', output: 'String', g: 'ext_comunicacao' },

  /* ---------- motores e servo (driver DFRobot, chip PCA9685) ---------- */
  _inst({ type: 'k10_motores_iniciar', message0: 'preparar o driver de motores', g: 'ext_atuadores' }),
  _inst({ type: 'k10_motor', message0: 'motor %1 velocidade %2', args0: [{ type: 'field_dropdown', name: 'M', options: K10_MOTORES }, _n('VEL')], g: 'ext_atuadores', tooltip: 'Velocidade de -4095 (ré) a 4095 (frente).' }),
  _inst({ type: 'k10_motor_parar', message0: 'parar motor %1', args0: [{ type: 'field_dropdown', name: 'M', options: K10_MOTORES }], g: 'ext_atuadores' }),
  _inst({ type: 'k10_servo', message0: 'servo S1 ângulo %1', args0: [_n('GRAU')], g: 'ext_atuadores' }),
];

for (const d of BLOCOS_K10_DEFINICOES) {
  const g = d.g; delete d.g;
  d.style = g + '_blocks';
  if (typeof blocosMarcarExtensao === 'function') blocosMarcarExtensao(d, g, 'k10');
}
Blockly.defineBlocksWithJsonArray(BLOCOS_K10_DEFINICOES);
