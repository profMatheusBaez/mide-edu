from unihiker_k10 import rgb
import time

rgb.brightness(4)
while True:
    luz = 520
    rgb.clear()
    if luz > 150:
        rgb.write(num=0, color=0x00FF00)
    if luz > 450:
        rgb.write(num=1, color=0x00FF00)
    if luz > 800:
        rgb.write(num=2, color=0x00FF00)
    time.sleep(0.15)
