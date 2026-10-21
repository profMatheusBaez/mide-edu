/* ============================================================
 * testar_lego_gen.mjs — gerador Blockly → Python do Pybricks
 * (só desenvolvimento, Node ≥ 18, sem navegador)
 *
 *   cd ferramentas && npm install     (uma vez: instala blockly)
 *   node ferramentas/testar_lego_gen.mjs             confere
 *   node ferramentas/testar_lego_gen.mjs --gravar    regrava os esperados
 *
 * O que confere:
 *  1. programas de referência geram o Python esperado BYTE A BYTE
 *     (ferramentas/esperados/lego_*.py);
 *  2. todo Python gerado — e todo exemplo do menu — compila no
 *     mpy-cross oficial (status 0);
 *  3. determinismo: gerar duas vezes, e gerar depois de salvar e
 *     recarregar o workspace, dá o mesmo texto;
 *  4. toda peça da toolbox LEGO existe, tem gerador e compila; nenhum
 *     bloco de hardware do Arduino aparece na toolbox LEGO.
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Blockly, RAIZ, carregarScripts, carregarWorkspace, num, txt, bool, ref, bloco, pilha, dentro } from './_blockly_headless.mjs';

/* o mpy-cross (Emscripten antigo) tenta usar fetch() se ele existir; no Node
   ele precisa cair no caminho de leitura de arquivo */
globalThis.fetch = undefined;
const require = createRequire(import.meta.url);
const PybricksMpy = require(path.join(RAIZ, 'js/pybricks_mpy.js'));
PybricksMpy.configurar({
  mpyCross: require(path.join(RAIZ, 'js/vendor/pybricks/mpy-cross-v6.js')),
  wasm: path.join(RAIZ, 'js/vendor/pybricks/mpy-cross-v6.wasm'),
});

carregarScripts(['blocos_tema', 'blocos_defs', 'blocos_toolbox', 'blocos_gen',
  'blocos_lego_defs', 'blocos_lego_toolbox', 'blocos_lego_gen', 'lego_exemplos']);

const aqui = path.dirname(fileURLToPath(import.meta.url));
const gravar = process.argv.includes('--gravar');
let falhas = 0, total = 0;
const ok = (nome) => console.log('  ok   ' + nome);
const falha = (nome, e) => { falhas++; console.log('  FALHA ' + nome + '\n       ' + String(e && e.message ? e.message : e).split('\n').slice(0, 14).join('\n       ')); };
async function teste(nome, fn) { total++; try { await fn(); ok(nome); } catch (e) { falha(nome, e); } }

const gerar = (ws) => blocosGerarPython(ws);
const compila = async (codigo) => {
  const r = await PybricksMpy.compilarPrograma(codigo);
  assert.ok(r.ok, 'não compilou: ' + JSON.stringify(r.erros) + '\n' + codigo);
  assert.ok(r.blob.length > 8);
};

