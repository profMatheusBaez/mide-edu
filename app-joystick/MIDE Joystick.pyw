# ============================================================
# MIDE Joystick — app do PC
# ------------------------------------------------------------
# Fica aberto no computador. A aba Joystick da MIDE EDU (no
# navegador) manda a montagem para cá com um clique, e este app
# transforma as mensagens do Arduino (A1_DOWN, A1_UP...) em teclas
# e cliques de verdade, como se fosse o teclado.
#
#   - recebe a montagem da IDE em http://127.0.0.1:8765 (só do
#     próprio computador);
#   - acha o Arduino sozinho e reconecta se o cabo sair;
#   - solta a porta USB quando a IDE vai gravar (Upload) e volta
#     depois, sem precisar fechar nada;
#   - mostra as teclas acendendo.
#
# Precisa de Python 3 no Windows. Na primeira vez instala sozinho o
# pyserial e o pydirectinput (precisa de internet).
# ============================================================
import json
import os
import queue
import subprocess
import sys
import threading
import time
import tkinter as tk
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

VERSAO = 1
PORTA_HTTP = 8765
PASTA = os.path.dirname(os.path.abspath(__file__))
ARQ_MONTAGEM = os.path.join(PASTA, "montagem.json")
# de onde a IDE pode mandar a montagem: o site, o index.html aberto do disco ("null") e o servidor do laboratório
ORIGENS = {("https", "profmatheusbaez.github.io"), ("http", "127.0.0.1"), ("http", "localhost")}
BOTOES_MOUSE = {"mouse_esq": "left", "mouse_dir": "right", "mouse_meio": "middle"}

COR = {
    "fundo": "#16191d", "painel": "#1f242a", "borda": "#2e353d", "txt": "#eef2f4", "txt2": "#9aa6ad",
    "teal": "#0ca1a6", "ok": "#57d83b", "aviso": "#ffc83d", "erro": "#ff5757", "tecla": "#0d0f11",
}

eventos = queue.Queue()   # da thread da porta / do servidor -> janela


def avisar(tipo, **dados):
    dados["tipo"] = tipo
    eventos.put(dados)


# ------------------------------------------------------------
# Bibliotecas
# ------------------------------------------------------------
serial = None
teclado = None


def carregar_bibliotecas():
    """Importa pyserial e pydirectinput; instala o que faltar. Roda fora da janela."""
    global serial, teclado
    faltam = []
    try:
        import serial as s
        if not hasattr(s, "Serial"):
            avisar("log", texto="Existe um pacote errado chamado 'serial'. Rode: py -m pip uninstall serial", cor="erro")
            return False
        import serial.tools.list_ports  # noqa: F401
        serial = s
    except ImportError:
        faltam.append("pyserial")
    if sys.platform.startswith("win"):
        try:
            import pydirectinput as t
            teclado = t
        except ImportError:
            faltam.append("pydirectinput")
    if faltam:
        avisar("log", texto="Instalando " + " e ".join(faltam) + " (só na primeira vez)...", cor="aviso")
        cmd = [sys.executable, "-m", "pip", "install", "--disable-pip-version-check"]
        oculto = {"creationflags": 0x08000000} if sys.platform.startswith("win") else {}   # sem janela preta
        if subprocess.call(cmd + ["--user"] + faltam, **oculto) != 0:
            subprocess.call(cmd + faltam, **oculto)
        import importlib
        import site
        try:
            site.addsitedir(site.getusersitepackages())
        except Exception:
            pass
        importlib.invalidate_caches()
        try:
            import serial as s
            import serial.tools.list_ports  # noqa: F401
            serial = s
            if sys.platform.startswith("win"):
                import pydirectinput as t
                teclado = t
        except ImportError:
            avisar("log", texto="Não deu para instalar: " + ", ".join(faltam) +
                   ". No Thonny: Ferramentas > Gerenciar pacotes. No terminal: py -m pip install pyserial pydirectinput", cor="erro")
            return False
    if teclado is not None:
        teclado.PAUSE = 0
        teclado.FAILSAFE = False
    else:
        avisar("log", texto="Fora do Windows o app só mostra as teclas (não aperta).", cor="aviso")
    return True


