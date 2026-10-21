# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.pupdevices import Motor
from pybricks.parameters import Port
from pybricks.tools import wait

motor_a = Motor(Port.A)

motor_a.reset_angle(0)
for _ in range(3):
    print("indo")
    motor_a.run_angle(200, 180)
    wait(500)
    print("voltando")
    motor_a.run_angle(200, -180)
    wait(500)
print(motor_a.angle())
