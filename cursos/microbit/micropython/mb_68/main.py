from microbit import *
import sonar

distancia = 0

while True:
    distancia = sonar.distancia_cm(pin16, pin1)
    if distancia > 0 and distancia < 10:
        display.show(Image.ANGRY)
    else:
        display.show(Image.HAPPY)
    sleep(100)
