# Testa o app do PC (app-joystick/MIDE Joystick.pyw) sem Windows: Xvfb + porta serial falsa (pty).
# Precisa de Python com tkinter e pyserial, Xvfb e ImageMagick (import) para as capturas.
# Uso: python3 ferramentas/joystick/testar_app.py [pasta_temporaria]
import os, pty, shutil, subprocess, sys, tempfile, time, json, urllib.request
D = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="mide-app-")
os.makedirs(D, exist_ok=True)
shutil.copy(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../app-joystick/MIDE Joystick.pyw"), os.path.join(D, "app.pyw"))
xv = subprocess.Popen(["Xvfb", ":99", "-screen", "0", "800x600x24"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
env = dict(os.environ, DISPLAY=":99")
mestre, escravo = pty.openpty()
nome = os.ttyname(escravo)
app = subprocess.Popen([sys.executable, os.path.join(D, "app.pyw")], env=env, cwd=D)
time.sleep(2)
def req(metodo, rota, dados=None, origem="https://profmatheusbaez.github.io"):
    r = urllib.request.Request("http://127.0.0.1:8765" + rota, method=metodo,
        data=json.dumps(dados).encode() if dados is not None else None,
        headers={"Origin": origem, "Content-Type": "application/json"} if origem else {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=3) as f:
            return f.status, dict(f.headers), f.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode()
ok = True
def confere(cond, msg):
    global ok
    print(("OK  " if cond else "ERRO"), msg); ok = ok and cond
s, h, c = req("GET", "/status"); confere(s == 200 and json.loads(c)["app"] == "mide-joystick" and h.get("Access-Control-Allow-Origin") == "https://profmatheusbaez.github.io", "status + CORS")
s, h, c = req("OPTIONS", "/montagem"); confere(s == 204 and h.get("Access-Control-Allow-Private-Network") == "true", "preflight PNA")
s, h, c = req("POST", "/montagem", {"acoes": []}, origem="https://site-malvado.com"); confere(s == 403, "origem estranha recusada")
s, h, c = req("POST", "/montagem", {"acoes": []}, origem="http://127.0.0.1.malvado.com"); confere(s == 403, "origem parecida recusada")
mont = {"id": "abcd1234", "porta": nome, "acoes": [
    {"numero": 1, "tecla": "left", "rotulo": "←", "modo": "segurar", "sensor": "Botão 1"},
    {"numero": 2, "tecla": "space", "rotulo": "ESPAÇO", "modo": "toque", "sensor": "Botão 2"}]}
s, h, c = req("POST", "/montagem", mont, origem="null"); confere(s == 200 and json.loads(c)["acoes"] == 2, "montagem recebida (file://)")
time.sleep(2.5)
os.write(mestre, b"JOYSTICK PRONTO abcd1234\r\nA1_DOWN\r\n")
time.sleep(1)
st = json.loads(req("GET", "/status")[2]); print(st)
confere(st["conectado"] and st["porta"] == nome and st["id_placa"] == "abcd1234", "conectado na porta e id da placa lido")
subprocess.run(["import", "-window", "root", os.path.join(D, "app1.png")], env=env)
s, h, c = req("POST", "/soltar", {"segundos": 30}); r = json.loads(c); confere(r["ok"] and r["solta"], "soltou a porta para o upload")
st = json.loads(req("GET", "/status")[2]); confere(st["pausado"] and not st["conectado"], "pausado e desconectado")
subprocess.run(["import", "-window", "root", os.path.join(D, "app2.png")], env=env)
req("POST", "/retomar", {}); time.sleep(2.5)
st = json.loads(req("GET", "/status")[2]); confere(st["conectado"] and not st["pausado"], "retomou")
confere(os.path.exists(os.path.join(D, "montagem.json")), "montagem salva em disco")
# segunda instância
p2 = subprocess.Popen([sys.executable, os.path.join(D, "app.pyw")], env=env, cwd=D); time.sleep(2.5)
subprocess.run(["import", "-window", "root", os.path.join(D, "app3.png")], env=env)
p2.kill()
app.kill(); xv.kill()
print("TUDO CERTO" if ok else "FALHOU", "— capturas em", D)
sys.exit(0 if ok else 1)
