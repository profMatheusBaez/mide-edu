/* Módulo 3 — Sensor de luz (5 fases). */
import { X, se, cmp, programa, desenho } from './_dsl.mjs';

export default {
  modulo: 2,
  fases: [
    {
      nome: 'Ler o nível de luz',
      objetivo: 'Mostre na tela quanta luz existe no ambiente.',
      conceito: 'A micro:bit não tem um sensor de luz separado: ela usa os próprios LEDs da tela como sensor! O valor vai de 0 (escuro total) a 255 (muita luz). Cubra a tela com a mão e veja o número cair.',
      resultado: 'A tela mostra um número entre 0 e 255. Cobrindo a tela com a mão, o número diminui.',
      desafio: 'Aponte a tela para a janela e depois para uma parede escura. Qual foi o maior e o menor valor?',
      aviso: 'A primeira leitura de luz pode sair 0 ou 255 por um instante: a placa precisa de um tempinho para trocar a tela de “mostrar” para “medir”. Ignore o primeiro valor. E como a luz é medida pelos LEDs, ler logo depois de mostrar um desenho na tela também dá um valor estranho.',
      blocos: programa(X.sempre({}, [
        X.mostrar_numero({ N: X.luz({}) }),
        X.pausa({ MS: 500 }),
      ])),
    },
    {
      nome: 'Luz em gráfico de barras',
      objetivo: 'Desenhe a quantidade de luz como um gráfico de barras na tela.',
      conceito: 'Ler um número e ler uma barra são coisas diferentes: o olho entende uma barra mais rápido. O gráfico de barras acende mais LEDs quanto maior for o valor em relação ao máximo. Aqui o máximo é 255, o topo da escala de luz.',
      resultado: 'Uma barra de LEDs cresce com a luz e diminui na sombra.',
      desafio: 'Troque o máximo de 255 para 100. O que muda? Por quê?',
      blocos: programa(X.sempre({}, [
        X.grafico_barras({ V: X.luz({}), MAX: 255 }),
        X.pausa({ MS: 100 }),
      ])),
    },
    {
      nome: 'Noite e dia',
      objetivo: 'Mostre um rosto dormindo quando estiver escuro e um rosto feliz quando houver luz.',
      conceito: 'Uma decisão usa “se … senão”: se a condição for verdadeira, faz uma coisa; senão, faz outra. Aqui a condição é “a luz é menor que 50”. Um número de limite, como o 50, separa a noite do dia.',
      resultado: 'No escuro aparece um rosto dormindo; com luz, um rosto feliz.',
      desafio: 'Ajuste o número 50 para funcionar bem na sua sala.',
      blocos: programa(X.sempre({}, [
        se(cmp(X.luz({}), '<', 50),
          [X.mostrar_icone({ ICONE: 'Asleep' })],
          [X.mostrar_icone({ ICONE: 'Happy' })]),
        X.pausa({ MS: 300 }),
      ])),
    },
    {
      nome: 'Luz no Monitor Serial',
      objetivo: 'Envie a luz para o computador e veja os números no Monitor Serial.',
      conceito: 'A porta USB também transporta mensagens da micro:bit para o computador. Isso se chama comunicação serial. O programa escreve “luz: 120” e o Monitor Serial da IDE mostra o texto; o Gráfico Serial desenha a linha. É a melhor forma de enxergar o que um sensor mede sem depender da tela pequena.',
      resultado: 'O Monitor Serial mostra uma linha “luz:” com o valor a cada 200 ms.',
      desafio: 'Passe a mão na frente da tela e veja o gráfico do valor mudar.',
      blocos: programa(X.sempre({}, [
        X.serial_valor({ NOME: 'luz', V: X.luz({}) }),
        X.pausa({ MS: 200 }),
      ])),
    },
    {
      nome: 'Desafio: luminária automática',
      objetivo: 'Faça a tela virar uma luminária: acende toda no escuro e apaga quando houver luz.',
      conceito: 'A luminária automática decide sozinha: no escuro, acende os 25 LEDs; com luz, apaga tudo. Repare que ela usa os mesmos LEDs que servem de sensor, por isso a leitura da luz precisa esperar o desenho ser trocado. Pequenas pausas ajudam a medir com calma.',
      resultado: 'No escuro, a tela acende inteira. Com luz, a tela apaga.',
      desafio: 'Acrescente um nível intermediário: com pouca luz, acenda só o meio da tela.',
      aviso: 'A luminária acende os mesmos LEDs que a placa usa para medir a luz. Por isso ela pode piscar de tempos em tempos: é normal.',
      blocos: programa(X.sempre({}, [
        se(cmp(X.luz({}), '<', 50),
          [X.mostrar_leds({ LEDS: desenho('#####', '#####', '#####', '#####', '#####') })],
          [X.limpar_tela({})]),
        X.pausa({ MS: 300 }),
      ])),
    },
  ],
};
