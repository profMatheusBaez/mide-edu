from microbit import *

passos = 0

while True:
    if accelerometer.was_gesture("shake"):
        passos += 1
        display.scroll(passos)
    if button_a.was_pressed():
        passos = 0
        display.scroll(passos)
    sleep(20)
