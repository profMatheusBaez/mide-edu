/* Módulo 11 — LED externo (5 fases). Pinos: MB_PINOS.led (vermelho, amarelo, verde). */
import { X, v, e, programa, pino } from './_dsl.mjs';

const AVISO = 'Ligue cada LED com um resistor de 220 Ω em série: pino da micro:bit → resistor → perna comprida (+) do LED → perna curta (−) no GND. Estes pinos dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro.';
const V = () => pino('led.vermelho'), A = () => pino('led.amarelo'), G = () => pino('led.verde');

export default {
  modulo: 10,
  fases: [
    {
      nome: 'Acender um LED',
      objetivo: 'Acenda o LED vermelho ligado à micro:bit.',
      conceito: 'Um pino digital é como um interruptor: 1 liga (3,3 V) e 0 desliga (0 V). Ligando um LED em um pino, com um resistor para proteger, escrever 1 no pino acende o LED. Alguns pinos também são usados pela tela de LEDs da placa, por isso desligamos a tela antes de usá-los.',
      resultado: 'O LED vermelho externo acende e fica aceso.',
      desafio: 'Acenda o LED amarelo em vez do vermelho. Depois acenda os três.',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X.tela_ligada({ E: 'FALSE' }),
        X.escrever_digital({ P: V(), V: 1 }),
      ])),
    },
    {
      nome: 'Piscar',
      objetivo: 'Faça o LED vermelho piscar: 1 segundo aceso e 1 segundo apagado.',
      conceito: 'Piscar é ligar, esperar, desligar e esperar de novo, para sempre. O laço “sempre” faz essa repetição. A pausa entre os dois estados dá o ritmo: pausas curtas piscam rápido, pausas longas piscam devagar.',
      resultado: 'O LED vermelho acende por 1 segundo e apaga por 1 segundo, repetindo sem parar.',
      desafio: 'Faça o LED piscar 5 vezes por segundo (pausas de 100 ms).',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' })]),
        X.sempre({}, [
          X.escrever_digital({ P: V(), V: 1 }),
          X.pausa({ MS: 1000 }),
          X.escrever_digital({ P: V(), V: 0 }),
          X.pausa({ MS: 1000 }),
        ]),
      ),
    },
    {
      nome: 'Semáforo com 3 LEDs',
      objetivo: 'Monte um semáforo com os LEDs vermelho, amarelo e verde.',
      conceito: 'Um semáforo é uma sequência de estados: verde por um tempo, amarelo por um tempo curto e vermelho por outro tempo. Em cada estado, acendemos um LED e apagamos os outros. Repare que o programa é só uma lista de passos, executada na ordem.',
      resultado: 'Verde (3 s), amarelo (1 s), vermelho (3 s), e o ciclo se repete.',
      desafio: 'Faça o amarelo piscar 3 vezes antes de o vermelho acender.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' })]),
        X.sempre({}, [
          X.escrever_digital({ P: V(), V: 0 }), X.escrever_digital({ P: A(), V: 0 }), X.escrever_digital({ P: G(), V: 1 }),
          X.pausa({ MS: 3000 }),
          X.escrever_digital({ P: G(), V: 0 }), X.escrever_digital({ P: A(), V: 1 }),
          X.pausa({ MS: 1000 }),
          X.escrever_digital({ P: A(), V: 0 }), X.escrever_digital({ P: V(), V: 1 }),
          X.pausa({ MS: 3000 }),
        ]),
      ),
    },
    {
      nome: 'Brilho com PWM',
      objetivo: 'Controle o brilho do LED amarelo em três níveis: fraco, médio e forte.',
      conceito: 'Um pino pode “fingir” valores entre ligado e desligado ligando e desligando muito rápido: isso se chama PWM. No pino analógico o valor vai de 0 (apagado) a 1023 (brilho máximo). Com 100, 500 e 1023 o LED aparece em três níveis de brilho.',
      resultado: 'O LED amarelo fica fraco por 1 segundo, depois médio, depois forte, e o ciclo se repete.',
      desafio: 'Acrescente um quarto nível e teste valores diferentes: o brilho sobe de forma uniforme?',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' })]),
        X.sempre({}, [
          X.escrever_analogico({ P: A(), V: 100 }), X.pausa({ MS: 1000 }),
          X.escrever_analogico({ P: A(), V: 500 }), X.pausa({ MS: 1000 }),
          X.escrever_analogico({ P: A(), V: 1023 }), X.pausa({ MS: 1000 }),
        ]),
      ),
    },
    {
      nome: 'Desafio: LED que respira',
      objetivo: 'Faça o brilho do LED vermelho subir e descer suavemente, como uma respiração.',
      conceito: 'Um efeito é uma sequência que se repete. Contando de 0 a 20 e multiplicando por 50, o brilho sobe em degraus finos; depois desce pelo caminho inverso (1000 − i × 50). Com uma pausa curta entre os passos, o olho vê uma subida suave.',
      resultado: 'O LED vai de apagado a bem brilhante e volta, suavemente, sem parar.',
      desafio: 'Deixe a respiração mais lenta aumentando a pausa de 20 para 60 ms. Depois faça os três LEDs respirarem em sequência.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' })]),
        X.sempre({}, [
          X.para({ VAR: 'i', ATE: 20 }, [
            X.escrever_analogico({ P: V(), V: e(v('i'), '*', 50) }),
            X.pausa({ MS: 20 }),
          ]),
          X.para({ VAR: 'i', ATE: 20 }, [
            X.escrever_analogico({ P: V(), V: e(1000, '-', e(v('i'), '*', 50)) }),
            X.pausa({ MS: 20 }),
          ]),
        ]),
      ),
    },
  ],
};
