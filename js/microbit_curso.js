/* ============================================================
 * microbit_curso.js — placa BBC micro:bit V2
 * ------------------------------------------------------------
 * A tabela de ligações (MB_PINOS), os 18 módulos, a explicação de
 * cada linha de código (JavaScript e MicroPython) e a montagem das
 * fases para a IDE (criarCursoMicrobit).
 *
 * As 90 fases (18 módulos × 5) vêm de microbit_fases_gerado.js, que
 * é GERADO por ferramentas/gerar_fases_microbit.mjs a partir dos
 * blocos de cada fase: o JavaScript e o MicroPython de cada fase
 * saem dos MESMOS blocos, pelos geradores do Modo Blocos — nunca
 * são escritos à mão.
 * ============================================================ */
'use strict';

/* Ligações do adaptador. PROVISÓRIO até o professor conferir com o
   adaptador dele. É a ÚNICA tabela: os textos, os blocos e o código das
   fases leem daqui (troque aqui e rode gerar_fases_microbit.mjs). */
const MB_PINOS = {
  led: { vermelho: 13, amarelo: 14, verde: 15 },
  botao: { um: 8, dois: 9 },
  pot: 2,
  ultra: { trig: 16, echo: 1 },
  buzzer: 0,
  servo: 1,
  seteSeg: { a: 3, b: 4, c: 6, d: 7, e: 10, f: 13, g: 14, dp: 15 },
  lcd: { scl: 19, sda: 20, endereco: 0x27 },
};

const MB_FQBN = 'microbit:v2';   // só rótulo: não há arduino-cli nesta placa
const MB_XP = (n) => (n === 5 ? 30 : 20);

const MB_MODULOS = [
  { id: 'mb-tela', nome: 'Tela de LEDs', icone: 'icone_tela.png' },
  { id: 'mb-botoes', nome: 'Botões e logotipo', icone: 'icone_modulo_botao.png' },
  { id: 'mb-luz', nome: 'Luz', icone: 'concept_analogico.png' },
  { id: 'mb-temperatura', nome: 'Temperatura', icone: 'icone_modulo_pot.png' },
  { id: 'mb-movimento', nome: 'Acelerômetro e gestos', icone: 'concept_pwm.png' },
  { id: 'mb-bussola', nome: 'Bússola e ímã', icone: 'icone_modulo_servo.png' },
  { id: 'mb-microfone', nome: 'Microfone', icone: 'concept_digital.png' },
  { id: 'mb-som', nome: 'Alto-falante e música', icone: 'icone_modulo_buzzer.png' },
  { id: 'mb-radio', nome: 'Rádio', icone: 'icone_comunicacao_serial.png' },
  { id: 'mb-jogos', nome: 'Jogos', icone: 'boards/microbit.svg' },
  { id: 'mb-led', nome: 'LED externo', icone: 'icone_modulo_led.png' },
  { id: 'mb-botao-ext', nome: 'Botão externo', icone: 'icone_modulo_botao.png' },
  { id: 'mb-pot', nome: 'Potenciômetro', icone: 'icone_modulo_pot.png' },
  { id: 'mb-us', nome: 'Ultrassônico', icone: 'icone_modulo_us.png' },
  { id: 'mb-buzzer', nome: 'Buzzer', icone: 'icone_modulo_buzzer.png' },
  { id: 'mb-servo', nome: 'Servo motor', icone: 'icone_modulo_servo.png' },
  { id: 'mb-d7', nome: 'Display de 7 segmentos', icone: 'icone_modulo_d7.png' },
  { id: 'mb-lcd', nome: 'LCD 16x2', icone: 'icone_modulo_lcd.png' },
];

/* ------------------------------------------------------------
 * Explicação de cada linha (100% das linhas das fases).
 * A ordem importa: o primeiro padrão que servir explica a linha.
 * Devolve sempre um texto; MB_EXPLICACAO_GENERICA só sai se nenhum
 * padrão serviu — o teste do currículo exige que isso nunca ocorra.
 * ---------------------------------------------------------- */
const MB_EXPLICACAO_GENERICA = 'Uma instrução do programa.';

