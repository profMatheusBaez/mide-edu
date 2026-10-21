/* Módulo 2 — Botões A, B e logotipo (5 fases). */
import { X, definir, mudar, v, junta, programa } from './_dsl.mjs';

export default {
  modulo: 1,
  fases: [
    {
      nome: 'Quando A for pressionado',
      objetivo: 'Faça um rosto feliz aparecer quando você apertar o botão A.',
      conceito: 'A micro:bit tem dois botões na frente, o A (esquerda) e o B (direita). Um evento é um aviso: “quando o botão A for pressionado, faça isto”. O programa fica esperando e, no instante do aperto, executa só o que está dentro do evento.',
      resultado: 'Ao apertar o botão A, um rosto feliz aparece na tela por 1 segundo e depois a tela apaga.',
      desafio: 'Troque o rosto feliz por outro ícone e aumente o tempo que ele fica na tela.',
      blocos: programa(X.ao_botao({ BTN: 'A' }, [
        X.mostrar_icone({ ICONE: 'Happy' }),
        X.pausa({ MS: 1000 }),
        X.limpar_tela({}),
      ])),
    },
    {
      nome: 'A, B e A+B',
      objetivo: 'Use os três eventos de botão: o A mostra 1, o B mostra 2 e A+B juntos mostram um coração.',
      conceito: 'Cada botão tem o seu próprio evento, e existe um terceiro: A+B, que só acontece quando os dois botões são apertados juntos. Repare que ele é diferente do A sozinho e do B sozinho. Dá para criar atalhos secretos combinando botões.',
      resultado: 'A mostra o número 1, B mostra o número 2 e A+B juntos mostram um coração.',
      desafio: 'Faça o A+B apagar tudo e mostrar a palavra Fim.',
      blocos: programa(
        X.ao_botao({ BTN: 'A' }, [X.mostrar_numero({ N: 1 })]),
        X.ao_botao({ BTN: 'B' }, [X.mostrar_numero({ N: 2 })]),
        X.ao_botao({ BTN: 'AB' }, [X.mostrar_icone({ ICONE: 'Heart' })]),
      ),
    },
    {
      nome: 'Contador com variável',
      objetivo: 'Crie um contador: A soma 1, B tira 1 e A+B volta para zero.',
      conceito: 'Uma variável é uma caixinha com nome onde o programa guarda um número. Aqui a variável contagem começa em 0. Cada clique muda o valor da caixinha, e depois mostramos o valor na tela. A variável lembra o número mesmo depois que o evento termina.',
      resultado: 'A soma 1 na contagem, B tira 1 e A+B zera. A tela sempre mostra o valor atual.',
      desafio: 'Impeça a contagem de ficar negativa: se ela for menor que 0, volte para 0.',
      blocos: programa(
        X.no_iniciar({}, [definir('contagem', 0)]),
        X.ao_botao({ BTN: 'A' }, [mudar('contagem', 1), X.mostrar_numero({ N: v('contagem') })]),
        X.ao_botao({ BTN: 'B' }, [mudar('contagem', -1), X.mostrar_numero({ N: v('contagem') })]),
        X.ao_botao({ BTN: 'AB' }, [definir('contagem', 0), X.mostrar_numero({ N: v('contagem') })]),
      ),
    },
    {
      nome: 'Logotipo de toque',
      objetivo: 'Use o logotipo dourado, em cima da tela, como um terceiro botão.',
      conceito: 'A micro:bit V2 tem um botão a mais: o logotipo dourado, que é sensível ao toque, como a tela de um celular. É só encostar o dedo nele. Esse recurso não existe na V1, e é por isso que este curso é só para a V2.',
      resultado: 'Ao tocar o logotipo, aparece um rosto surpreso. Depois de 1 segundo, a tela apaga.',
      desafio: 'Combine: o logotipo mostra o rosto surpreso e o botão A mostra o rosto feliz.',
      blocos: programa(X.ao_logo({}, [
        X.mostrar_icone({ ICONE: 'Surprised' }),
        X.pausa({ MS: 1000 }),
        X.limpar_tela({}),
      ])),
    },
    {
      nome: 'Desafio: placar de 2 times',
      objetivo: 'Faça um placar: o botão A marca ponto para o time A, o B para o time B, A+B mostra o placar e o logotipo zera.',
      conceito: 'Duas variáveis, uma por time, guardam os pontos. Cada botão soma na variável do seu time. Para mostrar o placar juntamos texto e números em uma frase só, como em “3 x 2”. O toque no logotipo começa um jogo novo, zerando as duas variáveis.',
      resultado: 'A e B somam pontos para cada time. A+B mostra o placar (por exemplo 3 x 2). O logotipo zera tudo.',
      desafio: 'Faça o placar mostrar Fim e um coração quando um dos times chegar a 10 pontos.',
      blocos: programa(
        X.no_iniciar({}, [definir('timeA', 0), definir('timeB', 0)]),
        X.ao_botao({ BTN: 'A' }, [mudar('timeA', 1), X.mostrar_numero({ N: v('timeA') })]),
        X.ao_botao({ BTN: 'B' }, [mudar('timeB', 1), X.mostrar_numero({ N: v('timeB') })]),
        X.ao_botao({ BTN: 'AB' }, [X.mostrar_texto({ T: junta(v('timeA'), ' x ', v('timeB')) })]),
        X.ao_logo({}, [definir('timeA', 0), definir('timeB', 0), X.mostrar_icone({ ICONE: 'Yes' })]),
      ),
    },
  ],
};
