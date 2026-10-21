# MIDE EDU — Arduino Uno + UNIHIKER K10 + LEGO Technic + BBC micro:bit V2

**MIDE** = *Multipurpose Integrated Development Environment for Education*.

IDE gamificada que roda no navegador, com seleção inicial entre **Arduino Uno**,
**UNIHIKER K10**, **LEGO Technic (Pybricks)** e **BBC micro:bit V2** — esta última para o hub do
Liebherr LR 13000 (42146), veja a seção **12** — e **BBC micro:bit V2**, com blocos,
JavaScript e MicroPython (seção **13**). O currículo Arduino Uno mantém os 8 módulos e 40 missões do
mod `arduino_edu`; o curso K10 traz 10 módulos e 50 atividades, disponíveis
em **C++** e **MicroPython**.

A interface traz menus completos, painel de instrução, Modo Treinamento linha por
linha, código completo para projetos maiores, Monitor Serial, Traçador Serial e
upload para a placa real quando a linguagem/firmware da placa estiver preparada.

---

## 1. Como usar (dia a dia)

1. Ligue a placa no cabo USB.
2. Dê **dois cliques em `MIDE EDU.vbs`**.
   **Nenhuma janela preta aparece** — o navegador abre sozinho em
   `http://127.0.0.1:8080`.
3. Escolha a placa na tela inicial. Para a K10, escolha também **C++** ou
   **MicroPython**.
4. Escolha o módulo e a missão à esquerda, leia a instrução e clique em
   **Começar o treinamento**; digite o código linha por linha. Na K10, a aba
   **Código completo** mostra o programa pronto para enviar sem digitação.
5. Quando o código estiver completo, o botão **Upload** (na barra do editor)
   começa a piscar. Clique nele — o programa é compilado e gravado na placa.
6. Para encerrar: **Arquivo → Sair** dentro da própria IDE. Não precisa fazer nada:
   se você só fechar a aba, o servidor se desliga sozinho depois de 15 minutos.

> Crie um atalho do `MIDE EDU.vbs` na Área de Trabalho e mande os
> alunos usarem só ele.

**Zoom:** os botões `A−` `A+` `⟲` no topo do painel da direita aumentam ao mesmo
tempo o código, a instrução e a caixa de digitação (80% a 200%), também com
`Ctrl +`, `Ctrl −` e `Ctrl 0`.

**Tema:** claro por padrão. O botão de sol/lua na barra de cima (ou **Arquivo →
Preferências**) troca para o escuro. A escolha fica salva naquele computador.

**Navegação:** use Início, Módulos, Projetos, Conquistas e Ajuda no cabeçalho.
O botão **Modo Professor** permite liberar as missões para demonstrações.
Os indicadores de XP e medalhas usam o progresso salvo, sem dados de demonstração.
Em telas pequenas, o currículo, o código e a instrução ficam empilhados e acessíveis.

**UNIHIKER K10:** o curso usa fotos reais na seleção de placas e oferece o mesmo
conteúdo em C++ e MicroPython. O progresso de cada linguagem fica separado. Em
C++, a IDE instala/usa o pacote oficial UNIHIKER; em MicroPython, a placa precisa
estar com o firmware MicroPython específico da K10.

---

## 2. Os menus

Abra **•••**, ao lado de Upload, para acessar os menus da IDE.
Todos funcionam de verdade, com os mesmos nomes do Arduino IDE.

| Menu | O que tem |
|---|---|
| **Arquivo** | Novo sketch · Abrir… · **Exemplos** (as 40 missões prontas, por módulo) · Salvar como… · Preferências… · Sair |
| **Editar** | Desfazer/Refazer · Recortar/Copiar/Colar · Selecionar tudo · Comentar/Descomentar · Localizar e substituir · Aumentar/diminuir o texto |
| **Sketch** | Verificar/Compilar · Carregar · Exportar binário compilado / Salvar `main.py` · Incluir biblioteca · Gerenciar bibliotecas… |
| **Ferramentas** | Formatação automática · **Monitor Serial** · **Traçador Serial** · Placa · Porta · Obter informações da placa · Gerenciar bibliotecas · Gerenciador de placas (na placa LEGO: Conectar hub · Parar o programa do hub) |
| **Ajuda** | Guia de introdução · Referência rápida do Arduino · Atalhos de teclado · **Modo professor** · Solução de problemas · Sobre |

### Atalhos

| Atalho | Ação |
|---|---|
| `Ctrl + R` | Verificar (compilar sem gravar) |
| `Ctrl + U` | Carregar para a placa |
| `Ctrl + Shift + M` | Monitor Serial |
| `Ctrl + O` / `Ctrl + S` | Abrir / Salvar como |
| `Alt + N` | Novo sketch (o `Ctrl+N` é capturado pelo navegador) |
| `Ctrl + F` | Localizar e substituir |
| `Ctrl + T` | Formatação automática |
| `Ctrl + /` | Comentar ou descomentar |
| `Ctrl + +` `Ctrl + −` `Ctrl + 0` | Tamanho do texto |
| `Ctrl + ,` | Preferências |

