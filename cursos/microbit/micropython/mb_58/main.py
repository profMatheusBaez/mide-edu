from microbit import *

display.off()
pin8.set_pull(pin8.PULL_UP)
ligado = 0

while True:
    if pin8.read_digital() == 0:
        ligado = 1 - ligado
        pin13.write_digital(ligado)
        while pin8.read_digital() == 0:
            sleep(10)
