"""Transporte K10. O programa do aluno só executa na placa."""
import ast
import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile

K10_FQBN = 'UNIHIKER:esp32:k10:CDCOnBoot=cdc,Model=None'
K10_INDEX = 'https://downloadcd.dfrobot.com.cn/UNIHIKER/package_unihiker_index.json'
PROBE = "import sys; assert sys.implementation.name == 'micropython'; import unihiker_k10; print('K10_MICROPYTHON_READY')"


def disponivel():
    return importlib.util.find_spec('mpremote') is not None


def rodar_mp(porta, args, timeout=25):
    try:
        p = subprocess.run([sys.executable, '-m', 'mpremote', 'connect', porta] + args,
                           capture_output=True, timeout=timeout,
                           creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        return p.returncode, (p.stdout + p.stderr).decode('utf-8', 'replace')
    except subprocess.TimeoutExpired:
        return 1, 'A placa não respondeu como MicroPython. Confira a porta e prepare o firmware K10 em Preparar K10.'
    except OSError as e:
        return 1, 'Falha na comunicação: ' + str(e)


def verificar_sintaxe(codigo):
    if not isinstance(codigo, str) or not codigo.strip():
        return {'ok': False, 'log': 'O programa está vazio.'}
    try:
        ast.parse(codigo, filename='main.py')
    except (SyntaxError, ValueError) as e:
        return {'ok': False, 'log': f'Erro de sintaxe na linha {getattr(e, "lineno", "?")}: {e.msg if isinstance(e, SyntaxError) else e}'}
    return {'ok': True, 'log': 'Sintaxe Python conferida. As bibliotecas e a compatibilidade MicroPython são verificadas ao enviar para a K10.'}


def executar(dados, monitor, listar_portas):
    acao = dados.get('acao')
    if acao not in ('verificar', 'conectar', 'enviar'):
        return {'ok': False, 'log': 'Ação MicroPython desconhecida.'}
    codigo = dados.get('codigo', '')
    if acao in ('verificar', 'enviar'):
        sintaxe = verificar_sintaxe(codigo)
        if not sintaxe['ok'] or acao == 'verificar':
            return sintaxe
    porta = dados.get('porta', '')
    if not porta or porta not in {p['porta'] for p in listar_portas()}:
        return {'ok': False, 'log': 'Selecione uma porta USB conectada antes de continuar.'}
    if not disponivel():
        return {'ok': False, 'log': 'O suporte MicroPython não está instalado neste Python. Execute python -m pip install -r requirements-k10.txt e reinicie a IDE.'}
    anterior = (monitor.porta, monitor.baud) if monitor.aberto() else None
    monitor.fechar()
    try:
        cod, saida = rodar_mp(porta, ['exec', PROBE])
        if cod != 0 or 'K10_MICROPYTHON_READY' not in saida:
            return {'ok': False, 'log': 'Não foi possível confirmar o firmware MicroPython da K10.\n' + saida}
        if acao == 'conectar':
            return {'ok': True, 'log': 'K10 conectada. MicroPython e biblioteca unihiker_k10 encontrados.'}
        cod, saida = rodar_mp(porta, ['exec', 'compile(' + repr(codigo) + ", 'main.py', 'exec'); print('SYNTAX_OK')"])
        if cod:
            return {'ok': False, 'log': 'A K10 encontrou um erro antes de salvar o programa:\n' + saida}
        with tempfile.TemporaryDirectory(prefix='academy_k10_') as pasta:
            arquivo = Path(pasta) / 'main.py'
            arquivo.write_text(codigo, encoding='utf-8')
            cod, saida = rodar_mp(porta, ['fs', 'cp', str(arquivo), ':academy_upload.py'], timeout=45)
            if cod:
                return {'ok': False, 'log': 'Falha na transferência. O programa anterior foi preservado.\n' + saida}
            promote = "import os\nif 'main.py' in os.listdir():\n    if 'main.academy-backup.py' in os.listdir():\n        os.remove('main.academy-backup.py')\n    os.rename('main.py', 'main.academy-backup.py')\nos.rename('academy_upload.py', 'main.py')"
            cod, saida = rodar_mp(porta, ['exec', promote, 'reset'])
            if cod:
                return {'ok': False, 'log': 'Arquivo transferido, mas a finalização falhou. Confira main.py e main.academy-backup.py na placa.\n' + saida}
        return {'ok': True, 'log': 'main.py enviado e reinicialização solicitada. Confira o resultado na K10; erros de execução aparecem no Monitor Serial a 115200 baud. A versão anterior, quando existente, fica em main.academy-backup.py.'}
    finally:
        if anterior:
            monitor.abrir(*anterior)