/* ============ programas de referência ============ */
const M = (t, c, e) => bloco(t, c, e);
const PROGRAMAS = {
  /* todos os blocos de motor; "sentido" do motor B vem DEPOIS do primeiro uso do B */
  motores_todos: { topos: () => [pilha(
    M('evento_iniciar'),
    M('lego_motor_girar', { PORTA: 'B' }, { VEL: num(200) }),
    M('lego_motor_sentido', { PORTA: 'B', SENTIDO: 'COUNTERCLOCKWISE' }),
    M('lego_motor_girar_graus', { PORTA: 'A' }, { GRAUS: num(360), VEL: num(360) }),
    M('lego_motor_ir_ate', { PORTA: 'A' }, { ALVO: num(-90), VEL: num(180) }),
    M('lego_motor_girar_tempo', { PORTA: 'C' }, { TEMPO: num(1500), VEL: num(720) }),
    M('lego_motor_potencia', { PORTA: 'D' }, { POTENCIA: num(-50) }),
    M('lego_motor_parar', { PORTA: 'A', MODO: 'STOP' }),
    M('lego_motor_parar', { PORTA: 'B', MODO: 'BRAKE' }),
    M('lego_motor_parar', { PORTA: 'C', MODO: 'HOLD' }),
    M('lego_motor_zerar', { PORTA: 'A' }),
    M('controle_sempre', null, dentro('DO',
      M('lego_monitor_escrever', null, { TEXTO: ref(M('lego_motor_angulo', { PORTA: 'A' })) }),
      M('lego_monitor_escrever', null, { TEXTO: ref(M('lego_motor_velocidade', { PORTA: 'A' })) }),
      M('controle_se', null, Object.assign(
        { CONDICAO: ref(M('lego_motor_travado', { PORTA: 'A' })) },
        dentro('DO', M('lego_motor_parar', { PORTA: 'A', MODO: 'STOP' })))),
      M('controle_espere_seg', { SEG: 0.25 }),
    )),
  )] },

  /* hub, variáveis (nome com acento e nome reservado), todos os operadores, laços */
  hub_variaveis_operadores: {
    variaveis: [{ name: 'ângulo médio', id: 'v1' }, { name: 'hub', id: 'v2' }, { name: 'texto', id: 'v3' }, { name: 'angulo medio', id: 'v4' }],
    topos: () => [pilha(
      M('evento_iniciar'),
      M('lego_hub_luz', { COR: 'ORANGE' }),
      M('variables_set', { VAR: { id: 'v1' } }, { VALUE: ref(M('lego_hub_inclinacao', { EIXO: '1' })) }),
      M('variables_set', { VAR: { id: 'v2' } }, { VALUE: ref(M('operador_soma', null, { A: ref(M('lego_hub_direcao')), B: ref(M('operador_multiplicacao', null, { A: num(2), B: num(3) })) })) }),
      M('variables_set', { VAR: { id: 'v3' } }, { VALUE: ref(M('operador_juntar', null, { A: txt('bateria '), B: ref(M('lego_hub_bateria')) })) }),
      M('variables_set', { VAR: { id: 'v4' } }, { VALUE: ref(M('operador_arredondar', null, { A: ref(M('operador_divisao', null, { A: num(7), B: num(2) })) })) }),
      M('controle_repita_vezes', { VEZES: 2 }, dentro('DO',
        M('controle_repita_vezes', { VEZES: 3 }, dentro('DO', M('lego_hub_luz_apagar'))))),
      M('controle_repita_ate', null, Object.assign(
        { CONDICAO: ref(M('operador_maior', null, { A: ref(M('variables_get', { VAR: { id: 'v1' } })), B: num(30) })) },
        dentro('DO', M('variaveis_somar', { VAR: { id: 'v2' } }, { VALOR: num(1) })))),
      M('controle_se', null, { CONDICAO: bool(true) }),
      M('controle_se_senao', null, Object.assign(
        { CONDICAO: ref(M('operador_e', null, {
          A: ref(M('operador_igual', null, { A: ref(M('operador_resto', null, { A: ref(M('variables_get', { VAR: { id: 'v2' } })), B: num(2) })), B: num(0) })),
          B: ref(M('operador_nao', null, { A: ref(M('operador_ou', null, { A: bool(false), B: ref(M('operador_menor', null, { A: num(-1), B: ref(M('operador_aleatorio', null, { DE: num(1), ATE: num(6) })) })) })) })),
        })) },
        dentro('DO', M('lego_hub_luz', { COR: 'VIOLET' })),
        dentro('SENAO', M('controle_pare')),
      )),
      M('lego_monitor_escrever', null, { TEXTO: ref(M('variables_get', { VAR: { id: 'v3' } })) }),
    )],
  },

  /* controle remoto lido ANTES de "conectar", cronômetro, sensor opcional, texto com aspas */
  remoto_tempo_sensor: { topos: () => [pilha(
    M('evento_iniciar'),
    M('controle_se', null, Object.assign(
      { CONDICAO: ref(M('lego_remoto_botao', { BOTAO: 'CENTER' })) },
      dentro('DO', M('lego_remoto_luz', { COR: 'CYAN' })))),
    M('lego_remoto_conectar'),
    M('lego_tempo_zerar'),
    M('lego_monitor_escrever', null, { TEXTO: txt('disse "oi" \\ acabou') }),
    M('controle_sempre', null, dentro('DO',
      M('controle_se', null, Object.assign(
        { CONDICAO: ref(M('operador_menor', null, { A: ref(M('lego_sensor_distancia', { PORTA: 'C' })), B: num(50) })) },
        dentro('DO', M('lego_monitor_escrever', null, { TEXTO: ref(M('lego_sensor_cor', { PORTA: 'C' })) })))),
      M('lego_monitor_escrever', null, { TEXTO: ref(M('lego_tempo_ler')) }),
      M('controle_se', null, Object.assign(
        { CONDICAO: ref(M('lego_remoto_botao', { BOTAO: 'LEFT_MINUS' })) },
        dentro('DO', M('controle_pare')))),
    )),
  )] },

  /* só o chapéu: o programa mais curto possível */
  so_chapeu: { topos: () => [M('evento_iniciar')] },

  /* "sempre" sem nenhuma espera → wait(10); depois "repita até" sem espera */
  sempre_sem_espera: { topos: () => [pilha(
    M('evento_iniciar'),
    M('controle_sempre', null, dentro('DO', M('lego_hub_luz', { COR: 'RED' }))),
  )] },
  sempre_com_espera_dentro_do_se: { topos: () => [pilha(
    M('evento_iniciar'),
    M('controle_sempre', null, dentro('DO',
      M('controle_se', null, Object.assign({ CONDICAO: bool(true) }, dentro('DO', M('controle_espere_ms', { MS: 20 })))))),
  )] },
};

