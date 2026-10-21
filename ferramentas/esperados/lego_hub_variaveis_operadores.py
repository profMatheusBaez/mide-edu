# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.hubs import TechnicHub
from pybricks.parameters import Color
from pybricks.tools import wait
from urandom import randint

hub = TechnicHub()

angulo_medio = 0
hub_2 = 0
texto = ""
angulo_medio_2 = 0

hub.light.on(Color.ORANGE)
angulo_medio = hub.imu.tilt()[1]
hub_2 = hub.imu.heading() + 2 * 3
texto = str("bateria ") + str(hub.battery.voltage())
angulo_medio_2 = round(7 / 2)
for _ in range(2):
    for _ in range(3):
        hub.light.off()
while not (angulo_medio > 30):
    hub_2 += 1
    wait(10)
if True:
    pass
if hub_2 % 2 == 0 and not (False or -1 < randint(1, 6)):
    hub.light.on(Color.VIOLET)
else:
    raise SystemExit
print(texto)
