# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.pupdevices import Motor, Remote
from pybricks.parameters import Port, Color, Button
from pybricks.tools import wait

remote = Remote()
motor_a = Motor(Port.A)
motor_b = Motor(Port.B)

remote.light.on(Color.GREEN)

while True:
    if Button.RIGHT_PLUS in remote.buttons.pressed():
        motor_a.dc(60)
    else:
        if Button.RIGHT_MINUS in remote.buttons.pressed():
            motor_a.dc(-60)
        else:
            motor_a.brake()
    if Button.LEFT_PLUS in remote.buttons.pressed():
        motor_b.dc(60)
    else:
        if Button.LEFT_MINUS in remote.buttons.pressed():
            motor_b.dc(-60)
        else:
            motor_b.brake()
    wait(10)
