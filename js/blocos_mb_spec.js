/* ============================================================
 * blocos_mb_spec.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * A TABELA ÚNICA dos blocos do micro:bit. Dela saem, sem cópia à mão:
 *   · as definições Blockly            (blocos_mb_defs.js)
 *   · a toolbox e os valores-padrão    (blocos_mb_toolbox.js)
 *   · o JavaScript do MakeCode         (blocos_mb_gen_js.js)
 *   · o MicroPython                    (blocos_mb_gen_py.js)
 * Assim os três dizem sempre a mesma coisa (plano §1, "fonte única").
 *
 * Vocabulário, categorias e cores seguem o MakeCode do micro:bit (as
 * cores foram conferidas nos //% color= do pxt-microbit 9.1.1). Os
 * textos em português são nossos, no estilo do MakeCode pt-BR.
 *
 * Cada bloco:
 *   id      tipo do bloco Blockly (mb_…)
 *   cat     categoria (MB_CATEGORIAS)
 *   forma   'inst' (instrução) | 'valor' (devolve algo) | 'evento' (chapéu com corpo)
 *   msg     texto do bloco; {NOME} marca onde entra cada argumento
 *   args    argumentos: N num · T texto · A qualquer · B lógico · D lista · V variável · L 5×5
 *   js/py   modelo do código (com {NOME}); py:null = sem equivalente em MicroPython
 *   imp     importações do MicroPython ('music', 'radio', 'random', 'math', 'machine', 'utime')
 *   iniJS / iniPy   linha de preparação, emitida uma vez antes do corpo do programa
 *   pyDef   nome de um auxiliar MicroPython (MB_PY_AUXILIARES), emitido uma vez
 *   suporte arquivo auxiliar (microbit_suporte.js) que o programa precisa levar junto
 * ============================================================ */
'use strict';

/* Cores: os blocos que existem no Scratch (Controle, Operadores, Variáveis) seguem a paleta do
   Scratch; os blocos próprios da micro:bit têm uma cor só, que lembra a placa (corpo preto com
   detalhes dourados) — o trio de cada uma está em blocos_mb_tema.js. */
const MB_COR_PLACA = '#2F3E4E';
const MB_CORES = {
  basico: MB_COR_PLACA, entrada: MB_COR_PLACA, musica: MB_COR_PLACA, led: MB_COR_PLACA, radio: MB_COR_PLACA,
  pinos: MB_COR_PLACA, serial: MB_COR_PLACA, componentes: MB_COR_PLACA, jogo: MB_COR_PLACA, bluetooth: MB_COR_PLACA,
  lacos: '#FFAB19', logica: '#59C059', matematica: '#59C059', texto: '#59C059', variaveis: '#FF8C1A',
};

/* Ordem em que aparecem na toolbox. `so` = só JavaScript. */
const MB_CATEGORIAS = [
  { id: 'basico', rotulo: 'Básico' },
  { id: 'entrada', rotulo: 'Entrada' },
  { id: 'musica', rotulo: 'Música' },
  { id: 'led', rotulo: 'LED' },
  { id: 'radio', rotulo: 'Rádio' },
  { id: 'lacos', rotulo: 'Laços' },
  { id: 'logica', rotulo: 'Lógica' },
  { id: 'variaveis', rotulo: 'Variáveis', custom: 'MB_VARIAVEIS' },
  { id: 'matematica', rotulo: 'Matemática' },
  { id: 'texto', rotulo: 'Texto' },
  { id: 'pinos', rotulo: 'Pinos' },
  { id: 'serial', rotulo: 'Serial' },
  { id: 'componentes', rotulo: 'Componentes' },
  { id: 'jogo', rotulo: 'Jogo', so: 'js' },
  { id: 'bluetooth', rotulo: 'Bluetooth', so: 'js' },
];

/* ---------- listas de opções: [rótulo, valor, texto JS, texto Python] ---------- */
const MB_ICONES = [
  ['coração', 'Heart', 'HEART'], ['coração pequeno', 'SmallHeart', 'HEART_SMALL'], ['feliz', 'Happy', 'HAPPY'],
  ['sorriso', 'Smile', 'SMILE'], ['triste', 'Sad', 'SAD'], ['confuso', 'Confused', 'CONFUSED'],
  ['bravo', 'Angry', 'ANGRY'], ['dormindo', 'Asleep', 'ASLEEP'], ['surpreso', 'Surprised', 'SURPRISED'],
  ['bobo', 'Silly', 'SILLY'], ['fabuloso', 'Fabulous', 'FABULOUS'], ['sério', 'Meh', 'MEH'],
  ['sim', 'Yes', 'YES'], ['não', 'No', 'NO'], ['diamante', 'Diamond', 'DIAMOND'],
  ['diamante pequeno', 'SmallDiamond', 'DIAMOND_SMALL'], ['quadrado', 'Square', 'SQUARE'],
  ['quadrado pequeno', 'SmallSquare', 'SQUARE_SMALL'], ['triângulo', 'Triangle', 'TRIANGLE'],
  ['alvo', 'Target', 'TARGET'], ['casa', 'House', 'HOUSE'], ['fantasma', 'Ghost', 'GHOST'],
  ['caveira', 'Skull', 'SKULL'], ['tesoura', 'Scissors', 'SCISSORS'], ['pato', 'Duck', 'DUCK'],
  ['coelho', 'Rabbit', 'RABBIT'], ['borboleta', 'Butterfly', 'BUTTERFLY'], ['guarda-chuva', 'Umbrella', 'UMBRELLA'],
].map(([r, v, py]) => [r, v, 'IconNames.' + v, 'Image.' + py]);

const MB_SETAS = [
  ['Norte ↑', 'North', 'N'], ['Nordeste ↗', 'NorthEast', 'NE'], ['Leste →', 'East', 'E'], ['Sudeste ↘', 'SouthEast', 'SE'],
  ['Sul ↓', 'South', 'S'], ['Sudoeste ↙', 'SouthWest', 'SW'], ['Oeste ←', 'West', 'W'], ['Noroeste ↖', 'NorthWest', 'NW'],
].map(([r, v, py]) => [r, v, 'ArrowNames.' + v, 'Image.ARROW_' + py]);

