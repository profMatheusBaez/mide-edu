#!/usr/bin/env python3
"""
testar_k10_navegador.py — só desenvolvimento (Python 3 + Playwright + Chromium)

Testa a UNIHIKER K10 em MicroPython na tela de verdade, com uma porta Web
Serial de MENTIRA (nenhuma K10 é necessária). A "placa" fala o REPL do
MicroPython (raw REPL, Ctrl+A/B/C/D) aqui no navegador e executa o código no
CPython (_k10_falsa.py) por uma função exposta pelo Playwright.

  1. site: card da K10, C++ desativado, trilha MicroPython
  2. barra da K10 (Conectar / estado / Parar), seletor de porta escondido
  3. Código completo → Enviar: main.py gravado, print() no Monitor, confirmação
  4. Editor: erro de sintaxe no Verificar (mpy-cross no navegador)
  5. Monitor: texto para o input(); Parar manda Ctrl+C
  6. Preparar K10: firmware validado; instalação sem placa em modo de gravação
     termina com explicação (BOOT + RST)
  7. trocar de placa e voltar; claro/escuro; 820 px

Antes, sirva a pasta:   python3 -m http.server 8082   (na raiz da IDE)
Depois:                 python3 ferramentas/k10/testar_k10_navegador.py
"""
import asyncio
import json
import os
import shutil
import subprocess
import sys
import tempfile

from playwright.async_api import async_playwright

URL = 'http://localhost:8082/index.html?web=1'
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.environ.get('K10_SAIDA', tempfile.mkdtemp(prefix='k10nav_'))

ok_total, falhas = 0, []


def confere(cond, nome, extra=''):
    global ok_total
    if cond:
        ok_total += 1
        print('  ok  ' + nome)
    else:
        falhas.append(nome)
        print('  XX  ' + nome + ('\n      ' + str(extra) if extra else ''))


class Placa:
    """O 'interpretador' da K10: um _k10_falsa.py por sessão do MicroPython."""

    def __init__(self):
        self.dir = tempfile.mkdtemp(prefix='k10placa_')
        with open(os.path.join(self.dir, 'unihiker_k10.py'), 'w') as f:
            f.write('class _T:\n'
                    '    def init(self, dir=2): print("[tela] init")\n'
                    '    def show_bg(self, color=0): pass\n'
                    '    def draw_text(self, text="", x=0, y=0, font_size=16, color=0): print("[tela]", text)\n'
                    '    def show_draw(self): pass\n'
                    '    def clear(self): pass\n'
                    'screen = _T()\n'
                    'class _R:\n'
                    '    def clear(self): print("[rgb] clear")\n'
                    '    def brightness(self, b): pass\n'
                    '    def write(self, num=0, color=0): print("[rgb]", num, hex(color))\n'
                    'rgb = _R()\n')
        self.proc = None
        self.reiniciar()

    def reiniciar(self):
        if self.proc:
            self.proc.kill()
        self.proc = subprocess.Popen([sys.executable, '-I', os.path.join(AQUI, '_k10_falsa.py')], cwd=self.dir,
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)

    def executar(self, codigo):
        self.proc.stdin.write(json.dumps({'exec': codigo}) + '\n')
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def main(self):
        p = os.path.join(self.dir, 'main.py')
        return open(p, encoding='utf-8').read() if os.path.exists(p) else None


