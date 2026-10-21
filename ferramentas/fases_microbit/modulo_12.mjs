/* Módulo 12 — Botão externo (5 fases). Pinos: MB_PINOS.botao (um e dois). */
import { X, definir, mudar, v, se, cmp, e, programa, pino } from './_dsl.mjs';

const AVISO = 'Ligue o botão entre o pino e o GND. O pino usa o resistor interno de “pull-up”: solto, o pino lê 1; apertado, lê 0. Por isso o programa procura o valor 0 para saber que o botão foi apertado.';
const AVISO_LED = ' O LED (com resistor de 220 Ω) fica em um pino que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.';
const B1 = () => pino('botao.um'), B2 = () => pino('botao.dois');
const LV = () => pino('led.vermelho'), LG = () => pino('led.verde');
const APERTADO = (p) => cmp(X.ler_digital({ P: p }), '==', 0);

export default {
  modulo: 11,
  fases: [
    {
      nome: 'Ler o botão',
      objetivo: 'Mostre um rosto feliz enquanto o botão externo estiver apertado.',
      conceito: 'Um botão é uma chave: apertado, liga dois fios. Com o resistor de pull-up ligado (por dentro da micro:bit), o pino fica em 1 quando o botão está solto e vai para 0 quando ele é apertado. Ler o pino é perguntar “ele está em 0?”.',
      resultado: 'Enquanto o botão externo está apertado aparece um rosto feliz; ao soltar, a tela apaga.',
      desafio: 'Inverta: mostre o rosto feliz quando o botão estiver SOLTO.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.puxar_pino({ P: B1(), PULL: 'UP' })]),
        X.sempre({}, [
          se(APERTADO(B1()),
            [X.mostrar_icone({ ICONE: 'Happy' })],
            [X.limpar_tela({})]),
        ]),
      ),
    },
    {
      nome: 'Botão acende LED',
      objetivo: 'Acenda o LED vermelho enquanto o botão estiver apertado.',
      conceito: 'Agora juntamos a entrada e a saída no mesmo circuito: o botão (entrada) controla o LED (saída). A cada volta, o programa lê o botão e escreve no LED o valor correspondente. Este é o circuito mais clássico do Arduino, feito na micro:bit.',
      resultado: 'O LED acende enquanto o botão é mantido apertado e apaga quando ele é solto.',
      desafio: 'Coloque o segundo botão para apagar o LED, e faça o LED ficar aceso mesmo depois de soltar o primeiro.',
      aviso: AVISO + AVISO_LED,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' }), X.puxar_pino({ P: B1(), PULL: 'UP' })]),
        X.sempre({}, [
          se(APERTADO(B1()),
            [X.escrever_digital({ P: LV(), V: 1 })],
            [X.escrever_digital({ P: LV(), V: 0 })]),
        ]),
      ),
    },
    {
      nome: 'Liga e desliga (alternar)',
      objetivo: 'Transforme o botão em um interruptor: aperta uma vez, o LED acende; aperta de novo, o LED apaga.',
      conceito: 'Um interruptor tem memória: guarda se o LED está ligado ou desligado. A variável ligado vale 0 ou 1. Cada aperto troca o valor: 1 − ligado (0 vira 1, 1 vira 0). Depois de trocar, o programa espera o botão ser solto: sem essa espera, um aperto só seria contado várias vezes.',
      resultado: 'Cada aperto do botão troca o estado do LED: aceso, apagado, aceso…',
      desafio: 'Faça a tela mostrar “ON” e “OFF” junto com o LED.',
      aviso: AVISO + AVISO_LED,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' }), X.puxar_pino({ P: B1(), PULL: 'UP' }), definir('ligado', 0)]),
        X.sempre({}, [
          se(APERTADO(B1()), [
            definir('ligado', e(1, '-', v('ligado'))),
            X.escrever_digital({ P: LV(), V: v('ligado') }),
            X.enquanto({ C: APERTADO(B1()) }, [X.pausa({ MS: 10 })]),
          ]),
        ]),
      ),
    },
    {
      nome: 'Dois botões',
      objetivo: 'Use dois botões e dois LEDs: o primeiro botão acende o LED vermelho e o segundo acende o verde.',
      conceito: 'Cada botão ocupa um pino e cada LED ocupa outro. O programa lê os dois botões, um depois do outro, e reage ao que estiver apertado. Ler dois sensores no mesmo laço é a base de controles de jogos.',
      resultado: 'O botão do primeiro pino acende o LED vermelho e o botão do segundo pino acende o LED verde, enquanto estiverem apertados.',
      desafio: 'Faça os dois LEDs acenderem juntos quando os dois botões forem apertados ao mesmo tempo.',
      aviso: AVISO + AVISO_LED,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' }), X.puxar_pino({ P: B1(), PULL: 'UP' }), X.puxar_pino({ P: B2(), PULL: 'UP' })]),
        X.sempre({}, [
          se(APERTADO(B1()), [X.escrever_digital({ P: LV(), V: 1 })], [X.escrever_digital({ P: LV(), V: 0 })]),
          se(APERTADO(B2()), [X.escrever_digital({ P: LG(), V: 1 })], [X.escrever_digital({ P: LG(), V: 0 })]),
        ]),
      ),
    },
    {
      nome: 'Desafio: jogo de reflexo',
      objetivo: 'Acenda o LED verde depois de uma espera surpresa e meça em quantos milissegundos você aperta o botão.',
      conceito: 'É o teste de reflexo, agora com componentes de verdade. O LED verde acende depois de uma espera sorteada; o programa anota a hora, espera o botão externo ser apertado e subtrai as horas. O laço “enquanto” faz a espera: ele repete até o botão ser apertado (pino em 0).',
      resultado: 'Aperte o botão A da placa para começar: o LED verde acende em um instante surpresa. Aperte o botão externo o mais rápido que puder e veja o seu tempo, em milissegundos, na tela.',
      desafio: 'Faça o LED vermelho piscar se você apertar o botão antes de o verde acender.',
      aviso: AVISO + AVISO_LED,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' }), X.puxar_pino({ P: B1(), PULL: 'UP' })]),
        X.ao_botao({ BTN: 'A' }, [
          X.escrever_digital({ P: LG(), V: 0 }),
          X.pausa({ MS: X.aleatorio({ DE: 2000, ATE: 5000 }) }),
          X.escrever_digital({ P: LG(), V: 1 }),
          definir('inicio', X.tempo({})),
          X.enquanto({ C: cmp(X.ler_digital({ P: B1() }), '==', 1) }, [X.pausa({ MS: 1 })]),
          definir('reacao', e(X.tempo({}), '-', v('inicio'))),
          X.escrever_digital({ P: LG(), V: 0 }),
          X.tela_ligada({ E: 'TRUE' }),
          X.mostrar_numero({ N: v('reacao') }),
          X.tela_ligada({ E: 'FALSE' }),
        ]),
      ),
    },
  ],
};