**Barra de carregamento:** ao compilar ou gravar, uma barra sobe na base da tela.
O fio vai se energizando e os elétrons correm por dentro dele, acelerando conforme
chega nos 100%. As fases (compilando → gravando) vêm do próprio `arduino-cli`, não
são enfeite. Verde quando termina, vermelha quando falha.

**XP:** só o **Modo Treinamento** dá XP e medalha. Gravar pelo **Editor C++** é
upload puro — nada de missão concluída, porque ali o código é do aluno.

---

## 3. Modo professor

**Ajuda → Modo professor…**, senha **7812**.

Libera duas coisas:

- **Todas as missões abertas.** A trava de progressão sai do caminho: dá para ir
  direto ao módulo do LCD ou do servo sem concluir os anteriores, para demonstrar
  em aula ou testar uma montagem.
- **Botão Pular** na faixa de digitação do Modo Treinamento: avança uma linha sem
  que ela precise ser digitada. As linhas puladas aparecem no placar (*Puladas N*)
  e na mensagem final ("2 linhas puladas"), então não se confunde com um
  treinamento completo.

Ao desligar, as missões voltam a desbloquear em ordem — o XP e as medalhas já
conquistados continuam como estavam.

Enquanto está ligado, um selo **MODO PROFESSOR** fica visível na barra de cima.
Para desligar, abra o mesmo item do menu e clique em *Desligar* — sem senha.
A escolha fica salva naquele computador, então desligue antes de entregar a
máquina para a turma.

---

## 4. Monitor Serial e Traçador Serial

Ficam no painel de baixo, ao lado da aba **Saída**.

- **Conectar** abre a porta escolhida na barra de cima, na velocidade do seletor
  (padrão 9600). Dá para enviar texto para a placa com a caixa de baixo,
  escolhendo o final de linha, igual ao Arduino IDE.
- O **Traçador Serial** lê os números de cada linha e desenha uma curva por
  coluna. Funciona com `Serial.println(valor)` e também com o formato
  `POT:512 DIST:30` — cada nome vira uma série na legenda.
- Durante o **upload**, o monitor fecha sozinho (a porta é uma só) e **reabre
  automaticamente** quando a gravação termina.

---

## 5. O currículo Arduino Uno

| # | Módulo | Missões | Conteúdo novo |
|---|--------|---------|----------------|
| 1 | LED — Saída Digital | 5 | `pinMode`, `digitalWrite`, `delay`, PWM (`analogWrite`), `digitalRead` |
| 2 | Botão — Entrada Digital | 5 | `INPUT_PULLUP`, `if/else`, Monitor Serial |
| 3 | Potenciômetro — Entrada Analógica | 5 | `analogRead`, variáveis, `map`, `constrain` |
| 4 | Ultrassônico — Distância | 5 | `pulseIn`, `delayMicroseconds`, cálculo de distância |
| 5 | Buzzer — Saída Sonora | 5 | `tone`, `noTone`, frequência por sensor |
| 6 | Servo Motor — Saída de Ângulo | 5 | `#include <Servo.h>`, `attach`, `write` |
| 7 | Display de 7 Segmentos | 5 | vetores, `for`, multiplexação de dígitos |
| 8 | LCD 16x2 — Saída de Texto | 5 | `LiquidCrystal`, `setCursor`, `print`, debounce |

São **696 linhas de código** para digitar, cada uma com o seu ícone e a sua
explicação. As missões desbloqueiam em ordem: a 2 só abre depois que a 1 for
gravada na placa. Cada gravação dá XP; 150 XP = 1 nível.

## 6. Currículo UNIHIKER K10

O currículo K10 tem duas linguagens:

| Módulo | Atividades | Conteúdo |
|---|---:|---|
| Conhecendo a K10 | 5 | tela, comunicação USB, texto, cores e cartão de apresentação |
| Botões e LEDs RGB | 5 | LEDs RGB, cores, botão A, botões A/B independentes e semáforo interativo |
| Luminosidade | 5 | sensor de luz, limites, barra de LEDs e alarme de sombra |
| Temperatura e umidade | 5 | AHT20, termômetro, conforto térmico, barra e estação climática |
| Acelerômetro e gestos | 5 | eixos, bolinha inclinável, shake, gestos e pedômetro |
| Microfone e alto-falante | 5 | microfone, vumeter, tons, piano e alarme sonoro |
| Tela e animação | 5 | pontos, formas, animação, sprite e mini game |
| Câmera e IA visual | 5 | prévia da câmera, moldura, foto no microSD, exibição e QR Code |
| Arquivos e microSD | 5 | inicialização, gravação, reprodução, imagem e diário de sensores |
| Wi‑Fi e comunicação | 5 | varredura, lista de redes, painel de conexão, mensagens e monitor IoT |

Cada atividade tem uma versão C++ e uma versão MicroPython. A aba **Código
completo** existe para que projetos maiores possam ser carregados direto na placa
sem exigir digitação longa do aluno.

