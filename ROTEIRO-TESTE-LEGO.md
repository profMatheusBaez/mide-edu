# Roteiro de teste ao vivo — LEGO Technic (Pybricks)

Tudo o que dava para conferir **sem o hub** já foi conferido (protocolo contra um
Bluetooth de mentira, compilador, gerador de blocos, telas). Falta o que só o hub
de verdade responde. Marque cada item; se algo falhar, anote a mensagem que
apareceu na aba **Saída** e o passo em que parou.

**Antes de começar**

- Windows com Bluetooth ligado, **Google Chrome ou Microsoft Edge**.
- IDE aberta pelo `MIDE EDU.vbs`.
- Hub com firmware Pybricks. **Não pareie** o hub nas configurações do Windows (se
  já estiver pareado, remova). Feche qualquer aba do code.pybricks.com.
- Motores ligados ao hub. Não precisa montar o guindaste inteiro.

## Checklist

1. [ ] **Tela inicial**: aparecem os três cartões e a foto do Technic Hub no cartão
   "LEGO Technic".
2. [ ] Clique em **LEGO Technic**. Abrem as abas **Editor Python** e **Blocos**; a
   barra de cima mostra **Conectar hub** e o chip **Desconectado**.
3. [ ] **Verificar** (sem hub): com o exemplo "Girar um motor" (blocos), aparece
   "Código Python conferido". Em **Editor Python**, apague os dois-pontos de uma
   linha `while True:` e clique em Verificar: aparece "Erro na linha N" e a linha fica
   selecionada.
4. [ ] Ligue o hub (luz piscando). **Conectar hub** → o hub aparece na lista →
   escolha. O chip vira `Conectado: <nome>`. *Se o hub não aparece: veja a seção 12
   do LEIA-ME.*
5. [ ] Escolha o exemplo **Descobrir portas** → **Enviar e rodar**. O Monitor Serial
   abre sozinho e mostra uma linha para cada porta (A a D), terminando em
   `Pronto!`. O chip mostra `▶ Rodando` e depois volta a `Conectado`.
   **Anote quais portas têm motor.**
6. [ ] **Blocos com motor**: no exemplo "Girar um motor", ajuste a porta do motor
   para uma que tenha motor e clique em **Enviar e rodar**. O motor gira, a luz do hub
   muda de cor.
7. [ ] Envie um programa com `while True:` longo (exemplo "Luz do hub por
   inclinação") e clique em **■ Parar**: o programa para e o chip volta a
   `Conectado`. Envie de novo **sem** clicar em Parar antes: o hub para o programa
   anterior sozinho e roda o novo.
8. [ ] `print()`: no Editor Python, escreva `print("oi")` e envie. "oi" aparece no
   Monitor Serial. No exemplo "Luz do hub por inclinação", abra o **Gráfico
   Serial** e incline o hub: a curva se move.
9. [ ] **Controle remoto** (só se tiver o controle Powered Up): ligue o controle
   (botão verde), rode o exemplo **Guindaste com controle remoto** e mexa nos
   botões. Ajuste as portas dos motores pelo resultado do passo 5.
10. [ ] **Desligue o hub no meio** de um programa: a IDE mostra `Desconectado`, a
    Saída avisa "Hub desconectado", nada trava. **Conectar hub** de novo funciona.
11. [ ] Feche a aba e abra a IDE de novo: os blocos e o texto do Editor Python do
    LEGO continuam lá, e os blocos do Uno não foram mexidos.

## O que este teste confirma (e ninguém conseguiu confirmar antes)

- que o hub aceita o programa compilado pelo `mpy-cross` que vem junto da IDE
  (formato .mpy versão 6 — o firmware do seu hub precisa ser compatível);
- que o comando de **iniciar** do Pybricks (que, em firmwares novos, leva um byte de
  "slot") funciona com o seu hub;
- que o `print()` chega inteiro ao Monitor (o hub manda o texto em pedaços).

Se o passo 5 ou 6 falhar com "o hub recusou o programa" ou o programa não roda,
anote a **versão do firmware** que aparece na Saída ao conectar
(`Pybricks x.y.z`) — é a informação mais útil para corrigir.
