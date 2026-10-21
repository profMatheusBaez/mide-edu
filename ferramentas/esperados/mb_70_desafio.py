from microbit import *
import music
import sonar

speaker.off()
distancia = 0

while True:
    distancia = sonar.distancia_cm(pin16, pin1)
    if distancia > 0 and distancia < 30:
        music.pitch(880, 125)
        sleep(distancia * 10)
    sleep(50)
