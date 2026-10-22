/* ============================================================
 * fases_uno/gabaritos.mjs — as 40 missões do Arduino Uno em blocos
 * (só desenvolvimento). Cada missão é o programa da missão em texto
 * (js/dados.js) montado com os blocos da toolbox do Uno: é o que o
 * modo GUIADO pede, passo a passo. O 7 segmentos usa o bloco
 * "mostrar no display" no lugar do vetor + função (mesmo resultado).
 *
 * ferramentas/gerar_blocos_uno.mjs transforma isto em
 * js/blocos_fases_uno.js e confere: gera o C++, compila na MIDE VM e
 * compara, no simulador avr8js, com a missão em texto compilada pelo
 * avr-gcc (pinos, Serial e I2C).
 * ============================================================ */

const vid = (nome) => 'v_' + nome;
export function lit(v) {
  if (v !== null && typeof v === 'object') return { block: v };
  if (typeof v === 'number') return { block: { type: 'math_number', fields: { NUM: v } } };
  if (typeof v === 'string' && /^0x[0-9A-F]{6}$/.test(v)) return { block: { type: 'k10_cor', fields: { COR: v } } };
  if (typeof v === 'string') return { block: { type: 'text', fields: { TEXT: v } } };
  throw new Error('valor inválido: ' + v);
}
export const b = (type, fields, inputs) => {
  const o = { type };
  if (fields && Object.keys(fields).length) o.fields = fields;
  if (inputs && Object.keys(inputs).length) o.inputs = inputs;
  return o;
};
function pilha(lista) {
  const l = (lista || []).filter(Boolean);
  for (let i = 0; i < l.length - 1; i++) l[i].next = { block: l[i + 1] };
  return l[0];
}
export const corpo = (nome, lista) => (lista && lista.length ? { [nome]: { block: pilha(lista) } } : {});

/* ---------- estrutura ---------- */
export function programa(setup, loop) {
  const topo = [b('evento_iniciar')].concat(setup || []);
  if (loop) topo.push(b('controle_sempre', null, corpo('DO', loop)));
  const blocos = [Object.assign({ x: 30, y: 30 }, pilha(topo))];
  const nomes = new Set();
  const varrer = (no) => {
    if (!no || typeof no !== 'object') return;
    if (Array.isArray(no)) { no.forEach(varrer); return; }
    if (no.VAR && typeof no.VAR.id === 'string') nomes.add(no.VAR.id.slice(2));
    for (const k of Object.keys(no)) if (typeof no[k] === 'object') varrer(no[k]);
  };
  varrer(blocos);
  const json = { blocks: { languageVersion: 0, blocks: blocos } };
  if (nomes.size) json.variables = Array.from(nomes).sort().map((n) => ({ name: n, id: vid(n) }));
  return json;
}

/* ---------- controle ---------- */
export const espera = (ms) => b('controle_espere_ms', { MS: ms });
export const se = (c, entao) => b('controle_se', null, Object.assign({ CONDICAO: lit(c) }, corpo('DO', entao)));
export const seSenao = (c, entao, senao) => b('controle_se_senao', null, Object.assign({ CONDICAO: lit(c) }, corpo('DO', entao), corpo('SENAO', senao)));
export const repita = (n, lista) => b('controle_repita_vezes', { VEZES: n }, corpo('DO', lista));
export const pare = () => b('controle_pare');

/* ---------- operadores ---------- */
const OPS = { '>': 'operador_maior', '<': 'operador_menor', '==': 'operador_igual', '>=': 'operador_maior_igual', '<=': 'operador_menor_igual', '!=': 'operador_diferente' };
export const cmp = (a, op, c) => b(OPS[op], null, { A: lit(a), B: lit(c) });
export const e = (a, c) => b('operador_e', null, { A: lit(a), B: lit(c) });
export const ou = (a, c) => b('operador_ou', null, { A: lit(a), B: lit(c) });
export const soma = (a, c) => b('operador_soma', null, { A: lit(a), B: lit(c) });
export const mult = (a, c) => b('operador_multiplicacao', null, { A: lit(a), B: lit(c) });
export const div = (a, c) => b('operador_divisao', null, { A: lit(a), B: lit(c) });
export const resto = (a, c) => b('operador_resto', null, { A: lit(a), B: lit(c) });
export const sub = (a, c) => b('operador_subtracao', null, { A: lit(a), B: lit(c) });
export const limitar = (v, a, c) => b('operador_limitar', null, { VALOR: lit(v), MIN: lit(a), MAX: lit(c) });

