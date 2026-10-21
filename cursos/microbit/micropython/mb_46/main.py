from microbit import *
import random

escolha = 0

while True:
    if accelerometer.was_gesture("shake"):
        escolha = random.randint(1, 3)
        if escolha == 1:
            display.show(Image.DIAMOND)
        elif escolha == 2:
            display.show(Image.SQUARE)
        else:
            display.show(Image.SCISSORS)
    sleep(20)
