from microbit import *

def mapear(valor, de_min, de_max, para_min, para_max):
    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)

pin1.set_analog_period(20)

while True:
    pin1.write_analog(int(26 + (mapear(pin2.read_analog(), 0, 1023, 0, 180)) * 102 / 180))
    sleep(20)
