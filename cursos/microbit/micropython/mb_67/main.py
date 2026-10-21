from microbit import *
import sonar

while True:
    print("dist:", sonar.distancia_cm(pin16, pin1))
    sleep(200)
