/* Módulo 7 — Microfone (5 fases). */
import { X, definir, mudar, v, se, cmp, programa } from './_dsl.mjs';

export default {
  modulo: 6,
  fases: [
    {
      nome: 'Nível de som',
      objetivo: 'Mostre na tela o nível de som que a micro:bit escuta.',
      conceito: 'A micro:bit V2 tem um microfone, na frente, ao lado de um pontinho que acende quando ele está ligado. O nível de som vai de 0 (silêncio) a 255 (barulho forte). Bata palmas perto da placa e veja o número subir.',
      resultado: 'A tela mostra números baixos no silêncio e altos com palmas ou voz alta.',
      desafio: 'Descubra qual é o nível de som da sua sala em silêncio e quando você fala normalmente.',
      aviso: 'O microfone da V2 fica na frente da placa, perto do logotipo. Não cubra com o dedo.',
      blocos: programa(X.sempre({}, [
        X.mostrar_numero({ N: X.nivel_som({}) }),
        X.pausa({ MS: 200 }),
      ])),
    },
    {
      nome: 'Quando o som for alto',
      objetivo: 'Faça um rosto feliz aparecer quando alguém bater palmas.',
      conceito: 'O microfone também gera um evento: “quando o som for alto”. Ele dispara quando o barulho passa de um limite (uma palma, um estalo ou um grito). Não precisa medir o nível de som: o evento já avisa.',
      resultado: 'Uma palma faz um rosto feliz aparecer por 1 segundo, e depois a tela apaga.',
      desafio: 'Faça uma segunda reação para o som baixo: um rosto dormindo.',
      blocos: programa(X.ao_som({ S: 'Loud' }, [
        X.mostrar_icone({ ICONE: 'Happy' }),
        X.pausa({ MS: 1000 }),
        X.limpar_tela({}),
      ])),
    },
    {
      nome: 'Medidor de ruído em barras',
      objetivo: 'Mostre o barulho como um gráfico de barras que sobe e desce.',
      conceito: 'O gráfico de barras é uma boa forma de ver rápido se o ambiente está calmo ou barulhento. O máximo 255 é o maior nível de som que o microfone entrega.',
      resultado: 'A barra de LEDs sobe com o barulho e desce com o silêncio.',
      desafio: 'Troque o máximo 255 por 128 para o medidor ficar mais sensível.',
      blocos: programa(X.sempre({}, [
        X.grafico_barras({ V: X.nivel_som({}), MAX: 255 }),
        X.pausa({ MS: 50 }),
      ])),
    },
    {
      nome: 'Palmas contam pontos',
      objetivo: 'Conte quantas palmas foram batidas e mostre o total.',
      conceito: 'Aqui misturamos duas ideias: o evento de som e uma variável que soma. Cada palma soma 1 na variável palmas. A pausa curta evita que uma palma só seja contada duas vezes por causa do eco. O botão A zera o contador.',
      resultado: 'A cada palma, o número na tela sobe em 1. O botão A zera o contador.',
      desafio: 'Faça a micro:bit acender um rosto feliz quando chegar a 10 palmas.',
      blocos: programa(
        X.no_iniciar({}, [definir('palmas', 0)]),
        X.ao_som({ S: 'Loud' }, [
          mudar('palmas', 1),
          X.mostrar_numero({ N: v('palmas') }),
          X.pausa({ MS: 300 }),
        ]),
        X.ao_botao({ BTN: 'A' }, [definir('palmas', 0), X.mostrar_numero({ N: v('palmas') })]),
      ),
    },
    {
      nome: 'Desafio: silêncio na sala',
      objetivo: 'Faça um alerta de barulho: rosto bravo e um apito quando o nível de som passar de 120.',
      conceito: 'Um “silêncio na sala” fica de olho no nível de som e reage quando o barulho passa de um limite. Abaixo do limite mostra um rosto tranquilo; acima, mostra um rosto bravo e toca um apito curto. É uma forma divertida de ajudar a turma a controlar o volume.',
      resultado: 'Com a sala calma aparece um rosto feliz; se o barulho passar de 120, aparece um rosto bravo com um apito.',
      desafio: 'Ajuste o limite 120 para a sua sala e mostre também o número do nível de som.',
      blocos: programa(X.sempre({}, [
        se(cmp(X.nivel_som({}), '>', 120),
          [X.mostrar_icone({ ICONE: 'Angry' }), X.tocar_tom({ F: 880, B: 'Eighth' })],
          [X.mostrar_icone({ ICONE: 'Happy' })]),
        X.pausa({ MS: 200 }),
      ])),
    },
  ],
};
