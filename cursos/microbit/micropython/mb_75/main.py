from microbit import *
import music
import sonar

def mapear(valor, de_min, de_max, para_min, para_max):
    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)

speaker.off()
limite = 20
distancia = 0

while True:
    limite = mapear(pin2.read_analog(), 0, 1023, 5, 50)
    distancia = sonar.distancia_cm(pin16, pin1)
    if distancia > 0 and distancia < limite:
        music.pitch(880, 250)
    sleep(100)