A trilha de projetos depois disso seguirá a coletânea da DFRobot: cachorro de
estimação, tapa-toupeira, Walkman, supermercado automatizado, estufa inteligente,
assistente residencial, câmera mágica de IA, guardião do campus de IA e
alimentador automático de gatos.

---

## 7. Instalação (só uma vez por computador)

### 7.1 Python 3
Baixe em <https://www.python.org/downloads/> e, na instalação, **marque
"Add python.exe to PATH"**. O lançador usa o `pythonw`, que vem junto — é ele
que faz o servidor rodar sem janela.

### 7.2 arduino-cli
1. Baixe o **Windows 64 bit** em
   <https://arduino.github.io/arduino-cli/latest/installation/>
2. Coloque o `arduino-cli.exe` **dentro desta pasta**, ao lado do lançador.
3. Instale o núcleo do UNO (uma vez, com internet):

```
arduino-cli core update-index
arduino-cli core install arduino:avr
```

Depois disso, dá para instalar núcleos e bibliotecas pela própria IDE, em
**Ferramentas → Gerenciador de placas / Gerenciar bibliotecas**.

### 7.3 Bibliotecas dos módulos 6 e 8
Se algum sketch reclamar de `Servo.h` ou `LiquidCrystal.h`, use
**Ferramentas → Gerenciar bibliotecas**, procure pelo nome e instale.

### 7.4 Driver da placa (só para clones)
Clones com chip **CH340** precisam do driver CH341SER. A IDE mostra
"Arduino Uno (clone CH340)" quando reconhece o chip.

### 7.5 UNIHIKER K10

Na IDE, use **Preparar K10**. Para C++, a IDE usa o índice oficial da UNIHIKER e
o pacote `UNIHIKER:esp32` versão `0.0.5`. Para MicroPython, prepare a placa com o
firmware oficial da K10 antes de enviar arquivos `.py`.

---

## 8. O que tem dentro

```
ide_web/
├─ MIDE EDU.vbs   ← dois cliques aqui (sem janela preta)
├─ INICIAR.bat               alternativa, para passar opções (--porta 8090)
├─ PARAR.bat                 encerra o servidor à força, se precisar
├─ servidor.py               servidor local (só biblioteca padrão do Python)
├─ index.html                a IDE
├─ css/estilo.css            temas claro e escuro
├─ js/dados.js               currículo: as 40 fases portadas de fases.lua
├─ js/k10.js                 currículo da UNIHIKER K10
├─ js/boards.js              seleção Arduino Uno / UNIHIKER K10
├─ js/ide.js                 motor: instrução, treinamento, upload, XP, tema
├─ js/monitor.js             Monitor Serial e Traçador Serial
├─ js/barra.js               barra de carregamento com os elétrons
├─ js/menus.js               menus, diálogos e ações do Arduino IDE
├─ js/lego.js                placa LEGO: conectar o hub, enviar, parar, exemplos
├─ js/pybricks_ble.js        protocolo Bluetooth do Pybricks (Web Bluetooth)
├─ js/pybricks_mpy.js        compila Python → .mpy no navegador
├─ js/blocos_lego_*.js       blocos, toolbox e gerador Python do hub LEGO
├─ js/lego_exemplos.js       exemplos do menu Arquivo → Exemplos (LEGO)
├─ js/vendor/pybricks/       mpy-cross do Pybricks (WebAssembly, licença MIT)
├─ js/microbit*.js           placa micro:bit: USB, Bluetooth, hex, currículo, painel ao vivo, exemplos
├─ js/blocos_mb_*.js         blocos, toolbox, tema e geradores (JavaScript e MicroPython) da micro:bit
├─ js/vendor/microbit/       microbit-connection, microbit-fs e firmware MicroPython V2 (MIT)
├─ js/vendor/makecode/       compilador do MakeCode rodando no navegador, sem internet (MIT)
├─ cursos/microbit/          as 90 atividades em JavaScript e em MicroPython (geradas dos blocos)
├─ ROTEIRO-TESTE-MICROBIT.md teste ao vivo com a micro:bit, passo a passo
├─ js/vendor/blockly/        Blockly 13.3.0 (com a pasta media/, sem CDN)
├─ ferramentas/              testes em Node, só para desenvolvimento
├─ ROTEIRO-TESTE-LEGO.md     teste ao vivo com o hub, passo a passo
└─ assets/                   84 ícones e diagramas do mod, otimizados
```

O servidor escuta **apenas em 127.0.0.1**: nenhum outro computador da rede
enxerga a IDE. Ele grava um `servidor.log` nesta pasta — útil se algo falhar,
já que não há mais janela de console para ler.

---

## 9. Onde cada coisa veio do jogo

