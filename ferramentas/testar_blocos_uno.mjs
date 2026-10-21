/* ============================================================
 * testar_blocos_uno.mjs — REGRESSÃO do gerador Blockly → C++ do Uno
 * (só desenvolvimento). Roda depois de QUALQUER mudança em
 * js/blocos.js, blocos_gen.js, blocos_defs.js ou blocos_toolbox.js:
 * o Modo Blocos do Arduino Uno tem que continuar gerando, byte a
 * byte, os mesmos três programas de referência (ferramentas/esperados/).
 *
 *   node ferramentas/testar_blocos_uno.mjs            confere
 *   node ferramentas/testar_blocos_uno.mjs --gravar   regrava os esperados
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Blockly, carregarScripts, carregarWorkspace, num, txt, bool, ref, bloco, pilha, dentro } from './_blockly_headless.mjs';

carregarScripts(['blocos_tema', 'blocos_defs', 'blocos_gen']);
const aqui = path.dirname(fileURLToPath(import.meta.url));
const gravar = process.argv.includes('--gravar');

const programas = {
  /* 1) LED piscando */
  led_piscando: () => [pilha(
    bloco('evento_iniciar'),
    bloco('controle_sempre', null, dentro('DO',
      bloco('arduino_pino_digital_saida', { PINO: '12', ESTADO: 'HIGH' }),
      bloco('controle_espere_seg', { SEG: 1 }),
      bloco('arduino_pino_digital_saida', { PINO: '12', ESTADO: 'LOW' }),
      bloco('controle_espere_seg', { SEG: 0.5 }),
    )),
  )],
  /* 2) variável + servo + LCD + se */
  variavel_servo_lcd_se: () => [pilha(
    bloco('evento_iniciar'),
    bloco('display_lcd_iniciar', { ENDERECO: '0x27' }),
    bloco('variables_set', { VAR: { id: 'v1' } }, { VALUE: num(90) }),
    bloco('controle_sempre', null, dentro('DO',
      bloco('controle_se', null, Object.assign({ CONDICAO: ref(bloco('sensores_botao', { PINO: '2' })) },
        dentro('DO',
          bloco('variaveis_somar', { VAR: { id: 'v1' } }, { VALOR: num(10) }),
          bloco('atuadores_servo', { PINO: '9' }, { ANGULO: ref(bloco('variables_get', { VAR: { id: 'v1' } })) }),
          bloco('display_lcd_escrever', { LINHA: '1' }, { TEXTO: txt('Angulo'), COLUNA: num(0) }),
        ))),
      bloco('controle_espere_ms', { MS: 200 }),
    )),
  )],
  /* 3) ultrassônico + repita + se/senão + 7 segmentos + serial */
  ultrassonico_7seg_serial: () => [pilha(
    bloco('evento_iniciar'),
    bloco('serial_iniciar', { BAUD: '9600' }),
    bloco('controle_repita_vezes', { VEZES: 3 }, dentro('DO',
      bloco('display_7seg_mostrar', null, { DIGITO: num(8) }),
      bloco('controle_espere_ms', { MS: 100 }),
    )),
    bloco('controle_sempre', null, dentro('DO',
      bloco('variables_set', { VAR: { id: 'v2' } }, { VALUE: ref(bloco('sensores_distancia', { TRIG: '6', ECO: '7' })) }),
      bloco('controle_se_senao', null, Object.assign(
        { CONDICAO: ref(bloco('operador_menor', null, { A: ref(bloco('variables_get', { VAR: { id: 'v2' } })), B: num(10) })) },
        dentro('DO', bloco('display_7seg_mostrar', null, { DIGITO: num(1) }), bloco('atuadores_buzzer_nota', { PINO: '5', NOTA: 'DO' }, { DUR: num(200) })),
        dentro('SENAO', bloco('display_7seg_apagar'), bloco('atuadores_buzzer_parar', { PINO: '5' })),
      )),
      bloco('serial_escrever_linha', null, { TEXTO: ref(bloco('variables_get', { VAR: { id: 'v2' } })) }),
      bloco('arduino_pino_pwm', { PINO: '11' }, { VALOR: ref(bloco('sensores_mapear', null, { VALOR: ref(bloco('arduino_pino_analogico_ler', { PINO: 'A0' })), DE_MIN: num(0), DE_MAX: num(1023), PARA_MIN: num(0), PARA_MAX: num(255) })) }),
      bloco('controle_espere_ms', { MS: 50 }),
    )),
  )],
};
const variaveis = {
  variavel_servo_lcd_se: [{ name: 'angulo', id: 'v1' }],
  ultrassonico_7seg_serial: [{ name: 'cm', id: 'v2' }],
};

let falhas = 0;
for (const [nome, montar] of Object.entries(programas)) {
  const ws = carregarWorkspace(montar(), variaveis[nome]);
  const r = blocosGerarSketch(ws);
  const arq = path.join(aqui, 'esperados', 'uno_' + nome + '.ino');
  if (gravar) { fs.writeFileSync(arq, r.codigo); console.log('gravado', arq); continue; }
  try {
    assert.equal(r.codigo, fs.readFileSync(arq, 'utf8'));
    console.log('  ok   ' + nome);
  } catch (e) { falhas++; console.log('  FALHA ' + nome + '\n' + String(e.message).slice(0, 800)); }
}
if (!gravar) { console.log('\n' + (Object.keys(programas).length - falhas) + '/' + Object.keys(programas).length + ' programas do Uno idênticos ao esperado'); process.exit(falhas ? 1 : 0); }
