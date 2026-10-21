/* ============================================================
 * blocos_tema.js — MIDE EDU, Modo Blocos
 * ------------------------------------------------------------
 * Blockly.Theme claro + escuro com a paleta oficial do Scratch 3 /
 * PictoBlox (PLANO-modo-blocos.md §4). Cada blockStyle tem
 * primária (corpo), secundária (campos) e terciária (contorno).
 * ============================================================ */
'use strict';

/* Cores por categoria — só as que este projeto usa (negrito no
   plano) recebem blockStyle próprio. As demais (Movimento,
   Aparência, Som, Listas, Meus Blocos) ficam registradas para uso
   futuro, sem blocos associados hoje. */
const BLOCOS_CORES = {
  movimento:   ['#4C97FF', '#4280D7', '#3373CC'],
  aparencia:   ['#9966FF', '#855CD6', '#774DCB'],
  som:         ['#CF63CF', '#C94FC9', '#BD42BD'],
  eventos:     ['#FFBF00', '#E6AC00', '#CC9900'],
  controle:    ['#FFAB19', '#EC9C13', '#CF8B17'],
  sensores:    ['#5CB1D6', '#4CA4C3', '#2E8EB8'],
  operadores:  ['#59C059', '#46B946', '#389438'],
  variaveis:   ['#FF8C1A', '#FF8000', '#DB6E00'],
  listas:      ['#FF661A', '#FF5500', '#E64D00'],
  meusBlocos:  ['#FF6680', '#FF4D6A', '#FF3355'],
  hardware:    ['#0FBD8C', '#0DA57A', '#0B8E69'],
};

function blocosMontarBlockStyles() {
  const estilos = {};
  const grupos = {
    movimento_blocks: BLOCOS_CORES.movimento,
    aparencia_blocks: BLOCOS_CORES.aparencia,
    som_blocks: BLOCOS_CORES.som,
    eventos_blocks: BLOCOS_CORES.eventos,
    controle_blocks: BLOCOS_CORES.controle,
    sensores_blocks: BLOCOS_CORES.sensores,
    operadores_blocks: BLOCOS_CORES.operadores,
    variaveis_blocks: BLOCOS_CORES.variaveis,
    variable_blocks: BLOCOS_CORES.variaveis,   /* estiliza variables_get/set nativos */
    listas_blocks: BLOCOS_CORES.listas,
    list_blocks: BLOCOS_CORES.listas,
    meus_blocos_blocks: BLOCOS_CORES.meusBlocos,
    procedure_blocks: BLOCOS_CORES.meusBlocos,
    arduino_blocks: BLOCOS_CORES.hardware,
    atuadores_blocks: BLOCOS_CORES.hardware,
    display_blocks: BLOCOS_CORES.hardware,
    /* placa LEGO Technic (Pybricks) — blocos_lego_defs.js */
    lego_motores_blocks: BLOCOS_CORES.hardware,
    lego_hub_blocks: BLOCOS_CORES.aparencia,
    lego_remoto_blocks: BLOCOS_CORES.sensores,
    lego_tempo_blocks: BLOCOS_CORES.sensores,
    lego_sensor_blocks: BLOCOS_CORES.sensores,
  };
  for (const nome in grupos) {
    const [primaria, secundaria, terciaria] = grupos[nome];
    estilos[nome] = {
      colourPrimary: primaria,
      colourSecondary: secundaria,
      colourTertiary: terciaria,
      hat: nome === 'eventos_blocks' ? 'cap' : '',
    };
  }
  return estilos;
}

function blocosMontarCategoryStyles() {
  const estilos = {};
  const grupos = {
    movimento: BLOCOS_CORES.movimento, aparencia: BLOCOS_CORES.aparencia, som: BLOCOS_CORES.som,
    eventos: BLOCOS_CORES.eventos, controle: BLOCOS_CORES.controle, sensores: BLOCOS_CORES.sensores,
    operadores: BLOCOS_CORES.operadores, variaveis: BLOCOS_CORES.variaveis, listas: BLOCOS_CORES.listas,
    meus_blocos: BLOCOS_CORES.meusBlocos, arduino: BLOCOS_CORES.hardware, atuadores: BLOCOS_CORES.hardware,
    display: BLOCOS_CORES.hardware, serial: BLOCOS_CORES.sensores,
    lego_motores: BLOCOS_CORES.hardware, lego_hub: BLOCOS_CORES.aparencia,
    lego_remoto: BLOCOS_CORES.sensores, lego_tempo: BLOCOS_CORES.sensores,
    lego_sensor: BLOCOS_CORES.sensores,
  };
  for (const nome in grupos) estilos[nome + '_category'] = { colour: grupos[nome][0] };
  return estilos;
}

/* Tema claro. Fundo do canvas #F9F9F9, grade de pontos #D9D9D9
   (cores de apoio do canvas do Scratch, plano §4). */
const BLOCOS_TEMA_CLARO = Blockly.Theme.defineTheme('scratchClaro', {
  base: Blockly.Themes.Classic,
  blockStyles: blocosMontarBlockStyles(),
  categoryStyles: blocosMontarCategoryStyles(),
  componentStyles: {
    workspaceBackgroundColour: '#F9F9F9',
    toolboxBackgroundColour: '#FFFFFF',
    toolboxForegroundColour: '#2C3B40',
    flyoutBackgroundColour: '#FFFFFF',
    flyoutForegroundColour: '#2C3B40',
    flyoutOpacity: 1,
    scrollbarColour: '#C2CCCE',
    insertionMarkerColour: '#000000',
    insertionMarkerOpacity: 0.2,
    scrollbarOpacity: 0.5,
    cursorColour: '#008184',
  },
  fontStyle: { family: '"Space Grotesk", "Nunito", "Segoe UI", system-ui, sans-serif', weight: '600', size: 11 },
});

/* Tema escuro — reaproveita --fundo-editor (#1E1E1E) do estilo.css
   como fundo do canvas, conforme o plano §4. Blockly.Theme não lê
   variáveis CSS, então o valor está fixo aqui: se --fundo-editor
   mudar no estilo.css, atualizar também aqui. */
const BLOCOS_TEMA_ESCURO = Blockly.Theme.defineTheme('scratchEscuro', {
  base: Blockly.Themes.Classic,
  blockStyles: blocosMontarBlockStyles(),
  categoryStyles: blocosMontarCategoryStyles(),
  componentStyles: {
    workspaceBackgroundColour: '#1E1E1E',
    toolboxBackgroundColour: '#232323',
    toolboxForegroundColour: '#F2F2F2',
    flyoutBackgroundColour: '#232323',
    flyoutForegroundColour: '#F2F2F2',
    flyoutOpacity: 1,
    scrollbarColour: '#4A4A4A',
    insertionMarkerColour: '#FFFFFF',
    insertionMarkerOpacity: 0.3,
    scrollbarOpacity: 0.5,
    cursorColour: '#0CA1A6',
  },
  fontStyle: { family: '"Space Grotesk", "Nunito", "Segoe UI", system-ui, sans-serif', weight: '600', size: 11 },
});