| No jogo (`mods/arduino_edu`) | Na IDE web |
|---|---|
| `F.FASES` (40 fases, fases.lua) | `FASES[]` em `js/dados.js` |
| `F.SETORES` | `MODULOS[]` |
| `F.ORDEM` / `F.is_unlocked` | desbloqueio linear na lista lateral |
| `fase.painel` | painel didático à direita |
| `fase.conceito` | primeira tela das missões com conceito novo |
| `fase.solucao` | alvo do Modo Treinamento |
| `fs_training` (board.lua) | faixa "Texto para digitar" + colorização |
| `TREINO_CARDS_UNIVERSAIS` | `CARDS_UNIVERSAIS` |
| `led_icone`, `pino_icone`, `delay_icone`, `if_else_icone`, `serial_icone`, `servo_icone`, `sensor_ultrassonico_icone`, `variavel_inteira_icone` | `resolverIcone()` — mesma ordem, mesmos arquivos |
| `tokenize_codigo` (tutorial_text.lua) | `tokenizar()` — mesmo dicionário fechado |
| XP, níveis e progressão travada | barra superior + lista de missões |
| "▶ Upload" (simulação) | Upload de verdade, via `arduino-cli` |

Regras de digitação iguais às do mod: o aluno **não digita a indentação**,
linha em branco só pede Enter, e cada caractere fica **verde** quando bate com
o alvo e **vermelho** quando não bate.

---

## 10. Problemas comuns

| Sintoma | O que fazer |
|---|---|
| "servidor local offline" na barra de baixo | Dê dois cliques no lançador de novo. |
| "arduino-cli não encontrado" | Coloque o `arduino-cli.exe` nesta pasta e reinicie. |
| "Nenhuma placa encontrada" | Cabo só de carga? Clique em ⟳. Clone precisa do driver CH340. |
| `Platform arduino:avr not found` | **Ferramentas → Gerenciador de placas**, procure `avr`, instale. |
| `Servo.h: No such file` | **Ferramentas → Gerenciar bibliotecas**, procure `Servo`, instale. |
| `programmer is not responding` | Feche o Arduino IDE (ele segura a porta) e tente de novo. |
| K10 não envia em C++ | Use **Preparar K10** para instalar o pacote oficial UNIHIKER e selecione a porta correta. |
| K10 não envia em MicroPython | A placa precisa estar com o firmware MicroPython oficial da K10. |
| LEGO: o hub não aparece na lista do Bluetooth | Hub ligado (luz piscando)? Remova o pareamento do hub nas configurações do Windows e feche o code.pybricks.com. Veja a seção 12. |
| LEGO: o botão “Conectar hub” está apagado | O navegador não tem Web Bluetooth. Abra a IDE no Google Chrome ou no Microsoft Edge. |
| A porta 8080 já está em uso | `INICIAR.bat --porta 8090` e acesse `http://127.0.0.1:8090`. |
| O servidor ficou rodando | `PARAR.bat`, ou espere 15 minutos — ele se desliga sozinho. |
| Progresso sumiu | O XP fica no navegador daquele computador; limpar dados do site zera. |

---

## 11. Como acrescentar ou corrigir conteúdo

`js/dados.js` é a fonte do currículo Arduino Uno, **gerado a partir do
`fases.lua`**. `js/k10.js` é a fonte do currículo UNIHIKER K10. Para corrigir um
texto, trocar um ícone ou acrescentar uma fase, edite o objeto correspondente;
o motor em `js/ide.js` lê os dois cursos.

---

## 12. LEGO Technic / Pybricks (hub do Liebherr LR 13000)

Terceira placa da tela inicial. Programa o **Technic Hub** por **Bluetooth**,
direto do navegador — sem cabo, sem instalar nada além do que já está aqui.

**O que você precisa**

- **Google Chrome ou Microsoft Edge** (Firefox e Safari não têm Bluetooth para
  páginas da web). Abra a IDE pelo `MIDE EDU.vbs` como sempre: o
  endereço `http://127.0.0.1:8080` conta como seguro para o Bluetooth.
- Um hub com o firmware **Pybricks** (o do LEGO original não serve). O LR 13000
  traz dois hubs; instale o Pybricks em quantos quiser em
  <https://code.pybricks.com> (uso único, só para instalar o firmware).
- Bluetooth ligado no computador.

**Como conectar**

1. **Não pareie** o hub nas configurações do Windows (se já estiver pareado,
   remova). Feche qualquer aba do code.pybricks.com: o hub aceita uma conexão só.
2. Ligue o hub (botão central). A luz pisca enquanto ele espera.
3. Na IDE: **LEGO Technic** → **Conectar hub** → escolha o hub na lista.
   O chip ao lado mostra `Conectado: <nome>`, depois `▶ Rodando`.

**Como programar**

- **Blocos**: mesmo Modo Blocos do Arduino, com blocos de Motores, Hub, Controle
  remoto, Tempo e Monitor. O Python gerado aparece ao lado.
- **Editor Python**: para escrever à mão (`from pybricks... import ...`).
- **Verificar** compila o Python **no navegador** e aponta a linha com erro —
  funciona sem hub. **Enviar e rodar** (`Ctrl+U`) envia e já executa. **Parar**
  interrompe. O botão do hub também para o programa.
- O `print()` do programa aparece no **Monitor Serial**; números viram curvas no
  **Gráfico Serial**. A caixa de baixo do Monitor envia texto para o `input()`.