# ------------------------------------------------------------
# Estado compartilhado
# ------------------------------------------------------------
class Estado:
    def __init__(self):
        self.trava = threading.Lock()
        self.montagem = {"acoes": [], "id": "", "porta": ""}
        self.recebida_em = None
        self.porta_escolhida = ""        # "" = automática
        self.porta_atual = ""
        self.conectado = False
        self.id_placa = ""
        self.soltar_ate = 0.0            # a IDE pediu a porta (Upload / Monitor)
        self.teclas_ligadas = True
        self.apertadas = set()

    def acoes(self):
        with self.trava:
            return {"A%d" % a["numero"]: a for a in self.montagem.get("acoes", [])}


E = Estado()


def carregar_montagem():
    try:
        with open(ARQ_MONTAGEM, encoding="utf-8") as f:
            E.montagem = json.load(f)
            E.recebida_em = os.path.getmtime(ARQ_MONTAGEM)
    except (OSError, ValueError):
        pass


def salvar_montagem(m):
    with E.trava:
        E.montagem = m
        E.recebida_em = time.time()
        if m.get("porta"):
            E.porta_escolhida = m["porta"]
    try:
        with open(ARQ_MONTAGEM, "w", encoding="utf-8") as f:
            json.dump(m, f, ensure_ascii=False, indent=1)
    except OSError:
        pass
    avisar("montagem")


# ------------------------------------------------------------
# Teclas
# ------------------------------------------------------------
def apertar(tecla):
    if teclado is not None and E.teclas_ligadas:
        if tecla in BOTOES_MOUSE:
            teclado.mouseDown(button=BOTOES_MOUSE[tecla])
        else:
            teclado.keyDown(tecla)
    E.apertadas.add(tecla)


def soltar(tecla):
    if teclado is not None and tecla in E.apertadas:
        if tecla in BOTOES_MOUSE:
            teclado.mouseUp(button=BOTOES_MOUSE[tecla])
        else:
            teclado.keyUp(tecla)
    E.apertadas.discard(tecla)


def soltar_tudo():
    for t in list(E.apertadas):
        soltar(t)


def tratar_linha(linha):
    if linha.startswith("JOYSTICK PRONTO"):
        partes = linha.split()
        E.id_placa = partes[2] if len(partes) > 2 else ""
        avisar("placa", id=E.id_placa)
        return
    if linha.startswith("BTN_"):
        avisar("log", texto="A placa está com o código ANTIGO do joystick. Faça o Upload pela aba Joystick.", cor="aviso")
        return
    if "_" not in linha:
        return
    nome, evento = linha.split("_", 1)
    acao = E.acoes().get(nome)
    if not acao:
        return
    tecla, modo = acao["tecla"], acao.get("modo", "segurar")
    if evento == "DOWN":
        apertar(tecla)
        if modo == "toque":
            soltar(tecla)
        avisar("acao", numero=acao["numero"], ligada=True, toque=(modo == "toque"))
    elif evento == "UP":
        if modo == "segurar":
            soltar(tecla)
        avisar("acao", numero=acao["numero"], ligada=False)


# ------------------------------------------------------------
# Porta serial (thread)
# ------------------------------------------------------------
def achar_porta():
    if E.porta_escolhida:
        return E.porta_escolhida
    portas = list(serial.tools.list_ports.comports())
    for p in portas:
        texto = ((p.description or "") + " " + (p.manufacturer or "")).upper()
        if any(n in texto for n in ("ARDUINO", "CH340", "CH341", "USB-SERIAL", "USB SERIAL")):
            return p.device
    for p in portas:
        if p.vid in (0x2341, 0x2A03, 0x1A86, 0x0403, 0x10C4):
            return p.device
    return None