SERIAL_FALSA = r"""
(() => {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const K = { modo: 'normal', buf: [], ctl: null, recebidos: [], fila: Promise.resolve(), aberta: false, aberturas: 0 };
  window.__k10 = K;
  const mandar = (t) => { if (K.ctl) K.ctl.enqueue(enc.encode(t)); };
  async function rodarMain() {
    const r = await window.k10main();
    mandar(r.saida.replace(/\n/g, '\r\n') + r.erro.replace(/\n/g, '\r\n') + 'MicroPython on K10\r\n>>> ');
  }
  async function byte(b) {
    K.recebidos.push(b);
    if (K.modo === 'normal') {
      if (b === 3) { mandar('\r\nKeyboardInterrupt: \r\n>>> '); return; }
      if (b === 1) { K.modo = 'raw'; K.buf = []; mandar('raw REPL; CTRL-B to exit\r\n>'); return; }
      if (b === 4) { mandar('MPY: soft reboot\r\n'); await rodarMain(); return; }
      mandar(String.fromCharCode(b));
      return;
    }
    if (b === 2) { K.modo = 'normal'; K.buf = []; mandar('\r\n>>> '); return; }
    if (b === 3) { K.buf = []; return; }
    if (b === 1) { K.buf = []; mandar('raw REPL; CTRL-B to exit\r\n>'); return; }
    if (b === 4) {
      const codigo = dec.decode(Uint8Array.from(K.buf)); K.buf = [];
      mandar('OK');
      const r = await window.k10exec(codigo);
      mandar(r.saida.replace(/\n/g, '\r\n') + '\x04' + r.erro.replace(/\n/g, '\r\n') + '\x04>');
      return;
    }
    K.buf.push(b);
  }
  const porta = {
    readable: null, writable: null,
    getInfo() { return { usbVendorId: 0x303A, usbProductId: 0x1001 }; },
    async open() {
      if (K.aberta) throw new DOMException('already open', 'InvalidStateError');
      K.aberta = true; K.aberturas++;
      this.readable = new ReadableStream({ start(c) { K.ctl = c; } });
      this.writable = new WritableStream({ write(ch) { K.fila = K.fila.then(async () => { for (const b of ch) await byte(b); }); return K.fila; } });
    },
    async close() { K.aberta = false; try { K.ctl.close(); } catch (e) {} K.ctl = null; this.readable = null; this.writable = null; },
    async setSignals() {}, async getSignals() { return { dataCarrierDetect: false, clearToSend: false, ringIndicator: false, dataSetReady: false }; },
    addEventListener() {}, removeEventListener() {},
  };
  K.porta = porta;
  const alvos = {};
  const serial = {
    async requestPort() { K.pedidos = (K.pedidos || 0) + 1; return porta; },
    async getPorts() { return K.autorizada ? [porta] : []; },
    addEventListener(t, f) { (alvos[t] = alvos[t] || []).push(f); },
    removeEventListener() {},
  };
  Object.defineProperty(navigator, 'serial', { value: serial, configurable: true });
})();
"""


