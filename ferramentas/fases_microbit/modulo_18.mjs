/* Módulo 18 — LCD 16x2 I2C (5 fases). Pinos: MB_PINOS.lcd (SCL P19, SDA P20, endereço 0x27). */
import { X, definir, mudar, v, se, cmp, junta, programa } from './_dsl.mjs';

const AVISO = 'O LCD com adaptador I2C usa 4 fios: GND, VCC, SDA (P20) e SCL (P19). Muitos modelos precisam de 5 V no VCC (use a saída de 5 V do adaptador). O endereço mais comum é 0x27; alguns módulos usam 0x3F. O contraste é regulado no parafuso azul atrás do LCD: se aparecerem só quadradinhos ou nada, gire-o. Só escreva letras sem acento e símbolos simples.';

export default {
  modulo: 17,
  fases: [
    {
      nome: 'Olá, LCD!',
      objetivo: 'Escreva uma mensagem na primeira linha do LCD 16x2.',
      conceito: 'O LCD tem 2 linhas de 16 letras. O adaptador I2C usa só 2 fios de dados (SDA e SCL) para receber tudo o que queremos escrever. Primeiro iniciamos o LCD; depois escrevemos o texto informando a linha (0 é a de cima) e a coluna (0 é a primeira).',
      resultado: 'O LCD mostra Ola, mundo! na primeira linha.',
      desafio: 'Escreva o seu nome. Quantas letras cabem em uma linha?',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X.lcd_iniciar({}),
        X.lcd_escrever({ T: 'Ola, mundo!', LIN: 0, COL: 0 }),
      ])),
    },
    {
      nome: 'Duas linhas',
      objetivo: 'Escreva uma palavra em cada linha do LCD.',
      conceito: 'A segunda linha é a linha 1 (a contagem começa no 0). Também podemos escolher a coluna onde o texto começa: coluna 0 é o canto esquerdo e coluna 15 é o último quadradinho. Escrever em uma coluna maior empurra o texto para a direita.',
      resultado: 'O LCD mostra micro:bit na linha de cima e V2 na linha de baixo.',
      desafio: 'Centralize o texto: comece na coluna certa para ele ficar no meio.',
      aviso: AVISO,
      blocos: programa(X.no_iniciar({}, [
        X.lcd_iniciar({}),
        X.lcd_escrever({ T: 'micro:bit', LIN: 0, COL: 0 }),
        X.lcd_escrever({ T: 'V2', LIN: 1, COL: 0 }),
      ])),
    },
    {
      nome: 'Termômetro no LCD',
      objetivo: 'Mostre a temperatura no LCD, atualizando uma vez por segundo.',
      conceito: 'Para juntar texto e número usamos “juntar”: o texto “Temp: ”, o valor e “C” formam uma mensagem só. Como o texto novo pode ser mais curto que o velho, limpamos o LCD antes de escrever, senão ficam letras sobrando da leitura anterior.',
      resultado: 'O LCD mostra, por exemplo, Temp: 24 C, e a linha é refeita a cada segundo.',
      desafio: 'Mostre também a luz na segunda linha.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.lcd_iniciar({})]),
        X.sempre({}, [
          X.lcd_limpar({}),
          X.lcd_escrever({ T: junta('Temp: ', X.temperatura({}), ' C'), LIN: 0, COL: 0 }),
          X.pausa({ MS: 1000 }),
        ]),
      ),
    },
    {
      nome: 'Contador no LCD',
      objetivo: 'Conte os apertos do botão A e mostre o total no LCD.',
      conceito: 'Cada aperto do botão A soma 1 em uma variável. O LCD é limpo e reescrito com o novo total. Um LCD faz a mesma função que a tela de LEDs, mas com muito mais espaço: cabe uma frase inteira em vez de um número por vez.',
      resultado: 'O LCD mostra “Cliques: N”, e N sobe a cada aperto de A. O botão B zera.',
      desafio: 'Escreva “Ola!” na segunda linha quando o total chegar a 10.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.lcd_iniciar({}), definir('cliques', 0), X.lcd_escrever({ T: 'Cliques: 0', LIN: 0, COL: 0 })]),
        X.ao_botao({ BTN: 'A' }, [
          mudar('cliques', 1),
          X.lcd_limpar({}),
          X.lcd_escrever({ T: junta('Cliques: ', v('cliques')), LIN: 0, COL: 0 }),
        ]),
        X.ao_botao({ BTN: 'B' }, [
          definir('cliques', 0),
          X.lcd_limpar({}),
          X.lcd_escrever({ T: 'Cliques: 0', LIN: 0, COL: 0 }),
        ]),
      ),
    },
    {
      nome: 'Desafio: painel de sensores',
      objetivo: 'Monte um painel: a luz na primeira linha e a temperatura na segunda.',
      conceito: 'Um painel de instrumentos mostra vários sensores ao mesmo tempo: cada valor em uma linha, com o nome ao lado. Usando o mesmo laço para ler e mostrar tudo, o painel se atualiza sozinho. É o embrião de uma estação meteorológica.',
      resultado: 'A linha 1 mostra “Luz: 120” e a linha 2 mostra “Temp: 24 C”, atualizadas a cada segundo.',
      desafio: 'Acrescente o nível de som e alterne entre duas telas a cada aperto do botão A.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.lcd_iniciar({})]),
        X.sempre({}, [
          X.lcd_limpar({}),
          X.lcd_escrever({ T: junta('Luz: ', X.luz({})), LIN: 0, COL: 0 }),
          X.lcd_escrever({ T: junta('Temp: ', X.temperatura({}), ' C'), LIN: 1, COL: 0 }),
          X.pausa({ MS: 1000 }),
        ]),
      ),
    },
  ],
};
