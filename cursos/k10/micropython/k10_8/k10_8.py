from unihiker_k10 import button, rgb
import time

a = button(button.a)
rgb.clear()
rgb.brightness(4)
while True:
    if a.status():
        rgb.write(num=0, color=0x00FF00)
    else:
        rgb.write(num=0, color=0x000000)
    time.sleep(0.02)
