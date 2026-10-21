/* Módulo 15 — Buzzer externo (5 fases). Pino: MB_PINOS.buzzer (P0). */
import { X, definir, v, se, cmp, e, e_, programa, pino } from './_dsl.mjs';

const AVISO = 'Ligue o buzzer entre o pino P0 (fio do +) e o GND. O programa desliga o alto-falante da placa para o som sair só pelo buzzer. Buzzer “ativo” (com circuito de som dentro) faz sempre o mesmo som; use um buzzer “passivo” para tocar notas diferentes.';
const P = () => pino('pot'), T = () => pino('ultra.trig'), E = () => pino('ultra.echo');

export default {
  modulo: 14,
  fases: [
    {
      nome: 'Tom no P0',
      objetivo: 'Faça o buzzer dar um bip de meio segundo quando a micro:bit ligar.',
      conceito: 'Um buzzer passivo é um alto-falante pequeno: quando o pino manda um sinal que liga e desliga rápido (uma frequência), ele vibra e faz som. Quanto maior a frequência, mais agudo o som. O tom de 440 Hz é a nota lá, usada para afinar instrumentos. A música da micro:bit sai pelo pino P0, onde o buzzer está ligado.',
      resultado: 'Um bip de 440 Hz (nota lá) toca por meio segundo no buzzer.',
      desafio: 'Faça um bip mais agudo (880 Hz) e outro mais grave (220 Hz).',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X.alto_falante({ E: 'FALSE' }),
        X.tocar_tom({ F: 440, B: 'Half' }),
      ])),
    },
    {
      nome: 'Notas',
      objetivo: 'Toque a escala completa: dó, ré, mi, fá, sol, lá, si e dó agudo.',
      conceito: 'Uma escala é uma sequência de notas de grave para agudo. As oito notas formam uma oitava. Cada nota vira uma linha do programa: o código só repete o padrão “tocar nota, por uma batida”.',
      resultado: 'O buzzer toca as oito notas da escala, uma depois da outra.',
      desafio: 'Toque a escala de trás para frente, do dó agudo até o dó grave.',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X.alto_falante({ E: 'FALSE' }),
        ...['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C5'].map((n) => X.tocar_nota({ NOTA: n, B: 'Quarter' })),
      ])),
    },
    {
      nome: 'Melodia',
      objetivo: 'Toque a melodia “Parabéns pra você” no buzzer.',
      conceito: 'Melodias prontas tocam pelo mesmo caminho das notas: direto no buzzer conectado ao P0 (com o alto-falante da placa desligado). É uma boa forma de testar o circuito antes de montar suas próprias músicas nota por nota.',
      resultado: 'A melodia Parabéns toca uma vez no buzzer quando a placa liga.',
      desafio: 'Troque a melodia por outra e faça-a tocar só quando o botão A for apertado.',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X.alto_falante({ E: 'FALSE' }),
        X.tocar_melodia({ M: 'Birthday' }),
      ])),
    },
    {
      nome: 'Botão toca nota',
      objetivo: 'Use os botões como teclas: A toca dó, B toca mi e A+B toca sol.',
      conceito: 'Cada tecla é um evento que toca uma nota no buzzer. O toque do logotipo funciona como pedal: corta o som na hora. Em um instrumento de verdade, você teria mais teclas: aqui bastam três para tocar acordes simples.',
      resultado: 'A toca dó, B toca mi, A+B toca sol. O toque no logotipo para o som.',
      desafio: 'Ligue um segundo buzzer e toque duas notas ao mesmo tempo.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.alto_falante({ E: 'FALSE' })]),
        X.ao_botao({ BTN: 'A' }, [X.tocar_nota({ NOTA: 'C', B: 'Quarter' })]),
        X.ao_botao({ BTN: 'B' }, [X.tocar_nota({ NOTA: 'E', B: 'Quarter' })]),
        X.ao_botao({ BTN: 'AB' }, [X.tocar_nota({ NOTA: 'G', B: 'Quarter' })]),
        X.ao_logo({}, [X.parar_sons({})]),
      ),
    },
    {
      nome: 'Desafio: alarme com pot e ultrassônico',
      objetivo: 'Faça um alarme que apita quando algo chega perto do sensor, com a distância de disparo regulada pelo potenciômetro.',
      conceito: 'Juntamos três componentes: o ultrassônico mede a distância, o potenciômetro escolhe o limite (de 5 a 50 cm, com “mapear”) e o buzzer apita quando um objeto passa desse limite. Girar o potenciômetro deixa o alarme mais ou menos sensível, sem mudar o programa.',
      resultado: 'Quando um objeto chega mais perto do que o limite escolhido no potenciômetro, o buzzer apita.',
      desafio: 'Mostre o limite escolhido na tela quando o botão A for apertado.',
      aviso: AVISO + ' O ultrassônico usa 5 V e o pino ECHO precisa de divisor de tensão (veja o módulo do ultrassônico). O potenciômetro fica no pino P2.',
      blocos: programa(
        X.no_iniciar({}, [X.alto_falante({ E: 'FALSE' }), definir('limite', 20), definir('distancia', 0)]),
        X.sempre({}, [
          definir('limite', X.mapear({ V: X.ler_analogico({ P: P() }), A: 0, B: 1023, C: 5, D: 50 })),
          definir('distancia', X.distancia_cm({ TRIG: T(), ECO: E() })),
          se(e_(cmp(v('distancia'), '>', 0), cmp(v('distancia'), '<', v('limite'))),
            [X.tocar_tom({ F: 880, B: 'Eighth' })]),
          X.pausa({ MS: 100 }),
        ]),
      ),
    },
  ],
};
