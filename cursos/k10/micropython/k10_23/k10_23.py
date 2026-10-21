from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import rgb
import time

rgb.brightness(4)
forca = 0
while True:
    screen.clear()
    if forca > 1000:
        rgb.write(color=0xFF0000)
        texto = "SHAKE"
    else:
        rgb.clear()
        texto = "calmo"
    screen.draw_text(text=texto, x=10, y=20, font_size=28, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(0.1)
