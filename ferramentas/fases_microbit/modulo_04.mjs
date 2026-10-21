/* Módulo 4 — Temperatura (5 fases). */
import { X, definir, v, se, seSenaoSe, cmp, programa } from './_dsl.mjs';

export default {
  modulo: 3,
  fases: [
    {
      nome: 'Ler a temperatura',
      objetivo: 'Mostre a temperatura, em graus Celsius, na tela.',
      conceito: 'O sensor de temperatura fica dentro do chip principal da micro:bit. Ele mede o calor do próprio chip, que é parecido com o do ar ao redor, mas um pouco mais alto quando a placa está ligada há um tempo. O valor vem em graus Celsius (°C).',
      resultado: 'A tela passa um número perto de 20 a 30 (a temperatura do ambiente).',
      desafio: 'Segure a placa entre as mãos por 1 minuto. O número subiu?',
      blocos: programa(X.sempre({}, [
        X.mostrar_numero({ N: X.temperatura({}) }),
        X.pausa({ MS: 1000 }),
      ])),
    },
    {
      nome: 'Temperatura no Monitor Serial',
      objetivo: 'Envie a temperatura para o Monitor Serial do computador.',
      conceito: 'Números que mudam devagar, como a temperatura, ficam melhores no computador. Com a serial você enxerga uma linha por leitura e pode comparar os valores com calma. O nome “temp” que damos ao valor identifica o que está sendo medido.',
      resultado: 'O Monitor Serial mostra “temp:” e o valor, uma vez por segundo.',
      desafio: 'Assopre de leve no chip por 10 segundos e veja o valor mudar.',
      blocos: programa(X.sempre({}, [
        X.serial_valor({ NOME: 'temp', V: X.temperatura({}) }),
        X.pausa({ MS: 1000 }),
      ])),
    },
    {
      nome: 'Frio, ok ou quente',
      objetivo: 'Mostre um ícone para cada faixa de temperatura: frio, ok e quente.',
      conceito: 'Quando há mais de duas respostas possíveis, usamos “se … senão se … senão”. O programa testa as condições em ordem e faz só a primeira que for verdadeira. Por isso a ordem importa: primeiro o mais frio, depois o intermediário; o “senão” final cobre o quente.',
      resultado: 'Abaixo de 20 °C aparece um rosto triste (frio); de 20 a 27 °C um rosto feliz (ok); acima disso um rosto bravo (quente).',
      desafio: 'Ajuste os limites 20 e 28 para o clima da sua cidade.',
      blocos: programa(X.sempre({}, [
        seSenaoSe([
          [cmp(X.temperatura({}), '<', 20), [X.mostrar_icone({ ICONE: 'Sad' })]],
          [cmp(X.temperatura({}), '<', 28), [X.mostrar_icone({ ICONE: 'Happy' })]],
        ], [X.mostrar_icone({ ICONE: 'Angry' })]),
        X.pausa({ MS: 1000 }),
      ])),
    },
    {
      nome: 'Máxima e mínima registradas',
      objetivo: 'Guarde a maior e a menor temperatura medidas: o botão A mostra a máxima e o B mostra a mínima.',
      conceito: 'Uma variável lembra valores entre uma leitura e outra. A variável maxima começa baixa e a minima começa alta. Toda vez que a temperatura passa da máxima guardada (ou fica abaixo da mínima), o programa troca o valor guardado. Assim guardamos os recordes de calor e frio.',
      resultado: 'A micro:bit acompanha os recordes. Botão A mostra a máxima e botão B mostra a mínima.',
      desafio: 'Faça o logotipo zerar os recordes para começar de novo.',
      blocos: programa(
        X.no_iniciar({}, [definir('maxima', 0), definir('minima', 100)]),
        X.sempre({}, [
          se(cmp(X.temperatura({}), '>', v('maxima')), [definir('maxima', X.temperatura({}))]),
          se(cmp(X.temperatura({}), '<', v('minima')), [definir('minima', X.temperatura({}))]),
          X.pausa({ MS: 500 }),
        ]),
        X.ao_botao({ BTN: 'A' }, [X.mostrar_numero({ N: v('maxima') })]),
        X.ao_botao({ BTN: 'B' }, [X.mostrar_numero({ N: v('minima') })]),
      ),
    },
    {
      nome: 'Desafio: alarme de temperatura',
      objetivo: 'Toque um alarme e mostre um rosto bravo quando a temperatura passar de 30 °C.',
      conceito: 'Sensores + decisões = objetos inteligentes, como um alarme de incêndio. Uma comparação como “temperatura maior ou igual a 30” é uma pergunta cuja resposta é verdadeiro ou falso. Se for verdadeira, o programa mostra o alerta e toca um som; senão, mostra que está tudo bem.',
      resultado: 'Abaixo de 30 °C aparece um rosto feliz; a partir de 30 °C, aparece um rosto bravo e toca um apito.',
      desafio: 'Troque o 30 por um valor um pouco acima da temperatura da sala e aqueça a placa com as mãos.',
      blocos: programa(X.sempre({}, [
        se(cmp(X.temperatura({}), '>=', 30),
          [X.mostrar_icone({ ICONE: 'Angry' }), X.tocar_tom({ F: 880, B: 'Quarter' })],
          [X.mostrar_icone({ ICONE: 'Happy' })]),
        X.pausa({ MS: 1000 }),
      ])),
    },
  ],
};
