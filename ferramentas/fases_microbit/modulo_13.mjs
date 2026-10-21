/* Módulo 13 — Potenciômetro (5 fases). Pino: MB_PINOS.pot. */
import { X, definir, v, se, seSenaoSe, cmp, programa, pino } from './_dsl.mjs';

const AVISO = 'Ligue o potenciômetro assim: um pino da ponta no 3V, o outro pino da ponta no GND e o pino do meio (cursor) no pino de leitura. Girar o botão faz o pino do meio variar de 0 V a 3,3 V.';
const AVISO_LED = ' Os LEDs (com resistor de 220 Ω) ficam em pinos que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.';
const P = () => pino('pot');
const LV = () => pino('led.vermelho'), LA = () => pino('led.amarelo'), LG = () => pino('led.verde');

export default {
  modulo: 12,
  fases: [
    {
      nome: 'Ler e mostrar',
      objetivo: 'Mostre na tela o número lido no potenciômetro.',
      conceito: 'O potenciômetro é um resistor que você gira. O pino do meio devolve uma tensão que varia com o giro. A micro:bit mede essa tensão com um conversor analógico e devolve um número de 0 (tudo para um lado) a 1023 (tudo para o outro).',
      resultado: 'Girando o botão, o número na tela vai de 0 até perto de 1023.',
      desafio: 'Gire até o meio: o valor é mais ou menos 512?',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.mostrar_numero({ N: X.ler_analogico({ P: P() }) }),
        X.pausa({ MS: 300 }),
      ])),
    },
    {
      nome: 'Potenciômetro no Traçador',
      objetivo: 'Envie o valor do potenciômetro para o Monitor e o Gráfico Serial.',
      conceito: 'Números que mudam rápido são mais fáceis de acompanhar no computador. No Gráfico Serial da IDE você verá uma linha que sobe e desce acompanhando o giro do botão: dá para ver o comportamento do sensor de um jeito que a tela pequena não mostra.',
      resultado: 'O Monitor Serial mostra “pot:” com o valor a cada 100 ms; o gráfico acompanha o giro.',
      desafio: 'Envie também o nível de luz para comparar os dois sensores no gráfico.',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.serial_valor({ NOME: 'pot', V: X.ler_analogico({ P: P() }) }),
        X.pausa({ MS: 100 }),
      ])),
    },
    {
      nome: 'Potenciômetro controla o brilho',
      objetivo: 'Controle o brilho do LED amarelo girando o potenciômetro.',
      conceito: 'Aqui a entrada analógica alimenta uma saída analógica: o valor lido (0 a 1023) é escrito direto no pino do LED (que também aceita de 0 a 1023). É um dimmer, igual ao das lâmpadas reguláveis.',
      resultado: 'O LED fica mais brilhante quando o potenciômetro é girado para um lado e mais fraco para o outro.',
      desafio: 'Inverta o controle: o LED deve brilhar mais quando o botão for girado para o lado oposto.',
      aviso: AVISO + AVISO_LED,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' })]),
        X.sempre({}, [
          X.escrever_analogico({ P: LA(), V: X.ler_analogico({ P: P() }) }),
          X.pausa({ MS: 20 }),
        ]),
      ),
    },
    {
      nome: 'Potenciômetro no gráfico de barras',
      objetivo: 'Mostre a posição do potenciômetro como uma barra de LEDs na tela.',
      conceito: 'Com o gráfico de barras, a tela vira um medidor de volume: quanto mais você gira, mais LEDs acendem. O máximo 1023 é o maior valor que o potenciômetro entrega.',
      resultado: 'A barra de LEDs cresce e diminui acompanhando o giro do botão.',
      desafio: 'Coloque o máximo em 512 e veja a barra encher na metade do giro.',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.grafico_barras({ V: X.ler_analogico({ P: P() }), MAX: 1023 }),
        X.pausa({ MS: 50 }),
      ])),
    },
    {
      nome: 'Desafio: seletor de LEDs',
      objetivo: 'Use o potenciômetro como seletor: cada terço do giro acende um LED diferente (vermelho, amarelo ou verde).',
      conceito: 'O potenciômetro entrega de 0 a 1023, mas temos só três LEDs. O bloco “mapear” converte 0–1023 em 0, 1 ou 2: cada terço do giro vira uma opção. Depois um “se … senão se … senão” apaga todos os LEDs e acende só o escolhido.',
      resultado: 'No começo do giro o LED vermelho fica aceso; no meio, o amarelo; no fim, o verde.',
      desafio: 'Acrescente um quarto estado: no fim do giro os três LEDs piscam.',
      aviso: AVISO + AVISO_LED,
      blocos: programa(
        X.no_iniciar({}, [X.tela_ligada({ E: 'FALSE' }), definir('escolha', 0)]),
        X.sempre({}, [
          definir('escolha', X.restringir({ V: X.mapear({ V: X.ler_analogico({ P: P() }), A: 0, B: 1023, C: 0, D: 2 }), MIN: 0, MAX: 2 })),
          X.escrever_digital({ P: LV(), V: 0 }), X.escrever_digital({ P: LA(), V: 0 }), X.escrever_digital({ P: LG(), V: 0 }),
          seSenaoSe([
            [cmp(v('escolha'), '==', 0), [X.escrever_digital({ P: LV(), V: 1 })]],
            [cmp(v('escolha'), '==', 1), [X.escrever_digital({ P: LA(), V: 1 })]],
          ], [X.escrever_digital({ P: LG(), V: 1 })]),
          X.pausa({ MS: 50 }),
        ]),
      ),
    },
  ],
};
