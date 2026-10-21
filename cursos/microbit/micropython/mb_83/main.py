from microbit import *
import sete_seg

i = 0
display.off()

while True:
    for i in range(10):
        sete_seg.mostrar(i)
        sleep(1000)
