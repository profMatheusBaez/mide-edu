from microbit import *
import radio

radio.on()
radio.config(group=1)

while True:
    pacote = radio.receive()
    if pacote and pacote.lstrip("-").isdigit():
        display.scroll(int(pacote))
    sleep(20)
