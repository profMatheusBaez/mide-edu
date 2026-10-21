/* Módulo 17 — Display de 7 segmentos (5 fases). Pinos: MB_PINOS.seteSeg (a b c d e f g dp). */
import { X, definir, mudar, v, se, cmp, programa, pino } from './_dsl.mjs';

const AVISO = 'Use o display de 7 segmentos de CÁTODO comum: o pino comum vai no GND e cada segmento (de a até g, mais o ponto) vai em um pino da micro:bit, com um resistor de 220 Ω em cada um. Os pinos usados dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro. Confira os pinos na tabela de ligações (Ajuda).';
const SEG = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

export default {
  modulo: 16,
  fases: [
    {
      nome: 'Segmento a segmento',
      objetivo: 'Acenda os segmentos do display um de cada vez, de a até g.',
      conceito: 'O display de 7 segmentos é feito de 7 LEDs em forma de traço (a até g), mais o pontinho. Cada segmento é ligado a um pino da micro:bit: escrever 1 no pino acende o traço. Acendendo alguns traços, formam-se os algarismos. Aqui testamos cada segmento sozinho, para conferir a ligação.',
      resultado: 'Os segmentos acendem um por um, de a até g, a cada meio segundo, e depois apagam.',
      desafio: 'Acenda os segmentos b e c juntos: qual algarismo aparece?',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        ...SEG.flatMap((s) => [X.escrever_digital({ P: pino('seteSeg.' + s), V: 1 }), X.pausa({ MS: 500 })]),
        X['7seg_apagar']({}),
      ])),
    },
    {
      nome: 'Número 0',
      objetivo: 'Mostre o número 0 no display de 7 segmentos.',
      conceito: 'Fazer cada algarismo à mão é trabalhoso: são 7 linhas para cada número! Por isso existe o bloco “mostrar dígito”: ele já sabe quais traços acender para cada número de 0 a 9. Basta informar o número. O “0” acende seis segmentos (todos, menos o g).',
      resultado: 'O display mostra o número 0.',
      desafio: 'Mostre o seu número da sorte, de 0 a 9.',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X['7seg_mostrar']({ N: 0 }),
      ])),
    },
    {
      nome: 'De 0 a 9',
      objetivo: 'Faça o display contar de 0 até 9, um número por segundo, e repetir.',
      conceito: 'O laço “para” conta de 0 até 9, e cada número contado vai para o display. A variável i guarda o algarismo da vez. A pausa de 1 segundo permite ler cada número antes de o próximo aparecer.',
      resultado: 'O display mostra 0, 1, 2… até 9, e volta ao 0 continuamente.',
      desafio: 'Faça o display contar de trás para frente, de 9 até 0 (dica: 9 − i).',
      aviso: AVISO,
      blocos: programa(
        X.sempre({}, [
          X.para({ VAR: 'i', ATE: 9 }, [X['7seg_mostrar']({ N: v('i') }), X.pausa({ MS: 1000 })]),
        ]),
      ),
    },
    {
      nome: 'Contador com botão',
      objetivo: 'Some 1 no display a cada aperto do botão A, voltando a 0 depois do 9.',
      conceito: 'Um contador guarda o número em uma variável. Cada aperto soma 1; se passar de 9, volta a 0, porque o display só mostra um algarismo. Depois de mudar a variável, mostramos o valor no display. O botão B zera o contador.',
      resultado: 'Cada aperto de A soma 1 no display; depois do 9 volta para 0. O botão B zera.',
      desafio: 'Faça o botão B diminuir 1, sem passar de 0 para baixo.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [definir('numero', 0), X['7seg_mostrar']({ N: 0 })]),
        X.ao_botao({ BTN: 'A' }, [
          mudar('numero', 1),
          se(cmp(v('numero'), '>', 9), [definir('numero', 0)]),
          X['7seg_mostrar']({ N: v('numero') }),
        ]),
        X.ao_botao({ BTN: 'B' }, [definir('numero', 0), X['7seg_mostrar']({ N: 0 })]),
      ),
    },
    {
      nome: 'Desafio: dado eletrônico',
      objetivo: 'Sacuda a micro:bit e mostre um número de 1 a 6 no display, como um dado.',
      conceito: 'Aqui juntamos três ideias: um gesto (sacudir), um sorteio (número aleatório) e uma saída (o display). Cada sacudida joga o dado. Um dado de verdade tem só 6 faces, por isso sorteamos entre 1 e 6.',
      resultado: 'A cada sacudida, o display mostra um número sorteado de 1 a 6.',
      desafio: 'Faça uma animação antes de mostrar o resultado: passe por 3 números aleatórios rapidamente.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X['7seg_apagar']({})]),
        X.ao_gesto({ G: 'Shake' }, [
          definir('dado', X.aleatorio({ DE: 1, ATE: 6 })),
          X['7seg_mostrar']({ N: v('dado') }),
        ]),
      ),
    },
  ],
};
