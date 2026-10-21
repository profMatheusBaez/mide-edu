/* Módulo 10 — Jogos (5 fases). Só blocos que existem em JavaScript E em MicroPython (sem os blocos de "sprite"). */
import { X, definir, mudar, v, se, seSenaoSe, cmp, e, resto, nao, programa } from './_dsl.mjs';

const ESCOLHA = (nome) => seSenaoSe([
  [cmp(v(nome), '==', 1), [X.mostrar_icone({ ICONE: 'Diamond' })]],
  [cmp(v(nome), '==', 2), [X.mostrar_icone({ ICONE: 'Square' })]],
], [X.mostrar_icone({ ICONE: 'Scissors' })]);

export default {
  modulo: 9,
  fases: [
    {
      nome: 'Pedra, papel, tesoura',
      objetivo: 'Sacuda a micro:bit para sortear pedra, papel ou tesoura.',
      conceito: 'Um jogo precisa de sorte e de regras. A sorte vem do bloco “número aleatório”: ele sorteia 1, 2 ou 3. As regras são as decisões: se saiu 1, mostramos um losango (pedra); se saiu 2, um quadrado (papel); senão, a tesoura. Sacudir a placa é jogar.',
      resultado: 'A cada sacudida aparece um losango (pedra), um quadrado (papel) ou uma tesoura.',
      desafio: 'Jogue contra um colega: cada um sacode a sua placa ao mesmo tempo. Quem ganhou?',
      blocos: programa(
        X.no_iniciar({}, [definir('escolha', 0)]),
        X.ao_gesto({ G: 'Shake' }, [
          definir('escolha', X.aleatorio({ DE: 1, ATE: 3 })),
          ESCOLHA('escolha'),
        ]),
      ),
    },
    {
      nome: 'Tempo de reação',
      objetivo: 'Meça quanto tempo você demora para apertar o botão B depois que a tela acende.',
      conceito: 'O relógio da micro:bit conta os milissegundos desde que ela ligou. Para medir o tempo de reação: anotamos a hora em que a tela acendeu, esperamos o aperto do botão B e subtraímos. A espera é feita pelo laço “enquanto”: ele repete até o botão ser apertado.',
      resultado: 'Aperte A: após uma espera surpresa, a tela acende. Aperte B o mais rápido que puder e veja seu tempo em milissegundos.',
      desafio: 'Faça o jogo avisar “cedo demais” se o B for apertado antes da tela acender.',
      blocos: programa(X.ao_botao({ BTN: 'A' }, [
        X.limpar_tela({}),
        X.pausa({ MS: X.aleatorio({ DE: 2000, ATE: 5000 }) }),
        X.mostrar_icone({ ICONE: 'Square' }),
        definir('inicio', X.tempo({})),
        X.enquanto({ C: nao(X.botao_pressionado({ BTN: 'B' })) }, [X.pausa({ MS: 1 })]),
        definir('reacao', e(X.tempo({}), '-', v('inicio'))),
        X.mostrar_numero({ N: v('reacao') }),
      ])),
    },
    {
      nome: 'Nave espacial',
      objetivo: 'Desvie de um asteroide que cai: A e B movem a nave e, se ele acertar, o jogo termina.',
      conceito: 'A nave é um ponto aceso na linha de baixo; a variável x guarda a coluna dela (0 a 4). O botão A anda para a esquerda e o B para a direita, sem sair da tela. O asteroide cai uma linha por vez (fy) em uma coluna sorteada (fx). Se ele chega embaixo na mesma coluna da nave, é a colisão: aparece uma caveira, o jogo mostra os pontos e recomeça. Se não, você ganha 1 ponto.',
      resultado: 'Um asteroide cai. Desviando, você soma pontos; se ele acertar a nave, aparece uma caveira, mostra os pontos e o jogo recomeça.',
      desafio: 'Faça o asteroide cair mais rápido a cada ponto.',
      blocos: programa(
        X.no_iniciar({}, [definir('x', 2), definir('fx', X.aleatorio({ DE: 0, ATE: 4 })), definir('fy', 0), definir('pontos', 0)]),
        X.ao_botao({ BTN: 'A' }, [se(cmp(v('x'), '>', 0), [mudar('x', -1)])]),
        X.ao_botao({ BTN: 'B' }, [se(cmp(v('x'), '<', 4), [mudar('x', 1)])]),
        X.sempre({}, [
          X.limpar_tela({}),
          X.acender({ X: v('x'), Y: 4 }),
          X.acender({ X: v('fx'), Y: v('fy') }),
          X.pausa({ MS: 300 }),
          mudar('fy', 1),
          se(cmp(v('fy'), '>', 4), [
            se(cmp(v('fx'), '==', v('x')),
              [
                X.mostrar_icone({ ICONE: 'Skull' }),
                X.pausa({ MS: 1500 }),
                X.mostrar_numero({ N: v('pontos') }),
                definir('pontos', 0),
              ],
              [mudar('pontos', 1)]),
            definir('fy', 0),
            definir('fx', X.aleatorio({ DE: 0, ATE: 4 })),
          ]),
        ]),
      ),
    },
    {
      nome: 'Pegue a fruta',
      objetivo: 'Pegue as frutas que caem do alto da tela inclinando a placa para mover o cesto, e conte os pontos.',
      conceito: 'Aqui o controle é o acelerômetro: inclinar a placa para os lados move o cesto (a coluna x) pela linha de baixo. Uma fruta cai uma linha por vez, em uma coluna sorteada. Se ela chega embaixo na mesma coluna do cesto, você ganha um ponto; senão, ela some e outra nasce. O botão A mostra os pontos.',
      resultado: 'Uma fruta cai. Inclinando a placa você move o cesto; se pegar a fruta, o placar sobe 1. O botão A mostra os pontos.',
      desafio: 'Faça a fruta cair mais rápido a cada ponto conseguido.',
      blocos: programa(
        X.no_iniciar({}, [definir('x', 2), definir('fx', X.aleatorio({ DE: 0, ATE: 4 })), definir('fy', 0), definir('pontos', 0)]),
        X.ao_botao({ BTN: 'A' }, [X.mostrar_numero({ N: v('pontos') })]),
        X.sempre({}, [
          definir('x', X.restringir({ V: X.mapear({ V: X.aceleracao({ D: 'X' }), A: -1000, B: 1000, C: 0, D: 4 }), MIN: 0, MAX: 4 })),
          X.limpar_tela({}),
          X.acender({ X: v('x'), Y: 4 }),
          X.acender({ X: v('fx'), Y: v('fy') }),
          X.pausa({ MS: 250 }),
          mudar('fy', 1),
          se(cmp(v('fy'), '>', 4), [
            se(cmp(v('fx'), '==', v('x')), [mudar('pontos', 1)]),
            definir('fy', 0),
            definir('fx', X.aleatorio({ DE: 0, ATE: 4 })),
          ]),
        ]),
      ),
    },
    {
      nome: 'Desafio: pedra, papel, tesoura por rádio',
      objetivo: 'Jogue pedra, papel e tesoura contra outra micro:bit, com placar de vitórias.',
      conceito: 'Cada jogador sacode a placa: ela sorteia 1, 2 ou 3 e envia o número ao adversário pelo rádio. Quando chega o número dele, comparamos: a conta (minha − dele + 3) dividida por 3 deixa resto 0 para empate, 1 para vitória e 2 para derrota. É uma regra do jogo escrita em matemática! Cada vitória soma 1 no placar; o botão A mostra o placar.',
      resultado: 'Sacudindo as duas placas, cada uma mostra rosto feliz se ganhou, rosto triste se perdeu, ou um sinal de igual (=) se empatou. O botão A mostra suas vitórias.',
      desafio: 'Mostre primeiro o que você jogou e o que o adversário jogou, e só depois o resultado.',
      aviso: 'Precisa de DUAS micro:bits V2 com este mesmo programa, e as duas devem ser sacudidas quase juntas. Números: 1 = pedra, 2 = papel, 3 = tesoura.',
      blocos: programa(
        X.no_iniciar({}, [X.radio_grupo({ G: 7 }), definir('minha', 0), definir('dele', 0), definir('vitorias', 0)]),
        X.ao_gesto({ G: 'Shake' }, [
          definir('minha', X.aleatorio({ DE: 1, ATE: 3 })),
          X.radio_enviar_numero({ N: v('minha') }),
          ESCOLHA('minha'),
        ]),
        X.radio_ao_numero({}, [
          definir('dele', X.radio_numero_recebido({})),
          X.pausa({ MS: 1500 }),
          definir('resultado', resto(e(e(v('minha'), '-', v('dele')), '+', 3), 3)),
          seSenaoSe([
            [cmp(v('resultado'), '==', 0), [X.mostrar_texto({ T: '=' })]],
            [cmp(v('resultado'), '==', 1), [mudar('vitorias', 1), X.mostrar_icone({ ICONE: 'Happy' })]],
          ], [X.mostrar_icone({ ICONE: 'Sad' })]),
        ]),
        X.ao_botao({ BTN: 'A' }, [X.mostrar_numero({ N: v('vitorias') })]),
      ),
    },
  ],
};
