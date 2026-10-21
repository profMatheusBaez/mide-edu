/* Módulo 6 — Bússola (5 fases). */
import { X, se, seSenaoSe, cmp, ou, programa } from './_dsl.mjs';

const CAL = 'Calibre a bússola: a placa pede para inclinar até encher a tela de pontinhos. Fique longe de ímãs, alto-falantes e do computador. Sem calibrar, o rumo pode sair errado.';
const NORTE = () => ou(cmp(X.bussola({}), '>', 315), cmp(X.bussola({}), '<', 45));

export default {
  modulo: 5,
  fases: [
    {
      nome: 'Calibrar e ler a direção',
      objetivo: 'Calibre a bússola e mostre o rumo, em graus, na tela.',
      conceito: 'A bússola (magnetômetro) sente o campo magnético da Terra e diz para onde a placa está apontando: 0° é o Norte, 90° o Leste, 180° o Sul e 270° o Oeste. Antes de usar é preciso calibrar: a placa pede para você inclinar até encher a tela de pontinhos, como um joguinho.',
      resultado: 'A placa pede a calibração; depois a tela mostra o rumo, de 0 a 359.',
      desafio: 'Gire devagar a placa em círculo e veja o número mudar. Em que giro aparece 90?',
      aviso: CAL,
      blocos: programa(
        X.no_iniciar({}, [X.calibrar_bussola({})]),
        X.sempre({}, [
          X.mostrar_numero({ N: X.bussola({}) }),
          X.pausa({ MS: 500 }),
        ]),
      ),
    },
    {
      nome: 'Mostrar N, L, S e O',
      objetivo: 'Mostre a letra do ponto cardeal para onde a placa aponta: N, L, S ou O.',
      conceito: 'Dividimos o círculo de 360° em quatro partes. Perto de 0° (ou de 360°) é o Norte, por isso testamos os dois lados: “maior que 315 ou menor que 45”. O operador “ou” é verdadeiro se qualquer um dos lados for verdadeiro.',
      resultado: 'A tela mostra N, L, S ou O conforme a direção em que a placa aponta.',
      desafio: 'Crie ainda os pontos NE, SE, SO e NO dividindo o círculo em 8 partes.',
      aviso: CAL,
      blocos: programa(
        X.no_iniciar({}, [X.calibrar_bussola({})]),
        X.sempre({}, [
          seSenaoSe([
            [NORTE(), [X.mostrar_texto({ T: 'N' })]],
            [cmp(X.bussola({}), '<', 135), [X.mostrar_texto({ T: 'L' })]],
            [cmp(X.bussola({}), '<', 225), [X.mostrar_texto({ T: 'S' })]],
          ], [X.mostrar_texto({ T: 'O' })]),
          X.pausa({ MS: 500 }),
        ]),
      ),
    },
    {
      nome: 'Seta que aponta o Norte',
      objetivo: 'Faça a tela mostrar uma seta que sempre aponta para o Norte, não importa para onde a placa esteja virada.',
      conceito: 'Aqui o programa transforma um número (o rumo) em um desenho (a seta). Se a placa está virada para o Leste (90°), o Norte fica à esquerda dela, então a seta aponta para o Oeste da tela. O “se … senão se …” escolhe a faixa certa entre as quatro possíveis.',
      resultado: 'A seta na tela aponta sempre para o Norte real, mesmo quando você gira a placa.',
      desafio: 'Faça a seta apontar para o Sul em vez de o Norte.',
      aviso: CAL,
      blocos: programa(
        X.no_iniciar({}, [X.calibrar_bussola({})]),
        X.sempre({}, [
          seSenaoSe([
            [NORTE(), [X.mostrar_seta({ DIR: 'North' })]],
            [cmp(X.bussola({}), '<', 135), [X.mostrar_seta({ DIR: 'West' })]],
            [cmp(X.bussola({}), '<', 225), [X.mostrar_seta({ DIR: 'South' })]],
          ], [X.mostrar_seta({ DIR: 'East' })]),
          X.pausa({ MS: 300 }),
        ]),
      ),
    },
    {
      nome: 'Detector de ímã',
      objetivo: 'Mostre um alerta quando um ímã chegar perto da micro:bit.',
      conceito: 'O magnetômetro mede a força do campo magnético, em microtesla (µT). Longe de ímãs, o valor é o da Terra, entre 25 e 65 µT. Um detector compara o valor medido com um limite: aqui, 80 µT. Abaixo dele, tudo normal; acima dele, tem um ímã por perto.',
      resultado: 'Sem ímã aparece um rosto feliz. Com um ímã perto, aparece um rosto de susto.',
      desafio: 'Descubra o valor certo para a sua sala: some 15 ao maior valor que aparece sem ímã.',
      blocos: programa(X.sempre({}, [
        se(cmp(X.forca_magnetica({ D: 'Strength' }), '>', 80),
          [X.mostrar_icone({ ICONE: 'Surprised' })],
          [X.mostrar_icone({ ICONE: 'Happy' })]),
        X.pausa({ MS: 200 }),
      ])),
    },
    {
      nome: 'Desafio: bússola com som',
      objetivo: 'Toque uma nota e mostre um coração quando a placa estiver apontando para o Norte.',
      conceito: 'A bússola com som avisa quando você “achou o Norte”: entre 350° e 10°. Como a faixa passa pelo zero, testamos os dois lados com “ou”: maior que 350 ou menor que 10. Ao achar o Norte, tocamos uma nota; fora dele, a tela fica apagada.',
      resultado: 'Girando devagar, ao apontar para o Norte a tela mostra um coração e toca uma nota.',
      desafio: 'Faça o som ficar mais agudo quanto mais perto do Norte você chegar.',
      aviso: CAL,
      blocos: programa(
        X.no_iniciar({}, [X.calibrar_bussola({})]),
        X.sempre({}, [
          se(ou(cmp(X.bussola({}), '>', 350), cmp(X.bussola({}), '<', 10)),
            [X.mostrar_icone({ ICONE: 'Heart' }), X.tocar_nota({ NOTA: 'C5', B: 'Eighth' })],
            [X.limpar_tela({})]),
          X.pausa({ MS: 100 }),
        ]),
      ),
    },
  ],
};
