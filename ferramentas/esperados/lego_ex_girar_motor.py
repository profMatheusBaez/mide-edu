# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.hubs import TechnicHub
from pybricks.pupdevices import Motor
from pybricks.parameters import Port, Color
from pybricks.tools import wait

hub = TechnicHub()
motor_a = Motor(Port.A)

hub.light.on(Color.GREEN)
motor_a.run_angle(360, 720)
hub.light.on(Color.BLUE)
wait(1000)
motor_a.run_angle(360, -720)
motor_a.hold()
hub.light.off()
