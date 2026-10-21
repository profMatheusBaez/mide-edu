/* Módulo 8 — Alto-falante e música (5 fases). */
import { X, programa } from './_dsl.mjs';

export default {
  modulo: 7,
  fases: [
    {
      nome: 'Tocar um tom',
      objetivo: 'Toque um tom de 440 Hz (a nota lá) por meio segundo.',
      conceito: 'A micro:bit V2 tem um alto-falante embutido, atrás da placa. Um tom é uma vibração com uma frequência, medida em hertz (Hz): quanto maior a frequência, mais agudo o som. O tom de 440 Hz é a nota lá, usada para afinar instrumentos. Além da frequência, informamos por quanto tempo tocar.',
      resultado: 'A micro:bit toca um bip de 440 Hz por meio segundo quando liga.',
      desafio: 'Toque um tom mais agudo (880 Hz) e um mais grave (220 Hz). Ouça a diferença.',
      blocos: programa(X.no_iniciar({}, [
        X.tocar_tom({ F: 440, B: 'Half' }),
      ])),
    },
    {
      nome: 'Notas e batidas',
      objetivo: 'Toque dó, ré e mi com durações diferentes.',
      conceito: 'Uma nota musical tem um nome (dó, ré, mi…) e uma duração: a batida, que pode ser inteira, meia, um quarto… Batidas mais curtas fazem a nota passar mais depressa. Aqui tocamos as três primeiras notas da escala, cada uma com uma duração.',
      resultado: 'Toca um dó longo (meia batida), um ré médio (um quarto) e um mi curto (um oitavo).',
      desafio: 'Toque a escala inteira: dó, ré, mi, fá, sol, lá, si e dó agudo.',
      blocos: programa(X.no_iniciar({}, [
        X.tocar_nota({ NOTA: 'C', B: 'Half' }),
        X.tocar_nota({ NOTA: 'D', B: 'Quarter' }),
        X.tocar_nota({ NOTA: 'E', B: 'Eighth' }),
      ])),
    },
    {
      nome: 'Melodias prontas',
      objetivo: 'Toque uma melodia que já vem pronta na micro:bit.',
      conceito: 'A micro:bit já traz melodias famosas gravadas: Parabéns, Ode à Alegria, Nyan Cat, a marcha fúnebre… Basta escolher pelo nome. A melodia toca até o fim antes do programa continuar.',
      resultado: 'A melodia “Parabéns” toca uma vez quando a placa liga, e a tela mostra um coração.',
      desafio: 'Troque a melodia por outra e faça-a tocar quando apertar o botão A.',
      blocos: programa(X.no_iniciar({}, [
        X.tocar_melodia({ M: 'Birthday' }),
        X.mostrar_icone({ ICONE: 'Heart' }),
      ])),
    },
    {
      nome: 'Sons expressivos',
      objetivo: 'Dê voz à micro:bit: uma risada no botão A e um “olá” no botão B.',
      conceito: 'A V2 também tem sons expressivos: risada, bocejo, “hello”, “mysterious”… Eles são pequenos efeitos sonoros já prontos. Servem para dar personalidade ao seu projeto, como em um robô ou em um jogo.',
      resultado: 'O botão A toca uma risada e o botão B toca um som de “hello”.',
      desafio: 'Junte som e imagem: mostre um rosto feliz enquanto a risada toca.',
      blocos: programa(
        X.ao_botao({ BTN: 'A' }, [X.tocar_som({ S: 'giggle' })]),
        X.ao_botao({ BTN: 'B' }, [X.tocar_som({ S: 'hello' })]),
      ),
    },
    {
      nome: 'Desafio: teclado musical',
      objetivo: 'Monte um teclado com três teclas: A toca dó, B toca mi e o logotipo toca sol.',
      conceito: 'Um instrumento é um conjunto de eventos: cada tecla dispara uma nota. Com o botão A, o botão B e o logotipo sensível ao toque você tem três teclas. Em um instrumento de verdade teria mais teclas, mas o princípio é o mesmo.',
      resultado: 'A toca dó, B toca mi e o toque no logotipo toca sol.',
      desafio: 'Use os gestos para criar mais teclas: inclinar para a esquerda toca lá e para a direita toca si.',
      blocos: programa(
        X.ao_botao({ BTN: 'A' }, [X.tocar_nota({ NOTA: 'C', B: 'Quarter' })]),
        X.ao_botao({ BTN: 'B' }, [X.tocar_nota({ NOTA: 'E', B: 'Quarter' })]),
        X.ao_logo({}, [X.tocar_nota({ NOTA: 'G', B: 'Quarter' })]),
      ),
    },
  ],
};