const MB_BOTOES_EVENTO = [
  ['A', 'A', 'Button.A', 'button_a.was_pressed()'],
  ['B', 'B', 'Button.B', 'button_b.was_pressed()'],
  ['A+B', 'AB', 'Button.AB', '(button_a.is_pressed() and button_b.is_pressed())'],
];
const MB_BOTOES_VALOR = [
  ['A', 'A', 'Button.A', 'button_a.is_pressed()'],
  ['B', 'B', 'Button.B', 'button_b.is_pressed()'],
  ['A+B', 'AB', 'Button.AB', '(button_a.is_pressed() and button_b.is_pressed())'],
];

/* Gestos: nome no MakeCode e nome no MicroPython (accelerometer.was_gesture). */
const MB_GESTOS = [
  ['agitar', 'Shake', 'shake'], ['logotipo para cima', 'LogoUp', 'up'], ['logotipo para baixo', 'LogoDown', 'down'],
  ['tela para cima', 'ScreenUp', 'face up'], ['tela para baixo', 'ScreenDown', 'face down'],
  ['inclinar para a esquerda', 'TiltLeft', 'left'], ['inclinar para a direita', 'TiltRight', 'right'],
  ['queda livre', 'FreeFall', 'freefall'], ['3g', 'ThreeG', '3g'], ['6g', 'SixG', '6g'], ['8g', 'EightG', '8g'],
].map(([r, v, py]) => [r, v, 'Gesture.' + v, 'accelerometer.was_gesture("' + py + '")']);

const MB_ACELERACAO = [
  ['x', 'X', 'Dimension.X', 'accelerometer.get_x()'], ['y', 'Y', 'Dimension.Y', 'accelerometer.get_y()'],
  ['z', 'Z', 'Dimension.Z', 'accelerometer.get_z()'], ['força', 'Strength', 'Dimension.Strength', 'accelerometer.get_strength()'],
];
/* A bússola do MicroPython devolve nanoteslas; o MakeCode, microteslas. Convertemos no Python. */
const MB_MAGNETICA = [
  ['força', 'Strength', 'Dimension.Strength', '(compass.get_field_strength() // 1000)'],
  ['x', 'X', 'Dimension.X', '(compass.get_x() // 1000)'], ['y', 'Y', 'Dimension.Y', '(compass.get_y() // 1000)'],
  ['z', 'Z', 'Dimension.Z', '(compass.get_z() // 1000)'],
];
const MB_SOM_EVENTO = [
  ['alto', 'Loud', 'DetectedSound.Loud', 'microphone.was_event(SoundEvent.LOUD)'],
  ['baixo', 'Quiet', 'DetectedSound.Quiet', 'microphone.was_event(SoundEvent.QUIET)'],
];

/* Duração em batidas: valor do MakeCode e milissegundos a 120 bpm (o padrão dos dois lados). */
const MB_BATIDAS = [
  ['1 (inteira)', 'Whole', 'music.beat(BeatFraction.Whole)', '2000'],
  ['1/2', 'Half', 'music.beat(BeatFraction.Half)', '1000'],
  ['1/4', 'Quarter', 'music.beat(BeatFraction.Quarter)', '500'],
  ['1/8', 'Eighth', 'music.beat(BeatFraction.Eighth)', '250'],
  ['1/16', 'Sixteenth', 'music.beat(BeatFraction.Sixteenth)', '125'],
  ['2 (dupla)', 'Double', 'music.beat(BeatFraction.Double)', '4000'],
];
const MB_NOTAS = [
  ['Dó', 'C', 262], ['Ré', 'D', 294], ['Mi', 'E', 330], ['Fá', 'F', 349], ['Sol', 'G', 392], ['Lá', 'A', 440], ['Si', 'B', 494],
  ['Dó agudo', 'C5', 523],
].map(([r, v, f]) => [r, v, 'Note.' + v, String(f)]);

const MB_MELODIAS = [
  ['Dadadadum', 'Dadadadum', 'DADADADUM'], ['Entertainer', 'Entertainer', 'ENTERTAINER'], ['Prelúdio', 'Prelude', 'PRELUDE'],
  ['Ode', 'Ode', 'ODE'], ['Nyan', 'Nyan', 'NYAN'], ['Toque', 'Ringtone', 'RINGTONE'], ['Funk', 'Funk', 'FUNK'],
  ['Blues', 'Blues', 'BLUES'], ['Aniversário', 'Birthday', 'BIRTHDAY'], ['Casamento', 'Wedding', 'WEDDING'],
  ['Fúnebre', 'Funeral', 'FUNERAL'], ['Piada', 'Punchline', 'PUNCHLINE'], ['Vilão', 'Baddy', 'BADDY'],
  ['Perseguição', 'Chase', 'CHASE'], ['Ding', 'BaDing', 'BA_DING'], ['Uh-oh', 'Wawawawaa', 'WAWAWAWAA'],
  ['Pular para cima', 'JumpUp', 'JUMP_UP'], ['Pular para baixo', 'JumpDown', 'JUMP_DOWN'],
  ['Ligar', 'PowerUp', 'POWER_UP'], ['Desligar', 'PowerDown', 'POWER_DOWN'],
].map(([r, v, py]) => [r, v, 'Melodies.' + v, 'music.' + py]);

const MB_SONS = [
  ['risada', 'giggle', 'GIGGLE'], ['feliz', 'happy', 'HAPPY'], ['olá', 'hello', 'HELLO'], ['misterioso', 'mysterious', 'MYSTERIOUS'],
  ['triste', 'sad', 'SAD'], ['deslizar', 'slide', 'SLIDE'], ['voar', 'soaring', 'SOARING'], ['mola', 'spring', 'SPRING'],
  ['brilhar', 'twinkle', 'TWINKLE'], ['bocejo', 'yawn', 'YAWN'],
].map(([r, v, py]) => [r, v, 'soundExpression.' + v, 'Sound.' + py]);

