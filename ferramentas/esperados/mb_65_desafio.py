from microbit import *

def mapear(valor, de_min, de_max, para_min, para_max):
    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)

display.off()
escolha = 0

while True:
    escolha = max(0, min(2, mapear(pin2.read_analog(), 0, 1023, 0, 2)))
    pin13.write_digital(0)
    pin14.write_digital(0)
    pin15.write_digital(0)
    if escolha == 0:
        pin13.write_digital(1)
    elif escolha == 1:
        pin14.write_digital(1)
    else:
        pin15.write_digital(1)
    sleep(50)