async def principal():
    placa = Placa()
    async with async_playwright() as pw:
        nav = await pw.chromium.launch()
        ctx = await nav.new_context(viewport={'width': 1600, 'height': 950})
        erros_js, externos = [], []
        await ctx.expose_function('k10exec', lambda codigo: placa.executar(codigo))

        def k10main():
            placa.reiniciar()
            m = placa.main()
            return placa.executar(m) if m else {'saida': '', 'erro': ''}
        await ctx.expose_function('k10main', k10main)
        await ctx.add_init_script(SERIAL_FALSA)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: erros_js.append(str(e)))
        pg.on('request', lambda r: externos.append(r.url) if not r.url.startswith(('http://localhost', 'data:', 'blob:')) else None)
        await pg.goto(URL)
        await pg.wait_for_selector('#board-picker[open]')

        print('\n1. Site: card da K10')
        confere(await pg.is_visible('#choose-k10'), 'card da K10 aparece no site')
        await pg.click('#choose-k10')
        confere(await pg.is_disabled('[data-language="cpp"]'), 'C++ desativado no site')
        confere('laboratório' in (await pg.text_content('[data-language="cpp"]')), 'C++ explica que é do laboratório')
        await pg.screenshot(path=os.path.join(SAIDA, '1-seletor.png'))
        await pg.click('[data-language="micropython"]')
        await pg.wait_for_timeout(300)
        confere(await pg.evaluate("estado.placaCurso === 'k10' && estado.linguagem === 'micropython'"), 'trilha K10 MicroPython aberta')
        confere(await pg.evaluate('FASES.length') == 60, '60 atividades', await pg.evaluate('FASES.length'))

        print('\n2. Barra da K10')
        confere(await pg.is_visible('#k10-hub'), 'barra da K10 visível')
        confere(not await pg.is_visible('#seletor-placa'), 'seletor de porta escondido')
        confere((await pg.text_content('#k10-estado')).strip() == 'Desconectada', 'estado: Desconectada')
        confere(await pg.is_disabled('#bt-k10-parar'), 'Parar desativado sem placa')
        confere(not await pg.is_visible('#bt-mon-ligar'), 'botão Conectar do Monitor escondido (a K10 conecta pela barra)')

        print('\n3. Código completo → Enviar')
        await pg.click('#aba-completo')
        await pg.wait_for_timeout(200)
        solucao = await pg.evaluate('estado.fase.solucao')
        await pg.click('#bt-upload')
        await pg.wait_for_function("!estado.ocupado && document.querySelector('#modal') && !document.querySelector('#modal').classList.contains('oculto')", timeout=20000)
        confere(placa.main() == solucao, 'main.py na placa = código da atividade 1')
        confere(await pg.evaluate('__k10.pedidos') == 1, 'Enviar abriu a escolha da porta uma vez')
        confere((await pg.text_content('#modal-titulo')).strip() == 'Observe sua K10', 'pede para observar a placa (atividade com resultado físico)')
        await pg.wait_for_timeout(500)
        mon = await pg.text_content('#mon-saida')
        confere('[tela] K10 EXPLORER' in mon, 'print() do programa no Monitor', mon[-200:])
        confere('raw REPL' not in mon, 'o raw REPL não aparece no Monitor')
        confere('K10 conectada' in await pg.text_content('#k10-estado'), 'estado: conectada')
        saida = await pg.text_content('#saida') if await pg.query_selector('#saida') else ''
        await pg.click('#modal-pe button.primario')
        await pg.wait_for_timeout(200)
        confere(await pg.evaluate('!!progresso.feitas[FASES[0].id]'), 'atividade concluída depois de “Observei”')
        await pg.screenshot(path=os.path.join(SAIDA, '3-enviado.png'))
        if await pg.is_visible('#ov-fechar'):
            await pg.click('#ov-fechar')   # comemoração da missão concluída

        print('\n4. Editor: erro de sintaxe')
        await pg.click('#aba-livre')
        await pg.fill('#editor-livre', 'from unihiker_k10 import screen\nif True\n    print("x")\n')
        await pg.evaluate('renderLivre && renderLivre()')
        await pg.click('#bt-compilar')
        await pg.wait_for_function('!estado.ocupado', timeout=15000)
        txt = await pg.evaluate("document.querySelector('#console-saida, #saida, #log')?.textContent || document.body.innerText")
        confere('linha 2' in txt or 'linha 3' in txt or ' 3: ' in txt, 'Verificar aponta a linha do erro (o MicroPython acusa a 2 ou a 3)', txt[-300:])
        anterior = placa.main()
        await pg.click('#bt-upload')
        await pg.wait_for_function('!estado.ocupado', timeout=15000)
        confere(placa.main() == anterior, 'programa com erro não substitui o main.py')
        await pg.fill('#editor-livre', 'nome = input("nome? ")\nprint("oi", nome)\n')
        await pg.evaluate('renderLivre && renderLivre()')
        await pg.click('#bt-compilar')
        await pg.wait_for_function('!estado.ocupado', timeout=15000)
        txt = await pg.evaluate('document.body.innerText')
        confere('Sintaxe Python conferida' in txt, 'Verificar ok no programa certo')

        print('\n5. Monitor: input() e Parar')
        await pg.evaluate("mostrarPainelInf('monitor')")
        antes = await pg.evaluate('__k10.recebidos.length')
        await pg.fill('#mon-texto', 'Ana')
        await pg.press('#mon-texto', 'Enter')
        await pg.wait_for_timeout(200)
        novos = await pg.evaluate(f'String.fromCharCode(...__k10.recebidos.slice({antes}))')
        confere(novos.startswith('Ana'), 'texto do Monitor vai para a K10', repr(novos))
        confere(not await pg.is_disabled('#bt-k10-parar'), 'Parar habilitado com a placa')
        antes = await pg.evaluate('__k10.recebidos.length')
        await pg.click('#bt-k10-parar')
        await pg.wait_for_timeout(200)
        confere(await pg.evaluate(f'__k10.recebidos.slice({antes}).includes(3)'), 'Parar manda Ctrl+C')
        confere('programa parado' in await pg.text_content('#mon-saida'), 'Monitor avisa que parou')

        print('\n6. Preparar K10: firmware')
        await pg.click('#bt-preparar-k10')
        await pg.wait_for_selector('#k10-fw-input', state='attached')
        confere('Preparar UNIHIKER K10' in await pg.text_content('#modal-titulo'), 'abre o preparo MicroPython')
        btns = await pg.query_selector_all('#modal-pe button')
        confere(await btns[2].is_disabled(), 'Instalar desativado sem firmware')
        img = bytearray(b'\xff' * 0x20000)
        img[0:4] = b'\xe9\x04\x02\x4f'
        img[12], img[13] = 9, 0
        img[0x8000:0x8002] = b'\xaa\x50'
        img[0x10000:0x10000 + 24] = b'MicroPython unihiker_k10'
        ruim = bytes(img[:0x8000]) + b'\x00' * 0x18000
        caminho_ruim = os.path.join(SAIDA, 'ruim.bin')
        open(caminho_ruim, 'wb').write(ruim)
        await pg.set_input_files('#k10-fw-input', caminho_ruim)
        await pg.wait_for_timeout(300)
        confere('tabela de partições' in await pg.text_content('#k10-preparo-resultado'), 'arquivo incompleto recusado com explicação')
        caminho = os.path.join(SAIDA, 'firmware-teste.bin')
        open(caminho, 'wb').write(bytes(img))
        await pg.set_input_files('#k10-fw-input', caminho)
        await pg.wait_for_timeout(300)
        confere('✓ firmware-teste.bin' in await pg.text_content('#k10-fw-arquivo'), 'firmware válido aceito')
        confere(not await btns[2].is_disabled(), 'Instalar habilitado')
        await pg.screenshot(path=os.path.join(SAIDA, '6-preparar.png'))
        await btns[1].click()   # Testar conexão
        await pg.wait_for_function("/K10 conectada|✗/.test(document.querySelector('#k10-preparo-resultado').textContent)", timeout=15000)
        confere('✓ K10 conectada' in await pg.text_content('#k10-preparo-resultado'), 'Testar conexão ok')
        await btns[2].click()   # Instalar: a porta falsa não fala o bootloader do ESP32
        await pg.wait_for_function("/✗/.test(document.querySelector('#k10-preparo-resultado').textContent)", timeout=90000)
        res = await pg.text_content('#k10-preparo-resultado')
        confere('BOOT' in res and 'RST' in res, 'sem modo de gravação: explica BOOT + RST', res[-300:])
        confere(not await pg.evaluate('K10W.instalando || estado.ocupado'), 'IDE destravada depois da falha')
        await pg.wait_for_timeout(3000)
        confere(await pg.evaluate("K10W.mp.estado") in ('conectado', 'desconectado'), 'conexão da K10 em estado válido depois')
        await pg.click('#modal-pe button')   # Fechar

        print('\n7. Trocar de placa e voltar')
        await pg.evaluate("selecionarCurso('uno')")
        await pg.wait_for_timeout(300)
        confere(not await pg.is_visible('#k10-hub') and await pg.is_visible('#seletor-placa'), 'Uno: barra da K10 some, seletor de porta volta')
        confere(await pg.is_visible('#bt-mon-ligar'), 'Uno: botão do Monitor volta')
        confere(not await pg.evaluate('__k10.aberta'), 'sair da K10 solta a porta USB')
        await pg.evaluate("selecionarCurso('microbit', 'js')")
        await pg.wait_for_timeout(300)
        confere(not await pg.is_visible('#k10-hub') and not await pg.is_visible('#bt-mon-ligar'), 'micro:bit: barra própria, sem a da K10')
        await pg.evaluate("selecionarCurso('k10', 'cpp')")
        await pg.wait_for_timeout(300)
        confere(await pg.evaluate("estado.linguagem") == 'micropython', 'no site, pedir C++ abre MicroPython')
        confere(await pg.evaluate('!!progresso.feitas[FASES[0].id]'), 'progresso da K10 preservado')
        await pg.evaluate("document.documentElement.dataset.tema = 'escuro'")
        await pg.screenshot(path=os.path.join(SAIDA, '7-escuro.png'))
        await pg.set_viewport_size({'width': 820, 'height': 900})
        await pg.wait_for_timeout(300)
        largura = await pg.evaluate('document.documentElement.scrollWidth')
        confere(largura <= 830, f'820 px sem rolagem lateral ({largura})')
        await pg.screenshot(path=os.path.join(SAIDA, '7-estreito.png'))

        print('\n8. Geral')
        confere(not erros_js, 'sem erro de JavaScript', erros_js)
        confere(not externos, 'sem requisição para fora', externos[:5])
        await nav.close()
    placa.proc.kill()
    shutil.rmtree(placa.dir, ignore_errors=True)
    print(f'\n{ok_total} ok, {len(falhas)} com problema — capturas em {SAIDA}')
    return 1 if falhas else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(principal()))
