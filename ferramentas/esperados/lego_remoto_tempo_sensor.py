# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.pupdevices import ColorDistanceSensor, Remote
from pybricks.parameters import Port, Color, Button
from pybricks.tools import wait, StopWatch

remote = Remote()
relogio = StopWatch()
sensor_c = ColorDistanceSensor(Port.C)

if Button.CENTER in remote.buttons.pressed():
    remote.light.on(Color.CYAN)
relogio.reset()
print("disse \"oi\" \\ acabou")

while True:
    if sensor_c.distance() < 50:
        print(sensor_c.color())
    print(relogio.time())
    if Button.LEFT_MINUS in remote.buttons.pressed():
        raise SystemExit
    wait(10)
