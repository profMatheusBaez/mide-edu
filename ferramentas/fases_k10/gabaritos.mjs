/* ============================================================
 * fases_k10/gabaritos.mjs — as 60 atividades da UNIHIKER K10 em blocos
 * (só desenvolvimento). O mesmo workspace gera o C++ e o MicroPython
 * da atividade (blocos_k10_gen.js): ferramentas/gerar_fases_k10.mjs
 * grava js/k10_fases_gerado.js e compara o C++ com o da trilha (k10.js).
 * ============================================================ */
import { b, lit, programa, espera, se, seSenao, repita, cmp, e, ou, soma, sub, mult, div, limitar, v, mudar, somar, escreva, escrevaJunto } from '../fases_uno/gabaritos.mjs';

/* ---------- K10 ---------- */
const FUNDO = '0x102638';
const telaCor = (cor) => b('k10_tela_iniciar_cor', null, { COR: lit(cor || FUNDO) });
const tela = () => b('k10_tela_iniciar');
const telaCamera = () => b('k10_tela_camera');
const texto = (t, linha, cor) => b('k10_tela_texto', null, { TEXTO: lit(t), LINHA: lit(linha), COR: lit(cor) });
const limpar = () => b('k10_tela_limpar');
const mostrar = () => b('k10_tela_atualizar');
const ponto = (x, y, cor) => b('k10_tela_ponto', null, { X: lit(x), Y: lit(y), COR: lit(cor) });
const linhaT = (x0, y0, x1, y1, cor) => b('k10_tela_linha', null, { X0: lit(x0), Y0: lit(y0), X1: lit(x1), Y1: lit(y1), COR: lit(cor) });
const circulo = (x, y, r, cor, cheio) => b('k10_tela_circulo', { CHEIO: cheio ? 'true' : 'false' }, { X: lit(x), Y: lit(y), R: lit(r), COR: lit(cor) });
const retangulo = (x, y, l, a, cor, cheio) => b('k10_tela_retangulo', { CHEIO: cheio ? 'true' : 'false' }, { X: lit(x), Y: lit(y), L: lit(l), A: lit(a), COR: lit(cor) });
const qr = (t) => b('k10_tela_qr', null, { TEXTO: lit(t) });
const imagem = (arq) => b('k10_tela_imagem', null, { ARQ: lit(arq) });

const brilho = (n) => b('k10_rgb_brilho', null, { N: lit(n) });
const rgb = (led, cor) => b('k10_rgb', { LED: String(led) }, { COR: lit(cor) });
const apagarRgb = () => b('k10_rgb_apagar');
const textoDe = (x, casas) => b('k10_texto_de', null, { VALOR: lit(x), CASAS: lit(casas) });
const mapearK = (x, a, c, d, f) => b('k10_mapear', null, { VALOR: lit(x), DE_MIN: lit(a), DE_MAX: lit(c), PARA_MIN: lit(d), PARA_MAX: lit(f) });

const botao = (q) => b('k10_botao', { BOTAO: q });
const luz = () => b('k10_luz');
const acel = (eixo) => b('k10_acel', { EIXO: eixo });
const forca = () => b('k10_forca');
const gesto = (g) => b('k10_gesto', { GESTO: g });
const climaIniciar = () => b('k10_clima_iniciar');
const climaMedir = () => b('k10_clima_medir');
const temp = () => b('k10_temperatura');
const umid = () => b('k10_umidade');
const mic = () => b('k10_microfone');

const tom = (f, d) => b('k10_tom', null, { FREQ: lit(f), DUR: lit(d) });
const gravar = (arq, s) => b('k10_gravar', null, { ARQ: lit(arq), SEG: lit(s) });
const tocarArq = (arq) => b('k10_tocar_arquivo', null, { ARQ: lit(arq) });
const sd = () => b('k10_sd_iniciar');
const foto = (arq) => b('k10_foto', null, { ARQ: lit(arq) });

const serial = () => b('k10_serial_iniciar');
const wifiLigar = () => b('k10_wifi_ligar');
const wifiDesligar = () => b('k10_wifi_desconectar');
const wifiConectar = (s, p) => b('k10_wifi_conectar', null, { SSID: lit(s), SENHA: lit(p) });
const wifiRedes = () => b('k10_wifi_redes');
const paraCadaRede = (lista) => b('k10_wifi_para_cada', null, { DO: { block: encadear(lista) } });
const nomeRede = () => b('k10_wifi_nome');
const wifiOk = () => b('k10_wifi_conectado');
const wifiIp = () => b('k10_wifi_ip');
function encadear(lista) { for (let i = 0; i < lista.length - 1; i++) lista[i].next = { block: lista[i + 1] }; return lista[0]; }

