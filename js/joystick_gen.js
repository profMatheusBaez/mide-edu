/* ============================================================
 * joystick_gen.js — gerador da aba "Joystick" (sem DOM)
 * ------------------------------------------------------------
 * Transforma a lista de sensores escolhida pelo aluno em:
 *   - Joystick.ino       (roda no Arduino Uno: arduino-cli e MIDE VM)
 *   - gamepad.py         (roda no PC: lê a Serial e aperta as teclas)
 *   - Iniciar joystick.bat
 *
 * Protocolo (Serial, 9600 baud): cada ação ligada a uma tecla tem
 * um número. O Arduino manda "A3_DOWN" quando a ação 3 começa e
 * "A3_UP" quando termina. O gamepad.py sabe qual tecla é a ação 3
 * e se ela deve ser "segurada" (igual a manter a tecla apertada)
 * ou só "tocada" uma vez.
 *
 * O .ino é escrito só com o que a MIDE VM entende (sem String,
 * sem float), para o Upload funcionar também no site.
 *
 * Uso: JoystickGen.gerar(config) -> { ino, py, bat, acoes, avisos }
 *      (também em Node: require('./joystick_gen.js'))
 * ============================================================ */
(function (raiz) {
  'use strict';

  const PINOS_DIGITAIS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const PINOS_ANALOGICOS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

  /* Teclas que o pydirectinput conhece (nome usado no gamepad.py → rótulo na tela). */
  const TECLAS = {};
  'abcdefghijklmnopqrstuvwxyz0123456789'.split('').forEach((c) => { TECLAS[c] = c.toUpperCase(); });
  for (let i = 1; i <= 12; i++) TECLAS['f' + i] = 'F' + i;
  Object.assign(TECLAS, {
    up: '↑', down: '↓', left: '←', right: '→',
    space: 'ESPAÇO', enter: 'ENTER', esc: 'ESC', tab: 'TAB', backspace: 'APAGAR',
    shift: 'SHIFT', ctrl: 'CTRL', alt: 'ALT', capslock: 'CAPS',
    insert: 'INSERT', delete: 'DELETE', home: 'HOME', end: 'END', pageup: 'PG UP', pagedown: 'PG DN',
    ',': ',', '.': '.', '-': '-', '=': '=', ';': ';', '/': '/', '[': '[', ']': ']',
    mouse_esq: 'CLIQUE ESQ', mouse_dir: 'CLIQUE DIR', mouse_meio: 'CLIQUE MEIO',
  });

  /* KeyboardEvent.key → nome do pydirectinput. */
  function teclaDoEvento(ev) {
    const k = ev.key;
    const mapa = {
      ' ': 'space', ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      Enter: 'enter', Escape: 'esc', Tab: 'tab', Backspace: 'backspace', Delete: 'delete',
      Control: 'ctrl', Shift: 'shift', Alt: 'alt', CapsLock: 'capslock', Insert: 'insert',
      Home: 'home', End: 'end', PageUp: 'pageup', PageDown: 'pagedown',
    };
    if (mapa[k]) return mapa[k];
    if (/^F\d{1,2}$/.test(k)) return k.toLowerCase();
    // usa a tecla física (KeyA, Digit1) para não depender do Shift/acentos
    if (/^Key[A-Z]$/.test(ev.code || '')) return ev.code.slice(3).toLowerCase();
    if (/^Digit\d$/.test(ev.code || '')) return ev.code.slice(5);
    const l = String(k || '').toLowerCase();
    return TECLAS[l] ? l : null;
  }

  const rotuloTecla = (t) => (t ? (TECLAS[t] || t.toUpperCase()) : '—');

  const TIPOS = {
    botao: { nome: 'Botão', sigla: 'BOTAO' },
    ultra: { nome: 'Ultrassônico', sigla: 'ULTRA' },
    pot:   { nome: 'Potenciômetro', sigla: 'POT' },
    led:   { nome: 'LED', sigla: 'LED' },
  };

  /* Nome de cada sensor: "Botão 1", "Botão 2", "LED 1"… na ordem da lista. */
  function numerar(sensores) {
    const cont = {};
    return sensores.map((s) => {
      cont[s.tipo] = (cont[s.tipo] || 0) + 1;
      const n = cont[s.tipo];
      return { s, n, nome: `${TIPOS[s.tipo].nome} ${n}`, var: TIPOS[s.tipo].sigla.toLowerCase() + n, cte: TIPOS[s.tipo].sigla + n };
    });
  }

  /* Lista as ações (o que vira tecla), em ordem, com número 1, 2, 3… */
  function listarAcoes(sensores) {
    const acoes = [];
    const add = (o) => { o.numero = acoes.length + 1; acoes.push(o); return o.numero; };
    const itens = numerar(sensores);
    for (const it of itens) {
      const s = it.s;
      it.acoes = {};
      if (s.tipo === 'botao') {
        const curto = s.curto !== false, longo = !!s.longo;
        if (curto && s.teclaCurto) {
          it.acoes.curto = add({ sensor: it, tecla: s.teclaCurto, modo: longo ? 'toque' : 'segurar',
            descricao: `${it.nome} (pino ${s.pino}), ${longo ? 'toque curto' : 'apertado'}` });
        }
        if (longo && s.teclaLongo) {
          it.acoes.longo = add({ sensor: it, tecla: s.teclaLongo, modo: 'segurar',
            descricao: `${it.nome} (pino ${s.pino}), segurado ${s.msLongo} ms ou mais` });
        }
      } else if (s.tipo === 'ultra' || s.tipo === 'pot') {
        it.acoes.faixas = (s.faixas || []).map((f) => (f.tecla
          ? add({ sensor: it, tecla: f.tecla, modo: f.modo === 'toque' ? 'toque' : 'segurar',
              descricao: s.tipo === 'ultra'
                ? `${it.nome}, de ${f.min} a ${f.max} cm`
                : `${it.nome} (${s.pino}), valor de ${f.min} a ${f.max}` })
          : 0));
      }
    }
    return { itens, acoes };
  }

  /* Confere a configuração. Devolve mensagens em português (vazio = tudo certo). */
  function validar(config) {
    const erros = [], avisos = [];
    const sensores = config.sensores || [];
    if (!sensores.length) erros.push('Adicione pelo menos um sensor.');
    const usados = new Map();
    const usar = (pino, quem) => {
      const k = String(pino);
      if (usados.has(k)) erros.push(`O pino ${k} está em dois lugares: ${usados.get(k)} e ${quem}.`);
      else usados.set(k, quem);
    };
    const { itens, acoes } = listarAcoes(sensores);
    for (const it of itens) {
      const s = it.s;
      if (s.tipo === 'botao') {
        usar(s.pino, it.nome);
        if (s.curto === false && !s.longo) erros.push(`${it.nome}: escolha curto, longo ou os dois.`);
        if (s.curto !== false && !s.teclaCurto) avisos.push(`${it.nome}: falta escolher a tecla do toque curto.`);
        if (s.longo && !s.teclaLongo) avisos.push(`${it.nome}: falta escolher a tecla do toque longo.`);
        if (s.longo && !(s.msLongo >= 100 && s.msLongo <= 5000)) erros.push(`${it.nome}: o tempo do toque longo deve ficar entre 100 e 5000 ms.`);
      } else if (s.tipo === 'ultra') {
        usar(s.trig, it.nome + ' (TRIG)');
        usar(s.echo, it.nome + ' (ECHO)');
      } else if (s.tipo === 'pot') {
        usar(s.pino, it.nome);
      } else if (s.tipo === 'led') {
        usar(s.pino, it.nome);
        if (!s.tecla) avisos.push(`${it.nome}: escolha a tecla que acende o LED.`);
        else if (!acoes.some((a) => a.tecla === s.tecla)) avisos.push(`${it.nome}: nenhum sensor usa a tecla ${rotuloTecla(s.tecla)}, então o LED não vai acender.`);
      }
      if (s.tipo === 'ultra' || s.tipo === 'pot') {
        const lim = s.tipo === 'ultra' ? 400 : 1023;
        const fs = s.faixas || [];
        if (!fs.length) avisos.push(`${it.nome}: adicione pelo menos uma faixa.`);
        fs.forEach((f, i) => {
          if (!(Number.isInteger(f.min) && Number.isInteger(f.max)) || f.min < 0 || f.max > lim || f.min > f.max) {
            erros.push(`${it.nome}, faixa ${i + 1}: use números de 0 a ${lim}, com o "de" menor que o "até".`);
          }
          if (!f.tecla) avisos.push(`${it.nome}, faixa ${i + 1}: falta escolher a tecla.`);
        });
        for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
          if (fs[i].min <= fs[j].max && fs[j].min <= fs[i].max) avisos.push(`${it.nome}: as faixas ${i + 1} e ${j + 1} se sobrepõem — vale a primeira.`);
        }
      }
    }
    if (!acoes.length && sensores.length) avisos.push('Nenhum sensor está ligado a uma tecla ainda.');
    return { erros, avisos };
  }

  /* ------------------------------------------------------------
   * Joystick.ino
   * ---------------------------------------------------------- */
  function gerarIno(config) {
    const { itens, acoes } = listarAcoes(config.sensores || []);
    const L = [];
    const p = (s) => L.push(s);
    const nAcoes = acoes.length;

    p('// ============================================================');
    p('// Joystick — gerado pela aba Joystick da MIDE EDU');
    p('// Cada sensor manda uma mensagem pela Serial (9600 baud):');
    p('//   A1_DOWN = a ação 1 começou    A1_UP = a ação 1 terminou');
    p('// O gamepad.py, no computador, transforma isso em teclas.');
    p('//');
    if (nAcoes) {
      p('// Ações:');
      for (const a of acoes) {
        p(`//   A${a.numero}  ${a.descricao} -> ${rotuloTecla(a.tecla)} (${a.modo})`);
      }
    } else {
      p('// (nenhum sensor ligado a uma tecla ainda)');
    }
    p('// ============================================================');
    p('');

    // pinos
    for (const it of itens) {
      const s = it.s;
      if (s.tipo === 'ultra') {
        p(`const int ${it.cte}_TRIG = ${s.trig};`);
        p(`const int ${it.cte}_ECHO = ${s.echo};`);
      } else {
        p(`const int ${it.cte} = ${s.pino};`);
      }
    }
    p('');

    // estado das ações
    const tam = nAcoes + 1;   // a posição 0 não é usada: a ação 1 fica na posição 1
    p('// liga/desliga de cada ação e quando ela começou (posição 0 não é usada)');
    p(`bool acaoAtiva[${tam}];`);
    p(`unsigned long acaoInicio[${tam}];`);
    p('');

    // variáveis de cada sensor
    const temVars = itens.some((it) => it.s.tipo !== 'led');
    if (temVars) p('// memória de cada sensor');
    for (const it of itens) {
      const s = it.s, v = it.var;
      if (s.tipo === 'botao') {
        p(`bool ${v}Antes = false;`);
        if (s.longo) {
          p(`unsigned long ${v}Inicio = 0;`);
          p(`bool ${v}Longo = false;`);
        }
      } else if (s.tipo === 'ultra') {
        p(`int ${v}Faixa = -1;`);
        p(`int ${v}Candidata = -1;`);
        p(`unsigned long ${v}Medida = 0;`);
      } else if (s.tipo === 'pot') {
        p(`int ${v}Faixa = -1;`);
        p(`int ${v}Valor = -100;`);
      }
    }
    if (temVars) p('');

    // ação()
    p('// Começa ou termina uma ação e avisa o computador.');
    p('void acao(int numero, bool comecou) {');
    p('  acaoAtiva[numero] = comecou;');
    p('  if (comecou) acaoInicio[numero] = millis();');
    p('  Serial.print("A");');
    p('  Serial.print(numero);');
    p('  Serial.println(comecou ? "_DOWN" : "_UP");');
    p('}');
    p('');

    const temUltra = itens.some((it) => it.s.tipo === 'ultra');
    if (temUltra) {
      p('// Mede a distância em cm (400 = nada na frente).');
      p('int medirDistancia(int trig, int echo) {');
      p('  digitalWrite(trig, LOW);');
      p('  delayMicroseconds(2);');
      p('  digitalWrite(trig, HIGH);');
      p('  delayMicroseconds(10);');
      p('  digitalWrite(trig, LOW);');
      p('  long tempo = pulseIn(echo, HIGH, 25000);');
      p('  if (tempo == 0) return 400;');
      p('  return tempo / 58;');
      p('}');
      p('');
    }

    // trocar de faixa (ultra/pot): termina a ação da faixa antiga e começa a da nova
    const blocoTroca = (it, antiga, nova) => {
      const faixas = it.acoes.faixas || [];
      const out = [];
      faixas.forEach((num, i) => { if (num) out.push(`    if (${antiga} == ${i}) acao(${num}, false);`); });
      faixas.forEach((num, i) => { if (num) out.push(`    if (${nova} == ${i}) acao(${num}, true);`); });
      return out;
    };
    const condFaixas = (it, varValor) => {
      const out = [];
      (it.s.faixas || []).forEach((f, i) => {
        out.push(`  ${i === 0 ? 'if' : 'else if'} (${varValor} >= ${f.min} && ${varValor} <= ${f.max}) faixa = ${i};`);
      });
      return out;
    };

    const funcoes = [];
    for (const it of itens) {
      const s = it.s, v = it.var;
      if (s.tipo === 'botao') {
        const fn = 'ler' + cap(v);
        funcoes.push(fn);
        const c = it.acoes.curto, l = it.acoes.longo;
        p(`// ${it.nome}: pino ${s.pino} -> GND (INPUT_PULLUP: apertado = LOW)`);
        p(`void ${fn}() {`);
        p(`  bool apertado = digitalRead(${it.cte}) == LOW;`);
        if (!s.longo) {
          if (c) {
            p(`  if (apertado && !${v}Antes) acao(${c}, true);`);
            p(`  if (!apertado && ${v}Antes) acao(${c}, false);`);
          } else {
            p('  // (sem tecla escolhida)');
          }
        } else {
          p(`  if (apertado && !${v}Antes) {`);
          p(`    ${v}Inicio = millis();`);
          p(`    ${v}Longo = false;`);
          p('  }');
          p(`  if (apertado && !${v}Longo && millis() - ${v}Inicio >= ${s.msLongo}) {`);
          p(`    ${v}Longo = true;`);
          if (l) p(`    acao(${l}, true);`);
          p('  }');
          p(`  if (!apertado && ${v}Antes) {`);
          if (l) p(`    if (${v}Longo) acao(${l}, false);`);
          if (c) {
            p(`    if (!${v}Longo) {`);
            p(`      acao(${c}, true);`);
            p(`      acao(${c}, false);`);
            p('    }');
          }
          p('  }');
        }
        p(`  ${v}Antes = apertado;`);
        p('}');
        p('');
      } else if (s.tipo === 'ultra') {
        const fn = 'ler' + cap(v);
        funcoes.push(fn);
        p(`// ${it.nome}: TRIG no pino ${s.trig}, ECHO no pino ${s.echo}`);
        p(`void ${fn}() {`);
        p(`  if (millis() - ${v}Medida < 60) return;   // mede no máximo 16 vezes por segundo`);
        p(`  ${v}Medida = millis();`);
        p(`  int cm = medirDistancia(${it.cte}_TRIG, ${it.cte}_ECHO);`);
        p('  int faixa = -1;');
        condFaixas(it, 'cm').forEach(p);
        p(`  // só troca de faixa quando duas medidas seguidas concordam`);
        p(`  if (faixa == ${v}Candidata && faixa != ${v}Faixa) {`);
        blocoTroca(it, `${v}Faixa`, 'faixa').forEach(p);
        p(`    ${v}Faixa = faixa;`);
        p('  }');
        p(`  ${v}Candidata = faixa;`);
        p('}');
        p('');
      } else if (s.tipo === 'pot') {
        const fn = 'ler' + cap(v);
        funcoes.push(fn);
        p(`// ${it.nome}: pino do meio no ${s.pino}, pontas no 5V e no GND`);
        p(`void ${fn}() {`);
        p(`  int valor = analogRead(${it.cte});`);
        p(`  if (abs(valor - ${v}Valor) < 8) return;   // ignora o "tremido" da leitura`);
        p(`  ${v}Valor = valor;`);
        p('  int faixa = -1;');
        condFaixas(it, 'valor').forEach(p);
        p(`  if (faixa != ${v}Faixa) {`);
        blocoTroca(it, `${v}Faixa`, 'faixa').forEach(p);
        p(`    ${v}Faixa = faixa;`);
        p('  }');
        p('}');
        p('');
      }
    }

    const leds = itens.filter((it) => it.s.tipo === 'led');
    if (leds.length) {
      p('// A luz da ação fica acesa enquanto ela dura (e pelo menos 150 ms).');
      p('bool luzDaAcao(int numero) {');
      p('  if (acaoAtiva[numero]) return true;');
      p('  return acaoInicio[numero] > 0 && millis() - acaoInicio[numero] < 150;');
      p('}');
      p('');
      p('void atualizarLeds() {');
      for (const it of leds) {
        const nums = acoes.filter((a) => a.tecla && a.tecla === it.s.tecla).map((a) => a.numero);
        if (it.s.tecla) p(`  // ${it.nome}: acende com a tecla ${rotuloTecla(it.s.tecla)}${nums.length ? ` (${nums.length > 1 ? 'ações' : 'ação'} ${nums.join(', ')})` : ' (nenhum sensor usa esta tecla)'}`);
        else p(`  // ${it.nome}: sem tecla escolhida`);
        if (nums.length) {
          p(`  digitalWrite(${it.cte}, ${nums.map((n) => `luzDaAcao(${n})`).join(' || ')} ? HIGH : LOW);`);
        } else {
          p(`  digitalWrite(${it.cte}, LOW);`);
        }
      }
      p('}');
      p('');
      funcoes.push('atualizarLeds');
    }

    p('void setup() {');
    p('  Serial.begin(9600);');
    for (const it of itens) {
      const s = it.s;
      if (s.tipo === 'botao') p(`  pinMode(${it.cte}, INPUT_PULLUP);`);
      else if (s.tipo === 'led') p(`  pinMode(${it.cte}, OUTPUT);`);
      else if (s.tipo === 'ultra') {
        p(`  pinMode(${it.cte}_TRIG, OUTPUT);`);
        p(`  pinMode(${it.cte}_ECHO, INPUT);`);
      }
    }
    p('  Serial.println("JOYSTICK PRONTO");');
    p('}');
    p('');
    p('void loop() {');
    funcoes.forEach((f) => p(`  ${f}();`));
    p('  delay(10);   // também serve de "anti-repique" dos botões');
    p('}');
    return L.join('\n') + '\n';
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ------------------------------------------------------------
   * gamepad.py
   * ---------------------------------------------------------- */
  function pyStr(s) { return JSON.stringify(String(s)); }

  function gerarPy(config) {
    const { acoes } = listarAcoes(config.sensores || []);
    const porta = String(config.porta || '').trim();
    const L = [];
    const p = (s) => L.push(s);
    p('# ============================================================');
    p('# gamepad.py — gerado pela aba Joystick da MIDE EDU');
    p('# Lê as mensagens do Arduino (A1_DOWN, A1_UP...) e aperta as');
    p('# teclas no computador, como se fosse o teclado.');
    p('#');
    p('# Precisa (uma vez só):  py -m pip install pyserial pydirectinput');
    p('# Feche o Monitor Serial da IDE antes de rodar: a porta só');
    p('# pode ser usada por um programa de cada vez.');
    p('# ============================================================');
    p('import sys');
    p('import time');
    p('');
    p('try:');
    p('    import serial');
    p('    import serial.tools.list_ports');
    p('    import pydirectinput');
    p('except ImportError:');
    p('    print("Faltam bibliotecas. Rode:  py -m pip install pyserial pydirectinput")');
    p('    input("Tecle Enter para sair...")');
    p('    sys.exit(1)');
    p('');
    p('pydirectinput.PAUSE = 0          # sem espera entre as teclas');
    p('pydirectinput.FAILSAFE = False');
    p('');
    p(`PORTA = ${pyStr(porta)}   # vazio = procura o Arduino sozinho (ex.: "COM3")`);
    p('VELOCIDADE = 9600');
    p('');
    p('# número da ação -> (tecla, modo)');
    p('#   "segurar": a tecla fica apertada enquanto a ação dura');
    p('#   "toque":   aperta e solta a tecla uma vez');
    p('ACOES = {');
    for (const a of acoes) {
      p(`    "A${a.numero}": (${pyStr(a.tecla)}, ${pyStr(a.modo)}),   # ${a.descricao}`);
    }
    p('}');
    p('');
    p('BOTOES_MOUSE = {"mouse_esq": "left", "mouse_dir": "right", "mouse_meio": "middle"}');
    p('apertadas = set()');
    p('');
    p('');
    p('def apertar(tecla):');
    p('    if tecla in BOTOES_MOUSE:');
    p('        pydirectinput.mouseDown(button=BOTOES_MOUSE[tecla])');
    p('    else:');
    p('        pydirectinput.keyDown(tecla)');
    p('    apertadas.add(tecla)');
    p('');
    p('');
    p('def soltar(tecla):');
    p('    if tecla in BOTOES_MOUSE:');
    p('        pydirectinput.mouseUp(button=BOTOES_MOUSE[tecla])');
    p('    else:');
    p('        pydirectinput.keyUp(tecla)');
    p('    apertadas.discard(tecla)');
    p('');
    p('');
    p('def soltar_tudo():');
    p('    for tecla in list(apertadas):');
    p('        soltar(tecla)');
    p('');
    p('');
    p('def achar_porta():');
    p('    if PORTA:');
    p('        return PORTA');
    p('    portas = list(serial.tools.list_ports.comports())');
    p('    for p in portas:');
    p('        texto = (p.description or "") + " " + (p.manufacturer or "")');
    p('        if any(nome in texto.upper() for nome in ("ARDUINO", "CH340", "CH341", "USB-SERIAL", "USB SERIAL")):');
    p('            return p.device');
    p('    for p in portas:');
    p('        if p.vid in (0x2341, 0x2A03, 0x1A86, 0x0403, 0x10C4):');
    p('            return p.device');
    p('    return None');
    p('');
    p('');
    p('def executar(porta):');
    p('    with serial.Serial(porta, VELOCIDADE, timeout=1) as arduino:');
    p('        time.sleep(2)   # o Arduino reinicia ao abrir a porta');
    p('        print("JOYSTICK CONECTADO em", porta, "- deixe esta janela aberta e vá para o jogo.")');
    p('        while True:');
    p('            linha = arduino.readline().decode(errors="ignore").strip()');
    p('            if not linha.startswith("A") or "_" not in linha:');
    p('                continue');
    p('            acao, evento = linha.split("_", 1)');
    p('            if acao not in ACOES:');
    p('                continue');
    p('            tecla, modo = ACOES[acao]');
    p('            print(linha, "->", tecla)');
    p('            if evento == "DOWN":');
    p('                if modo == "toque":');
    p('                    apertar(tecla)');
    p('                    soltar(tecla)');
    p('                else:');
    p('                    apertar(tecla)');
    p('            elif evento == "UP" and modo == "segurar":');
    p('                soltar(tecla)');
    p('');
    p('');
    p('def main():');
    p('    print("=== JOYSTICK MIDE EDU ===")');
    p('    while True:');
    p('        porta = achar_porta()');
    p('        if not porta:');
    p('            print("Arduino não encontrado. Ligue o cabo USB... (Ctrl+C para sair)")');
    p('            time.sleep(2)');
    p('            continue');
    p('        try:');
    p('            executar(porta)');
    p('        except serial.SerialException as erro:');
    p('            print("Conexão perdida:", erro)');
    p('            print("Feche o Monitor Serial da IDE se ele estiver aberto.")');
    p('        finally:');
    p('            soltar_tudo()');
    p('        time.sleep(2)');
    p('');
    p('');
    p('if __name__ == "__main__":');
    p('    try:');
    p('        main()');
    p('    except KeyboardInterrupt:');
    p('        soltar_tudo()');
    p('        print("Joystick desligado.")');
    return L.join('\n') + '\n';
  }

  /* ------------------------------------------------------------
   * Iniciar joystick.bat (Windows)
   * ---------------------------------------------------------- */
  function gerarBat() {
    return [
      '@echo off',
      'chcp 65001 >nul',
      'title Joystick MIDE EDU',
      'cd /d "%~dp0"',
      'set PY=',
      'where py >nul 2>nul && set PY=py',
      'if not defined PY where python >nul 2>nul && set PY=python',
      'if not defined PY (',
      '  echo O Python nao foi encontrado neste computador.',
      '  echo Instale em https://www.python.org/downloads/ marcando "Add Python to PATH".',
      '  pause',
      '  exit /b 1',
      ')',
      '%PY% -c "import serial, pydirectinput" >nul 2>nul',
      'if errorlevel 1 (',
      '  echo Instalando as bibliotecas pyserial e pydirectinput (so na primeira vez)...',
      '  %PY% -m pip install --user pyserial pydirectinput',
      ')',
      ':inicio',
      '%PY% gamepad.py',
      'echo.',
      'echo O programa parou. Reiniciando em 3 segundos... (feche a janela para sair)',
      'timeout /t 3 /nobreak >nul',
      'goto inicio',
      '',
    ].join('\r\n');
  }

  function gerarLeiaMe(config) {
    const { acoes } = listarAcoes(config.sensores || []);
    const linhas = [
      'JOYSTICK MIDE EDU',
      '=================',
      '',
      '1. Na MIDE EDU (aba Joystick), clique em Upload para gravar o Joystick.ino no Arduino.',
      '2. Feche o Monitor Serial da IDE (ou a aba do navegador), para liberar a porta USB.',
      '3. Dê dois cliques em "Iniciar joystick.bat". Na primeira vez ele instala o pyserial',
      '   e o pydirectinput (precisa de internet e do Python instalado).',
      '4. Deixe a janela preta aberta e vá para o jogo.',
      '',
      'Teclas configuradas:',
      ...acoes.map((a) => `  A${a.numero}  ${a.descricao} -> ${rotuloTecla(a.tecla)} (${a.modo})`),
      '',
      'Funciona no Windows. Alguns jogos só aceitam as teclas se a janela do jogo estiver em foco.',
      '',
    ];
    return linhas.join('\r\n');
  }

  function gerar(config) {
    const v = validar(config);
    const { acoes } = listarAcoes(config.sensores || []);
    return {
      ino: gerarIno(config), py: gerarPy(config), bat: gerarBat(config), leiame: gerarLeiaMe(config),
      acoes: acoes.map((a) => ({ numero: a.numero, tecla: a.tecla, modo: a.modo, descricao: a.descricao, sensor: a.sensor.nome })),
      erros: v.erros, avisos: v.avisos,
    };
  }

  /* ------------------------------------------------------------
   * .zip mínimo (sem compressão) para baixar tudo de uma vez
   * ---------------------------------------------------------- */
  const CRC_TAB = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_TAB[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

  function zip(arquivos) {   // [{nome, texto}]
    const enc = new TextEncoder();
    const partes = [], central = [];
    let off = 0;
    const d = new Date();
    const hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const data = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const a of arquivos) {
      const nome = enc.encode(a.nome), dados = enc.encode(a.texto), crc = crc32(dados);
      const loc = new DataView(new ArrayBuffer(30));
      loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true);
      loc.setUint16(8, 0, true); loc.setUint16(10, hora, true); loc.setUint16(12, data, true);
      loc.setUint32(14, crc, true); loc.setUint32(18, dados.length, true); loc.setUint32(22, dados.length, true);
      loc.setUint16(26, nome.length, true); loc.setUint16(28, 0, true);
      partes.push(new Uint8Array(loc.buffer), nome, dados);
      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
      cen.setUint16(10, 0, true); cen.setUint16(12, hora, true); cen.setUint16(14, data, true);
      cen.setUint32(16, crc, true); cen.setUint32(20, dados.length, true); cen.setUint32(24, dados.length, true);
      cen.setUint16(28, nome.length, true); cen.setUint32(42, off, true);
      central.push(new Uint8Array(cen.buffer), nome);
      off += 30 + nome.length + dados.length;
    }
    const tamCentral = central.reduce((s, x) => s + x.length, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true);
    fim.setUint32(12, tamCentral, true); fim.setUint32(16, off, true);
    const todos = [...partes, ...central, new Uint8Array(fim.buffer)];
    const out = new Uint8Array(todos.reduce((s, x) => s + x.length, 0));
    let i = 0;
    for (const x of todos) { out.set(x, i); i += x.length; }
    return out;
  }

  /* Configuração inicial: o joystick original de 4 botões (setas). */
  function configPadrao() {
    return {
      porta: '',
      sensores: [
        { tipo: 'botao', pino: 2,  curto: true, longo: false, teclaCurto: 'left',  teclaLongo: '', msLongo: 500 },
        { tipo: 'botao', pino: 7,  curto: true, longo: false, teclaCurto: 'right', teclaLongo: '', msLongo: 500 },
        { tipo: 'botao', pino: 11, curto: true, longo: false, teclaCurto: 'down',  teclaLongo: '', msLongo: 500 },
        { tipo: 'botao', pino: 12, curto: true, longo: false, teclaCurto: 'up',    teclaLongo: '', msLongo: 500 },
      ],
    };
  }

  const api = {
    gerar, gerarIno, gerarPy, gerarBat, validar, listarAcoes, zip, crc32, configPadrao,
    teclaDoEvento, rotuloTecla, TECLAS, TIPOS, PINOS_DIGITAIS, PINOS_ANALOGICOS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.JoystickGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
