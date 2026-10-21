from microbit import *
import random

inicio = 0
reacao = 0

while True:
    if button_a.was_pressed():
        display.clear()
        sleep(random.randint(2000, 5000))
        display.show(Image.SQUARE)
        inicio = running_time()
        while not button_b.is_pressed():
            sleep(1)
        reacao = running_time() - inicio
        display.scroll(reacao)