const motores = () => b('k10_motores_iniciar');
const motor = (m, vel) => b('k10_motor', { M: m }, { VEL: lit(vel) });
const pararMotor = (m) => b('k10_motor_parar', { M: m });
const servo = (g) => b('k10_servo', null, { GRAU: lit(g) });
const junta = (a, c) => b('operador_juntar', null, { A: lit(a), B: lit(c) });

/* Em ordem: atividade 1 = índice 0 de K10_ATIVIDADES */
export const GABARITOS_K10 = [
  /* ---- 1. Conhecendo a K10 ---- */
  programa([telaCor(), texto('K10 EXPLORER', 1, '0xFFFFFF'), texto('Tela + botoes + RGB', 2, '0x00CCBB'), mostrar()], null),
  programa([serial()], [escreva('K10 conectada!'), espera(1000)]),
  programa([telaCor(), texto('Ola, mundo!', 1, '0xFFFFFF'), mostrar()], null),
  programa([telaCor(), texto('Criar', 1, '0x00CC88'), texto('Aprender', 2, '0xFFCC00'), texto('Explorar', 3, '0xFFFFFF'), mostrar()], null),
  programa([telaCor(), mudar('nome', 'Ana'), texto('EXPLORADOR', 1, '0x00CCBB'), texto(v('nome'), 2, '0xFFFFFF'), texto('Minha ideia: um robo', 3, '0xFFCC00'), mostrar()], null),

  /* ---- 2. Botões e LEDs RGB ---- */
  programa([apagarRgb(), brilho(4), rgb(0, '0x00FF00')], null),
  programa([brilho(4), rgb(0, '0xFF0000'), rgb(1, '0x00FF00'), rgb(2, '0x0000FF')], null),
  programa([apagarRgb(), brilho(4)], [seSenao(botao('A'), [rgb(0, '0x00FF00')], [rgb(0, '0x000000')]), espera(20)]),
  programa([apagarRgb(), brilho(4)], [
    seSenao(botao('A'), [rgb(0, '0x00FF00')], [rgb(0, '0x000000')]),
    seSenao(botao('B'), [rgb(1, '0x0000FF')], [rgb(1, '0x000000')]), espera(20)]),
  programa([telaCor(), brilho(4)], [limpar(),
    seSenao(botao('B'), [rgb(-1, '0xFF0000'), texto('PAUSA', 1, '0xFF5555')], [
      seSenao(botao('A'), [rgb(-1, '0x00FF00'), texto('PRONTO', 1, '0x00FF88')], [rgb(-1, '0x000000'), texto('AGUARDANDO', 1, '0xFFFFFF')])]),
    mostrar(), espera(100)]),

  /* ---- 3. Luminosidade ---- */
  programa([serial()], [mudar('luz', luz()), escrevaJunto('LUZ:'), escreva(v('luz')), espera(300)]),
  programa([telaCor()], [mudar('luz', luz()), limpar(), texto('LUZ', 1, '0x00CCBB'), texto(v('luz'), 2, '0xFFFFFF'), mostrar(), espera(300)]),
  programa([brilho(4)], [mudar('luz', luz()), seSenao(cmp(v('luz'), '<', 300), [rgb(-1, '0xFFCC00')], [rgb(-1, '0x000000')]), espera(100)]),
  programa([brilho(4)], [mudar('luz', luz()), apagarRgb(),
    se(cmp(v('luz'), '>', 150), [rgb(0, '0x00FF00')]), se(cmp(v('luz'), '>', 450), [rgb(1, '0x00FF00')]), se(cmp(v('luz'), '>', 800), [rgb(2, '0x00FF00')]),
    espera(150)]),
  programa([telaCor(), brilho(4)], [mudar('luz', luz()), limpar(),
    seSenao(cmp(v('luz'), '<', 250), [rgb(-1, '0xFF0000'), texto('SOMBRA', 1, '0xFF5555')], [rgb(-1, '0x00FF00'), texto('CLARO', 1, '0x00FF88')]),
    texto(v('luz'), 2, '0xFFFFFF'), mostrar(), espera(200)]),

  /* ---- 4. Temperatura e umidade ---- */
  programa([serial(), climaIniciar()], [climaMedir(), escrevaJunto('TEMP:'), escreva(temp()), escrevaJunto('UMID:'), escreva(umid()), espera(1000)]),
  programa([telaCor(), climaIniciar()], [climaMedir(), mudar('temp', temp()), limpar(), texto('TEMP C', 1, '0xFFCC00'), texto(v('temp'), 2, '0xFFFFFF'), mostrar(), espera(1000)]),
  programa([telaCor(), brilho(4), climaIniciar()], [climaMedir(), mudar('temp', temp()), mudar('estado', 'OK'), mudar('cor', lit('0x00FF00').block),
    se(cmp(v('temp'), '<', 20), [mudar('estado', 'FRIO'), mudar('cor', lit('0x0000FF').block)]),
    se(cmp(v('temp'), '>', 28), [mudar('estado', 'QUENTE'), mudar('cor', lit('0xFF0000').block)]),
    rgb(-1, v('cor')), limpar(), texto(v('estado'), 1, v('cor')), texto(v('temp'), 2, '0xFFFFFF'), mostrar(), espera(1000)]),
  programa([telaCor(), climaIniciar()], [climaMedir(), mudar('umid', umid()), mudar('largura', limitar(mult(v('umid'), 2), 0, 200)), limpar(),
    texto('UMIDADE', 1, '0x00CCBB'), retangulo(10, 90, v('largura'), 24, '0x00CCBB', true), texto(v('umid'), 3, '0xFFFFFF'), mostrar(), espera(1000)]),
  programa([telaCor(), brilho(4), climaIniciar()], [climaMedir(), mudar('temp', temp()), mudar('umid', umid()), mudar('cor', lit('0x00FF00').block),
    se(ou(cmp(v('temp'), '>', 28), cmp(v('umid'), '>', 75)), [mudar('cor', lit('0xFF0000').block)]),
    rgb(-1, v('cor')), limpar(), texto('ESTACAO K10', 1, '0xFFFFFF'),
    texto(junta(junta('T ', v('temp')), ' C'), 2, '0xFFCC00'), texto(junta(junta('U ', v('umid')), ' %'), 3, '0x00CCBB'), mostrar(), espera(1000)]),

  /* ---- 5. Acelerômetro e gestos ---- */
  programa([serial()], [escrevaJunto('X:'), escrevaJunto(acel('X')), escrevaJunto(' Y:'), escrevaJunto(acel('Y')), escrevaJunto(' Z:'), escreva(acel('Z')), espera(200)]),
  programa([telaCor()], [mudar('x', soma(120, div(acel('X'), 25))), mudar('y', soma(120, div(acel('Y'), 25))),
    mudar('x', limitar(v('x'), 10, 230)), mudar('y', limitar(v('y'), 10, 310)), limpar(), circulo(v('x'), v('y'), 10, '0x00FF00', true), mostrar(), espera(60)]),
  programa([telaCor(), brilho(4)], [mudar('forca', forca()), limpar(),
    seSenao(cmp(v('forca'), '>', 1000), [rgb(-1, '0xFF0000'), texto('SHAKE', 1, '0xFF5555')], [rgb(-1, '0x000000'), texto('calmo', 1, '0xFFFFFF')]),
    texto(v('forca'), 2, '0x00CCBB'), mostrar(), espera(100)]),
  programa([telaCor()], [limpar(),
    seSenao(gesto('ScreenUp'), [texto('UP', 1, '0x00FF00')], [seSenao(gesto('ScreenDown'), [texto('DOWN', 1, '0xFF0000')], [texto('MOVENDO', 1, '0xFFFFFF')])]),
    mostrar(), espera(150)]),
  programa([telaCor(), mudar('passos', 0)], [
    se(cmp(forca(), '>', 1000), [somar('passos', 1), limpar(), texto('PASSOS', 1, '0x00CCBB'), texto(v('passos'), 2, '0xFFFFFF'), mostrar(), espera(800)]),
    espera(50)]),

  /* ---- 6. Microfone e alto-falante ---- */
  programa([serial()], [mudar('mic', mic()), escrevaJunto('MIC:'), escreva(v('mic')), espera(100)]),
  programa([telaCor()], [mudar('mic', mic()), mudar('largura', limitar(div(v('mic'), 40), 0, 220)), limpar(),
    texto('MIC', 1, '0xFFCC00'), retangulo(10, 90, v('largura'), 22, '0xFFCC00', true), mostrar(), espera(80)]),
  programa([], [tom(440, 4000), espera(1000)]),
  programa([], [se(botao('A'), [tom(262, 4000)]), se(botao('B'), [tom(392, 4000)]), espera(80)]),
  programa([brilho(4)], [mudar('mic', mic()),
    seSenao(cmp(v('mic'), '>', 4000), [rgb(-1, '0xFF0000'), tom(880, 2000)], [rgb(-1, '0x000000')]), espera(120)]),

  /* ---- 7. Tela e animação ---- */
  programa([telaCor()], [limpar(), ponto(40, 40, '0xFFFFFF'), ponto(120, 90, '0xFFCC00'), ponto(200, 160, '0x00CCBB'), mostrar(), espera(1000)]),
  programa([telaCor()], [limpar(), linhaT(10, 20, 220, 20, '0xFFFFFF'), circulo(80, 120, 30, '0x00CCBB', false), retangulo(130, 90, 70, 60, '0xFFCC00', false), mostrar(), espera(1000)]),
  programa([telaCor(), mudar('x', 0)], [limpar(), circulo(v('x'), 120, 12, '0x00FF00', true), mostrar(), mudar('x', soma(v('x'), 8)),
    se(cmp(v('x'), '>', 240), [mudar('x', 0)]), espera(50)]),
  programa([telaCor(), mudar('x', 100)], [se(botao('A'), [somar('x', -5)]), se(botao('B'), [somar('x', 5)]), mudar('x', limitar(v('x'), 0, 200)),
    limpar(), retangulo(v('x'), 130, 35, 35, '0x00CCBB', true), mostrar(), espera(40)]),
  programa([telaCor(), mudar('jogador', 100), mudar('obstaculoY', 0)], [
    se(botao('A'), [somar('jogador', -5)]), se(botao('B'), [somar('jogador', 5)]), mudar('jogador', limitar(v('jogador'), 0, 200)),
    somar('obstaculoY', 6), se(cmp(v('obstaculoY'), '>', 320), [mudar('obstaculoY', 0)]),
    limpar(), retangulo(110, v('obstaculoY'), 30, 30, '0xFF0000', true), retangulo(v('jogador'), 280, 40, 20, '0x00FF00', true), mostrar(), espera(50)]),

  /* ---- 8. Câmera e IA visual ---- */
  programa([telaCamera()], [texto('CAMERA', 1, '0x00FF00'), mostrar(), espera(500)]),
  programa([telaCamera()], [retangulo(30, 50, 180, 180, '0xFFCC00', false), texto('enquadre', 1, '0xFFFFFF'), mostrar(), espera(500)]),
  programa([telaCamera(), sd()], [se(botao('A'), [foto('photo.bmp'), texto('foto salva', 1, '0x00FF00'), mostrar(), espera(1000)]), espera(50)]),
  programa([tela(), sd()], [se(botao('B'), [imagem('photo.bmp'), mostrar(), espera(1000)]), espera(50)]),
  programa([tela(), qr('https://www.unihiker.com'), mostrar()], [espera(1000)]),

  /* ---- 9. Arquivos e microSD ---- */
  programa([telaCor(), sd()], [limpar(), texto('microSD', 1, '0x00CCBB'), texto('pronto', 2, '0xFFFFFF'), mostrar(), espera(1000)]),
  programa([telaCor(), sd()], [se(botao('A'), [texto('gravando', 1, '0xFFCC00'), mostrar(), gravar('sound.wav', 3), texto('salvo', 1, '0x00FF00'), mostrar()]), espera(100)]),
  programa([telaCor(), sd()], [se(botao('B'), [texto('tocando', 1, '0x00CCBB'), mostrar(), tocarArq('sound.wav')]), espera(100)]),
  programa([telaCor(), sd()], [imagem('photo.bmp'), mostrar(), espera(1000)]),
  programa([serial(), telaCor(), sd()], [mudar('luz', luz()), escrevaJunto('luz,'), escreva(v('luz')), limpar(),
    texto('REGISTRO', 1, '0x00FF00'), texto(v('luz'), 2, '0xFFFFFF'), mostrar(), espera(1000)]),

  /* ---- 10. Wi-Fi e comunicação ---- */
  programa([telaCor(), wifiLigar(), wifiDesligar(), espera(100)], [mudar('redes', wifiRedes()), limpar(),
    texto('REDES WIFI', 1, '0x00CCBB'), texto(v('redes'), 2, '0xFFFFFF'), mostrar(), espera(4000)]),
  programa([serial(), wifiLigar(), wifiDesligar(), espera(100)], [paraCadaRede([escreva(nomeRede())]), escreva('---'), espera(5000)]),
  programa([telaCor(), wifiLigar(), wifiConectar('SUA_REDE', 'SUA_SENHA')], [limpar(),
    seSenao(wifiOk(), [texto('ONLINE', 1, '0x00FF00'), texto(wifiIp(), 2, '0xFFFFFF')], [texto('OFFLINE', 1, '0xFF0000')]), mostrar(), espera(1000)]),
  programa([serial()], [mudar('luz', luz()), mudar('mensagem', junta('luz=', v('luz'))), escreva(v('mensagem')), espera(1000)]),
  programa([telaCor(), wifiLigar()], [mudar('luz', luz()), limpar(), texto('IOT K10', 1, '0x00CCBB'),
    seSenao(wifiOk(), [texto('ONLINE', 2, '0x00FF00')], [texto('SEM REDE', 2, '0xFF0000')]),
    texto(junta('LUZ ', v('luz')), 3, '0xFFFFFF'), mostrar(), espera(1000)]),

  /* ---- 11. Motores DC ---- */
  programa([motores(), motor('M1', 3000)], null),
  programa([motores()], [motor('M1', 3000), espera(2000), motor('M1', -3000), espera(2000), pararMotor('M1'), espera(1000)]),
  programa([motores(), motor('M1', 3000), motor('M2', 3000)], null),
  programa([motores()], [motor('M1', 3000), motor('M2', 3000), espera(1500), motor('M1', 1000), motor('M2', 3000), espera(1000),
    motor('M1', 3000), motor('M2', 1000), espera(1000)]),
  programa([motores(), motor('M1', 3000), motor('M2', 3000), motor('M3', 3000), motor('M4', 3000)], null),

  /* ---- 12. Servo ---- */
  programa([motores(), servo(90)], null),
  programa([motores(), mudar('grauServo', 0), mudar('passoServo', 1)], [servo(v('grauServo')), somar('grauServo', v('passoServo')),
    se(ou(cmp(v('grauServo'), '>=', 180), cmp(v('grauServo'), '<=', 0)), [mudar('passoServo', mult(v('passoServo'), -1))]), espera(15)]),
  programa([motores(), mudar('grauServo', 90)], [se(botao('A'), [somar('grauServo', -5)]), se(botao('B'), [somar('grauServo', 5)]),
    mudar('grauServo', limitar(v('grauServo'), 0, 180)), servo(v('grauServo')), espera(80)]),
  programa([motores()], [mudar('luz', luz()), mudar('grau', mapearK(limitar(v('luz'), 0, 1000), 0, 1000, 0, 180)), servo(v('grau')), espera(100)]),
  programa([motores(), mudar('grauServo', 0), mudar('passoServo', 2), motor('M1', 1500)], [servo(v('grauServo')), somar('grauServo', v('passoServo')),
    se(ou(cmp(v('grauServo'), '>=', 180), cmp(v('grauServo'), '<=', 0)), [mudar('passoServo', mult(v('passoServo'), -1))]), espera(20)]),
];

