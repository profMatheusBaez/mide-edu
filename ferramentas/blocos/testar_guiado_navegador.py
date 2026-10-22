#!/usr/bin/env python3
"""
testar_guiado_navegador.py — só desenvolvimento (Python 3 + Playwright + Chromium)

Modo Blocos GUIADO na tela de verdade: para cada missão de cada placa, abre a
missão, vai para a aba Blocos (Guiado), e um "aluno de mentira" segue o guia
passo a passo (_seguir_guia.js): arrasta o bloco que a instrução pede, da
categoria que pisca, encaixa onde ela manda e ajusta o campo que pisca. No fim
confere que o guia diz "Programa montado!" e que o código gerado é aceito:

  micro:bit (JS e MicroPython): código = o da missão (byte a byte, normalizado)
  Arduino Uno: compila (missão reconhecida ou MIDE VM do site)
  UNIHIKER K10 (C++ e MicroPython): mesmo código da atividade, normalizado

Também confere o modo Livre (todos os blocos, rascunho próprio) e o destaque
piscando (categoria → bloco do flyout → encaixe → campo).

Antes:  python3 -m http.server 8082   (na raiz da IDE)
Depois: python3 ferramentas/blocos/testar_guiado_navegador.py [uno|microbit|k10 ...]
"""
import asyncio
import os
import sys

from playwright.async_api import async_playwright

URL = 'http://localhost:8082/index.html?web=1'
AQUI = os.path.dirname(os.path.abspath(__file__))
falhas, ok_total = [], 0


def confere(cond, nome, extra=''):
    global ok_total
    if cond:
        ok_total += 1
        print('  ok  ' + nome)
    else:
        falhas.append(nome)
        print('  XX  ' + nome + ('\n      ' + str(extra)[:600] if extra else ''))


MISSAO = """
async (i) => {
  for (let j = 0; j < FASES.length; j++) progresso.feitas[FASES[j].id] = true;
  abrirFase(i);
  trocarAba('blocos');
  await new Promise((r) => setTimeout(r, 30));
  if (guiaModoAtivo() !== 'guiado') guiaTrocarModo('guiado');
  const ws = estadoBlocos.workspace;
  estadoBlocos.carregando = true; ws.clear(); guiaCriarVariaveis(ws); estadoBlocos.carregando = false;
  if (!GUIA.compilado) return { id: FASES[i].id, ok: false, erro: 'sem gabarito em blocos' };
  const r = await __seguirGuia();
  blocosAtualizarCodigo();
  const codigo = blocosCodigoAtual();
  return Object.assign({ id: FASES[i].id, codigo, solucao: FASES[i].solucao, barra: document.getElementById('guia-instrucao').textContent }, r);
}
"""

NORMALIZAR = """
(t) => String(t || '').replace(/\\r/g, '').split('\\n').map((l) => l.replace(/\\s+$/, '')).filter((l) => l.trim() !== '' && !/^\\s*(\\/\\/|#(?!include|define))/.test(l)).join('\\n')
"""


async def abrir(pg, placa, linguagem):
    # K10 em C++: só na MIDE instalada (no site a K10 vai em MicroPython)
    await pg.goto(URL.replace('web=1', 'web=0') if placa == 'k10' and linguagem == 'cpp' else URL)
    await pg.wait_for_selector('#board-picker[open]')
    if placa == 'uno':
        await pg.click('#choose-uno')
    elif placa == 'microbit':
        await pg.click('#choose-microbit')
        await pg.click(f'[data-mb-language="{linguagem}"]')
    else:
        await pg.evaluate(f"selecionarCurso('k10', '{linguagem}')")
    await pg.wait_for_timeout(300)


async def missoes(pg, placa, linguagem, comparar):
    print(f'\n== {placa} · {linguagem}: missões guiadas')
    n = await pg.evaluate('FASES.length')
    ruins = []
    for i in range(n):
        r = await pg.evaluate(MISSAO, i)
        problema = None
        if not r.get('ok'):
            problema = r.get('erro')
        elif 'Programa montado' not in r.get('barra', ''):
            problema = 'barra: ' + r.get('barra', '')[:120]
        else:
            problema = await comparar(pg, r)
        if problema:
            ruins.append(f"{r['id']}: {problema}")
    confere(not ruins, f'{n} missões montadas seguindo o guia ({placa} · {linguagem})', '\n      '.join(ruins[:12]))


async def comparar_igual(pg, r):
    a = await pg.evaluate(NORMALIZAR, r['codigo'])
    b = await pg.evaluate(NORMALIZAR, r['solucao'])
    if a == b:
        return None
    la, lb = a.split('\n'), b.split('\n')
    for k in range(max(len(la), len(lb))):
        x = la[k] if k < len(la) else '(fim)'
        y = lb[k] if k < len(lb) else '(fim)'
        if x != y:
            return f'linha {k + 1}: blocos={x!r} missão={y!r}'
    return 'diferente'


async def comparar_k10_cpp(pg, r):
    # o C++ da trilha (testado na placa) tem diferenças só de forma em 16 atividades
    # (ferramentas/gerar_fases_k10.mjs confere): aqui vale o C++ dos próprios blocos do gabarito
    esperado = await pg.evaluate("""(id) => { const f = FASES.find((x) => x.id === id); const ws = new Blockly.Workspace();
      Blockly.serialization.workspaces.load(f.blocos, ws); const c = blocosGerarK10Cpp(ws).codigo; ws.dispose(); return c; }""", r['id'])
    return await comparar_igual(pg, dict(r, solucao=esperado))