const MB_LIGADO = [['desligado', 'FALSE', 'false', 'False'], ['ligado', 'TRUE', 'true', 'True']];
const MB_NIVEL = [['0 (baixo)', '0', '0', '0'], ['1 (alto)', '1', '1', '1']];
const MB_PULL = [['puxar para cima', 'UP', 'PinPullMode.PullUp', 'PULL_UP'], ['puxar para baixo', 'DOWN', 'PinPullMode.PullDown', 'PULL_DOWN'], ['sem puxar', 'NONE', 'PinPullMode.PullNone', 'NO_PULL']];
const MB_PULSO = [['alto', 'HIGH', 'PulseValue.High', '1'], ['baixo', 'LOW', 'PulseValue.Low', '0']];

const MB_PINOS_TODOS = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 19, 20];
const MB_PINOS_ADC = [0, 1, 2, 3, 4, 10];
const _pinos = (lista, tipo) => lista.map((n) => ['P' + n, 'P' + n, tipo + '.P' + n, 'pin' + n]);
const MB_PINOS_DIG = _pinos(MB_PINOS_TODOS, 'DigitalPin');
const MB_PINOS_ANA_LER = _pinos(MB_PINOS_ADC, 'AnalogPin');
const MB_PINOS_ANA_ESC = _pinos(MB_PINOS_TODOS, 'AnalogPin');

const MB_PROP_SPRITE = [['x', 'X', 'LedSpriteProperty.X'], ['y', 'Y', 'LedSpriteProperty.Y'], ['direção', 'Direction', 'LedSpriteProperty.Direction'], ['brilho', 'Brightness', 'LedSpriteProperty.Brightness']];
const MB_VIRAR = [['direita', 'Right', 'Direction.Right'], ['esquerda', 'Left', 'Direction.Left']];

/* Atalhos para declarar argumentos. */
const _N = (n, v) => ({ n, t: 'num', v: v == null ? 0 : v });
const _T = (n, v) => ({ n, t: 'txt', v: v == null ? '' : v });
const _A = (n, v) => ({ n, t: 'any', v: v == null ? 0 : v });
const _B = (n) => ({ n, t: 'bool' });
const _D = (n, op, def) => ({ n, t: 'drop', op, def });
const _V = (n) => ({ n, t: 'var' });
const _L = (n) => ({ n, t: 'leds' });

/* ------------------------------------------------------------
 * A tabela
 * ---------------------------------------------------------- */
