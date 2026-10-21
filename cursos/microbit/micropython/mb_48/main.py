from microbit import *
import random

x = 2
fx = random.randint(0, 4)
fy = 0
pontos = 0

while True:
    if button_a.was_pressed():
        if x > 0:
            x += -1
    if button_b.was_pressed():
        if x < 4:
            x += 1
    display.clear()
    display.set_pixel(x, 4, 9)
    display.set_pixel(fx, fy, 9)
    sleep(300)
    fy += 1
    if fy > 4:
        if fx == x:
            display.show(Image.SKULL)
            sleep(1500)
            display.scroll(pontos)
            pontos = 0
        else:
            pontos += 1
        fy = 0
        fx = random.randint(0, 4)
