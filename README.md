# MIDE EDU

IDE gamificada para aprender Arduino, com missões, XP e Modo Treinamento linha por linha.

**Abrir:** https://profmatheusbaez.github.io/mide-edu/ — no **Google Chrome** ou **Microsoft Edge** do computador.

## Arduino Uno direto no navegador

- Ligue o Arduino Uno na USB, escolha **Arduino Uno**, escreva ou treine o código e clique em **Upload**.
- Na primeira vez, o navegador pede para escolher a placa (Web Serial). Depois ele lembra.
- Monitor Serial e Gráfico Serial funcionam pelo navegador.
- Não precisa instalar nada no computador.

As 40 missões gravam o programa já compilado com o avr-gcc. O código livre (Editor C++ e
Blocos) é traduzido no navegador e roda na **MIDE VM**, um firmware intérprete gravado
junto. Detalhes, limites e testes: `LEIA-ME.md` §14 e `ferramentas/web/`.

## Uso sem internet / laboratório

- Baixe o repositório, descompacte e abra o `index.html` no Chrome ou Edge — funciona igual, sem internet.
- Ou rode o `INSTALAR.bat` (Windows) para a versão com servidor local e `arduino-cli`
  (veja `COMO INSTALAR NO LABORATORIO.txt`).
