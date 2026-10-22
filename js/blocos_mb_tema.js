/* ============================================================
 * blocos_mb_tema.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Todos os blocos nas cores do Scratch 3, pelo papel de cada bloco
 * (mbGrupoScratch, blocos_mb_spec.js); blocos de evento com
 * "chapéu" (hat: cap).
 * Parte dos temas do Scratch (blocos_tema.js) e só acrescenta os
 * estilos mb_* e recolore os blocos nativos do Blockly (Laços,
 * Lógica, Matemática, Texto, Variáveis) — assim os perfis do Uno
 * e do LEGO não mudam.
 * ============================================================ */
'use strict';

/* Todos os blocos nas cores do Scratch 3 (BLOCOS_CORES): cada bloco da tabela escolhe o
   grupo pelo seu papel (mbGrupoScratch, blocos_mb_spec.js); aqui ficam os estilos com
   chapéu (eventos e "sempre") e a cor de cada categoria da toolbox. */
function mbMontarEstilos() {
  const blockStyles = {};
  const categoryStyles = {};
  const trio = (g) => ({ colourPrimary: BLOCOS_CORES[g][0], colourSecondary: BLOCOS_CORES[g][1], colourTertiary: BLOCOS_CORES[g][2] });
  for (const g of Object.keys(BLOCOS_CORES)) {
    blockStyles[g + '_blocks'] = Object.assign(trio(g), { hat: '' });
    blockStyles[g + '_hat_blocks'] = Object.assign(trio(g), { hat: 'cap' });
  }
  for (const cat of Object.keys(MB_CAT_SCRATCH)) {
    categoryStyles['mb_' + cat + '_category'] = { colour: BLOCOS_CORES[MB_CAT_SCRATCH[cat]][0] };
  }
  /* categoria cinza: coisas que só existem em JavaScript, vistas em MicroPython */
  categoryStyles['mb_desativado_category'] = { colour: '#9AA3AB' };
  /* blocos nativos do Blockly, nas cores do Scratch: laços e “se” = Controle; contas, texto e comparações = Operadores */
  const nativos = { loop_blocks: 'controle', logic_blocks: 'controle', math_blocks: 'operadores', text_blocks: 'operadores', variable_blocks: 'variaveis' };
  for (const n of Object.keys(nativos)) blockStyles[n] = Object.assign(trio(nativos[n]), { hat: '' });
  return { blockStyles, categoryStyles };
}

/* No Scratch as comparações e os operadores lógicos são verdes (Operadores), e o “se” é laranja (Controle).
   No Blockly os dois usam o mesmo estilo; então, só nos temas da micro:bit, esses blocos trocam de estilo ao nascer. */
(function mbEstilizarLogicaNativa() {
  ['logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_null', 'logic_ternary'].forEach((tipo) => {
    const def = Blockly.Blocks[tipo];
    if (!def || def.__mbEstilizado) return;
    const iniciar = def.init;
    def.init = function () {
      iniciar.call(this);
      const tema = this.workspace && typeof this.workspace.getTheme === 'function' ? this.workspace.getTheme() : null;
      if (tema && /^mb/.test(tema.name || '')) this.setStyle('operadores_blocks');
    };
    def.__mbEstilizado = true;
  });
})();

const BLOCOS_TEMA_MB_CLARO = (() => {
  const e = mbMontarEstilos(false);
  return Blockly.Theme.defineTheme('mbClaro', { base: BLOCOS_TEMA_CLARO, blockStyles: e.blockStyles, categoryStyles: e.categoryStyles });
})();
const BLOCOS_TEMA_MB_ESCURO = (() => {
  const e = mbMontarEstilos(true);
  return Blockly.Theme.defineTheme('mbEscuro', { base: BLOCOS_TEMA_ESCURO, blockStyles: e.blockStyles, categoryStyles: e.categoryStyles });
})();
