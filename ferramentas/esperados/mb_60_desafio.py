from microbit import *
import random

inicio = 0
reacao = 0
display.off()
pin8.set_pull(pin8.PULL_UP)

while True:
    if button_a.was_pressed():
        pin15.write_digital(0)
        sleep(random.randint(2000, 5000))
        pin15.write_digital(1)
        inicio = running_time()
        while pin8.read_digital() == 1:
            sleep(1)
        reacao = running_time() - inicio
        pin15.write_digital(0)
        display.on()
        display.scroll(reacao)
        display.off()
