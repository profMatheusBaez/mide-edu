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

  /* Sons do buzzer. freq(t) = frequência em Hz no instante t (ms); 0 = acabou.
   * As mesmas contas viram C++ no .ino (campo c) e tocam na prévia do navegador. */
  const SONS = {
    bip:      { nome: 'Bip', dur: 80, freq: (t) => (t < 80 ? 1200 : 0), c: 't < 80', f: '1200' },
    tiro:     { nome: 'Tiro', dur: 180, freq: (t) => (t < 180 ? 2000 - t * 9 : 0), c: 't < 180', f: '2000 - t * 9' },
    pulo:     { nome: 'Pulo', dur: 160, freq: (t) => (t < 160 ? 400 + t * 5 : 0), c: 't < 160', f: '400 + t * 5' },
    moeda:    { nome: 'Moeda', dur: 300, freq: (t) => (t < 300 ? (t < 80 ? 988 : 1319) : 0), c: 't < 300', f: '(t < 80) ? 988 : 1319' },
    nitro:    { nome: 'Nitro', dur: 700, freq: (t) => (t < 700 ? 500 + t * 3 + (Math.floor(t / 20) % 2) * 300 : 0), c: 't < 700', f: '500 + t * 3 + (t / 20 % 2) * 300' },
    explosao: { nome: 'Explosão', dur: 400, freq: (t) => (t < 400 ? 60 + Math.floor(Math.random() * (240 - t / 2)) : 0), c: 't < 400', f: 'random(60, 300 - t / 2)' },
  };
  /* Motor: toca enquanto a tecla estiver apertada; o ronco sobe nos primeiros 2,5 s. */
  const MOTOR = { nome: 'Motor', freq: (m, agora) => 55 + Math.min(m, 2500) / 20 + (Math.floor(agora / 30) % 2) * 10 };
  const QUANDO = { apertar: 'apertou', soltar: 'soltou', segurar: 'segurando' };

  const rotuloTecla = (t) => (t === '*' ? 'qualquer tecla' : (t ? (TECLAS[t] || t.toUpperCase()) : '—'));

  const TIPOS = {
    botao: { nome: 'Botão', sigla: 'BOTAO' },
    ultra: { nome: 'Ultrassônico', sigla: 'ULTRA' },
    pot:   { nome: 'Potenciômetro', sigla: 'POT' },
    led:   { nome: 'LED', sigla: 'LED' },
    buzzer: { nome: 'Buzzer', sigla: 'BUZZER' },
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
      } else if (s.tipo === 'buzzer') {
        usar(s.pino, it.nome);
        if (it.n > 1) erros.push(`${it.nome}: o Arduino Uno toca um som de cada vez — use só um buzzer.`);
        const sons = s.sons || [];
        if (!sons.length) avisos.push(`${it.nome}: adicione pelo menos um som.`);
        sons.forEach((r, i) => {
          if (!r.tecla) avisos.push(`${it.nome}, som ${i + 1}: escolha a tecla.`);
          else if (r.tecla !== '*' && !acoes.some((a) => a.tecla === r.tecla)) avisos.push(`${it.nome}, som ${i + 1}: nenhum sensor usa a tecla ${rotuloTecla(r.tecla)}.`);
          if (r.quando === 'segurar' ? r.som !== 'motor' : !SONS[r.som]) erros.push(`${it.nome}, som ${i + 1}: escolha um som da lista.`);
        });
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

    // buzzer: os sons vêm antes de acao(), que chama sonsDaAcao()
    const buz = itens.find((it) => it.s.tipo === 'buzzer');
    const numsDaTecla = (t) => (t === '*' ? acoes.map((a) => a.numero) : acoes.filter((a) => a.tecla === t).map((a) => a.numero));
    const condNums = (nums) => nums.map((n) => `numero == ${n}`).join(' || ');
    let temSonsAcao = false, temMotor = false;
    if (buz) {
      const linhas = (buz.s.sons || []).filter((r) => r.tecla && (r.quando === 'segurar' ? r.som === 'motor' : SONS[r.som]));
      // "qualquer tecla" primeiro: assim o som de uma tecla específica vence (o último tocarSom manda)
      const pontuais = linhas.filter((r) => r.quando !== 'segurar' && numsDaTecla(r.tecla).length)
        .sort((x, y) => (x.tecla === '*' ? 0 : 1) - (y.tecla === '*' ? 0 : 1));
      const motores = linhas.filter((r) => r.quando === 'segurar' && numsDaTecla(r.tecla).length);
      const usados = Object.keys(SONS).filter((k) => pontuais.some((r) => r.som === k));
      temSonsAcao = pontuais.length > 0;
      temMotor = motores.length > 0;
      p(`// ${buz.nome}: pino ${buz.s.pino} -> buzzer passivo -> GND`);
      usados.forEach((k, i) => p(`const int SOM_${k.toUpperCase()} = ${i + 1};`));
      p('int somAtual = 0;               // som que está tocando (0 = nenhum)');
      p('unsigned long somInicio = 0;');
      if (temMotor) p('unsigned long motorInicio = 0;');
      p('int freqAtual = 0;');
      p('');
      p('void tocarSom(int som) {');
      p('  somAtual = som;');
      p('  somInicio = millis();');
      p('}');
      p('');
      p('// Só troca o tom quando a frequência muda (0 = silêncio).');
      p(`void tom(int freq) {`);
      p('  if (freq == freqAtual) return;');
      p('  freqAtual = freq;');
      p(`  if (freq == 0) noTone(${buz.cte});`);
      p(`  else tone(${buz.cte}, freq);`);
      p('}');
      p('');
      if (temSonsAcao) {
        p('// Qual som toca quando cada ação começa ou termina.');
        p('void sonsDaAcao(int numero, bool comecou) {');
        for (const r of pontuais) {
          const nums = numsDaTecla(r.tecla);
          const cond = r.tecla === '*' ? '' : condNums(nums);
          p(`  // ${rotuloTecla(r.tecla)} ${QUANDO[r.quando]} -> ${SONS[r.som].nome}`);
          p(`  if (${r.quando === 'soltar' ? '!comecou' : 'comecou'}${cond ? ` && (${cond})` : ''}) tocarSom(SOM_${r.som.toUpperCase()});`);
        }
        p('}');
        p('');
      }
      p('// Toca o som atual um pouquinho por vez, sem parar o joystick.');
      p('void atualizarBuzzer() {');
      p('  unsigned long t = millis() - somInicio;');
      p('  int freq = 0;');
      usados.forEach((k, i) => {
        p(`  ${i === 0 ? 'if' : 'else if'} (somAtual == SOM_${k.toUpperCase()} && ${SONS[k].c}) freq = ${SONS[k].f};`);
      });
      p(`  ${usados.length ? 'else ' : ''}somAtual = 0;`);
      if (temMotor) {
        const nums = [...new Set(motores.flatMap((r) => numsDaTecla(r.tecla)))].sort((a, b) => a - b);
        p(`  // motor: enquanto ${motores.map((r) => rotuloTecla(r.tecla)).join(' ou ')} estiver apertada`);
        p(`  bool motor = ${nums.map((n) => `acaoAtiva[${n}]`).join(' || ')};`);
        p('  if (motor && motorInicio == 0) motorInicio = millis();');
        p('  if (!motor) motorInicio = 0;');
        p('  if (somAtual == 0 && motor) {');
        p('    unsigned long m = millis() - motorInicio;   // acelerando...');
        p('    if (m > 2500) m = 2500;');
        p('    freq = 55 + m / 20 + (millis() / 30 % 2) * 10;   // ronco: sobe e "treme"');
        p('  }');
      }
      p('  tom(freq);');
      p('}');
      p('');
    }

    // ação()
    p('// Começa ou termina uma ação e avisa o computador.');
    p('void acao(int numero, bool comecou) {');
    p('  acaoAtiva[numero] = comecou;');
    p('  if (comecou) acaoInicio[numero] = millis();');
    p('  Serial.print("A");');
    p('  Serial.print(numero);');
    p('  Serial.println(comecou ? "_DOWN" : "_UP");');
    if (temSonsAcao) p('  sonsDaAcao(numero, comecou);');
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
    if (buz) funcoes.push('atualizarBuzzer');

    p('void setup() {');
    p('  Serial.begin(9600);');
    for (const it of itens) {
      const s = it.s;
      if (s.tipo === 'botao') p(`  pinMode(${it.cte}, INPUT_PULLUP);`);
      else if (s.tipo === 'led' || s.tipo === 'buzzer') p(`  pinMode(${it.cte}, OUTPUT);`);
      else if (s.tipo === 'ultra') {
        p(`  pinMode(${it.cte}_TRIG, OUTPUT);`);
        p(`  pinMode(${it.cte}_ECHO, INPUT);`);
      }
    }
    p('  Serial.println("JOYSTICK PRONTO @@ID@@");   // o app do PC confere se é este código');
    p('}');
    p('');
    p('void loop() {');
    funcoes.forEach((f) => p(`  ${f}();`));
    p('  delay(10);   // também serve de "anti-repique" dos botões');
    p('}');
    const texto = L.join('\n') + '\n';
    return texto.replace('@@ID@@', idDoCodigo(texto));
  }

  /* Identificador curto do código (FNV-1a de 32 bits): o Arduino manda junto com o
   * "JOYSTICK PRONTO" e o app avisa se a placa estiver com outra montagem. */
  function idDoCodigo(texto) {
    let h = 0x811c9dc5;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  const idDoIno = (ino) => ((/JOYSTICK PRONTO ([0-9a-f]{8})/.exec(ino) || [])[1] || '');

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ------------------------------------------------------------
   * gamepad.py
   * ---------------------------------------------------------- */
  function pyStr(s) { return JSON.stringify(String(s)); }

  function gerarPy(config) {
    const { acoes } = listarAcoes(config.sensores || []);
    const porta = String(config.porta || '').trim();
    const tabela = acoes.length
      ? acoes.map((a) => `    "A${a.numero}": (${pyStr(a.tecla)}, ${pyStr(a.modo)}),   # ${a.descricao}`).join('\n')
      : '    # (nenhum sensor ligado a uma tecla ainda)';
    return PY_MODELO
      .replace('@@PORTA@@', pyStr(porta))
      .replace('@@ACOES@@', tabela);
  }

  /* O gamepad.py inteiro. @@PORTA@@ e @@ACOES@@ são trocados pela montagem do aluno. */
  const PY_MODELO = `# ============================================================
# gamepad.py — gerado pela aba Joystick da MIDE EDU
# Lê as mensagens do Arduino (A1_DOWN, A1_UP...) e aperta as
# teclas no computador, como se fosse o teclado.
#
# Rode com dois cliques no "Iniciar joystick.bat" ou pelo Thonny
# (interpretador "Python local", NÃO "MicroPython"/"Arduino").
# Na primeira vez ele instala sozinho o pyserial e o pydirectinput.
# ============================================================
import subprocess
import sys
import time

PORTA = @@PORTA@@   # vazio = procura o Arduino sozinho (ex.: "COM3")
VELOCIDADE = 9600

# número da ação -> (tecla, modo)
#   "segurar": a tecla fica apertada enquanto a ação dura
#   "toque":   aperta e solta a tecla uma vez
ACOES = {
@@ACOES@@
}


def instalar(pacotes):
    print("Instalando", " e ".join(pacotes), "(só na primeira vez, precisa de internet)...")
    comando = [sys.executable, "-m", "pip", "install", "--disable-pip-version-check"]
    if subprocess.call(comando + ["--user"] + pacotes) != 0:
        subprocess.call(comando + pacotes)
    # a pasta de pacotes do usuário pode ter acabado de ser criada: põe no caminho
    import importlib
    import site
    try:
        site.addsitedir(site.getusersitepackages())
    except Exception:
        pass
    importlib.invalidate_caches()


def carregar_bibliotecas():
    faltam = []
    try:
        import serial
        if not hasattr(serial, "Serial"):
            print("Existe um pacote errado chamado 'serial' neste Python.")
            print("Rode:  py -m pip uninstall serial   e depois abra de novo.")
            return False
    except ImportError:
        faltam.append("pyserial")
    try:
        import pydirectinput  # noqa: F401
    except ImportError:
        faltam.append("pydirectinput")
    if faltam:
        if not sys.platform.startswith("win"):
            print("O pydirectinput só funciona no Windows.")
            return False
        instalar(faltam)
        try:
            import serial  # noqa: F401
            import pydirectinput  # noqa: F401
        except ImportError:
            print("Não deu para instalar:", ", ".join(faltam))
            print("No Thonny: menu Ferramentas > Gerenciar pacotes > procure e instale cada um.")
            print("No terminal: py -m pip install pyserial pydirectinput")
            return False
    return True


if not carregar_bibliotecas():
    input("Tecle Enter para sair...")
    sys.exit(1)

import serial  # noqa: E402
import serial.tools.list_ports  # noqa: E402
import pydirectinput  # noqa: E402

pydirectinput.PAUSE = 0          # sem espera entre as teclas
pydirectinput.FAILSAFE = False

BOTOES_MOUSE = {"mouse_esq": "left", "mouse_dir": "right", "mouse_meio": "middle"}
apertadas = set()


def apertar(tecla):
    if tecla in BOTOES_MOUSE:
        pydirectinput.mouseDown(button=BOTOES_MOUSE[tecla])
    else:
        pydirectinput.keyDown(tecla)
    apertadas.add(tecla)


def soltar(tecla):
    if tecla in BOTOES_MOUSE:
        pydirectinput.mouseUp(button=BOTOES_MOUSE[tecla])
    else:
        pydirectinput.keyUp(tecla)
    apertadas.discard(tecla)


def soltar_tudo():
    for tecla in list(apertadas):
        soltar(tecla)


def achar_porta():
    if PORTA:
        return PORTA
    portas = list(serial.tools.list_ports.comports())
    for p in portas:
        texto = ((p.description or "") + " " + (p.manufacturer or "")).upper()
        if any(nome in texto for nome in ("ARDUINO", "CH340", "CH341", "USB-SERIAL", "USB SERIAL")):
            return p.device
    for p in portas:
        if p.vid in (0x2341, 0x2A03, 0x1A86, 0x0403, 0x10C4):
            return p.device
    return None


def mostrar_portas():
    portas = list(serial.tools.list_ports.comports())
    if not portas:
        print("Nenhuma porta USB/serial encontrada.")
    for p in portas:
        print("  porta", p.device, "-", p.description)


def executar(porta):
    with serial.Serial(porta, VELOCIDADE, timeout=1) as arduino:
        time.sleep(2)   # o Arduino reinicia ao abrir a porta
        print("Conectado em", porta, "- deixe esta janela aberta e clique na janela do jogo.")
        avisou_antigo = False
        while True:
            linha = arduino.readline().decode(errors="ignore").strip()
            if not linha:
                continue
            if linha.startswith("BTN_") and not avisou_antigo:
                print("Este Arduino está com um código ANTIGO. Grave de novo o Joystick.ino pela aba Joystick da MIDE EDU.")
                avisou_antigo = True
            if "_" not in linha or linha.split("_", 1)[0] not in ACOES:
                print("Arduino:", linha)
                continue
            acao, evento = linha.split("_", 1)
            tecla, modo = ACOES[acao]
            print(linha, "->", tecla)
            if evento == "DOWN":
                apertar(tecla)
                if modo == "toque":
                    soltar(tecla)
            elif evento == "UP" and modo == "segurar":
                soltar(tecla)


def main():
    print("=== JOYSTICK MIDE EDU ===")
    if "thonny" in sys.executable.lower() or "thonny" in sys.modules:
        print("Rodando pelo Thonny. Se o Thonny estiver no modo MicroPython/Arduino, ele prende a porta:")
        print("use Executar > Configurar interpretador > 'Python local'.")
    mostrar_portas()
    while True:
        porta = achar_porta()
        if not porta:
            print("Arduino não encontrado. Ligue o cabo USB... (Ctrl+C para sair)")
            time.sleep(2)
            continue
        try:
            executar(porta)
        except serial.SerialException as erro:
            texto = str(erro)
            if "denied" in texto.lower() or "negado" in texto.lower() or "PermissionError" in texto:
                print("A porta", porta, "está ocupada por outro programa.")
                print("Feche o Monitor Serial da MIDE EDU (ou a aba dela no navegador), o Arduino IDE e o Thonny no modo MicroPython.")
            else:
                print("Conexão perdida:", texto)
        finally:
            soltar_tudo()
        time.sleep(2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        soltar_tudo()
        print("Joystick desligado.")
`;

  /* ------------------------------------------------------------
   * Iniciar joystick.bat (Windows)
   * Sem blocos ( ... ): um ")" dentro de um echo fecha o bloco e o
   * cmd fecha a janela sem mostrar o erro. Por isso tudo é goto.
   * ---------------------------------------------------------- */
  function gerarBat() {
    return [
      '@echo off',
      'chcp 65001 >nul',
      'title Joystick MIDE EDU',
      'cd /d "%~dp0"',
      'echo === JOYSTICK MIDE EDU ===',
      'set PY=',
      'py -3 --version >nul 2>nul && set PY=py -3',
      'if not defined PY python --version >nul 2>nul && set PY=python',
      'if not defined PY if exist "%LOCALAPPDATA%\\Programs\\Thonny\\python.exe" set PY="%LOCALAPPDATA%\\Programs\\Thonny\\python.exe"',
      'if not defined PY if exist "%ProgramFiles(x86)%\\Thonny\\python.exe" set PY="%ProgramFiles(x86)%\\Thonny\\python.exe"',
      'if not defined PY if exist "%ProgramFiles%\\Thonny\\python.exe" set PY="%ProgramFiles%\\Thonny\\python.exe"',
      'if not defined PY goto sem_python',
      'echo Python: %PY%',
      ':rodar',
      '%PY% gamepad.py',
      'echo.',
      'echo O joystick parou. Tecle algo para abrir de novo, ou feche esta janela.',
      'pause >nul',
      'goto rodar',
      ':sem_python',
      'echo.',
      'echo O Python nao foi encontrado neste computador.',
      'echo Instale em https://www.python.org/downloads/ marcando "Add Python to PATH",',
      'echo ou instale o Thonny, e abra este arquivo de novo.',
      'pause',
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
      'Se não funcionar:',
      '- A janela mostra "porta ocupada": feche o Monitor Serial da MIDE EDU (ou a aba dela no',
      '  navegador), o Arduino IDE e o Thonny no modo MicroPython. Só um programa usa a porta.',
      '- Pelo Thonny: Executar > Configurar interpretador > "Python local" (não MicroPython/Arduino).',
      '  Faltando biblioteca: Ferramentas > Gerenciar pacotes > instale pyserial e pydirectinput.',
      '- A janela mostra "código ANTIGO": grave de novo o Joystick.ino pela aba Joystick.',
      '- A janela mostra A1_DOWN mas o jogo não mexe: clique na janela do jogo para ela ficar em foco.',
      '',
    ];
    return linhas.join('\r\n');
  }

  function gerar(config) {
    const v = validar(config);
    const { acoes } = listarAcoes(config.sensores || []);
    const ino = gerarIno(config);
    return {
      ino, py: gerarPy(config), bat: gerarBat(config), leiame: gerarLeiaMe(config), id: idDoIno(ino),
      acoes: acoes.map((a) => ({ numero: a.numero, tecla: a.tecla, rotulo: rotuloTecla(a.tecla), modo: a.modo, descricao: a.descricao, sensor: a.sensor.nome })),
      erros: v.erros, avisos: v.avisos,
    };
  }

  /* O que a IDE manda para o app do PC (POST /montagem). */
  function paraApp(g, porta) {
    return { versao: 1, id: g.id, porta: porta || '', acoes: g.acoes, enviadoEm: new Date().toISOString() };
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
    gerar, gerarIno, gerarPy, gerarBat, validar, paraApp, idDoIno, listarAcoes, zip, crc32, configPadrao,
    teclaDoEvento, rotuloTecla, TECLAS, TIPOS, SONS, MOTOR, QUANDO, PINOS_DIGITAIS, PINOS_ANALOGICOS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.JoystickGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
