# Gerado pelo Modo Blocos — MIDE EDU (LEGO Technic / Pybricks)
from pybricks.pupdevices import Motor
from pybricks.parameters import Port, Direction
from pybricks.tools import wait

motor_b = Motor(Port.B, Direction.COUNTERCLOCKWISE)
motor_a = Motor(Port.A)
motor_c = Motor(Port.C)
motor_d = Motor(Port.D)

motor_b.run(200)
motor_a.run_angle(360, 360)
motor_a.run_target(180, -90)
motor_c.run_time(720, 1500)
motor_d.dc(-50)
motor_a.stop()
motor_b.brake()
motor_c.hold()
motor_a.reset_angle(0)

while True:
    print(motor_a.angle())
    print(motor_a.speed())
    if motor_a.stalled():
        motor_a.stop()
    wait(250)