const MB_BLOCOS = [

  /* ============ BÁSICO ============ */
  { id: 'mb_no_iniciar', cat: 'basico', forma: 'evento', msg: 'no início', args: [], especial: 'iniciar',
    dica: 'O que está aqui dentro roda uma vez, quando a micro:bit liga.' },
  { id: 'mb_sempre', cat: 'basico', forma: 'evento', msg: 'sempre', args: [], especial: 'sempre',
    dica: 'O que está aqui dentro se repete para sempre.' },
  { id: 'mb_mostrar_numero', cat: 'basico', forma: 'inst', msg: 'mostrar número {N}', args: [_A('N', 0)],
    js: 'basic.showNumber({N})', py: 'display.scroll({N})', dica: 'Mostra um número na tela de LEDs.' },
  { id: 'mb_mostrar_texto', cat: 'basico', forma: 'inst', msg: 'mostrar texto {T}', args: [_T('T', 'Oi!')],
    js: 'basic.showString({T})', py: 'display.scroll({T})', dica: 'Passa um texto pela tela de LEDs. A tela só tem letras sem acento.' },
  { id: 'mb_mostrar_icone', cat: 'basico', forma: 'inst', msg: 'mostrar ícone {ICONE}', args: [_D('ICONE', MB_ICONES, 'Heart')],
    js: 'basic.showIcon({ICONE})', py: 'display.show({ICONE})', dica: 'Mostra um desenho pronto na tela.' },
  { id: 'mb_mostrar_leds', cat: 'basico', forma: 'inst', msg: 'mostrar LEDs {LEDS}', args: [_L('LEDS')],
    especial: 'leds', dica: 'Clique nos quadradinhos para desenhar. Cada quadradinho é um LED.' },
  { id: 'mb_mostrar_seta', cat: 'basico', forma: 'inst', msg: 'mostrar seta {DIR}', args: [_D('DIR', MB_SETAS, 'North')],
    js: 'basic.showArrow({DIR})', py: 'display.show({DIR})', dica: 'Mostra uma seta apontando para uma direção.' },
  { id: 'mb_limpar_tela', cat: 'basico', forma: 'inst', msg: 'limpar a tela', args: [],
    js: 'basic.clearScreen()', py: 'display.clear()', dica: 'Apaga todos os LEDs.' },
  { id: 'mb_pausa', cat: 'basico', forma: 'inst', msg: 'pausa (ms) {MS}', args: [_N('MS', 100)],
    js: 'basic.pause({MS})', py: 'sleep({MS})', dica: 'Espera esse tempo em milissegundos (1000 ms = 1 segundo).' },

  /* ============ ENTRADA ============ */
  { id: 'mb_ao_botao', cat: 'entrada', forma: 'evento', msg: 'quando o botão {BTN} for pressionado', args: [_D('BTN', MB_BOTOES_EVENTO, 'A')],
    js: 'input.onButtonPressed({BTN}, function () {', cond: '{BTN}', dica: 'Roda quando o botão é apertado.' },
  { id: 'mb_botao_pressionado', cat: 'entrada', forma: 'valor', saida: 'Boolean', msg: 'botão {BTN} pressionado?', args: [_D('BTN', MB_BOTOES_VALOR, 'A')],
    js: 'input.buttonIsPressed({BTN})', py: '{BTN}', dica: 'Verdadeiro enquanto o botão está apertado.' },
  { id: 'mb_ao_logo', cat: 'entrada', forma: 'evento', msg: 'quando o logotipo for tocado', args: [],
    js: 'input.onLogoEvent(TouchButtonEvent.Pressed, function () {', cond: 'pin_logo.is_touched()',
    dica: 'A marca dourada em cima do logotipo é um botão de toque. No Python, roda enquanto o dedo estiver nele.' },
  { id: 'mb_logo_pressionado', cat: 'entrada', forma: 'valor', saida: 'Boolean', msg: 'logotipo tocado?', args: [],
    js: 'input.logoIsPressed()', py: 'pin_logo.is_touched()', dica: 'Verdadeiro enquanto o dedo está no logotipo.' },
  { id: 'mb_ao_gesto', cat: 'entrada', forma: 'evento', msg: 'quando {G}', args: [_D('G', MB_GESTOS, 'Shake')],
    js: 'input.onGesture({G}, function () {', cond: '{G}', dica: 'Roda quando a micro:bit é agitada ou virada.' },
  { id: 'mb_aceleracao', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'aceleração (mg) {D}', args: [_D('D', MB_ACELERACAO, 'X')],
    js: 'input.acceleration({D})', py: '{D}', dica: 'Quanto a placa está sendo empurrada em cada direção.' },
  { id: 'mb_luz', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'nível de luz', args: [],
    js: 'input.lightLevel()', py: 'display.read_light_level()', dica: 'De 0 (escuro) a 255 (muita luz). Usa os próprios LEDs como sensor.' },
  { id: 'mb_temperatura', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'temperatura (°C)', args: [],
    js: 'input.temperature()', py: 'temperature()', dica: 'Temperatura em graus Celsius.' },
  { id: 'mb_bussola', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'direção da bússola (°)', args: [],
    js: 'input.compassHeading()', py: 'compass.heading()', dica: 'De 0 a 359 graus. 0 é o Norte.' },
  { id: 'mb_calibrar_bussola', cat: 'entrada', forma: 'inst', msg: 'calibrar bússola', args: [],
    js: 'input.calibrateCompass()', py: 'compass.calibrate()', dica: 'Pede para inclinar a placa e encher a tela de LEDs.' },
  { id: 'mb_forca_magnetica', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'força magnética (µT) {D}', args: [_D('D', MB_MAGNETICA, 'Strength')],
    js: 'input.magneticForce({D})', py: '{D}', dica: 'Quanto de campo magnético (ímã) a placa sente.' },
  { id: 'mb_nivel_som', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'nível de som', args: [],
    js: 'input.soundLevel()', py: 'microphone.sound_level()', dica: 'De 0 (silêncio) a 255 (barulho forte).' },
  { id: 'mb_ao_som', cat: 'entrada', forma: 'evento', msg: 'quando o som for {S}', args: [_D('S', MB_SOM_EVENTO, 'Loud')],
    js: 'input.onSound({S}, function () {', cond: '{S}', dica: 'Roda quando o microfone ouve um som alto (ou baixo).' },
  { id: 'mb_tempo', cat: 'entrada', forma: 'valor', saida: 'Number', msg: 'tempo de execução (ms)', args: [],
    js: 'input.runningTime()', py: 'running_time()', dica: 'Quantos milissegundos se passaram desde que a placa ligou.' },

  /* ============ MÚSICA ============ */
  { id: 'mb_tocar_tom', cat: 'musica', forma: 'inst', msg: 'tocar tom {F} Hz por {B}', args: [_N('F', 262), _D('B', MB_BATIDAS, 'Whole')],
    js: 'music.playTone({F}, {B})', py: 'music.pitch({F}, {B})', imp: ['music'], dica: 'Toca uma nota (em hertz) e espera ela acabar.' },
  { id: 'mb_tocar_nota', cat: 'musica', forma: 'inst', msg: 'tocar nota {NOTA} por {B}', args: [_D('NOTA', MB_NOTAS, 'C'), _D('B', MB_BATIDAS, 'Whole')],
    js: 'music.playTone({NOTA}, {B})', py: 'music.pitch({NOTA}, {B})', imp: ['music'], dica: 'Toca uma nota da escala (Dó, Ré, Mi…).' },
  { id: 'mb_musica_pausa', cat: 'musica', forma: 'inst', msg: 'silêncio por {B}', args: [_D('B', MB_BATIDAS, 'Quarter')],
    js: 'music.rest({B})', py: 'sleep({B})', dica: 'Fica em silêncio durante esse tempo.' },
  { id: 'mb_tocar_melodia', cat: 'musica', forma: 'inst', msg: 'tocar melodia {M}', args: [_D('M', MB_MELODIAS, 'Dadadadum')],
    js: 'music.play(music.builtInPlayableMelody({M}), music.PlaybackMode.UntilDone)', py: 'music.play({M})', imp: ['music'],
    dica: 'Toca uma melodia pronta até o fim.' },
  { id: 'mb_tocar_som', cat: 'musica', forma: 'inst', msg: 'tocar som {S}', args: [_D('S', MB_SONS, 'giggle')],
    js: '{S}.playUntilDone()', py: 'audio.play({S})', dica: 'Toca um som expressivo (risada, bocejo…) até o fim.' },
  { id: 'mb_alto_falante', cat: 'musica', forma: 'inst', msg: 'alto-falante {E}', args: [_D('E', [['ligado', 'TRUE', 'true', 'on'], ['desligado', 'FALSE', 'false', 'off']], 'TRUE')],
    js: 'music.setBuiltInSpeakerEnabled({E})', py: 'speaker.{E}()', dica: 'Desligue o alto-falante da placa quando usar um buzzer no pino P0.' },
  { id: 'mb_parar_sons', cat: 'musica', forma: 'inst', msg: 'parar todos os sons', args: [],
    js: 'music.stopAllSounds()', py: 'audio.stop()', dica: 'Corta qualquer som que esteja tocando.' },

  /* ============ LED ============ */
  { id: 'mb_acender', cat: 'led', forma: 'inst', msg: 'acender x {X} y {Y}', args: [_N('X', 2), _N('Y', 2)],
    js: 'led.plot({X}, {Y})', py: 'display.set_pixel({X}, {Y}, 9)', dica: 'Acende um LED. (0, 0) é o canto de cima à esquerda; vai até (4, 4).' },
  { id: 'mb_apagar', cat: 'led', forma: 'inst', msg: 'apagar x {X} y {Y}', args: [_N('X', 2), _N('Y', 2)],
    js: 'led.unplot({X}, {Y})', py: 'display.set_pixel({X}, {Y}, 0)', dica: 'Apaga um LED.' },
  { id: 'mb_led_aceso', cat: 'led', forma: 'valor', saida: 'Boolean', msg: 'LED x {X} y {Y} aceso?', args: [_N('X', 2), _N('Y', 2)],
    js: 'led.point({X}, {Y})', py: '(display.get_pixel({X}, {Y}) > 0)', dica: 'Verdadeiro se esse LED está aceso.' },
  { id: 'mb_grafico_barras', cat: 'led', forma: 'inst', msg: 'gráfico de barras de {V} até {MAX}', args: [_N('V', 0), _N('MAX', 255)],
    js: 'led.plotBarGraph({V}, {MAX})', py: 'grafico_barras({V}, {MAX})', pyDef: 'grafico_barras',
    dica: 'Enche a tela de LEDs como uma barra: quanto maior o valor (em relação ao máximo), mais LEDs acesos.' },
  { id: 'mb_tela_ligada', cat: 'led', forma: 'inst', msg: 'tela de LEDs {E}', args: [_D('E', [['ligada', 'TRUE', 'true', 'on'], ['desligada', 'FALSE', 'false', 'off']], 'TRUE')],
    js: 'led.enable({E})', py: 'display.{E}()', dica: 'Desligue a tela para usar os pinos P3, P4, P6, P7 e P10 em outros componentes.' },

  /* ============ RÁDIO ============ */
  { id: 'mb_radio_grupo', cat: 'radio', forma: 'inst', msg: 'rádio: definir grupo {G}', args: [_N('G', 1)],
    js: 'radio.setGroup({G})', py: 'radio.config(group={G})', imp: ['radio'], iniPy: 'radio.on()',
    dica: 'Só placas no mesmo grupo (0 a 255) conversam entre si.' },
  { id: 'mb_radio_enviar_numero', cat: 'radio', forma: 'inst', msg: 'rádio: enviar número {N}', args: [_A('N', 0)],
    js: 'radio.sendNumber({N})', py: 'radio.send(str({N}))', imp: ['radio'], iniPy: 'radio.on()', dica: 'Manda um número para as outras placas do grupo.' },
  { id: 'mb_radio_enviar_texto', cat: 'radio', forma: 'inst', msg: 'rádio: enviar texto {T}', args: [_T('T', 'oi')],
    js: 'radio.sendString({T})', py: 'radio.send({T})', imp: ['radio'], iniPy: 'radio.on()', dica: 'Manda um texto para as outras placas do grupo.' },
  { id: 'mb_radio_ao_numero', cat: 'radio', forma: 'evento', msg: 'rádio: ao receber um número', args: [],
    js: 'radio.onReceivedNumber(function (receivedNumber) {', especial: 'radio_numero', imp: ['radio'], iniPy: 'radio.on()',
    dica: 'Roda quando chega um número. Use o bloco “número recebido” lá dentro.' },
  { id: 'mb_radio_ao_texto', cat: 'radio', forma: 'evento', msg: 'rádio: ao receber um texto', args: [],
    js: 'radio.onReceivedString(function (receivedString) {', especial: 'radio_texto', imp: ['radio'], iniPy: 'radio.on()',
    dica: 'Roda quando chega um texto. Use o bloco “texto recebido” lá dentro.' },
  { id: 'mb_radio_numero_recebido', cat: 'radio', forma: 'valor', saida: 'Number', msg: 'número recebido', args: [],
    js: 'receivedNumber', py: 'int(pacote)', dica: 'O número que acabou de chegar pelo rádio.' },
  { id: 'mb_radio_texto_recebido', cat: 'radio', forma: 'valor', saida: 'String', msg: 'texto recebido', args: [],
    js: 'receivedString', py: 'pacote', dica: 'O texto que acabou de chegar pelo rádio.' },

  /* ============ LAÇOS / LÓGICA / MATEMÁTICA / TEXTO (blocos nativos do Blockly) ============ */
  { id: 'mb_para', cat: 'lacos', forma: 'inst', msg: 'para {VAR} de 0 até {ATE}', args: [_V('VAR'), _N('ATE', 4)], corpo: true,
    especial: 'para', dica: 'Repete contando: a variável vai de 0 até o número (inclusive).' },
  { id: 'mb_enquanto', cat: 'lacos', forma: 'inst', msg: 'enquanto {C}', args: [_B('C')], corpo: true,
    especial: 'enquanto', dica: 'Repete enquanto a condição for verdadeira.' },
  { id: 'mb_aleatorio', cat: 'matematica', forma: 'valor', saida: 'Number', msg: 'número aleatório de {DE} a {ATE}', args: [_N('DE', 0), _N('ATE', 4)],
    js: 'randint({DE}, {ATE})', py: 'random.randint({DE}, {ATE})', imp: ['random'], dica: 'Sorteia um número inteiro (os dois extremos podem sair).' },
  { id: 'mb_mapear', cat: 'matematica', forma: 'valor', saida: 'Number', msg: 'mapear {V} de {A} – {B} para {C} – {D}', args: [_N('V', 0), _N('A', 0), _N('B', 1023), _N('C', 0), _N('D', 4)],
    js: 'pins.map({V}, {A}, {B}, {C}, {D})', py: 'mapear({V}, {A}, {B}, {C}, {D})', pyDef: 'mapear', dica: 'Converte um valor de uma faixa para outra (ex.: 0–1023 para 0–4).' },
  { id: 'mb_restringir', cat: 'matematica', forma: 'valor', saida: 'Number', msg: 'limitar {V} entre {MIN} e {MAX}', args: [_N('V', 0), _N('MIN', 0), _N('MAX', 4)],
    js: 'Math.constrain({V}, {MIN}, {MAX})', py: 'max({MIN}, min({MAX}, {V}))', dica: 'Nunca deixa o valor sair da faixa.' },
  { id: 'mb_abs', cat: 'matematica', forma: 'valor', saida: 'Number', msg: 'valor absoluto de {V}', args: [_N('V', 0)],
    js: 'Math.abs({V})', py: 'abs({V})', dica: 'Tira o sinal de menos.' },
  { id: 'mb_arredondar', cat: 'matematica', forma: 'valor', saida: 'Number', msg: 'arredondar {V}', args: [_N('V', 0)],
    js: 'Math.round({V})', py: 'round({V})', dica: 'Arredonda para o inteiro mais próximo.' },

  /* ============ PINOS ============ */
  { id: 'mb_escrever_digital', cat: 'pinos', forma: 'inst', msg: 'escrita digital do pino {P} valor {V}', args: [_D('P', MB_PINOS_DIG, 'P13'), _N('V', 1)],
    js: 'pins.digitalWritePin({P}, {V})', py: '{P}.write_digital({V})', dica: '1 liga o pino (3,3 V) e 0 desliga.' },
  { id: 'mb_ler_digital', cat: 'pinos', forma: 'valor', saida: 'Number', msg: 'leitura digital do pino {P}', args: [_D('P', MB_PINOS_DIG, 'P8')],
    js: 'pins.digitalReadPin({P})', py: '{P}.read_digital()', dica: 'Devolve 1 (alto) ou 0 (baixo).' },
  { id: 'mb_ler_analogico', cat: 'pinos', forma: 'valor', saida: 'Number', msg: 'leitura analógica do pino {P}', args: [_D('P', MB_PINOS_ANA_LER, 'P2')],
    js: 'pins.analogReadPin({P})', py: '{P}.read_analog()', dica: 'Devolve de 0 a 1023.' },
  { id: 'mb_escrever_analogico', cat: 'pinos', forma: 'inst', msg: 'escrita analógica do pino {P} valor {V}', args: [_D('P', MB_PINOS_ANA_ESC, 'P14'), _N('V', 512)],
    js: 'pins.analogWritePin({P}, {V})', py: '{P}.write_analog({V})', dica: 'PWM: de 0 (apagado) a 1023 (máximo).' },
  { id: 'mb_puxar_pino', cat: 'pinos', forma: 'inst', msg: 'pino {P} {PULL}', args: [_D('P', MB_PINOS_DIG, 'P8'), _D('PULL', MB_PULL, 'UP')],
    js: 'pins.setPull({P}, {PULL})', py: '{P}.set_pull({P}.{PULL})', dica: 'Liga o resistor interno. Com “puxar para cima”, o botão ligado ao GND lê 0 quando apertado.' },
  { id: 'mb_servo', cat: 'pinos', forma: 'inst', msg: 'servo no pino {P} ângulo {A}', args: [_D('P', MB_PINOS_ANA_ESC, 'P1'), _N('A', 90)],
    js: 'pins.servoWritePin({P}, {A})', py: '{P}.write_analog(int(26 + ({A}) * 102 / 180))', iniPyPino: '{P}.set_analog_period(20)',
    dica: 'Gira o servo até o ângulo (0 a 180).' },
  { id: 'mb_pulso', cat: 'pinos', forma: 'valor', saida: 'Number', msg: 'medir pulso {NIVEL} no pino {P} (µs)', args: [_D('NIVEL', MB_PULSO, 'HIGH'), _D('P', MB_PINOS_DIG, 'P1')],
    js: 'pins.pulseIn({P}, {NIVEL})', py: 'time_pulse_us({P}, {NIVEL})', imp: ['machine'], dica: 'Mede quanto tempo o pino ficou nesse nível, em microssegundos.' },
  { id: 'mb_esperar_us', cat: 'pinos', forma: 'inst', msg: 'esperar (µs) {US}', args: [_N('US', 10)],
    js: 'control.waitMicros({US})', py: 'utime.sleep_us({US})', imp: ['utime'], dica: 'Espera poucos microssegundos (1 000 000 µs = 1 s).' },

  /* ============ SERIAL ============ */
  { id: 'mb_serial_linha', cat: 'serial', forma: 'inst', msg: 'escrever linha {T}', args: [_T('T', 'oi')],
    js: 'serial.writeLine({T})', py: 'print({T})', dica: 'Manda uma linha de texto para o Monitor Serial do computador.' },
  { id: 'mb_serial_valor', cat: 'serial', forma: 'inst', msg: 'escrever valor {NOME} = {V}', args: [_T('NOME', 'x'), _A('V', 0)],
    js: 'serial.writeValue({NOME}, {V})', py: 'print({NOME} + ":", {V})', dica: 'Manda “nome:valor” — o Gráfico Serial desenha esses números.' },

  /* ============ COMPONENTES (arquivos auxiliares gravados junto) ============ */
  { id: 'mb_lcd_iniciar', cat: 'componentes', forma: 'inst', msg: 'LCD: iniciar', args: [],
    js: 'lcd1602.iniciar()', py: 'lcd1602.iniciar()', suporte: 'lcd1602', dica: 'Liga o LCD 16x2 I2C (pinos P19 e P20) e apaga a tela.' },
  { id: 'mb_lcd_escrever', cat: 'componentes', forma: 'inst', msg: 'LCD: escrever {T} na linha {LIN} coluna {COL}', args: [_T('T', 'Ola!'), _N('LIN', 0), _N('COL', 0)],
    js: 'lcd1602.escrever({T}, {LIN}, {COL})', py: 'lcd1602.escrever({T}, {LIN}, {COL})', suporte: 'lcd1602', dica: 'Linha 0 ou 1; coluna de 0 a 15. Só letras sem acento.' },
  { id: 'mb_lcd_limpar', cat: 'componentes', forma: 'inst', msg: 'LCD: limpar', args: [],
    js: 'lcd1602.limpar()', py: 'lcd1602.limpar()', suporte: 'lcd1602', dica: 'Apaga o que está escrito no LCD.' },
  { id: 'mb_distancia_cm', cat: 'componentes', forma: 'valor', saida: 'Number', msg: 'distância (cm) trig {TRIG} eco {ECO}', args: [_D('TRIG', MB_PINOS_DIG, 'P16'), _D('ECO', MB_PINOS_DIG, 'P1')],
    js: 'sonar.distanciaCm({TRIG}, {ECO})', py: 'sonar.distancia_cm({TRIG}, {ECO})', suporte: 'sonar', dica: 'Mede a distância com o sensor ultrassônico. Devolve -1 se não achar nada.' },
  { id: 'mb_7seg_mostrar', cat: 'componentes', forma: 'inst', msg: '7 segmentos: mostrar {N}', args: [_N('N', 0)],
    js: 'sete_seg.mostrar({N})', py: 'sete_seg.mostrar({N})', suporte: 'sete_seg', iniJS: 'led.enable(false)', iniPy: 'display.off()',
    dica: 'Mostra um dígito de 0 a 9. Usa a tela de LEDs desligada.' },
  { id: 'mb_7seg_apagar', cat: 'componentes', forma: 'inst', msg: '7 segmentos: apagar', args: [],
    js: 'sete_seg.apagar()', py: 'sete_seg.apagar()', suporte: 'sete_seg', iniJS: 'led.enable(false)', iniPy: 'display.off()', dica: 'Apaga todos os segmentos.' },

  /* ============ JOGO (só JavaScript/blocos) ============ */
  { id: 'mb_sprite_criar', cat: 'jogo', forma: 'valor', saida: 'Sprite', msg: 'criar sprite em x {X} y {Y}', args: [_N('X', 2), _N('Y', 2)],
    js: 'game.createSprite({X}, {Y})', py: null, dica: 'Cria um ponto que você move pela tela. Guarde-o numa variável.' },
  { id: 'mb_sprite_mover', cat: 'jogo', forma: 'inst', msg: '{S} mover {N} passos', args: [{ n: 'S', t: 'sprite' }, _N('N', 1)],
    js: '{S}.move({N})', py: null, dica: 'Anda para a frente.' },
  { id: 'mb_sprite_virar', cat: 'jogo', forma: 'inst', msg: '{S} virar para a {DIR} {G} graus', args: [{ n: 'S', t: 'sprite' }, _D('DIR', MB_VIRAR, 'Right'), _N('G', 45)],
    js: '{S}.turn({DIR}, {G})', py: null, dica: 'Muda a direção do sprite.' },
  { id: 'mb_sprite_mudar', cat: 'jogo', forma: 'inst', msg: '{S} mudar {PROP} em {N}', args: [{ n: 'S', t: 'sprite' }, _D('PROP', MB_PROP_SPRITE, 'X'), _N('N', 1)],
    js: '{S}.change({PROP}, {N})', py: null, dica: 'Soma um valor a uma propriedade do sprite.' },
  { id: 'mb_sprite_valor', cat: 'jogo', forma: 'valor', saida: 'Number', msg: '{S} {PROP}', args: [{ n: 'S', t: 'sprite' }, _D('PROP', MB_PROP_SPRITE, 'X')],
    js: '{S}.get({PROP})', py: null, dica: 'Lê uma propriedade do sprite.' },
  { id: 'mb_jogo_pontos', cat: 'jogo', forma: 'inst', msg: 'ganhar {N} ponto(s)', args: [_N('N', 1)],
    js: 'game.addScore({N})', py: null, dica: 'Soma pontos na pontuação do jogo.' },
  { id: 'mb_jogo_pontuacao', cat: 'jogo', forma: 'valor', saida: 'Number', msg: 'pontuação', args: [],
    js: 'game.score()', py: null, dica: 'Os pontos ganhos até agora.' },
  { id: 'mb_jogo_fim', cat: 'jogo', forma: 'inst', msg: 'fim de jogo', args: [],
    js: 'game.gameOver()', py: null, dica: 'Mostra a pontuação e termina o jogo.' },

  /* ============ BLUETOOTH (só JavaScript/blocos) ============ */
  { id: 'mb_bt_iniciar_uart', cat: 'bluetooth', forma: 'inst', msg: 'Bluetooth: iniciar serviço UART', args: [],
    js: 'bluetooth.startUartService()', py: null, dica: 'Deixa a placa conversar por texto com o computador, sem fio.' },
  { id: 'mb_bt_iniciar_painel', cat: 'bluetooth', forma: 'inst', msg: 'Bluetooth: iniciar painel ao vivo', args: [],
    js: 'bluetooth.startAccelerometerService()\nbluetooth.startButtonService()\nbluetooth.startMagnetometerService()\nbluetooth.startTemperatureService()', py: null,
    dica: 'Liga os serviços de acelerômetro, botões, bússola e temperatura para o Painel ao vivo da IDE, sem fio.' },
  { id: 'mb_bt_ao_conectar', cat: 'bluetooth', forma: 'evento', msg: 'Bluetooth: ao conectar', args: [],
    js: 'bluetooth.onBluetoothConnected(function () {', py: null, dica: 'Roda quando o computador se liga à placa.' },
  { id: 'mb_bt_ao_desconectar', cat: 'bluetooth', forma: 'evento', msg: 'Bluetooth: ao desconectar', args: [],
    js: 'bluetooth.onBluetoothDisconnected(function () {', py: null, dica: 'Roda quando a conexão cai.' },
  { id: 'mb_bt_enviar_linha', cat: 'bluetooth', forma: 'inst', msg: 'Bluetooth: enviar linha {T}', args: [_T('T', 'oi')],
    js: 'bluetooth.uartWriteLine({T})', py: null, dica: 'Manda uma linha de texto para o computador.' },
  { id: 'mb_bt_enviar_valor', cat: 'bluetooth', forma: 'inst', msg: 'Bluetooth: enviar valor {NOME} = {V}', args: [_T('NOME', 'x'), _A('V', 0)],
    js: 'bluetooth.uartWriteValue({NOME}, {V})', py: null, dica: 'Manda “nome:valor” — o Gráfico Serial desenha.' },
  { id: 'mb_bt_ao_receber', cat: 'bluetooth', forma: 'evento', msg: 'Bluetooth: ao receber uma linha', args: [],
    js: 'bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {', py: null, dica: 'Roda quando o computador manda uma linha de texto.' },
  { id: 'mb_bt_linha_recebida', cat: 'bluetooth', forma: 'valor', saida: 'String', msg: 'linha recebida', args: [],
    js: 'bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))', py: null, dica: 'O texto que acabou de chegar.' },
];

