from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import rgb
import time

rgb.brightness(4)
temperatura = 25.0
while True:
    estado = "OK"
    cor = 0x00FF00
    if temperatura < 20:
        estado = "FRIO"
        cor = 0x0000FF
    if temperatura > 28:
        estado = "QUENTE"
        cor = 0xFF0000
    rgb.write(color=cor)
    screen.clear()
    screen.draw_text(text=estado, x=10, y=20, font_size=28, color=cor)
    screen.draw_text(text=str(temperatura), x=10, y=70, font_size=24, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(1)