/* ---------- variáveis ---------- */
export const v = (nome) => b('variables_get', { VAR: { id: vid(nome) } });
export const mudar = (nome, valor) => b('variables_set', { VAR: { id: vid(nome) } }, { VALUE: lit(valor) });
export const somar = (nome, n) => b('variaveis_somar', { VAR: { id: vid(nome) } }, { VALOR: lit(n) });

/* ---------- pinos ---------- */
export const saida = (pino, nivel) => b('arduino_pino_digital_saida', { PINO: String(pino), ESTADO: nivel === 'ALTO' ? 'HIGH' : 'LOW' });
export const ler = (pino) => b('arduino_pino_digital_entrada', { PINO: String(pino) });
export const nivel = (n) => b('arduino_nivel', { NIVEL: n === 'ALTO' ? 'HIGH' : 'LOW' });
export const pwm = (pino, valor) => b('arduino_pino_pwm', { PINO: String(pino) }, { VALOR: lit(valor) });
export const modo = (pino, m) => b('arduino_pino_modo', { PINO: String(pino), MODO: m });

/* ---------- sensores ---------- */
export const pot = () => b('sensores_potenciometro', { PINO: 'A0' });
export const distancia = () => b('sensores_distancia', { TRIG: '6', ECO: '7' });
export const mapear = (x, a, c, d, f) => b('sensores_mapear', null, { VALOR: lit(x), DE_MIN: lit(a), DE_MAX: lit(c), PARA_MIN: lit(d), PARA_MAX: lit(f) });
export const tempo = () => b('sensores_tempo');

/* ---------- atuadores ---------- */
export const tocar = (pino, f) => b('atuadores_buzzer_tocar', { PINO: String(pino) }, { FREQ: lit(f) });
export const tocarPor = (pino, f, ms) => b('atuadores_buzzer_freq', { PINO: String(pino) }, { FREQ: lit(f), DUR: lit(ms) });
export const silencio = (pino) => b('atuadores_buzzer_parar', { PINO: String(pino) });
export const servo = (ang) => b('atuadores_servo', { PINO: '9' }, { ANGULO: lit(ang) });

/* ---------- display ---------- */
export const lcdIniciar = () => b('display_lcd_iniciar', { ENDERECO: '0x27' });
export const lcd = (texto, linha, coluna) => b('display_lcd_escrever', { LINHA: String(linha) }, { TEXTO: lit(texto), COLUNA: lit(coluna || 0) });
export const lcdMais = (texto) => b('display_lcd_continuar', null, { TEXTO: lit(texto) });
export const mostrar7 = (n, qual) => b('display_7seg_mostrar', { QUAL: qual || 'D1' }, { DIGITO: lit(n) });

/* ---------- serial ---------- */
export const serial = () => b('serial_iniciar', { BAUD: '9600' });
export const escreva = (x) => b('serial_escrever_linha', null, { TEXTO: lit(x) });
export const escrevaJunto = (x) => b('serial_escrever', null, { TEXTO: lit(x) });

const LIMPA = '                ';

/* ============================================================
 * As 40 missões (id da missão em js/dados.js → workspace)
 * ============================================================ */
