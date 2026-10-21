/* ============================================================
 * blocos_lego_toolbox.js — Modo Blocos, placa LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Toolbox LEGO: reaproveita Eventos/Controle/Operadores/Variáveis
 * do catálogo do Uno (BLOCOS_CATALOGO, blocos_toolbox.js) e troca
 * os blocos de hardware do Arduino pelos do hub Technic. Nenhum
 * bloco de pino/servo/LCD do Arduino aparece aqui.
 * Depende de _num/_bool/_txt e BLOCOS_CATALOGO (blocos_toolbox.js).
 * ============================================================ */
'use strict';

const BLOCOS_LEGO_CATALOGO = {
  lego_motores: [
    { kind: 'block', type: 'lego_motor_girar', inputs: { VEL: _num(360) } },
    { kind: 'block', type: 'lego_motor_girar_graus', inputs: { GRAUS: _num(360), VEL: _num(360) } },
    { kind: 'block', type: 'lego_motor_ir_ate', inputs: { ALVO: _num(90), VEL: _num(360) } },
    { kind: 'block', type: 'lego_motor_girar_tempo', inputs: { TEMPO: _num(1000), VEL: _num(360) } },
    { kind: 'block', type: 'lego_motor_potencia', inputs: { POTENCIA: _num(50) } },
    { kind: 'block', type: 'lego_motor_parar' },
    { kind: 'block', type: 'lego_motor_zerar' },
    { kind: 'block', type: 'lego_motor_sentido' },
    { kind: 'block', type: 'lego_motor_angulo' },
    { kind: 'block', type: 'lego_motor_velocidade' },
    { kind: 'block', type: 'lego_motor_travado' },
  ],
  lego_hub: [
    { kind: 'block', type: 'lego_hub_luz' },
    { kind: 'block', type: 'lego_hub_luz_apagar' },
    { kind: 'block', type: 'lego_hub_inclinacao' },
    { kind: 'block', type: 'lego_hub_direcao' },
    { kind: 'block', type: 'lego_hub_bateria' },
  ],
  lego_remoto: [
    { kind: 'block', type: 'lego_remoto_conectar' },
    { kind: 'block', type: 'lego_remoto_botao' },
    { kind: 'block', type: 'lego_remoto_luz' },
  ],
  lego_tempo: [
    { kind: 'block', type: 'lego_tempo_zerar' },
    { kind: 'block', type: 'lego_tempo_ler' },
    { kind: 'block', type: 'lego_monitor_escrever', inputs: { TEXTO: _txt('oi') } },
  ],
  lego_sensor: [
    { kind: 'block', type: 'lego_sensor_distancia' },
    { kind: 'block', type: 'lego_sensor_cor' },
  ],
};

const BLOCOS_LEGO_CATEGORIAS = [
  { nome: 'eventos', rotulo: 'Eventos', origem: 'uno' },
  { nome: 'controle', rotulo: 'Controle', origem: 'uno' },
  { nome: 'operadores', rotulo: 'Operadores', origem: 'uno' },
  { nome: 'variaveis', rotulo: 'Variáveis', origem: 'uno' },
  { nome: 'lego_motores', rotulo: 'Motores' },
  { nome: 'lego_hub', rotulo: 'Hub' },
  { nome: 'lego_remoto', rotulo: 'Controle remoto' },
  { nome: 'lego_tempo', rotulo: 'Tempo e Monitor' },
  { nome: 'lego_sensor', rotulo: 'Sensor (opcional)' },
];

function blocosMontarToolboxLego() {
  return {
    kind: 'categoryToolbox',
    contents: BLOCOS_LEGO_CATEGORIAS.map((c) => ({
      kind: 'category',
      name: c.rotulo,
      categorystyle: c.nome + '_category',
      contents: (c.origem === 'uno' ? BLOCOS_CATALOGO[c.nome] : BLOCOS_LEGO_CATALOGO[c.nome]) || [],
    })),
  };
}
