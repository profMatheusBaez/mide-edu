/* Módulo 9 — Rádio (5 fases). Sempre com duas micro:bits no mesmo grupo. */
import { X, se, cmp, programa } from './_dsl.mjs';

const AVISO = 'Você precisa de DUAS micro:bits V2 gravadas com programas do mesmo grupo de rádio (aqui, o grupo 1). Sem uma segunda placa, o programa roda, mas ninguém escuta.';

export default {
  modulo: 8,
  fases: [
    {
      nome: 'Grupo e enviar número',
      objetivo: 'Escolha um grupo de rádio e envie um número sorteado ao apertar o botão A.',
      conceito: 'A micro:bit tem um rádio embutido: as placas conversam entre si sem fio, sem internet e sem cabo. Para conversarem, precisam estar no mesmo “grupo” (um número de 0 a 255), como a estação de rádio certa. Um evento de botão sorteia um número de 1 a 9 e o envia para o grupo.',
      resultado: 'Ao apertar A, a placa envia um número e mostra uma seta para o Leste, avisando que enviou.',
      desafio: 'Escolha um grupo só da sua turma (um número entre 2 e 255) para não misturar com as outras mesas.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.radio_grupo({ G: 1 })]),
        X.ao_botao({ BTN: 'A' }, [
          X.radio_enviar_numero({ N: X.aleatorio({ DE: 1, ATE: 9 }) }),
          X.mostrar_seta({ DIR: 'East' }),
          X.pausa({ MS: 500 }),
          X.limpar_tela({}),
        ]),
      ),
    },
    {
      nome: 'Receber e mostrar',
      objetivo: 'Receba o número que a outra micro:bit enviou e mostre na tela.',
      conceito: 'Do outro lado, o programa fica esperando: “ao receber um número, faça isto”. O número que chegou vem dentro do bloco “número recebido”. Repare que quem envia e quem recebe usam o mesmo grupo.',
      resultado: 'Quando a outra placa envia um número, a tela desta placa mostra o mesmo número.',
      desafio: 'Grave este programa em uma placa e o da fase anterior em outra. Aperte A na primeira e veja a segunda responder.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.radio_grupo({ G: 1 })]),
        X.radio_ao_numero({}, [X.mostrar_numero({ N: X.radio_numero_recebido({}) })]),
      ),
    },
    {
      nome: 'Enviar texto',
      objetivo: 'Envie a palavra “oi” pelo rádio ao apertar A e mostre os textos que chegarem.',
      conceito: 'O rádio também envia textos. Este programa faz os dois papéis: quando o botão A é apertado, envia o texto “oi”; quando chega um texto, mostra na tela. Grave o mesmo programa nas duas placas e as duas conversam.',
      resultado: 'Apertando A em uma placa, a outra mostra a palavra oi.',
      desafio: 'Troque “oi” pelo seu nome (sem acentos) e cumprimente um colega.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.radio_grupo({ G: 1 })]),
        X.ao_botao({ BTN: 'A' }, [X.radio_enviar_texto({ T: 'oi' })]),
        X.radio_ao_texto({}, [X.mostrar_texto({ T: X.radio_texto_recebido({}) })]),
      ),
    },
    {
      nome: 'Mensageiro com botões',
      objetivo: 'Use os botões como mensagens prontas: A envia SIM, B envia NAO e a outra placa mostra a resposta.',
      conceito: 'Um mensageiro tem mensagens prontas, uma para cada botão. O A envia o texto SIM e o B envia o texto NAO. Quem recebe mostra o texto que chegou. Com o mesmo programa nas duas placas, dá para conversar de longe usando só duas palavras.',
      resultado: 'Apertando A em uma placa, a outra mostra SIM; apertando B, mostra NAO.',
      desafio: 'Acrescente uma terceira mensagem para o logotipo: OI.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.radio_grupo({ G: 1 })]),
        X.ao_botao({ BTN: 'A' }, [X.radio_enviar_texto({ T: 'SIM' })]),
        X.ao_botao({ BTN: 'B' }, [X.radio_enviar_texto({ T: 'NAO' })]),
        X.radio_ao_texto({}, [X.mostrar_texto({ T: X.radio_texto_recebido({}) })]),
      ),
    },
    {
      nome: 'Desafio: termômetro remoto',
      objetivo: 'Faça uma placa medir a temperatura e enviar pelo rádio, e a outra mostrar o valor recebido.',
      conceito: 'Um termômetro remoto é um sensor e uma tela em lugares diferentes. A placa que mede lê a temperatura e a envia a cada 2 segundos; a que mostra escuta o rádio e exibe o número que chegar. O mesmo programa nas duas placas faz cada uma mostrar a temperatura da outra.',
      resultado: 'Cada placa mostra, na tela, a temperatura medida pela outra placa, atualizada a cada 2 segundos.',
      desafio: 'Coloque uma placa em um lugar mais quente (perto da janela) e compare com a outra.',
      aviso: AVISO,
      blocos: programa(
        X.no_iniciar({}, [X.radio_grupo({ G: 1 })]),
        X.sempre({}, [
          X.radio_enviar_numero({ N: X.temperatura({}) }),
          X.pausa({ MS: 2000 }),
        ]),
        X.radio_ao_numero({}, [X.mostrar_numero({ N: X.radio_numero_recebido({}) })]),
      ),
    },
  ],
};
