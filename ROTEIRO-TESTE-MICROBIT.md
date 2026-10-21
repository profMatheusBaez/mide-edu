# Roteiro de teste ao vivo — BBC micro:bit V2

Tudo o que dava para conferir **sem a placa** já foi conferido: geradores de blocos,
compilação de todas as 90 atividades (JavaScript no MakeCode, MicroPython na sintaxe e
na API), digitação das 90 atividades × 2 linguagens pela tela, USB e Bluetooth contra
conexões de mentira, telas em claro/escuro e em 820 px. Falta o que só a placa de
verdade responde — e o que exige o **clique de uma pessoa** (o seletor USB e o
Bluetooth do Chrome não podem ser automatizados). Marque cada item; se algo falhar,
anote a mensagem da aba **Saída** e o passo em que parou.

**Antes de começar**

- **Google Chrome ou Microsoft Edge**, IDE aberta pelo `MIDE EDU.vbs`.
- micro:bit **V2** (a V1 não é suportada — a IDE avisa se você ligar uma).
- Cabo USB **de dados**. Feche makecode.microbit.org e python.microbit.org.
- Para as partes 6 e 7: o **adaptador** da micro:bit com os componentes do curso
  (LEDs, botões, potenciômetro, HC-SR04, buzzer passivo, servo, display de 7
  segmentos, LCD I2C).

---

## Parte 1 — Só a placa e o cabo (sem componentes)

1. [ ] **Tela inicial**: aparecem os **quatro** cartões, o da **BBC micro:bit V2** com
   o desenho da placa. Clicar nele abre "Como você quer programar a micro:bit?" com
   **JavaScript** e **MicroPython**.
2. [ ] Escolha **JavaScript**. A barra de cima mostra **Conectar micro:bit**, o chip
   `Desconectada` e o botão **Bluetooth**.
3. [ ] **Conectar micro:bit** → o Chrome lista "BBC micro:bit CMSIS-DAP" → escolha.
   O chip vira `Conectada (V2)`. *Se a placa não aparece: cabo só de carga, ou outra
   aba usando a placa.*
4. [ ] Atividade 1 (**Olá, mundo!**) no **Treinamento**: digite o código até o fim,
   clique **Enviar**. A barra de elétrons anda, a placa reinicia e **rola o texto
   "Ola!"**. Aparece "Missão concluída" com +20 XP.
5. [ ] **Segundo envio** (mude o texto, envie de novo): bem mais rápido que o primeiro
   (*partial flashing*).
6. [ ] Abra o exemplo `serial.writeLine("oi")` no **Editor** (`basic.forever(function () { serial.writeLine("oi"); basic.pause(1000) })`)
   → **Enviar**. O **Monitor Serial** abre sozinho e mostra `oi` a cada segundo.
7. [ ] No Monitor, escreva `abc` e **Enviar**: chega na placa sem travar a tela.
8. [ ] Programa `serial.writeValue("x", input.acceleration(Dimension.X))` →
   **Gráfico Serial** desenha uma curva ao inclinar a placa.
9. [ ] **Trilha MicroPython** (Trocar placa → micro:bit → MicroPython): atividade 1,
   **Enviar**: `display.scroll("Ola!")` roda; `print("oi")` aparece no Monitor.
10. [ ] Nas duas trilhas, **Verificar** com um erro de propósito (tirar um parêntese)
    → **"Erro na linha N"** em português, sem gravar.
11. [ ] **Arrancar o cabo no meio da gravação**: aparece uma mensagem clara na Saída
    (não uma tela travada nem erro solto) e o chip volta a `Desconectada`. Ligue de
    novo e conecte: tudo volta a funcionar.
12. [ ] **Arquivo → Baixar .hex** (sem conectar nada): baixa `programa.hex`; arrastar
    para a unidade `MICROBIT` roda o programa.

## Parte 2 — Sensores da placa (módulos 1 a 9)

Faça **uma atividade de cada módulo**, em qualquer trilha (alterne entre elas):

13. [ ] **Botões e logotipo**: A, B, A+B e o toque no logotipo dourado.
14. [ ] **Luz**: o número muda ao cobrir a tela. *A primeira leitura pode vir 0 ou 255 —
    esperado, a fase avisa.*