/* ============ 1) referência byte a byte + 2) compila + 3) determinismo ============ */
async function conferirPrograma(nome, def) {
  const ws = carregarWorkspace(def.topos(), def.variaveis);
  const r = gerar(ws);
  const arq = path.join(aqui, 'esperados', 'lego_' + nome + '.py');
  if (gravar) { fs.writeFileSync(arq, r.codigo); return; }
  assert.equal(r.codigo, fs.readFileSync(arq, 'utf8'), 'diferente do esperado (' + arq + ')');
  if (r.codigo) await compila(r.codigo);
  assert.equal(gerar(ws).codigo, r.codigo, 'gerar duas vezes deu textos diferentes');
  const ws2 = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(JSON.parse(JSON.stringify(Blockly.serialization.workspaces.save(ws))), ws2);
  assert.equal(gerar(ws2).codigo, r.codigo, 'salvar → recarregar mudou o código');
}

console.log('Gerador LEGO / Pybricks\n');
for (const [nome, def] of Object.entries(PROGRAMAS)) await teste('referência: ' + nome, () => conferirPrograma(nome, def));

await teste('sem chapéu: nada é gerado, com aviso', () => {
  const r = gerar(carregarWorkspace([M('lego_hub_luz', { COR: 'RED' })]));
  assert.equal(r.codigo, '');
  assert.match(r.aviso, /quando/);
});
await teste('dois chapéus: só o primeiro vale, com aviso', () => {
  const r = gerar(carregarWorkspace([pilha(M('evento_iniciar'), M('lego_hub_luz', { COR: 'RED' })), pilha(M('evento_iniciar'), M('lego_hub_luz', { COR: 'BLUE' }))]));
  assert.match(r.codigo, /Color\.RED/);
  assert.doesNotMatch(r.codigo, /Color\.BLUE/);
  assert.match(r.aviso, /mais de um/);
});

