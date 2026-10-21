from microbit import *
import radio
import random

resultado = 0
radio.on()
radio.config(group=7)
minha = 0
dele = 0
vitorias = 0

while True:
    if accelerometer.was_gesture("shake"):
        minha = random.randint(1, 3)
        radio.send(str(minha))
        if minha == 1:
            display.show(Image.DIAMOND)
        elif minha == 2:
            display.show(Image.SQUARE)
        else:
            display.show(Image.SCISSORS)
    pacote = radio.receive()
    if pacote and pacote.lstrip("-").isdigit():
        dele = int(pacote)
        sleep(1500)
        resultado = ((minha - dele) + 3) % 3
        if resultado == 0:
            display.scroll("=")
        elif resultado == 1:
            vitorias += 1
            display.show(Image.HAPPY)
        else:
            display.show(Image.SAD)
    if button_a.was_pressed():
        display.scroll(vitorias)
