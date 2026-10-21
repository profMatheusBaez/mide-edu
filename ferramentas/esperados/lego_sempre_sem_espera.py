# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.hubs import TechnicHub
from pybricks.parameters import Color
from pybricks.tools import wait

hub = TechnicHub()

while True:
    hub.light.on(Color.RED)
    wait(10)
