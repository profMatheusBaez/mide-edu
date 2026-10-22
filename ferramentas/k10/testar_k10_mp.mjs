// Testa js/k10_mp.js contra uma UNIHIKER K10 de mentira: uma porta Web Serial
// falsa que fala o REPL do MicroPython (modo normal e raw REPL, Ctrl+A/B/C/D)
// e executa o código de verdade no CPython (_k10_falsa.py), dentro de uma
// pasta temporária que faz o papel do sistema de arquivos da placa.
//
//   node ferramentas/k10/testar_k10_mp.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const K10MP = require(path.join(AQUI, '../../js/k10_mp.js'));

let falhas = 0, passou = 0;
function confere(cond, nome, extra) {
  if (cond) { passou++; console.log('  ok  ' + nome); }
  else { falhas++; console.log('  XX  ' + nome + (extra ? '\n      ' + extra : '')); }
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------
 * A placa de mentira
 * ---------------------------------------------------------- */
class K10Falsa {
  constructor({ firmware = 'k10', pedacos = true, eco = true } = {}) {
    this.dir = fs.mkdtempSync(path.join(os.tmpdir(), 'k10falsa_'));
    if (firmware === 'k10') {
      fs.mkdirSync(path.join(this.dir, 'lib'));
      fs.writeFileSync(path.join(this.dir, 'unihiker_k10.py'),
        'class _Tela:\n    def init(self, dir=2): print("[tela] init", dir)\n    def show_bg(self, color=0): pass\n' +
        '    def draw_text(self, text="", x=0, y=0, font_size=16, color=0): print("[tela]", text)\n    def show_draw(self): pass\n' +
        'screen = _Tela()\n');
    }
    this.firmware = firmware;
    this.pedacos = pedacos;
    this.eco = eco;
    this.modo = 'normal';
    this.buf = [];
    this.recebidos = [];     // tudo o que a IDE mandou (para conferir Ctrl+C etc.)
    this.reboots = 0;
    this.saidas = [];
    this.py = null;
    this.ocupado = Promise.resolve();
    this.aberta = false;
    this.porta = this.criarPorta();
  }

  iniciarPython() {
    this.py = spawn('python3', ['-I', path.join(AQUI, '_k10_falsa.py')], { cwd: this.dir});
    this.py.stdout.setEncoding('utf8');
    this.respostas = [];
    let resto = '';
    this.py.stdout.on('data', (d) => {
      resto += d;
      let i;
      while ((i = resto.indexOf('\n')) >= 0) { const l = resto.slice(0, i); resto = resto.slice(i + 1); const f = this.respostas.shift(); if (f) f(JSON.parse(l)); }
    });
  }
  executarPy(codigo) {
    return new Promise((r) => { this.respostas.push(r); this.py.stdin.write(JSON.stringify({ exec: codigo }) + '\n'); });
  }

  /* bytes para a IDE, quebrados em pedaços aleatórios como na USB */
  mandar(texto) {
    const u8 = Buffer.from(texto, 'utf8');
    if (!this.ctl) return;
    if (!this.pedacos) { this.ctl.enqueue(new Uint8Array(u8)); return; }
    for (let i = 0; i < u8.length;) {
      const n = 1 + Math.floor(Math.random() * 7);
      this.ctl.enqueue(new Uint8Array(u8.subarray(i, i + n)));
      i += n;
    }
  }

  async receber(bytes) {
    for (const b of bytes) {
      this.recebidos.push(b);
      await this.byte(b);
    }
  }

  async byte(b) {
    if (this.firmware === 'cpp') { this.mandar('Arduino rodando\r\n'); return; }   // programa C++: ignora o REPL
    if (this.modo === 'normal') {
      if (b === 0x03) { this.buf = []; this.mandar('\r\nKeyboardInterrupt: \r\n>>> '); return; }
      if (b === 0x01) { this.modo = 'raw'; this.buf = []; this.mandar('raw REPL; CTRL-B to exit\r\n>'); return; }
      if (b === 0x04) { await this.softReboot(); return; }
      if (this.eco) this.mandar(String.fromCharCode(b));
      return;
    }
    // raw REPL
    if (b === 0x02) { this.modo = 'normal'; this.buf = []; this.mandar('\r\nMicroPython v1.24 on K10\r\n>>> '); return; }
    if (b === 0x03) { this.buf = []; return; }
    if (b === 0x01) { this.buf = []; this.mandar('raw REPL; CTRL-B to exit\r\n>'); return; }
    if (b === 0x04) {
      if (!this.buf.length) { await this.softReboot(true); return; }
      const codigo = Buffer.from(this.buf).toString('utf8');
      this.buf = [];
      this.mandar('OK');
      const r = await this.executarPy(codigo);
      this.mandar(r.saida.replace(/\n/g, '\r\n') + '\x04' + r.erro.replace(/\n/g, '\r\n') + '\x04>');
      return;
    }
    this.buf.push(b);
  }

  async softReboot(raw) {
    this.reboots++;
    this.py.kill();
    this.iniciarPython();
    this.mandar('MPY: soft reboot\r\n');
    if (raw) { this.mandar('raw REPL; CTRL-B to exit\r\n>'); return; }
    const main = path.join(this.dir, 'main.py');
    if (fs.existsSync(main)) {
      const r = await this.executarPy(fs.readFileSync(main, 'utf8'));
      this.mandar(r.saida.replace(/\n/g, '\r\n') + r.erro.replace(/\n/g, '\r\n'));
    }
    this.mandar('MicroPython v1.24 on K10\r\n>>> ');
  }

  criarPorta() {
    const k = this;
    return {
      readable: null, writable: null,
      getInfo() { return { usbVendorId: 0x303A, usbProductId: 0x1001 }; },
      async open() {
        if (k.aberta) throw new Error('InvalidStateError: already open');
        k.aberta = true;
        k.iniciarPython();
        this.readable = new ReadableStream({ start(c) { k.ctl = c; } });
        this.writable = new WritableStream({
          write(chunk) { k.ocupado = k.ocupado.then(() => k.receber(chunk)); return k.ocupado; },
        });
      },
      async close() {
        k.aberta = false;
        try { k.ctl.close(); } catch (e) { }
        k.ctl = null;
        this.readable = null; this.writable = null;
        if (k.py) k.py.kill();
      },
    };
  }

  /* "cabo puxado": a leitura acaba sem ninguém fechar */
  puxarCabo() { try { this.ctl.error(new Error('desconectada')); } catch (e) { } this.porta.readable = null; this.porta.writable = null; this.aberta = false; }
  arquivo(nome) { const p = path.join(this.dir, nome); return fs.existsSync(p) ? fs.readFileSync(p) : null; }
  limpar() { try { fs.rmSync(this.dir, { recursive: true, force: true }); } catch (e) { } if (this.py) this.py.kill(); }
}

function serialFalsa(placa) {
  return {
    async requestPort() { return placa.porta; },
    async getPorts() { return [placa.porta]; },
    addEventListener() { },
  };
}

async function montar(opcoesPlaca) {
  const placa = new K10Falsa(opcoesPlaca);
  const k = K10MP.criar({ serial: serialFalsa(placa) });
  const texto = [];
  k.on('texto', (t) => texto.push(t));
  const estados = [];
  k.on('estado', (e) => estados.push(e));
  return { placa, k, texto, estados, monitor: () => texto.join('') };
}

/* ------------------------------------------------------------
 * Testes
 * ---------------------------------------------------------- */
console.log('\nK10 MicroPython pela Web Serial');

{
  console.log('\n1. Testar conexão');
  const { placa, k, estados } = await montar();
  confere(await k.conectar(), 'conectar escolhe a porta');
  confere(k.estado === 'conectado', 'estado conectado');
  const r = await k.testar();
  confere(r.ok, 'firmware K10 reconhecido', r.log);
  confere(placa.reboots === 1, 'reinicia o MicroPython depois do teste (programa volta a rodar)');
  confere(estados.includes('enviando') && k.estado === 'conectado', 'estados: enviando → conectado');
  await k.liberar();
  confere(k.estado === 'desconectado' && !placa.aberta, 'liberar fecha a porta');
  placa.limpar();
}

{
  console.log('\n2. Enviar um programa da trilha');
  const { placa, k, monitor } = await montar();
  fs.writeFileSync(path.join(placa.dir, 'main.py'), 'print("programa antigo")\n');
  await k.conectar();
  const codigo = 'from unihiker_k10 import screen\n\nscreen.init(dir=2)\nscreen.draw_text(text="Olá, mundo!", x=10, y=20, font_size=24, color=0xFFFFFF)\nscreen.show_draw()\nprint("K10 conectada!")\n';
  const pcts = [];
  const r = await k.enviar(codigo, (p) => pcts.push(p));
  confere(r.ok, 'enviar ok', r.log);
  confere(placa.arquivo('main.py') && placa.arquivo('main.py').toString('utf8') === codigo, 'main.py igual byte a byte (com acento)');
  confere(placa.arquivo('main.academy-backup.py') && placa.arquivo('main.academy-backup.py').toString() === 'print("programa antigo")\n', 'main.py antigo guardado em main.academy-backup.py');
  confere(!placa.arquivo('academy_upload.py'), 'arquivo temporário renomeado');
  confere(pcts.length > 3 && pcts[pcts.length - 1] === 100 && pcts.every((p, i) => !i || p >= pcts[i - 1]), 'progresso sobe até 100%', pcts.join(','));
  await dormir(400);
  const m = monitor();
  confere(/K10 conectada!/.test(m) && /\[tela\] Olá, mundo!/.test(m), 'o print() do programa novo chega ao Monitor', JSON.stringify(m.slice(-300)));
  confere(!/raw REPL/.test(m) && !m.includes('\x04'), 'o raw REPL não aparece no Monitor');

  console.log('\n3. Programa grande (> 6 KB) e segundo envio');
  let grande = '# programa grande\n';
  for (let i = 0; i < 260; i++) grande += `valor_${i} = ${i} * 2  # comentário número ${i} çãé\n`;
  grande += 'print("fim", valor_259)\n';
  const r2 = await k.enviar(grande);
  confere(r2.ok, 'enviar ok', r2.log);
  confere(placa.arquivo('main.py').toString('utf8') === grande, `main.py igual (${Buffer.byteLength(grande)} bytes)`);
  confere(placa.arquivo('main.academy-backup.py').toString('utf8') === codigo, 'backup = programa anterior');
  await dormir(300);
  confere(/fim 518/.test(monitor()), 'programa grande roda');

  console.log('\n4. Erro de escrita no Python');
  const ruim = 'from unihiker_k10 import screen\nif True\n    print("x")\n';
  const r3 = await k.enviar(ruim);
  confere(!r3.ok && r3.linha === 2, 'erro na linha 2', JSON.stringify(r3));
  confere(/Erro na linha 2/.test(r3.log), 'mensagem em português', r3.log);
  confere(placa.arquivo('main.py').toString('utf8') === grande, 'main.py anterior preservado');

  console.log('\n5. Parar e escrever');
  const antes = placa.recebidos.length;
  await k.parar();
  confere(placa.recebidos.slice(antes).filter((b) => b === 3).length >= 1, 'Parar manda Ctrl+C');
  confere(await k.escrever('42\r\n'), 'escrever texto para o input()');
  await k.liberar();
  placa.limpar();
}

{
  console.log('\n6. MicroPython sem a biblioteca da K10');
  const { placa, k } = await montar({ firmware: 'generico' });
  await k.conectar();
  const r = await k.testar();
  confere(!r.ok && /unihiker_k10/.test(r.log), 'avisa que falta o firmware da K10', r.log);
  const r2 = await k.enviar('print(1)\n');
  confere(!r2.ok && !placa.arquivo('main.py'), 'não grava nada');
  await k.liberar();
  placa.limpar();
}

{
  console.log('\n7. Placa com programa C++ (sem MicroPython)');
  const { placa, k } = await montar({ firmware: 'cpp' });
  await k.conectar();
  const t0 = Date.now();
  const r = await k.testar();
  confere(!r.ok && r.semMicroPython && /Instalar MicroPython/.test(r.log), 'explica que precisa instalar o MicroPython', r.log);
  confere(Date.now() - t0 < 15000, `desiste em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await k.liberar();
  placa.limpar();
}

{
  console.log('\n8. Cabo puxado');
  const { placa, k } = await montar();
  await k.conectar();
  placa.puxarCabo();
  await dormir(150);
  confere(k.estado === 'desconectado', 'estado vira desconectado');
  const r = await k.enviar('print(1)\n').catch((e) => ({ ok: false, log: e.message }));
  confere(!r.ok, 'enviar sem placa falha com mensagem', r.log);
  confere(await k.reconectar(), 'reconectar acha a K10 autorizada');
  await k.liberar();
  placa.limpar();
}

{
  console.log('\n9. Utilidades');
  confere(K10MP.literalBytes(new TextEncoder().encode("a'\\é\n")) === "b'a\\x27\\x5c\\xc3\\xa9\\x0a'", 'literal de bytes do Python');
  confere(K10MP.linhaDoErro('Traceback\r\n  File "main.py", line 7\r\nSyntaxError: invalid syntax') === 7, 'linha do traceback');
  confere(/não existe nesta placa/.test(K10MP.traduzirErro("ImportError: no module named 'dht'")), 'ImportError traduzido');
  const linhas = [];
  const b = K10MP.criarBufferLinhas((l) => linhas.push(l));
  b.adicionar('ab'); b.adicionar('c\r'); b.adicionar('\nde\n');
  confere(JSON.stringify(linhas) === '["abc","de"]', 'buffer de linhas junta pedaços e \\r\\n partido');
}

console.log(`\n${passou} ok, ${falhas} com problema`);
process.exit(falhas ? 1 : 0);