async def comparar_compila_uno(pg, r):
    res = await pg.evaluate('(c) => MIDE_WEB_INTERNO.compilarWeb(c)', r['codigo'])
    return None if res['ok'] else 'não compila: ' + res['log'][:200]


async def destaque(pg, placa):
    print(f'\n== {placa}: destaque piscando e modo livre')
    await pg.evaluate("""() => { for (const f of FASES) progresso.feitas[f.id] = true; abrirFase(1); trocarAba('blocos');
      if (guiaModoAtivo() !== 'guiado') guiaTrocarModo('guiado');
      const ws = estadoBlocos.workspace; estadoBlocos.carregando = true; ws.clear(); guiaCriarVariaveis(ws); estadoBlocos.carregando = false; guiaAtualizar(); }""")
    await pg.wait_for_timeout(300)
    confere(await pg.evaluate("!!document.querySelector('.blocklyToolboxCategory.guia-pisca')"), 'categoria da toolbox pisca')
    await pg.click('.blocklyToolboxCategory.guia-pisca')
    await pg.wait_for_timeout(400)
    confere(await pg.evaluate("!!document.querySelector('.blocklyFlyout g.guia-pisca')"), 'bloco certo pisca no flyout aberto')
    # primeiro passo feito pelo "aluno": o próximo passo marca o encaixe ou o campo
    await pg.evaluate("""async () => { const ws = estadoBlocos.workspace; const p = GUIA.ultimo.passo;
       const def = JSON.parse(JSON.stringify(p.item)); delete def.kind; Blockly.serialization.blocks.append(def, ws).moveBy(40, 40); }""")
    await pg.wait_for_timeout(300)
    marca = await pg.evaluate("document.querySelectorAll('rect.guia-alvo, g.guia-pisca').length")
    confere(marca > 0, 'depois do 1º bloco, o encaixe ou o campo pisca', marca)
    await pg.screenshot(path=os.path.join(os.environ.get('GUIA_SAIDA', '/tmp'), f'guia-{placa}.png'))
    # bloco errado pisca em vermelho
    tipo_errado = await pg.evaluate("""() => { const r = GUIA.ultimo; if (!r || r.completo || !r.passo || r.passo.tipo !== 'bloco' || !r.pai) return null;
       const itens = guiaItensDaToolbox(PERFIS_BLOCOS[estadoBlocos.perfil].toolboxCompleta());
       const ws = estadoBlocos.workspace; const lugar = r.passo.lugar;
       const con = lugar.tipo === 'proximo' ? r.pai.nextConnection : r.pai.getInput(lugar.nome).connection;
       for (const x of itens) { if (x.item.type === r.passo.no.type) continue; const d = JSON.parse(JSON.stringify(x.item)); delete d.kind;
         const b = Blockly.serialization.blocks.append(d, ws); const m = b.outputConnection || b.previousConnection;
         if (m && con.canConnect ? true : true) { try { con.connect(m); } catch (e) {} }
         if (b.getParent()) return b.type; b.dispose(); }
       return null; }""")
    if tipo_errado:
        await pg.wait_for_timeout(300)
        confere(await pg.evaluate("!!document.querySelector('g.guia-erro')") and 'não vai aqui' in await pg.text_content('#guia-instrucao'),
                f'bloco errado ({tipo_errado}) pisca em vermelho com explicação')
    # livre
    await pg.click('[data-guia-modo="livre"]')
    await pg.wait_for_timeout(300)
    confere(await pg.evaluate("guiaModoAtivo() === 'livre' && !document.querySelector('.guia-pisca, .guia-erro, rect.guia-alvo')"), 'Livre: nada pisca')
    cats_livre = await pg.evaluate("estadoBlocos.workspace.getToolbox().getToolboxItems().length")
    await pg.click('[data-guia-modo="guiado"]')
    await pg.wait_for_timeout(300)
    cats_guiado = await pg.evaluate("estadoBlocos.workspace.getToolbox().getToolboxItems().length")
    confere(cats_livre > cats_guiado, f'Livre tem todas as categorias ({cats_livre}); Guiado só as da missão ({cats_guiado})')
    confere(await pg.evaluate("estadoBlocos.workspace.getTopBlocks(false).length > 0"), 'voltar ao Guiado mantém os blocos da missão')


async def principal(placas):
    async with async_playwright() as pw:
        nav = await pw.chromium.launch()
        pg = await nav.new_page(viewport={'width': 1500, 'height': 900})
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)))
        await pg.add_init_script(path=os.path.join(AQUI, '_seguir_guia.js'))
        await pg.add_init_script('window.confirm = () => true;')
        if 'microbit' in placas:
            for lang in ('js', 'micropython'):
                await abrir(pg, 'microbit', lang)
                await missoes(pg, 'microbit', lang, comparar_igual)
            await destaque(pg, 'microbit')
        if 'uno' in placas:
            await abrir(pg, 'uno', 'cpp')
            await missoes(pg, 'uno', 'cpp', comparar_compila_uno)
            await destaque(pg, 'uno')
        if 'k10' in placas:
            for lang in ('micropython', 'cpp'):
                await abrir(pg, 'k10', lang)
                await missoes(pg, 'k10', lang, comparar_igual if lang == 'micropython' else comparar_k10_cpp)
            await destaque(pg, 'k10')
        confere(not erros, 'sem erro de JavaScript', erros[:5])
        await nav.close()
    print(f'\n{ok_total} ok, {len(falhas)} com problema')
    return 1 if falhas else 0


if __name__ == '__main__':
    escolha = sys.argv[1:] or ['microbit', 'uno', 'k10']
    sys.exit(asyncio.run(principal(escolha)))
