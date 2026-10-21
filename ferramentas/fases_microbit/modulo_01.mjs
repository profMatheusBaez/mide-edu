/* Módulo 1 — Tela de LEDs (5 fases). Só letras sem acento na tela. */
import { X, definir, mudar, v, se, cmp, e, programa, desenho } from './_dsl.mjs';

export default {
  modulo: 0,
  fases: [
    {
      nome: 'Olá, mundo!',
      objetivo: 'Faça a micro:bit dizer olá passando uma mensagem pela tela de LEDs.',
      conceito: 'A tela da micro:bit tem 25 LEDs em uma grade de 5 por 5. Para escrever um texto, a placa acende os LEDs letra por letra, passando a palavra pela tela como um letreiro. O texto vai entre aspas. A tela só sabe desenhar letras sem acento, por isso escrevemos Ola e não Olá.',
      resultado: 'A palavra Ola! passa pela tela de LEDs uma vez, quando a micro:bit liga.',
      desafio: 'Troque Ola! pelo seu nome (sem acentos). Quanto mais comprido o texto, mais tempo ele demora para passar.',
      blocos: programa(X.no_iniciar({}, [X.mostrar_texto({ T: 'Ola!' })])),
    },
    {
      nome: 'Mostrando números',
      objetivo: 'Mostre dois números na tela, um depois do outro.',
      conceito: 'Números também passam pela tela, algarismo por algarismo. Como o programa roda muito rápido, precisamos de uma pausa para ver o primeiro número antes de o segundo chegar. A pausa é medida em milissegundos: 1000 milissegundos são 1 segundo.',
      resultado: 'A tela mostra o 7, espera 1 segundo e depois mostra o 2026.',
      desafio: 'Mostre a sua idade e, depois de 2 segundos, o ano em que você nasceu.',
      blocos: programa(X.no_iniciar({}, [
        X.mostrar_numero({ N: 7 }),
        X.pausa({ MS: 1000 }),
        X.mostrar_numero({ N: 2026 }),
      ])),
    },
    {
      nome: 'Ícones prontos',
      objetivo: 'Faça um coração bater usando dois ícones prontos da micro:bit.',
      conceito: 'A micro:bit já vem com dezenas de desenhos prontos, chamados ícones: coração, rosto feliz, casa, pato… Basta escolher um. Colocando dois ícones um depois do outro dentro do laço “sempre”, o desenho parece se mexer, como um coração batendo.',
      resultado: 'Um coração grande e um coração pequeno se alternam na tela, como uma batida, sem parar.',
      desafio: 'Troque os corações por um rosto feliz e um rosto triste. Diminua a pausa para o coração bater mais rápido.',
      blocos: programa(X.sempre({}, [
        X.mostrar_icone({ ICONE: 'Heart' }),
        X.pausa({ MS: 500 }),
        X.mostrar_icone({ ICONE: 'SmallHeart' }),
        X.pausa({ MS: 500 }),
      ])),
    },
    {
      nome: 'Desenhando na tela',
      objetivo: 'Desenhe o seu próprio rosto sorrindo, LED por LED.',
      conceito: 'Cada quadradinho do desenho é um LED da tela. Em JavaScript, o # acende o LED e o ponto . deixa apagado; em MicroPython, cada LED tem um brilho de 0 (apagado) a 9 (máximo). Nos blocos, é só clicar nos quadradinhos do bloco “mostrar LEDs”.',
      resultado: 'A tela mostra um rosto sorrindo: dois olhos em cima e um sorriso embaixo.',
      desafio: 'Mude o desenho para um rosto de surpresa: acenda a boca no meio (três LEDs juntos). Depois desenhe uma seta.',
      blocos: programa(X.no_iniciar({}, [
        X.mostrar_leds({ LEDS: desenho('.#.#.', '.....', '#...#', '.###.', '.....') }),
      ])),
    },
    {
      nome: 'Desafio: animação',
      objetivo: 'Crie uma animação de 4 quadros: um quadrado que cresce e volta a ser pequeno.',
      conceito: 'Uma animação é uma sequência de desenhos mostrada rápido. Cada desenho é um quadro. Com quatro quadros e uma pausa curta entre eles dentro do “sempre”, a micro:bit repete a animação para sempre. Quanto menor a pausa, mais rápida a animação.',
      resultado: 'Um ponto no centro cresce até virar um quadrado e depois a tela se apaga, em repetição.',
      desafio: 'Faça o quadrado crescer e depois encolher (7 quadros). Depois invente uma animação sua: uma bola quicando ou uma cobra andando.',
      blocos: programa(X.sempre({}, [
        X.mostrar_leds({ LEDS: desenho('.....', '.....', '..#..', '.....', '.....') }),
        X.pausa({ MS: 200 }),
        X.mostrar_leds({ LEDS: desenho('.....', '.###.', '.#.#.', '.###.', '.....') }),
        X.pausa({ MS: 200 }),
        X.mostrar_leds({ LEDS: desenho('#####', '#...#', '#...#', '#...#', '#####') }),
        X.pausa({ MS: 200 }),
        X.limpar_tela({}),
        X.pausa({ MS: 200 }),
      ])),
    },
  ],
};
