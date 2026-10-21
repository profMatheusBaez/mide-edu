#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
 MIDE EDU — servidor local
------------------------------------------------------------
 Serve a IDE no navegador e faz a ponte com o `arduino-cli`:
 compilar, gravar, monitor serial, bibliotecas e placas.

 So usa a biblioteca padrao do Python 3 — nada de instalar
 pacote nenhum. Escuta apenas em 127.0.0.1 (a maquina local).

 Uso:
     pythonw servidor.py           # sem janela nenhuma (Windows)
     python  servidor.py --porta 8000 --sem-navegador

 O servidor se desliga sozinho quando a IDE fica fechada por
 mais de 15 minutos, para nao ficar processo esquecido rodando.

 Requisito: arduino-cli no PATH (ou ao lado deste arquivo).
 Veja LEIA-ME.md.
============================================================
"""

import argparse
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.abspath(__file__))
# O Python portatil do pacote de laboratorio (python\) nao poe a pasta
# do script no sys.path; sem isto o import abaixo falharia.
if RAIZ not in sys.path:
    sys.path.insert(0, RAIZ)
import k10_support

# Pacote de laboratorio: o arduino-cli guarda nucleos e bibliotecas
# DENTRO da pasta da IDE (arduino-cli\dados e arduino-cli\sketchbook),
# e nao no perfil de cada usuario do Windows. Assim todo aluno que
# entrar no PC encontra o Uno pronto, e a pasta inteira pode ser
# copiada por pendrive para outro computador.
_CLI_DADOS = os.path.join(RAIZ, "arduino-cli", "dados")
if os.path.isdir(_CLI_DADOS):
    os.environ.setdefault("ARDUINO_DIRECTORIES_DATA", _CLI_DADOS)
    os.environ.setdefault("ARDUINO_DIRECTORIES_DOWNLOADS",
                          os.path.join(_CLI_DADOS, "staging"))
    os.environ.setdefault("ARDUINO_DIRECTORIES_USER",
                          os.path.join(RAIZ, "arduino-cli", "sketchbook"))
VERSAO = "16"                 # sobe a cada atualizacao da IDE
FQBN_PADRAO = "arduino:avr:uno"
TEMPO_LIMITE = 300           # segundos por operacao do arduino-cli
OCIOSO_MAXIMO = 15 * 60      # desliga o servidor apos este tempo sem a IDE
ARQUIVO_LOG = os.path.join(RAIZ, "servidor.log")

# Placas oferecidas no menu Ferramentas > Placa.
PLACAS = [
    {"fqbn": k10_support.K10_FQBN, "nome": "UNIHIKER K10"},
    {"fqbn": "arduino:avr:uno",      "nome": "Arduino Uno"},
    {"fqbn": "arduino:avr:nano",     "nome": "Arduino Nano"},
    {"fqbn": "arduino:avr:mega",     "nome": "Arduino Mega 2560"},
    {"fqbn": "arduino:avr:leonardo", "nome": "Arduino Leonardo"},
    {"fqbn": "arduino:avr:micro",    "nome": "Arduino Micro"},
]

# Conversores USB-serial mais comuns em placas compativeis (clones).
CHIPS_CONHECIDOS = {
    "0x7523": "Arduino Uno (clone CH340)",
    "0x5523": "Arduino Uno (clone CH340)",
    "0x6001": "Arduino Uno (clone FTDI)",
    "0x6015": "Arduino Uno (clone FTDI)",
    "0x0043": "Arduino Uno",
    "0x0001": "Arduino Uno",
    "0xea60": "Arduino Uno (clone CP2102)",
}


# ------------------------------------------------------------
# Mensagens — com pythonw nao existe console, entao tudo vai
# para o arquivo de log ao lado do servidor.
# ------------------------------------------------------------

def msg(texto):
    linha = time.strftime("%H:%M:%S ") + str(texto)
    try:
        if sys.stdout is not None:
            print(linha)
            sys.stdout.flush()
    except Exception:
        pass
    try:
        with open(ARQUIVO_LOG, "a", encoding="utf-8") as f:
            f.write(linha + "\n")
    except Exception:
        pass


# ------------------------------------------------------------
# Localiza o arduino-cli
# ------------------------------------------------------------

def achar_cli():
    """Procura o arduino-cli ao lado deste script e depois no PATH.

    O da pasta vem primeiro: e o que o instalador do laboratorio
    baixou e preparou com o nucleo do Uno."""
    for nome in ("arduino-cli.exe", "arduino-cli"):
        local = os.path.join(RAIZ, "arduino-cli", nome)
        if os.path.isfile(local):
            return local
        local = os.path.join(RAIZ, nome)
        if os.path.isfile(local):
            return local
    return shutil.which("arduino-cli")


CLI = achar_cli()


def sem_janela():
    """Impede o piscar de uma janela de console a cada chamada (Windows)."""
    if os.name == "nt":
        return getattr(subprocess, "CREATE_NO_WINDOW", 0)
    return 0


def rodar(args, tempo=TEMPO_LIMITE):
    """Roda o arduino-cli e devolve (codigo_de_saida, saida_completa)."""
    if not CLI:
        return 1, "arduino-cli nao encontrado."
    try:
        p = subprocess.run(
            [CLI] + args,
            capture_output=True,
            timeout=tempo,
            creationflags=sem_janela(),
        )
    except subprocess.TimeoutExpired:
        return 1, "Tempo esgotado ao executar o arduino-cli."
    except OSError as e:
        return 1, "Falha ao executar o arduino-cli: %s" % e
    saida = (p.stdout or b"").decode("utf-8", "replace") + \
            (p.stderr or b"").decode("utf-8", "replace")
    return p.returncode, saida


def rodar_json(args, tempo=TEMPO_LIMITE):
    """Roda o arduino-cli pedindo JSON e devolve o objeto (ou None)."""
    codigo, saida = rodar(args + ["--format", "json"], tempo)
    if codigo != 0:
        return None
    for abre in ("{", "["):
        i = saida.find(abre)
        if i >= 0:
            try:
                return json.loads(saida[i:])
            except ValueError:
                continue
    return None


def versao_cli():
    codigo, saida = rodar(["version"], tempo=25)
    if codigo != 0:
        return None
    m = re.search(r"Version:\s*(\S+)", saida)
    return m.group(1) if m else saida.strip().split("\n")[0]


# ------------------------------------------------------------
# Sketch temporario
# ------------------------------------------------------------

def escrever_sketch(codigo, nome):
    """Grava o codigo num diretorio temporario no formato que o
    arduino-cli espera: <pasta>/<pasta>.ino."""
    seguro = re.sub(r"[^A-Za-z0-9_]", "_", nome or "sketch") or "sketch"
    base = tempfile.mkdtemp(prefix="academy_")
    pasta = os.path.join(base, seguro)
    os.makedirs(pasta, exist_ok=True)
    caminho = os.path.join(pasta, seguro + ".ino")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(codigo)
    return base, pasta


def limpar(base):
    shutil.rmtree(base, ignore_errors=True)


def listar_portas():
    """Portas com placa conectada, no formato que a IDE espera."""
    dados = rodar_json(["board", "list"], tempo=40)
    if dados is None:
        return []

    # o formato muda entre versoes do arduino-cli: aceita as duas formas
    itens = dados.get("detected_ports", dados) if isinstance(dados, dict) else dados
    if not isinstance(itens, list):
        return []

    portas = []
    for item in itens:
        porta = item.get("port", {}) if isinstance(item, dict) else {}
        endereco = porta.get("address") or item.get("address")
        if not endereco:
            continue
        protocolo = porta.get("protocol") or item.get("protocol") or ""
        if protocolo and protocolo != "serial":
            continue
        placas = item.get("matching_boards") or item.get("boards") or []
        if placas:
            nome = placas[0].get("name")
            fqbn = placas[0].get("fqbn") or ""
        else:
            # Clones nao sao identificados pelo arduino-cli: o PID cru
            # ("0x7523") nao diz nada ao aluno, entao mostramos o chip.
            pid = str((porta.get("properties", {}) or {}).get("pid") or "").lower()
            nome = CHIPS_CONHECIDOS.get(pid, "Placa serial")
            fqbn = ""
        portas.append({"porta": endereco, "placa": nome, "fqbn": fqbn})
    return portas


# ============================================================
# Monitor Serial
# ------------------------------------------------------------
# Usa o proprio `arduino-cli monitor` como ponte com a porta:
# ele ja vem instalado (e requisito da IDE) e evita depender do
# pyserial, que exigiria instalar pacote na maquina da escola.
# ============================================================

class MonitorSerial:
    def __init__(self):
        self.proc = None
        self.porta = None
        self.baud = 9600
        self.linhas = []        # historico (limitado)
        self.base = 0           # quantas linhas ja sairam do historico
        self.trava = threading.Lock()
        self.erro = ""
        self.LIMITE = 3000

    # ---------- estado ----------
    def aberto(self):
        return self.proc is not None and self.proc.poll() is None

    def estado(self):
        return {
            "aberto": self.aberto(),
            "porta": self.porta or "",
            "baud": self.baud,
            "total": self.base + len(self.linhas),
            "erro": self.erro,
        }

    # ---------- abrir / fechar ----------
    def abrir(self, porta, baud):
        self.fechar()
        if not CLI:
            self.erro = "arduino-cli nao encontrado."
            return False
        self.erro = ""
        self.porta = porta
        self.baud = int(baud or 9600)
        args = [CLI, "monitor", "-p", porta, "--config", "baudrate=%d" % self.baud]
        try:
            self.proc = subprocess.Popen(
                args, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT, bufsize=0,
                creationflags=sem_janela(),
            )
        except OSError as e:
            self.proc = None
            self.erro = "Falha ao abrir a porta: %s" % e
            return False
        with self.trava:
            self.linhas = []
            self.base = 0
        threading.Thread(target=self._ler, daemon=True).start()
        msg("monitor aberto em %s (%d baud)" % (porta, self.baud))
        return True

    def fechar(self):
        p = self.proc
        self.proc = None
        if p and p.poll() is None:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass
        return True

    # ---------- leitura em thread ----------
    def _guardar(self, texto):
        with self.trava:
            self.linhas.append(texto)
            if len(self.linhas) > self.LIMITE:
                corte = len(self.linhas) - self.LIMITE
                self.linhas = self.linhas[corte:]
                self.base += corte

    def _ler(self):
        p = self.proc
        buf = bytearray()
        ultimo = time.time()
        while p is not None and p.poll() is None and p is self.proc:
            try:
                b = p.stdout.read(1)
            except Exception:
                break
            if not b:
                break
            if b in (b"\n", b"\r"):
                if buf:
                    self._guardar(buf.decode("utf-8", "replace"))
                    buf = bytearray()
                    ultimo = time.time()
            else:
                buf += b
                # linha longa demais ou sem quebra: descarrega assim mesmo
                if len(buf) > 400 or (time.time() - ultimo > 1.0 and len(buf) > 0):
                    self._guardar(buf.decode("utf-8", "replace"))
                    buf = bytearray()
                    ultimo = time.time()
        if buf:
            self._guardar(buf.decode("utf-8", "replace"))

    # ---------- envio ----------
    def enviar(self, texto, final="\n"):
        if not self.aberto():
            return False
        try:
            self.proc.stdin.write((texto + final).encode("utf-8", "replace"))
            self.proc.stdin.flush()
            return True
        except Exception as e:
            self.erro = "Falha ao enviar: %s" % e
            return False

    # ---------- leitura pelo navegador ----------
    def ler(self, desde):
        with self.trava:
            total = self.base + len(self.linhas)
            inicio = max(0, int(desde or 0) - self.base)
            novas = self.linhas[inicio:]
        return {"linhas": novas, "proximo": total, "estado": self.estado()}


MONITOR = MonitorSerial()
OPERACAO = threading.Lock()


# ------------------------------------------------------------
# Tarefa em andamento — a barra de carregamento da IDE pergunta
# em que fase estamos (compilando / gravando) enquanto espera.
# ------------------------------------------------------------
TAREFA = {"fase": "ocioso", "porta": "", "desde": 0.0}


def marcar_fase(fase, porta=""):
    TAREFA["fase"] = fase
    TAREFA["porta"] = porta
    TAREFA["desde"] = time.time()


# ------------------------------------------------------------
# Desligamento automatico
# ------------------------------------------------------------
ULTIMO_CONTATO = time.time()


def vigia_ocioso(servidor):
    while True:
        time.sleep(30)
        if time.time() - ULTIMO_CONTATO > OCIOSO_MAXIMO:
            msg("sem uso ha %d minutos — encerrando" % (OCIOSO_MAXIMO // 60))
            MONITOR.fechar()
            os._exit(0)


def encerrar_em_breve():
    def tarefa():
        time.sleep(0.6)
        MONITOR.fechar()
        os._exit(0)
    threading.Thread(target=tarefa, daemon=True).start()


# ------------------------------------------------------------
# HTTP
# ------------------------------------------------------------

class Manipulador(SimpleHTTPRequestHandler):

    # O Windows as vezes devolve o MIME errado para .wasm/.js (registro do
    # sistema). O compilador Python do LEGO/Pybricks carrega um .wasm com
    # WebAssembly.instantiateStreaming, que exige application/wasm.
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map)
    extensions_map[".wasm"] = "application/wasm"
    extensions_map[".js"] = "text/javascript"
    # micro:bit: o firmware do MicroPython (.hex) e o desenho da placa (.svg)
    extensions_map[".hex"] = "text/plain"
    extensions_map[".svg"] = "image/svg+xml"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=RAIZ, **kwargs)

    def log_message(self, formato, *args):
        pass

    # Nada de cache — nem para os arquivos estaticos. Sem isto, o navegador
    # continua mostrando a versao antiga da IDE depois de uma atualizacao,
    # e o professor fica clicando em botoes que a pagina em cache nem tem.
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def responder(self, obj, status=200):
        corpo = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def ler_json(self):
        tamanho = int(self.headers.get("Content-Length") or 0)
        if tamanho <= 0 or tamanho > 2_000_000:
            return {}
        try:
            return json.loads(self.rfile.read(tamanho).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return {}

    # ---------------- GET ----------------
    def do_GET(self):
        global ULTIMO_CONTATO
        ULTIMO_CONTATO = time.time()
        rota = self.path.split("?")[0]

        if rota == "/api/status":
            versao = versao_cli() if CLI else None
            return self.responder({
                "ok": True,
                "versao_ide": VERSAO,
                "arduino_cli": bool(versao),
                "versao": versao or "",
                "caminho": CLI or "",
                "fqbn": FQBN_PADRAO,
                "placas": PLACAS,
                "monitor": MONITOR.estado(),
                "micropython": k10_support.disponivel(),
            })

        if rota == "/api/portas":
            return self.responder({"portas": listar_portas()})

        if rota == "/api/progresso":
            return self.responder({
                "fase": TAREFA["fase"],
                "porta": TAREFA["porta"],
                "segundos": round(time.time() - TAREFA["desde"], 2)
                            if TAREFA["desde"] else 0,
            })

        if rota == "/api/monitor":
            desde = 0
            if "?" in self.path:
                for par in self.path.split("?", 1)[1].split("&"):
                    if par.startswith("desde="):
                        try:
                            desde = int(par[6:])
                        except ValueError:
                            desde = 0
            return self.responder(MONITOR.ler(desde))

        if rota == "/api/libs":
            dados = rodar_json(["lib", "list"], tempo=60) or {}
            itens = dados.get("installed_libraries", dados) if isinstance(dados, dict) else dados
            libs = []
            for i in (itens or []):
                lib = i.get("library", i) if isinstance(i, dict) else {}
                if lib.get("name"):
                    libs.append({"nome": lib.get("name"),
                                 "versao": lib.get("version", ""),
                                 "resumo": lib.get("sentence", "")})
            return self.responder({"libs": libs})

        if rota == "/api/cores":
            dados = rodar_json(["core", "list"], tempo=60) or {}
            itens = dados.get("platforms", dados) if isinstance(dados, dict) else dados
            cores = []
            for i in (itens or []):
                if not isinstance(i, dict):
                    continue
                cores.append({"id": i.get("id", ""),
                              "nome": (i.get("releases", {}) or {}).get(
                                  i.get("installed_version", ""), {}).get("name")
                              or i.get("name", i.get("id", "")),
                              "versao": i.get("installed_version",
                                              i.get("installed", ""))})
            return self.responder({"cores": cores})

        if rota == "/api/info":
            porta = ""
            if "?" in self.path:
                for par in self.path.split("?", 1)[1].split("&"):
                    if par.startswith("fqbn="):
                        porta = par[5:]
            fqbn = porta or FQBN_PADRAO
            codigo, saida = rodar(["board", "details", "-b", fqbn], tempo=40)
            return self.responder({"ok": codigo == 0, "log": saida})

        return super().do_GET()

    # ---------------- POST ----------------
    def do_POST(self):
        if not OPERACAO.acquire(blocking=False):
            return self.responder({"ok": False, "log": "Aguarde a operação atual terminar."})
        try:
            return self.tratar_post()
        finally:
            OPERACAO.release()

    def tratar_post(self):
        global ULTIMO_CONTATO
        ULTIMO_CONTATO = time.time()
        rota = self.path.split("?")[0]

        if rota == "/api/micropython":
            dados = self.ler_json()
            marcar_fase("gravando" if dados.get("acao") == "enviar" else "compilando", dados.get("porta", ""))
            resultado = k10_support.executar(dados, MONITOR, listar_portas)
            marcar_fase("pronto" if resultado["ok"] else "erro")
            return self.responder(resultado)

        if rota == "/api/k10/preparar":
            self.ler_json()
            cod, saida = rodar(["core", "update-index", "--additional-urls", k10_support.K10_INDEX])
            if cod == 0:
                cod, saida = rodar(["core", "install", "UNIHIKER:esp32@0.0.5", "--additional-urls", k10_support.K10_INDEX], tempo=1800)
            return self.responder({"ok": cod == 0, "log": saida})

        if rota == "/api/compilar":
            return self.compilar_ou_gravar(gravar=False)
        if rota == "/api/gravar":
            return self.compilar_ou_gravar(gravar=True)
        if rota == "/api/exportar":
            return self.exportar()
        if rota == "/api/monitor":
            return self.monitor()
        if rota == "/api/libs":
            return self.gerenciar("lib")
        if rota == "/api/cores":
            return self.gerenciar("core")
        if rota == "/api/encerrar":
            self.responder({"ok": True})
            encerrar_em_breve()
            return
        self.send_error(404)

    # ---------------- acoes ----------------
    def sem_cli(self):
        return self.responder({
            "ok": False,
            "log": "arduino-cli nao encontrado. Instale-o e reinicie o servidor "
                   "(veja LEIA-ME.md).",
        })

    def compilar_ou_gravar(self, gravar):
        if not CLI:
            return self.sem_cli()

        dados = self.ler_json()
        codigo_fonte = dados.get("codigo") or ""
        nome = dados.get("nome") or "sketch"
        porta = dados.get("porta") or ""
        fqbn = dados.get("fqbn") or FQBN_PADRAO

        if dados.get("placa") == "k10":
            fqbn = k10_support.K10_FQBN

        if not codigo_fonte.strip():
            return self.responder({"ok": False, "log": "O sketch esta vazio."})
        if gravar and not porta:
            return self.responder({"ok": False, "log": "Nenhuma porta selecionada."})

        # O monitor segura a porta: fecha antes de gravar e reabre depois,
        # do mesmo jeito que o Arduino IDE faz.
        remonitorar = None
        if gravar and MONITOR.aberto():
            remonitorar = (MONITOR.porta, MONITOR.baud)
            MONITOR.fechar()
            time.sleep(0.4)

        base, pasta = escrever_sketch(codigo_fonte, nome)
        registro = []
        try:
            marcar_fase("compilando", porta)
            registro.append("$ arduino-cli compile --fqbn %s" % fqbn)
            cod, saida = rodar(["compile", "--fqbn", fqbn, pasta])
            registro.append(saida.rstrip())
            if cod != 0:
                marcar_fase("erro", porta)
                return self.responder({"ok": False, "log": "\n".join(registro)})

            if not gravar:
                marcar_fase("pronto", porta)
                registro.append("Compilacao concluida.")
                return self.responder({"ok": True, "log": "\n".join(registro)})

            marcar_fase("gravando", porta)
            registro.append("")
            registro.append("$ arduino-cli upload -p %s --fqbn %s" % (porta, fqbn))
            cod, saida = rodar(["upload", "-p", porta, "--fqbn", fqbn, pasta])
            registro.append(saida.rstrip())
            if cod != 0:
                marcar_fase("erro", porta)
                return self.responder({"ok": False, "log": "\n".join(registro)})

            marcar_fase("pronto", porta)
            registro.append("Upload concluido.")
            return self.responder({"ok": True, "log": "\n".join(registro),
                                   "monitor_reaberto": bool(remonitorar)})
        finally:
            limpar(base)
            if remonitorar:
                time.sleep(1.2)   # espera a placa reiniciar depois do upload
                MONITOR.abrir(remonitorar[0], remonitorar[1])

    def exportar(self):
        """Compila e devolve o .hex, para o navegador salvar."""
        if not CLI:
            return self.sem_cli()
        dados = self.ler_json()
        codigo_fonte = dados.get("codigo") or ""
        nome = dados.get("nome") or "sketch"
        fqbn = dados.get("fqbn") or FQBN_PADRAO
        if not codigo_fonte.strip():
            return self.responder({"ok": False, "log": "O sketch esta vazio."})

        base, pasta = escrever_sketch(codigo_fonte, nome)
        saida_dir = os.path.join(base, "saida")
        try:
            cod, saida = rodar(["compile", "--fqbn", fqbn,
                                "--output-dir", saida_dir, pasta])
            if cod != 0:
                return self.responder({"ok": False, "log": saida})
            extensao = ".bin" if fqbn.startswith("UNIHIKER:") else ".hex"
            hexes = [f for f in os.listdir(saida_dir) if f.endswith(extensao) and not any(x in f for x in ("bootloader", "partitions", "merged"))]
            if not hexes:
                return self.responder({"ok": False, "log": "Nenhum .hex foi gerado."})
            hexes.sort(key=len)   # prefere o .ino.hex ao .with_bootloader.hex
            if extensao == ".bin":
                with open(os.path.join(saida_dir, hexes[0]), "rb") as f:
                    conteudo = base64.b64encode(f.read()).decode("ascii")
                return self.responder({"ok": True, "arquivo": hexes[0], "conteudo": conteudo, "base64": True, "log": saida})
            with open(os.path.join(saida_dir, hexes[0]), "r", encoding="utf-8") as f:
                conteudo = f.read()
            return self.responder({"ok": True, "arquivo": hexes[0],
                                   "conteudo": conteudo, "log": saida})
        finally:
            limpar(base)

    def monitor(self):
        dados = self.ler_json()
        acao = dados.get("acao") or ""
        if acao == "abrir":
            ok = MONITOR.abrir(dados.get("porta") or "", dados.get("baud") or 9600)
            return self.responder({"ok": ok, "estado": MONITOR.estado()})
        if acao == "fechar":
            MONITOR.fechar()
            return self.responder({"ok": True, "estado": MONITOR.estado()})
        if acao == "enviar":
            fim = {"nada": "", "nl": "\n", "cr": "\r", "nlcr": "\r\n"}.get(
                dados.get("final") or "nl", "\n")
            ok = MONITOR.enviar(dados.get("texto") or "", fim)
            return self.responder({"ok": ok, "estado": MONITOR.estado()})
        return self.responder({"ok": False, "log": "Acao desconhecida."})

    def gerenciar(self, tipo):
        """lib/core: buscar e instalar pelo arduino-cli."""
        if not CLI:
            return self.sem_cli()
        dados = self.ler_json()
        acao = dados.get("acao") or ""
        alvo = (dados.get("alvo") or "").strip()

        if acao == "buscar":
            if tipo == "lib":
                d = rodar_json(["lib", "search", alvo], tempo=90) or {}
                itens = d.get("libraries", []) if isinstance(d, dict) else []
                achados = []
                for i in itens[:40]:
                    versoes = i.get("available_versions") or []
                    achados.append({
                        "nome": i.get("name", ""),
                        "versao": versoes[-1] if versoes else
                                  (i.get("latest", {}) or {}).get("version", ""),
                        "resumo": (i.get("latest", {}) or {}).get("sentence", ""),
                    })
            else:
                d = rodar_json(["core", "search", alvo], tempo=90) or {}
                itens = d.get("platforms", d) if isinstance(d, dict) else d
                achados = []
                for i in (itens or [])[:40]:
                    if not isinstance(i, dict):
                        continue
                    achados.append({"nome": i.get("id", ""),
                                    "versao": i.get("latest_version",
                                                    i.get("latest", "")),
                                    "resumo": i.get("maintainer", "")})
            return self.responder({"ok": True, "achados": achados})

        if acao == "instalar":
            if not alvo:
                return self.responder({"ok": False, "log": "Nada a instalar."})
            cod, saida = rodar([tipo, "install", alvo], tempo=600)
            return self.responder({"ok": cod == 0, "log": saida})

        if acao == "atualizar":
            alvo_args = ["lib", "update-index"] if tipo == "lib" else ["core", "update-index"]
            cod, saida = rodar(alvo_args, tempo=300)
            return self.responder({"ok": cod == 0, "log": saida})

        return self.responder({"ok": False, "log": "Acao desconhecida."})


# ------------------------------------------------------------
# Inicio
# ------------------------------------------------------------

def principal():
    ap = argparse.ArgumentParser(description="Servidor local do MIDE EDU")
    ap.add_argument("--porta", type=int, default=8080, help="porta HTTP (padrao 8080)")
    ap.add_argument("--sem-navegador", action="store_true", help="nao abrir o navegador")
    args = ap.parse_args()

    endereco = ("127.0.0.1", args.porta)
    try:
        servidor = ThreadingHTTPServer(endereco, Manipulador)
    except OSError as e:
        msg("Nao foi possivel abrir a porta %d: %s" % (args.porta, e))
        # Ja tem um servidor rodando? Entao so abre o navegador nele.
        if not args.sem_navegador:
            webbrowser.open("http://127.0.0.1:%d/" % args.porta)
        return 1

    url = "http://127.0.0.1:%d/" % args.porta
    msg("MIDE EDU em %s" % url)
    msg("arduino-cli: %s" % (CLI or "NAO ENCONTRADO (veja LEIA-ME.md)"))

    threading.Thread(target=vigia_ocioso, args=(servidor,), daemon=True).start()

    if not args.sem_navegador:
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        msg("Encerrado.")
    finally:
        MONITOR.fechar()
    return 0


if __name__ == "__main__":
    sys.exit(principal())