15. [ ] **Temperatura**: valor plausível (temperatura da sala ± 5 °C — o sensor mede o chip).
16. [ ] **Acelerômetro e gestos**: agitar (*shake*), virar a tela para cima/baixo.
17. [ ] **Bússola e ímã**: na primeira leitura pede **calibrar** (incline a placa para
    encher a tela de LEDs); depois o Norte aponta certo.
18. [ ] **Microfone**: bater palmas muda o nível de som.
19. [ ] **Alto-falante e música**: toca sem buzzer externo (V2 tem o próprio).
20. [ ] **Rádio** (duas micro:bits, mesmo grupo): mensagem de uma aparece na outra.

## Parte 3 — Jogos (módulo 10)

21. [ ] Rode os **5 jogos** (um por atividade): responde aos botões, marca pontos e
    mostra o "fim de jogo". Anote qualquer jogo confuso de jogar (ritmo, dificuldade).

## Parte 4 — Componentes externos (módulos 11 a 18): confirme a pinagem

> **Faça isto primeiro.** A tabela de pinos (`MB_PINOS`, em `js/microbit_curso.js`) é
> **provisória**: vale para o adaptador do plano. Confira com o **seu** adaptador:
> se algum componente estiver em outro pino, mude só o `MB_PINOS` e rode
> `node ferramentas/gerar_fases_microbit.mjs` (regera fases, avisos e ligações).

| Componente | Pino(s) previsto(s) | Confere? |
|---|---|---|
| LED vermelho / amarelo / verde | P13 / P14 / P15 | [ ] |
| Botão 1 / 2 | P8 / P9 | [ ] |
| Potenciômetro | P2 | [ ] |
| Ultrassônico trig / echo | P16 / P1 | [ ] |
| Buzzer passivo | P0 | [ ] |
| Servo | P1 | [ ] |
| Display 7 segmentos a b c d e f g dp | P3 P4 P6 P7 P10 P13 P14 P15 | [ ] |
| LCD I2C SCL / SDA (endereço 0x27) | P19 / P20 | [ ] |

Anote também: **modelo do adaptador** e se ele tem saída de **5 V**: __________

22. [ ] **LED externo**: acender, piscar, semáforo, brilho (o amarelo é PWM), desafio.
23. [ ] **Botão externo**: ler, acender LED, alternar, dois botões, jogo de reflexo.
24. [ ] **Potenciômetro**: números de 0 a ~1023; controla o brilho; seletor de LEDs.
25. [ ] **Ultrassônico** — ⚠️ o **ECHO devolve 5 V** e a micro:bit aguenta 3,3 V: use
    divisor 1 kΩ/2 kΩ ou um módulo 3,3 V. A distância em cm confere com uma régua?
26. [ ] **Buzzer**: tom, notas, melodia, teclas, alarme.
27. [ ] **Servo** — alimente o servo com fonte externa (o USB pode reiniciar a placa).
    O **servo e o ECHO dividem o P1**: desligue o ultrassônico antes. Ângulos 0/90/180 batem?
28. [ ] **Display de 7 segmentos**: os traços acendem na ordem certa (a a g); conta de 0 a 9.
    *Os LEDs externos (P13–P15) precisam estar retirados.* O programa desliga a tela de LEDs (`led.enable(false)` / `display.off()`).
29. [ ] **LCD I2C**: se o LCD mostrar só quadradinhos, ajuste o **contraste** no
    potenciômetro azul atrás; se nada aparecer, o endereço pode ser `0x3F` em vez de
    `0x27` (mude em `MB_PINOS.lcd.endereco` e regere).

## Parte 5 — Bluetooth (só trilha JavaScript)

30. [ ] Na trilha **MicroPython**, o botão **Bluetooth** está cinza e o texto do mouse
    explica o motivo; clicar escreve o mesmo aviso na Saída.
31. [ ] Na trilha **JavaScript**: **Arquivo → Exemplos → Programas prontos → Painel ao
    vivo por Bluetooth** → **Enviar por USB**. A placa mostra um coração.
32. [ ] Coloque a placa em **modo de pareamento**: segure **A + B**, aperte e solte o
    botão de reset (atrás), e só solte A + B quando aparecer **"PAIRING MODE!"**.
