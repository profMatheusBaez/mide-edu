from unihiker_k10 import rgb
import time

rgb.brightness(4)
while True:
    luz = 520
    if luz < 300:
        rgb.write(color=0xFFCC00)
    else:
        rgb.clear()
    time.sleep(0.1)
