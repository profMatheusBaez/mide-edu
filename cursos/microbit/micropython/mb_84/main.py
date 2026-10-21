from microbit import *
import sete_seg

display.off()
numero = 0
sete_seg.mostrar(0)

while True:
    if button_a.was_pressed():
        numero += 1
        if numero > 9:
            numero = 0
        sete_seg.mostrar(numero)
    if button_b.was_pressed():
        numero = 0
        sete_seg.mostrar(0)
    sleep(20)
