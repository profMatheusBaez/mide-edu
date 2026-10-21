/* ============================================================
 * lego_exemplos.js — MIDE EDU, placa LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Exemplos do menu Arquivo → Exemplos → LEGO. Só dados (sem DOM):
 * assim o teste em Node (ferramentas/testar_lego_gen.mjs) gera o
 * Python de cada exemplo e o passa pelo mpy-cross.
 *
 * Tipo "blocos": workspace do Blockly já serializado (o menu carrega
 * na aba Blocos). Tipo "python": texto para o Editor Python — o
 * "Descobrir portas" usa try/except, que não existe em blocos.
 *
 * NÃO fixa a fiação do LR 13000 no código: o aluno descobre qual
 * motor está em cada porta com "Descobrir portas". O exemplo do
 * guindaste é uma reescrita didática, não uma cópia do projeto do
 * Pybricks; confira as portas antes de rodar.
 * ============================================================ */
'use strict';

/* ---- construtores mínimos do JSON do Blockly ---- */
const _lg = {
  n: (v) => ({ block: { type: 'math_number', fields: { NUM: v } } }),
  t: (v) => ({ block: { type: 'text', fields: { TEXT: v } } }),
  r: (b) => ({ block: b }),
  b: (type, campos, entradas) => {
    const o = { type };
    if (campos) o.fields = campos;
    if (entradas) o.inputs = entradas;
    return o;
  },
  /* encadeia instruções (next) e devolve a primeira */
  p: (...bs) => {
    for (let i = 0; i < bs.length - 1; i++) bs[i].next = { block: bs[i + 1] };
    return bs[0];
  },
};
const _lgDentro = (nome, ...bs) => ({ [nome]: { block: _lg.p(...bs) } });
const _lgWs = (pilha, variaveis) => {
  const ws = { blocks: { languageVersion: 0, blocks: [Object.assign({ x: 20, y: 20 }, pilha)] } };
  if (variaveis) ws.variables = variaveis;
  return ws;
};

