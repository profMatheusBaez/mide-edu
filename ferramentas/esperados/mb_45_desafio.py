from microbit import *
import radio

radio.on()
radio.config(group=1)

while True:
    radio.send(str(temperature()))
    sleep(2000)
    pacote = radio.receive()
    if pacote and pacote.lstrip("-").isdigit():
        display.scroll(int(pacote))
