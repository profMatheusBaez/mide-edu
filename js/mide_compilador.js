/* ============================================================
 * mide_compilador.js — compilador do navegador (MIDE EDU web)
 * ------------------------------------------------------------
 * Traduz o C++ do Arduino (o subconjunto usado no curso) para o
 * bytecode da MIDE VM, o firmware intérprete gravado no Uno junto
 * com o programa (ver ferramentas-web/vm/mide_vm.ino).
 *
 * Suporta: variáveis inteiras (int, long, byte, char, bool,
 * unsigned…), constantes, #define, vetores de 1 e 2 dimensões,
 * funções com parâmetros e retorno, if/else, while, do/while, for,
 * switch, break/continue/return, operadores do C, e os comandos do
 * Arduino do curso: pinos, PWM, delay, millis, pulseIn, tone,
 * map/constrain, Serial, Servo e LCD I2C (LiquidCrystal_I2C).
 *
 * Não suporta (avisa em português): float/double, String,
 * ponteiros, struct/class e bibliotecas fora da lista.
 *
 * Uso:  MideCompilador.compilar(codigo) -> { ok, bytes, erros, info }
 * ============================================================ */
(function (raiz) {
  'use strict';

  const VM_VERSAO = 1;
  const MEMCELLS = 224;            // tem de bater com o firmware
  const PILHA_MINIMA = 24;         // células reservadas para a pilha
  const PROG_MAX = 0x7E00 - 0x4000;

  /* ---------------- opcodes (iguais aos do firmware) ---------------- */
  const OP = {
    HALT: 0x00, PUSHB: 0x01, PUSHW: 0x02, PUSHL: 0x03, POP: 0x04, DUP: 0x05,
    LDG: 0x06, STG: 0x07, LDL: 0x08, STL: 0x09, LDGA: 0x0A, STGA: 0x0B, LDLA: 0x0C, STLA: 0x0D,
    ADD: 0x10, SUB: 0x11, MUL: 0x12, DIV: 0x13, MOD: 0x14, NEG: 0x15, AND: 0x16, OR: 0x17,
    XOR: 0x18, NOT: 0x19, SHL: 0x1A, SHR: 0x1B, LNOT: 0x1C, EQ: 0x1D, NE: 0x1E, LT: 0x1F,
    LE: 0x20, GT: 0x21, GE: 0x22, SAR: 0x23,
    C8: 0x24, CU8: 0x25, C16: 0x26, CU16: 0x27, TOBOOL: 0x28,
    JMP: 0x30, JZ: 0x31, JNZ: 0x32, CALL: 0x33, ENTER: 0x34, RET: 0x35, RETV: 0x36,
    SYS: 0x40, PRINTS: 0x41, PRINTI: 0x42, PRINTNL: 0x43, LINE: 0x44, ARRINIT: 0x45, SWAP: 0x46,
  };
  const S = {};
  ['PINMODE', 'DWRITE', 'DREAD', 'AREAD', 'AWRITE', 'DELAY', 'DELAYUS',
    'MILLIS', 'MICROS', 'PULSEIN', 'PULSEIN3', 'TONE', 'TONE3', 'NOTONE',
    'MAP', 'CONSTRAIN', 'ABS', 'MIN', 'MAX', 'RANDOM1', 'RANDOM2', 'RANDSEED',
    'SBEGIN', 'SAVAIL', 'SREAD', 'SVATTACH', 'SVWRITE', 'SVREAD', 'SVDETACH',
    'LCDNEW', 'LCDINIT', 'LCDBL', 'LCDNOBL', 'LCDCLEAR', 'LCDCURSOR', 'LCDHOME',
    'SEND', 'SVATTACH4', 'SPEEK', 'SPARSEINT', 'SFLUSH', 'SVWRITEUS',
    'LCDDISPLAY', 'LCDNODISPLAY', 'LCDBLINK', 'LCDNOBLINK', 'LCDCURSORON',
    'LCDCURSOROFF', 'SHIFTOUT', 'SQRT'].forEach((n, i) => { S[n] = i + 1; });

  /* ---------------- constantes do Arduino ---------------- */
  const CONSTANTES = {
    HIGH: 1, LOW: 0, INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2, LED_BUILTIN: 13,
    A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19,
    true: 1, false: 0, TRUE: 1, FALSE: 0, NULL: 0,
    DEC: 10, HEX: 16, OCT: 8, BIN: 2, LSBFIRST: 0, MSBFIRST: 1,
    SDA: 18, SCL: 19,
  };

  /* Tipos inteiros -> como guardar (o cast feito ao gravar a variável). */
  const TIPOS = {
    'int': 'c16', 'short': 'c16', 'int16_t': 'c16', 'signed int': 'c16', 'signed short': 'c16',
    'unsigned int': 'cu16', 'unsigned short': 'cu16', 'word': 'cu16', 'uint16_t': 'cu16', 'unsigned': 'cu16',
    'long': 'l32', 'long int': 'l32', 'signed long': 'l32', 'int32_t': 'l32',
    'unsigned long': 'u32', 'unsigned long int': 'u32', 'uint32_t': 'u32', 'size_t': 'cu16',
    'byte': 'cu8', 'uint8_t': 'cu8', 'unsigned char': 'cu8', 'boolean': 'bool', 'bool': 'bool',
    'char': 'c8', 'int8_t': 'c8', 'signed char': 'c8',
  };
  const TAM_BYTES = { c16: 2, cu16: 2, l32: 4, u32: 4, cu8: 1, bool: 1, c8: 1 };
  const PALAVRAS_TIPO = new Set(['int', 'long', 'short', 'unsigned', 'signed', 'char', 'byte', 'bool',
    'boolean', 'word', 'void', 'const', 'static', 'volatile', 'uint8_t', 'uint16_t', 'uint32_t',
    'int8_t', 'int16_t', 'int32_t', 'size_t', 'float', 'double', 'String', 'Servo',
    'LiquidCrystal_I2C', 'unsigned']);
  const BIBLIOTECAS_OK = new Set(['Arduino.h', 'Wire.h', 'Servo.h', 'LiquidCrystal_I2C.h']);

  class ErroMide extends Error {
    constructor(linha, msg) { super(msg); this.linha = linha; }
  }
  const falha = (linha, msg) => { throw new ErroMide(linha, msg); };

  /* ============================================================
   * 1. Léxico (com pré-processador simples)
   * ========================================================== */
  function lexico(fonte) {
    const toks = [];
    const defines = {};
    const includes = [];
    let i = 0, linha = 1;
    const n = fonte.length;
    const OPS3 = ['<<=', '>>=', '...'];
    const OPS2 = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=',
      '&=', '|=', '^=', '<<', '>>', '->', '::'];
    let inicioDeLinha = true;

    while (i < n) {
      const c = fonte[i];
      if (c === '\n') { linha++; i++; inicioDeLinha = true; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v') { i++; continue; }
      if (c === '/' && fonte[i + 1] === '/') { while (i < n && fonte[i] !== '\n') i++; continue; }
      if (c === '/' && fonte[i + 1] === '*') {
        const ini = linha;
        i += 2;
        while (i < n && !(fonte[i] === '*' && fonte[i + 1] === '/')) { if (fonte[i] === '\n') linha++; i++; }
        if (i >= n) falha(ini, 'Comentário /* aberto e nunca fechado com */.');
        i += 2; continue;
      }
      if (c === '#' && inicioDeLinha) {
        let fim = i;
        while (fim < n && fonte[fim] !== '\n') fim++;
        const dir = fonte.slice(i, fim).trim();
        let m;
        if ((m = dir.match(/^#\s*include\s*[<"]([^>"]+)[>"]/))) {
          if (!BIBLIOTECAS_OK.has(m[1])) {
            falha(linha, `A biblioteca <${m[1]}> ainda não funciona na MIDE EDU web. ` +
              'Dá para usar: Servo.h, Wire.h e LiquidCrystal_I2C.h.');
          }
          includes.push(m[1]);
        } else if ((m = dir.match(/^#\s*define\s+([A-Za-z_]\w*)(\(.*)?\s*(.*)$/))) {
          if (m[2] && /^\(/.test(m[2]) && !/^\(\s*\)/.test(m[2]) && fonte[i + dir.indexOf(m[1]) + m[1].length] === '(') {
            falha(linha, '#define com parâmetros (macro) ainda não funciona na MIDE web. Use uma função.');
          }
          const corpo = ((m[2] || '') + ' ' + (m[3] || '')).trim();
          defines[m[1]] = lexico(corpo).toks.filter((t) => t.t !== 'fim').map((t) => Object.assign({}, t, { linha }));
        } else if (/^#\s*(pragma|ifndef|ifdef|endif|if|else)/.test(dir)) {
          falha(linha, `A diretiva "${dir.split(/\s/)[0]}" ainda não funciona na MIDE web.`);
        } else {
          falha(linha, `Não entendi a linha "${dir}".`);
        }
        i = fim; continue;
      }
      inicioDeLinha = false;
      // números
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(fonte[i + 1] || ''))) {
        let j = i, valor;
        if (/^0[xX][0-9a-fA-F]/.test(fonte.slice(i, i + 3))) {
          j = i + 2; while (/[0-9a-fA-F]/.test(fonte[j] || '')) j++;
          valor = parseInt(fonte.slice(i + 2, j), 16);
        } else if (/^0[bB][01]/.test(fonte.slice(i, i + 3))) {
          j = i + 2; while (/[01]/.test(fonte[j] || '')) j++;
          valor = parseInt(fonte.slice(i + 2, j), 2);
        } else {
          while (/[0-9]/.test(fonte[j] || '')) j++;
          if (fonte[j] === '.' || /[eE]/.test(fonte[j] || '')) {
            falha(linha, 'Números com vírgula (float/double) ainda não funcionam na MIDE web. ' +
              'Use números inteiros (por exemplo, guarde em centésimos: 2.5 vira 250).');
          }
          const txt = fonte.slice(i, j);
          valor = (txt.length > 1 && txt[0] === '0') ? parseInt(txt, 8) : parseInt(txt, 10);
        }
        while (/[uUlL]/.test(fonte[j] || '')) j++;
        if (/[A-Za-z_]/.test(fonte[j] || '')) falha(linha, `Número escrito errado: "${fonte.slice(i, j + 1)}".`);
        toks.push({ t: 'num', v: valor, linha });
        i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i + 1;
        while (j < n && /[A-Za-z0-9_]/.test(fonte[j])) j++;
        const palavra = fonte.slice(i, j);
        // constantes binárias do Arduino: B1010
        if (/^B[01]{1,8}$/.test(palavra)) toks.push({ t: 'num', v: parseInt(palavra.slice(1), 2), linha });
        else toks.push({ t: 'id', v: palavra, linha });
        i = j; continue;
      }
      if (c === '"') {
        let j = i + 1, s = '';
        while (j < n && fonte[j] !== '"') {
          if (fonte[j] === '\n') falha(linha, 'Texto entre aspas sem fechar a aspa (").');
          if (fonte[j] === '\\') { s += escape(fonte[j + 1], linha); j += 2; } else { s += fonte[j]; j++; }
        }
        if (j >= n) falha(linha, 'Texto entre aspas sem fechar a aspa (").');
        // "a" "b" juntos viram um texto só, como no C
        const ant = toks[toks.length - 1];
        if (ant && ant.t === 'str') ant.v += s; else toks.push({ t: 'str', v: s, linha });
        i = j + 1; continue;
      }
      if (c === '\'') {
        let j = i + 1, s;
        if (fonte[j] === '\\') { s = escape(fonte[j + 1], linha); j += 2; } else { s = fonte[j]; j++; }
        if (fonte[j] !== '\'') falha(linha, 'Caractere entre aspas simples errado (use um só: \'A\').');
        toks.push({ t: 'num', v: s.charCodeAt(0) & 0xFF, linha, char: true });
        i = j + 1; continue;
      }
      const tri = fonte.substr(i, 3), duo = fonte.substr(i, 2);
      if (OPS3.includes(tri)) { toks.push({ t: 'op', v: tri, linha }); i += 3; continue; }
      if (OPS2.includes(duo)) { toks.push({ t: 'op', v: duo, linha }); i += 2; continue; }
      if ('+-*/%=<>!&|^~?:;,.()[]{}'.includes(c)) { toks.push({ t: 'op', v: c, linha }); i++; continue; }
      falha(linha, `Caractere inesperado: "${c}".`);
    }
    // aplica os #define (sem recursão infinita)
    const saida = [];
    const expandir = (t, prof) => {
      if (t.t === 'id' && defines[t.v] && prof < 10) {
        for (const d of defines[t.v]) expandir(Object.assign({}, d, { linha: t.linha }), prof + 1);
      } else saida.push(t);
    };
    for (const t of toks) expandir(t, 0);
    saida.push({ t: 'fim', v: '', linha });
    return { toks: saida, includes };
  }

  function escape(c, linha) {
    const m = { n: '\n', t: '\t', r: '\r', '0': '\0', '\\': '\\', '"': '"', '\'': '\'' };
    if (!(c in m)) falha(linha, `Sequência \\${c} desconhecida.`);
    return m[c];
  }

  /* ============================================================
   * 2. Sintaxe -> árvore
   * ========================================================== */
  function sintaxe(toks) {
    let p = 0;
    const olha = (k = 0) => toks[Math.min(p + k, toks.length - 1)];
    const eh = (v, k = 0) => { const t = olha(k); return (t.t === 'op' || t.t === 'id') && t.v === v; };
    const pega = () => toks[p++];
    const espera = (v, oque) => {
      const t = olha();
      if (!((t.t === 'op' || t.t === 'id') && t.v === v)) {
        const achou = t.t === 'fim' ? 'o fim do código' : `"${t.t === 'str' ? '"' + t.v + '"' : t.v}"`;
        if (!oque && v === ';' && p > 0) {
          const ant = toks[p - 1];
          falha(ant.linha, `Falta o ponto e vírgula ( ; ) no fim da linha ${ant.linha}.`);
        }
        falha(t.linha, oque || `Esperava "${v}" mas encontrei ${achou}.`);
      }
      return pega();
    };
    const ident = (oque) => {
      const t = olha();
      if (t.t !== 'id') falha(t.linha, `Esperava ${oque || 'um nome'} mas encontrei "${t.v}".`);
      return pega();
    };

    function lerTipo() {
      // devolve {base:'c16'..|'void'|'servo'|'lcd', const} ou null
      const ini = p;
      let constante = false, estatico = false;
      while (eh('const') || eh('static') || eh('volatile')) {
        if (eh('const')) constante = true;
        if (eh('static')) estatico = true;
        pega();
      }
      const t = olha();
      if (t.t !== 'id') { p = ini; return null; }
      if (t.v === 'float' || t.v === 'double') {
        falha(t.linha, 'float/double (números com vírgula) ainda não funcionam na MIDE web. Use int ou long.');
      }
      if (t.v === 'String') falha(t.linha, 'O tipo String ainda não funciona na MIDE web. Use textos entre aspas direto no print.');
      if (t.v === 'void') { pega(); return { base: 'void', constante, estatico }; }
      if (t.v === 'Servo') { pega(); return { base: 'servo', constante, estatico }; }
      if (t.v === 'LiquidCrystal_I2C') { pega(); return { base: 'lcd', constante, estatico }; }
      if (t.v === 'LiquidCrystal') falha(t.linha, 'Use o LCD com módulo I2C (LiquidCrystal_I2C). O LiquidCrystal de 6 fios ainda não funciona na MIDE web.');
      // junta palavras: unsigned long int...
      const palavras = [];
      while (olha().t === 'id' && ['unsigned', 'signed', 'long', 'short', 'int', 'char'].includes(olha().v)) {
        palavras.push(pega().v);
      }
      if (!palavras.length) {
        if (TIPOS[t.v]) { pega(); return { base: TIPOS[t.v], constante, estatico }; }
        p = ini; return null;
      }
      let nome = palavras.join(' ');
      if (nome === 'long long' || nome === 'unsigned long long') falha(t.linha, 'long long ainda não funciona na MIDE web.');
      if (!TIPOS[nome]) falha(t.linha, `Tipo "${nome}" desconhecido.`);
      if (olha().t === 'op' && olha().v === '*') falha(olha().linha, 'Ponteiros (*) ainda não funcionam na MIDE web.');
      return { base: TIPOS[nome], constante, estatico };
    }

    function programa() {
      const itens = [];
      while (olha().t !== 'fim') {
        const t = olha();
        if (eh('struct') || eh('class') || eh('typedef') || eh('enum') || eh('union')) {
          falha(t.linha, `"${t.v}" ainda não funciona na MIDE web.`);
        }
        if (eh(';')) { pega(); continue; }
        const tipo = lerTipo();
        if (!tipo) falha(t.linha, `Não entendi "${t.v}" aqui. Fora das funções só pode ter declarações (int x = 0;) e funções (void nome() { ... }).`);
        const nomeT = ident('o nome da variável ou da função');
        if (eh('(') && tipo.base !== 'lcd' && tipo.base !== 'servo') {
          itens.push(funcao(tipo, nomeT));
        } else {
          itens.push(...declaracoes(tipo, nomeT, true));
        }
      }
      return itens;
    }

    function funcao(tipo, nomeT) {
      espera('(');
      const params = [];
      if (eh('void') && eh(')', 1)) pega();
      while (!eh(')')) {
        const pt = lerTipo();
        if (!pt || pt.base === 'void') falha(olha().linha, 'Parâmetro sem tipo. Exemplo: void pisca(int pino) { ... }');
        if (pt.base === 'servo' || pt.base === 'lcd') falha(olha().linha, 'Servo e LCD não podem ser parâmetros de função na MIDE web.');
        if (eh('&') || eh('*')) falha(olha().linha, 'Referências (&) e ponteiros (*) ainda não funcionam na MIDE web.');
        const pn = ident('o nome do parâmetro');
        if (eh('[')) falha(pn.linha, 'Vetor como parâmetro ainda não funciona na MIDE web. Use o vetor global direto.');
        params.push({ nome: pn.v, tipo: pt.base, linha: pn.linha });
        if (!eh(')')) espera(',');
      }
      espera(')');
      if (eh(';')) { pega(); return { k: 'prototipo', nome: nomeT.v, linha: nomeT.linha }; }
      const corpo = bloco();
      return { k: 'funcao', nome: nomeT.v, ret: tipo.base, params, corpo, linha: nomeT.linha };
    }

    function declaracoes(tipo, nomeT, global) {
      const lista = [];
      let atual = nomeT;
      for (;;) {
        const d = { k: 'decl', nome: atual.v, tipo: tipo.base, constante: tipo.constante,
          estatico: tipo.estatico, linha: atual.linha, dims: [], global };
        if (tipo.base === 'void') falha(atual.linha, 'Variável não pode ser void.');
        if (tipo.base === 'lcd') {
          espera('(', 'O LCD precisa do endereço, colunas e linhas: LiquidCrystal_I2C lcd(0x27, 16, 2);');
          d.args = [expressao(true)]; espera(','); d.args.push(expressao(true)); espera(','); d.args.push(expressao(true));
          espera(')');
        } else if (tipo.base === 'servo') {
          if (eh('[')) falha(atual.linha, 'Vetor de servos ainda não funciona na MIDE web. Declare um Servo de cada vez.');
        } else {
          while (eh('[')) {
            pega();
            d.dims.push(eh(']') ? null : expressao());
            espera(']');
          }
          if (d.dims.length > 2) falha(atual.linha, 'Vetores com mais de 2 dimensões ainda não funcionam na MIDE web.');
          if (eh('=')) {
            pega();
            if (d.dims.length) d.init = listaInit();
            else d.init = expressao(true);
          } else if (eh('(')) {
            falha(atual.linha, 'Inicialize com "=": int x = 5;');
          }
        }
        lista.push(d);
        if (eh(',')) { pega(); atual = ident('o nome da variável'); continue; }
        espera(';');
        return lista;
      }
    }

    function listaInit() {
      const t = olha();
      if (t.t === 'str') { pega(); return { k: 'texto', v: t.v, linha: t.linha }; }
      espera('{', 'Vetor se inicializa com chaves: int v[3] = {1, 2, 3};');
      const itens = [];
      while (!eh('}')) {
        itens.push(eh('{') ? listaInit() : expressao(true));
        if (!eh('}')) espera(',');
      }
      espera('}');
      return { k: 'lista', itens, linha: t.linha };
    }

    function bloco() {
      const ini = espera('{', 'Falta abrir a chave { do bloco.');
      const cmds = [];
      while (!eh('}')) {
        if (olha().t === 'fim') falha(ini.linha, 'Falta fechar a chave } aberta nesta linha.');
        cmds.push(comando());
      }
      espera('}');
      return { k: 'bloco', cmds, linha: ini.linha };
    }

    function comando() {
      const t = olha();
      if (eh('{')) return bloco();
      if (eh(';')) { pega(); return { k: 'vazio', linha: t.linha }; }
      if (eh('if')) {
        pega(); espera('('); const cond = expressao(); espera(')');
        const entao = comando();
        let senao = null;
        if (eh('else')) { pega(); senao = comando(); }
        return { k: 'if', cond, entao, senao, linha: t.linha };
      }
      if (eh('while')) {
        pega(); espera('('); const cond = expressao(); espera(')');
        return { k: 'while', cond, corpo: comando(), linha: t.linha };
      }
      if (eh('do')) {
        pega(); const corpo = comando(); espera('while'); espera('('); const cond = expressao(); espera(')'); espera(';');
        return { k: 'dowhile', cond, corpo, linha: t.linha };
      }
      if (eh('for')) {
        pega(); espera('(');
        let init = null;
        if (!eh(';')) {
          const ini = p;
          const tipo = lerTipo();
          if (tipo) { const nomeT = ident(); init = { k: 'decls', lista: declaracoes(tipo, nomeT, false), linha: t.linha }; }
          else { p = ini; init = { k: 'expr', e: expressao(), linha: t.linha }; espera(';'); }
        } else pega();
        const cond = eh(';') ? null : expressao();
        espera(';');
        const passo = eh(')') ? null : expressao();
        espera(')', 'Falta fechar o parêntese ) do for.');
        return { k: 'for', init, cond, passo, corpo: comando(), linha: t.linha };
      }
      if (eh('switch')) {
        pega(); espera('('); const valor = expressao(); espera(')'); espera('{');
        const casos = [];
        let atual = null;
        while (!eh('}')) {
          if (eh('case')) {
            const ct = pega(); const v = expressao(true); espera(':');
            atual = { valor: v, cmds: [], linha: ct.linha }; casos.push(atual);
          } else if (eh('default')) {
            const ct = pega(); espera(':'); atual = { padrao: true, cmds: [], linha: ct.linha }; casos.push(atual);
          } else {
            if (!atual) falha(olha().linha, 'Dentro do switch, comece com "case valor:".');
            atual.cmds.push(comando());
          }
        }
        espera('}');
        return { k: 'switch', valor, casos, linha: t.linha };
      }
      if (eh('break')) { pega(); espera(';'); return { k: 'break', linha: t.linha }; }
      if (eh('continue')) { pega(); espera(';'); return { k: 'continue', linha: t.linha }; }
      if (eh('return')) {
        pega(); const e = eh(';') ? null : expressao(); espera(';');
        return { k: 'return', e, linha: t.linha };
      }
      if (eh('goto')) falha(t.linha, 'goto não funciona na MIDE web.');
      const ini = p;
      const tipo = lerTipo();
      if (tipo) {
        if (tipo.base === 'servo' || tipo.base === 'lcd') {
          falha(t.linha, (tipo.base === 'servo' ? 'Servo' : 'O LCD') + ' tem de ser declarado fora das funções (no começo do código).');
        }
        const nomeT = ident('o nome da variável');
        if (eh('(')) {
          falha(t.linha, `Parece que uma função começa na linha ${t.linha} antes de a anterior terminar. ` +
            'Confira se falta fechar alguma chave } acima.');
        }
        return { k: 'decls', lista: declaracoes(tipo, nomeT, false), linha: t.linha };
      }
      p = ini;
      const e = expressao();
      espera(';');
      return { k: 'expr', e, linha: t.linha };
    }

    /* ---- expressões (precedência do C) ---- */
    function expressao(semVirgula) {
      let e = atribuicao();
      if (!semVirgula) {
        while (eh(',')) { const t = pega(); e = { k: 'virgula', a: e, b: atribuicao(), linha: t.linha }; }
      }
      return e;
    }
    const ATRIB = ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='];
    function atribuicao() {
      const esq = ternario();
      if (olha().t === 'op' && ATRIB.includes(olha().v)) {
        const t = pega();
        return { k: 'atrib', op: t.v, alvo: esq, valor: atribuicao(), linha: t.linha };
      }
      return esq;
    }
    function ternario() {
      const c = binario(0);
      if (eh('?')) {
        const t = pega(); const a = expressao(); espera(':'); const b = atribuicao();
        return { k: 'ternario', c, a, b, linha: t.linha };
      }
      return c;
    }
    const NIVEIS = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '<=', '>', '>='],
      ['<<', '>>'], ['+', '-'], ['*', '/', '%']];
    function binario(nivel) {
      if (nivel >= NIVEIS.length) return unario();
      let e = binario(nivel + 1);
      while (olha().t === 'op' && NIVEIS[nivel].includes(olha().v)) {
        const t = pega();
        e = { k: 'bin', op: t.v, a: e, b: binario(nivel + 1), linha: t.linha };
      }
      return e;
    }
    function unario() {
      const t = olha();
      if (t.t === 'op' && ['!', '~', '-', '+'].includes(t.v)) { pega(); return { k: 'un', op: t.v, a: unario(), linha: t.linha }; }
      if (t.t === 'op' && (t.v === '++' || t.v === '--')) { pega(); return { k: 'incpre', op: t.v, alvo: unario(), linha: t.linha }; }
      if (t.t === 'op' && (t.v === '&' || t.v === '*')) falha(t.linha, 'Ponteiros (& e *) ainda não funcionam na MIDE web.');
      if (eh('sizeof')) {
        pega(); espera('(');
        const ini = p; const tipo = lerTipo();
        let r;
        if (tipo) r = { k: 'sizeoftipo', tipo: tipo.base, linha: t.linha };
        else { p = ini; r = { k: 'sizeof', e: expressao(), linha: t.linha }; }
        espera(')');
        return r;
      }
      // cast: (int) x
      if (eh('(') && olha(1).t === 'id' && (TIPOS[olha(1).v] || ['unsigned', 'signed', 'long', 'float', 'double'].includes(olha(1).v))) {
        const ini = p; pega();
        const tipo = lerTipo();
        if (tipo && eh(')')) { pega(); return { k: 'cast', tipo: tipo.base, a: unario(), linha: t.linha }; }
        p = ini;
      }
      return posfixo();
    }
    function posfixo() {
      let e = primario();
      for (;;) {
        const t = olha();
        if (eh('[')) { pega(); const i = expressao(); espera(']'); e = { k: 'indice', a: e, i, linha: t.linha }; continue; }
        if (eh('(')) {
          pega(); const args = [];
          while (!eh(')')) { args.push(atribuicao()); if (!eh(')')) espera(',', 'Separe os valores com vírgula.'); }
          espera(')');
          e = { k: 'chamada', f: e, args, linha: t.linha }; continue;
        }
        if (eh('.')) { pega(); const m = ident('o nome do comando depois do ponto'); e = { k: 'membro', a: e, nome: m.v, linha: t.linha }; continue; }
        if (eh('->')) falha(t.linha, 'Ponteiros (->) ainda não funcionam na MIDE web.');
        if (eh('++') || eh('--')) { pega(); e = { k: 'incpos', op: t.v, alvo: e, linha: t.linha }; continue; }
        return e;
      }
    }
    function primario() {
      const t = pega();
      if (t.t === 'num') return { k: 'num', v: t.v, char: !!t.char, linha: t.linha };
      if (t.t === 'str') return { k: 'str', v: t.v, linha: t.linha };
      if (t.t === 'id') return { k: 'id', nome: t.v, linha: t.linha };
      if (t.t === 'op' && t.v === '(') { const e = expressao(); espera(')', 'Falta fechar o parêntese ).'); return e; }
      if (t.t === 'fim') falha(t.linha, 'O código terminou no meio de uma expressão.');
      falha(t.linha, `Não esperava "${t.v}" aqui.`);
    }

    return programa();
  }

  /* ============================================================
   * 3. Geração do bytecode
   * ========================================================== */
  function gerar(itens, includes) {
    const cod = [];            // bytes
    const fix = [];            // {pos, rotulo}
    const rotulos = {};
    let nRot = 0;
    const novoRot = () => 'L' + (nRot++);
    const marca = (r) => { rotulos[r] = cod.length; };
    const b = (...xs) => { for (const x of xs) cod.push(x & 0xFF); };
    const w = (x) => { b(x & 0xFF, (x >> 8) & 0xFF); };
    const wRot = (r) => { fix.push({ pos: cod.length, rotulo: r }); w(0); };
    const textos = [];         // {pos, texto}

    const globais = {};        // nome -> símbolo
    const funcoes = {};
    let nGlob = 0;
    let nServos = 0;
    let temLcd = false;
    const temServoH = includes.includes('Servo.h');
    const temLcdH = includes.includes('LiquidCrystal_I2C.h');

    // ---------- avaliação de constantes ----------
    function constante(e, escopo) {
      switch (e.k) {
        case 'num': return e.v;
        case 'id': {
          const s = achar(e.nome, escopo, true);
          if (s && s.k === 'const') return s.v;
          if (!s && e.nome in CONSTANTES) return CONSTANTES[e.nome];
          return null;
        }
        case 'un': { const a = constante(e.a, escopo); if (a === null) return null;
          return e.op === '-' ? -a : e.op === '+' ? a : e.op === '!' ? (a ? 0 : 1) : ~a; }
        case 'bin': {
          const a = constante(e.a, escopo), c = constante(e.b, escopo);
          if (a === null || c === null) return null;
          switch (e.op) {
            case '+': return (a + c) | 0; case '-': return (a - c) | 0; case '*': return Math.imul(a, c);
            case '/': return c ? (a / c) | 0 : null; case '%': return c ? a % c : null;
            case '<<': return a << c; case '>>': return a >> c; case '&': return a & c; case '|': return a | c;
            case '^': return a ^ c; case '==': return +(a === c); case '!=': return +(a !== c);
            case '<': return +(a < c); case '<=': return +(a <= c); case '>': return +(a > c); case '>=': return +(a >= c);
            case '&&': return +(a && c); case '||': return +(a || c);
          }
          return null;
        }
        case 'cast': { const a = constante(e.a, escopo); return a === null ? null : converter(a, e.tipo); }
        case 'sizeoftipo': return TAM_BYTES[e.tipo] || 2;
        case 'sizeof': {
          if (e.e.k === 'id') {
            const s = achar(e.e.nome, escopo, true);
            if (s && (s.k === 'var' || s.k === 'arr' || s.k === 'const')) return s.total * (TAM_BYTES[s.tipo] || 2) || (TAM_BYTES[s.tipo] || 2);
          }
          if (e.e.k === 'indice' && e.e.a.k === 'id') {
            const s = achar(e.e.a.nome, escopo, true);
            if (s && s.k === 'arr') return (s.dims.length === 2 ? s.dims[1] : 1) * (TAM_BYTES[s.tipo] || 2);
          }
          if (e.e.k === 'indice' && e.e.a.k === 'indice' && e.e.a.a.k === 'id') {
            const s = achar(e.e.a.a.nome, escopo, true);
            if (s && s.k === 'arr') return TAM_BYTES[s.tipo] || 2;
          }
          return null;
        }
      }
      return null;
    }
    function converter(v, tipo) {
      switch (tipo) {
        case 'c16': return (v << 16) >> 16;
        case 'cu16': return v & 0xFFFF;
        case 'c8': return (v << 24) >> 24;
        case 'cu8': return v & 0xFF;
        case 'bool': return v ? 1 : 0;
        default: return v | 0;
      }
    }
    function emitirCast(tipo) {
      const op = { c16: OP.C16, cu16: OP.CU16, c8: OP.C8, cu8: OP.CU8, bool: OP.TOBOOL }[tipo];
      if (op !== undefined) b(op);
    }
    function push(v) {
      v |= 0;
      if (v >= -128 && v <= 127) b(OP.PUSHB, v);
      else if (v >= -32768 && v <= 32767) { b(OP.PUSHW); w(v); }
      else { b(OP.PUSHL, v, v >> 8, v >> 16, v >> 24); }
    }

    // ---------- escopos ----------
    let fn = null;          // função atual {escopos:[Map], slots, maxSlots}
    function achar(nome, escopo, silencioso) {
      if (fn) {
        for (let i = fn.escopos.length - 1; i >= 0; i--) {
          if (fn.escopos[i].has(nome)) return fn.escopos[i].get(nome);
        }
      }
      if (globais[nome]) return globais[nome];
      return null;
    }
    function novoTemp() { return nGlob++; }

    // ---------- 1ª passada: globais e assinaturas ----------
    const inits = [];       // código de inicialização (globais com valor inicial)
    for (const it of itens) {
      if (it.k === 'funcao') {
        if (funcoes[it.nome]) falha(it.linha, `A função ${it.nome}() foi escrita duas vezes.`);
        if (globais[it.nome]) falha(it.linha, `"${it.nome}" já é o nome de uma variável.`);
        funcoes[it.nome] = { nome: it.nome, ret: it.ret, params: it.params, rotulo: novoRot(), linha: it.linha, no: it };
      }
    }
    for (const it of itens) {
      if (it.k !== 'decl') continue;
      declararGlobal(it);
    }

    function tamanhosDims(d, escopo) {
      const dims = d.dims.map((x) => (x === null ? null : constante(x, escopo)));
      dims.forEach((x, i) => {
        if (d.dims[i] !== null && (x === null || x <= 0)) {
          falha(d.linha, `O tamanho do vetor ${d.nome} tem de ser um número fixo maior que zero.`);
        }
      });
      if (dims[0] === null) {
        if (!d.init) falha(d.linha, `Diga o tamanho do vetor ${d.nome} ou dê os valores iniciais.`);
        dims[0] = d.init.k === 'texto' ? d.init.v.length + 1 : d.init.itens.length;
      }
      if (dims.length === 2 && dims[1] === null) falha(d.linha, `No vetor ${d.nome}[][N], diga o tamanho da segunda dimensão.`);
      return dims;
    }

    function valoresIniciais(d, dims, escopo) {
      const total = dims.reduce((a, x) => a * x, 1);
      const vals = new Array(total).fill(0);
      if (!d.init) return { vals, exprs: [] };
      const exprs = [];   // valores não constantes: {idx, e}
      const por = (lista, base, nivel) => {
        if (lista.k === 'texto') {
          if (lista.v.length + 1 > dims[nivel]) falha(d.linha, `O texto não cabe no vetor ${d.nome}.`);
          for (let i = 0; i < lista.v.length; i++) vals[base + i] = lista.v.charCodeAt(i) & 0xFF;
          return;
        }
        if (lista.k !== 'lista') falha(d.linha, `O vetor ${d.nome} se inicializa com chaves { }.`);
        const passo = nivel === 0 && dims.length === 2 ? dims[1] : 1;
        if (lista.itens.length > dims[nivel]) falha(lista.linha, `Valores demais para o vetor ${d.nome} (cabe ${dims[nivel]}).`);
        lista.itens.forEach((it, i) => {
          if (dims.length === 2 && nivel === 0) {
            if (it.k === 'lista') por(it, base + i * passo, 1);
            else falha(it.linha, `Cada linha do vetor ${d.nome} vai entre chaves { }.`);
          } else {
            if (it.k === 'lista') falha(it.linha, 'Chaves { } a mais.');
            const c = constante(it, escopo);
            if (c === null) exprs.push({ idx: base + i, e: it });
            else vals[base + i] = converter(c, d.tipo);
          }
        });
      };
      if (dims.length === 2 && d.init.k === 'lista' && d.init.itens.length && d.init.itens[0].k !== 'lista') {
        // int m[2][3] = {1,2,3,4,5,6};  (sem as chaves internas)
        if (d.init.itens.length > total) falha(d.linha, `Valores demais para o vetor ${d.nome}.`);
        d.init.itens.forEach((it, i) => {
          const c = constante(it, escopo);
          if (c === null) exprs.push({ idx: i, e: it }); else vals[i] = converter(c, d.tipo);
        });
      } else por(d.init, 0, 0);
      return { vals, exprs };
    }

    function declararGlobal(d) {
      if (globais[d.nome] || funcoes[d.nome]) falha(d.linha, `"${d.nome}" foi declarado duas vezes.`);
      if (d.nome in CONSTANTES) falha(d.linha, `"${d.nome}" já é um nome do Arduino; escolha outro nome.`);
      if (d.tipo === 'servo') {
        if (!temServoH) falha(d.linha, 'Para usar Servo, coloque #include <Servo.h> no começo do código.');
        if (nServos >= 4) falha(d.linha, 'A MIDE web aceita até 4 servos.');
        globais[d.nome] = { k: 'servo', idx: nServos++ };
        return;
      }
      if (d.tipo === 'lcd') {
        if (!temLcdH) falha(d.linha, 'Para usar o LCD, coloque #include <LiquidCrystal_I2C.h> no começo do código.');
        if (temLcd) falha(d.linha, 'A MIDE web aceita um LCD só.');
        temLcd = true;
        globais[d.nome] = { k: 'lcd' };
        inits.push({ k: 'lcd', d });
        return;
      }
      if (d.dims.length) {
        const dims = tamanhosDims(d, null);
        const total = dims.reduce((a, x) => a * x, 1);
        const s = { k: 'arr', tipo: d.tipo, dims, total, addr: nGlob, global: true, nome: d.nome };
        nGlob += total;
        globais[d.nome] = s;
        if (d.init) inits.push({ k: 'arr', s, d });
        return;
      }
      const c = d.init ? constante(d.init, null) : null;
      if (d.constante && c !== null) {
        globais[d.nome] = { k: 'const', v: converter(c, d.tipo), tipo: d.tipo, total: 1 };
        return;
      }
      const s = { k: 'var', tipo: d.tipo, addr: nGlob++, global: true, total: 1, nome: d.nome };
      globais[d.nome] = s;
      if (d.init) inits.push({ k: 'var', s, d });
    }

    // ---------- expressões ----------
    function tipoDe(e) {
      // só o que importa para o print: 'char' imprime como letra
      if (e.k === 'num') return e.char ? 'c8' : 'int';
      if (e.k === 'id') { const s = achar(e.nome); return s && (s.k === 'var' || s.k === 'const') ? s.tipo : 'int'; }
      if (e.k === 'indice') { let a = e.a; while (a.k === 'indice') a = a.a; const s = a.k === 'id' ? achar(a.nome) : null; return s ? s.tipo : 'int'; }
      if (e.k === 'cast') return e.tipo;
      return 'int';
    }

    // alvo de atribuição: devolve {tipo, carregar(), guardar(querValor)}
    function lvalor(e) {
      if (e.k === 'id') {
        const s = achar(e.nome);
        if (!s) falha(e.linha, `A variável "${e.nome}" não foi declarada.`);
        if (s.k === 'const') falha(e.linha, `"${e.nome}" é constante e não pode mudar.`);
        if (s.k === 'arr') falha(e.linha, `"${e.nome}" é um vetor: use ${e.nome}[posição].`);
        if (s.k !== 'var') falha(e.linha, `"${e.nome}" não é uma variável.`);
        return {
          tipo: s.tipo, simples: true,
          carregar: () => { if (s.global) { b(OP.LDG); w(s.addr); } else b(OP.LDL, s.slot); },
          guardar: () => { if (s.global) { b(OP.STG); w(s.addr); } else b(OP.STL, s.slot); },
        };
      }
      if (e.k === 'indice') {
        const { s, gerarIndice } = acessoVetor(e);
        return {
          tipo: s.tipo, simples: false, gerarIndice,
          carregar: () => { if (s.global) { b(OP.LDGA); w(s.addr); } else b(OP.LDLA, s.slot); w(s.total); },
          guardar: () => { if (s.global) { b(OP.STGA); w(s.addr); } else b(OP.STLA, s.slot); w(s.total); },
        };
      }
      falha(e.linha, 'Do lado esquerdo do = tem de ficar uma variável.');
    }

    function acessoVetor(e) {
      let base = e, idxs = [];
      while (base.k === 'indice') { idxs.unshift(base.i); base = base.a; }
      if (base.k !== 'id') falha(e.linha, 'Só dá para usar [ ] em vetores.');
      const s = achar(base.nome);
      if (!s) falha(e.linha, `O vetor "${base.nome}" não foi declarado.`);
      if (s.k !== 'arr') falha(e.linha, `"${base.nome}" não é um vetor.`);
      if (idxs.length !== s.dims.length) {
        falha(e.linha, s.dims.length === 2
          ? `O vetor ${base.nome} tem 2 dimensões: use ${base.nome}[linha][coluna].`
          : `O vetor ${base.nome} tem 1 dimensão: use ${base.nome}[posição].`);
      }
      const gerarIndice = () => {
        if (s.dims.length === 1) expr(idxs[0]);
        else {
          // confere cada dimensão: m[i][j] com j fora da faixa também é erro
          expr(idxs[0]); push(s.dims[1]); b(OP.MUL);
          const tj = novoTemp();
          expr(idxs[1]); b(OP.DUP); b(OP.STG); w(tj);
          // j < dims[1] e j >= 0 ? (o firmware só confere o total)
          b(OP.ADD);
          // verificação extra de j: se j >= dims[1], força um índice inválido
          const ok = novoRot();
          b(OP.LDG); w(tj); push(s.dims[1]); b(OP.LT);
          b(OP.LDG); w(tj); push(0); b(OP.GE); b(OP.AND);
          b(OP.JNZ); wRot(ok);
          b(OP.POP); push(-1);
          marca(ok);
        }
      };
      return { s, gerarIndice };
    }

    function opBin(op) {
      const m = { '+': OP.ADD, '-': OP.SUB, '*': OP.MUL, '/': OP.DIV, '%': OP.MOD, '&': OP.AND, '|': OP.OR,
        '^': OP.XOR, '<<': OP.SHL, '>>': OP.SAR, '==': OP.EQ, '!=': OP.NE, '<': OP.LT, '<=': OP.LE,
        '>': OP.GT, '>=': OP.GE };
      return m[op];
    }

    // gera a expressão; quer=false descarta o valor (comando)
    function expr(e, quer = true) {
      const c = (e.k !== 'atrib' && e.k !== 'incpre' && e.k !== 'incpos' && e.k !== 'chamada') ? constante(e) : null;
      if (c !== null) { if (quer) push(c); return; }
      switch (e.k) {
        case 'num': if (quer) push(e.v); return;
        case 'str': falha(e.linha, 'Texto entre aspas só pode ir dentro de Serial.print / lcd.print.');
        case 'id': {
          const s = achar(e.nome);
          if (!s) {
            if (e.nome === 'Serial') { if (quer) push(1); return; }
            if (funcoes[e.nome]) falha(e.linha, `Para chamar a função, use parênteses: ${e.nome}()`);
            if (/^(float|double|String)$/.test(e.nome)) falha(e.linha, `${e.nome} ainda não funciona na MIDE web.`);
            falha(e.linha, `"${e.nome}" não foi declarado. Confira se o nome está escrito igual (maiúsculas contam).`);
          }
          if (s.k === 'const') { if (quer) push(s.v); return; }
          if (s.k === 'arr') falha(e.linha, `"${e.nome}" é um vetor: use ${e.nome}[posição].`);
          if (s.k !== 'var') falha(e.linha, `"${e.nome}" não é um número.`);
          if (quer) { if (s.global) { b(OP.LDG); w(s.addr); } else b(OP.LDL, s.slot); }
          return;
        }
        case 'indice': {
          const lv = lvalor(e);
          lv.gerarIndice(); lv.carregar();
          if (!quer) b(OP.POP);
          return;
        }
        case 'un': {
          expr(e.a);
          if (e.op === '-') b(OP.NEG); else if (e.op === '!') b(OP.LNOT); else if (e.op === '~') b(OP.NOT);
          if (!quer) b(OP.POP);
          return;
        }
        case 'cast': expr(e.a); emitirCast(e.tipo); if (!quer) b(OP.POP); return;
        case 'bin': {
          if (e.op === '&&' || e.op === '||') {
            const fim = novoRot(), curto = novoRot();
            expr(e.a); b(e.op === '&&' ? OP.JZ : OP.JNZ); wRot(curto);
            expr(e.b); b(e.op === '&&' ? OP.JZ : OP.JNZ); wRot(curto);
            push(e.op === '&&' ? 1 : 0); b(OP.JMP); wRot(fim);
            marca(curto); push(e.op === '&&' ? 0 : 1);
            marca(fim);
            if (!quer) b(OP.POP);
            return;
          }
          if (e.a.k === 'str' || e.b.k === 'str') falha(e.linha, 'Não dá para fazer contas com texto. Para juntar texto e número, use dois Serial.print.');
          expr(e.a); expr(e.b); b(opBin(e.op));
          if (!quer) b(OP.POP);
          return;
        }
        case 'ternario': {
          const senao = novoRot(), fim = novoRot();
          expr(e.c); b(OP.JZ); wRot(senao);
          expr(e.a); b(OP.JMP); wRot(fim);
          marca(senao); expr(e.b); marca(fim);
          if (!quer) b(OP.POP);
          return;
        }
        case 'virgula': expr(e.a, false); expr(e.b, quer); return;
        case 'atrib': return atrib(e, quer);
        case 'incpre':
          return atrib({ k: 'atrib', op: e.op === '++' ? '+=' : '-=', alvo: e.alvo, valor: { k: 'num', v: 1 }, linha: e.linha }, quer);
        case 'incpos': {
          if (!quer) return atrib({ k: 'atrib', op: e.op === '++' ? '+=' : '-=', alvo: e.alvo, valor: { k: 'num', v: 1 }, linha: e.linha }, false);
          const lv = lvalor(e.alvo);
          const tv = novoTemp();
          if (lv.simples) {
            lv.carregar(); b(OP.DUP); b(OP.STG); w(tv);
            push(1); b(e.op === '++' ? OP.ADD : OP.SUB); emitirCast(lv.tipo); lv.guardar();
            b(OP.LDG); w(tv);
          } else {
            const ti = novoTemp();
            lv.gerarIndice(); b(OP.STG); w(ti);
            b(OP.LDG); w(ti); lv.carregar(); b(OP.STG); w(tv);
            b(OP.LDG); w(ti); b(OP.LDG); w(tv); push(1); b(e.op === '++' ? OP.ADD : OP.SUB); emitirCast(lv.tipo); lv.guardar();
            b(OP.LDG); w(tv);
          }
          return;
        }
        case 'chamada': return chamada(e, quer);
        case 'membro': falha(e.linha, `Faltam os parênteses: ${nomeMembro(e)}( )`);
        case 'sizeof': case 'sizeoftipo': falha(e.linha, 'Não consegui calcular este sizeof.');
      }
      falha(e.linha, 'Expressão que a MIDE web não entende.');
    }

    function nomeMembro(e) { return (e.a.k === 'id' ? e.a.nome : '?') + '.' + e.nome; }

    function atrib(e, quer) {
      if (e.valor.k === 'str') falha(e.linha, 'Variáveis só guardam números na MIDE web. Texto vai direto no print.');
      const lv = lvalor(e.alvo);
      const op = e.op === '=' ? null : e.op.slice(0, -1);
      if (lv.simples) {
        if (op) { lv.carregar(); expr(e.valor); b(opBin(op)); } else expr(e.valor);
        emitirCast(lv.tipo);
        if (quer) b(OP.DUP);
        lv.guardar();
        return;
      }
      if (!op && !quer) { lv.gerarIndice(); expr(e.valor); emitirCast(lv.tipo); lv.guardar(); return; }
      const ti = novoTemp();
      lv.gerarIndice(); b(OP.STG); w(ti);
      b(OP.LDG); w(ti);
      if (op) { b(OP.LDG); w(ti); lv.carregar(); expr(e.valor); b(opBin(op)); } else expr(e.valor);
      emitirCast(lv.tipo);
      if (quer) { const tv = novoTemp(); b(OP.STG); w(tv); b(OP.LDG); w(tv); lv.guardar(); b(OP.LDG); w(tv); }
      else lv.guardar();
    }

    // ---------- chamadas ----------
    const FUNCOES_ARDUINO = {
      pinMode: [2, S.PINMODE, false], digitalWrite: [2, S.DWRITE, false], digitalRead: [1, S.DREAD, true],
      analogRead: [1, S.AREAD, true], analogWrite: [2, S.AWRITE, false], delay: [1, S.DELAY, false],
      delayMicroseconds: [1, S.DELAYUS, false], millis: [0, S.MILLIS, true], micros: [0, S.MICROS, true],
      noTone: [1, S.NOTONE, false], map: [5, S.MAP, true], constrain: [3, S.CONSTRAIN, true],
      abs: [1, S.ABS, true], min: [2, S.MIN, true], max: [2, S.MAX, true], randomSeed: [1, S.RANDSEED, false],
      shiftOut: [4, S.SHIFTOUT, false], sqrt: [1, S.SQRT, true],
    };
    function sys(id) { b(OP.SYS, id); }
    function args(e, n, nomeF) {
      if (e.args.length !== n) {
        falha(e.linha, `${nomeF}() precisa de ${n === 0 ? 'nenhum valor' : n === 1 ? '1 valor' : n + ' valores'} entre os parênteses (você passou ${e.args.length}).`);
      }
      for (const a of e.args) {
        if (a.k === 'str') falha(a.linha, `${nomeF}() não aceita texto entre aspas.`);
        expr(a);
      }
    }
    function resultado(retorna, quer, e, nome) {
      if (quer && !retorna) falha(e.linha, `${nome}() não devolve valor; não dá para usar numa conta ou atribuição.`);
      if (!quer && retorna) b(OP.POP);
    }

    function imprimir(e, flagsBase, nomeF, ln) {
      if (e.args.length > 2) falha(e.linha, `${nomeF}() aceita um valor só (e, se quiser, a base: HEX, BIN...).`);
      if (!e.args.length) {
        if (ln) b(OP.PRINTNL, flagsBase);
        return;
      }
      const a = e.args[0];
      const flags = flagsBase | (ln ? 1 : 0);
      // String(x) e "texto" + String(y): imprime cada pedaço em sequência
      const ehStringFn = (x) => x.k === 'chamada' && x.f.k === 'id' && x.f.nome === 'String' && x.args.length === 1;
      const ehTexto = (x) => x.k === 'str' || ehStringFn(x) || (x.k === 'bin' && x.op === '+' && (ehTexto(x.a) || ehTexto(x.b)));
      if (e.args.length === 1 && (ehStringFn(a) || (a.k === 'bin' && ehTexto(a)))) {
        const partes = [];
        const juntar = (x) => {
          if (x.k === 'bin' && x.op === '+' && ehTexto(x)) { juntar(x.a); juntar(x.b); }
          else if (ehStringFn(x)) partes.push(x.args[0]);
          else partes.push(x);
        };
        juntar(a);
        partes.forEach((pt, i) => imprimir({ args: [pt], linha: e.linha }, flagsBase, nomeF, ln && i === partes.length - 1));
        return;
      }
      if (a.k === 'ternario' && (a.a.k === 'str' || a.b.k === 'str') && e.args.length === 1) {
        // Serial.print(x > 0 ? "sim" : "nao")
        const senao = novoRot(), fim = novoRot();
        expr(a.c); b(OP.JZ); wRot(senao);
        imprimir({ args: [a.a], linha: e.linha }, flagsBase, nomeF, ln);
        b(OP.JMP); wRot(fim);
        marca(senao);
        imprimir({ args: [a.b], linha: e.linha }, flagsBase, nomeF, ln);
        marca(fim);
        return;
      }
      if (a.k === 'str') {
        if (e.args.length > 1) falha(e.linha, 'Texto não usa base (HEX, BIN...).');
        b(OP.PRINTS); textos.push({ pos: cod.length, texto: a.v }); w(0); b(flags);
        return;
      }
      if (a.k === 'id') {
        const s = achar(a.nome);
        if (s && s.k === 'arr' && (s.tipo === 'c8' || s.tipo === 'cu8') && s.dims.length === 1) {
          // texto guardado num vetor de char: imprime até o \0
          const ini = novoRot(), fim = novoRot(), ti = novoTemp();
          push(0); b(OP.STG); w(ti);
          marca(ini);
          b(OP.LDG); w(ti); push(s.total); b(OP.GE); b(OP.JNZ); wRot(fim);
          b(OP.LDG); w(ti); if (s.global) { b(OP.LDGA); w(s.addr); } else b(OP.LDLA, s.slot); w(s.total);
          b(OP.DUP); b(OP.JZ); wRot(fim + 'z');
          b(OP.PRINTI, flagsBase | (1 << 2));
          b(OP.LDG); w(ti); push(1); b(OP.ADD); b(OP.STG); w(ti);
          b(OP.JMP); wRot(ini);
          marca(fim + 'z'); b(OP.POP);
          marca(fim);
          if (ln) b(OP.PRINTNL, flagsBase);
          return;
        }
      }
      let tipo = 0;
      if (e.args.length === 2) {
        const base = constante(e.args[1]);
        tipo = { 10: 0, 16: 2, 2: 3, 8: 4 }[base];
        if (tipo === undefined) falha(e.linha, 'A base do print tem de ser DEC, HEX, BIN ou OCT.');
      } else if (tipoDe(a) === 'c8') tipo = 1;
      expr(a);
      b(OP.PRINTI, flags | (tipo << 2));
    }

    function chamada(e, quer) {
      if (e.f.k === 'membro') return metodo(e, quer);
      if (e.f.k !== 'id') falha(e.linha, 'Chamada que a MIDE web não entende.');
      const nome = e.f.nome;
      if (funcoes[nome]) {
        const f = funcoes[nome];
        if (e.args.length !== f.params.length) {
          falha(e.linha, `${nome}() precisa de ${f.params.length} valor(es) entre parênteses (você passou ${e.args.length}).`);
        }
        e.args.forEach((a, i) => {
          if (a.k === 'str') falha(a.linha, 'Funções da MIDE web só recebem números.');
          expr(a); emitirCast(f.params[i].tipo);
        });
        b(OP.CALL); wRot(f.rotulo); b(e.args.length);
        resultado(f.ret !== 'void', quer, e, nome);
        return;
      }
      if (nome === 'setup' || nome === 'loop') falha(e.linha, `Não chame ${nome}() você mesmo: o Arduino já chama.`);
      if (FUNCOES_ARDUINO[nome]) {
        const [n, id, ret] = FUNCOES_ARDUINO[nome];
        args(e, n, nome); sys(id); resultado(ret, quer, e, nome); return;
      }
      switch (nome) {
        case 'pulseIn':
          if (e.args.length === 2) { args(e, 2, nome); sys(S.PULSEIN); } else { args(e, 3, nome); sys(S.PULSEIN3); }
          return resultado(true, quer, e, nome);
        case 'tone':
          if (e.args.length === 2) { args(e, 2, nome); sys(S.TONE); } else { args(e, 3, nome); sys(S.TONE3); }
          return resultado(false, quer, e, nome);
        case 'random':
          if (e.args.length === 1) { args(e, 1, nome); sys(S.RANDOM1); } else { args(e, 2, nome); sys(S.RANDOM2); }
          return resultado(true, quer, e, nome);
        case 'sq': args(e, 1, nome); b(OP.DUP, OP.MUL); return resultado(true, quer, e, nome);
        case 'bitRead': args(e, 2, nome); b(OP.SAR); push(1); b(OP.AND); return resultado(true, quer, e, nome);
        case 'highByte': args(e, 1, nome); push(8); b(OP.SAR); push(255); b(OP.AND); return resultado(true, quer, e, nome);
        case 'lowByte': args(e, 1, nome); push(255); b(OP.AND); return resultado(true, quer, e, nome);
        case 'attachInterrupt': case 'detachInterrupt': case 'digitalPinToInterrupt':
          falha(e.linha, 'Interrupções ainda não funcionam na MIDE web.');
        case 'Serial': falha(e.linha, 'Use Serial.begin(9600), Serial.print(...)...');
      }
      if (achar(nome)) falha(e.linha, `"${nome}" é uma variável, não uma função.`);
      falha(e.linha, `A função ${nome}() não existe${/^[a-z]/.test(nome) ? '' : ''}. Confira o nome (maiúsculas e minúsculas contam) ou se ela foi escrita no código.`);
    }

    function metodo(e, quer) {
      const obj = e.f.a, m = e.f.nome;
      if (obj.k !== 'id') falha(e.linha, 'Chamada que a MIDE web não entende.');
      const nomeObj = obj.nome;
      if (nomeObj === 'Serial') {
        switch (m) {
          case 'begin': args(e, 1, 'Serial.begin'); sys(S.SBEGIN); return resultado(false, quer, e, 'Serial.begin');
          case 'print': imprimir(e, 0, 'Serial.print', false); return resultado(false, quer, e, 'Serial.print');
          case 'println': imprimir(e, 0, 'Serial.println', true); return resultado(false, quer, e, 'Serial.println');
          case 'write':
            if (e.args.length === 1 && e.args[0].k === 'str') { imprimir(e, 0, 'Serial.write', false); }
            else { args(e, 1, 'Serial.write'); b(OP.PRINTI, 1 << 2); }
            return resultado(false, quer, e, 'Serial.write');
          case 'available': args(e, 0, 'Serial.available'); sys(S.SAVAIL); return resultado(true, quer, e, m);
          case 'read': args(e, 0, 'Serial.read'); sys(S.SREAD); return resultado(true, quer, e, m);
          case 'peek': args(e, 0, 'Serial.peek'); sys(S.SPEEK); return resultado(true, quer, e, m);
          case 'parseInt': args(e, 0, 'Serial.parseInt'); sys(S.SPARSEINT); return resultado(true, quer, e, m);
          case 'flush': args(e, 0, 'Serial.flush'); sys(S.SFLUSH); return resultado(false, quer, e, m);
          case 'end': args(e, 0, 'Serial.end'); sys(S.SEND); return resultado(false, quer, e, m);
        }
        falha(e.linha, `Serial.${m}() ainda não funciona na MIDE web.`);
      }
      const s = achar(nomeObj);
      if (!s) falha(e.linha, `"${nomeObj}" não foi declarado.`);
      if (s.k === 'servo') {
        const ix = () => push(s.idx);
        switch (m) {
          case 'attach':
            if (e.args.length === 3) { ix(); args(e, 3, nomeObj + '.attach'); sys(S.SVATTACH4); }
            else { ix(); args(e, 1, nomeObj + '.attach'); sys(S.SVATTACH); }
            return resultado(false, quer, e, m);
          case 'write': ix(); args(e, 1, nomeObj + '.write'); sys(S.SVWRITE); return resultado(false, quer, e, m);
          case 'writeMicroseconds': ix(); args(e, 1, nomeObj + '.writeMicroseconds'); sys(S.SVWRITEUS); return resultado(false, quer, e, m);
          case 'read': ix(); args(e, 0, nomeObj + '.read'); sys(S.SVREAD); return resultado(true, quer, e, m);
          case 'detach': ix(); args(e, 0, nomeObj + '.detach'); sys(S.SVDETACH); return resultado(false, quer, e, m);
        }
        falha(e.linha, `${nomeObj}.${m}() não existe no Servo. Use attach, write, read ou detach.`);
      }
      if (s.k === 'lcd') {
        const simples = { init: S.LCDINIT, backlight: S.LCDBL, noBacklight: S.LCDNOBL, clear: S.LCDCLEAR,
          home: S.LCDHOME, display: S.LCDDISPLAY, noDisplay: S.LCDNODISPLAY, blink: S.LCDBLINK,
          noBlink: S.LCDNOBLINK, cursor: S.LCDCURSORON, noCursor: S.LCDCURSOROFF };
        if (simples[m]) { args(e, 0, nomeObj + '.' + m); sys(simples[m]); return resultado(false, quer, e, m); }
        switch (m) {
          case 'begin':
            if (e.args.length !== 2) falha(e.linha, `${nomeObj}.begin() precisa de colunas e linhas, ou use ${nomeObj}.init().`);
            sys(S.LCDINIT); return resultado(false, quer, e, m);
          case 'setCursor': args(e, 2, nomeObj + '.setCursor'); sys(S.LCDCURSOR); return resultado(false, quer, e, m);
          case 'print': imprimir(e, 2, nomeObj + '.print', false); return resultado(false, quer, e, m);
          case 'println': falha(e.linha, `O LCD não tem println: use ${nomeObj}.setCursor(coluna, linha) para mudar de linha.`);
          case 'write':
            args(e, 1, nomeObj + '.write'); b(OP.PRINTI, 2 | (1 << 2)); return resultado(false, quer, e, m);
        }
        falha(e.linha, `${nomeObj}.${m}() ainda não funciona na MIDE web.`);
      }
      falha(e.linha, `"${nomeObj}" não tem comandos com ponto (.).`);
    }

    // ---------- comandos ----------
    let ultimaLinha = -1;
    function linha(l) {
      if (l && l !== ultimaLinha) { b(OP.LINE); w(l); ultimaLinha = l; }
    }
    const laços = [];   // {brk, cont}

    function declLocal(d) {
      const escopo = fn.escopos[fn.escopos.length - 1];
      if (escopo.has(d.nome)) falha(d.linha, `"${d.nome}" foi declarado duas vezes aqui.`);
      if (d.nome in CONSTANTES) falha(d.linha, `"${d.nome}" já é um nome do Arduino; escolha outro nome.`);
      if (d.estatico) {
        // static: vira uma global escondida, inicializada uma vez só
        const nomeG = `${fn.nome}::${d.nome}`;
        const copia = Object.assign({}, d, { nome: nomeG });
        declararGlobal(copia);
        escopo.set(d.nome, globais[nomeG]);
        return;
      }
      if (d.dims.length) {
        const dims = tamanhosDims(d);
        const total = dims.reduce((a, x) => a * x, 1);
        const s = { k: 'arr', tipo: d.tipo, dims, total, slot: fn.slots, global: false, nome: d.nome };
        fn.slots += total;
        if (fn.slots > 255) falha(d.linha, 'Vetor local grande demais. Declare-o fora das funções.');
        fn.maxSlots = Math.max(fn.maxSlots, fn.slots);
        escopo.set(d.nome, s);
        const { vals, exprs } = valoresIniciais(d, dims);
        // zera / inicializa todas as posições (como o C só faz com inicializador, mas é mais seguro)
        vals.forEach((v, i) => { push(i); push(v); b(OP.STLA, s.slot); w(total); });
        for (const x of exprs) { push(x.idx); expr(x.e); emitirCast(d.tipo); b(OP.STLA, s.slot); w(total); }
        return;
      }
      const c = d.init ? constante(d.init) : null;
      if (d.constante && c !== null) { escopo.set(d.nome, { k: 'const', v: converter(c, d.tipo), tipo: d.tipo, total: 1 }); return; }
      const s = { k: 'var', tipo: d.tipo, slot: fn.slots++, global: false, total: 1, nome: d.nome };
      if (fn.slots > 255) falha(d.linha, 'Variáveis locais demais nesta função.');
      fn.maxSlots = Math.max(fn.maxSlots, fn.slots);
      if (d.init) {
        if (d.init.k === 'str') falha(d.linha, 'Variáveis só guardam números na MIDE web.');
        expr(d.init); emitirCast(d.tipo);
      } else push(0);
      b(OP.STL, s.slot);
      escopo.set(d.nome, s);   // depois do valor: "int x = x;" usa o x de fora, como no C
    }

    function comando(c) {
      switch (c.k) {
        case 'vazio': return;
        case 'bloco': {
          fn.escopos.push(new Map());
          const slots = fn.slots;
          for (const x of c.cmds) comando(x);
          fn.escopos.pop();
          fn.slots = slots;
          return;
        }
        case 'decls': linha(c.linha); for (const d of c.lista) declLocal(d); return;
        case 'expr': linha(c.linha); expr(c.e, false); return;
        case 'if': {
          linha(c.linha);
          const senao = novoRot(), fim = novoRot();
          expr(c.cond); b(OP.JZ); wRot(senao);
          comando(c.entao);
          if (c.senao) { b(OP.JMP); wRot(fim); }
          marca(senao); ultimaLinha = -1;
          if (c.senao) { comando(c.senao); marca(fim); ultimaLinha = -1; }
          return;
        }
        case 'while': {
          const ini = novoRot(), fim = novoRot();
          marca(ini); ultimaLinha = -1; linha(c.linha);
          expr(c.cond); b(OP.JZ); wRot(fim);
          laços.push({ brk: fim, cont: ini });
          comando(c.corpo);
          laços.pop();
          b(OP.JMP); wRot(ini);
          marca(fim); ultimaLinha = -1;
          return;
        }
        case 'dowhile': {
          const ini = novoRot(), cont = novoRot(), fim = novoRot();
          marca(ini); ultimaLinha = -1;
          laços.push({ brk: fim, cont });
          comando(c.corpo);
          laços.pop();
          marca(cont); ultimaLinha = -1; linha(c.linha);
          expr(c.cond); b(OP.JNZ); wRot(ini);
          marca(fim); ultimaLinha = -1;
          return;
        }
        case 'for': {
          fn.escopos.push(new Map());
          const slots = fn.slots;
          linha(c.linha);
          if (c.init) comando(c.init);
          const ini = novoRot(), cont = novoRot(), fim = novoRot();
          marca(ini); ultimaLinha = -1;
          if (c.cond) { linha(c.linha); expr(c.cond); b(OP.JZ); wRot(fim); }
          laços.push({ brk: fim, cont });
          comando(c.corpo);
          laços.pop();
          marca(cont); ultimaLinha = -1;
          if (c.passo) { linha(c.linha); expr(c.passo, false); }
          b(OP.JMP); wRot(ini);
          marca(fim); ultimaLinha = -1;
          fn.escopos.pop();
          fn.slots = slots;
          return;
        }
        case 'switch': {
          linha(c.linha);
          const tv = novoTemp(), fim = novoRot();
          expr(c.valor); b(OP.STG); w(tv);
          const rots = c.casos.map(() => novoRot());
          let padrao = null;
          const vistos = new Set();
          c.casos.forEach((cs, i) => {
            if (cs.padrao) { padrao = rots[i]; return; }
            const v = constante(cs.valor);
            if (v === null) falha(cs.linha, 'O valor do case tem de ser um número fixo.');
            if (vistos.has(v)) falha(cs.linha, `case ${v} aparece duas vezes.`);
            vistos.add(v);
            b(OP.LDG); w(tv); push(v); b(OP.EQ); b(OP.JNZ); wRot(rots[i]);
          });
          b(OP.JMP); wRot(padrao || fim);
          laços.push({ brk: fim, cont: laços.length ? laços[laços.length - 1].cont : null });
          fn.escopos.push(new Map());
          const slots = fn.slots;
          c.casos.forEach((cs, i) => { marca(rots[i]); ultimaLinha = -1; for (const x of cs.cmds) comando(x); });
          fn.escopos.pop(); fn.slots = slots;
          laços.pop();
          marca(fim); ultimaLinha = -1;
          return;
        }
        case 'break': {
          linha(c.linha);
          if (!laços.length) falha(c.linha, 'break só pode ser usado dentro de um laço (for, while) ou switch.');
          b(OP.JMP); wRot(laços[laços.length - 1].brk);
          return;
        }
        case 'continue': {
          linha(c.linha);
          const l = [...laços].reverse().find((x) => x.cont);
          if (!l) falha(c.linha, 'continue só pode ser usado dentro de um laço (for, while).');
          b(OP.JMP); wRot(l.cont);
          return;
        }
        case 'return': {
          linha(c.linha);
          if (c.e) {
            if (fn.ret === 'void') falha(c.linha, `${fn.nome}() é void: o return não pode ter valor.`);
            expr(c.e); emitirCast(fn.ret); b(OP.RETV);
          } else {
            if (fn.ret !== 'void') falha(c.linha, `${fn.nome}() precisa devolver um valor: return valor;`);
            b(OP.RET);
          }
          return;
        }
      }
      falha(c.linha, 'Comando que a MIDE web não entende.');
    }

    // ---------- monta ----------
    // cabeçalho (16 bytes) — preenchido no fim
    for (let i = 0; i < 16; i++) b(0);

    for (const it of itens) {
      if (it.k !== 'funcao') continue;
      const f = funcoes[it.nome];
      fn = { nome: it.nome, ret: it.ret, escopos: [new Map()], slots: 0, maxSlots: 0 };
      marca(f.rotulo);
      ultimaLinha = -1;
      const posEnter = cod.length;
      b(OP.ENTER, 0);
      for (const prm of it.params) {
        if (fn.escopos[0].has(prm.nome)) falha(prm.linha, `Parâmetro "${prm.nome}" repetido.`);
        fn.escopos[0].set(prm.nome, { k: 'var', tipo: prm.tipo, slot: fn.slots++, global: false, total: 1, nome: prm.nome });
      }
      fn.maxSlots = fn.slots;
      fn.escopos.push(new Map());
      for (const x of it.corpo.cmds) comando(x);
      if (it.ret === 'void') b(OP.RET); else { push(0); b(OP.RETV); }
      cod[posEnter + 1] = fn.maxSlots;
      fn = null;
    }

    // inicialização das globais
    const rotInit = novoRot();
    marca(rotInit);
    ultimaLinha = -1;
    b(OP.ENTER, 0);
    for (const x of inits) {
      linha(x.d.linha);
      if (x.k === 'lcd') {
        for (const a of x.d.args) {
          const v = constante(a);
          if (v === null) falha(x.d.linha, 'Os valores do LCD têm de ser números fixos: LiquidCrystal_I2C lcd(0x27, 16, 2);');
          push(v);
        }
        sys(S.LCDNEW);
      } else if (x.k === 'var') {
        expr(x.d.init); emitirCast(x.s.tipo); b(OP.STG); w(x.s.addr);
      } else if (x.k === 'arr') {
        const { vals, exprs } = valoresIniciais(x.d, x.s.dims);
        const maior = vals.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        const tam = maior < 128 ? 1 : maior < 32768 ? 2 : 4;
        // em blocos de até 200 valores
        for (let i = 0; i < vals.length; i += 200) {
          const parte = vals.slice(i, i + 200);
          b(OP.ARRINIT); w(x.s.addr + i); w(parte.length); b(tam);
          for (const v of parte) { if (tam === 1) b(v); else if (tam === 2) w(v); else b(v, v >> 8, v >> 16, v >> 24); }
        }
        for (const ex of exprs) { push(ex.idx); expr(ex.e); emitirCast(x.s.tipo); b(OP.STGA); w(x.s.addr); w(x.s.total); }
      }
    }
    b(OP.RET);

    if (!funcoes.setup) falha(1, 'Falta a função void setup() { ... }.');
    if (!funcoes.loop) falha(1, 'Falta a função void loop() { ... }.');
    if (funcoes.setup.params.length || funcoes.loop.params.length) falha(funcoes.setup.linha, 'setup() e loop() não recebem parâmetros.');

    // textos
    for (const t of textos) {
      const pos = cod.length;
      for (const ch of t.texto) {
        const code = ch.charCodeAt(0);
        b(code > 255 ? 63 : code);   // fora do ASCII estendido vira "?"
      }
      b(0);
      cod[t.pos] = pos & 0xFF; cod[t.pos + 1] = (pos >> 8) & 0xFF;
    }
    // rótulos
    for (const f of fix) {
      const alvo = rotulos[f.rotulo];
      if (alvo === undefined) throw new Error('rótulo sem destino: ' + f.rotulo);
      cod[f.pos] = alvo & 0xFF; cod[f.pos + 1] = (alvo >> 8) & 0xFF;
    }

    if (nGlob + PILHA_MINIMA > MEMCELLS) {
      falha(1, `As variáveis não cabem na memória do Arduino (usam ${nGlob} de ${MEMCELLS - PILHA_MINIMA} posições). ` +
        'Diminua os vetores ou use menos variáveis globais.');
    }
    if (cod.length > PROG_MAX) falha(1, `O programa ficou grande demais para a MIDE web (${cod.length} bytes; o limite é ${PROG_MAX}).`);

    // cabeçalho
    const tamanho = cod.length;
    let soma = 0;
    for (let i = 16; i < tamanho; i++) soma = (soma + cod[i]) & 0xFFFF;
    const cab = [0x4D, 0x56, VM_VERSAO, 0, tamanho, tamanho >> 8,
      rotulos[rotInit], rotulos[rotInit] >> 8,
      rotulos[funcoes.setup.rotulo], rotulos[funcoes.setup.rotulo] >> 8,
      rotulos[funcoes.loop.rotulo], rotulos[funcoes.loop.rotulo] >> 8,
      nGlob, nGlob >> 8, soma, soma >> 8];
    cab.forEach((x, i) => { cod[i] = x & 0xFF; });

    return { bytes: Uint8Array.from(cod), globais: nGlob };
  }

  function compilar(fonte) {
    try {
      const { toks, includes } = lexico(String(fonte || ''));
      const itens = sintaxe(toks);
      const r = gerar(itens, includes);
      return { ok: true, bytes: r.bytes, erros: [], info: { tamanho: r.bytes.length, globais: r.globais, memoria: MEMCELLS } };
    } catch (e) {
      if (e instanceof ErroMide) return { ok: false, erros: [{ linha: e.linha, msg: e.message }] };
      return { ok: false, erros: [{ linha: 0, msg: 'Erro interno do compilador da MIDE: ' + e.message }] };
    }
  }

  /* Forma canônica do código (sem comentários e espaços sobrando), para
   * reconhecer quando o aluno digitou exatamente a solução de uma missão. */
  function normalizar(fonte) {
    let s = String(fonte || ''), out = '', i = 0;
    const textos = [];
    while (i < s.length) {
      const c = s[i];
      if (c === '"' || c === '\'') {
        let j = i + 1;
        while (j < s.length && s[j] !== c && s[j] !== '\n') j += s[j] === '\\' ? 2 : 1;
        textos.push(s.slice(i, j + 1));
        out += '\u0001' + (textos.length - 1) + '\u0002'; i = j + 1; continue;
      }
      if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; continue; }
      if (c === '/' && s[i + 1] === '*') { const f = s.indexOf('*/', i + 2); i = f < 0 ? s.length : f + 2; out += ' '; continue; }
      out += /\s/.test(c) ? ' ' : c; i++;
    }
    // espaço só fica entre duas letras/números (int x); some o resto
    return out.replace(/ +/g, ' ').replace(/ ?([^A-Za-z0-9_ \u0001\u0002]) ?/g, '$1').trim()
      .replace(/ ?\u0001(\d+)\u0002 ?/g, (m, k) => textos[+k]);
  }
  function hash(texto) {
    let h = 0x811c9dc5;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  const api = { compilar, normalizar, hash, VM_VERSAO, MEMCELLS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.MideCompilador = api;
})(typeof window !== 'undefined' ? window : globalThis);