def laco_serial():
    if not carregar_bibliotecas():
        avisar("arduino", estado="erro", texto="Faltam bibliotecas")
        return
    avisar("portas", lista=listar_portas())
    ultimo_aviso = ""
    while True:
        if time.time() < E.soltar_ate:
            avisar("arduino", estado="pausa", texto="Porta liberada para a IDE (Upload/Monitor)")
            time.sleep(0.3)
            continue
        porta = achar_porta()
        if not porta:
            avisar("arduino", estado="fora", texto="Arduino não encontrado — ligue o cabo USB")
            time.sleep(1.5)
            continue
        try:
            with serial.Serial(porta, 9600, timeout=0.2) as ard:
                E.porta_atual, E.conectado = porta, True
                avisar("arduino", estado="ok", texto="Conectado em " + porta)
                ultimo_aviso = ""
                buf = b""
                while time.time() >= E.soltar_ate and (not E.porta_escolhida or E.porta_escolhida == porta):
                    buf += ard.read(64)
                    while b"\n" in buf:
                        linha, buf = buf.split(b"\n", 1)
                        linha = linha.decode(errors="ignore").strip()
                        if linha:
                            tratar_linha(linha)
        except (serial.SerialException, OSError) as erro:
            texto = str(erro)
            if "denied" in texto.lower() or "negado" in texto.lower() or "PermissionError" in texto:
                msg = porta + " ocupada: feche o Monitor Serial, o Arduino IDE ou o Thonny (modo MicroPython)"
            else:
                msg = "Conexão perdida em " + porta
            if msg != ultimo_aviso:
                avisar("log", texto=msg, cor="aviso")
                ultimo_aviso = msg
            avisar("arduino", estado="fora", texto=msg)
        finally:
            E.conectado = False
            E.id_placa = ""
            soltar_tudo()
            avisar("soltou")
        time.sleep(1)


def listar_portas():
    try:
        return [(p.device, p.description or "") for p in serial.tools.list_ports.comports()]
    except Exception:
        return []


