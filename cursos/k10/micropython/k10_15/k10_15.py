from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import rgb
import time

rgb.brightness(4)
while True:
    luz = 520
    screen.clear()
    if luz < 250:
        rgb.write(color=0xFF0000)
        texto = "SOMBRA"
    else:
        rgb.write(color=0x00FF00)
        texto = "CLARO"
    screen.draw_text(text=texto, x=10, y=20, font_size=28, color=0xFFFFFF)
    screen.draw_text(text=str(luz), x=10, y=70, font_size=24, color=0x00CCBB)
    screen.show_draw()
    time.sleep(0.2)
