/* Módulo 5 — Acelerômetro e gestos (5 fases). */
import { X, definir, mudar, v, programa } from './_dsl.mjs';

export default {
  modulo: 4,
  fases: [
    {
      nome: 'Quando agitar',
      objetivo: 'Mostre um rosto de surpresa quando alguém sacudir a placa.',
      conceito: 'Dentro da micro:bit há um acelerômetro, um sensor que sente movimento: balançar, inclinar e cair. A placa reconhece “gestos” prontos, como sacudir (shake). O gesto é um evento, igual ao botão: acontece e o programa reage.',
      resultado: 'Ao sacudir a placa, aparece um rosto de surpresa por 1 segundo e a tela apaga.',
      desafio: 'Troque o gesto “agitar” por “queda livre” e solte a placa em cima de um sofá (com cuidado!).',
      blocos: programa(X.ao_gesto({ G: 'Shake' }, [
        X.mostrar_icone({ ICONE: 'Surprised' }),
        X.pausa({ MS: 1000 }),
        X.limpar_tela({}),
      ])),
    },
    {
      nome: 'Gestos: virar e inclinar',
      objetivo: 'Reaja a quatro gestos: tela para cima, tela para baixo, inclinar à esquerda e inclinar à direita.',
      conceito: 'Além de sacudir, a placa sabe quando é colocada com a tela para cima ou para baixo, ou inclinada para os lados. Cada gesto é um evento com um nome. O que você faz é ligar cada gesto a uma resposta.',
      resultado: 'Tela para cima mostra um rosto feliz; tela para baixo, um rosto dormindo; inclinar mostra uma seta para o lado.',
      desafio: 'Faça o gesto “logotipo para cima” mostrar uma seta para o Norte.',
      blocos: programa(
        X.ao_gesto({ G: 'ScreenUp' }, [X.mostrar_icone({ ICONE: 'Happy' })]),
        X.ao_gesto({ G: 'ScreenDown' }, [X.mostrar_icone({ ICONE: 'Asleep' })]),
        X.ao_gesto({ G: 'TiltLeft' }, [X.mostrar_seta({ DIR: 'West' })]),
        X.ao_gesto({ G: 'TiltRight' }, [X.mostrar_seta({ DIR: 'East' })]),
      ),
    },
    {
      nome: 'Aceleração x e y no Traçador',
      objetivo: 'Envie a aceleração dos eixos x e y para o computador e veja duas linhas no Gráfico Serial.',
      conceito: 'O acelerômetro mede a aceleração em três eixos: X (esquerda e direita), Y (frente e trás) e Z (em cima e embaixo). O valor é dado em milésimos da gravidade: com a placa parada e deitada, x e y ficam perto de 0. No Gráfico Serial cada valor enviado ganha uma linha própria.',
      resultado: 'O Gráfico Serial mostra duas linhas, x e y, que sobem e descem quando você inclina a placa.',
      desafio: 'Envie também o eixo z e observe o que acontece quando você vira a placa de cabeça para baixo.',
      blocos: programa(X.sempre({}, [
        X.serial_valor({ NOME: 'x', V: X.aceleracao({ D: 'X' }) }),
        X.serial_valor({ NOME: 'y', V: X.aceleracao({ D: 'Y' }) }),
        X.pausa({ MS: 100 }),
      ])),
    },
    {
      nome: 'Nível de bolha',
      objetivo: 'Faça um ponto andar pela tela conforme você inclina a placa, como a bolha de um nível.',
      conceito: 'O bloco “mapear” converte um valor de uma escala para outra: aqui, de -1000 a 1000 (o acelerômetro) para 0 a 4 (as colunas da tela). O “restringir” garante que o resultado nunca saia da tela. Assim o ponto anda de uma ponta à outra sem sair dos limites.',
      resultado: 'Um ponto aceso na linha do meio anda para a esquerda e para a direita quando você inclina a placa.',
      desafio: 'Faça o ponto se mexer também para cima e para baixo usando o eixo Y.',
      blocos: programa(
        X.no_iniciar({}, [definir('coluna', 2)]),
        X.sempre({}, [
          definir('coluna', X.restringir({ V: X.mapear({ V: X.aceleracao({ D: 'X' }), A: -1000, B: 1000, C: 0, D: 4 }), MIN: 0, MAX: 4 })),
          X.limpar_tela({}),
          X.acender({ X: v('coluna'), Y: 2 }),
          X.pausa({ MS: 50 }),
        ]),
      ),
    },
    {
      nome: 'Desafio: contador de passos',
      objetivo: 'Conte passos: a cada balançada da micro:bit, some 1 e mostre o total.',
      conceito: 'Um contador de passos de verdade sente cada vez que o corpo balança para frente e para trás. Aqui usamos o gesto de agitar como um “passo”: cada vez que ele acontece, somamos 1 na variável passos e mostramos o total. O botão A zera a contagem.',
      resultado: 'A cada balançada, o número na tela sobe em 1. O botão A volta para zero.',
      desafio: 'Faça a micro:bit mostrar um rosto feliz quando você completar 10 passos.',
      blocos: programa(
        X.no_iniciar({}, [definir('passos', 0)]),
        X.ao_gesto({ G: 'Shake' }, [mudar('passos', 1), X.mostrar_numero({ N: v('passos') })]),
        X.ao_botao({ BTN: 'A' }, [definir('passos', 0), X.mostrar_numero({ N: v('passos') })]),
      ),
    },
  ],
};
