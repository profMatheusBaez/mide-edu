from microbit import *

maxima = 0
minima = 100

while True:
    if temperature() > maxima:
        maxima = temperature()
    if temperature() < minima:
        minima = temperature()
    sleep(500)
    if button_a.was_pressed():
        display.scroll(maxima)
    if button_b.was_pressed():
        display.scroll(minima)