const LEGO_EXEMPLOS = [

  /* ---------------------------------------------------------- */
  {
    id: 'descobrir_portas',
    nome: 'Descobrir portas',
    tipo: 'python',
    descricao: 'Tenta ligar um motor em cada porta (A a D) e escreve no Monitor o que achou.',
    arquivo: 'descobrir_portas.py',
    python:
'# Descobrir portas: qual motor esta em cada porta do hub?\n' +
'# Envie este programa e abra o Monitor Serial: ele tenta ligar\n' +
'# um motor em cada porta (A, B, C e D) e conta o que encontrou.\n' +
'from pybricks.pupdevices import Motor\n' +
'from pybricks.parameters import Port\n' +
'from pybricks.tools import wait\n' +
'\n' +
'portas = [Port.A, Port.B, Port.C, Port.D]\n' +
'nomes = ["A", "B", "C", "D"]\n' +
'\n' +
'for i in range(4):\n' +
'    try:\n' +
'        motor = Motor(portas[i])\n' +
'        print("Porta", nomes[i], "-> motor encontrado, angulo:", motor.angle())\n' +
'    except OSError:\n' +
'        print("Porta", nomes[i], "-> nenhum motor")\n' +
'    wait(200)\n' +
'\n' +
'print("Pronto!")\n',
  },

  /* ---------------------------------------------------------- */
  {
    id: 'girar_motor',
    nome: 'Girar um motor',
    tipo: 'blocos',
    descricao: 'O motor da porta A dá duas voltas e volta. A luz do hub mostra em que etapa está.',
    blocos: _lgWs(_lg.p(
      _lg.b('evento_iniciar'),
      _lg.b('lego_hub_luz', { COR: 'GREEN' }),
      _lg.b('lego_motor_girar_graus', { PORTA: 'A' }, { GRAUS: _lg.n(720), VEL: _lg.n(360) }),
      _lg.b('lego_hub_luz', { COR: 'BLUE' }),
      _lg.b('controle_espere_seg', { SEG: 1 }),
      _lg.b('lego_motor_girar_graus', { PORTA: 'A' }, { GRAUS: _lg.n(-720), VEL: _lg.n(360) }),
      _lg.b('lego_motor_parar', { PORTA: 'A', MODO: 'HOLD' }),
      _lg.b('lego_hub_luz_apagar'),
    )),
  },

  /* ---------------------------------------------------------- */
  {
    id: 'vai_e_volta',
    nome: 'Vai e volta com girar graus',
    tipo: 'blocos',
    descricao: 'O motor A vai e volta 180 graus, três vezes, e o Monitor conta as voltas.',
    blocos: _lgWs(_lg.p(
      _lg.b('evento_iniciar'),
      _lg.b('lego_motor_zerar', { PORTA: 'A' }),
      _lg.b('controle_repita_vezes', { VEZES: 3 }, _lgDentro('DO',
        _lg.b('lego_monitor_escrever', null, { TEXTO: _lg.t('indo') }),
        _lg.b('lego_motor_girar_graus', { PORTA: 'A' }, { GRAUS: _lg.n(180), VEL: _lg.n(200) }),
        _lg.b('controle_espere_ms', { MS: 500 }),
        _lg.b('lego_monitor_escrever', null, { TEXTO: _lg.t('voltando') }),
        _lg.b('lego_motor_girar_graus', { PORTA: 'A' }, { GRAUS: _lg.n(-180), VEL: _lg.n(200) }),
        _lg.b('controle_espere_ms', { MS: 500 }),
      )),
      _lg.b('lego_monitor_escrever', null, { TEXTO: _lg.r(_lg.b('lego_motor_angulo', { PORTA: 'A' })) }),
    )),
  },

  /* ---------------------------------------------------------- */
  {
    id: 'luz_inclinacao',
    nome: 'Luz do hub por inclinação',
    tipo: 'blocos',
    descricao: 'Incline o hub para frente: a luz fica vermelha. O valor aparece no Gráfico Serial.',
    blocos: _lgWs(_lg.p(
      _lg.b('evento_iniciar'),
      _lg.b('controle_sempre', null, _lgDentro('DO',
        _lg.b('variables_set', { VAR: { id: 'inclinacao' } }, { VALUE: _lg.r(_lg.b('lego_hub_inclinacao', { EIXO: '0' })) }),
        _lg.b('lego_monitor_escrever', null, { TEXTO: _lg.r(_lg.b('variables_get', { VAR: { id: 'inclinacao' } })) }),
        _lg.b('controle_se_senao', null, Object.assign(
          { CONDICAO: _lg.r(_lg.b('operador_maior', null, { A: _lg.r(_lg.b('variables_get', { VAR: { id: 'inclinacao' } })), B: _lg.n(20) })) },
          _lgDentro('DO', _lg.b('lego_hub_luz', { COR: 'RED' })),
          _lgDentro('SENAO', _lg.b('lego_hub_luz', { COR: 'GREEN' })),
        )),
        _lg.b('controle_espere_ms', { MS: 100 }),
      )),
    ), [{ name: 'inclinacao', id: 'inclinacao' }]),
  },

  /* ---------------------------------------------------------- */
  {
    id: 'guindaste_controle',
    nome: 'Guindaste com controle remoto',
    tipo: 'blocos',
    descricao: 'Dois motores comandados pelo controle remoto Powered Up (direita: motor A, esquerda: motor B). Confira as portas com “Descobrir portas”.',
    blocos: _lgWs(_lg.p(
      _lg.b('evento_iniciar'),
      _lg.b('lego_remoto_conectar'),
      _lg.b('lego_remoto_luz', { COR: 'GREEN' }),
      _lg.b('controle_sempre', null, _lgDentro('DO',
        /* botões da direita: motor A */
        _lg.b('controle_se_senao', null, Object.assign(
          { CONDICAO: _lg.r(_lg.b('lego_remoto_botao', { BOTAO: 'RIGHT_PLUS' })) },
          _lgDentro('DO', _lg.b('lego_motor_potencia', { PORTA: 'A' }, { POTENCIA: _lg.n(60) })),
          _lgDentro('SENAO',
            _lg.b('controle_se_senao', null, Object.assign(
              { CONDICAO: _lg.r(_lg.b('lego_remoto_botao', { BOTAO: 'RIGHT_MINUS' })) },
              _lgDentro('DO', _lg.b('lego_motor_potencia', { PORTA: 'A' }, { POTENCIA: _lg.n(-60) })),
              _lgDentro('SENAO', _lg.b('lego_motor_parar', { PORTA: 'A', MODO: 'BRAKE' })),
            )),
          ),
        )),
        /* botões da esquerda: motor B */
        _lg.b('controle_se_senao', null, Object.assign(
          { CONDICAO: _lg.r(_lg.b('lego_remoto_botao', { BOTAO: 'LEFT_PLUS' })) },
          _lgDentro('DO', _lg.b('lego_motor_potencia', { PORTA: 'B' }, { POTENCIA: _lg.n(60) })),
          _lgDentro('SENAO',
            _lg.b('controle_se_senao', null, Object.assign(
              { CONDICAO: _lg.r(_lg.b('lego_remoto_botao', { BOTAO: 'LEFT_MINUS' })) },
              _lgDentro('DO', _lg.b('lego_motor_potencia', { PORTA: 'B' }, { POTENCIA: _lg.n(-60) })),
              _lgDentro('SENAO', _lg.b('lego_motor_parar', { PORTA: 'B', MODO: 'BRAKE' })),
            )),
          ),
        )),
        _lg.b('controle_espere_ms', { MS: 10 }),
      )),
    )),
  },
];

if (typeof globalThis !== 'undefined') globalThis.LEGO_EXEMPLOS = LEGO_EXEMPLOS;