33. [ ] Clique em **Bluetooth** e escolha "BBC micro:bit [nome]". O computador pede o
    **pareamento**: confirme. O chip vira `Bluetooth: conectado` e a placa mostra ✓.
    *Se o Windows falhar ao parear: remova a placa em Configurações → Bluetooth e
    tente de novo. Anote a mensagem.*
34. [ ] **Painel ao vivo**: as barras X/Y/Z mexem ao inclinar; os botões A e B acendem
    ao apertar; a bússola gira; a temperatura aparece.
35. [ ] **Monitor sem fio**: aparece `temp:NN` a cada segundo (programa do exemplo).
    Escreva um texto no Monitor: vai pelo Bluetooth (sem cabo).
36. [ ] **Calibrar bússola** (botão no painel): a placa pede o jogo de encher a tela.
37. [ ] Leve a placa para longe (ou desligue-a): a IDE avisa "Bluetooth desconectado" e
    o painel volta a "sem dados", sem travar.
38. [ ] **Segunda conexão**: clique em **Bluetooth** de novo — deve conectar **sem**
    pedir o pareamento outra vez.
39. [ ] **Enviar por USB** com o Bluetooth conectado: a IDE desconecta o Bluetooth
    antes (aviso na Saída) e o envio termina normal.
40. [ ] **Bluetooth × Rádio**: monte blocos de rádio **e** de Bluetooth juntos; o gerador
    avisa que não funcionam juntos.

> **Bluetooth fixo em todo envio**: ligue **Incluir em todo envio** (aba Painel ao vivo),
> grave qualquer atividade JavaScript por USB (ex.: "Olá, mundo!") e conecte pelo botão
> Bluetooth: o Painel ao vivo deve funcionar sem usar o exemplo pronto. Desligue a opção e
> grave de novo: a placa deixa de anunciar Bluetooth.

> **A placa não aparece na lista do Chrome?** (o celular achou, o PC não) O Windows não
> lista micro:bits em "Adicionar dispositivo": use só a lista do Chrome. Tente A+B+reset
> primeiro; desligue o Bluetooth do celular; confirme o bloco de Bluetooth no programa
> gravado (e nenhum de Rádio); confira com o nRF Connect se a placa anuncia. Se ainda
> falhar: grave pelo makecode.microbit.org com **No Pairing Required** (arrastando o
> .hex para a unidade MICROBIT) e conecte pela IDE. Anote qual caminho funcionou.

> **Anote a decisão**: o plano previa Bluetooth *sem pareamento*; o hex "sem
> pareamento" **não existe** no cache offline do MakeCode, então a IDE usa o
> pareamento padrão (*Just Works*, com o modo de pareamento A+B+reset). Se o
> pareamento atrapalhar a sala de aula, dá para preparar uma versão sem pareamento
> (precisa de internet uma vez — Opção B do LEIA-ME, seção 13).

### Enviar por Bluetooth (experimental)

41. [ ] Com a placa já rodando o **Painel ao vivo por Bluetooth** (gravado por USB): altere o
    programa (ex.: texto do coração), **Ferramentas → Enviar por Bluetooth** (ou botão no
    Painel ao vivo). Coloque a placa em modo de pareamento (A+B+reset), clique em
    **Escolher a micro:bit e enviar**, escolha a placa. A barra anda, a placa reinicia com o
    programa novo. **Anote**: funcionou? Quanto tempo levou? Se a IDE mandou usar o cabo,
    anote a mensagem (a gravação completa não é possível no navegador).
    Se falhar, o cabo USB continua funcionando (confira: **Enviar** normal).

## Parte 6 — Encerramento

42. [ ] **Trocar placa** (Uno ↔ K10 ↔ LEGO ↔ micro:bit): a micro:bit é solta (o chip
    volta a `Desconectada`) e os rascunhos de cada placa continuam onde estavam.
43. [ ] Nenhuma requisição externa: no Chrome, **F12 → Rede** deve mostrar só
    endereços `127.0.0.1` (exceto 404 de `/api/status` e afins, que já existiam).

**Resultado**: [ ] tudo ok  ·  [ ] ok com ressalvas (liste)  ·  [ ] bloqueado

Observações: ________________________________________________________________
