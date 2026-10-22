/* ============================================================
 * blocos_k10_gen.js — Modo Blocos, UNIHIKER K10: blocos → C++ e
 * blocos → MicroPython (o mesmo workspace vale nas duas linguagens)
 * ------------------------------------------------------------
 * C++: a mesma forma das atividades da trilha (k10.js), que já foram
 * testadas na placa: #include, UNIHIKER_K10 k10, setup() com
 * k10.begin() e loop().
 * MicroPython: a API do firmware MicroPython da UNIHIKER (unihiker_k10:
 * screen, rgb, button, light, acce, temp_humi, mic, speaker; k10_base:
 * Camera, TF_card). O que esse firmware ainda não tem (tom no
 * alto-falante, nível do microfone, foto, driver de motores…) vira uma
 * função auxiliar que mostra no Monitor o que aconteceria — o programa
 * roda e o comentário diz o porquê.
 *
 * Variáveis (as duas linguagens): a primeira atribuição decide o tipo
 * (temperatura/umidade → float, texto → String, cor → uint32_t, o
 * resto → int). Em C++, quem só aparece dentro do loop e nasce numa
 * atribuição no começo dele vira variável local ("int luz = …");
 * quem guarda valor de uma repetição para a outra vira global
 * ("int x = 0;" antes do setup, com o valor inicial que o bloco
 * "mude x para …" do começo do programa der).
 * ============================================================ */
'use strict';

function k10CriarGerador(nome, py) {
  const g = new Blockly.Generator(nome);
  Object.assign(g, {
    ORDER_ATOMIC: 0, ORDER_UNARY: 1, ORDER_MULTIPLICATIVE: 2, ORDER_ADDITIVE: 3, ORDER_RELATIONAL: 4,
    ORDER_LOGICAL_NOT: 4.5, ORDER_LOGICAL_AND: 5, ORDER_LOGICAL_OR: 6, ORDER_NONE: 99,
  });
  g.INDENT = py ? '    ' : '  ';
  g.py = py;
  g.init = function (ws) {
    Blockly.Generator.prototype.init.call(this);
    if (!this.nameDB_) this.nameDB_ = new Blockly.Names('');
    else this.nameDB_.reset();
    this.nameDB_.setVariableMap(ws.getVariableMap());
    this.usos = new Set();
    this.auxiliares = new Map();
  };
  g.finish = (c) => c;
  g.scrub_ = function (block, code, thisOnly) {
    const prox = block.nextConnection && block.nextConnection.targetBlock();
    if (prox && !thisOnly) return code + this.blockToCode(prox);
    return code;
  };
  return g;
}

const geradorK10Cpp = k10CriarGerador('K10Cpp', false);
const geradorK10Py = k10CriarGerador('K10Py', true);

/* ------------------------------------------------------------
 * Tipos e variáveis
 * ---------------------------------------------------------- */
const K10_NOME_TIPO = { int: 'int', float: 'float', String: 'String', cor: 'uint32_t', bool: 'bool' };
const _k10Var = (b) => { const f = b.getField('VAR'); const v = f && f.getVariable && f.getVariable(); return v ? v.getName() : 'x'; };

function k10TipoExpr(b, tipos) {
  if (!b) return 'int';
  switch (b.type) {
    case 'k10_temperatura': case 'k10_umidade': return 'float';
    case 'text': case 'operador_juntar': case 'k10_wifi_ip': case 'k10_wifi_nome': case 'k10_texto_de': return 'String';
    case 'k10_cor': return 'cor';
    case 'variables_get': return (tipos && tipos.get(_k10Var(b))) || 'int';
    case 'logic_boolean': case 'k10_botao': case 'k10_gesto': case 'k10_wifi_conectado':
    case 'operador_maior': case 'operador_menor': case 'operador_igual': case 'operador_maior_igual':
    case 'operador_menor_igual': case 'operador_diferente': case 'operador_e': case 'operador_ou': case 'operador_nao':
      return 'bool';
    case 'math_number': return String(b.getFieldValue('NUM')).includes('.') ? 'float' : 'int';
    case 'operador_soma': case 'operador_subtracao': case 'operador_multiplicacao': case 'operador_divisao': {
      const a = k10TipoExpr(b.getInputTargetBlock('A'), tipos), c = k10TipoExpr(b.getInputTargetBlock('B'), tipos);
      return a === 'float' || c === 'float' ? 'float' : 'int';
    }
    default: return 'int';
  }
}

