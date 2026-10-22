/* ============================================================
 * blocos_mb_defs.js — Modo Blocos, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Definições Blockly geradas da tabela blocos_mb_spec.js, mais:
 *   · o campo "5×5 LEDs" (field_mb_leds) do bloco "mostrar LEDs";
 *   · os blocos "definir … para" e "mudar … por" (o Blockly nativo
 *     diz "mude", o MakeCode diz "definir").
 * Depende de: Blockly e blocos_mb_spec.js.
 * ============================================================ */
'use strict';

/* ------------------------------------------------------------
 * Campo 5×5: 25 quadradinhos que o aluno liga e desliga com o
 * clique. O valor é um texto de 25 caracteres "0"/"1", linha por
 * linha (de cima para baixo, da esquerda para a direita).
 * ---------------------------------------------------------- */
const MB_LEDS_VAZIO = '0000000000000000000000000';

class CampoLedsMb extends Blockly.Field {
  constructor(valor, validador) {
    super(valor == null ? MB_LEDS_VAZIO : valor, validador);
    this.SERIALIZABLE = true;
    this.CURSOR = 'pointer';
    this.celulas_ = [];
  }

  static fromJson(opcoes) { return new this(opcoes && opcoes.value); }

  doClassValidation_(novo) {
    return typeof novo === 'string' && /^[01]{25}$/.test(novo) ? novo : null;
  }

  initView() {
    const dom = Blockly.utils.dom;
    const C = 11, G = 2;
    this.celulas_ = [];
    for (let i = 0; i < 25; i++) {
      const cel = dom.createSvgElement('rect', {
        x: (i % 5) * (C + G), y: Math.floor(i / 5) * (C + G), width: C, height: C, rx: 2, ry: 2,
        stroke: 'rgba(255,255,255,0.55)', 'stroke-width': 1,
      }, this.fieldGroup_);
      this.celulas_.push(cel);
    }
    this.tamanho_ = 5 * C + 4 * G;
  }

  render_() {
    const v = String(this.getValue() || MB_LEDS_VAZIO);
    this.celulas_.forEach((cel, i) => cel.setAttribute('fill', v[i] === '1' ? '#FF2D2D' : 'rgba(0,0,0,0.35)'));
    this.size_.width = this.tamanho_ + 8;
    this.size_.height = this.tamanho_ + 8;
    this.fieldGroup_.setAttribute('transform', 'translate(4,4)');
  }

  showEditor_(e) {
    const alvo = e && e.target;
    const i = this.celulas_.indexOf(alvo);
    if (i < 0) return;
    const v = String(this.getValue() || MB_LEDS_VAZIO).split('');
    v[i] = v[i] === '1' ? '0' : '1';
    this.setValue(v.join(''));
  }

  getText_() { return String(this.getValue() || MB_LEDS_VAZIO); }
}

Blockly.fieldRegistry.register('field_mb_leds', CampoLedsMb);

/* ------------------------------------------------------------
 * Definições geradas da tabela
 * ---------------------------------------------------------- */
function mbDefinicaoBlockly(b) {
  const nomes = [];
  const message0 = b.msg.replace(/\{([A-Z0-9_]+)\}/g, (_, n) => { nomes.push(n); return '%' + nomes.length; });
  const porNome = new Map(b.args.map((a) => [a.n, a]));
  if (nomes.length !== b.args.length || nomes.some((n) => !porNome.has(n))) {
    throw new Error('blocos_mb_spec: argumentos de ' + b.id + ' não batem com a mensagem.');
  }
  const args0 = nomes.map((n) => {
    const a = porNome.get(n);
    switch (a.t) {
      case 'num': return { type: 'input_value', name: n, check: 'Number' };
      case 'txt': return { type: 'input_value', name: n, check: 'String' };
      case 'bool': return { type: 'input_value', name: n, check: 'Boolean' };
      case 'any': return { type: 'input_value', name: n };
      case 'sprite': return { type: 'input_value', name: n, check: 'Sprite' };
      case 'drop': return { type: 'field_dropdown', name: n, options: a.op.map((o) => [o[0], o[1]]) };
      case 'var': return { type: 'field_variable', name: n, variable: 'i' };
      case 'leds': return { type: 'field_mb_leds', name: n, value: MB_LEDS_VAZIO };
      default: throw new Error('blocos_mb_spec: tipo de argumento desconhecido em ' + b.id);
    }
  });

  const def = { type: b.id, message0, args0, inputsInline: true, tooltip: b.dica || '' };
  const corpo = b.forma === 'evento' || b.corpo;
  if (corpo) {
    def.message1 = '%1';
    def.args1 = [{ type: 'input_statement', name: 'DO' }];
  }
  const grupo = mbGrupoScratch(b);   // cor do Scratch / extensão do PictoBlox
  if (/^ext_/.test(grupo)) def.extensions = ['icone_' + grupo + '_microbit'];
  if (b.forma === 'evento') {
    def.style = grupo + '_hat_blocks';
  } else {
    def.style = grupo + '_blocks';
    if (b.forma === 'valor') def.output = b.saida || null;
    else { def.previousStatement = null; def.nextStatement = null; }
  }
  return def;
}

const BLOCOS_MB_DEFINICOES = MB_BLOCOS.map(mbDefinicaoBlockly).concat([
  {
    type: 'mb_var_definir',
    message0: 'definir %1 para %2',
    args0: [{ type: 'field_variable', name: 'VAR', variable: 'item' }, { type: 'input_value', name: 'VALOR' }],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'variaveis_blocks',
    tooltip: 'Guarda um valor na variável.',
  },
  {
    type: 'mb_var_mudar',
    message0: 'mudar %1 por %2',
    args0: [{ type: 'field_variable', name: 'VAR', variable: 'item' }, { type: 'input_value', name: 'VALOR', check: 'Number' }],
    previousStatement: null, nextStatement: null, inputsInline: true,
    style: 'variaveis_blocks',
    tooltip: 'Soma esse valor à variável (use um número negativo para subtrair).',
  },
]);

Blockly.defineBlocksWithJsonArray(BLOCOS_MB_DEFINICOES);
