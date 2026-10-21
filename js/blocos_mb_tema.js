/* ============================================================
 * blocos_mb_tema.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Cores como no Scratch (Controle, Operadores, Variáveis) e uma cor
 * própria, que lembra a placa, nos blocos da micro:bit (MB_CORES,
 * blocos_mb_spec.js); blocos de evento com "chapéu" (hat: cap).
 * Parte dos temas do Scratch (blocos_tema.js) e só acrescenta os
 * estilos mb_* e recolore os blocos nativos do Blockly (Laços,
 * Lógica, Matemática, Texto, Variáveis) — assim os perfis do Uno
 * e do LEGO não mudam.
 * ============================================================ */
'use strict';

/* Categorias que existem no Scratch usam o trio de cores EXATO do Scratch (BLOCOS_CORES). */
const MB_CATEGORIAS_SCRATCH = {
  lacos: 'controle', logica: 'operadores', matematica: 'operadores', texto: 'operadores', variaveis: 'variaveis',
};

/* Blocos próprios da micro:bit: uma cor só, que lembra a placa — corpo preto-azulado com o contorno dourado dos contatos. */
const MB_TRIO_PLACA = {
  claro: { colourPrimary: '#2F3E4E', colourSecondary: '#43566B', colourTertiary: '#E0B12C' },
  escuro: { colourPrimary: '#3A4C5F', colourSecondary: '#4F647B', colourTertiary: '#E0B12C' },
};

function mbMontarEstilos(escuro) {
  const blockStyles = {};
  const categoryStyles = {};
  const trioPlaca = MB_TRIO_PLACA[escuro ? 'escuro' : 'claro'];
  for (const cat of Object.keys(MB_CORES)) {
    const scratch = MB_CATEGORIAS_SCRATCH[cat];
    const trio = scratch
      ? { colourPrimary: BLOCOS_CORES[scratch][0], colourSecondary: BLOCOS_CORES[scratch][1], colourTertiary: BLOCOS_CORES[scratch][2] }
      : trioPlaca;
    blockStyles['mb_' + cat + '_blocks'] = Object.assign({}, trio, { hat: '' });
    blockStyles['mb_' + cat + '_hat_blocks'] = Object.assign({}, trio, { hat: 'cap' });
    categoryStyles['mb_' + cat + '_category'] = { colour: trio.colourPrimary };
  }
  /* categoria cinza: coisas que só existem em JavaScript, vistas em MicroPython */
  categoryStyles['mb_desativado_category'] = { colour: '#9AA3AB' };
  /* blocos nativos do Blockly, nas cores do Scratch: laços e “se” = Controle; contas, texto e comparações = Operadores */
  const nativos = { loop_blocks: 'controle', logic_blocks: 'controle', math_blocks: 'operadores', text_blocks: 'operadores', variable_blocks: 'variaveis' };
  for (const n of Object.keys(nativos)) {
    const c = BLOCOS_CORES[nativos[n]];
    blockStyles[n] = { colourPrimary: c[0], colourSecondary: c[1], colourTertiary: c[2], hat: '' };
  }
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
