from microbit import *

def mapear(valor, de_min, de_max, para_min, para_max):
    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)

coluna = 2

while True:
    coluna = max(0, min(4, mapear(accelerometer.get_x(), -1000, 1000, 0, 4)))
    display.clear()
    display.set_pixel(coluna, 2, 9)
    sleep(50)
