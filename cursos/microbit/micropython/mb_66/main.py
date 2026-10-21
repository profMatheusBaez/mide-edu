from microbit import *
import sonar

while True:
    display.scroll(sonar.distancia_cm(pin16, pin1))
    sleep(500)
