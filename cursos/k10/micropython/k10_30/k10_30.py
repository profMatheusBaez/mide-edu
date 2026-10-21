from unihiker_k10 import rgb
import time

rgb.brightness(4)
mic = 120
while True:
    if mic > 4000:
        rgb.write(color=0xFF0000)
        print("ALARME")
    else:
        rgb.clear()
    time.sleep(0.12)