/* Blocos nativos do Blockly que o perfil também usa (cores/estilo no tema). */
const MB_NATIVOS = ['controls_if', 'controls_repeat_ext', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
  'math_number', 'math_arithmetic', 'math_modulo', 'text', 'text_join', 'variables_get'];

/* Blocos próprios de variável (o Blockly nativo diz "mude"; o MakeCode diz "definir"). */
const MB_VARIAVEIS_BLOCOS = ['mb_var_definir', 'mb_var_mudar'];

/* Índice por id. */
const MB_POR_ID = new Map(MB_BLOCOS.map((b) => [b.id, b]));

/* ------------------------------------------------------------
 * Auxiliares compartilhados pelos dois geradores
 * ---------------------------------------------------------- */
function mbSubstituir(modelo, valores) {
  return String(modelo).replace(/\{([A-Z0-9_]+)\}/g, (_, n) => (n in valores ? valores[n] : '{' + n + '}'));
}

/* Nomes que uma variável do aluno não pode ter: palavras do JavaScript e do Python, nomes do
   MakeCode e do MicroPython do micro:bit e nomes que os geradores criam. Uma lista só, para
   a variável ter o MESMO nome nas duas linguagens. */
const MB_RESERVADAS = new Set((
  /* JavaScript / TypeScript */
  'let const var function class new this return if else for while do switch case break continue true false null undefined ' +
  'typeof instanceof in of void delete try catch finally throw import export default enum interface namespace extends super ' +
  'static async await yield with debugger public private protected package implements type module declare abstract any number ' +
  'string boolean object symbol get set as from is keyof readonly never unknown ' +
  /* MakeCode */
  'basic input led music radio pins game serial control Math String Number Boolean Array Button Gesture Dimension IconNames ' +
  'ArrowNames Note Melodies soundExpression bluetooth console randint convertToText index receivedNumber receivedString ' +
  'images loops Rotation Direction DigitalPin AnalogPin PulseValue PinPullMode BeatFraction LedSpriteProperty DetectedSound ' +
  'TouchButtonEvent NumberFormat Delimiters Buffer JSON Object parseInt parseFloat isNaN NaN Infinity ' +
  /* Python */
  'False None True and assert async del elif except global lambda nonlocal not or pass raise while ' +
  'print int str float abs min max round range len list dict tuple bool id open sum pow chr ord hex bin all map filter zip ' +
  'sorted reversed enumerate isinstance bytes bytearray ' +
  /* MicroPython do micro:bit */
  'display button_a button_b pin_logo pin_speaker accelerometer compass microphone speaker audio i2c spi uart Image Sound ' +
  'SoundEvent sleep running_time temperature panic reset scale set_volume run_every random machine utime time_pulse_us math ' +
  'pin0 pin1 pin2 pin3 pin4 pin5 pin6 pin7 pin8 pin9 pin10 pin11 pin12 pin13 pin14 pin15 pin16 pin19 pin20 ' +
  /* criados pelo gerador / arquivos auxiliares */
  'pacote mapear grafico_barras lcd1602 sonar sete_seg'
).split(/\s+/));

