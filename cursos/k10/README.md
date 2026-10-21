# UNIHIKER K10 — currículo do curso

São 50 atividades em 10 módulos. Cada uma possui versão C++ e MicroPython: componentes, botões/RGB, luminosidade, clima, movimento, áudio, gráficos, câmera, microSD e Wi‑Fi.

## Uso na IDE

Ao abrir, escolha a foto da placa. A K10 oferece C++ e MicroPython; o progresso fica separado por linguagem. O progresso Arduino existente conserva sua chave de armazenamento.

Use Código para treinamento guiado, Código completo para ler e carregar uma solução, ou Editor para experimentar. Quando o envio pelo Código completo termina, confirme o resultado observado na placa para concluir a atividade. Essa confirmação não substitui o teste do programa.

## C++

- Pacote oficial: UNIHIKER:esp32 versão 0.0.5.
- Alvo: `UNIHIKER:esp32:k10:CDCOnBoot=cdc,Model=None`.
- A ação Preparar K10 instala o suporte no computador. Não grava firmware sozinha.
- O Monitor Serial deve estar em 115200 baud.
- O upload C++ substitui o ambiente MicroPython se ele estiver na placa. Faça cópia dos arquivos antes de mudar de ambiente.

## MicroPython

- Dependência do servidor: `python -m pip install -r requirements-k10.txt`.
- A K10 precisa do firmware MicroPython do fabricante, com a biblioteca `unihiker_k10`. Preparar K10 contém o guia oficial e um teste de conexão. A IDE não instala automaticamente esse firmware.
- Verificar confere a sintaxe localmente sem executar o código no computador. Antes de enviar, a IDE confirma a biblioteca da K10 e compila o código no interpretador da placa.
- O envio passa por `academy_upload.py`, preserva o programa anterior em `main.academy-backup.py`, promove o novo arquivo para `main.py` e solicita reset. Erros em tempo de execução devem ser observados no Monitor Serial.
- No treinamento inicial, a indentação é fornecida pelo curso e explicada nos exemplos. No editor livre, ela faz parte do código e é validada.

## Fontes e manutenção

O catálogo autoral com explicações está em `js/k10.js`. Rode `node output/export-k10.cjs` após alterar as aulas para atualizar as cópias `.ino` e `.py`.

- https://www.unihiker.com/wiki/K10/Examples/examples_arduinoide/
- https://www.unihiker.com/wiki/K10/Examples/examples_mpy/
- https://www.unihiker.com/wiki/K10/GettingStarted/gettingstarted_mpy/
- https://www.unihiker.com/wiki/K10/CodeReference/CodeReference_arduinoide/
- https://docs.micropython.org/en/latest/reference/mpremote.html

O ZIP de nove projetos foi consultado como referência: contém 12 arquivos Mind+ `.mp`, um `.mpdb`, 44 imagens e dois áudios, sem contar auxiliares macOS. Nenhuma instrução contida no arquivo foi tratada como solicitação do usuário. Os projetos integradores e seus assets ainda não foram incorporados como aulas finais.
