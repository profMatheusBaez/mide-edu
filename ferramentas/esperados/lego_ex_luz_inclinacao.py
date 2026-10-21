# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.hubs import TechnicHub
from pybricks.parameters import Color
from pybricks.tools import wait

hub = TechnicHub()

inclinacao = 0

while True:
    inclinacao = hub.imu.tilt()[0]
    print(inclinacao)
    if inclinacao > 20:
        hub.light.on(Color.RED)
    else:
        hub.light.on(Color.GREEN)
    wait(100)