- **Arquivo → Exemplos** (e a lista da lateral): Descobrir portas, Girar um
  motor, Vai e volta, Luz do hub por inclinação, Guindaste com controle remoto.
  Use **Descobrir portas** para saber qual motor está em cada porta (A a D) — o
  código não assume a fiação do LR 13000.
- Os blocos e o Editor Python ficam salvos neste computador, cada placa com o seu
  rascunho (os blocos do Uno não se misturam com os do LEGO).

**Nesta versão**: um hub por vez; sem currículo/XP LEGO (só exploração e
exemplos). O **teste ao vivo** com o hub real está em `ROTEIRO-TESTE-LEGO.md`.

**Créditos e licenças**: o compilador `mpy-cross` (WebAssembly, em
`js/vendor/pybricks/`) é do projeto **Pybricks** (pybricks.com), pacote
`@pybricks/mpy-cross-v6`, **licença MIT** — texto em
`js/vendor/pybricks/LICENSE`. A imagem do hub (`assets/boards/lego.png`) vem do
pacote `@pybricks/images` (MIT). O protocolo Bluetooth segue o *Pybricks BLE
Profile*. LEGO® e Technic™ são marcas do Grupo LEGO, que não tem relação com este
curso nem com o Pybricks.

**Testes de desenvolvimento** (opcional, precisa de Node 18+; nada disso é usado
em sala): dentro de `ferramentas/`, `npm install` e depois
`node testar_pybricks_ble.mjs`, `node testar_lego_gen.mjs` e
`node testar_blocos_uno.mjs`.

---

## 13. BBC micro:bit V2

Quarta placa da tela inicial. Programa a **micro:bit V2** (só a V2, a de 2020 em
diante) direto do navegador, **por cabo USB**, sem instalar nada e **sem internet**.
Ao escolher o cartão, você decide entre **JavaScript** (o mesmo do MakeCode) e
**MicroPython**.

**O que você precisa**

- **Google Chrome ou Microsoft Edge** (WebUSB e Web Bluetooth). Outros navegadores
  ainda deixam montar programas, usar **Verificar** e **baixar o .hex**, mas não
  conectam à placa.
- Cabo USB **de dados** (alguns cabos só carregam). Feche outras abas que usam a
  placa (makecode.microbit.org, python.microbit.org): ela aceita uma conexão só.

**Como usar**

1. **Conectar micro:bit** (barra de cima) → escolha "BBC micro:bit CMSIS-DAP". O chip
   mostra `Conectada (V2)`.
2. Modos: **Treinamento** (digita linha por linha, com explicação), **Código
   completo**, **◆ Blocos** (montar com os blocos e **Verificar** — se o programa
   bater com o da atividade, ela conclui) e o **Editor** livre.
3. **Verificar** confere o programa aqui mesmo (JavaScript: compila; MicroPython:
   sintaxe e nomes da API). **Enviar** grava na placa; ela reinicia sozinha.
   Só a diferença é regravada (*partial flashing*), então o segundo envio é rápido.
4. Sem a placa por perto: **Arquivo → Baixar .hex** e arraste o
   arquivo para a unidade `MICROBIT` (plano B se o WebUSB falhar).
5. `serial.writeLine(...)` (JavaScript) e `print(...)` (MicroPython) aparecem no
   **Monitor Serial** e no **Gráfico Serial** (linhas `nome:valor`).

**Currículo**: 18 módulos × 5 atividades = **90**, cada uma em blocos, JavaScript e
MicroPython. Nove módulos usam só a placa (tela de LEDs, botões e logotipo, luz,
temperatura, acelerômetro e gestos, bússola e ímã, microfone, alto-falante e música,
rádio), um é de **Jogos** e oito usam componentes externos na mesma ordem do Arduino
(LED, botão, potenciômetro, ultrassônico, buzzer, servo, display de 7 segmentos e LCD
I2C). O JavaScript e o MicroPython de cada atividade **saem dos blocos** (uma fonte
só): rode `node ferramentas/gerar_fases_microbit.mjs` depois de mexer nas fases.

**Componentes externos — pinos (tabela única `MB_PINOS` em `js/microbit_curso.js`)**

| Componente | Pino(s) |
|---|---|
| LEDs vermelho / amarelo / verde | P13 / P14 / P15 |
| Botões 1 / 2 | P8 / P9 |
| Potenciômetro | P2 |
| Ultrassônico trig / echo | P16 / P1 |
| Buzzer passivo | P0 |
| Servo | P1 |
| Display 7 segmentos (a b c d e f g dp) | P3 P4 P6 P7 P10 P13 P14 P15 |
| LCD 16×2 I2C (SCL / SDA, endereço 0x27) | P19 / P20 |

> **Esta tabela é provisória**: ela vale para o adaptador do plano. Se o adaptador do
> professor ligar algo em outro pino, mude só o `MB_PINOS` e rode
> `node ferramentas/gerar_fases_microbit.mjs`: fases, avisos e exemplos se ajustam.