/* Percorre o programa e decide onde cada variável nasce. */
function k10AnalisarVariaveis(setup, loop) {
  const ev = new Map();   // nome → [{fase, nivel, tipo, bloco}]
  const reg = (nome, e) => { if (!ev.has(nome)) ev.set(nome, []); ev.get(nome).push(e); };
  const valores = (b, fase, nivel) => {
    if (!b) return;
    for (const inp of b.inputList) {
      if (inp.type !== 1) continue;   // só entradas de valor
      const alvo = inp.connection && inp.connection.targetBlock();
      if (!alvo) continue;
      if (alvo.type === 'variables_get') reg(_k10Var(alvo), { fase, nivel, tipo: 'ler', bloco: alvo });
      valores(alvo, fase, nivel);
    }
  };
  const pilha = (b, fase, nivel) => {
    for (; b; b = b.getNextBlock()) {
      if (!b.isEnabled()) continue;
      valores(b, fase, nivel);
      if (b.type === 'variables_set') reg(_k10Var(b), { fase, nivel, tipo: 'mudar', bloco: b });
      if (b.type === 'variaveis_somar') reg(_k10Var(b), { fase, nivel, tipo: 'somar', bloco: b });
      for (const inp of b.inputList) if (inp.type === 3 && inp.connection && inp.connection.targetBlock()) pilha(inp.connection.targetBlock(), fase, nivel + 1);
    }
  };
  /* setup = os blocos da pilha do chapéu antes do "sempre" (cada um sem os seguintes) */
  for (const b of setup) {
    valores(b, 'setup', 0);
    if (b.type === 'variables_set') reg(_k10Var(b), { fase: 'setup', nivel: 0, tipo: 'mudar', bloco: b });
    if (b.type === 'variaveis_somar') reg(_k10Var(b), { fase: 'setup', nivel: 0, tipo: 'somar', bloco: b });
    for (const inp of b.inputList) if (inp.type === 3 && inp.connection && inp.connection.targetBlock()) pilha(inp.connection.targetBlock(), 'setup', 1);
  }
  if (loop) pilha(loop, 'loop', 0);

  const tipos = new Map();
  const declarar = new Set();   // ids de "mude" que viram declaração
  const suprimir = new Set();   // ids de "mude" que viraram valor inicial da global
  const globais = [];           // {nome, tipo, inicio: bloco de valor | null}
  /* tipos primeiro (podem depender uns dos outros: c = a + b) */
  for (let volta = 0; volta < 3; volta++) {
    for (const [nome, lista] of ev) {
      const m = lista.find((e) => e.tipo === 'mudar');
      tipos.set(nome, m ? k10TipoExpr(m.bloco.getInputTargetBlock('VALUE'), tipos) : 'int');
    }
  }
  for (const [nome, lista] of ev) {
    const noSetup = lista.filter((e) => e.fase === 'setup');
    const noLoop = lista.filter((e) => e.fase === 'loop');
    const tipo = tipos.get(nome);
    const p = lista[0];
    if (!noLoop.length) {
      if (p.tipo === 'mudar' && p.nivel === 0) declarar.add(p.bloco.id);
      else globais.push({ nome, tipo, inicio: null });
      continue;
    }
    if (noSetup.length) {
      const s = noSetup[0];
      const valor = s.tipo === 'mudar' ? s.bloco.getInputTargetBlock('VALUE') : null;
      const literal = valor && ['math_number', 'text', 'k10_cor', 'logic_boolean'].includes(valor.type);
      if (noSetup.length === 1 && s.tipo === 'mudar' && s.nivel === 0 && literal) {
        suprimir.add(s.bloco.id);
        globais.push({ nome, tipo, inicio: valor });
      } else globais.push({ nome, tipo, inicio: null });
      continue;
    }
    if (p.tipo === 'mudar' && p.nivel === 0) declarar.add(p.bloco.id);
    else globais.push({ nome, tipo, inicio: null });
  }
  return { tipos, declarar, suprimir, globais };
}

/* ------------------------------------------------------------
 * Ajudantes de texto
 * ---------------------------------------------------------- */
function k10Hex(b) { return String(b && b.getFieldValue('COR') || '0x000000'); }
const _k10msPySeg = (ms) => { const s = Number(ms) / 1000; return String(Math.round(s * 1000) / 1000); };

/* valor como texto: C++ String(...) quando não é texto; MicroPython str(...) */
function k10ComoTexto(gen, bloco, nomeEntrada) {
  const alvo = bloco.getInputTargetBlock(nomeEntrada);
  const tipo = k10TipoExpr(alvo, gen.tipos);
  if (gen.py) {
    const c = gen.valueToCode(bloco, nomeEntrada, tipo === 'String' ? gen.ORDER_ADDITIVE : gen.ORDER_NONE) || '""';
    return tipo === 'String' ? c : 'str(' + c + ')';
  }
  const c = gen.valueToCode(bloco, nomeEntrada, tipo === 'String' ? gen.ORDER_ADDITIVE : gen.ORDER_NONE) || '""';
  if (tipo === 'String') return c;
  if (tipo === 'float') return 'String(' + c + ', 1)';
  return 'String(' + c + ')';
}

