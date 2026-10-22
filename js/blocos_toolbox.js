/* ============================================================
 * blocos_toolbox.js — MIDE EDU, Modo Blocos
 * ------------------------------------------------------------
 * Toolbox completa (todas as categorias e blocos do catálogo).
 * A liberação progressiva por fase (paleta/blocos de
 * BLOCOS_FASES, ver dados_blocos.js) filtra esta lista em tempo
 * de exibição — blocosMontarToolbox() aceita um filtro opcional.
 * ============================================================ */
'use strict';

/* Blocos "shadow" de valor-padrão para as entradas numéricas,
   booleanas e de texto — sem eles a entrada aparece vazia. */
const _num = (v) => ({ shadow: { type: 'math_number', fields: { NUM: v == null ? 0 : v } } });
const _bool = () => ({ shadow: { type: 'logic_boolean', fields: { BOOL: 'TRUE' } } });
const _txt = (v) => ({ shadow: { type: 'text', fields: { TEXT: v == null ? '' : v } } });

/* Cada entrada: { block: 'tipo', inputs: {NOME: shadow} }. */
const BLOCOS_CATALOGO = {
  eventos: [
    { kind: 'block', type: 'evento_iniciar' },
  ],
  controle: [
    { kind: 'block', type: 'controle_sempre' },
    { kind: 'block', type: 'controle_espere_seg', inputs: {} },
    { kind: 'block', type: 'controle_espere_ms', inputs: {} },
    { kind: 'block', type: 'controle_repita_vezes' },
    { kind: 'block', type: 'controle_repita_ate', inputs: { CONDICAO: _bool() } },
    { kind: 'block', type: 'controle_se', inputs: { CONDICAO: _bool() } },
    { kind: 'block', type: 'controle_se_senao', inputs: { CONDICAO: _bool() } },
    { kind: 'block', type: 'controle_pare' },
  ],
  operadores: [
    { kind: 'block', type: 'operador_soma', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_subtracao', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_multiplicacao', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_divisao', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_resto', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_aleatorio', inputs: { DE: _num(1), ATE: _num(10) } },
    { kind: 'block', type: 'operador_maior', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_menor', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_igual', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_maior_igual', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_menor_igual', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_diferente', inputs: { A: _num(1), B: _num(1) } },
    { kind: 'block', type: 'operador_e', inputs: { A: _bool(), B: _bool() } },
    { kind: 'block', type: 'operador_ou', inputs: { A: _bool(), B: _bool() } },
    { kind: 'block', type: 'operador_nao', inputs: { A: _bool() } },
    { kind: 'block', type: 'operador_juntar', inputs: { A: _txt('maçã '), B: _txt('banana') } },
    { kind: 'block', type: 'operador_arredondar', inputs: { A: _num(3.14) } },
    { kind: 'block', type: 'operador_limitar', inputs: { VALOR: _num(0), MIN: _num(0), MAX: _num(255) } },
  ],
  variaveis: [
    { kind: 'button', text: 'Criar uma variável…', callbackKey: 'blocosCriarVariavel' },
    { kind: 'block', type: 'variables_get' },
    { kind: 'block', type: 'variables_set', inputs: { VALUE: _num(0) } },
    { kind: 'block', type: 'variaveis_somar', inputs: { VALOR: _num(1) } },
  ],
  arduino: [
    { kind: 'block', type: 'arduino_pino_digital_saida' },
    { kind: 'block', type: 'arduino_pino_digital_entrada' },
    { kind: 'block', type: 'arduino_nivel' },
    { kind: 'block', type: 'arduino_pino_analogico_ler' },
    { kind: 'block', type: 'arduino_pino_pwm', inputs: { VALOR: _num(128) } },
    { kind: 'block', type: 'arduino_pino_modo' },
    { kind: 'block', type: 'sensores_tempo' },
    { kind: 'block', type: 'sensores_mapear', inputs: { VALOR: _num(0), DE_MIN: _num(0), DE_MAX: _num(1023), PARA_MIN: _num(0), PARA_MAX: _num(255) } },
  ],
  atuadores: [
    { kind: 'block', type: 'atuadores_servo', inputs: { ANGULO: _num(90) } },
    { kind: 'block', type: 'atuadores_buzzer_tocar', inputs: { FREQ: _num(440) } },
    { kind: 'block', type: 'atuadores_buzzer_freq', inputs: { FREQ: _num(440), DUR: _num(200) } },
    { kind: 'block', type: 'atuadores_buzzer_nota', inputs: { DUR: _num(200) } },
    { kind: 'block', type: 'atuadores_buzzer_parar' },
  ],
  sensores: [
    { kind: 'block', type: 'sensores_distancia' },
    { kind: 'block', type: 'sensores_botao' },
    { kind: 'block', type: 'sensores_potenciometro' },
  ],
  display: [
    { kind: 'block', type: 'display_lcd_iniciar' },
    { kind: 'block', type: 'display_lcd_escrever', inputs: { TEXTO: _txt('Ola, mundo!'), COLUNA: _num(0) } },
    { kind: 'block', type: 'display_lcd_continuar', inputs: { TEXTO: _txt(' cm') } },
    { kind: 'block', type: 'display_lcd_limpar' },
    { kind: 'block', type: 'display_7seg_mostrar', inputs: { DIGITO: _num(0) } },
    { kind: 'block', type: 'display_7seg_apagar' },
  ],
  serial: [
    { kind: 'block', type: 'serial_iniciar' },
    { kind: 'block', type: 'serial_escrever_linha', inputs: { TEXTO: _txt('') } },
    { kind: 'block', type: 'serial_escrever', inputs: { TEXTO: _txt('') } },
  ],
};

/* Como no PictoBlox: as categorias do Scratch (círculo colorido) e depois as extensões de
   hardware (ícone próprio, cor da extensão — blocos_aparencia.js / blocos_tema.js). */
const BLOCOS_CATEGORIAS = [
  { nome: 'eventos', rotulo: 'Eventos' },
  { nome: 'controle', rotulo: 'Controle' },
  { nome: 'operadores', rotulo: 'Operadores' },
  { nome: 'variaveis', rotulo: 'Variáveis' },
  { nome: 'arduino', rotulo: 'Arduino Uno', estilo: 'ext_placa', icone: 'uno' },
  { nome: 'atuadores', rotulo: 'Atuadores', estilo: 'ext_atuadores', icone: 'atuadores' },
  { nome: 'sensores', rotulo: 'Sensores', estilo: 'ext_sensores', icone: 'sensores' },
  { nome: 'display', rotulo: 'Display', estilo: 'ext_display', icone: 'display' },
  { nome: 'serial', rotulo: 'Comunicação', estilo: 'ext_comunicacao', icone: 'comunicacao_coluna' },
];

/* Monta a toolbox no formato esperado pelo Blockly (definitions
 * "flyoutsOnly": cada categoria vira um botão na coluna à
 * esquerda — ver blocos.js — e o flyout é aberto manualmente.
 * `filtro`, quando passado, é um Set de "categoria:tipo" ou um
 * mapa {categoria: [tipos]} usado pela liberação progressiva
 * (dados_blocos.js). Sem filtro, mostra o catálogo inteiro. */
function blocosListaFlyout(categoria, tiposPermitidos) {
  const itens = BLOCOS_CATALOGO[categoria] || [];
  if (!tiposPermitidos) return itens;
  return itens.filter((it) => it.kind === 'button' || tiposPermitidos.includes(it.type));
}

function blocosMontarToolbox() {
  return {
    kind: 'categoryToolbox',
    contents: BLOCOS_CATEGORIAS.map((c) => (c.nome === 'variaveis'
      /* Variáveis é montada na hora (blocosFlyoutVariaveisUno): os blocos já vêm com a variável criada */
      ? { kind: 'category', name: c.rotulo, categorystyle: c.nome + '_category', custom: 'UNO_VARIAVEIS' }
      : Object.assign({ kind: 'category', name: c.rotulo, categorystyle: (c.estilo || c.nome) + '_category', contents: BLOCOS_CATALOGO[c.nome] || [] },
        c.icone && typeof BLOCOS_ICONES !== 'undefined' ? { icone: BLOCOS_ICONES[c.icone] } : {}))),
  };
}

/* Categoria "Variáveis" do Uno: criar variável e, para cada variável existente, os blocos dela. */
function blocosFlyoutVariaveisUno(ws) {
  const itens = [{ kind: 'label', text: 'Variáveis', 'web-class': 'blocos-flyout-titulo' }, { kind: 'button', text: 'Criar uma variável…', callbackKey: 'blocosCriarVariavel' }];
  const vars = ws.getVariableMap().getAllVariables().slice().sort((a, b) => a.getName().localeCompare(b.getName()));
  if (vars.length) {
    const id = vars[0].getId();
    itens.push({ kind: 'block', type: 'variables_set', fields: { VAR: { id } }, inputs: { VALUE: _num(0) } });
    itens.push({ kind: 'block', type: 'variaveis_somar', fields: { VAR: { id } }, inputs: { VALOR: _num(1) } });
    for (const v of vars) itens.push({ kind: 'block', type: 'variables_get', fields: { VAR: { id: v.getId() } } });
  }
  return itens;
}