const MB_EXPLICACOES = [
  /* ---- estrutura (as duas linguagens) ---- */
  [/^$/, 'Linha em branco, só para separar as partes do programa.'],
  /* linha do desenho (começa com # ou .): vem antes do comentário */
  [/^[.#](?: [.#]){4}$/, 'Uma linha da tela, com 5 LEDs: # acende e . apaga.'],
  [/^(?:\/\/|#) ?Gerado pelo Modo Blocos/, 'Comentário: diz que este código foi montado pelos blocos.'],
  [/^(?:\/\/|#)/, 'Comentário: uma nota para quem lê. O computador ignora.'],
  [/^from microbit import \*$/, 'Traz para o programa tudo o que é da micro:bit: tela, botões, sensores e pinos.'],
  [/^from machine import time_pulse_us$/, 'Traz a função que mede quanto tempo um pino fica ligado, em microssegundos.'],
  [/^import (music|radio|random|math|utime)$/, 'Carrega o módulo que o programa usa em seguida.'],
  [/^import (lcd1602|sonar|sete_seg)$/, 'Carrega o arquivo auxiliar do componente. A IDE grava esse arquivo na micro:bit junto com o programa.'],
  [/^def \w+\(.*\):$/, 'Cria uma função: um trecho de código com nome, que o programa usa quando precisar.'],
  [/^return\b/, 'Devolve o resultado da função.'],
  [/^global \w+/, 'Avisa que a função vai mexer na variável de fora.'],
  [/^\w+ = \[.*\]$/, 'Guarda uma lista de valores.'],
  [/^basic\.forever\(function \(\) \{$/, 'Repete para sempre o que estiver dentro: é o bloco “sempre”.'],
  [/^while True:$/, 'Repete para sempre o que estiver recuado logo abaixo.'],
  [/^while (.+):$/, 'Repete enquanto a condição for verdadeira.'],
  [/^while \(.+\) \{$/, 'Repete enquanto a condição for verdadeira.'],
  [/^for \(let \w+ = 0; \w+ <= [^;]+; \w+\+\+\) \{$/, 'Repete contando: a variável começa em 0 e sobe de 1 em 1 até chegar no limite.'],
  [/^for \w+ in range\(.+\):$/, 'Repete contando: a variável passa por cada número da sequência.'],
  [/^for \w+ in .+:$/, 'Repete uma vez para cada item.'],
  [/^\} else if \(.+\) \{$|^elif .+:$/, 'Senão, testa outra condição.'],
  [/^\} else \{$|^else:$/, 'Senão: roda este trecho quando a condição de cima não é verdadeira.'],
  [/^if \(.+\) \{$|^if .+:$/, 'Testa a condição: só roda o trecho de dentro se ela for verdadeira.'],
  [/^\}\)$|^\}$|^\)$/, 'Fecha o trecho de código aberto acima.'],
  [/^`\)$/, 'Fecha o desenho da tela.'],
  [/^pass$/, 'Não faz nada (só ocupa o lugar de um trecho vazio).'],

  /* ---- eventos ---- */
  [/^input\.onButtonPressed\(Button\.AB,/, 'Quando A e B forem apertados juntos, roda o trecho de dentro.'],
  [/^input\.onButtonPressed\(Button\.(A|B),/, 'Quando o botão indicado for apertado, roda o trecho de dentro.'],
  [/^input\.onLogoEvent\(/, 'Quando o logotipo dourado for tocado, roda o trecho de dentro.'],
  [/^input\.onGesture\(/, 'Quando a micro:bit fizer o movimento indicado (agitar, virar…), roda o trecho de dentro.'],
  [/^input\.onSound\(/, 'Quando o microfone ouvir um som alto (ou baixo), roda o trecho de dentro.'],
  [/^radio\.onReceivedNumber\(/, 'Quando chegar um número pelo rádio, roda o trecho de dentro. O número fica em receivedNumber.'],
  [/^radio\.onReceivedString\(/, 'Quando chegar um texto pelo rádio, roda o trecho de dentro. O texto fica em receivedString.'],
  [/^bluetooth\.onBluetoothConnected\(/, 'Quando o computador se ligar por Bluetooth, roda o trecho de dentro.'],
  [/^bluetooth\.onBluetoothDisconnected\(/, 'Quando a conexão Bluetooth cair, roda o trecho de dentro.'],
  [/^bluetooth\.onUartDataReceived\(/, 'Quando chegar uma linha de texto por Bluetooth, roda o trecho de dentro.'],

  /* ---- tela ---- */
  [/^basic\.showNumber\(/, 'Mostra o número na tela de LEDs, passando algarismo por algarismo.'],
  [/^basic\.showString\(/, 'Passa o texto pela tela de LEDs, letra por letra.'],
  [/^basic\.showIcon\(/, 'Mostra um desenho pronto na tela.'],
  [/^basic\.showArrow\(/, 'Mostra uma seta apontando para a direção escolhida.'],
  [/^basic\.showLeds\(`$/, 'Mostra um desenho feito à mão: cada # acende um LED e cada . deixa apagado.'],
  [/^basic\.clearScreen\(\)/, 'Apaga todos os LEDs da tela.'],
  [/^basic\.pause\(/, 'Espera o tempo indicado, em milissegundos (1000 = 1 segundo).'],
  [/^sleep\(/, 'Espera o tempo indicado, em milissegundos (1000 = 1 segundo).'],
  [/^display\.scroll\(/, 'Passa o texto ou número pela tela de LEDs.'],
  [/^display\.show\(Image\.\w+\)/, 'Mostra um desenho pronto (ícone ou seta) na tela.'],
  [/^display\.show\(/, 'Mostra na tela de LEDs o desenho ou o texto indicado.'],
  [/^display\.clear\(\)/, 'Apaga todos os LEDs da tela.'],
  [/^display\.(on|off)\(\)/, 'Liga ou desliga a tela de LEDs. Desligada, os pinos dela ficam livres para outros componentes.'],
  [/^display\.set_pixel\(/, 'Acende ou apaga um LED da tela. O último número é o brilho: 0 apaga e 9 é o máximo.'],
  [/^\w+ = Image\(/, 'Cria um desenho da tela a partir de 5 linhas de 5 números (brilho de 0 a 9).'],
  [/^["']?[0-9]{5}:/, 'Uma linha do desenho: 5 números de brilho, de 0 (apagado) a 9 (máximo).'],
  [/^led\.plot\(/, 'Acende o LED da coluna x e da linha y (0 a 4).'],
  [/^led\.unplot\(/, 'Apaga o LED da coluna x e da linha y.'],
  [/^led\.plotBarGraph\(/, 'Desenha uma barra na tela: quanto maior o valor, mais LEDs acesos.'],
  [/^led\.enable\(/, 'Liga ou desliga a tela de LEDs. Desligada, os pinos dela ficam livres.'],
  [/^grafico_barras\(/, 'Desenha uma barra na tela: quanto maior o valor, mais LEDs acesos.'],

  /* ---- música e som ---- */
  [/^music\.playTone\(/, 'Toca uma nota na frequência (em hertz) pelo tempo indicado.'],
  [/^music\.pitch\(/, 'Toca uma nota na frequência (em hertz) pelo tempo indicado, em milissegundos.'],
  [/^music\.rest\(/, 'Fica em silêncio pelo tempo indicado.'],
  [/^music\.play\(/, 'Toca uma melodia pronta e espera ela terminar.'],
  [/^music\.setBuiltInSpeakerEnabled\(/, 'Liga ou desliga o alto-falante da própria placa.'],
  [/^music\.stopAllSounds\(/, 'Corta qualquer som que esteja tocando.'],
  [/^speaker\.(on|off)\(\)/, 'Liga ou desliga o alto-falante da própria placa.'],
  [/^audio\.play\(/, 'Toca um som pronto pelo alto-falante.'],
  [/^audio\.stop\(\)/, 'Corta qualquer som que esteja tocando.'],
  [/^soundExpression\.\w+\.playUntilDone\(\)/, 'Toca um som pronto (risada, bocejo…) até o fim.'],
  [/^set_volume\(/, 'Ajusta o volume do alto-falante, de 0 a 255.'],
  [/^music\.set_built_in_speaker_enabled|^music\.setVolume\(/, 'Ajusta o som.'],

  /* ---- sensores ---- */
  [/^input\.calibrateCompass\(\)|^compass\.calibrate\(\)/, 'Pede para calibrar a bússola: gire a placa até acender a tela toda.'],
  [/^serial\.writeLine\(/, 'Manda uma linha de texto para o Monitor Serial do computador.'],
  [/^serial\.writeValue\(/, 'Manda “nome:valor” para o computador. O Gráfico Serial desenha esses números.'],
  [/^print\(/, 'Manda o texto para o Monitor Serial do computador.'],
  [/^serial\./, 'Usa a comunicação serial com o computador.'],

  /* ---- rádio ---- */
  [/^radio\.setGroup\(/, 'Escolhe o grupo do rádio (0 a 255). Só placas no mesmo grupo se ouvem.'],
  [/^radio\.sendNumber\(/, 'Manda um número pelo rádio para as outras placas do grupo.'],
  [/^radio\.sendString\(/, 'Manda um texto pelo rádio para as outras placas do grupo.'],
  [/^radio\.on\(\)/, 'Liga o rádio da micro:bit.'],
  [/^radio\.config\(/, 'Configura o rádio. O grupo (group) faz só as placas iguais conversarem.'],
  [/^radio\.send\(/, 'Manda a mensagem pelo rádio para as outras placas do grupo.'],
  [/^\w+ = radio\.receive\(\)/, 'Pega a mensagem que chegou pelo rádio (ou None, se nada chegou).'],
  [/^radio\./, 'Usa o rádio da micro:bit.'],

  /* ---- pinos e componentes ---- */
  [/^pins\.digitalWritePin\(/, 'Liga (1) ou desliga (0) o pino indicado.'],
  [/^pins\.analogWritePin\(/, 'Manda um valor de 0 a 1023 ao pino (PWM): controla o brilho ou a força.'],
  [/^pins\.setPull\(/, 'Liga o resistor interno do pino. “Para cima” faz o botão ler 0 quando apertado.'],
  [/^pins\.servoWritePin\(/, 'Gira o servo motor até o ângulo indicado (0 a 180).'],
  [/^pins\.i2cWriteNumber\(/, 'Manda um número ao componente ligado pelo I2C (pinos P19 e P20).'],
  [/^pin\d+\.write_digital\(/, 'Liga (1) ou desliga (0) o pino indicado.'],
  [/^pin\d+\.write_analog\(/, 'Manda um valor de 0 a 1023 ao pino (PWM): controla o brilho, o som ou o servo.'],
  [/^pin\d+\.set_analog_period\(/, 'Define o período do PWM em milissegundos. Servos pedem 20 ms.'],
  [/^pin\d+\.set_pull\(/, 'Liga o resistor interno do pino. “Para cima” faz o botão ler 0 quando apertado.'],
  [/^control\.waitMicros\(|^utime\.sleep_us\(/, 'Espera poucos microssegundos (1 000 000 = 1 segundo).'],
  [/^lcd1602\.iniciar\(/, 'Liga o LCD 16x2 e apaga a tela.'],
  [/^lcd1602\.escrever\(/, 'Escreve o texto no LCD, na linha (0 ou 1) e na coluna (0 a 15) indicadas.'],
  [/^lcd1602\.limpar\(/, 'Apaga tudo o que está no LCD.'],
  [/^sete_seg\.mostrar\(/, 'Mostra um dígito de 0 a 9 no display de 7 segmentos.'],
  [/^sete_seg\.apagar\(/, 'Apaga todos os segmentos do display.'],
  [/^sonar\.|^distancia_cm\(/, 'Mede a distância com o sensor ultrassônico, em centímetros.'],
  [/^bluetooth\.startUartService\(/, 'Liga o serviço de texto por Bluetooth (UART).'],
  [/^bluetooth\.uartWriteLine\(/, 'Manda uma linha de texto ao computador por Bluetooth.'],
  [/^bluetooth\.uartWriteValue\(/, 'Manda “nome:valor” ao computador por Bluetooth.'],

  /* ---- jogo ---- */
  [/^(?:let )?\w+(?:: game\.LedSprite)? = (?:game\.createSprite\(|null)/, 'Cria um ponto (sprite) na tela, na coluna x e na linha y.'],
  [/^\w+\.move\(/, 'Anda com o sprite para a frente.'],
  [/^\w+\.turn\(/, 'Vira o sprite para a esquerda ou para a direita.'],
  [/^\w+\.change\(/, 'Soma um valor a uma propriedade do sprite (x, y, direção ou brilho).'],
  [/^\w+\.set\(/, 'Muda uma propriedade do sprite.'],
  [/^\w+\.ifOnEdgeBounce\(/, 'Se o sprite chegar na borda, ele volta.'],
  [/^game\.addScore\(/, 'Soma pontos na pontuação do jogo.'],
  [/^game\.gameOver\(/, 'Termina o jogo e mostra a pontuação.'],
  [/^game\./, 'Usa o sistema de jogo da micro:bit.'],

  /* ---- variáveis ---- */
  [/^let \w+ = ""$|^\w+ = ""$/, 'Cria uma variável de texto, começando vazia.'],
  [/^let \w+ = (?:false|true)$|^\w+ = (?:False|True)$/, 'Cria uma variável de verdadeiro/falso.'],
  [/^let \w+ = -?\d+$/, 'Cria uma variável (uma caixinha com nome) e guarda um número nela.'],
  [/^\w+ = -?\d+$/, 'Cria uma variável (uma caixinha com nome) e guarda um número nela.'],
  [/^let \w+ = /, 'Cria uma variável e guarda nela o resultado da conta.'],
  [/^\w+ \+= /, 'Soma esse valor à variável.'],
  [/^\w+ -= /, 'Tira esse valor da variável.'],
  [/^\w+ = /, 'Guarda o valor na variável.'],
  [/^\w+\.\w+\(/, 'Chama uma ação do objeto indicado.'],
];

function explicarLinhaMicrobit(linha /*, linguagem */) {
  const l = String(linha).trim();
  for (const [re, texto] of MB_EXPLICACOES) if (re.test(l)) return texto;
  return MB_EXPLICACAO_GENERICA;
}

/* Código sem espaços, linhas em branco e comentários — para comparar o que os Blocos
   geraram com o gabarito da fase. */
function mbNormalizarCodigo(codigo) {
  return String(codigo).split('\n')
    .map((l) => l.replace(/\s+$/, '').replace(/^\s+/, ''))
    .filter((l) => l && !/^(\/\/|#)/.test(l))
    .join('\n');
}

/* ------------------------------------------------------------
 * As fases para a IDE
 * ---------------------------------------------------------- */
const MB_STARTER = {
  js: '// Escreva seu programa em JavaScript aqui.\n',
  micropython: '# Escreva seu programa MicroPython aqui.\nfrom microbit import *\n',
};

function criarCursoMicrobit(linguagem) {
  const py = linguagem === 'micropython';
  const dados = typeof MB_FASES_GERADAS !== 'undefined' ? MB_FASES_GERADAS : [];
  return dados.map((f) => {
    const modulo = MB_MODULOS[f.modulo];
    const solucao = py ? f.py : f.js;
    const icone = { img: modulo.icone };
    return {
      id: 'mb_' + f.numero, setor: modulo.id, nome: f.nome, missao: 'Missão ' + f.n, xp: MB_XP(f.n),
      iconeSetor: modulo.icone, iconeObjetivo: icone, iconeDica: 'icone_void_setup.png', iconeAlerta: 'missao1_icone_alerta.png', kit: [],
      objetivo: f.objetivo, dica: f.desafio, resultado: f.resultado,
      aviso: f.aviso || null,
      conceito: { titulo: f.nome, imagem: 'boards/microbit.svg', texto: [f.conceito, '**Na placa:** ' + f.resultado] },
      secoes: [{
        titulo: py ? 'MicroPython · atenção à indentação' : 'JavaScript · MakeCode',
        linhas: solucao.trimEnd().split('\n').filter((l) => l.trim()).map((codigo) => ({ codigo, explicacao: explicarLinhaMicrobit(codigo, linguagem), icone })),
      }],
      solucao, starter: py ? MB_STARTER.micropython : MB_STARTER.js,
      blocos: f.blocos,
    };
  });
}
