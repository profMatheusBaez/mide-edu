from microbit import *
import random
import sete_seg

dado = 0
display.off()
sete_seg.apagar()

while True:
    if accelerometer.was_gesture("shake"):
        dado = random.randint(1, 6)
        sete_seg.mostrar(dado)
    sleep(20)
