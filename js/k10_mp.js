/* ============================================================
 * k10_mp.js — UNIHIKER K10 em MicroPython pela USB do navegador
 * ------------------------------------------------------------
 * Fala com o REPL do MicroPython pela Web Serial, do mesmo jeito
 * que o mpremote: Ctrl+C para o programa, Ctrl+A entra no "raw
 * REPL", o código vai em pedaços e Ctrl+D executa. Com isso:
 *
 *   enviar(codigo) -> confere o firmware (unihiker_k10), confere a
 *                     sintaxe na própria placa, grava academy_upload.py,
 *                     troca pelo main.py (o antigo vira
 *                     main.academy-backup.py) e reinicia o MicroPython
 *                     (soft reboot), que roda o main.py novo
 *   testar()       -> só confere o firmware
 *   parar()        -> Ctrl+C no programa que está rodando
 *   escrever(txt)  -> texto para o input() do programa
 *
 * Fora dos comandos, tudo o que a placa escreve vai para aoTexto
 * (o Monitor Serial da IDE). Sem DOM: os testes em Node usam uma
 * porta simulada (ferramentas/k10/testar_k10_mp.mjs).
 * ============================================================ */
(function (raiz) {
  'use strict';

  const VID_ESPRESSIF = 0x303A;
  const BANNER_RAW = 'raw REPL; CTRL-B to exit\r\n>';
  const PROBE = "import sys\nassert sys.implementation.name == 'micropython'\nimport unihiker_k10\nprint('K10_MICROPYTHON_READY')";
  const PROMOVER = "import os\nif 'main.py' in os.listdir():\n    if 'main.academy-backup.py' in os.listdir():\n        os.remove('main.academy-backup.py')\n    os.rename('main.py', 'main.academy-backup.py')\nos.rename('academy_upload.py', 'main.py')\nprint('PROMOVIDO')";

  const enc = new TextEncoder();
  const bytesDe = (s) => (s instanceof Uint8Array ? s : enc.encode(s));

  /* Bytes -> literal de bytes do Python (b'...'), sem depender de base64 na placa. */
  function literalBytes(u8) {
    let s = "b'";
    for (const b of u8) {
      if (b >= 0x20 && b < 0x7F && b !== 0x27 && b !== 0x5C) s += String.fromCharCode(b);
      else s += '\\x' + b.toString(16).padStart(2, '0');
    }
    return s + "'";
  }

  /* Linha do main.py citada num traceback do MicroPython. */
  function linhaDoErro(texto) {
    /* a última citação do main.py é a linha onde o erro aconteceu */
    const ms = [...String(texto).matchAll(/File "main\.py", line (\d+)/g)];
    return ms.length ? +ms[ms.length - 1][1] : null;
  }

  /* Explica em português o erro que a placa devolveu. */
  function traduzirErro(texto) {
    const t = String(texto || '').trim();
    const ultima = t.split(/\r?\n/).filter(Boolean).pop() || t;
    const linha = linhaDoErro(t);
    const onde = linha ? `Erro na linha ${linha}: ` : '';
    let m;
    if ((m = /ImportError: no module named '([^']+)'/.exec(ultima))) return `${onde}a biblioteca “${m[1]}” não existe nesta placa.`;
    if ((m = /NameError: name '([^']+)' isn't defined/.exec(ultima))) return `${onde}o nome “${m[1]}” não existe (variável não criada ou escrita diferente).`;
    if (/SyntaxError/.test(ultima)) return `${onde}a escrita do Python está errada (confira dois-pontos, parênteses, aspas e a indentação).`;
    if (/IndentationError/.test(ultima)) return `${onde}a indentação (espaços no começo da linha) está errada.`;
    if ((m = /AttributeError: '([^']+)' object has no attribute '([^']+)'/.exec(ultima))) return `${onde}“${m[2]}” não existe em ${m[1]}.`;
    if (/TypeError/.test(ultima)) return `${onde}tipo de valor errado ou quantidade errada de valores dentro dos parênteses. (${ultima})`;
    if (/OSError: \[Errno 28\]/.test(ultima)) return 'A memória de arquivos da K10 está cheia.';
    return (onde || '') + ultima;
  }

  /* Junta os pedaços de texto em linhas (o Monitor mostra linha a linha). */
  function criarBufferLinhas(aoLinha) {
    let resto = '';
    let vinhaCR = false;
    return {
      adicionar(texto) {
        let t = String(texto).replace(/�/g, '');
        if (vinhaCR && t[0] === '\n') t = t.slice(1);
        vinhaCR = t.endsWith('\r');
        const partes = (resto + t).split(/\r\n|\r|\n/);
        resto = partes.pop();
        for (const l of partes) aoLinha(l);
      },
      pendente() { return resto.length > 0; },
      descarregar() { if (resto.length) { const l = resto; resto = ''; aoLinha(l); } },
    };
  }

  function criar(opcoes) {
    opcoes = opcoes || {};
    const serial = opcoes.serial !== undefined ? opcoes.serial : (raiz.navigator && raiz.navigator.serial);
    const dormir = opcoes.dormir || ((ms) => new Promise((r) => setTimeout(r, ms)));
    const PEDACO = opcoes.pedaco || 256;      // bytes por escrita (como o pyboard.py)
    const PAUSA = opcoes.pausa === undefined ? 10 : opcoes.pausa;

    const S = {
      porta: null, estado: 'desconectado', modo: 'monitor',
      fila: [], espera: null, leitor: null, lendo: null, fechando: false,
      dec: new TextDecoder('utf-8'), cadeia: Promise.resolve(), info: null,
    };
    const ouvintes = { texto: [], estado: [] };
    const emitir = (tipo, v) => { for (const f of ouvintes[tipo]) { try { f(v); } catch (e) { /* ouvinte com erro não derruba a conexão */ } } };
    const mudar = (e) => { if (S.estado !== e) { S.estado = e; emitir('estado', e); } };

    /* Uma operação de cada vez na porta (enviar, testar, parar…). */
    function emFila(fn) {
      const p = S.cadeia.then(fn, fn);
      S.cadeia = p.catch(() => {});
      return p;
    }

    /* ---------------- porta ---------------- */
    async function abrir(porta) {
      S.porta = porta;
      S.fechando = false;
      try {
        await porta.open({ baudRate: 115200, bufferSize: 8192 });
      } catch (e) {
        S.porta = null;
        mudar('desconectado');
        throw new Error('A porta da K10 está ocupada. Feche o Thonny, o Arduino IDE, o Mind+ ou outra aba da MIDE que esteja usando a placa e tente de novo.');
      }
      S.info = porta.getInfo ? porta.getInfo() : {};
      S.modo = 'monitor';
      S.lendo = laco(porta);
      mudar('conectado');
    }

    async function laco(porta) {
      /* Um erro de leitura passageiro troca o porta.readable por um novo: segue lendo.
         Cabo puxado: readable vira null e o laço termina. */
      while (porta.readable && !S.fechando) {
        S.leitor = porta.readable.getReader();
        try {
          for (;;) {
            const { value, done } = await S.leitor.read();
            if (done) break;
            if (value && value.length) receber(value);
          }
        } catch (e) { await dormir(20); }
        finally { try { S.leitor.releaseLock(); } catch (e) { } }
      }
      if (!S.fechando && S.porta === porta) {
        S.porta = null;
        try { await porta.close(); } catch (e) { }
        mudar('desconectado');
      }
    }

    function receber(bytes) {
      if (S.modo === 'repl') {
        for (const b of bytes) S.fila.push(b);
        if (S.espera) S.espera();
        return;
      }
      const t = S.dec.decode(bytes, { stream: true });
      if (t) emitir('texto', t);
    }

    async function escreverBruto(dados) {
      if (!S.porta || !S.porta.writable) throw new Error('A K10 foi desconectada.');
      const u8 = bytesDe(dados);
      for (let i = 0; i < u8.length; i += PEDACO) {
        const w = S.porta.writable.getWriter();
        try { await w.write(u8.subarray(i, i + PEDACO)); } finally { w.releaseLock(); }
        if (u8.length > PEDACO && PAUSA) await dormir(PAUSA);
      }
    }

    /* Espera o marcador chegar; devolve o que veio antes dele. */
    async function lerAte(marcador, ms) {
      const m = bytesDe(marcador);
      const limite = Date.now() + ms;
      for (;;) {
        const i = procurar(S.fila, m);
        if (i >= 0) {
          const antes = S.fila.splice(0, i + m.length).slice(0, i);
          return new TextDecoder().decode(Uint8Array.from(antes));
        }
        const resta = limite - Date.now();
        if (resta <= 0) {
          const e = new Error('tempo esgotado');
          e.recebido = new TextDecoder().decode(Uint8Array.from(S.fila));
          throw e;
        }
        if (!S.porta) throw new Error('A K10 foi desconectada.');
        await new Promise((r) => { S.espera = r; setTimeout(r, Math.min(resta, 50)); });
        S.espera = null;
      }
    }
    function procurar(fila, m) {
      fora: for (let i = 0; i + m.length <= fila.length; i++) {
        for (let j = 0; j < m.length; j++) if (fila[i + j] !== m[j]) continue fora;
        return i;
      }
      return -1;
    }

    /* ---------------- raw REPL ---------------- */
    async function entrarRaw() {
      S.modo = 'repl';
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        await escreverBruto('\r\x03');
        await dormir(80);
        await escreverBruto('\x03');
        await dormir(tentativa ? 400 : 150);
        S.fila.length = 0;
        await escreverBruto('\r\x01');
        try {
          await lerAte(BANNER_RAW, 1500 + tentativa * 1500);
          return;
        } catch (e) {
          if (/desconectada/.test(e.message)) throw e;
        }
      }
      const e = new Error('A K10 não respondeu como MicroPython. Ela pode estar com um programa em C++ (Arduino) gravado: use “Preparar K10” → “Instalar MicroPython na K10”. Se ela já tem MicroPython, aperte RST na placa e tente de novo.');
      e.semMicroPython = true;
      throw e;
    }

    async function executar(codigo, ms) {
      await escreverBruto(codigo);
      await escreverBruto('\x04');
      const ok = await lerAte('OK', 3000).catch(() => null);
      if (ok === null) throw new Error('A K10 parou de responder durante o envio.');
      const saida = await lerAte('\x04', ms || 10000);
      const erro = await lerAte('\x04', 3000);
      await lerAte('>', 1000).catch(() => {});
      return { saida, erro };
    }

    async function sairRaw(reiniciar) {
      await escreverBruto('\r\x02');
      await dormir(60);
      S.fila.length = 0;
      S.dec = new TextDecoder('utf-8');
      S.modo = 'monitor';
      if (reiniciar) await escreverBruto('\x04');   // soft reboot: o MicroPython roda o main.py de novo
    }

    async function conferirFirmware() {
      const r = await executar(PROBE, 8000);
      if (r.saida.includes('K10_MICROPYTHON_READY')) return;
      if (/unihiker_k10/.test(r.erro)) {
        throw new Error('A placa tem MicroPython, mas não a versão da UNIHIKER K10 (falta a biblioteca unihiker_k10). Instale o firmware MicroPython da K10 em “Preparar K10”.');
      }
      throw new Error('Não foi possível confirmar o firmware MicroPython da K10.\n' + (r.erro || r.saida));
    }

    /* ---------------- operações públicas ---------------- */
    function suportado() { return !!serial; }

    /* Abre a janela do navegador para escolher a K10. Tem de ser a 1ª coisa do clique. */
    async function conectar() {
      if (!serial) throw new Error('Este navegador não grava pela USB. Use o Google Chrome ou o Microsoft Edge (computador).');
      let porta;
      try {
        porta = await serial.requestPort({ filters: [{ usbVendorId: VID_ESPRESSIF }] });
      } catch (e) {
        return false;   // a pessoa fechou a janela sem escolher
      }
      if (S.porta === porta && S.estado !== 'desconectado') return true;
      await liberar();
      await abrir(porta);
      return true;
    }

    /* Já autorizada antes? Conecta sem perguntar (ao abrir a página, ao religar o cabo). */
    async function reconectar() {
      if (!serial || S.porta) return !!S.porta;
      const lista = await serial.getPorts();
      const k10 = lista.find((p) => (p.getInfo ? p.getInfo() : {}).usbVendorId === VID_ESPRESSIF);
      if (!k10) return false;
      try { await abrir(k10); return true; } catch (e) { return false; }
    }

    async function liberar() {
      const porta = S.porta;
      if (!porta) { mudar('desconectado'); return; }
      S.fechando = true;
      try { if (S.leitor) await S.leitor.cancel(); } catch (e) { }
      try { await S.lendo; } catch (e) { }
      try { await porta.close(); } catch (e) { }
      S.porta = null;
      mudar('desconectado');
    }

    function testar() {
      return emFila(async () => {
        if (!S.porta) throw new Error('Conecte a K10 primeiro.');
        mudar('enviando');
        try {
          await entrarRaw();
          await conferirFirmware();
          await sairRaw(true);
          return { ok: true, log: 'K10 conectada. MicroPython e biblioteca unihiker_k10 encontrados.' };
        } catch (e) {
          await sairRaw(false).catch(() => {});
          return { ok: false, log: e.message, semMicroPython: !!e.semMicroPython };
        } finally { if (S.porta) mudar('conectado'); }
      });
    }

    function enviar(codigo, aoProgresso) {
      const passo = (pct, texto) => { if (aoProgresso) aoProgresso(pct, texto); };
      return emFila(async () => {
        if (!S.porta) throw new Error('Conecte a K10 primeiro.');
        const fonte = bytesDe(String(codigo).replace(/\r\n/g, '\n'));
        mudar('enviando');
        const linhas = [];
        try {
          passo(5, 'Parando o programa da K10…');
          await entrarRaw();
          passo(15, 'Conferindo o firmware MicroPython…');
          await conferirFirmware();

          passo(25, 'Conferindo a escrita do Python na própria K10…');
          const c = await executar(`compile(${literalBytes(fonte)}.decode(), 'main.py', 'exec')\nprint('SINTAXE_OK')`, 8000);
          if (!c.saida.includes('SINTAXE_OK')) {
            await sairRaw(true);
            return { ok: false, log: 'A K10 encontrou um erro antes de salvar o programa:\n' + traduzirErro(c.erro), linha: linhaDoErro(c.erro) };
          }

          /* grava em academy_upload.py: se o cabo sair no meio, o main.py antigo continua lá */
          await executar("f = open('academy_upload.py', 'wb')\nw = f.write", 3000);
          const TAM = 192;
          const total = Math.max(1, Math.ceil(fonte.length / TAM));
          let feitos = 0;
          for (let i = 0; i < fonte.length; i += TAM * 8) {
            const lote = [];
            for (let j = i; j < Math.min(fonte.length, i + TAM * 8); j += TAM) {
              lote.push('w(' + literalBytes(fonte.subarray(j, Math.min(j + TAM, fonte.length))) + ')');
              feitos++;
            }
            const r = await executar(lote.join('\n'), 5000);
            if (r.erro) throw new Error('Falha ao gravar o arquivo na K10: ' + traduzirErro(r.erro));
            passo(30 + Math.round(55 * feitos / total), 'Gravando o programa na K10…');
          }
          const fim = await executar('f.close()\nprint(len(open(\'academy_upload.py\', \'rb\').read()))', 3000);
          if (+fim.saida.trim() !== fonte.length) throw new Error('O arquivo gravado na K10 ficou com tamanho diferente. O programa anterior foi preservado.');

          passo(90, 'Trocando o main.py…');
          const p = await executar(PROMOVER, 5000);
          if (!p.saida.includes('PROMOVIDO')) throw new Error('Arquivo transferido, mas a troca do main.py falhou. Confira main.py e main.academy-backup.py na placa.\n' + p.erro);

          linhas.push(`main.py gravado (${fonte.length} bytes). A versão anterior ficou em main.academy-backup.py.`);
          passo(97, 'Reiniciando o MicroPython…');
          await sairRaw(true);
          linhas.push('MicroPython reiniciado: o programa novo já está rodando. O que ele escrever com print() aparece no Monitor Serial.');
          passo(100, 'Pronto');
          return { ok: true, log: linhas.join('\n') };
        } catch (e) {
          await sairRaw(false).catch(() => {});
          return { ok: false, log: e.message, semMicroPython: !!e.semMicroPython };
        } finally { if (S.porta) mudar('conectado'); }
      });
    }

    /* Ctrl+C: para o programa (o MicroPython fica no REPL esperando). */
    function parar() {
      return emFila(async () => {
        if (!S.porta) return false;
        await escreverBruto('\x03\x03');
        return true;
      });
    }

    async function escrever(texto) {
      if (!S.porta || S.estado !== 'conectado') return false;
      await escreverBruto(texto);
      return true;
    }

    if (serial && serial.addEventListener) {
      serial.addEventListener('disconnect', (ev) => {
        if (ev.target === S.porta || ev.port === S.porta) { S.porta = null; mudar('desconectado'); }
      });
    }

    return {
      suportado, conectar, reconectar, liberar, testar, enviar, parar, escrever,
      on(tipo, fn) { if (ouvintes[tipo]) ouvintes[tipo].push(fn); },
      get estado() { return S.estado; },
      get conectado() { return S.estado !== 'desconectado'; },
      get porta() { return S.porta; },
    };
  }

  const K10MP = { criar, criarBufferLinhas, literalBytes, traduzirErro, linhaDoErro, VID_ESPRESSIF };
  raiz.K10MP = K10MP;
  if (typeof module !== 'undefined' && module.exports) module.exports = K10MP;
})(typeof window !== 'undefined' ? window : globalThis);
