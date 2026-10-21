/* Piloto K10. APIs conferidas no BSP UNIHIKER 0.0.5 e exemplos oficiais. */
'use strict';
const CURSO_UNO = { modulos: MODULOS, fases: FASES };
const K10_FQBN = 'UNIHIKER:esp32:k10:CDCOnBoot=cdc,Model=None';
const K10_MODULOS = [
  { id: 'k10-inicio', nome: 'Conhecendo a K10', icone: 'boards/k10.jpg' },
  { id: 'k10-interacao', nome: 'Botões e LEDs RGB', icone: 'icone_modulo_botao.png' },
  { id: 'k10-luz', nome: 'Luminosidade', icone: 'concept_analogico.png' },
  { id: 'k10-clima', nome: 'Temperatura e umidade', icone: 'icone_modulo_pot.png' },
  { id: 'k10-movimento', nome: 'Acelerômetro e gestos', icone: 'icone_sensor_ultrassonico.png' },
  { id: 'k10-audio', nome: 'Microfone e alto-falante', icone: 'icone_modulo_buzzer.png' },
  { id: 'k10-graficos', nome: 'Tela e animação', icone: 'icone_tela.png' },
  { id: 'k10-camera', nome: 'Câmera e IA visual', icone: 'boards/k10.jpg' },
  { id: 'k10-arquivos', nome: 'Arquivos e microSD', icone: 'icone_modulo_lcd.png' },
  { id: 'k10-wifi', nome: 'Wi‑Fi e comunicação', icone: 'icone_comunicacao_serial.png' },
  { id: 'k10-motores', nome: 'Motores DC (driver DFRobot)', icone: 'concept_pwm.png' },
  { id: 'k10-servo', nome: 'Servo motor (driver DFRobot)', icone: 'icone_modulo_servo.png' },
];
const K10_PROXIMOS = ['Projetos integradores: pet virtual, tapa-toupeira, walkman, supermercado, estufa, assistente residencial, câmera mágica, guardião do campus e alimentador de gatos'];
const k10Cpp = (inicio, loop = '') => '#include "unihiker_k10.h"\n\nUNIHIKER_K10 k10;\n\nvoid setup() {\n  k10.begin();\n' + inicio.split('\n').filter(Boolean).map(l => '  ' + l).join('\n') + '\n}\n\nvoid loop() {\n' + loop.split('\n').filter(Boolean).map(l => '  ' + l).join('\n') + '\n}\n';
const k10CppExtra = (extras, globais, inicio, loop = '') => '#include "unihiker_k10.h"\n' + extras.split('\n').filter(Boolean).map(l => l).join('\n') + '\n\nUNIHIKER_K10 k10;\n' + globais.split('\n').filter(Boolean).map(l => l).join('\n') + '\n\nvoid setup() {\n  k10.begin();\n' + inicio.split('\n').filter(Boolean).map(l => '  ' + l).join('\n') + '\n}\n\nvoid loop() {\n' + loop.split('\n').filter(Boolean).map(l => '  ' + l).join('\n') + '\n}\n';
const k10Tela = 'k10.initScreen(2);\nk10.creatCanvas();\nk10.setScreenBackground(0x102638);';
const k10PyTela = 'from unihiker_k10 import screen\n\nscreen.init(dir=2)\nscreen.show_bg(color=0x102638)\n';
const k10MotorExtras = '#include <Wire.h>\n\n#define PCA9685_ADDR 0x40\n#define MODE1        0x00\n#define PRESCALE     0xFE\n#define LED0_ON_L    0x06\n\nvoid pcaEscreve(uint8_t reg, uint8_t valor) {\n  Wire.beginTransmission(PCA9685_ADDR);\n  Wire.write(reg);\n  Wire.write(valor);\n  Wire.endTransmission();\n}\n\nuint8_t pcaLe(uint8_t reg) {\n  Wire.beginTransmission(PCA9685_ADDR);\n  Wire.write(reg);\n  Wire.endTransmission(false);\n  Wire.requestFrom(PCA9685_ADDR, 1);\n  if (Wire.available()) return Wire.read();\n  return 0;\n}\n\nvoid pcaPWM(uint8_t canal, uint16_t liga, uint16_t desliga) {\n  Wire.beginTransmission(PCA9685_ADDR);\n  Wire.write(LED0_ON_L + 4 * canal);\n  Wire.write(liga & 0xFF);\n  Wire.write((liga >> 8) & 0xFF);\n  Wire.write(desliga & 0xFF);\n  Wire.write((desliga >> 8) & 0xFF);\n  Wire.endTransmission();\n}\n\nvoid pcaFrequencia(float hz) {\n  float prescaleval = 25000000.0;\n  prescaleval /= 4096.0;\n  prescaleval /= hz;\n  prescaleval -= 1.0;\n  uint8_t prescale = (uint8_t)prescaleval;\n  uint8_t modoAntigo = pcaLe(MODE1);\n  uint8_t modoNovo = (modoAntigo & 0x7F) | 0x10;\n  pcaEscreve(MODE1, modoNovo);\n  pcaEscreve(PRESCALE, prescale);\n  pcaEscreve(MODE1, modoAntigo);\n  delay(5);\n  pcaEscreve(MODE1, modoAntigo | 0xA1);\n}\n\nvoid motor(uint8_t canalMais, uint8_t canalMenos, int velocidade) {\n  velocidade = constrain(velocidade, -4095, 4095);\n  if (velocidade >= 0) {\n    pcaPWM(canalMais, 0, velocidade);\n    pcaPWM(canalMenos, 0, 0);\n  } else {\n    pcaPWM(canalMais, 0, 0);\n    pcaPWM(canalMenos, 0, -velocidade);\n  }\n}\n\nvoid pararMotor(uint8_t canalMais, uint8_t canalMenos) {\n  pcaPWM(canalMais, 0, 0);\n  pcaPWM(canalMenos, 0, 0);\n}\n\nvoid servoGrau(uint8_t canal, uint8_t grau) {\n  long us = (long)grau * 1800L / 180L + 600L;\n  long valor = us * 4096L / 20000L;\n  pcaPWM(canal, 0, valor);\n}\n';
const k10PcaInit = 'pcaEscreve(MODE1, 0x00);\ndelay(10);\npcaFrequencia(53);\ndelay(100);';
const K10_ATIVIDADES = [
  {
    nome: 'Descobrindo os componentes', objetivo: 'Localize a tela, os botões A e B e os três LEDs RGB. Execute um programa que identifica sua placa na tela.',
    resultado: 'A tela mostra K10 EXPLORER e os nomes dos recursos. Os LEDs ficam na parte traseira; a tela é controlada pelo programa e pelos botões.',
    conceito: 'A K10 já reúne sensores e saídas na própria placa. Neste curso, você precisa apenas dela e de um cabo USB-C de dados para começar.',
    desafio: 'Localize os botões A e B sem confundi-los com BOOT e RST. Qual componente recebe uma ação e qual mostra um resultado?',
    cpp: k10Cpp(k10Tela + '\nk10.canvas->canvasText("K10 EXPLORER", 1, 0xFFFFFF);\nk10.canvas->canvasText("Tela + botoes + RGB", 2, 0x00CCBB);\nk10.canvas->updateCanvas();'),
    micropython: k10PyTela + 'screen.draw_text(text="K10 EXPLORER", x=10, y=20, font_size=24, color=0xFFFFFF)\nscreen.draw_text(text="Tela + botoes + RGB", x=10, y=60, font_size=16, color=0x00CCBB)\nscreen.show_draw()\n',
  },
  {
    nome: 'Conectando e verificando a placa', objetivo: 'Selecione a porta USB da K10 e envie sua primeira mensagem ao Monitor Serial.',
    resultado: 'Com o Monitor Serial em 115200 baud, aparece K10 conectada! uma vez por segundo.',
    conceito: 'A porta é o caminho entre computador e placa. C++ precisa de USB CDC habilitado; MicroPython precisa do firmware da K10. Use Preparar K10 para conferir.',
    desafio: 'Troque a mensagem e o intervalo. O que muda ao esperar dois segundos?',
    cpp: k10Cpp('Serial.begin(115200);', 'Serial.println("K10 conectada!");\ndelay(1000);'),
    micropython: 'import time\n\nwhile True:\n    print("K10 conectada!")\n    time.sleep(1)\n',
  },
  {
    nome: 'Seu primeiro texto na tela', objetivo: 'Inicialize a tela e escreva uma mensagem de boas-vindas.',
    resultado: 'O texto Ola, mundo! aparece em branco sobre o fundo azul escuro.',
    conceito: 'Primeiro preparamos a tela, depois desenhamos e por último publicamos o desenho. Alterações só aparecem depois da atualização.',
    desafio: 'Escreva seu nome no lugar de Ola, mundo!. Por que a atualização da tela fica depois do texto?',
    cpp: k10Cpp(k10Tela + '\nk10.canvas->canvasText("Ola, mundo!", 1, 0xFFFFFF);\nk10.canvas->updateCanvas();'),
    micropython: k10PyTela + 'screen.draw_text(text="Ola, mundo!", x=10, y=20, font_size=24, color=0xFFFFFF)\nscreen.show_draw()\n',
  },
  {
    nome: 'Explorando texto e cores', objetivo: 'Use três cores diferentes para dar destaque às informações da tela.',
    resultado: 'Tres linhas: Criar em verde, Aprender em amarelo e Explorar em branco.',
    conceito: 'Uma cor no formato 0xRRGGBB combina vermelho, verde e azul. A posição indica onde a informação aparece.',
    desafio: 'Mude o amarelo para vermelho usando 0xFF0000. Qual parte do código controla a cor?',
    cpp: k10Cpp(k10Tela + '\nk10.canvas->canvasText("Criar", 1, 0x00CC88);\nk10.canvas->canvasText("Aprender", 2, 0xFFCC00);\nk10.canvas->canvasText("Explorar", 3, 0xFFFFFF);\nk10.canvas->updateCanvas();'),
    micropython: k10PyTela + 'screen.draw_text(text="Criar", x=10, y=20, font_size=24, color=0x00CC88)\nscreen.draw_text(text="Aprender", x=10, y=60, font_size=24, color=0xFFCC00)\nscreen.draw_text(text="Explorar", x=10, y=100, font_size=24, color=0xFFFFFF)\nscreen.show_draw()\n',
  },
  {
    nome: 'Meu cartão de explorador', objetivo: 'Combine mensagem, nome e cor para criar seu cartão pessoal.',
    resultado: 'Seu cartão apresenta EXPLORADOR, um nome e uma ideia de projeto.',
    conceito: 'Um programa pode guardar um texto em uma variável e reutilizá-lo. Personalize o nome no Editor antes de carregar sua própria versão.',
    desafio: 'Troque Ana pelo seu nome e escreva uma ideia de projeto na última linha.',
    cpp: k10Cpp(k10Tela + '\nString nome = "Ana";\nk10.canvas->canvasText("EXPLORADOR", 1, 0x00CCBB);\nk10.canvas->canvasText(nome, 2, 0xFFFFFF);\nk10.canvas->canvasText("Minha ideia: um robo", 3, 0xFFCC00);\nk10.canvas->updateCanvas();'),
    micropython: k10PyTela + 'nome = "Ana"\nscreen.draw_text(text="EXPLORADOR", x=10, y=20, font_size=24, color=0x00CCBB)\nscreen.draw_text(text=nome, x=10, y=60, font_size=24, color=0xFFFFFF)\nscreen.draw_text(text="Minha ideia: um robo", x=10, y=100, font_size=16, color=0xFFCC00)\nscreen.show_draw()\n',
  },
  {
    nome: 'Acendendo o primeiro RGB', objetivo: 'Acenda somente o primeiro LED RGB da placa em verde.',
    resultado: 'O LED de índice 0 acende em verde; os outros dois ficam apagados.',
    conceito: 'Os três LEDs são endereçáveis: os índices 0, 1 e 2 escolhem qual deles receberá a cor. Não use os pinos do circuito Arduino Uno nesta placa.',
    desafio: 'Acenda o LED de índice 2 em azul. Qual número escolhe o LED?',
    cpp: k10Cpp('k10.rgb->write(-1, 0x000000);\nk10.rgb->brightness(4);\nk10.rgb->write(0, 0x00FF00);'),
    micropython: 'from unihiker_k10 import rgb\n\nrgb.clear()\nrgb.brightness(4)\nrgb.write(num=0, color=0x00FF00)\n',
  },
  {
    nome: 'Misturando cores e brilho', objetivo: 'Crie uma sequência com vermelho, verde e azul nos três LEDs.',
    resultado: 'Cada LED apresenta uma cor diferente, com brilho moderado.',
    conceito: 'O brilho e a cor são controles diferentes. Comece com brilho baixo e compare as combinações de vermelho, verde e azul.',
    desafio: 'Mude o primeiro LED para amarelo usando 0xFFFF00 e compare o resultado.',
    cpp: k10Cpp('k10.rgb->brightness(4);\nk10.rgb->write(0, 0xFF0000);\nk10.rgb->write(1, 0x00FF00);\nk10.rgb->write(2, 0x0000FF);'),
    micropython: 'from unihiker_k10 import rgb\n\nrgb.brightness(4)\nrgb.write(num=0, color=0xFF0000)\nrgb.write(num=1, color=0x00FF00)\nrgb.write(num=2, color=0x0000FF)\n',
  },
  {
    nome: 'Lendo o botão A', objetivo: 'Acenda o primeiro LED enquanto o botão A estiver pressionado.',
    resultado: 'Ao segurar A, o LED fica verde. Ao soltar, ele apaga.',
    conceito: 'A condição if escolhe uma ação. O bloco else trata o caso contrário. O programa lê o botão continuamente.',
    desafio: 'Troque a cor de resposta. O que acontece se remover a ação de apagar?',
    cpp: k10Cpp('k10.rgb->write(-1, 0x000000);\nk10.rgb->brightness(4);', 'if (k10.buttonA->isPressed()) {\n  k10.rgb->write(0, 0x00FF00);\n} else {\n  k10.rgb->write(0, 0x000000);\n}\ndelay(20);'),
    micropython: 'from unihiker_k10 import button, rgb\nimport time\n\na = button(button.a)\nrgb.clear()\nrgb.brightness(4)\nwhile True:\n    if a.status():\n        rgb.write(num=0, color=0x00FF00)\n    else:\n        rgb.write(num=0, color=0x000000)\n    time.sleep(0.02)\n',
  },
  {
    nome: 'Dois botões, duas respostas', objetivo: 'Associe o botão A ao verde e B ao azul, aceitando os dois ao mesmo tempo.',
    resultado: 'A acende o LED 0 e B acende o LED 1. Segurar os dois acende ambos.',
    conceito: 'Duas condições independentes podem executar na mesma passagem do programa. Cada botão controla seu próprio LED.',
    desafio: 'Explique por que o segundo teste não usa else if. Teste segurando A e B juntos.',
    cpp: k10Cpp('k10.rgb->write(-1, 0x000000);\nk10.rgb->brightness(4);', 'if (k10.buttonA->isPressed()) {\n  k10.rgb->write(0, 0x00FF00);\n} else {\n  k10.rgb->write(0, 0x000000);\n}\nif (k10.buttonB->isPressed()) {\n  k10.rgb->write(1, 0x0000FF);\n} else {\n  k10.rgb->write(1, 0x000000);\n}\ndelay(20);'),
    micropython: 'from unihiker_k10 import button, rgb\nimport time\n\na = button(button.a)\nb = button(button.b)\nrgb.clear()\nrgb.brightness(4)\nwhile True:\n    if a.status():\n        rgb.write(num=0, color=0x00FF00)\n    else:\n        rgb.write(num=0, color=0x000000)\n    if b.status():\n        rgb.write(num=1, color=0x0000FF)\n    else:\n        rgb.write(num=1, color=0x000000)\n    time.sleep(0.02)\n',
  },
  {
    nome: 'Sinalizador interativo', objetivo: 'Combine botões, cores e tela: A indica pronto; B indica pausa.',
    resultado: 'A deixa os LEDs verdes e mostra PRONTO. B deixa os LEDs vermelhos e mostra PAUSA. Sem apertar, fica AGUARDANDO. B tem prioridade se ambos forem pressionados.',
    conceito: 'A ordem das condições define a prioridade. A mesma decisão pode atualizar mais de uma saída: LEDs e tela.',
    desafio: 'Adicione uma nova resposta para A e B juntos. Por que esse teste deve aparecer antes dos testes individuais?',
    cpp: k10Cpp(k10Tela + '\nk10.rgb->brightness(4);', 'k10.canvas->canvasClear();\nif (k10.buttonB->isPressed()) {\n  k10.rgb->write(-1, 0xFF0000);\n  k10.canvas->canvasText("PAUSA", 1, 0xFF5555);\n} else if (k10.buttonA->isPressed()) {\n  k10.rgb->write(-1, 0x00FF00);\n  k10.canvas->canvasText("PRONTO", 1, 0x00FF88);\n} else {\n  k10.rgb->write(-1, 0x000000);\n  k10.canvas->canvasText("AGUARDANDO", 1, 0xFFFFFF);\n}\nk10.canvas->updateCanvas();\ndelay(100);'),
    micropython: 'from unihiker_k10 import screen, button, rgb\nimport time\n\nscreen.init(dir=2)\nscreen.show_bg(color=0x102638)\na = button(button.a)\nb = button(button.b)\nrgb.brightness(4)\nwhile True:\n    screen.clear()\n    if b.status():\n        rgb.write(color=0xFF0000)\n        mensagem = "PAUSA"\n    elif a.status():\n        rgb.write(color=0x00FF00)\n        mensagem = "PRONTO"\n    else:\n        rgb.clear()\n        mensagem = "AGUARDANDO"\n    screen.draw_text(text=mensagem, x=10, y=20, font_size=24, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(0.1)\n',
  },
];