/* Atividades em que o C++ dos blocos difere do C++ antigo da trilha só na forma (mesmo efeito na placa). */
export const DIFERENCAS_ACEITAS = {
  k10_14: '"if" de uma linha vira bloco com chaves',
  k10_19: 'sem o (int) antes de umid * 2',
  k10_20: 'o operador ? : vira cor padrão + bloco "se"; parênteses a mais na junção de textos',
  k10_25: 'passos++ vira passos += 1',
  k10_26: 'mic como int (era uint64_t) e sem o (unsigned long)',
  k10_27: 'mic como int, sem (int) no constrain',
  k10_30: 'mic como int (era uint64_t)',
  k10_33: '"if" de uma linha vira bloco com chaves',
  k10_34: 'x -= 5 vira x += -5; "if" de uma linha com chaves',
  k10_35: 'jogador -= 5 vira jogador += -5; "if" de uma linha com chaves',
  k10_37: 'o fundo do retângulo de contorno usa a mesma cor da borda',
  k10_48: 'a rede e a senha vão direto no WiFi.begin, com WiFi.mode(WIFI_STA) antes',
  k10_50: 'o operador ? : vira blocos "se/senão"',
  k10_57: '-passoServo vira passoServo * -1; "if" com chaves',
  k10_58: 'grauServo -= 5 vira += -5; "if" com chaves',
  k10_60: '-passoServo vira passoServo * -1; "if" com chaves',
};
