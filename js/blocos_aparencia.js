/* ============================================================
 * blocos_aparencia.js — MIDE EDU, Modo Blocos com a cara do
 * Scratch 3 / PictoBlox
 * ------------------------------------------------------------
 * - Coluna de categorias: um círculo na cor da categoria com o nome
 *   embaixo (Controle, Operadores, Variáveis…), e as extensões de
 *   hardware com um ícone no lugar do círculo (placa, Atuadores,
 *   Sensores, Display, Comunicação) — como no PictoBlox.
 * - Blocos das extensões: o ícone da categoria à esquerda do bloco.
 * - Flyout: o nome da categoria em cima, como no Scratch.
 * Ícones desenhados aqui (SVG próprio, sem logotipos de terceiros).
 * Carregar depois de blocos_tema.js e antes das definições de blocos.
 * ============================================================ */
'use strict';

const _svgIcone = (corpo) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' + corpo + '</svg>');

const BLOCOS_ICONES = {
  /* Arduino Uno: placa verde-azulada com o chip e as fileiras de pinos */
  uno: _svgIcone('<rect x="1.5" y="4" width="21" height="16" rx="2.5" fill="#00878F" stroke="#fff" stroke-width="1.2"/>' +
    '<rect x="4" y="5.6" width="13" height="1.6" rx=".5" fill="#2b2b2b"/><rect x="7" y="16.8" width="12" height="1.6" rx=".5" fill="#2b2b2b"/>' +
    '<rect x="9" y="9.2" width="8" height="5" rx=".8" fill="#1c1c1c"/><circle cx="5.2" cy="12" r="1.6" fill="#E8E8E8"/>'),
  /* micro:bit: placa escura com a matriz de LEDs e dois botões */
  microbit: _svgIcone('<rect x="1.5" y="4" width="21" height="16" rx="3" fill="#1F2A36" stroke="#fff" stroke-width="1.2"/>' +
    Array.from({ length: 9 }, (_, i) => `<rect x="${9 + (i % 3) * 2.2}" y="${8.2 + Math.floor(i / 3) * 2.6}" width="1.3" height="1.3" fill="#FF3B30"/>`).join('') +
    '<circle cx="5.2" cy="12" r="1.8" fill="#9AA3AB"/><circle cx="18.8" cy="12" r="1.8" fill="#9AA3AB"/>'),
  /* UNIHIKER K10: placa com a tela colorida */
  k10: _svgIcone('<rect x="5" y="1.5" width="14" height="21" rx="2.5" fill="#22262B" stroke="#fff" stroke-width="1.2"/>' +
    '<rect x="7" y="4" width="10" height="11" rx="1" fill="#3DA9FC"/><path d="M7 12l3-3 2.5 2.5L15 9l2 2v4H7z" fill="#7DD87D"/>' +
    '<circle cx="9.5" cy="18.5" r="1.3" fill="#E0B12C"/><circle cx="14.5" cy="18.5" r="1.3" fill="#E0B12C"/>'),
  /* Atuadores: engrenagem amarela */
  atuadores: _svgIcone('<g transform="translate(12 12)">' +
    Array.from({ length: 8 }, (_, i) => `<rect x="-1.9" y="-11" width="3.8" height="5" rx="1" fill="#2b2b2b" transform="rotate(${i * 45})"/>`).join('') +
    '<circle r="8" fill="#2b2b2b"/><circle r="6.6" fill="#F7D417"/><circle r="2.6" fill="#2b2b2b"/></g>'),
  /* Sensores: termômetro */
  sensores: _svgIcone('<rect x="9.5" y="2" width="5" height="14" rx="2.5" fill="#fff" stroke="#9AA3AB" stroke-width="1"/>' +
    '<rect x="11.1" y="7" width="1.8" height="9" fill="#E53935"/><circle cx="12" cy="18.2" r="3.8" fill="#E53935" stroke="#fff" stroke-width="1"/>'),
  /* Display: matriz de pontos */
  display: _svgIcone('<rect x="2" y="2" width="20" height="20" rx="2" fill="#5B5B5B" stroke="#fff" stroke-width="1"/>' +
    Array.from({ length: 16 }, (_, i) => `<rect x="${4.2 + (i % 4) * 4.1}" y="${4.2 + Math.floor(i / 4) * 4.1}" width="3.2" height="3.2" rx=".6" fill="${[0, 3, 5, 6, 9, 10, 12, 15].includes(i) ? '#FF8A80' : '#E8E8E8'}"/>`).join('')),
  /* Comunicação (Serial, Rádio, Bluetooth, Wi-Fi): duas setas, uma indo e outra voltando */
  comunicacao: _svgIcone('<path d="M3 8.5h14M13.5 4.5l4 4-4 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M21 15.5H7M10.5 11.5l-4 4 4 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  /* a mesma, marrom, para a coluna de categorias (fundo claro) */
  comunicacao_coluna: _svgIcone('<path d="M3 8.5h14M13.5 4.5l4 4-4 4" fill="none" stroke="#7F461B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M21 15.5H7M10.5 11.5l-4 4 4 4" fill="none" stroke="#7F461B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
};

/* Cada estilo de extensão → ícone (a placa depende do perfil). coluna = o da coluna de categorias. */
function blocosIconeDoGrupo(grupo, placa, coluna) {
  if (grupo === 'ext_placa') return BLOCOS_ICONES[placa] || BLOCOS_ICONES.uno;
  const nome = String(grupo).replace(/^ext_/, '');
  return (coluna && BLOCOS_ICONES[nome + '_coluna']) || BLOCOS_ICONES[nome] || null;
}

/* Extensões do Blockly que põem o ícone no começo do bloco: icone_<grupo>_<placa>. */
(function registrarIcones() {
  if (typeof Blockly === 'undefined' || !Blockly.Extensions) return;
  const grupos = ['ext_placa', 'ext_atuadores', 'ext_sensores', 'ext_display', 'ext_comunicacao'];
  for (const placa of ['uno', 'microbit', 'k10']) {
    for (const g of grupos) {
      const nome = 'icone_' + g + '_' + placa;
      if (Blockly.Extensions.isRegistered && Blockly.Extensions.isRegistered(nome)) continue;
      const src = blocosIconeDoGrupo(g, placa);
      Blockly.Extensions.register(nome, function () {
        const entrada = this.inputList[0];
        if (!entrada) return;
        entrada.insertFieldAt(0, new Blockly.FieldImage(src, 24, 24, ''), 'ICONE_EXT');
      });
    }
  }
})();

/* Põe o estilo e o ícone de extensão numa definição JSON de bloco. */
function blocosMarcarExtensao(def, grupo, placa) {
  const hat = /_hat_blocks$/.test(def.style || '');
  def.style = grupo + (hat ? '_hat_blocks' : '_blocks');
  def.extensions = (def.extensions || []).concat(['icone_' + grupo + '_' + placa]);
  return def;
}

/* ------------------------------------------------------------
 * Coluna de categorias no estilo do Scratch / PictoBlox
 * ---------------------------------------------------------- */
(function registrarCategoriaScratch() {
  if (typeof Blockly === 'undefined' || !Blockly.ToolboxCategory || !Blockly.registry) return;
  class CategoriaScratch extends Blockly.ToolboxCategory {
    /* no lugar da borda colorida, a cor vai para o círculo */
    addColourBorder_(cor) {
      if (this.rowDiv_) this.rowDiv_.style.setProperty('--cat-cor', cor || '#ccc');
    }
    createIconDom_() {
      const def = this.toolboxItemDef_ || {};
      if (def.icone) {
        const img = document.createElement('img');
        img.className = 'blocklyToolboxCategoryIcon cat-icone cat-icone-img';
        img.src = def.icone;
        img.alt = '';
        img.draggable = false;
        return img;
      }
      const s = document.createElement('span');
      s.className = 'blocklyToolboxCategoryIcon cat-icone cat-circulo';
      return s;
    }
    openIcon_() { /* sem a seta de abrir/fechar */ }
    closeIcon_() { /* idem */ }
  }
  Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM, Blockly.ToolboxCategory.registrationName, CategoriaScratch, true);
})();

/* Título da categoria no alto do flyout (como "Controle", "Sensores" no Scratch). */
function blocosComTitulos(def) {
  if (!def || !def.contents) return def;
  return Object.assign({}, def, {
    contents: def.contents.map((c) => {
      if (c.kind !== 'category' || c.custom || !c.contents) return c;
      if (c.contents[0] && c.contents[0].kind === 'label') return c;
      return Object.assign({}, c, { contents: [{ kind: 'label', text: c.name, 'web-class': 'blocos-flyout-titulo' }].concat(c.contents) });
    }),
  });
}
