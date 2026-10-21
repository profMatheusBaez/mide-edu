/* Módulo 14 — Sensor ultrassônico HC-SR04 (5 fases). Pinos: MB_PINOS.ultra (trig, echo). */
import { X, definir, v, se, cmp, e, e_, programa, pino } from './_dsl.mjs';

const AVISO = 'O HC-SR04 usa 5 V (ligue o VCC na saída de 5 V do adaptador, ou de uma fonte externa com o GND em comum). ATENÇÃO: o pino ECHO devolve 5 V, mas a micro:bit aguenta no máximo 3,3 V. Ligue um divisor de tensão no ECHO (por exemplo, 1 kΩ e 2 kΩ) ou use um módulo HC-SR04 versão 3,3 V, senão o pino pode queimar.';
const T = () => pino('ultra.trig'), E = () => pino('ultra.echo');
const dist = () => X.distancia_cm({ TRIG: T(), ECO: E() });

export default {
  modulo: 13,
  fases: [
    {
      nome: 'Pulso e distância',
      objetivo: 'Mostre na tela a distância, em centímetros, até um obstáculo.',
      conceito: 'O sensor ultrassônico manda um estalo de som que a gente não ouve (o pulso no pino trig) e espera o eco voltar (o pino echo). Quanto mais longe o obstáculo, mais tempo o eco demora. A micro:bit mede esse tempo em microssegundos e divide por 58 para achar os centímetros. Se nenhum eco voltar, a medida sai -1.',
      resultado: 'A tela mostra a distância em cm até a sua mão ou a parede (de 2 a 400 cm).',
      desafio: 'Meça a distância até a parede e confira com uma régua.',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.mostrar_numero({ N: dist() }),
        X.pausa({ MS: 500 }),
      ])),
    },
    {
      nome: 'Monitor em cm',
      objetivo: 'Envie a distância para o Monitor Serial.',
      conceito: 'Sensores de distância variam um pouco a cada leitura. No Gráfico Serial, você vê a linha subir e descer com o movimento da sua mão e percebe pequenas oscilações que a tela pequena esconde.',
      resultado: 'O Monitor Serial mostra “dist:” com o valor em cm a cada 200 ms.',
      desafio: 'Balance a mão à frente do sensor e olhe o gráfico.',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.serial_valor({ NOME: 'dist', V: dist() }),
        X.pausa({ MS: 200 }),
      ])),
    },
    {
      nome: 'Alerta de proximidade',
      objetivo: 'Mostre um rosto bravo quando alguém chegar a menos de 10 cm.',
      conceito: 'Guardamos a medida em uma variável para usar duas vezes sem medir de novo. A condição usa “e”: a distância precisa ser maior que 0 (houve eco) E menor que 10 (está perto). Sem a primeira parte, o -1 de “sem eco” faria o alarme disparar à toa.',
      resultado: 'Perto (menos de 10 cm) aparece um rosto bravo; longe, um rosto feliz.',
      desafio: 'Troque o rosto por um apito: toque uma nota quando o objeto estiver perto demais.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [definir('distancia', 0)]),
        X.sempre({}, [
          definir('distancia', dist()),
          se(e_(cmp(v('distancia'), '>', 0), cmp(v('distancia'), '<', 10)),
            [X.mostrar_icone({ ICONE: 'Angry' })],
            [X.mostrar_icone({ ICONE: 'Happy' })]),
          X.pausa({ MS: 100 }),
        ]),
      ),
    },
    {
      nome: 'Distância em barras',
      objetivo: 'Mostre a distância como uma barra: quanto mais longe, mais LEDs acesos.',
      conceito: 'Para o radar, mostramos a distância como barra em uma escala de 0 a 50 cm. Objetos além de 50 cm enchem a barra por completo. É uma forma rápida de “ver” a distância sem ler número.',
      resultado: 'Quando você aproxima a mão, a barra de LEDs diminui; afastando, ela cresce.',
      desafio: 'Inverta a barra: mais perto deve encher mais LEDs.',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.grafico_barras({ V: dist(), MAX: 50 }),
        X.pausa({ MS: 100 }),
      ])),
    },
    {
      nome: 'Desafio: sensor de ré com buzzer',
      objetivo: 'Faça o buzzer apitar mais rápido quanto mais perto um obstáculo estiver, como o sensor de ré do carro.',
      conceito: 'A pausa entre os apitos é proporcional à distância: 10 vezes o valor em cm. A 30 cm, a pausa é de 300 ms; a 5 cm, de só 50 ms, e os apitos ficam quase contínuos. Só apita se a distância estiver entre 1 e 30 cm. O buzzer fica no pino P0 e o alto-falante da placa é desligado.',
      resultado: 'Aproximando um objeto, os apitos do buzzer ficam cada vez mais rápidos.',
      desafio: 'Mostre também a distância na tela enquanto apita.',
      aviso: AVISO + ' O buzzer passivo fica entre o pino P0 (fio do +) e o GND.',
      blocos: programa(
        X.no_iniciar({}, [X.alto_falante({ E: 'FALSE' }), definir('distancia', 0)]),
        X.sempre({}, [
          definir('distancia', dist()),
          se(e_(cmp(v('distancia'), '>', 0), cmp(v('distancia'), '<', 30)), [
            X.tocar_tom({ F: 880, B: 'Sixteenth' }),
            X.pausa({ MS: e(v('distancia'), '*', 10) }),
          ]),
          X.pausa({ MS: 50 }),
        ]),
      ),
    },
  ],
};