# ------------------------------------------------------------
# Servidor local para a IDE
# ------------------------------------------------------------
class Manipulador(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _origem_ok(self):
        o = self.headers.get("Origin")
        if o is None or o == "null":
            return True
        u = urlsplit(o)
        return (u.scheme, u.hostname) in ORIGENS

    def _cabecalhos(self, codigo=200, tipo="application/json"):
        self.send_response(codigo)
        o = self.headers.get("Origin")
        if o and self._origem_ok():
            self.send_header("Access-Control-Allow-Origin", o)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Content-Type", tipo)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def _json(self, dados, codigo=200):
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self._cabecalhos(codigo)
        self.wfile.write(corpo)

    def do_OPTIONS(self):
        self._cabecalhos(204 if self._origem_ok() else 403)

    def do_GET(self):
        if not self._origem_ok():
            return self._json({"erro": "origem"}, 403)
        if self.path.startswith("/status"):
            with E.trava:
                m = dict(E.montagem)
            return self._json({
                "app": "mide-joystick", "versao": VERSAO, "conectado": E.conectado, "porta": E.porta_atual,
                "id_placa": E.id_placa, "id_montagem": m.get("id", ""), "acoes": len(m.get("acoes", [])),
                "pausado": time.time() < E.soltar_ate,
            })
        self._json({"erro": "rota"}, 404)

    def do_POST(self):
        if not self._origem_ok():
            return self._json({"erro": "origem"}, 403)
        try:
            n = int(self.headers.get("Content-Length") or 0)
            dados = json.loads(self.rfile.read(min(n, 200000)).decode("utf-8") or "{}")
        except ValueError:
            return self._json({"ok": False, "erro": "json"}, 400)
        if self.path.startswith("/montagem"):
            acoes = [a for a in dados.get("acoes", []) if isinstance(a, dict) and "numero" in a and "tecla" in a]
            salvar_montagem({"acoes": acoes, "id": str(dados.get("id", "")), "porta": str(dados.get("porta", ""))})
            return self._json({"ok": True, "acoes": len(acoes)})
        if self.path.startswith("/soltar"):
            seg = max(1, min(int(dados.get("segundos", 60)), 1800))
            E.soltar_ate = time.time() + seg
            # espera a thread fechar a porta (lê com timeout de 0,2 s)
            for _ in range(20):
                if not E.conectado:
                    break
                time.sleep(0.05)
            return self._json({"ok": True, "solta": not E.conectado})
        if self.path.startswith("/retomar"):
            E.soltar_ate = 0
            return self._json({"ok": True})
        self._json({"erro": "rota"}, 404)


def iniciar_servidor():
    try:
        srv = ThreadingHTTPServer(("127.0.0.1", PORTA_HTTP), Manipulador)
    except OSError:
        return None
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


# ------------------------------------------------------------
# Janela
# ------------------------------------------------------------
class Janela:
    def __init__(self, raiz):
        self.raiz = raiz
        raiz.title("MIDE Joystick")
        raiz.configure(bg=COR["fundo"])
        raiz.geometry("560x520")
        raiz.minsize(440, 360)
        self.chips = {}
        f = ("Segoe UI", 10)

        topo = tk.Frame(raiz, bg=COR["fundo"])
        topo.pack(fill="x", padx=14, pady=(12, 6))
        tk.Label(topo, text="🎮 MIDE Joystick", bg=COR["fundo"], fg=COR["txt"], font=("Segoe UI", 15, "bold")).pack(side="left")
        self.bt_teclas = tk.Button(topo, text="⏸ Pausar teclas", command=self.alternar_teclas, bg=COR["painel"], fg=COR["txt"],
                                   activebackground=COR["borda"], activeforeground=COR["txt"], relief="flat", padx=10, pady=3, font=f)
        self.bt_teclas.pack(side="right")

        info = tk.Frame(raiz, bg=COR["painel"], highlightbackground=COR["borda"], highlightthickness=1)
        info.pack(fill="x", padx=14, pady=4)
        self.lb_ard = self._linha(info, "Arduino", "procurando…")
        self.lb_ide = self._linha(info, "IDE", "")
        linha_porta = tk.Frame(info, bg=COR["painel"])
        linha_porta.pack(fill="x", padx=10, pady=(2, 8))
        tk.Label(linha_porta, text="Porta", width=8, anchor="w", bg=COR["painel"], fg=COR["txt2"], font=f).pack(side="left")
        self.var_porta = tk.StringVar(value="Automática")
        self.menu_porta = tk.OptionMenu(linha_porta, self.var_porta, "Automática", command=self.trocar_porta)
        self.menu_porta.configure(bg=COR["fundo"], fg=COR["txt"], activebackground=COR["borda"], relief="flat",
                                  highlightthickness=0, font=f)
        self.menu_porta.pack(side="left")

        tk.Label(raiz, text="TECLAS", bg=COR["fundo"], fg=COR["txt2"], font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=16, pady=(10, 2))
        self.grade = tk.Frame(raiz, bg=COR["fundo"])
        self.grade.pack(fill="x", padx=12)

        tk.Label(raiz, text="MENSAGENS", bg=COR["fundo"], fg=COR["txt2"], font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=16, pady=(12, 2))
        self.log = tk.Text(raiz, height=6, bg=COR["tecla"], fg=COR["txt2"], relief="flat", font=("Consolas", 9),
                           highlightthickness=1, highlightbackground=COR["borda"], wrap="word")
        self.log.pack(fill="both", expand=True, padx=14, pady=(0, 12))
        for nome in ("ok", "aviso", "erro"):
            self.log.tag_configure(nome, foreground=COR[nome])
        self.log.configure(state="disabled")

        self.mostrar_montagem()
        self.raiz.after(40, self.processar)
        self.raiz.after(1000, self.atualizar_ide)

    def _linha(self, pai, rotulo, texto):
        l = tk.Frame(pai, bg=COR["painel"])
        l.pack(fill="x", padx=10, pady=(8, 0))
        tk.Label(l, text=rotulo, width=8, anchor="w", bg=COR["painel"], fg=COR["txt2"], font=("Segoe UI", 10)).pack(side="left")
        lb = tk.Label(l, text=texto, anchor="w", bg=COR["painel"], fg=COR["txt"], font=("Segoe UI", 10, "bold"))
        lb.pack(side="left", fill="x", expand=True)
        return lb

    def escrever(self, texto, cor=None):
        self.log.configure(state="normal")
        self.log.insert("end", time.strftime("%H:%M:%S ") + texto + "\n", cor or ())
        linhas = int(self.log.index("end-1c").split(".")[0])
        if linhas > 300:
            self.log.delete("1.0", "%d.0" % (linhas - 300))
        self.log.see("end")
        self.log.configure(state="disabled")

    def mostrar_montagem(self):
        for w in self.grade.winfo_children():
            w.destroy()
        self.chips = {}
        acoes = sorted(E.acoes().values(), key=lambda a: a["numero"])
        if not acoes:
            tk.Label(self.grade, text="Nenhuma montagem ainda. Na MIDE EDU, aba Joystick, clique em \"Enviar para o app\".",
                     bg=COR["fundo"], fg=COR["txt2"], font=("Segoe UI", 10), wraplength=500, justify="left").pack(anchor="w", padx=4)
            return
        colunas = 4
        for i, a in enumerate(acoes):
            caixa = tk.Frame(self.grade, bg=COR["tecla"], highlightbackground=COR["borda"], highlightthickness=1)
            caixa.grid(row=i // colunas, column=i % colunas, padx=4, pady=4, sticky="nsew")
            self.grade.grid_columnconfigure(i % colunas, weight=1)
            k = tk.Label(caixa, text=a.get("rotulo") or a["tecla"].upper(), bg=COR["tecla"], fg=COR["txt"], font=("Consolas", 13, "bold"))
            k.pack(padx=6, pady=(6, 0))
            s = tk.Label(caixa, text="A%d · %s%s" % (a["numero"], a.get("sensor", ""), " · toque" if a.get("modo") == "toque" else ""),
                         bg=COR["tecla"], fg=COR["txt2"], font=("Segoe UI", 8))
            s.pack(padx=6, pady=(0, 6))
            self.chips[a["numero"]] = (caixa, k, s)

    def acender(self, numero, ligada):
        c = self.chips.get(numero)
        if not c:
            return
        cor = COR["teal"] if ligada else COR["tecla"]
        for w in c:
            w.configure(bg=cor)
        c[1].configure(fg="#ffffff" if ligada else COR["txt"])

    def atualizar_ide(self):
        acoes = len(E.montagem.get("acoes", []))
        if E.recebida_em:
            quando = time.strftime("%H:%M", time.localtime(E.recebida_em))
            texto = "montagem recebida às %s · %d tecla%s" % (quando, acoes, "" if acoes == 1 else "s")
        else:
            texto = "esperando a IDE mandar a montagem"
        if E.id_placa and E.montagem.get("id") and E.id_placa != E.montagem.get("id"):
            texto += "  ⚠ a placa está com outro código: faça o Upload"
            self.lb_ide.configure(fg=COR["aviso"])
        else:
            self.lb_ide.configure(fg=COR["txt"])
        self.lb_ide.configure(text=texto)
        self.raiz.after(1000, self.atualizar_ide)

    def processar(self):
        try:
            while True:
                ev = eventos.get_nowait()
                t = ev["tipo"]
                if t == "log":
                    self.escrever(ev["texto"], ev.get("cor"))
                elif t == "arduino":
                    cor = {"ok": COR["ok"], "pausa": COR["aviso"], "erro": COR["erro"]}.get(ev["estado"], COR["txt2"])
                    if self.lb_ard.cget("text") != ev["texto"]:
                        self.lb_ard.configure(text=ev["texto"], fg=cor)
                        if ev["estado"] in ("ok", "pausa"):
                            self.escrever(ev["texto"], "ok" if ev["estado"] == "ok" else "aviso")
                    if ev["estado"] == "ok":
                        self.atualizar_portas(listar_portas())
                elif t == "portas":
                    self.atualizar_portas(ev["lista"])
                elif t == "montagem":
                    self.mostrar_montagem()
                    self.escrever("Montagem recebida da IDE (%d teclas)." % len(E.montagem.get("acoes", [])), "ok")
                elif t == "acao":
                    self.acender(ev["numero"], ev["ligada"])
                    if ev.get("toque"):
                        n = ev["numero"]
                        self.raiz.after(150, lambda n=n: self.acender(n, False))
                elif t == "soltou":
                    for n in self.chips:
                        self.acender(n, False)
                elif t == "placa":
                    if E.montagem.get("id") and ev["id"] and ev["id"] != E.montagem.get("id"):
                        self.escrever("A placa está com outro código do joystick. Faça o Upload pela aba Joystick.", "aviso")
        except queue.Empty:
            pass
        self.raiz.after(30, self.processar)

    def atualizar_portas(self, lista):
        menu = self.menu_porta["menu"]
        menu.delete(0, "end")
        menu.add_command(label="Automática", command=lambda: self.trocar_porta("Automática"))
        for dev, desc in lista:
            menu.add_command(label="%s — %s" % (dev, desc), command=lambda d=dev: self.trocar_porta(d))

    def trocar_porta(self, valor):
        self.var_porta.set(valor if valor != "Automática" else "Automática")
        E.porta_escolhida = "" if valor == "Automática" else valor

    def alternar_teclas(self):
        E.teclas_ligadas = not E.teclas_ligadas
        if not E.teclas_ligadas:
            soltar_tudo()
        self.bt_teclas.configure(text="⏸ Pausar teclas" if E.teclas_ligadas else "▶ Ligar teclas",
                                 bg=COR["painel"] if E.teclas_ligadas else COR["aviso"],
                                 fg=COR["txt"] if E.teclas_ligadas else "#000000")
        self.escrever("Teclas ligadas." if E.teclas_ligadas else "Teclas pausadas: o app só mostra, não aperta.",
                      None if E.teclas_ligadas else "aviso")


def main():
    srv = iniciar_servidor()
    raiz = tk.Tk()
    if srv is None:
        raiz.withdraw()
        from tkinter import messagebox
        messagebox.showinfo("MIDE Joystick", "O MIDE Joystick já está aberto neste computador.")
        return
    carregar_montagem()
    j = Janela(raiz)
    j.escrever("App aberto. A IDE encontra este app em 127.0.0.1:%d." % PORTA_HTTP)
    threading.Thread(target=laco_serial, daemon=True).start()

    def fechar():
        soltar_tudo()
        srv.shutdown()
        raiz.destroy()
    raiz.protocol("WM_DELETE_WINDOW", fechar)
    raiz.mainloop()


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # sem janela preta (pythonw), o erro iria embora: guarda e mostra
        import traceback
        texto = traceback.format_exc()
        try:
            with open(os.path.join(PASTA, "erro.txt"), "w", encoding="utf-8") as f:
                f.write(texto)
            from tkinter import messagebox
            messagebox.showerror("MIDE Joystick", "O app parou com um erro (salvo em erro.txt):\n\n" + texto[-800:])
        except Exception:
            print(texto)