/* ============ exemplos do menu ============ */
for (const ex of globalThis.LEGO_EXEMPLOS) {
  await teste('exemplo: ' + ex.nome, async () => {
    if (ex.tipo === 'python') {
      await compila(ex.python);
      if (gravar) fs.writeFileSync(path.join(aqui, 'esperados', 'lego_ex_' + ex.id + '.py'), ex.python);
      return;
    }
    const ws = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(JSON.parse(JSON.stringify(ex.blocos)), ws);
    const r = gerar(ws);
    const arq = path.join(aqui, 'esperados', 'lego_ex_' + ex.id + '.py');
    if (gravar) { fs.writeFileSync(arq, r.codigo); return; }
    assert.equal(r.codigo, fs.readFileSync(arq, 'utf8'));
    await compila(r.codigo);
    assert.equal(gerar(ws).codigo, r.codigo);
  });
}
await teste('exemplos: ids únicos e descrição em português', () => {
  const ids = globalThis.LEGO_EXEMPLOS.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const e of globalThis.LEGO_EXEMPLOS) assert.ok(e.nome && e.descricao && (e.python || e.blocos));
});

/* ============ toolbox ============ */
const toolbox = blocosMontarToolboxLego();
const itens = toolbox.contents.flatMap((c) => c.contents.filter((i) => i.kind === 'block').map((i) => ({ cat: c.name, ...i })));
const PROIBIDOS = /^(arduino_|atuadores_|sensores_|display_|serial_)/;

await teste('toolbox LEGO: nenhum bloco de hardware do Arduino', () => {
  assert.ok(itens.length > 40);
  const ruins = itens.filter((i) => PROIBIDOS.test(i.type)).map((i) => i.type);
  assert.deepEqual(ruins, []);
});
await teste('toolbox LEGO: todo bloco está definido e tem gerador Python', () => {
  for (const i of itens) {
    assert.ok(Blockly.Blocks[i.type], 'bloco sem definição: ' + i.type);
    assert.ok(geradorPybricks.forBlock[i.type], 'sem forBlock Pybricks: ' + i.type);
  }
  for (const c of toolbox.contents) assert.ok(c.categorystyle.endsWith('_category'));
});
await teste('toolbox LEGO: cada bloco, com os valores-padrão do flyout, gera Python que compila', async () => {
  for (const i of itens) {
    if (i.type === 'variables_get' || i.type === 'variables_set' || i.type === 'variaveis_somar' || i.type === 'controle_sempre') continue; // precisam de variável / têm teste próprio
    if (i.type === 'evento_iniciar') continue; // chapéu: coberto pelos programas de referência
    const b = bloco(i.type, null, i.inputs && JSON.parse(JSON.stringify(i.inputs)));
    const ehValor = !!Blockly.Blocks[i.type] && (() => { const t = new Blockly.Workspace(); const x = t.newBlock(i.type); const v = !!x.outputConnection; x.dispose(); t.dispose(); return v; })();
    const topo = ehValor
      ? pilha(M('evento_iniciar'), M('lego_monitor_escrever', null, { TEXTO: ref(b) }))
      : pilha(M('evento_iniciar'), b);
    const codigo = gerar(carregarWorkspace([topo])).codigo;
    assert.ok(codigo.length > 20, i.type);
    await compila(codigo).catch((e) => { throw new Error(i.type + ' → ' + e.message); });
  }
});
await teste('Blockly: nenhuma definição LEGO usa estilo/categoria inexistente no tema', () => {
  const estilos = blocosMontarBlockStyles();
  const cats = blocosMontarCategoryStyles();
  for (const d of BLOCOS_LEGO_DEFINICOES) assert.ok(estilos[d.style], d.type + ' sem estilo ' + d.style);
  for (const c of toolbox.contents) assert.ok(cats[c.categorystyle], 'categoria sem estilo ' + c.categorystyle);
});

console.log('\n' + (total - falhas) + '/' + total + ' testes passaram');
if (!gravar) process.exit(falhas ? 1 : 0);
