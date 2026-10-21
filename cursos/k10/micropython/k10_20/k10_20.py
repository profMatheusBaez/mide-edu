from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import rgb
import time

rgb.brightness(4)
temperatura = 25.0
umidade = 60.0
while True:
    cor = 0x00FF00
    if temperatura > 28 or umidade > 75:
        cor = 0xFF0000
    rgb.write(color=cor)
    screen.clear()
    screen.draw_text(text="ESTACAO K10", x=10, y=20, font_size=22, color=0xFFFFFF)
    screen.draw_text(text="T " + str(temperatura) + " C", x=10, y=60, font_size=20, color=0xFFCC00)
    screen.draw_text(text="U " + str(umidade) + " %", x=10, y=95, font_size=20, color=0x00CCBB)
    screen.show_draw()
    time.sleep(1)
