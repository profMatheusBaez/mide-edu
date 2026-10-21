from microbit import *
import radio

radio.on()
radio.config(group=1)

while True:
    if button_a.was_pressed():
        radio.send("oi")
    pacote = radio.receive()
    if pacote:
        display.scroll(pacote)
    sleep(20)
