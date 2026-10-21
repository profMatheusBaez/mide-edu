from microbit import *
import random

def mapear(valor, de_min, de_max, para_min, para_max):
    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)

x = 2
fx = random.randint(0, 4)
fy = 0
pontos = 0

while True:
    if button_a.was_pressed():
        display.scroll(pontos)
    x = max(0, min(4, mapear(accelerometer.get_x(), -1000, 1000, 0, 4)))
    display.clear()
    display.set_pixel(x, 4, 9)
    display.set_pixel(fx, fy, 9)
    sleep(250)
    fy += 1
    if fy > 4:
        if fx == x:
            pontos += 1
        fy = 0
        fx = random.randint(0, 4)
