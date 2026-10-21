/* Módulo 16 — Servo motor (5 fases). Pino: MB_PINOS.servo. */
import { X, v, e, programa, pino } from './_dsl.mjs';

const AVISO = 'O servo tem três fios: marrom/preto (GND), vermelho (+) e laranja/amarelo (sinal). Servos puxam bastante corrente: alimente o fio vermelho com uma fonte externa (por exemplo 4 pilhas AA = 6 V, ou o adaptador), com o GND ligado também ao da micro:bit. Ligar o servo direto no 3V pode reiniciar a placa. O pino do servo é o mesmo do ECHO do ultrassônico: desligue o ultrassônico antes.';
const S = () => pino('servo'), P = () => pino('pot');

export default {
  modulo: 15,
  fases: [
    {
      nome: 'Ângulo fixo',
      objetivo: 'Coloque o servo motor na posição 90°, no meio do curso.',
      conceito: 'Um servo motor gira até um ângulo que você pede, de 0° a 180°, e fica parado lá. Para isso ele recebe pulsos repetidos; o comprimento de cada pulso diz o ângulo. A micro:bit cuida dos pulsos: você só informa o ângulo.',
      resultado: 'O braço do servo vai para o meio (90°) e fica parado.',
      desafio: 'Coloque uma tira de papel no braço do servo para enxergar melhor o ângulo.',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [X.servo({ P: S(), A: 90 })])),
    },
    {
      nome: 'Varredura de 0° a 180°',
      objetivo: 'Faça o servo ir para 0°, depois 90°, depois 180°, e repetir.',
      conceito: 'O servo precisa de tempo para chegar ao ângulo pedido. A pausa entre os comandos dá esse tempo. Sem pausa, o programa manda o próximo ângulo antes de o servo chegar, e ele parece tremer sem sair do lugar.',
      resultado: 'O servo passa por 0°, 90° e 180°, esperando 1 segundo em cada.',
      desafio: 'Inclua os ângulos 45° e 135° para a varredura ser mais suave.',
      aviso: AVISO,
      blocos: programa(X.sempre({}, [
        X.servo({ P: S(), A: 0 }), X.pausa({ MS: 1000 }),
        X.servo({ P: S(), A: 90 }), X.pausa({ MS: 1000 }),
        X.servo({ P: S(), A: 180 }), X.pausa({ MS: 1000 }),
      ])),
    },
    {
      nome: 'Potenciômetro controla o servo',
      objetivo: 'Controle o ângulo do servo girando o potenciômetro.',
      conceito: 'O potenciômetro entrega de 0 a 1023, mas o servo espera de 0 a 180. O bloco “mapear” converte uma escala na outra. O braço do servo copia o giro do botão, como um leme: gire para um lado e o servo acompanha.',
      resultado: 'O braço do servo acompanha o giro do potenciômetro.',
      desafio: 'Faça o servo acompanhar o giro ao contrário.',
      aviso: AVISO + ' O potenciômetro fica no pino P2.',
      blocos: programa(X.sempre({}, [
        X.servo({ P: S(), A: X.mapear({ V: X.ler_analogico({ P: P() }), A: 0, B: 1023, C: 0, D: 180 }) }),
        X.pausa({ MS: 20 }),
      ])),
    },
    {
      nome: 'Botões A e B giram',
      objetivo: 'Mova o servo com os botões: A leva para 0°, B leva para 180° e A+B volta para o meio.',
      conceito: 'Cada botão dispara um evento que manda um ângulo diferente. É como um controle remoto: o servo só faz o que o comando manda. Esse desenho é usado em braços robóticos e portões automáticos.',
      resultado: 'O botão A leva o servo para 0°, o B para 180° e o A+B para 90°.',
      desafio: 'Faça cada aperto do A avançar o servo 20° em vez de ir de uma vez até a ponta.',
      aviso: AVISO,
      blocos: programa(
        X.ao_botao({ BTN: 'A' }, [X.servo({ P: S(), A: 0 })]),
        X.ao_botao({ BTN: 'B' }, [X.servo({ P: S(), A: 180 })]),
        X.ao_botao({ BTN: 'AB' }, [X.servo({ P: S(), A: 90 })]),
      ),
    },
    {
      nome: 'Desafio: cancela automática',
      objetivo: 'Faça uma cancela: ao apertar A (o carro chegou) ela sobe devagar, espera 3 segundos e desce devagar.',
      conceito: 'Uma cancela é uma sequência automática: abrir, esperar e fechar. Para o movimento ser suave, contamos de 0 a 90 com um laço “para”, movendo o servo 1° por vez. Depois de 3 segundos com a cancela aberta, contamos ao contrário (90 − i) para fechar. O botão A faz o papel do sensor que avisa que o carro chegou.',
      resultado: 'Ao apertar A, o servo sobe devagar de 0° a 90°, espera 3 segundos e volta a 0°, mostrando um coração enquanto está aberto.',
      desafio: 'Coloque LEDs vermelho e verde: verde com a cancela aberta e vermelho com ela fechada.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.servo({ P: S(), A: 0 })]),
        X.ao_botao({ BTN: 'A' }, [
          X.para({ VAR: 'i', ATE: 90 }, [X.servo({ P: S(), A: v('i') }), X.pausa({ MS: 10 })]),
          X.mostrar_icone({ ICONE: 'Heart' }),
          X.pausa({ MS: 3000 }),
          X.limpar_tela({}),
          X.para({ VAR: 'i', ATE: 90 }, [X.servo({ P: S(), A: e(90, '-', v('i')) }), X.pausa({ MS: 10 })]),
        ]),
      ),
    },
  ],
};
