#!/usr/bin/env python3
"""
testar_mb_navegador.py — só desenvolvimento (Python 3 + Playwright + Chromium)

Testa a placa micro:bit V2 na tela de verdade, com USB e Bluetooth de MENTIRA
(nenhuma micro:bit é necessária):

  1. Treinamento: digita as 90 atividades × 2 linguagens (JavaScript e
     MicroPython) pelo mesmo código da tela, sem nenhum erro de digitação.
  2. Bluetooth (trilha JavaScript): conectar, Painel ao vivo, Monitor sem fio,
     enviar texto, calibrar, queda da conexão; e o botão desabilitado com o
     motivo na trilha MicroPython.

Antes, sirva a pasta da IDE:   cd ide_web && python3 -m http.server 8081
Depois:                        python3 ferramentas/testar_mb_navegador.py
"""
import asyncio
import sys
from playwright.async_api import async_playwright

URL = 'http://localhost:8081/index.html'

TREINO = """
() => {
  const falhas = []; let linhasTot = 0;
  for (let i = 0; i < FASES.length; i++) {
    for (let j = 0; j < i; j++) progresso.feitas[FASES[j].id] = true;
    abrirFase(i);
    if (estado.indice !== i) { falhas.push('nao abriu ' + i); continue; }
    iniciarTreino();
    const t = estado.treino; let guarda = 0;
    while (t.idx < t.linhas.length && guarda++ < 500) {
      $('#entrada').value = alvoDigitacao(t.linhas[t.idx]);
      verificarLinha();
    }
    linhasTot += t.linhas.length;
    if (estado.etapa !== 'concluido' || t.erros !== 0) falhas.push(FASES[i].id + ' etapa=' + estado.etapa + ' erros=' + t.erros);
  }
  return { falhas, fases: FASES.length, linhas: linhasTot };
}
"""

FAKE = """
() => {
window.__b = { ou: {}, writes: [], calls: [] };
MicrobitBLE.configurar({ fabricaBLE: () => ({
  status: 'Disconnected',
  addEventListener(n, f) { (window.__b.ou[n] = window.__b.ou[n] || []).push(f); },
  async connect() { window.__b.calls.push('connect'); this.status='Connected'; window.__b.ou.status.forEach(f=>f({status:'Connected'})); },
  async disconnect() { window.__b.calls.push('disconnect'); this.status='Disconnected'; window.__b.ou.status.forEach(f=>f({status:'Disconnected'})); },
  dispose() {},
  async uartWrite(b) { window.__b.writes.push(new TextDecoder().decode(b)); },
  async getMagnetometerBearing() { return window.__rumo || 0; },
  async triggerMagnetometerCalibration() { window.__b.calls.push('calibrar'); },
  async flash(obterHex, o) {
    window.__b.calls.push('flash');
    window.__b.hex = await obterHex('V2');
    o.progress('Connecting'); o.progress('PartialFlashing', 0.5);
    if (window.__flashCompleta) { o.progress('FullFlashing'); throw new Error('Device not found'); }
    o.progress('PartialFlashing', 1);
  },
}) });
window.__ev = function(t, d){ (window.__b.ou[t]||[]).forEach(function(f){ f(d); }); };
}
"""

falhas = []
def confere(cond, msg):
    print(('  ok   ' if cond else '  FALHA ') + msg)
    if not cond:
        falhas.append(msg)

