"""Interpretador da K10 de mentira (só para os testes, roda no PC).

Lê comandos JSON na entrada padrão, um por linha:
  {"exec": "<código>"}  -> executa num dicionário que dura a sessão inteira
                           (como o REPL da placa) e responde
                           {"saida": "...", "erro": "..."}
A pasta atual faz o papel do sistema de arquivos da placa.
"""
import io
import json
import sys
import traceback
import contextlib
import os

sys.path.insert(0, os.getcwd())   # a pasta da "placa": import unihiker_k10 acha o stub
sys.implementation.name = "micropython"   # a sonda da IDE confere isto

ns = {'__name__': '__main__'}
for linha in sys.stdin:
    pedido = json.loads(linha)
    saida, erro = io.StringIO(), ''
    try:
        with contextlib.redirect_stdout(saida):
            exec(pedido['exec'], ns)
    except BaseException:
        erro = traceback.format_exc()
    sys.stdout.write(json.dumps({'saida': saida.getvalue(), 'erro': erro}) + '\n')
    sys.stdout.flush()
