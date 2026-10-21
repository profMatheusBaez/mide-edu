# Teste da IDE web no Chromium com um Uno simulado (optiboot no avr8js).
import sys, time, json
from playwright.sync_api import sync_playwright
S = '/tmp/claude-0/-home-claude/340c3965-c328-59c1-a937-90cb27af6144/scratchpad/'
URL = 'http://127.0.0.1:8098/?web=1'
INIT = """(() => {
 const pronto = new Promise(r => { window.__resolverSerial = r; });
 const stub = { getPorts: async () => (await pronto).getPorts(), requestPort: async (o) => (await pronto).requestPort(o), addEventListener: () => {} };
 Object.defineProperty(Navigator.prototype, 'serial', { get: () => stub, configurable: true });
 window.addEventListener('DOMContentLoaded', () => import('/_teste/serial_falsa.js').then(m => window.__resolverSerial(m.serial)));
})();"""
erros = []
def saida(pg): return pg.evaluate("document.querySelector('#console, .console, #saida-log') ? '' : ''")
def logtxt(pg): return pg.evaluate("consoleEl.innerText")
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1366, 'height': 820})
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.on('console', lambda m: erros.append('console: ' + m.text) if m.type == 'error' else None)
    pg.add_init_script(INIT)
    pg.goto(URL); pg.wait_for_timeout(1500)
    k10 = pg.evaluate("document.getElementById('choose-k10').hidden")
    pg.click('#choose-uno'); pg.wait_for_timeout(1200)
    print('K10 escondida:', k10, '| status:', pg.inner_text('#st-servidor'))
    # 1) erro de compilação no editor livre
    pg.click('#aba-livre'); pg.wait_for_timeout(300)
    pg.fill('#editor-livre', 'void setup() {\n  Serial.begin(9600)\n}\nvoid loop() {}\n')
    pg.evaluate("renderLivre && renderLivre(); atualizarBotoes()")
    pg.click('#bt-compilar'); pg.wait_for_timeout(1500)
    print('--- verificar com erro ---'); print('\n'.join(logtxt(pg).split('\n')[-3:]))
    # 2) programa livre: escolhe a porta e grava
    prog = 'int n = 0;\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  n++;\n  Serial.print("CONTA:");\n  Serial.println(n);\n  digitalWrite(13, n % 2);\n  delay(300);\n}\n'
    pg.fill('#editor-livre', prog)
    pg.evaluate("renderLivre && renderLivre(); atualizarBotoes()")
    pg.click('#bt-portas'); pg.wait_for_timeout(1500)
    print('porta escolhida:', pg.eval_on_selector('#porta', 'e => e.value'), '|', pg.inner_text('#st-porta'))
    pg.evaluate("consoleEl.innerHTML=''")
    t = time.time()
    pg.click('#bt-upload')
    pg.wait_for_function("consoleEl.innerText.includes('Upload concluído') || consoleEl.innerText.includes('✗')", timeout=90000)
    print('--- upload livre (%.1f s) ---' % (time.time() - t)); print(logtxt(pg))
    pg.screenshot(path=S + 'web_upload.png')
    # 3) monitor serial
    pg.click('button.aba-con[data-painel="monitor"]'); pg.wait_for_timeout(300)
    pg.select_option('#mon-baud', '9600')
    pg.click('#bt-mon-ligar'); pg.wait_for_timeout(3500)
    mon = pg.inner_text('#mon-saida')
    print('--- monitor ---'); print(mon[-200:])
    pg.screenshot(path=S + 'web_monitor.png')
    # 4) missão em treinamento -> binário nativo + XP
    pg.evaluate("estado.professor=true; abrirFase(FASES.findIndex(f=>f.id==='led_5'))"); pg.wait_for_timeout(500)
    pg.evaluate("iniciarTreino()"); pg.wait_for_timeout(200)
    for l in pg.evaluate("estado.treino.linhas"):
        pg.focus('#entrada'); pg.keyboard.type(l.lstrip(), delay=1); pg.keyboard.press('Enter'); pg.wait_for_timeout(60)
    xp0 = pg.evaluate("progresso.xp || 0")
    pg.evaluate("consoleEl.innerHTML=''")
    t = time.time()
    pg.click('#bt-upload')
    pg.wait_for_function("consoleEl.innerText.includes('Upload concluído') || consoleEl.innerText.includes('✗')", timeout=90000)
    pg.wait_for_timeout(1500)
    print('--- upload da missão led_5 (%.1f s) ---' % (time.time() - t)); print(logtxt(pg))
    print('XP antes/depois:', xp0, pg.evaluate("progresso.xp || 0"), '| feita:', pg.evaluate("!!progresso.feitas['led_5']"))
    print('monitor reaberto:', pg.inner_text('#mon-estado'))
    pg.screenshot(path=S + 'web_missao.png')
    print('ERROS JS:', erros)
    b.close()