/* Nome de variável seguro para as duas linguagens: ASCII, sem acento, sem colidir. */
function mbNomeSeguro(nomeBruto, usados) {
  let base = String(nomeBruto || 'item')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '_');
  if (!base || /^\d/.test(base)) base = 'v_' + base;
  let nome = base;
  let n = 2;
  while (MB_RESERVADAS.has(nome) || usados.has(nome)) nome = base + '_' + n++;
  usados.add(nome);
  return nome;
}

/* Texto literal entre aspas duplas (igual nas duas linguagens). */
function mbLiteralTexto(t) {
  return '"' + String(t == null ? '' : t)
    .replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
}

/* O texto é exatamente um literal entre aspas (sem operadores em volta)? */
const mbEhLiteral = (codigo) => /^"(?:[^"\\]|\\.)*"$/.test(String(codigo));

/* Tipo de valor de um bloco de entrada, para escolher o valor inicial da variável. */
function mbTipoDoBloco(bloco) {
  if (!bloco) return null;
  if (bloco.type === 'text' || bloco.type === 'text_join') return 'String';
  if (bloco.type === 'logic_boolean' || bloco.type === 'logic_compare' || bloco.type === 'logic_operation' || bloco.type === 'logic_negate') return 'Boolean';
  const saida = bloco.outputConnection && bloco.outputConnection.getCheck && bloco.outputConnection.getCheck();
  if (saida && saida.length) return saida[0];
  return 'Number';
}

/* Blocos do workspace que valem para o código: ativos e não soltos. */
const MB_TOPOS_INICIAIS = new Set(['mb_no_iniciar']);
