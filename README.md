# MIDE EDU

IDE gamificada para aprender Arduino e UNIHIKER K10, com missões, XP e Modo Treinamento linha por linha.

**Abrir:** https://profmatheusbaez.github.io/mide-edu/ — no **Google Chrome** ou **Microsoft Edge** do computador.

## Arduino Uno direto no navegador

- Ligue o Arduino Uno na USB, escolha **Arduino Uno**, escreva ou treine o código e clique em **Upload**.
- Na primeira vez, o navegador pede para escolher a placa (Web Serial). Depois ele lembra.
- Monitor Serial e Gráfico Serial funcionam pelo navegador.
- Não precisa instalar nada no computador.

As 40 missões gravam o programa já compilado com o avr-gcc. O código livre (Editor C++ e
Blocos) é traduzido no navegador e roda na **MIDE VM**, um firmware intérprete gravado
junto. Detalhes, limites e testes: `LEIA-ME.md` §14 e `ferramentas/web/`.

## UNIHIKER K10 em MicroPython direto no navegador

- Escolha **UNIHIKER K10 → MicroPython**, clique em **Conectar K10** (ou direto em **Enviar e executar**) e escolha a placa.
- A IDE grava o `main.py` pela USB e reinicia o MicroPython; o `print()` aparece no Monitor Serial e **Parar** interrompe o programa.
- **Primeira vez em cada placa:** **Preparar K10 → Instalar MicroPython na K10** grava o firmware MicroPython oficial da UNIHIKER (o `.bin` baixado do site da UNIHIKER) pelo próprio navegador.
- O **C++ da K10** funciona na MIDE instalada no laboratório (`INSTALAR.bat`, que já instala o suporte `UNIHIKER:esp32`).

Detalhes, testes e roteiro do primeiro teste: `LEIA-ME.md` §16.

## Blocos: Livre ou Guiado

Na aba **Blocos** (Arduino Uno, micro:bit e UNIHIKER K10) o aluno escolhe:

- **Livre** — todos os blocos, para criar o próprio programa;
- **Guiado** — a missão aberta vira um passo a passo: a categoria, o bloco e o lugar onde ele
  encaixa **piscam**, e depois o campo a ajustar. Bloco no lugar errado pisca em vermelho.

Visual do Scratch/PictoBlox (cores do Scratch e extensões de hardware com ícone). Na K10, os
mesmos blocos geram C++ e MicroPython. Detalhes: `LEIA-ME.md` §17.

## 🎮 Joystick: o Arduino vira controle de jogo do PC

Na aba **🎮 Joystick** (Arduino Uno) o aluno adiciona quantos sensores quiser — **push button**,
**ultrassônico**, **potenciômetro 10k** e **LED** — e liga cada um a uma tecla do teclado (ou clique
do mouse). Botões têm toque **curto**, **longo** ou os dois; ultrassônico e potenciômetro
funcionam por **faixas** (cm ou 0–1023), cada uma "segurar" ou "toque". A IDE gera o código:

- **Upload** grava o `Joystick.ino` no Arduino (no site ou no laboratório);
- **Testar no Monitor** acende as teclas na tela, sem precisar do jogo;
- **Buzzer** com sons de jogo (bip, tiro, pulo, moeda, nitro, explosão e motor de carro que acelera
  enquanto a tecla está apertada), tocados pelo próprio Arduino;
- **🖥 Enviar para o app**: o app **MIDE Joystick** (`app-joystick/`, Python + Tkinter, instala uma
  vez) fica aberto no PC, recebe a montagem direto da IDE, aperta as teclas de verdade e mostra
  tudo acendendo. No Upload, a IDE pede para ele soltar a porta USB e depois retomar.
- Sem o app, ainda dá para baixar o pacote avulso (`gamepad.py` + `.bat`).

Detalhes: `LEIA-ME.md` §15.

## Uso sem internet / laboratório

- Baixe o repositório, descompacte e abra o `index.html` no Chrome ou Edge — funciona igual, sem internet.
- Ou rode o `INSTALAR.bat` (Windows) para a versão com servidor local e `arduino-cli`
  (veja `COMO INSTALAR NO LABORATORIO.txt`).