/* Arquivo no microSD: no C++ do K10 o cartão é "S:/" */
function k10Arquivo(gen, bloco, entrada) {
  const alvo = bloco.getInputTargetBlock(entrada);
  if (alvo && alvo.type === 'text') {
    const nome = String(alvo.getFieldValue('TEXT') || '').replace(/^S:\//, '').replace(/"/g, '');
    return gen.py ? '"' + nome + '"' : '"S:/' + nome + '"';
  }
  const c = gen.valueToCode(bloco, entrada, gen.ORDER_ADDITIVE) || '""';
  return gen.py ? c : '"S:/" + ' + c;
}

const K10_CANAIS = { M1: [7, 6], M2: [5, 4], M3: [3, 2], M4: [1, 0] };

/* Funções auxiliares do MicroPython (uma vez cada, no começo do programa). */
const K10_PY_AUX = {
  mapear: 'def mapear(valor, de_min, de_max, para_min, para_max):\n    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)',
  forca: 'def forca_movimento():\n    # força do movimento = tamanho da aceleração nos três eixos\n    x, y, z = acce.read_x(), acce.read_y(), acce.read_z()\n    return int(math.sqrt(x * x + y * y + z * z))',
  gesto: 'def tela_para_cima(cima):\n    # aproximação pelo eixo Z do acelerômetro (o C++ tem o gesto pronto)\n    z = acce.read_z()\n    return z < -500 if cima else z > 500',
  microfone: 'def nivel_microfone():\n    # O MicroPython da K10 (firmware 0.9.2) ainda não lê o volume do microfone:\n    # no C++ é k10.readMICData(). Aqui o valor fica 0.\n    return 0',
  tom: 'def tocar_tom(freq, duracao):\n    # O MicroPython da K10 (firmware 0.9.2) ainda não tem um comando de tom\n    # documentado: no C++ é music.playTone(). Aqui o Monitor mostra o tom.\n    print("tom", freq, "Hz")',
  foto: 'def salvar_foto(arquivo):\n    # Salvar foto no microSD só existe no C++ (k10.photoSaveToTFCard).\n    print("foto:", arquivo)',
  imagem: 'def mostrar_imagem(arquivo):\n    # Mostrar imagem do microSD só existe no C++ (canvasDrawImage).\n    print("imagem:", arquivo)',
  motores: 'def motor(nome, velocidade):\n    # O driver de motores (PCA9685) é comandado pelo programa C++ da trilha;\n    # no MicroPython o Monitor mostra o que cada motor faria.\n    print("motor", nome, "velocidade", velocidade)\n\n\ndef servo(grau):\n    print("servo S1", grau, "graus")',
};
function k10Aux(gen, chave) { gen.usos.add('aux:' + chave); }

/* ------------------------------------------------------------
 * Blocos comuns (Controle, Operadores, Variáveis, Serial)
 * ---------------------------------------------------------- */
for (const gen of [geradorK10Cpp, geradorK10Py]) {
  const F = gen.forBlock;
  const py = gen.py;
  F.evento_iniciar = () => '';
  F.controle_sempre = () => '';
  F.controle_espere_ms = (b) => { if (py) { gen.usos.add('time'); return 'time.sleep(' + _k10msPySeg(b.getFieldValue('MS')) + ')\n'; } return 'delay(' + Math.round(Number(b.getFieldValue('MS')) || 0) + ');\n'; };
  F.controle_espere_seg = (b) => { const s = Number(b.getFieldValue('SEG')) || 0; if (py) { gen.usos.add('time'); return 'time.sleep(' + s + ')\n'; } return 'delay(' + Math.round(s * 1000) + ');\n'; };
  const corpo = (b, nome) => { const c = gen.statementToCode(b, nome); return py && !c.trim() ? gen.INDENT + 'pass\n' : c; };
  F.controle_repita_vezes = (b) => {
    const n = Math.round(Number(b.getFieldValue('VEZES')) || 0);
    return py ? 'for i in range(' + n + '):\n' + corpo(b, 'DO') : 'for (int i = 0; i < ' + n + '; i++) {\n' + corpo(b, 'DO') + '}\n';
  };
  F.controle_repita_ate = (b) => {
    const c = gen.valueToCode(b, 'CONDICAO', gen.ORDER_NONE) || (py ? 'False' : 'false');
    return py ? 'while not (' + c + '):\n' + corpo(b, 'DO') : 'while (!(' + c + ')) {\n' + corpo(b, 'DO') + '}\n';
  };
  F.controle_se = (b) => {
    const c = gen.valueToCode(b, 'CONDICAO', gen.ORDER_NONE) || (py ? 'False' : 'false');
    return py ? 'if ' + c + ':\n' + corpo(b, 'DO') : 'if (' + c + ') {\n' + corpo(b, 'DO') + '}\n';
  };
  F.controle_se_senao = (b) => {
    const c = gen.valueToCode(b, 'CONDICAO', gen.ORDER_NONE) || (py ? 'False' : 'false');
    // "senão" com um único "se" dentro vira "else if" / "elif" (como se escreve à mão)
    const dentro = b.getInputTargetBlock('SENAO');
    if (dentro && !dentro.getNextBlock() && !dentro.isDisabled?.() && (dentro.type === 'controle_se' || dentro.type === 'controle_se_senao')) {
      const resto = gen.blockToCode(dentro);
      return py ? 'if ' + c + ':\n' + corpo(b, 'DO') + 'el' + resto
        : 'if (' + c + ') {\n' + corpo(b, 'DO') + '} else ' + resto;
    }
    return py ? 'if ' + c + ':\n' + corpo(b, 'DO') + 'else:\n' + corpo(b, 'SENAO')
      : 'if (' + c + ') {\n' + corpo(b, 'DO') + '} else {\n' + corpo(b, 'SENAO') + '}\n';
  };
  F.controle_pare = () => (py ? 'continue\n' : 'return;\n');

  const bin = (cpp, pyop, ordem) => (b) => {
    const a = gen.valueToCode(b, 'A', ordem) || '0';
    const c = gen.valueToCode(b, 'B', ordem) || '0';
    return [a + ' ' + (py ? pyop : cpp) + ' ' + c, ordem];
  };
  F.operador_soma = bin('+', '+', gen.ORDER_ADDITIVE);
  F.operador_subtracao = bin('-', '-', gen.ORDER_ADDITIVE);
  F.operador_multiplicacao = bin('*', '*', gen.ORDER_MULTIPLICATIVE);
  F.operador_divisao = (b) => {
    const inteiro = k10TipoExpr(b, gen.tipos) !== 'float';
    return bin('/', inteiro ? '//' : '/', gen.ORDER_MULTIPLICATIVE)(b);
  };
  F.operador_resto = bin('%', '%', gen.ORDER_MULTIPLICATIVE);
  F.operador_maior = bin('>', '>', gen.ORDER_RELATIONAL);
  F.operador_menor = bin('<', '<', gen.ORDER_RELATIONAL);
  F.operador_igual = bin('==', '==', gen.ORDER_RELATIONAL);
  F.operador_maior_igual = bin('>=', '>=', gen.ORDER_RELATIONAL);
  F.operador_menor_igual = bin('<=', '<=', gen.ORDER_RELATIONAL);
  F.operador_diferente = bin('!=', '!=', gen.ORDER_RELATIONAL);
  F.operador_e = bin('&&', 'and', gen.ORDER_LOGICAL_AND);
  F.operador_ou = bin('||', 'or', gen.ORDER_LOGICAL_OR);
  F.operador_nao = (b) => { const a = gen.valueToCode(b, 'A', gen.ORDER_UNARY) || (py ? 'False' : 'false'); return py ? ['not ' + a, gen.ORDER_LOGICAL_NOT] : ['!(' + a + ')', gen.ORDER_UNARY]; };
  F.operador_aleatorio = (b) => {
    const de = gen.valueToCode(b, 'DE', gen.ORDER_NONE) || '0', ate = gen.valueToCode(b, 'ATE', gen.ORDER_NONE) || '0';
    if (py) { gen.usos.add('random'); return ['random.randint(' + de + ', ' + ate + ')', gen.ORDER_ATOMIC]; }
    return ['random(' + de + ', (' + ate + ') + 1)', gen.ORDER_ATOMIC];
  };
  F.operador_arredondar = (b) => ['round(' + (gen.valueToCode(b, 'A', gen.ORDER_NONE) || '0') + ')', gen.ORDER_ATOMIC];
  F.operador_limitar = (b) => {
    const v = gen.valueToCode(b, 'VALOR', gen.ORDER_NONE) || '0', a = gen.valueToCode(b, 'MIN', gen.ORDER_NONE) || '0', c = gen.valueToCode(b, 'MAX', gen.ORDER_NONE) || '0';
    return [py ? 'max(' + a + ', min(' + c + ', ' + v + '))' : 'constrain(' + v + ', ' + a + ', ' + c + ')', gen.ORDER_ATOMIC];
  };
  F.operador_juntar = (b) => {
    let a = k10ComoTexto(gen, b, 'A');
    const c = k10ComoTexto(gen, b, 'B');
    const ta = b.getInputTargetBlock('A'), tc = b.getInputTargetBlock('B');
    if (!py && ta && ta.type === 'text' && tc && tc.type === 'text') a = 'String(' + a + ')';   // "a" + "b" não soma em C++
    return [a + ' + ' + c, gen.ORDER_ADDITIVE];
  };
  F.math_number = (b) => { const n = Number(b.getFieldValue('NUM')); return n < 0 ? ['-' + (-n), gen.ORDER_UNARY] : [String(n), gen.ORDER_ATOMIC]; };
  F.text = (b) => ['"' + String(b.getFieldValue('TEXT') || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"', gen.ORDER_ATOMIC];
  F.logic_boolean = (b) => [b.getFieldValue('BOOL') === 'TRUE' ? (py ? 'True' : 'true') : (py ? 'False' : 'false'), gen.ORDER_ATOMIC];

  F.variables_get = (b) => [_k10Var(b), gen.ORDER_ATOMIC];
  F.variables_set = (b) => {
    if (gen.suprimir && gen.suprimir.has(b.id)) return '';
    const nome = _k10Var(b);
    const valor = gen.valueToCode(b, 'VALUE', gen.ORDER_NONE) || '0';
    if (!py && gen.declarar && gen.declarar.has(b.id)) return K10_NOME_TIPO[gen.tipos.get(nome) || 'int'] + ' ' + nome + ' = ' + valor + (py ? '\n' : ';\n');
    return nome + ' = ' + valor + (py ? '\n' : ';\n');
  };
  F.variaveis_somar = (b) => _k10Var(b) + ' += ' + (gen.valueToCode(b, 'VALOR', gen.ORDER_NONE) || '0') + (py ? '\n' : ';\n');

  /* Monitor Serial */
  F.k10_serial_iniciar = () => (py ? '# o print() já aparece no Monitor Serial\n' : 'Serial.begin(115200);\n');
  F.serial_escrever_linha = (b) => { const x = gen.valueToCode(b, 'TEXTO', gen.ORDER_NONE) || '""'; return py ? 'print(' + x + ')\n' : 'Serial.println(' + x + ');\n'; };
  F.serial_escrever = (b) => { const x = gen.valueToCode(b, 'TEXTO', gen.ORDER_NONE) || '""'; return py ? 'print(' + x + ', end="")\n' : 'Serial.print(' + x + ');\n'; };
}

/* ------------------------------------------------------------
 * Blocos da K10 — C++
 * ---------------------------------------------------------- */
(function () {
  const g = geradorK10Cpp, F = g.forBlock;
  const v = (b, n) => g.valueToCode(b, n, g.ORDER_NONE) || '0';
  const cor = (b) => v(b, 'COR');
  F.k10_cor = (b) => [k10Hex(b), g.ORDER_ATOMIC];
  F.k10_rgb_brilho = (b) => 'k10.rgb->brightness(' + v(b, 'N') + ');\n';
  F.k10_rgb = (b) => 'k10.rgb->write(' + b.getFieldValue('LED') + ', ' + cor(b) + ');\n';
  F.k10_rgb_apagar = () => 'k10.rgb->write(-1, 0x000000);\n';
  F.k10_mapear = (b) => ['map(' + ['VALOR', 'DE_MIN', 'DE_MAX', 'PARA_MIN', 'PARA_MAX'].map((n) => v(b, n)).join(', ') + ')', g.ORDER_ATOMIC];
  F.k10_texto_de = (b) => ['String(' + v(b, 'VALOR') + ', ' + v(b, 'CASAS') + ')', g.ORDER_ATOMIC];

  F.k10_tela_iniciar_cor = (b) => 'k10.initScreen(2);\nk10.creatCanvas();\nk10.setScreenBackground(' + cor(b) + ');\n';
  F.k10_tela_iniciar = () => 'k10.initScreen(2);\nk10.creatCanvas();\n';
  F.k10_tela_camera = () => 'k10.initScreen(2);\nk10.initBgCamerImage();\nk10.setBgCamerImage(true);\nk10.creatCanvas();\n';
  F.k10_tela_texto = (b) => 'k10.canvas->canvasText(' + k10ComoTexto(g, b, 'TEXTO') + ', ' + v(b, 'LINHA') + ', ' + cor(b) + ');\n';
  F.k10_tela_limpar = () => 'k10.canvas->canvasClear();\n';
  F.k10_tela_atualizar = () => 'k10.canvas->updateCanvas();\n';
  F.k10_tela_ponto = (b) => 'k10.canvas->canvasPoint(' + v(b, 'X') + ', ' + v(b, 'Y') + ', ' + cor(b) + ');\n';
  F.k10_tela_linha = (b) => 'k10.canvas->canvasLine(' + ['X0', 'Y0', 'X1', 'Y1'].map((n) => v(b, n)).join(', ') + ', ' + cor(b) + ');\n';
  F.k10_tela_circulo = (b) => 'k10.canvas->canvasCircle(' + v(b, 'X') + ', ' + v(b, 'Y') + ', ' + v(b, 'R') + ', ' + cor(b) + ', ' + cor(b) + ', ' + b.getFieldValue('CHEIO') + ');\n';
  F.k10_tela_retangulo = (b) => 'k10.canvas->canvasRectangle(' + ['X', 'Y', 'L', 'A'].map((n) => v(b, n)).join(', ') + ', ' + cor(b) + ', ' + cor(b) + ', ' + b.getFieldValue('CHEIO') + ');\n';
  F.k10_tela_qr = (b) => 'k10.canvasDrawCode(' + (g.valueToCode(b, 'TEXTO', g.ORDER_NONE) || '""') + ');\n';
  F.k10_tela_imagem = (b) => 'k10.canvas->canvasDrawImage(0, 0, ' + k10Arquivo(g, b, 'ARQ') + ');\n';

  F.k10_botao = (b) => ['k10.button' + b.getFieldValue('BOTAO') + '->isPressed()', g.ORDER_ATOMIC];
  F.k10_luz = () => ['k10.readALS()', g.ORDER_ATOMIC];
  F.k10_acel = (b) => ['k10.getAccelerometer' + b.getFieldValue('EIXO') + '()', g.ORDER_ATOMIC];
  F.k10_forca = () => ['k10.getStrength()', g.ORDER_ATOMIC];
  F.k10_gesto = (b) => ['k10.isGesture(' + b.getFieldValue('GESTO') + ')', g.ORDER_ATOMIC];
  F.k10_clima_iniciar = () => { g.usos.add('clima'); return 'while (clima.begin() != 0) {\n  delay(1000);\n}\n'; };
  F.k10_clima_medir = () => { g.usos.add('clima'); return 'clima.startMeasurementReady(true);\n'; };
  F.k10_temperatura = () => { g.usos.add('clima'); return ['clima.getTemperature_C()', g.ORDER_ATOMIC]; };
  F.k10_umidade = () => { g.usos.add('clima'); return ['clima.getHumidity_RH()', g.ORDER_ATOMIC]; };
  F.k10_microfone = () => ['k10.readMICData()', g.ORDER_ATOMIC];

  F.k10_tom = (b) => { g.usos.add('music'); return 'music.playTone(' + v(b, 'FREQ') + ', ' + v(b, 'DUR') + ');\n'; };
  F.k10_gravar = (b) => { g.usos.add('music'); return 'music.recordSaveToTFCard(' + k10Arquivo(g, b, 'ARQ') + ', ' + v(b, 'SEG') + ');\n'; };
  F.k10_tocar_arquivo = (b) => { g.usos.add('music'); return 'music.playTFCardAudio(' + k10Arquivo(g, b, 'ARQ') + ');\n'; };
  F.k10_sd_iniciar = () => 'k10.initSDFile();\n';
  F.k10_foto = (b) => 'k10.photoSaveToTFCard(' + k10Arquivo(g, b, 'ARQ') + ');\n';

  const wifi = (c) => { g.usos.add('wifi'); return c; };
  F.k10_wifi_ligar = () => wifi('WiFi.mode(WIFI_STA);\n');
  F.k10_wifi_desconectar = () => wifi('WiFi.disconnect();\n');
  F.k10_wifi_conectar = (b) => wifi('WiFi.begin(' + (g.valueToCode(b, 'SSID', g.ORDER_NONE) || '""') + ', ' + (g.valueToCode(b, 'SENHA', g.ORDER_NONE) || '""') + ');\n');
  F.k10_wifi_redes = () => wifi(['WiFi.scanNetworks()', g.ORDER_ATOMIC]);
  F.k10_wifi_para_cada = (b) => wifi('int redes = WiFi.scanNetworks();\nfor (int i = 0; i < redes; i++) {\n' + g.statementToCode(b, 'DO') + '}\n');
  F.k10_wifi_nome = () => wifi(['WiFi.SSID(i)', g.ORDER_ATOMIC]);
  F.k10_wifi_conectado = () => wifi(['WiFi.status() == WL_CONNECTED', g.ORDER_RELATIONAL]);
  F.k10_wifi_ip = () => wifi(['WiFi.localIP().toString()', g.ORDER_ATOMIC]);

  F.k10_motores_iniciar = () => { g.usos.add('motores'); return 'pcaEscreve(MODE1, 0x00);\ndelay(10);\npcaFrequencia(53);\ndelay(100);\n'; };
  F.k10_motor = (b) => { g.usos.add('motores'); const [a, c] = K10_CANAIS[b.getFieldValue('M')]; return 'motor(' + a + ', ' + c + ', ' + v(b, 'VEL') + '); // ' + b.getFieldValue('M') + '\n'; };
  F.k10_motor_parar = (b) => { g.usos.add('motores'); const [a, c] = K10_CANAIS[b.getFieldValue('M')]; return 'pararMotor(' + a + ', ' + c + '); // ' + b.getFieldValue('M') + '\n'; };
  F.k10_servo = (b) => { g.usos.add('motores'); return 'servoGrau(15, ' + v(b, 'GRAU') + '); // porta S1 do driver\n'; };
})();

/* ------------------------------------------------------------
 * Blocos da K10 — MicroPython
 * ---------------------------------------------------------- */
(function () {
  const g = geradorK10Py, F = g.forBlock;
  const v = (b, n) => g.valueToCode(b, n, g.ORDER_NONE) || '0';
  const usa = (...m) => m.forEach((x) => g.usos.add(x));
  const cor = (b) => v(b, 'COR');
  const yDaLinha = (b) => {
    const alvo = b.getInputTargetBlock('LINHA');
    if (alvo && alvo.type === 'math_number') return String(20 + (Number(alvo.getFieldValue('NUM')) - 1) * 40);
    return '20 + (' + v(b, 'LINHA') + ' - 1) * 40';
  };
  F.k10_cor = (b) => [k10Hex(b), g.ORDER_ATOMIC];
  F.k10_rgb_brilho = (b) => { usa('rgb'); return 'rgb.brightness(' + v(b, 'N') + ')\n'; };
  F.k10_rgb = (b) => { usa('rgb'); const led = b.getFieldValue('LED'); return led === '-1' ? 'rgb.write(color=' + cor(b) + ')\n' : 'rgb.write(num=' + led + ', color=' + cor(b) + ')\n'; };
  F.k10_rgb_apagar = () => { usa('rgb'); return 'rgb.clear()\n'; };
  F.k10_mapear = (b) => { k10Aux(g, 'mapear'); return ['mapear(' + ['VALOR', 'DE_MIN', 'DE_MAX', 'PARA_MIN', 'PARA_MAX'].map((n) => v(b, n)).join(', ') + ')', g.ORDER_ATOMIC]; };
  F.k10_texto_de = (b) => ['str(round(' + v(b, 'VALOR') + ', ' + v(b, 'CASAS') + '))', g.ORDER_ATOMIC];

  F.k10_tela_iniciar_cor = (b) => { usa('screen'); return 'screen.init(dir=2)\nscreen.show_bg(color=' + cor(b) + ')\n'; };
  F.k10_tela_iniciar = () => { usa('screen'); return 'screen.init(dir=2)\n'; };
  F.k10_tela_camera = () => { usa('screen', 'Camera'); return 'camera = Camera()\ncamera.init()\nscreen.init(dir=2)\nscreen.show_camera(camera)\n'; };
  F.k10_tela_texto = (b) => { usa('screen'); return 'screen.draw_text(text=' + k10ComoTexto(g, b, 'TEXTO') + ', x=10, y=' + yDaLinha(b) + ', font_size=24, color=' + cor(b) + ')\n'; };
  F.k10_tela_limpar = () => { usa('screen'); return 'screen.clear()\n'; };
  F.k10_tela_atualizar = () => { usa('screen'); return 'screen.show_draw()\n'; };
  F.k10_tela_ponto = (b) => { usa('screen'); return 'screen.draw_point(x=' + v(b, 'X') + ', y=' + v(b, 'Y') + ', color=' + cor(b) + ')\n'; };
  F.k10_tela_linha = (b) => { usa('screen'); return 'screen.draw_line(x0=' + v(b, 'X0') + ', y0=' + v(b, 'Y0') + ', x1=' + v(b, 'X1') + ', y1=' + v(b, 'Y1') + ', color=' + cor(b) + ')\n'; };
  F.k10_tela_circulo = (b) => { usa('screen'); const c = cor(b); return 'screen.draw_circle(x=' + v(b, 'X') + ', y=' + v(b, 'Y') + ', r=' + v(b, 'R') + ', bcolor=' + c + (b.getFieldValue('CHEIO') === 'true' ? ', fcolor=' + c : '') + ')\n'; };
  F.k10_tela_retangulo = (b) => { usa('screen'); const c = cor(b); return 'screen.draw_rect(x=' + v(b, 'X') + ', y=' + v(b, 'Y') + ', w=' + v(b, 'L') + ', h=' + v(b, 'A') + ', bcolor=' + c + (b.getFieldValue('CHEIO') === 'true' ? ', fcolor=' + c : '') + ')\n'; };
  F.k10_tela_qr = (b) => { usa('screen'); return 'screen.draw_qr_code(text=' + (g.valueToCode(b, 'TEXTO', g.ORDER_NONE) || '""') + ', x=35, y=45, size=6)\n'; };
  F.k10_tela_imagem = (b) => { k10Aux(g, 'imagem'); return 'mostrar_imagem(' + k10Arquivo(g, b, 'ARQ') + ')\n'; };

  F.k10_botao = (b) => { const l = b.getFieldValue('BOTAO').toLowerCase(); usa('button', 'botao_' + l); return ['botao_' + l + '.status()', g.ORDER_ATOMIC]; };
  F.k10_luz = () => { usa('light'); return ['light.read()', g.ORDER_ATOMIC]; };
  F.k10_acel = (b) => { usa('acce'); return ['acce.read_' + b.getFieldValue('EIXO').toLowerCase() + '()', g.ORDER_ATOMIC]; };
  F.k10_forca = () => { usa('acce', 'math'); k10Aux(g, 'forca'); return ['forca_movimento()', g.ORDER_ATOMIC]; };
  F.k10_gesto = (b) => { usa('acce'); k10Aux(g, 'gesto'); return ['tela_para_cima(' + (b.getFieldValue('GESTO') === 'ScreenUp' ? 'True' : 'False') + ')', g.ORDER_ATOMIC]; };
  F.k10_clima_iniciar = () => '# o sensor de clima (AHT20) já vem pronto no MicroPython da K10\n';
  F.k10_clima_medir = () => '';
  F.k10_temperatura = () => { usa('temp_humi'); return ['temp_humi.read_temp()', g.ORDER_ATOMIC]; };
  F.k10_umidade = () => { usa('temp_humi'); return ['temp_humi.read_humi()', g.ORDER_ATOMIC]; };
  F.k10_microfone = () => { k10Aux(g, 'microfone'); return ['nivel_microfone()', g.ORDER_ATOMIC]; };

  F.k10_tom = (b) => { k10Aux(g, 'tom'); return 'tocar_tom(' + v(b, 'FREQ') + ', ' + v(b, 'DUR') + ')\n'; };
  F.k10_gravar = (b) => { usa('mic'); return 'mic.recode_tf(name=' + k10Arquivo(g, b, 'ARQ') + ', time=' + v(b, 'SEG') + ')\n'; };
  F.k10_tocar_arquivo = (b) => { usa('speaker'); return 'speaker.play_tf_music(' + k10Arquivo(g, b, 'ARQ') + ')\n'; };
  F.k10_sd_iniciar = () => { usa('TF_card'); return 'tf_card = TF_card()\n'; };
  F.k10_foto = (b) => { k10Aux(g, 'foto'); return 'salvar_foto(' + k10Arquivo(g, b, 'ARQ') + ')\n'; };

  const wifi = (c) => { usa('network'); return c; };
  F.k10_wifi_ligar = () => wifi('wifi.active(True)\n');
  F.k10_wifi_desconectar = () => wifi('wifi.disconnect()\n');
  F.k10_wifi_conectar = (b) => wifi('wifi.connect(' + (g.valueToCode(b, 'SSID', g.ORDER_NONE) || '""') + ', ' + (g.valueToCode(b, 'SENHA', g.ORDER_NONE) || '""') + ')\n');
  F.k10_wifi_redes = () => wifi(['len(wifi.scan())', g.ORDER_ATOMIC]);
  F.k10_wifi_para_cada = (b) => { const c = g.statementToCode(b, 'DO'); return wifi('for rede in wifi.scan():\n' + (c.trim() ? c : g.INDENT + 'pass\n')); };
  F.k10_wifi_nome = () => wifi(['rede[0].decode()', g.ORDER_ATOMIC]);
  F.k10_wifi_conectado = () => wifi(['wifi.isconnected()', g.ORDER_ATOMIC]);
  F.k10_wifi_ip = () => wifi(['wifi.ifconfig()[0]', g.ORDER_ATOMIC]);

  F.k10_motores_iniciar = () => { k10Aux(g, 'motores'); return 'print("driver de motores pronto")\n'; };
  F.k10_motor = (b) => { k10Aux(g, 'motores'); return 'motor("' + b.getFieldValue('M') + '", ' + v(b, 'VEL') + ')\n'; };
  F.k10_motor_parar = (b) => { k10Aux(g, 'motores'); return 'motor("' + b.getFieldValue('M') + '", 0)\n'; };
  F.k10_servo = (b) => { k10Aux(g, 'motores'); return 'servo(' + v(b, 'GRAU') + ')\n'; };
})();

/* ------------------------------------------------------------
 * Montagem dos programas
 * ---------------------------------------------------------- */
function k10Estrutura(ws) {
  const hats = ws.getTopBlocks(true).filter((b) => b.type === 'evento_iniciar' && b.isEnabled());
  if (!hats.length) return null;
  const setup = [];
  let loop = null;
  for (let b = hats[0].getNextBlock(); b; b = b.getNextBlock()) {
    if (b.type === 'controle_sempre' && loop === null) { loop = b; continue; }
    if (b.isEnabled() && loop === null) setup.push(b);
    else if (b.isEnabled() && loop !== null) setup.push(b);   // depois do "sempre" não há conexão; por segurança
  }
  return { hats, setup, sempre: loop, corpoLoop: loop ? loop.getInputTargetBlock('DO') : null };
}

/* Um bloco só (sem o próximo), já com o recuo do C/Python. */
function _k10Codigo(gen, b) { const c = gen.blockToCode(b, true); return typeof c === 'string' ? c : c[0]; }

function blocosGerarK10Cpp(ws) {
  const g = geradorK10Cpp;
  g.init(ws);
  const e = k10Estrutura(ws);
  if (!e) return { codigo: '', aviso: 'Arraste o bloco "quando ⚑ for clicado" para começar.' };
  Object.assign(g, k10AnalisarVariaveis(e.setup, e.corpoLoop));
  const setup = e.setup.map((b) => _k10Codigo(g, b)).join('');
  const loop = e.sempre ? g.statementToCode(e.sempre, 'DO') : '';
  const globais = g.globais.map((x) => {
    const t = K10_NOME_TIPO[x.tipo] || 'int';
    const ini = x.inicio ? (typeof g.blockToCode(x.inicio) === 'string' ? g.blockToCode(x.inicio) : g.blockToCode(x.inicio)[0])
      : (x.tipo === 'String' ? '""' : x.tipo === 'bool' ? 'false' : '0');
    return t + ' ' + x.nome + ' = ' + ini + ';';
  });
  const L = ['#include "unihiker_k10.h"'];
  if (g.usos.has('wifi')) L.push('#include <WiFi.h>');
  if (g.usos.has('motores') && typeof k10MotorExtras === 'string') L.push(k10MotorExtras.trim());
  L.push('');
  L.push('UNIHIKER_K10 k10;');
  if (g.usos.has('clima')) L.push('DFRobot_AHT20 clima;');
  if (g.usos.has('music')) L.push('Music music;');
  L.push(...globais);
  L.push('');
  L.push('void setup() {');
  L.push('  k10.begin();');
  if (setup) L.push(g.prefixLines(setup.replace(/\n$/, ''), g.INDENT));
  L.push('}');
  L.push('');
  L.push('void loop() {');
  L.push(loop ? loop.replace(/\n$/, '') : '');
  L.push('}');
  L.push('');
  return { codigo: L.join('\n'), aviso: e.hats.length > 1 ? 'Há mais de um bloco "quando ⚑ for clicado" — só o primeiro é usado.' : null };
}

const K10_PY_MODULOS = ['screen', 'button', 'rgb', 'light', 'acce', 'temp_humi', 'mic', 'speaker'];

function blocosGerarK10Py(ws) {
  const g = geradorK10Py;
  g.init(ws);
  const e = k10Estrutura(ws);
  if (!e) return { codigo: '', aviso: 'Arraste o bloco "quando ⚑ for clicado" para começar.' };
  Object.assign(g, k10AnalisarVariaveis(e.setup, e.corpoLoop));
  const setup = e.setup.map((b) => _k10Codigo(g, b)).join('');
  let loop = e.sempre ? g.statementToCode(e.sempre, 'DO') : '';
  if (e.sempre && !loop.trim()) loop = g.INDENT + 'pass\n';
  /* globais que o loop usa antes de receber valor: começam com o valor padrão */
  const iniciais = g.globais.filter((x) => !x.inicio && !new RegExp('^' + x.nome + ' = ', 'm').test(setup))
    .map((x) => x.nome + ' = ' + (x.tipo === 'String' ? '""' : x.tipo === 'bool' ? 'False' : x.tipo === 'float' ? '0.0' : '0'));
  const inicioGlobais = g.globais.filter((x) => x.inicio).map((x) => {
    const c = g.blockToCode(x.inicio);
    return x.nome + ' = ' + (typeof c === 'string' ? c : c[0]);
  });
  const L = [];
  const mods = K10_PY_MODULOS.filter((m) => g.usos.has(m));
  if (mods.length) L.push('from unihiker_k10 import ' + mods.join(', '));
  const base = ['Camera', 'TF_card'].filter((m) => g.usos.has(m));
  if (base.length) L.push('from k10_base import ' + base.join(', '));
  if (g.usos.has('network')) L.push('import network');
  if (g.usos.has('math')) L.push('import math');
  if (g.usos.has('random')) L.push('import random');
  if (g.usos.has('time')) L.push('import time');
  const aux = Object.keys(K10_PY_AUX).filter((k) => g.usos.has('aux:' + k));
  for (const k of aux) { L.push(''); L.push(''); L.push(K10_PY_AUX[k]); }
  if (aux.length) L.push('');
  L.push('');
  if (g.usos.has('botao_a')) L.push('botao_a = button(button.a)');
  if (g.usos.has('botao_b')) L.push('botao_b = button(button.b)');
  if (g.usos.has('network')) L.push('wifi = network.WLAN(network.STA_IF)');
  if (setup) L.push(setup.replace(/\n$/, ''));
  L.push(...inicioGlobais, ...iniciais);
  if (e.sempre) {
    L.push('while True:');
    L.push(loop.replace(/\n$/, ''));
  }
  while (L.length && L[0] === '') L.shift();
  return { codigo: L.join('\n').replace(/\n{4,}/g, '\n\n\n') + '\n', aviso: e.hats.length > 1 ? 'Há mais de um bloco "quando ⚑ for clicado" — só o primeiro é usado.' : null };
}
