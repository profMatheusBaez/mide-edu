/* ============================================================
 * blocos_k10_toolbox.js — Modo Blocos, UNIHIKER K10
 * ------------------------------------------------------------
 * Categorias do Scratch (Eventos, Controle, Operadores, Variáveis,
 * os mesmos blocos do Uno) e as extensões da placa, como no PictoBlox.
 * Depende de BLOCOS_CATALOGO/_num/_txt (blocos_toolbox.js) e
 * BLOCOS_ICONES (blocos_aparencia.js).
 * ============================================================ */
'use strict';

const _k10c = (hex) => ({ shadow: { type: 'k10_cor', fields: { COR: hex || '0xFFFFFF' } } });

const K10_TOOLBOX_EXT = [
  { nome: 'K10', estilo: 'ext_placa', icone: 'k10', blocos: [
    { kind: 'block', type: 'k10_rgb_brilho', inputs: { N: _num(4) } },
    { kind: 'block', type: 'k10_rgb', inputs: { COR: _k10c('0x00FF00') } },
    { kind: 'block', type: 'k10_rgb_apagar' },
    { kind: 'block', type: 'k10_cor' },
    { kind: 'block', type: 'k10_mapear', inputs: { VALOR: _num(0), DE_MIN: _num(0), DE_MAX: _num(1000), PARA_MIN: _num(0), PARA_MAX: _num(180) } },
    { kind: 'block', type: 'k10_texto_de', inputs: { VALOR: _num(0), CASAS: _num(1) } },
    { kind: 'block', type: 'k10_sd_iniciar' },
    { kind: 'block', type: 'k10_foto', inputs: { ARQ: _txt('photo.bmp') } },
  ] },
  { nome: 'Tela', estilo: 'ext_display', icone: 'display', blocos: [
    { kind: 'block', type: 'k10_tela_iniciar_cor', inputs: { COR: _k10c('0x102638') } },
    { kind: 'block', type: 'k10_tela_iniciar' },
    { kind: 'block', type: 'k10_tela_camera' },
    { kind: 'block', type: 'k10_tela_texto', inputs: { TEXTO: _txt('Ola, mundo!'), LINHA: _num(1), COR: _k10c('0xFFFFFF') } },
    { kind: 'block', type: 'k10_tela_limpar' },
    { kind: 'block', type: 'k10_tela_atualizar' },
    { kind: 'block', type: 'k10_tela_ponto', inputs: { X: _num(120), Y: _num(160), COR: _k10c('0xFFFFFF') } },
    { kind: 'block', type: 'k10_tela_linha', inputs: { X0: _num(10), Y0: _num(20), X1: _num(220), Y1: _num(20), COR: _k10c('0xFFFFFF') } },
    { kind: 'block', type: 'k10_tela_circulo', inputs: { X: _num(120), Y: _num(160), R: _num(20), COR: _k10c('0x00FF00') } },
    { kind: 'block', type: 'k10_tela_retangulo', inputs: { X: _num(10), Y: _num(90), L: _num(100), A: _num(24), COR: _k10c('0x00CCBB') } },
    { kind: 'block', type: 'k10_tela_qr', inputs: { TEXTO: _txt('https://www.unihiker.com') } },
    { kind: 'block', type: 'k10_tela_imagem', inputs: { ARQ: _txt('photo.bmp') } },
  ] },
  { nome: 'Sensores', estilo: 'ext_sensores', icone: 'sensores', blocos: [
    { kind: 'block', type: 'k10_botao' },
    { kind: 'block', type: 'k10_luz' },
    { kind: 'block', type: 'k10_acel' },
    { kind: 'block', type: 'k10_forca' },
    { kind: 'block', type: 'k10_gesto' },
    { kind: 'block', type: 'k10_clima_iniciar' },
    { kind: 'block', type: 'k10_clima_medir' },
    { kind: 'block', type: 'k10_temperatura' },
    { kind: 'block', type: 'k10_umidade' },
    { kind: 'block', type: 'k10_microfone' },
  ] },
  { nome: 'Som', estilo: 'ext_atuadores', icone: 'atuadores', blocos: [
    { kind: 'block', type: 'k10_tom', inputs: { FREQ: _num(440), DUR: _num(4000) } },
    { kind: 'block', type: 'k10_gravar', inputs: { ARQ: _txt('sound.wav'), SEG: _num(3) } },
    { kind: 'block', type: 'k10_tocar_arquivo', inputs: { ARQ: _txt('sound.wav') } },
  ] },
  { nome: 'Motores', estilo: 'ext_atuadores', icone: 'atuadores', blocos: [
    { kind: 'block', type: 'k10_motores_iniciar' },
    { kind: 'block', type: 'k10_motor', inputs: { VEL: _num(3000) } },
    { kind: 'block', type: 'k10_motor_parar' },
    { kind: 'block', type: 'k10_servo', inputs: { GRAU: _num(90) } },
  ] },
  { nome: 'Comunicação', estilo: 'ext_comunicacao', icone: 'comunicacao_coluna', blocos: [
    { kind: 'block', type: 'k10_serial_iniciar' },
    { kind: 'block', type: 'serial_escrever_linha', inputs: { TEXTO: _txt('') } },
    { kind: 'block', type: 'serial_escrever', inputs: { TEXTO: _txt('') } },
    { kind: 'block', type: 'k10_wifi_ligar' },
    { kind: 'block', type: 'k10_wifi_desconectar' },
    { kind: 'block', type: 'k10_wifi_conectar', inputs: { SSID: _txt('SUA_REDE'), SENHA: _txt('SUA_SENHA') } },
    { kind: 'block', type: 'k10_wifi_redes' },
    { kind: 'block', type: 'k10_wifi_para_cada' },
    { kind: 'block', type: 'k10_wifi_nome' },
    { kind: 'block', type: 'k10_wifi_conectado' },
    { kind: 'block', type: 'k10_wifi_ip' },
  ] },
];

function blocosMontarToolboxK10() {
  const scratch = ['eventos', 'controle', 'operadores'].map((nome) => {
    const c = BLOCOS_CATEGORIAS.find((x) => x.nome === nome);
    return { kind: 'category', name: c.rotulo, categorystyle: nome + '_category', contents: BLOCOS_CATALOGO[nome] };
  });
  scratch.push({ kind: 'category', name: 'Variáveis', categorystyle: 'variaveis_category', custom: 'UNO_VARIAVEIS' });
  const ext = K10_TOOLBOX_EXT.map((c) => ({
    kind: 'category', name: c.nome, categorystyle: c.estilo + '_category',
    icone: typeof BLOCOS_ICONES !== 'undefined' ? BLOCOS_ICONES[c.icone] : undefined, contents: c.blocos,
  }));
  return { kind: 'categoryToolbox', contents: scratch.concat(ext) };
}