Cuidados que a IDE avisa nas atividades: a **tela de LEDs usa P3, P4, P6, P7 e P10**
(por isso os programas desligam a tela antes de usar esses pinos); o **servo e o echo
do ultrassônico dividem o P1**; o **echo do HC-SR04 devolve 5 V** e a micro:bit aguenta
3,3 V (divisor 1 kΩ/2 kΩ ou módulo 3,3 V); servo pede **alimentação externa**; a
primeira leitura de luz é instável; a bússola pede **calibração**.

**Bluetooth (só na trilha JavaScript)**: mostra o **Monitor Serial sem fio** (serviço
UART) e o **Painel ao vivo** (inclinação x/y/z, botões A/B, bússola e temperatura) sem
cabo. Por padrão a gravação é por USB. **Enviar por Bluetooth (experimental)** — em
Ferramentas ou no botão do Painel ao vivo — usa o serviço de gravação parcial que o app
da micro:bit no celular usa (função `flash` da `microbit-connection`). Regras: só
JavaScript; placa em **modo de pareamento** e já rodando um programa **com Bluetooth**
(grave uma vez por USB com *Incluir em todo envio* ligado); a IDE compila o programa com
os serviços Bluetooth para manter o mesmo runtime; programas com Rádio não vão. No
navegador só a gravação **parcial** é possível: se a biblioteca precisar da gravação
completa (reconectar a um dispositivo novo, coisa de app nativo), a IDE avisa
"use o cabo USB". O envio abre em dois cliques (compila; depois "Escolher a micro:bit e
enviar"), porque a janela do Chrome exige um clique recente. Testado com conexões de
mentira; **falta o teste com a placa de verdade** (roteiro, item 41). Passo a passo:

1. Monte um programa com os blocos **Bluetooth: iniciar serviço UART** e/ou
   **Bluetooth: iniciar painel ao vivo** (ou use Arquivo → Exemplos → Programas
   prontos → *Painel ao vivo por Bluetooth*) e **grave por USB**.
2. Coloque a placa em **modo de pareamento** (segure A+B, aperte e solte o reset atrás,
   solte A+B quando aparecer "PAIRING MODE!") e clique em **Bluetooth**. O
   computador pede o pareamento: confirme. Nas próximas vezes conecta direto.
3. Regras: Bluetooth **e Rádio não funcionam juntos** no mesmo programa (o gerador de
   blocos avisa); o **MicroPython não tem** Bluetooth de dados (botão desabilitado,
   com o motivo); gravar reinicia a placa e derruba o Bluetooth.

**Deixar o Bluetooth "fixo" na placa**: a micro:bit guarda **um programa só** e o Bluetooth
faz parte dele (não existe um firmware separado para isso: o firmware da interface USB
não roda Bluetooth do aluno). Toda gravação apaga o programa anterior. Por isso, no
Painel ao vivo há a opção **Incluir em todo envio**: a IDE junta os serviços (UART,
inclinação, botões, bússola, temperatura) a **todo programa JavaScript** enviado por USB,
sem mexer no código que o aluno vê. Fica desligada de fábrica, é lembrada pelo navegador
e não vale para programas com Rádio (a IDE avisa na Saída). Os 90 programas do curso
compilam com ela ligada.

**A micro:bit não aparece na lista do computador (o celular achou, o PC não)?** É um
problema conhecido: o Windows/macOS escondem da lista de Bluetooth do sistema os
aparelhos que não são teclado, mouse ou fone, então a micro:bit **quase nunca aparece
em "Adicionar dispositivo"**. A lista certa é a do **Chrome** (botão Bluetooth da IDE).
Confira, nesta ordem:

1. **Modo de pareamento** (A+B+reset até "PAIRING MODE!"): com o pareamento padrão a
   placa só anuncia para aparelhos já pareados (o iPhone) e para um novo só nesse modo.
2. **Desligue o Bluetooth do iPhone** (ou desconecte a placa no app): um aparelho por vez.
3. Programa gravado por USB **com** o bloco de Bluetooth e **sem** blocos de Rádio.
4. Bluetooth do Windows ligado, adaptador com BLE; remova micro:bits antigas pareadas
   em Configurações → Bluetooth e dispositivos e regrave a placa.
5. Teste com o app **nRF Connect** (celular ou PC): a placa deve aparecer como "BBC
   micro:bit [nome]". Se nem ali aparece, o problema é o programa gravado.
6. **Solução mais estável — sem pareamento ("No Pairing Required")**, recomendada pela
   equipe do MakeCode: no makecode.microbit.org, extensão *bluetooth*, engrenagem →
   Configurações do projeto → **No Pairing Required**, cole o JavaScript do exemplo,
   baixe o .hex e **arraste para a unidade MICROBIT**. Não precisa A+B+reset nem
   pareamento do Windows. Regravar pelo *Enviar* da IDE volta ao modo com pareamento
   (a IDE ainda não gera o hex sem pareamento offline: exige o compilador na nuvem da
   Microsoft, uma vez, com internet).

A IDE repete essa lista na aba Saída quando você fecha a janela sem escolher nenhuma
placa, e em Bluetooth → Como usar.

> **Diferença em relação ao plano**: o plano previa Bluetooth *sem pareamento*
> (`open: 1`). Esse hex não existe no cache offline do MakeCode (só a versão padrão,
> com pareamento *Just Works*), e a compilação dele exigiria internet. Por isso a IDE
> usa o pareamento padrão. Se um dia quiser "sem pareamento", é preciso um hex
> compilado com essa opção (Opção B abaixo).

**Programas prontos** (Arquivo → Exemplos → Programas prontos): Bússola, Nível de
bolha, Pedra-papel-tesoura, Nave desviando de pedras (só JS), Termômetro remoto
(duas micro:bits, por rádio) e Painel ao vivo por Bluetooth (só JS).

**Como o JavaScript compila sem internet (decisão do spike — Opção A)**: o MakeCode
compila TypeScript no próprio navegador e liga o resultado a um *runtime* C++ já
compilado. O compilador (`pxt`/`pxt-mkc`, MIT) e o cache desses runtimes (V2: núcleo
com rádio e núcleo com Bluetooth) estão em `js/vendor/makecode/`; o primeiro
`Verificar` leva alguns segundos para iniciar e os seguintes são rápidos. **Opção B**
(reserva, *não implementada*): uma rota no servidor chamando o `mkc` com internet.
O MicroPython usa o firmware oficial `micropython-microbit-v2` (v2.1.2, MicroPython
1.18) e o `@microbit/microbit-fs` monta o `.hex` no navegador.

**Créditos e licenças (todas MIT)**: `@microbit/microbit-connection` 1.0.0 e
`@microbit/microbit-fs` 0.10.1 (Micro:bit Educational Foundation); MicroPython
(Damien P. George e colaboradores; o firmware `micropython-microbit-v2` é da Micro:bit
Educational Foundation); MakeCode e `pxt` / `pxt-microbit` 9.1.1 / `pxt-mkc` (Microsoft).
Os textos das licenças estão em `js/vendor/microbit/` e `js/vendor/makecode/`.
BBC micro:bit é marca da Micro:bit Educational Foundation; o desenho da placa
(`assets/boards/microbit.svg`) é ilustração própria, sem logotipos oficiais.

**Testes de desenvolvimento** (opcional, Node 18+; em `ferramentas/`, `npm install`):
`node testar_mb_gen.mjs` (blocos → código, compila tudo), `node testar_mb_curso.mjs`
(90 atividades × 2 linguagens, byte a byte), `node testar_mb_usb.mjs` e
`node testar_mb_ble.mjs` (conexões de mentira), `python3 testar_mb_navegador.py`
(digita as 90 atividades × 2 linguagens pela tela; precisa de Playwright e de
`python3 -m http.server 8081` na pasta da IDE). O **teste ao vivo** com a placa de
verdade está em `ROTEIRO-TESTE-MICROBIT.md`.


---

## 14. MIDE EDU web — Arduino Uno sem instalar nada

A mesma pasta funciona de dois jeitos:

| Como abre | Modo | Compila | Grava |
|---|---|---|---|
| `MIDE EDU.vbs` / `INICIAR.bat` (endereço `127.0.0.1`) | servidor local | `arduino-cli` | `arduino-cli` |
| `index.html` direto do disco, pendrive ou site (GitHub Pages etc.) | **web** | no navegador | **Web Serial** (USB) pelo navegador |

O modo web é escolhido sozinho pelo endereço da página (`?web=1` / `?web=0` força).
Precisa de **Google Chrome ou Microsoft Edge** no computador. Só o **Arduino Uno**
(a K10 some do seletor; LEGO e micro:bit continuam como antes, já eram do navegador).

**Como o aluno grava:** clica em **Upload** (ou na lista de portas → "Conectar o
Arduino (USB)…"), escolhe a placa na janela do navegador e pronto. O navegador lembra a
placa nas próximas vezes. O Monitor Serial e o Gráfico Serial funcionam igual.

**Como compila sem o arduino-cli:**
- **Missões (as 40)**: o código digitado é reconhecido (comparado sem comentários e
  espaços) e a IDE grava o programa **já compilado com o avr-gcc** de verdade
  (`js/mide_fases_bin.js`).
- **Código livre (Editor C++ e Blocos)**: `js/mide_compilador.js` traduz o C++ para o
  bytecode da **MIDE VM**, um firmware intérprete (`js/mide_firmware.js`, fonte em
  `ferramentas/web/vm/mide_vm.ino`) que vai para a placa junto com o programa. A primeira
  gravação leva uns 8 s (grava o firmware); as próximas, só o programa (~3 s).
- O que funciona no código livre: `int`, `long`, `byte`, `char`, `bool`, `unsigned…`,
  `const`, `#define`, vetores de 1 e 2 dimensões, funções com parâmetros e retorno,
  `if/else`, `while`, `do/while`, `for`, `switch`, `break/continue/return`, todos os
  operadores, `pinMode`, `digitalWrite/Read`, `analogWrite/Read`, `delay`,
  `delayMicroseconds`, `millis`, `micros`, `pulseIn`, `tone/noTone`, `map`, `constrain`,
  `abs/min/max`, `random`, `Serial.*` (begin, print, println, write, available, read,
  parseInt…), `Servo` (até 4) e `LiquidCrystal_I2C` (um LCD).
- Ainda **não** funciona (a IDE avisa em português, com a linha): `float/double`,
  `String` em variável (dentro do print, `String(x) + "..."` funciona), ponteiros,
  `struct/class`, interrupções e bibliotecas fora de Servo/Wire/LiquidCrystal_I2C.
- Erro durante a execução (divisão por zero, posição fora do vetor) aparece no Monitor
  Serial como `[MIDE] ERRO na linha N: ...` e o LED 13 pisca.

**Testes feitos (`ferramentas/web/`)**: as 40 missões rodadas no simulador avr8js em
duas versões — compilada com avr-gcc e na MIDE VM — com os mesmos pinos, Serial e I2C;
um programa de teste da linguagem com saída idêntica byte a byte; a gravação inteira
(protocolo STK500) contra o **optiboot de verdade** rodando no simulador; e o fluxo da
tela no Chromium (erro de compilação, escolher placa, Upload, Monitor, missão com XP).
**Falta o teste com um Uno de verdade.**

**Para refazer os binários** (depois de mudar `dados.js` ou o firmware): ver
`ferramentas/web/LEIA-ME-WEB.md`.

## 15. Joystick — sensores do Arduino viram teclas do PC

Aba **🎮 Joystick** (só Arduino Uno). Baseada no projeto "Joystick" do professor (4 botões nos
pinos 2, 7, 11 e 12 → setas), que é a montagem que abre por padrão.

**Como o aluno usa:** adiciona sensores pela coluna da esquerda, escolhe pino e tecla de cada
um (clica no botão da tecla e aperta a tecla no teclado, ou escolhe um clique do mouse), clica
em **Upload**, testa em **Testar no Monitor** (as teclas acendem na tela) e, para jogar, fecha o
Monitor, baixa o **pacote (.zip)** e dá dois cliques em `Iniciar joystick.bat`. A montagem fica
salva no navegador (`localStorage`, chave `mide_joystick_v1`).

| Sensor | Configuração | O que acontece |
|---|---|---|
| Push button (`INPUT_PULLUP`, botão ao GND) | só curto | a tecla fica apertada enquanto o botão estiver apertado |
| | curto + longo (tempo em ms) | toque rápido = tecla A uma vez; segurou = tecla B apertada até soltar |
| | só longo | nada até o tempo; depois a tecla fica apertada até soltar |
| Ultrassônico HC-SR04 (TRIG/ECHO) | faixas em cm (0–400) | entrou na faixa = começa; saiu = termina (troca só com 2 medidas iguais) |
| Potenciômetro 10k (A0–A5) | faixas de 0 a 1023 | igual; ignora variações menores que 8 (tremido) |
| LED (pino → 220 Ω → LED → GND) | uma tecla | acende **no próprio Arduino** enquanto algum sensor manda essa tecla |

Cada faixa pode ser **segurar** (tecla apertada enquanto durar) ou **toque** (uma vez ao entrar).

**Protocolo (Serial 9600):** cada ação tem um número; o Arduino manda `A3_DOWN` quando a ação 3
começa e `A3_UP` quando termina. O `gamepad.py` tem a tabela `ACOES = {"A3": ("w", "segurar")}`
e usa o `pydirectinput` (teclas e cliques). Ele acha o Arduino sozinho (ou use `PORTA = "COM5"`)
e reconecta se o cabo sair. Só uma coisa usa a porta USB por vez: **feche o Monitor Serial da
IDE (ou a aba do navegador) antes de rodar o `.bat`.**

O `.ino` é gerado sem `String` e sem `float`, então grava tanto pelo `arduino-cli` quanto pela
MIDE VM do site.

**Arquivos:** `js/joystick_gen.js` (gerador, sem DOM — roda no Node), `js/joystick.js` (aba),
`css/joystick.css`; ganchos em `ide.js` (`trocarAba`, `codigoAtual`, `podeGravar`) e
`boards.js` (aba só no Uno). Ícones: os dos módulos (`assets/icone_modulo_*.png`).

**Testes** (`ferramentas/joystick/`):
- `node testar_joystick.js` — 4 montagens (padrão, completa, só LED, 32 ações): o `.ino`
  compila na MIDE VM e no g++ (com cabeçalho falso do Arduino), o `.py` compila, saída
  determinística, `.zip` válido;
- `node simular_joystick.js` (precisa de `npm install avr8js@0.20.1`) — roda o `.ino` no
  **firmware real da MIDE VM** no simulador: toque curto, toque longo, ultrassônico em duas
  faixas, potenciômetro com ruído e o LED, conferindo a sequência exata de mensagens.

**Ainda não testado:** no Uno real e com o `gamepad.py` num jogo no Windows.