async def abrir(browser, lang):
    page = await browser.new_page(viewport={'width': 1440, 'height': 900})
    page.erros = []
    page.on('pageerror', lambda e: page.erros.append(str(e)))
    page.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await page.goto(URL)
    await page.wait_for_selector('#board-picker[open]')
    await page.evaluate(FAKE)
    await page.click('#choose-microbit')
    await page.click('[data-mb-language="%s"]' % lang)
    await page.wait_for_timeout(600)
    return page

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        print('== Treinamento: 90 atividades em cada linguagem')
        for lang in ('js', 'micropython'):
            page = await abrir(b, lang)
            r = await page.evaluate(TREINO)
            confere(r['fases'] == 90 and not r['falhas'] and not page.erros,
                    '%s: %d atividades, %d linhas digitadas %s' % (lang, r['fases'], r['linhas'], r['falhas'][:3] + page.erros[:2]))
            await page.close()

        print('== Bluetooth na trilha JavaScript')
        page = await abrir(b, 'js')
        confere(await page.get_attribute('#bt-mb-ble', 'aria-disabled') == 'false', 'botão Bluetooth habilitado')
        confere(await page.evaluate("document.getElementById('aba-aovivo').hidden") is False, 'aba Painel ao vivo visível')
        await page.click('#bt-mb-ble'); await page.wait_for_timeout(400)
        confere('conectado' in await page.inner_text('#mb-ble-estado'), 'chip: Bluetooth conectado')
        confere(await page.evaluate('estado.painelInf') == 'aovivo', 'painel ao vivo abre sozinho')
        await page.evaluate("""() => {
          __ev('accelerometerdatachanged', {x: 500, y: -1000, z: 1000});
          __ev('buttonachanged', {button: 'A', state: 1});
          __ev('temperaturechanged', {celsius: 27});
          window.__rumo = 90; __ev('magnetometerdatachanged', {x: 1, y: 2, z: 3});
        }""")
        await page.wait_for_timeout(300)
        confere(await page.inner_text('#av-acel [data-eixo=x] output') == '500', 'inclinação X = 500')
        confere(await page.evaluate("document.querySelector('.av-botao[data-botao=A]').classList.contains('apertado')"), 'botão A aceso')
        confere('27' in await page.inner_text('#av-celsius'), 'temperatura 27 °C')
        confere('90' in await page.inner_text('#av-graus'), 'bússola 90°')
        await page.evaluate("__ev('uartdata', {value: new TextEncoder().encode('temp:27\\n')})")
        await page.click('[data-painel=monitor]'); await page.wait_for_timeout(300)
        confere('temp:27' in await page.inner_text('#mon-saida'), 'Monitor mostra o texto do UART')
        await page.fill('#mon-texto', 'ola'); await page.press('#mon-texto', 'Enter'); await page.wait_for_timeout(300)
        confere(await page.evaluate('window.__b.writes') == ['ola\n'], 'texto do Monitor vai pelo UART')
        await page.click('[data-painel=aovivo]'); await page.click('#bt-av-calibrar'); await page.wait_for_timeout(200)
        confere('calibrar' in await page.evaluate('window.__b.calls'), 'calibrar a bússola')
        await page.evaluate("window.__b.ou.status.forEach(f => f({status: 'Disconnected'}))"); await page.wait_for_timeout(300)
        confere(await page.evaluate("document.getElementById('mb-ble-estado').hidden"), 'queda: chip some')
        confere(await page.evaluate("[...document.querySelectorAll('.av-cartao')].every(c => c.dataset.semDados)"), 'queda: cartões voltam a “sem dados”')
        confere(not page.erros, 'sem erro de JavaScript ' + str(page.erros[:2]))
        await page.close()

        print('== Enviar por Bluetooth (experimental), trilha JavaScript')
        page = await abrir(b, 'js')
        await page.evaluate("() => { abrirFase(0); iniciarTreino(); const t = estado.treino; while (t.idx < t.linhas.length) { $('#entrada').value = alvoDigitacao(t.linhas[t.idx]); verificarLinha(); } }")
        await page.click('[data-painel=aovivo]')
        await page.click('#bt-av-enviar')
        await page.wait_for_selector('#modal:not(.oculto)', timeout=30000)
        confere('modo de pareamento' in await page.inner_text('#modal-corpo'), 'a janela explica o modo de pareamento')
        confere(await page.evaluate('window.__b.calls') == [], 'nada foi enviado antes do segundo clique')
        await page.click('#modal-pe button.primario'); await page.wait_for_timeout(500)
        confere(await page.evaluate('window.__b.calls') == ['flash'], 'flash chamado uma vez')
        confere((await page.evaluate('window.__b.hex')).startswith(':'), 'o hex chegou à biblioteca')
        confere('enviado por Bluetooth' in await page.inner_text('#console'), 'a Saída confirma o envio')
        await page.evaluate('window.__flashCompleta = true')
        await page.evaluate("() => { fecharModal(); document.getElementById('overlay').classList.add('oculto'); }")
        await page.click('[data-painel=aovivo]')
        await page.click('#bt-av-enviar')
        await page.wait_for_selector('#modal:not(.oculto)', timeout=30000)
        await page.click('#modal-pe button.primario'); await page.wait_for_timeout(500)
        confere('cabo USB' in await page.inner_text('#console'), 'gravação completa: manda usar o cabo USB')
        confere(not page.erros, 'sem erro de JavaScript ' + str(page.erros[:2]))
        await page.close()

        print('== Bluetooth na trilha MicroPython')
        page = await abrir(b, 'micropython')
        confere(await page.get_attribute('#bt-mb-ble', 'aria-disabled') == 'true', 'botão marcado como desabilitado')
        confere('MicroPython' in (await page.get_attribute('#bt-mb-ble', 'title')), 'o motivo aparece no title')
        confere(await page.evaluate("document.getElementById('aba-aovivo').hidden"), 'aba Painel ao vivo escondida')
        await page.click('#bt-mb-ble', force=True); await page.wait_for_timeout(300)
        confere('não tem Bluetooth de dados' in await page.inner_text('#console'), 'clicar explica o motivo na Saída')
        confere(await page.evaluate('window.__b.calls') == [], 'nada foi conectado')
        await page.close()

        await b.close()
    print('\n%s' % ('FALHAS: %d' % len(falhas) if falhas else 'tudo ok'))
    sys.exit(1 if falhas else 0)

asyncio.run(main())
