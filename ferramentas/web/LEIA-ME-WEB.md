# Ferramentas da MIDE EDU web (só desenvolvimento)

- `vm/mide_vm.ino` — firmware intérprete (MIDE VM) gravado no Uno junto com o bytecode
  (programa em 0x4000). Os opcodes têm de bater com `js/mide_compilador.js`.
- `tools/build.py` — compila um sketch do Uno com avr-gcc 7.3 + núcleo ArduinoCore-avr
  + Servo + LiquidCrystal_I2C (caminhos no topo do arquivo). Ex.: `python3 tools/build.py vm/mide_vm.ino vm/mide_vm.hex`.
- `tools/gerar_web.js` — gera `js/mide_firmware.js` (firmware em base64) e
  `js/mide_fases_bin.js` (as 40 missões compiladas, chave = hash do código normalizado).
  Precisa de `fases/*.ino` e `hex/*.hex` (extrair as soluções do `dados.js` e compilar).
- `sim/` — testes no simulador avr8js (`npm install avr8js@0.20.1`):
  `comparar.js` (nativo × VM nas 40 missões), `teste_gravacao.js` (STK500 contra o
  optiboot simulado), `teste_ui.py` (fluxo da tela no Chromium com a serial falsa).

Ordem para mudar o currículo: editar `dados.js` → extrair as soluções → compilar com
`build.py` → `node tools/gerar_web.js` → `node sim/comparar.js`.