export const GABARITOS = {
  /* ---- 1. LED ---- */
  led_1: programa([], [saida(12, 'ALTO')]),
  led_2: programa([], [saida(12, 'ALTO'), espera(1000), saida(12, 'BAIXO'), espera(1000)]),
  led_3: programa([], [saida(11, 'ALTO'), espera(700), saida(12, 'ALTO'), espera(700)]),
  led_4: programa([], [pwm(11, 128)]),
  led_5: programa([], [pwm(11, 0), espera(500), pwm(11, 50), espera(500), pwm(11, 100), espera(500),
    pwm(11, 150), espera(500), pwm(11, 200), espera(500), pwm(11, 250), espera(500)]),

  /* ---- 2. Botão (pull-up: apertado = BAIXO) ---- */
  bot_1: programa([modo(2, 'INPUT_PULLUP')], [
    seSenao(cmp(ler(2), '==', nivel('BAIXO')), [saida(12, 'ALTO')], [saida(12, 'BAIXO')])]),
  bot_2: programa([modo(2, 'INPUT_PULLUP'), serial()], [
    seSenao(cmp(ler(2), '==', nivel('BAIXO')), [saida(12, 'ALTO'), escreva('PRESSIONADO')], [saida(12, 'BAIXO')]),
    espera(200)]),
  bot_3: programa([modo(2, 'INPUT_PULLUP')], [
    seSenao(cmp(ler(2), '==', nivel('ALTO')), [saida(10, 'ALTO')], [saida(10, 'BAIXO')])]),
  bot_4: programa([modo(2, 'INPUT_PULLUP')], [
    seSenao(cmp(ler(2), '==', nivel('BAIXO')), [saida(12, 'ALTO'), saida(10, 'BAIXO')], [saida(12, 'BAIXO'), saida(10, 'ALTO')])]),
  bot_5: programa([modo(2, 'INPUT_PULLUP'), modo(3, 'INPUT_PULLUP')], [
    seSenao(cmp(ler(2), '==', nivel('BAIXO')), [saida(12, 'ALTO')], [saida(12, 'BAIXO')]),
    seSenao(cmp(ler(3), '==', nivel('BAIXO')), [saida(10, 'ALTO')], [saida(10, 'BAIXO')])]),

  /* ---- 3. Potenciômetro ---- */
  pot_1: programa([serial()], [mudar('valor', pot()), escrevaJunto('POT:'), escreva(v('valor')), espera(200)]),
  pot_2: programa([], [mudar('valor', pot()),
    seSenao(cmp(v('valor'), '>=', 512), [saida(12, 'ALTO')], [saida(12, 'BAIXO')])]),
  pot_3: programa([], [mudar('valor', pot()), mudar('brilho', mapear(v('valor'), 0, 1023, 0, 255)), pwm(11, v('brilho'))]),
  pot_4: programa([], [mudar('valor', pot()),
    seSenao(cmp(v('valor'), '<', 341), [saida(10, 'ALTO'), saida(11, 'BAIXO'), saida(12, 'BAIXO')], [
      seSenao(cmp(v('valor'), '<', 682), [saida(10, 'BAIXO'), saida(11, 'ALTO'), saida(12, 'BAIXO')],
        [saida(10, 'BAIXO'), saida(11, 'BAIXO'), saida(12, 'ALTO')])])]),
  pot_5: programa([], [mudar('valor', pot()), mudar('bruto', mapear(v('valor'), 0, 1023, 0, 300)),
    mudar('brilho', limitar(v('bruto'), 0, 200)), pwm(11, v('brilho'))]),

  /* ---- 4. Ultrassônico ---- */
  us_1: programa([serial()], [mudar('dist', distancia()), escrevaJunto('DIST:'), escreva(v('dist')), espera(200)]),
  us_2: programa([], [mudar('dist', distancia()),
    seSenao(cmp(v('dist'), '<', 5), [saida(10, 'ALTO')], [saida(10, 'BAIXO')]), espera(200)]),
  us_3: programa([], [mudar('dist', distancia()), mudar('brilho', mapear(v('dist'), 0, 20, 0, 255)), pwm(11, v('brilho')), espera(200)]),
  us_4: programa([], [mudar('dist', distancia()),
    seSenao(cmp(v('dist'), '<=', 6), [saida(12, 'BAIXO'), saida(11, 'BAIXO'), saida(10, 'ALTO')], [
      seSenao(cmp(v('dist'), '<=', 13), [saida(12, 'BAIXO'), saida(11, 'ALTO'), saida(10, 'BAIXO')],
        [saida(12, 'ALTO'), saida(11, 'BAIXO'), saida(10, 'BAIXO')])]),
    espera(200)]),
  us_5: programa([], [mudar('dist', distancia()), mudar('bruto', mapear(v('dist'), 0, 20, 0, 300)),
    mudar('brilho', limitar(v('bruto'), 0, 200)), pwm(11, v('brilho')), espera(200)]),

  /* ---- 5. Buzzer ---- */
  buz_1: programa([], [tocar(5, 440)]),
  buz_2: programa([], [tocar(5, 440), espera(700), silencio(5), espera(700)]),
  buz_3: programa([modo(2, 'INPUT_PULLUP'), serial()], [mudar('estado', ler(2)),
    seSenao(cmp(v('estado'), '==', nivel('BAIXO')), [tocar(5, 660), escreva('ESTADO:TOCANDO')], [silencio(5), escreva('ESTADO:SILENCIO')]),
    espera(200)]),
  buz_4: programa([serial()], [mudar('leitura', pot()), mudar('freq', mapear(v('leitura'), 0, 1023, 440, 1320)),
    tocar(5, v('freq')), escrevaJunto('FREQ:'), escreva(v('freq')), espera(200)]),
  buz_5: programa([serial()], [mudar('dist', distancia()),
    se(cmp(v('dist'), '==', 0), [silencio(5), escreva('SEM ECO'), espera(600), pare()]),
    escrevaJunto('DIST:'), escreva(v('dist')),
    seSenao(cmp(v('dist'), '<', 5), [tocarPor(5, 880, 300), escreva('ALARME:ATIVO')], [silencio(5), escreva('ALARME:LIVRE')]),
    espera(600)]),

  /* ---- 6. Servo ---- */
  servo_1: programa([], [servo(180)]),
  servo_2: programa([], [servo(180), espera(800), servo(0), espera(800)]),
  servo_3: programa([], [mudar('valor', pot()), mudar('angulo', mapear(v('valor'), 0, 1023, 0, 180)), servo(v('angulo'))]),
  servo_4: programa([], [mudar('dist', distancia()), mudar('angulo', mapear(v('dist'), 0, 20, 0, 180)), servo(v('angulo')), espera(200)]),
  servo_5: programa([], [servo(180), espera(500), servo(0), espera(500), mudar('dist', distancia()),
    seSenao(cmp(v('dist'), '<', 5), [saida(10, 'ALTO')], [saida(10, 'BAIXO')])]),

  /* ---- 7. Display de 7 segmentos (a=2 … g=8, DP=9) ---- */
  disp_1: programa([], [saida(2, 'BAIXO'), saida(3, 'ALTO'), saida(4, 'ALTO'), saida(5, 'BAIXO'),
    saida(6, 'BAIXO'), saida(7, 'BAIXO'), saida(8, 'BAIXO'), saida(9, 'BAIXO')]),
  disp_2: programa([], [saida(9, 'BAIXO'), saida(2, 'ALTO'), saida(3, 'ALTO'), saida(4, 'ALTO'), saida(5, 'ALTO'),
    saida(6, 'ALTO'), saida(7, 'ALTO'), saida(8, 'BAIXO'), espera(800), saida(8, 'ALTO'), espera(800)]),
  disp_3: programa([serial()], [saida(9, 'BAIXO'), mudar('n', 0), repita(10, [
    mostrar7(v('n')), escrevaJunto('DIGITO:'), escreva(v('n')), espera(600), somar('n', 1)])]),
  disp_4: programa([], [saida(9, 'BAIXO'), saida('A3', 'BAIXO'), mudar('numero', 42),
    mostrar7(div(v('numero'), 10), 'D1'), mostrar7(resto(v('numero'), 10), 'D2'), espera(1000)]),
  disp_5: programa([serial()], [saida(9, 'BAIXO'), saida('A3', 'BAIXO'), mudar('n', 12), repita(13, [
    mostrar7(div(v('n'), 10), 'D1'), mostrar7(resto(v('n'), 10), 'D2'),
    escrevaJunto('CONTAGEM:'), escreva(v('n')), espera(700), somar('n', -1)]),
    tocarPor('A4', 880, 600), escreva('FIM'), espera(600), silencio('A4'), espera(1500)]),

  /* ---- 8. LCD 16×2 (I2C, 0x27) ---- */
  lcd_1: programa([lcdIniciar(), lcd('Ola, mundo!', 0, 0)], null),
  lcd_2: programa([lcdIniciar(), lcd('Arduino Academy', 0, 0), lcd('Linha 2', 1, 0)], null),
  lcd_3: programa([lcdIniciar(), lcd('POT:', 0, 0), serial()], [mudar('valor', pot()),
    lcd(LIMPA, 1, 0), lcd(v('valor'), 1, 0), escrevaJunto('POT:'), escreva(v('valor')), espera(200)]),
  lcd_4: programa([lcdIniciar(), serial(), lcd('DISTANCIA', 0, 0)], [mudar('dist', distancia()),
    se(cmp(v('dist'), '==', 0), [lcd('SEM ECO         ', 1, 0), escreva('SEM ECO'), espera(200), pare()]),
    lcd(LIMPA, 1, 0), lcd(v('dist'), 1, 0), lcdMais(' cm'), escrevaJunto('DIST:'), escreva(v('dist')), espera(200)]),
  lcd_5: programa([lcdIniciar(), modo(2, 'INPUT_PULLUP'), serial(),
    mudar('contagem', 0), mudar('ultimaLeitura', nivel('ALTO')), mudar('estadoEstavel', nivel('ALTO')), mudar('ultimaMudanca', 0),
    lcd('CLIQUES', 0, 0), lcd(v('contagem'), 1, 0), escrevaJunto('CLIQUES:'), escreva(v('contagem'))], [
    mudar('leitura', ler(2)),
    se(cmp(v('leitura'), '!=', v('ultimaLeitura')), [mudar('ultimaMudanca', tempo())]),
    mudar('decorrido', sub(tempo(), v('ultimaMudanca'))),
    se(e(cmp(v('decorrido'), '>=', 50), cmp(v('leitura'), '!=', v('estadoEstavel'))), [
      mudar('estadoEstavel', v('leitura')),
      se(cmp(v('estadoEstavel'), '==', nivel('BAIXO')), [
        somar('contagem', 1), lcd(LIMPA, 1, 0), lcd(v('contagem'), 1, 0), escrevaJunto('CLIQUES:'), escreva(v('contagem'))])]),
    mudar('ultimaLeitura', v('leitura')), espera(10)]),
};