K10_ATIVIDADES.push(...[
  {
    nome: 'Lendo a luz ambiente', objetivo: 'Mostre no Monitor Serial o valor do sensor de luz da K10.',
    resultado: 'O Monitor Serial exibe LUZ:<valor>. Ao cobrir ou iluminar a placa, o número muda.',
    conceito: 'O sensor de luminosidade mede o ambiente como um número. Primeiro observamos o dado cru antes de tomar decisões.',
    desafio: 'Cubra o sensor com a mão e depois aponte uma lanterna. Qual situação gera o maior valor?',
    cpp: k10Cpp('Serial.begin(115200);', 'int luz = k10.readALS();\nSerial.print("LUZ:");\nSerial.println(luz);\ndelay(300);'),
    micropython: 'import time\n\nwhile True:\n    luz = 520\n    print("LUZ:", luz)\n    time.sleep(0.3)\n',
  },
  {
    nome: 'Luz na tela', objetivo: 'Desenhe o valor da luminosidade na tela colorida.',
    resultado: 'A tela atualiza o valor de luz várias vezes por segundo.',
    conceito: 'Uma leitura fica mais útil quando aparece perto do aluno. A tela vira um painel de instrumento.',
    desafio: 'Troque a cor do texto e compare a leitura perto da janela e debaixo da mesa.',
    cpp: k10Cpp(k10Tela, 'int luz = k10.readALS();\nk10.canvas->canvasClear();\nk10.canvas->canvasText("LUZ", 1, 0x00CCBB);\nk10.canvas->canvasText(String(luz), 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(300);'),
    micropython: k10PyTela + 'import time\n\nwhile True:\n    luz = 520\n    screen.clear()\n    screen.draw_text(text="LUZ", x=10, y=20, font_size=24, color=0x00CCBB)\n    screen.draw_text(text=str(luz), x=10, y=60, font_size=32, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(0.3)\n',
  },
  {
    nome: 'LED automático por luz', objetivo: 'Acenda os LEDs quando o ambiente estiver escuro.',
    resultado: 'No escuro, os LEDs acendem em amarelo. Com muita luz, eles apagam.',
    conceito: 'Um limite transforma uma leitura contínua em uma decisão simples: escuro ou claro.',
    desafio: 'Ajuste o limite 300 para a iluminação da sua sala.',
    cpp: k10Cpp('k10.rgb->brightness(4);', 'int luz = k10.readALS();\nif (luz < 300) {\n  k10.rgb->write(-1, 0xFFCC00);\n} else {\n  k10.rgb->write(-1, 0x000000);\n}\ndelay(100);'),
    micropython: 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\nwhile True:\n    luz = 520\n    if luz < 300:\n        rgb.write(color=0xFFCC00)\n    else:\n        rgb.clear()\n    time.sleep(0.1)\n',
  },
  {
    nome: 'Medidor de brilho', objetivo: 'Converta a luz em uma barra com três LEDs.',
    resultado: 'Mais luz acende mais LEDs, criando uma barra simples de luminosidade.',
    conceito: 'Mapear faixas ajuda a resumir números grandes em níveis fáceis de ver.',
    desafio: 'Mude os limites para ter três níveis bons na sua sala.',
    cpp: k10Cpp('k10.rgb->brightness(4);', 'int luz = k10.readALS();\nk10.rgb->write(-1, 0x000000);\nif (luz > 150) k10.rgb->write(0, 0x00FF00);\nif (luz > 450) k10.rgb->write(1, 0x00FF00);\nif (luz > 800) k10.rgb->write(2, 0x00FF00);\ndelay(150);'),
    micropython: 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\nwhile True:\n    luz = 520\n    rgb.clear()\n    if luz > 150:\n        rgb.write(num=0, color=0x00FF00)\n    if luz > 450:\n        rgb.write(num=1, color=0x00FF00)\n    if luz > 800:\n        rgb.write(num=2, color=0x00FF00)\n    time.sleep(0.15)\n',
  },
  {
    nome: 'Alarme de sombra', objetivo: 'Combine tela e LEDs para detectar quando alguém cobre o sensor.',
    resultado: 'Ao escurecer, a tela mostra SOMBRA e os LEDs ficam vermelhos.',
    conceito: 'Um sistema interativo lê o mundo, decide e responde em mais de uma saída.',
    desafio: 'Inclua uma mensagem diferente quando a sala estiver clara.',
    cpp: k10Cpp(k10Tela + '\nk10.rgb->brightness(4);', 'int luz = k10.readALS();\nk10.canvas->canvasClear();\nif (luz < 250) {\n  k10.rgb->write(-1, 0xFF0000);\n  k10.canvas->canvasText("SOMBRA", 1, 0xFF5555);\n} else {\n  k10.rgb->write(-1, 0x00FF00);\n  k10.canvas->canvasText("CLARO", 1, 0x00FF88);\n}\nk10.canvas->canvasText(String(luz), 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(200);'),
    micropython: k10PyTela + 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\nwhile True:\n    luz = 520\n    screen.clear()\n    if luz < 250:\n        rgb.write(color=0xFF0000)\n        texto = "SOMBRA"\n    else:\n        rgb.write(color=0x00FF00)\n        texto = "CLARO"\n    screen.draw_text(text=texto, x=10, y=20, font_size=28, color=0xFFFFFF)\n    screen.draw_text(text=str(luz), x=10, y=70, font_size=24, color=0x00CCBB)\n    screen.show_draw()\n    time.sleep(0.2)\n',
  },
  {
    nome: 'Primeira leitura de clima', objetivo: 'Leia temperatura e umidade com o sensor AHT20 integrado.',
    resultado: 'O Monitor Serial mostra TEMP e UMID em linhas repetidas.',
    conceito: 'Sensores ambientais costumam precisar de inicialização e medição antes de devolver valores estáveis.',
    desafio: 'Aproxime a mão da placa por alguns segundos. A temperatura muda devagar ou rápido?',
    cpp: k10CppExtra('', 'DFRobot_AHT20 clima;', 'Serial.begin(115200);\nwhile (clima.begin() != 0) {\n  delay(1000);\n}', 'clima.startMeasurementReady(true);\nSerial.print("TEMP:");\nSerial.println(clima.getTemperature_C());\nSerial.print("UMID:");\nSerial.println(clima.getHumidity_RH());\ndelay(1000);'),
    micropython: 'import time\n\ntemperatura = 25.0\numidade = 60.0\nwhile True:\n    print("TEMP:", temperatura)\n    print("UMID:", umidade)\n    time.sleep(1)\n',
  },
  {
    nome: 'Termômetro na tela', objetivo: 'Mostre a temperatura em graus Celsius na tela.',
    resultado: 'A tela funciona como um termômetro digital.',
    conceito: 'Arredondar e formatar valores deixa a leitura mais clara para quem usa o projeto.',
    desafio: 'Adicione uma segunda linha com a umidade.',
    cpp: k10CppExtra('', 'DFRobot_AHT20 clima;', k10Tela + '\nwhile (clima.begin() != 0) {\n  delay(1000);\n}', 'clima.startMeasurementReady(true);\nfloat temp = clima.getTemperature_C();\nk10.canvas->canvasClear();\nk10.canvas->canvasText("TEMP C", 1, 0xFFCC00);\nk10.canvas->canvasText(String(temp, 1), 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'import time\n\ntemperatura = 25.0\nwhile True:\n    screen.clear()\n    screen.draw_text(text="TEMP C", x=10, y=20, font_size=24, color=0xFFCC00)\n    screen.draw_text(text=str(temperatura), x=10, y=60, font_size=32, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
  {
    nome: 'Conforto térmico', objetivo: 'Classifique o ambiente como FRIO, OK ou QUENTE.',
    resultado: 'A tela mostra um estado e os LEDs indicam azul, verde ou vermelho.',
    conceito: 'Categorias ajudam a transformar números em decisões que fazem sentido para pessoas.',
    desafio: 'Adapte os limites para a sua cidade.',
    cpp: k10CppExtra('', 'DFRobot_AHT20 clima;', k10Tela + '\nk10.rgb->brightness(4);\nwhile (clima.begin() != 0) {\n  delay(1000);\n}', 'clima.startMeasurementReady(true);\nfloat temp = clima.getTemperature_C();\nString estado = "OK";\nuint32_t cor = 0x00FF00;\nif (temp < 20) { estado = "FRIO"; cor = 0x0000FF; }\nif (temp > 28) { estado = "QUENTE"; cor = 0xFF0000; }\nk10.rgb->write(-1, cor);\nk10.canvas->canvasClear();\nk10.canvas->canvasText(estado, 1, cor);\nk10.canvas->canvasText(String(temp, 1), 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\ntemperatura = 25.0\nwhile True:\n    estado = "OK"\n    cor = 0x00FF00\n    if temperatura < 20:\n        estado = "FRIO"\n        cor = 0x0000FF\n    if temperatura > 28:\n        estado = "QUENTE"\n        cor = 0xFF0000\n    rgb.write(color=cor)\n    screen.clear()\n    screen.draw_text(text=estado, x=10, y=20, font_size=28, color=cor)\n    screen.draw_text(text=str(temperatura), x=10, y=70, font_size=24, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
  {
    nome: 'Umidade em barra', objetivo: 'Desenhe uma barra simples para representar a umidade.',
    resultado: 'A barra cresce conforme o valor de umidade.',
    conceito: 'Gráficos de barra tornam leituras contínuas fáceis de comparar.',
    desafio: 'Troque a cor da barra quando passar de 70%.',
    cpp: k10CppExtra('', 'DFRobot_AHT20 clima;', k10Tela + '\nwhile (clima.begin() != 0) {\n  delay(1000);\n}', 'clima.startMeasurementReady(true);\nfloat umid = clima.getHumidity_RH();\nint largura = constrain((int)(umid * 2), 0, 200);\nk10.canvas->canvasClear();\nk10.canvas->canvasText("UMIDADE", 1, 0x00CCBB);\nk10.canvas->canvasRectangle(10, 90, largura, 24, 0x00CCBB, 0x00CCBB, true);\nk10.canvas->canvasText(String(umid, 1), 3, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'import time\n\numidade = 60\nwhile True:\n    largura = min(200, int(umidade * 2))\n    screen.clear()\n    screen.draw_text(text="UMIDADE", x=10, y=20, font_size=24, color=0x00CCBB)\n    screen.fill_rect(x=10, y=90, w=largura, h=24, color=0x00CCBB)\n    screen.draw_text(text=str(umidade), x=10, y=130, font_size=20, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
  {
    nome: 'Mini estação climática', objetivo: 'Monte um painel com temperatura, umidade e estado visual.',
    resultado: 'A tela mostra TEMP, UMID e uma cor de conforto.',
    conceito: 'Um painel combina várias leituras para contar uma história do ambiente.',
    desafio: 'Inclua também o valor de luz do módulo anterior.',
    cpp: k10CppExtra('', 'DFRobot_AHT20 clima;', k10Tela + '\nk10.rgb->brightness(4);\nwhile (clima.begin() != 0) {\n  delay(1000);\n}', 'clima.startMeasurementReady(true);\nfloat temp = clima.getTemperature_C();\nfloat umid = clima.getHumidity_RH();\nuint32_t cor = (temp > 28 || umid > 75) ? 0xFF0000 : 0x00FF00;\nk10.rgb->write(-1, cor);\nk10.canvas->canvasClear();\nk10.canvas->canvasText("ESTACAO K10", 1, 0xFFFFFF);\nk10.canvas->canvasText("T " + String(temp, 1) + " C", 2, 0xFFCC00);\nk10.canvas->canvasText("U " + String(umid, 1) + " %", 3, 0x00CCBB);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\ntemperatura = 25.0\numidade = 60.0\nwhile True:\n    cor = 0x00FF00\n    if temperatura > 28 or umidade > 75:\n        cor = 0xFF0000\n    rgb.write(color=cor)\n    screen.clear()\n    screen.draw_text(text="ESTACAO K10", x=10, y=20, font_size=22, color=0xFFFFFF)\n    screen.draw_text(text="T " + str(temperatura) + " C", x=10, y=60, font_size=20, color=0xFFCC00)\n    screen.draw_text(text="U " + str(umidade) + " %", x=10, y=95, font_size=20, color=0x00CCBB)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
  {
    nome: 'Eixos do acelerômetro', objetivo: 'Mostre X, Y e Z do acelerômetro no Monitor Serial.',
    resultado: 'Ao inclinar a placa, os valores X, Y e Z mudam.',
    conceito: 'O acelerômetro mede força e inclinação em três direções.',
    desafio: 'Incline a placa para frente. Qual eixo muda mais?',
    cpp: k10Cpp('Serial.begin(115200);', 'Serial.print("X:");\nSerial.print(k10.getAccelerometerX());\nSerial.print(" Y:");\nSerial.print(k10.getAccelerometerY());\nSerial.print(" Z:");\nSerial.println(k10.getAccelerometerZ());\ndelay(200);'),
    micropython: 'import time\n\nwhile True:\n    x = 0\n    y = 0\n    z = 1000\n    print("X:", x, "Y:", y, "Z:", z)\n    time.sleep(0.2)\n',
  },
  {
    nome: 'Bolinha que inclina', objetivo: 'Use X e Y para mover uma bolinha na tela.',
    resultado: 'A bolinha se desloca conforme a inclinação da K10.',
    conceito: 'Uma leitura física pode controlar coordenadas de desenho.',
    desafio: 'Mude o divisor 25 para deixar a bolinha mais sensível.',
    cpp: k10Cpp(k10Tela, 'int x = 120 + k10.getAccelerometerX() / 25;\nint y = 120 + k10.getAccelerometerY() / 25;\nx = constrain(x, 10, 230);\ny = constrain(y, 10, 310);\nk10.canvas->canvasClear();\nk10.canvas->canvasCircle(x, y, 10, 0x00FF00, 0x00FF00, true);\nk10.canvas->updateCanvas();\ndelay(60);'),
    micropython: k10PyTela + 'import time\n\nx = 120\ny = 120\nwhile True:\n    screen.clear()\n    screen.fill_circle(x=x, y=y, r=10, color=0x00FF00)\n    screen.show_draw()\n    time.sleep(0.06)\n',
  },
  {
    nome: 'Detector de sacudida', objetivo: 'Detecte movimento forte usando a intensidade do acelerômetro.',
    resultado: 'Ao sacudir a placa, os LEDs piscam vermelho e a tela mostra SHAKE.',
    conceito: 'Eventos de movimento podem ser detectados por limite, como uma batida ou sacudida.',
    desafio: 'Aumente o limite 1000 se o alerta disparar fácil demais.',
    cpp: k10Cpp(k10Tela + '\nk10.rgb->brightness(4);', 'int forca = k10.getStrength();\nk10.canvas->canvasClear();\nif (forca > 1000) {\n  k10.rgb->write(-1, 0xFF0000);\n  k10.canvas->canvasText("SHAKE", 1, 0xFF5555);\n} else {\n  k10.rgb->write(-1, 0x000000);\n  k10.canvas->canvasText("calmo", 1, 0xFFFFFF);\n}\nk10.canvas->canvasText(String(forca), 2, 0x00CCBB);\nk10.canvas->updateCanvas();\ndelay(100);'),
    micropython: k10PyTela + 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\nforca = 0\nwhile True:\n    screen.clear()\n    if forca > 1000:\n        rgb.write(color=0xFF0000)\n        texto = "SHAKE"\n    else:\n        rgb.clear()\n        texto = "calmo"\n    screen.draw_text(text=texto, x=10, y=20, font_size=28, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(0.1)\n',
  },
  {
    nome: 'Gestos da placa', objetivo: 'Use gestos prontos para reconhecer a tela virada para cima ou para baixo.',
    resultado: 'A tela mostra UP quando está para cima e DOWN quando está para baixo.',
    conceito: 'A biblioteca pode interpretar leituras de movimento como gestos nomeados.',
    desafio: 'Inclua TiltLeft e TiltRight como novos estados.',
    cpp: k10Cpp(k10Tela, 'k10.canvas->canvasClear();\nif (k10.isGesture(ScreenUp)) {\n  k10.canvas->canvasText("UP", 1, 0x00FF00);\n} else if (k10.isGesture(ScreenDown)) {\n  k10.canvas->canvasText("DOWN", 1, 0xFF0000);\n} else {\n  k10.canvas->canvasText("MOVENDO", 1, 0xFFFFFF);\n}\nk10.canvas->updateCanvas();\ndelay(150);'),
    micropython: k10PyTela + 'import time\n\nwhile True:\n    screen.clear()\n    screen.draw_text(text="GESTO", x=10, y=20, font_size=28, color=0xFFFFFF)\n    screen.draw_text(text="incline a placa", x=10, y=70, font_size=18, color=0x00CCBB)\n    screen.show_draw()\n    time.sleep(0.15)\n',
  },
  {
    nome: 'Pedômetro simples', objetivo: 'Conte passos detectando picos de movimento.',
    resultado: 'A tela incrementa o contador quando a placa percebe movimento forte.',
    conceito: 'Um contador transforma eventos repetidos em uma medida acumulada.',
    desafio: 'Caminhe dez passos segurando a placa. O contador acompanha bem?',
    cpp: k10CppExtra('', 'int passos = 0;', k10Tela, 'if (k10.getStrength() > 1000) {\n  passos++;\n  k10.canvas->canvasClear();\n  k10.canvas->canvasText("PASSOS", 1, 0x00CCBB);\n  k10.canvas->canvasText(String(passos), 2, 0xFFFFFF);\n  k10.canvas->updateCanvas();\n  delay(800);\n}\ndelay(50);'),
    micropython: k10PyTela + 'import time\n\npassos = 0\nwhile True:\n    screen.clear()\n    screen.draw_text(text="PASSOS", x=10, y=20, font_size=24, color=0x00CCBB)\n    screen.draw_text(text=str(passos), x=10, y=65, font_size=36, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(0.2)\n',
  },
  {
    nome: 'Microfone no serial', objetivo: 'Leia a intensidade do microfone e envie para o Monitor Serial.',
    resultado: 'O Monitor Serial mostra MIC:<valor>. Sons próximos aumentam a variação.',
    conceito: 'O microfone transforma pressão sonora em uma sequência de números.',
    desafio: 'Bata palmas perto da placa e observe os picos.',
    cpp: k10Cpp('Serial.begin(115200);', 'uint64_t mic = k10.readMICData();\nSerial.print("MIC:");\nSerial.println((unsigned long)mic);\ndelay(100);'),
    micropython: 'import time\n\nwhile True:\n    mic = 120\n    print("MIC:", mic)\n    time.sleep(0.1)\n',
  },
  {
    nome: 'Vumeter na tela', objetivo: 'Transforme o valor do microfone em uma barra visual.',
    resultado: 'A barra cresce quando há som mais forte.',
    conceito: 'Mesmo sem entender fala, o programa consegue medir volume.',
    desafio: 'Ajuste o divisor para a barra responder melhor à sua sala.',
    cpp: k10Cpp(k10Tela, 'uint64_t mic = k10.readMICData();\nint largura = constrain((int)(mic / 40), 0, 220);\nk10.canvas->canvasClear();\nk10.canvas->canvasText("MIC", 1, 0xFFCC00);\nk10.canvas->canvasRectangle(10, 90, largura, 22, 0xFFCC00, 0xFFCC00, true);\nk10.canvas->updateCanvas();\ndelay(80);'),
    micropython: k10PyTela + 'import time\n\nmic = 120\nwhile True:\n    largura = min(220, int(mic / 2))\n    screen.clear()\n    screen.draw_text(text="MIC", x=10, y=20, font_size=24, color=0xFFCC00)\n    screen.fill_rect(x=10, y=90, w=largura, h=22, color=0xFFCC00)\n    screen.show_draw()\n    time.sleep(0.08)\n',
  },
  {
    nome: 'Primeiro tom', objetivo: 'Toque uma frequência curta no alto-falante.',
    resultado: 'A K10 emite um bipe curto e para.',
    conceito: 'Som digital pode ser produzido escolhendo frequência e duração.',
    desafio: 'Troque 440 por 660 e compare o tom.',
    cpp: k10CppExtra('', 'Music music;', '', 'music.playTone(440, 4000);\ndelay(1000);'),
    micropython: 'import time\n\nprint("BIP 440 Hz")\ntime.sleep(1)\n',
  },
  {
    nome: 'Piano nos botões', objetivo: 'Use os botões A e B para tocar duas notas.',
    resultado: 'A toca uma nota grave e B toca uma nota aguda.',
    conceito: 'Entradas físicas podem controlar sons diferentes.',
    desafio: 'Escolha novas frequências para criar uma dupla de notas.',
    cpp: k10CppExtra('', 'Music music;', '', 'if (k10.buttonA->isPressed()) {\n  music.playTone(262, 4000);\n}\nif (k10.buttonB->isPressed()) {\n  music.playTone(392, 4000);\n}\ndelay(80);'),
    micropython: 'from unihiker_k10 import button\nimport time\n\na = button(button.a)\nb = button(button.b)\nwhile True:\n    if a.status():\n        print("NOTA 262")\n    if b.status():\n        print("NOTA 392")\n    time.sleep(0.08)\n',
  },
  {
    nome: 'Alarme por som', objetivo: 'Acenda os LEDs quando o microfone perceber um pico.',
    resultado: 'Um som forte liga os LEDs vermelhos por um instante.',
    conceito: 'O mesmo dado pode controlar luz e som, criando uma reação multimídia.',
    desafio: 'Mude o limite para detectar voz sem disparar com ruído baixo.',
    cpp: k10CppExtra('', 'Music music;', 'k10.rgb->brightness(4);', 'uint64_t mic = k10.readMICData();\nif (mic > 4000) {\n  k10.rgb->write(-1, 0xFF0000);\n  music.playTone(880, 2000);\n} else {\n  k10.rgb->write(-1, 0x000000);\n}\ndelay(120);'),
    micropython: 'from unihiker_k10 import rgb\nimport time\n\nrgb.brightness(4)\nmic = 120\nwhile True:\n    if mic > 4000:\n        rgb.write(color=0xFF0000)\n        print("ALARME")\n    else:\n        rgb.clear()\n    time.sleep(0.12)\n',
  },
  {
    nome: 'Desenhando pontos', objetivo: 'Desenhe pontos coloridos em posições diferentes da tela.',
    resultado: 'A tela mostra uma pequena constelação de pontos.',
    conceito: 'Antes de animar, é útil entender coordenadas x e y.',
    desafio: 'Adicione mais pontos e forme uma letra.',
    cpp: k10Cpp(k10Tela, 'k10.canvas->canvasClear();\nk10.canvas->canvasPoint(40, 40, 0xFFFFFF);\nk10.canvas->canvasPoint(120, 90, 0xFFCC00);\nk10.canvas->canvasPoint(200, 160, 0x00CCBB);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'screen.fill_circle(x=40, y=40, r=3, color=0xFFFFFF)\nscreen.fill_circle(x=120, y=90, r=3, color=0xFFCC00)\nscreen.fill_circle(x=200, y=160, r=3, color=0x00CCBB)\nscreen.show_draw()\n',
  },
  {
    nome: 'Linhas e formas', objetivo: 'Desenhe uma linha, um círculo e um retângulo.',
    resultado: 'A tela mostra formas básicas em cores diferentes.',
    conceito: 'Gráficos são combinados por formas simples: linha, círculo e retângulo.',
    desafio: 'Mude as coordenadas para desenhar uma casa.',
    cpp: k10Cpp(k10Tela, 'k10.canvas->canvasClear();\nk10.canvas->canvasLine(10, 20, 220, 20, 0xFFFFFF);\nk10.canvas->canvasCircle(80, 120, 30, 0x00CCBB, 0x00CCBB, false);\nk10.canvas->canvasRectangle(130, 90, 70, 60, 0xFFCC00, 0xFFCC00, false);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'screen.draw_line(x0=10, y0=20, x1=220, y1=20, color=0xFFFFFF)\nscreen.draw_circle(x=80, y=120, r=30, color=0x00CCBB)\nscreen.draw_rect(x=130, y=90, w=70, h=60, color=0xFFCC00)\nscreen.show_draw()\n',
  },
  {
    nome: 'Animação horizontal', objetivo: 'Anime uma bolinha atravessando a tela.',
    resultado: 'A bolinha se move da esquerda para a direita em loop.',
    conceito: 'Animação é a repetição rápida de limpar, desenhar e atualizar.',
    desafio: 'Troque a velocidade alterando o incremento de x.',
    cpp: k10CppExtra('', 'int x = 0;', k10Tela, 'k10.canvas->canvasClear();\nk10.canvas->canvasCircle(x, 120, 12, 0x00FF00, 0x00FF00, true);\nk10.canvas->updateCanvas();\nx = x + 8;\nif (x > 240) x = 0;\ndelay(50);'),
    micropython: k10PyTela + 'import time\n\nx = 0\nwhile True:\n    screen.clear()\n    screen.fill_circle(x=x, y=120, r=12, color=0x00FF00)\n    screen.show_draw()\n    x = x + 8\n    if x > 240:\n        x = 0\n    time.sleep(0.05)\n',
  },
  {
    nome: 'Sprite com botões', objetivo: 'Controle um quadrado na tela com A e B.',
    resultado: 'A move para a esquerda e B move para a direita.',
    conceito: 'Um jogo começa quando entradas alteram a posição de um personagem.',
    desafio: 'Adicione limites para o quadrado não sair da tela.',
    cpp: k10CppExtra('', 'int x = 100;', k10Tela, 'if (k10.buttonA->isPressed()) x -= 5;\nif (k10.buttonB->isPressed()) x += 5;\nx = constrain(x, 0, 200);\nk10.canvas->canvasClear();\nk10.canvas->canvasRectangle(x, 130, 35, 35, 0x00CCBB, 0x00CCBB, true);\nk10.canvas->updateCanvas();\ndelay(40);'),
    micropython: k10PyTela + 'from unihiker_k10 import button\nimport time\n\nx = 100\na = button(button.a)\nb = button(button.b)\nwhile True:\n    if a.status():\n        x -= 5\n    if b.status():\n        x += 5\n    x = max(0, min(200, x))\n    screen.clear()\n    screen.fill_rect(x=x, y=130, w=35, h=35, color=0x00CCBB)\n    screen.show_draw()\n    time.sleep(0.04)\n',
  },
  {
    nome: 'Mini game desvie', objetivo: 'Faça um alvo cair e mova o jogador com os botões.',
    resultado: 'Um bloco cai na tela enquanto o jogador se move na base.',
    conceito: 'Jogos usam atualização por quadro: posição, colisão e desenho.',
    desafio: 'Conte pontos quando o jogador evitar o bloco.',
    cpp: k10CppExtra('', 'int jogador = 100;\nint obstaculoY = 0;', k10Tela, 'if (k10.buttonA->isPressed()) jogador -= 5;\nif (k10.buttonB->isPressed()) jogador += 5;\njogador = constrain(jogador, 0, 200);\nobstaculoY += 6;\nif (obstaculoY > 320) obstaculoY = 0;\nk10.canvas->canvasClear();\nk10.canvas->canvasRectangle(110, obstaculoY, 30, 30, 0xFF0000, 0xFF0000, true);\nk10.canvas->canvasRectangle(jogador, 280, 40, 20, 0x00FF00, 0x00FF00, true);\nk10.canvas->updateCanvas();\ndelay(50);'),
    micropython: k10PyTela + 'from unihiker_k10 import button\nimport time\n\njogador = 100\nobstaculo_y = 0\na = button(button.a)\nb = button(button.b)\nwhile True:\n    if a.status():\n        jogador -= 5\n    if b.status():\n        jogador += 5\n    jogador = max(0, min(200, jogador))\n    obstaculo_y += 6\n    if obstaculo_y > 320:\n        obstaculo_y = 0\n    screen.clear()\n    screen.fill_rect(x=110, y=obstaculo_y, w=30, h=30, color=0xFF0000)\n    screen.fill_rect(x=jogador, y=280, w=40, h=20, color=0x00FF00)\n    screen.show_draw()\n    time.sleep(0.05)\n',
  },
  {
    nome: 'Prévia da câmera', objetivo: 'Ligue a imagem da câmera como fundo da tela.',
    resultado: 'A tela mostra a imagem capturada pela câmera integrada.',
    conceito: 'A câmera pode virar o fundo vivo sobre o qual desenhamos informações.',
    desafio: 'Aponte a placa para objetos diferentes e observe o enquadramento.',
    cpp: k10Cpp('k10.initScreen(2);\nk10.initBgCamerImage();\nk10.setBgCamerImage(true);\nk10.creatCanvas();', 'k10.canvas->canvasText("CAMERA", 1, 0x00FF00);\nk10.canvas->updateCanvas();\ndelay(500);'),
    micropython: k10PyTela + 'screen.draw_text(text="CAMERA", x=10, y=20, font_size=24, color=0x00FF00)\nscreen.draw_text(text="ative a camera no firmware", x=10, y=60, font_size=16, color=0xFFFFFF)\nscreen.show_draw()\n',
  },
  {
    nome: 'Moldura para foto', objetivo: 'Desenhe uma moldura sobre a prévia da câmera.',
    resultado: 'A imagem da câmera recebe uma moldura colorida.',
    conceito: 'Sobreposições ajudam a guiar enquadramento e destacar regiões.',
    desafio: 'Mude a posição da moldura para destacar outro ponto.',
    cpp: k10Cpp('k10.initScreen(2);\nk10.initBgCamerImage();\nk10.setBgCamerImage(true);\nk10.creatCanvas();', 'k10.canvas->canvasRectangle(30, 50, 180, 180, 0xFFCC00, 0x000000, false);\nk10.canvas->canvasText("enquadre", 1, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(500);'),
    micropython: k10PyTela + 'screen.draw_rect(x=30, y=50, w=180, h=180, color=0xFFCC00)\nscreen.draw_text(text="enquadre", x=10, y=20, font_size=22, color=0xFFFFFF)\nscreen.show_draw()\n',
  },
  {
    nome: 'Foto no microSD', objetivo: 'Use o botão A para salvar uma foto no cartão microSD.',
    resultado: 'Ao pressionar A, a K10 salva S:/photo.bmp.',
    conceito: 'Projetos de câmera precisam de armazenamento para registrar imagens.',
    desafio: 'Depois da foto, pressione B na próxima fase para exibir o arquivo salvo.',
    cpp: k10Cpp('k10.initScreen(2);\nk10.initBgCamerImage();\nk10.setBgCamerImage(true);\nk10.creatCanvas();\nk10.initSDFile();', 'if (k10.buttonA->isPressed()) {\n  k10.photoSaveToTFCard("S:/photo.bmp");\n  k10.canvas->canvasText("foto salva", 1, 0x00FF00);\n  k10.canvas->updateCanvas();\n  delay(1000);\n}\ndelay(50);'),
    micropython: k10PyTela + 'from unihiker_k10 import button\nimport time\n\na = button(button.a)\nwhile True:\n    if a.status():\n        print("salvar foto no microSD")\n    time.sleep(0.05)\n',
  },
  {
    nome: 'Exibindo a foto', objetivo: 'Use B para mostrar a imagem salva no microSD.',
    resultado: 'A tela carrega a imagem S:/photo.bmp, se ela existir no cartão.',
    conceito: 'Ler arquivos permite recuperar o que o projeto gravou antes.',
    desafio: 'Teste o que acontece se ainda não houver foto salva.',
    cpp: k10Cpp('k10.initScreen(2);\nk10.creatCanvas();\nk10.initSDFile();', 'if (k10.buttonB->isPressed()) {\n  k10.canvas->canvasDrawImage(0, 0, "S:/photo.bmp");\n  k10.canvas->updateCanvas();\n  delay(1000);\n}\ndelay(50);'),
    micropython: k10PyTela + 'from unihiker_k10 import button\nimport time\n\nb = button(button.b)\nwhile True:\n    if b.status():\n        print("mostrar foto do microSD")\n    time.sleep(0.05)\n',
  },
  {
    nome: 'QR Code na tela', objetivo: 'Mostre um QR Code com um texto ou link.',
    resultado: 'A tela exibe um QR Code gerado pela própria K10.',
    conceito: 'Um código visual pode conectar a placa a celulares, páginas e dados.',
    desafio: 'Troque o texto por um link do seu projeto.',
    cpp: k10Cpp('k10.initScreen(2);\nk10.creatCanvas();\nk10.canvasDrawCode("https://www.unihiker.com");\nk10.canvas->updateCanvas();', 'delay(1000);'),
    micropython: k10PyTela + 'screen.draw_qr_code(text="https://www.unihiker.com", x=35, y=45, size=6)\nscreen.show_draw()\n',
  },
  {
    nome: 'Preparando o microSD', objetivo: 'Inicialize o cartão microSD e avise na tela.',
    resultado: 'A tela mostra microSD pronto após a inicialização.',
    conceito: 'Antes de usar arquivos, o programa precisa preparar o sistema de armazenamento.',
    desafio: 'Remova o cartão e observe como o projeto se comporta.',
    cpp: k10Cpp(k10Tela + '\nk10.initSDFile();', 'k10.canvas->canvasClear();\nk10.canvas->canvasText("microSD", 1, 0x00CCBB);\nk10.canvas->canvasText("pronto", 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'screen.draw_text(text="microSD", x=10, y=20, font_size=24, color=0x00CCBB)\nscreen.draw_text(text="pronto", x=10, y=60, font_size=24, color=0xFFFFFF)\nscreen.show_draw()\n',
  },
  {
    nome: 'Gravador de áudio', objetivo: 'Use A para gravar 3 segundos de áudio no microSD.',
    resultado: 'A K10 salva S:/sound.wav quando A é pressionado.',
    conceito: 'Áudio gravado é um arquivo: precisa de microfone, tempo e cartão.',
    desafio: 'Mude a duração para 5 segundos.',
    cpp: k10CppExtra('', 'Music music;', k10Tela + '\nk10.initSDFile();', 'if (k10.buttonA->isPressed()) {\n  k10.canvas->canvasText("gravando", 1, 0xFFCC00);\n  k10.canvas->updateCanvas();\n  music.recordSaveToTFCard("S:/sound.wav", 3);\n  k10.canvas->canvasText("salvo", 1, 0x00FF00);\n  k10.canvas->updateCanvas();\n}\ndelay(100);'),
    micropython: k10PyTela + 'from unihiker_k10 import button\nimport time\n\na = button(button.a)\nwhile True:\n    if a.status():\n        print("gravar sound.wav")\n    time.sleep(0.1)\n',
  },
  {
    nome: 'Tocando áudio do cartão', objetivo: 'Use B para tocar o arquivo S:/sound.wav.',
    resultado: 'A K10 reproduz o áudio salvo no microSD.',
    conceito: 'O mesmo arquivo gravado pode voltar como saída sonora.',
    desafio: 'Combine esta fase com a anterior para criar um gravador de bolso.',
    cpp: k10CppExtra('', 'Music music;', k10Tela + '\nk10.initSDFile();', 'if (k10.buttonB->isPressed()) {\n  k10.canvas->canvasText("tocando", 1, 0x00CCBB);\n  k10.canvas->updateCanvas();\n  music.playTFCardAudio("S:/sound.wav");\n}\ndelay(100);'),
    micropython: k10PyTela + 'from unihiker_k10 import button\nimport time\n\nb = button(button.b)\nwhile True:\n    if b.status():\n        print("tocar sound.wav")\n    time.sleep(0.1)\n',
  },
  {
    nome: 'Imagem do cartão', objetivo: 'Carregue uma imagem BMP do microSD para a tela.',
    resultado: 'A tela tenta exibir S:/photo.bmp.',
    conceito: 'Arquivos de imagem permitem personalizar interfaces e jogos.',
    desafio: 'Use a câmera para criar o arquivo antes de carregar.',
    cpp: k10Cpp(k10Tela + '\nk10.initSDFile();', 'k10.canvas->canvasDrawImage(0, 0, "S:/photo.bmp");\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'screen.draw_text(text="imagem: photo.bmp", x=10, y=20, font_size=20, color=0xFFFFFF)\nscreen.show_draw()\n',
  },
  {
    nome: 'Diário de sensores', objetivo: 'Monte a ideia de registrar leituras em arquivo no microSD.',
    resultado: 'A tela mostra REGISTRO e o Monitor Serial imprime uma linha de dados.',
    conceito: 'Registrar dados cria histórico para comparar depois, como em uma mini estação científica.',
    desafio: 'Depois, transforme a linha impressa em uma gravação real em arquivo.',
    cpp: k10Cpp('Serial.begin(115200);\n' + k10Tela + '\nk10.initSDFile();', 'int luz = k10.readALS();\nSerial.print("luz,");\nSerial.println(luz);\nk10.canvas->canvasClear();\nk10.canvas->canvasText("REGISTRO", 1, 0x00FF00);\nk10.canvas->canvasText(String(luz), 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'import time\n\nwhile True:\n    luz = 520\n    print("luz,", luz)\n    screen.clear()\n    screen.draw_text(text="REGISTRO", x=10, y=20, font_size=24, color=0x00FF00)\n    screen.draw_text(text=str(luz), x=10, y=60, font_size=24, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
  {
    nome: 'Escaneando redes Wi‑Fi', objetivo: 'Procure redes Wi‑Fi próximas e mostre a quantidade encontrada.',
    resultado: 'A tela mostra quantas redes a K10 encontrou.',
    conceito: 'Antes de conectar, a placa pode observar o ambiente sem saber a senha.',
    desafio: 'Compare a contagem em salas diferentes.',
    cpp: k10CppExtra('#include <WiFi.h>', '', k10Tela + '\nWiFi.mode(WIFI_STA);\nWiFi.disconnect();\ndelay(100);', 'int redes = WiFi.scanNetworks();\nk10.canvas->canvasClear();\nk10.canvas->canvasText("REDES WIFI", 1, 0x00CCBB);\nk10.canvas->canvasText(String(redes), 2, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(4000);'),
    micropython: k10PyTela + 'import network\nimport time\n\nwifi = network.WLAN(network.STA_IF)\nwifi.active(True)\nwhile True:\n    redes = wifi.scan()\n    screen.clear()\n    screen.draw_text(text="REDES WIFI", x=10, y=20, font_size=22, color=0x00CCBB)\n    screen.draw_text(text=str(len(redes)), x=10, y=65, font_size=32, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(4)\n',
  },
  {
    nome: 'Nome das redes', objetivo: 'Mostre no Monitor Serial os nomes das redes encontradas.',
    resultado: 'O Monitor Serial lista SSIDs próximos.',
    conceito: 'Nem todo resultado cabe bem na tela. O Monitor Serial ajuda a inspecionar listas.',
    desafio: 'Quantas redes aparecem com nome vazio?',
    cpp: k10CppExtra('#include <WiFi.h>', '', 'Serial.begin(115200);\nWiFi.mode(WIFI_STA);\nWiFi.disconnect();\ndelay(100);', 'int redes = WiFi.scanNetworks();\nfor (int i = 0; i < redes; i++) {\n  Serial.println(WiFi.SSID(i));\n}\nSerial.println("---");\ndelay(5000);'),
    micropython: 'import network\nimport time\n\nwifi = network.WLAN(network.STA_IF)\nwifi.active(True)\nwhile True:\n    for rede in wifi.scan():\n        print(rede[0])\n    print("---")\n    time.sleep(5)\n',
  },
  {
    nome: 'Painel de conexão', objetivo: 'Prepare um painel que mostra se a K10 está conectada ao Wi‑Fi.',
    resultado: 'A tela mostra OFFLINE até receber dados de uma rede configurada.',
    conceito: 'Projetos IoT precisam mostrar estado de conexão para facilitar testes.',
    desafio: 'Coloque o nome e a senha da sua rede no Editor e teste.',
    cpp: k10CppExtra('#include <WiFi.h>', '', k10Tela + '\nconst char* ssid = "SUA_REDE";\nconst char* senha = "SUA_SENHA";\nWiFi.begin(ssid, senha);', 'k10.canvas->canvasClear();\nif (WiFi.status() == WL_CONNECTED) {\n  k10.canvas->canvasText("ONLINE", 1, 0x00FF00);\n  k10.canvas->canvasText(WiFi.localIP().toString(), 2, 0xFFFFFF);\n} else {\n  k10.canvas->canvasText("OFFLINE", 1, 0xFF0000);\n}\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'import network\nimport time\n\nwifi = network.WLAN(network.STA_IF)\nwifi.active(True)\n# wifi.connect("SUA_REDE", "SUA_SENHA")\nwhile True:\n    screen.clear()\n    texto = "ONLINE" if wifi.isconnected() else "OFFLINE"\n    screen.draw_text(text=texto, x=10, y=20, font_size=28, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
  {
    nome: 'Dados para a internet', objetivo: 'Monte uma mensagem com leituras para enviar a um serviço online.',
    resultado: 'O Monitor Serial imprime uma linha pronta com chave e valor.',
    conceito: 'Antes de enviar pela rede, organize os dados em um formato simples.',
    desafio: 'Inclua temperatura e umidade na mensagem.',
    cpp: k10Cpp('Serial.begin(115200);', 'int luz = k10.readALS();\nString mensagem = "luz=" + String(luz);\nSerial.println(mensagem);\ndelay(1000);'),
    micropython: 'import time\n\nwhile True:\n    luz = 520\n    mensagem = "luz=" + str(luz)\n    print(mensagem)\n    time.sleep(1)\n',
  },
  {
    nome: 'Monitor IoT local', objetivo: 'Combine tela, Wi‑Fi e sensor de luz em um painel final.',
    resultado: 'A tela mostra rede ligada/desligada e o valor de luz.',
    conceito: 'Um projeto IoT útil informa o estado da rede e o dado principal ao mesmo tempo.',
    desafio: 'Depois, use esse painel como base para uma estufa inteligente.',
    cpp: k10CppExtra('#include <WiFi.h>', '', k10Tela + '\nWiFi.mode(WIFI_STA);', 'int luz = k10.readALS();\nk10.canvas->canvasClear();\nk10.canvas->canvasText("IOT K10", 1, 0x00CCBB);\nk10.canvas->canvasText(WiFi.status() == WL_CONNECTED ? "ONLINE" : "SEM REDE", 2, WiFi.status() == WL_CONNECTED ? 0x00FF00 : 0xFF0000);\nk10.canvas->canvasText("LUZ " + String(luz), 3, 0xFFFFFF);\nk10.canvas->updateCanvas();\ndelay(1000);'),
    micropython: k10PyTela + 'import network\nimport time\n\nwifi = network.WLAN(network.STA_IF)\nwifi.active(True)\nwhile True:\n    luz = 520\n    screen.clear()\n    screen.draw_text(text="IOT K10", x=10, y=20, font_size=24, color=0x00CCBB)\n    screen.draw_text(text="ONLINE" if wifi.isconnected() else "SEM REDE", x=10, y=60, font_size=22, color=0xFFFFFF)\n    screen.draw_text(text="LUZ " + str(luz), x=10, y=100, font_size=22, color=0xFFFFFF)\n    screen.show_draw()\n    time.sleep(1)\n',
  },
]);

K10_ATIVIDADES.push(...[
  {
    nome: 'Ligando o primeiro motor', objetivo: 'Ligue o motor conectado à porta M1 do driver de motores da DFRobot.',
    resultado: 'O motor em M1 gira continuamente para frente assim que o programa é carregado.',
    conceito: 'A placa de expansão de motores da DFRobot usa um circuito PCA9685, que conversa com a K10 pelo mesmo barramento I2C (SDA/SCL) usado pelos sensores internos. Cada motor DC ocupa dois canais do PCA9685: um liga o sentido para frente, o outro o sentido para trás.',
    desafio: 'Troque os números 7 e 6 de lugar na chamada motor(7, 6, ...). O que muda no motor?',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit + '\nmotor(7, 6, 3000); // M1: canal 7 = frente, canal 6 = ré'),
    micropython: 'import time\n\n# O driver de motores da DFRobot fala por I2C com um chip PCA9685.\n# Este exemplo mostra a ideia: ligar o motor M1 para a frente.\nprint("Motor M1 ligado para frente")\nwhile True:\n    time.sleep(1)\n',
  },
  {
    nome: 'Frente, ré e parar', objetivo: 'Alterne o motor M1 entre girar para frente, girar para trás e parar.',
    resultado: 'O motor gira 2 segundos para frente, 2 segundos para trás e fica 1 segundo parado, repetindo.',
    conceito: 'Para inverter o sentido de um motor DC basta trocar qual dos dois canais recebe o sinal PWM. Para parar, os dois canais ficam em zero.',
    desafio: 'Troque a velocidade 3000 por um valor menor, como 800. O motor ainda gira?',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit, 'motor(7, 6, 3000);\ndelay(2000);\nmotor(7, 6, -3000);\ndelay(2000);\npararMotor(7, 6);\ndelay(1000);'),
    micropython: 'import time\n\nprint("Motor M1: frente")\ntime.sleep(2)\nprint("Motor M1: ré")\ntime.sleep(2)\nprint("Motor M1: parado")\ntime.sleep(1)\n',
  },
  {
    nome: 'Carro com 2 motores', objetivo: 'Ligue dois motores (M1 e M2) para montar um carrinho de duas rodas motrizes.',
    resultado: 'Os dois motores giram juntos para frente, movendo o carrinho em linha reta.',
    conceito: 'Um carrinho de duas rodas motrizes usa um motor de cada lado. Quando os dois giram na mesma velocidade e no mesmo sentido, o carrinho anda reto.',
    desafio: 'Coloque velocidades diferentes nos dois motores. O carrinho anda reto ou faz uma curva?',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit + '\nmotor(7, 6, 3000); // M1 - lado esquerdo\nmotor(5, 4, 3000); // M2 - lado direito'),
    micropython: 'import time\n\nprint("Carro 2 motores: em frente")\nwhile True:\n    time.sleep(1)\n',
  },
  {
    nome: 'Carro com 2 motores: curvas', objetivo: 'Faça o carrinho de 2 motores andar reto, virar à direita e virar à esquerda.',
    resultado: 'O carrinho anda reto, depois vira à direita e à esquerda, variando a velocidade de cada lado.',
    conceito: 'Para virar, um lado do carrinho gira mais devagar (ou ao contrário) que o outro. Quanto maior a diferença, mais fechada a curva.',
    desafio: 'Coloque os dois motores em sentidos opostos. O que acontece com o carrinho?',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit, 'motor(7, 6, 3000); motor(5, 4, 3000); // reto\ndelay(1500);\nmotor(7, 6, 1000); motor(5, 4, 3000); // direita\ndelay(1000);\nmotor(7, 6, 3000); motor(5, 4, 1000); // esquerda\ndelay(1000);'),
    micropython: 'import time\n\nprint("reto"); time.sleep(1.5)\nprint("direita"); time.sleep(1)\nprint("esquerda"); time.sleep(1)\n',
  },
  {
    nome: 'Carro com 4 motores', objetivo: 'Ligue os quatro motores (M1 a M4) para um carrinho 4x4.',
    resultado: 'As quatro rodas giram juntas para frente.',
    conceito: 'Um carrinho 4x4 usa um motor por roda. As quatro chamadas a motor() controlam cada canto do carrinho, usando os quatro pares de canais do PCA9685.',
    desafio: 'Pare somente os motores de trás (M3 e M4) com pararMotor() e observe o que acontece com o carrinho.',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit + '\nmotor(7, 6, 3000); // M1\nmotor(5, 4, 3000); // M2\nmotor(3, 2, 3000); // M3\nmotor(1, 0, 3000); // M4'),
    micropython: 'import time\n\nprint("Carro 4x4: em frente")\nwhile True:\n    time.sleep(1)\n',
  },
]);

K10_ATIVIDADES.push(...[
  {
    nome: 'Primeiro movimento do servo', objetivo: 'Centralize o servo motor conectado à porta S1 do driver em 90 graus.',
    resultado: 'O eixo do servo vai para a posição central (90 graus) e permanece lá.',
    conceito: 'Um servo motor recebe um pulso PWM cuja duração define o ângulo do eixo, de 0 a 180 graus. O driver da DFRobot calcula esse pulso a partir do ângulo pedido.',
    desafio: 'Troque 90 por 0 e depois por 180. Para onde o eixo aponta em cada caso?',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit + '\nservoGrau(15, 90); // porta S1 do driver'),
    micropython: 'import time\n\nprint("Servo S1 centralizado em 90 graus")\nwhile True:\n    time.sleep(1)\n',
  },
  {
    nome: 'Varredura de 0 a 180', objetivo: 'Faça o servo varrer lentamente de 0 a 180 graus e voltar.',
    resultado: 'O eixo do servo se move suavemente de um lado a outro, repetidamente.',
    conceito: 'Repetir pequenos incrementos de ângulo, com uma pequena pausa entre eles, cria a sensação de movimento suave.',
    desafio: 'Aumente o delay de 15 para 40 milissegundos. O movimento fica mais lento ou mais rápido?',
    cpp: k10CppExtra(k10MotorExtras, 'int grauServo = 0;\nint passoServo = 1;', k10PcaInit, 'servoGrau(15, grauServo);\ngrauServo += passoServo;\nif (grauServo >= 180 || grauServo <= 0) passoServo = -passoServo;\ndelay(15);'),
    micropython: 'import time\n\ngrau = 0\npasso = 1\nwhile True:\n    print("Servo:", grau)\n    grau += passo\n    if grau >= 180 or grau <= 0:\n        passo = -passo\n    time.sleep(0.015)\n',
  },
  {
    nome: 'Servo controlado pelos botões', objetivo: 'Use os botões A e B para diminuir e aumentar o ângulo do servo.',
    resultado: 'O botão A move o eixo para um lado, o B move para o outro, sempre entre 0 e 180 graus.',
    conceito: 'Uma variável guarda o ângulo atual do servo; cada botão altera essa variável antes de enviá-la para o servo.',
    desafio: 'Mude o incremento de 5 para 20 graus por toque e compare a resposta.',
    cpp: k10CppExtra(k10MotorExtras, 'int grauServo = 90;', k10PcaInit, 'if (k10.buttonA->isPressed()) grauServo -= 5;\nif (k10.buttonB->isPressed()) grauServo += 5;\ngrauServo = constrain(grauServo, 0, 180);\nservoGrau(15, grauServo);\ndelay(80);'),
    micropython: 'from unihiker_k10 import button\nimport time\n\na = button(button.a)\nb = button(button.b)\ngrau = 90\nwhile True:\n    if a.status():\n        grau -= 5\n    if b.status():\n        grau += 5\n    grau = max(0, min(180, grau))\n    print("Servo:", grau)\n    time.sleep(0.08)\n',
  },
  {
    nome: 'Servo reagindo à luz', objetivo: 'Use o sensor de luminosidade da K10 para controlar o ângulo do servo.',
    resultado: 'Em ambiente escuro o servo fica perto de 0 grau; com bastante luz, perto de 180 graus.',
    conceito: 'Mapear uma faixa de valores (luz) para outra faixa (ângulo) transforma uma leitura de sensor em movimento.',
    desafio: 'Troque os limites 0 e 1000 pela faixa de luz observada na sua sala.',
    cpp: k10CppExtra(k10MotorExtras, '', k10PcaInit, 'int luz = k10.readALS();\nint grau = map(constrain(luz, 0, 1000), 0, 1000, 0, 180);\nservoGrau(15, grau);\ndelay(100);'),
    micropython: 'import time\n\nwhile True:\n    luz = 520\n    grau = max(0, min(180, int(luz / 1000 * 180)))\n    print("Luz:", luz, "Servo:", grau)\n    time.sleep(0.1)\n',
  },
  {
    nome: 'Projeto: braço apontador', objetivo: 'Combine um motor DC (M1) e o servo (S1) em um pequeno braço apontador.',
    resultado: 'O motor M1 gira devagar enquanto o servo varre de 0 a 180 graus, como um radar.',
    conceito: 'Projetos combinam vários atuadores no mesmo driver PCA9685: cada um usa seus próprios canais, mas compartilham a mesma inicialização do chip.',
    desafio: 'Adicione um terceiro atuador (outro motor ou servo) ao projeto.',
    cpp: k10CppExtra(k10MotorExtras, 'int grauServo = 0;\nint passoServo = 2;', k10PcaInit + '\nmotor(7, 6, 1500); // M1 gira devagar', 'servoGrau(15, grauServo);\ngrauServo += passoServo;\nif (grauServo >= 180 || grauServo <= 0) passoServo = -passoServo;\ndelay(20);'),
    micropython: 'import time\n\ngrau = 0\npasso = 2\nprint("Motor M1 ligado devagar")\nwhile True:\n    print("Servo:", grau)\n    grau += passo\n    if grau >= 180 or grau <= 0:\n        passo = -passo\n    time.sleep(0.02)\n',
  },
]);

function explicarLinhaK10(linha, linguagem) {
  const l = linha.trim();
  if (!l) return 'Linha em branco para organizar o programa.';
  if (/^#include|^from |^import /.test(l)) return 'Carrega a biblioteca usada para acessar estes recursos da K10.';
  if (/^#define/.test(l)) return 'Define um valor fixo (endereço ou registrador do chip PCA9685) para deixar o código mais fácil de ler.';
  if (/UNIHIKER_K10 k10/.test(l)) return 'Cria o objeto k10, que reúne os controles da placa.';
  if (/void setup/.test(l)) return 'Inicia a preparação, executada uma única vez.';
  if (/void loop|while True/.test(l)) return 'Repete as leituras e respostas enquanto a placa estiver ligada.';
  if (/k10.begin/.test(l)) return 'Inicializa os recursos da placa K10.';
  if (/initScreen|screen.init/.test(l)) return 'Prepara a tela na orientação 2.';
  if (/creatCanvas/.test(l)) return 'Cria a área em que vamos desenhar o conteúdo.';
  if (/setScreenBackground|show_bg/.test(l)) return 'Define a cor de fundo usando o valor 0xRRGGBB.';
  if (/updateCanvas|show_draw/.test(l)) return 'Mostra na tela o desenho que acabou de ser preparado.';
  if (/canvasClear|screen.clear/.test(l)) return 'Limpa o desenho anterior antes de mostrar o próximo estado.';
  if (/canvasText|draw_text/.test(l)) return linguagem === 'cpp' ? 'Escreve a mensagem na linha indicada, com a cor escolhida.' : 'Escreve a mensagem nas coordenadas x e y, com o tamanho e a cor indicados.';
  if (/brightness/.test(l)) return 'Ajusta o brilho dos LEDs para um valor moderado.';
  if (/rgb.*write/.test(l)) return 'Define a cor do LED indicado. O valor 0x000000 apaga; sem índice no MicroPython ou -1 no C++ seleciona todos.';
  if (/rgb.clear/.test(l)) return 'Apaga os três LEDs RGB.';
  if (/button\(button\./.test(l)) return 'Cria uma referência ao botão integrado para consultar seu estado.';
  if (/^} else if|^elif|^if /.test(l)) return 'Testa a condição e executa este bloco quando ela é verdadeira.';
  if (/else/.test(l)) return 'Executa esta alternativa quando a condição anterior não é atendida.';
  if (/delay\(|time.sleep/.test(l)) return linguagem === 'cpp' ? 'Espera o intervalo em milissegundos antes de continuar.' : 'Espera o intervalo em segundos antes de continuar.';
  if (/Serial.begin/.test(l)) return 'Configura a comunicação serial em 115200 baud.';
  if (/Serial.println|print\(/.test(l)) return 'Envia uma mensagem ao Monitor Serial.';
  if (/^(void|uint8_t) (pca|motor|pararMotor|servoGrau)/.test(l)) return 'Declara uma função auxiliar que fala com o driver de motores PCA9685 pelo barramento I2C.';
  if (/^Wire\./.test(l)) return 'Envia ou lê um byte pelo barramento I2C, conversando diretamente com o chip PCA9685.';
  if (/pcaFrequencia\(/.test(l)) return 'Define a frequência do sinal PWM (em Hz) usada pelos motores e servos do driver.';
  if (/pararMotor\(/.test(l)) return 'Para o motor colocando os dois canais PWM em zero.';
  if (/\bmotor\(/.test(l)) return 'Liga o motor: define a velocidade e o sentido combinando os dois canais PWM do driver.';
  if (/servoGrau\(/.test(l)) return 'Envia ao servo o ângulo desejado, convertido no pulso PWM que o driver entende.';
  if (/grauServo/.test(l)) return 'Guarda o ângulo atual do servo para acompanhar o movimento de uma repetição para a outra.';
  if (/passoServo/.test(l)) return 'Guarda se o ângulo deve aumentar ou diminuir na próxima repetição, criando o efeito de vaivém.';
  if (/map\(/.test(l)) return 'Converte um valor de uma faixa (como a luz) para outra faixa (como o ângulo do servo).';
  if (/constrain\(/.test(l)) return 'Limita um valor para não ultrapassar a faixa permitida.';
  if (/^}$/.test(l)) return 'Fecha o bloco de instruções.';
  return 'Guarda um texto na variável para usá-lo na exibição. Altere o valor e observe o resultado.';
}

function criarCursoK10(linguagem) {
  return K10_ATIVIDADES.map((a, i) => {
    const modulo = K10_MODULOS[Math.floor(i / 5)] || K10_MODULOS[K10_MODULOS.length - 1];
    const solucao = a[linguagem];
    const icone = { img: modulo.icone };
    return {
      id: `k10_${i + 1}`, setor: modulo.id, nome: a.nome, missao: `Missão ${i % 5 + 1}`, xp: i % 5 === 4 ? 30 : 20,
      iconeSetor: modulo.icone, iconeObjetivo: icone, iconeDica: 'icone_void_setup.png', kit: [],
      objetivo: a.objetivo, dica: a.desafio, resultado: a.resultado,
      conceito: { titulo: a.nome, imagem: 'boards/k10.jpg', texto: [a.conceito, '**Na placa:** ' + a.resultado] },
      secoes: [{ titulo: linguagem === 'cpp' ? 'C++ · Arduino' : 'MicroPython · atenção à indentação', linhas: solucao.trimEnd().split('\n').filter(l => l.trim()).map(codigo => ({ codigo, explicacao: explicarLinhaK10(codigo, linguagem), icone })) }],
      solucao, starter: linguagem === 'cpp' ? k10Cpp('') : '# Escreva seu programa MicroPython aqui.\n',
    };
  });
}
