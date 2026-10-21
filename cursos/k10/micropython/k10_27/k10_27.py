from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

mic = 120
while True:
    largura = min(220, int(mic / 2))
    screen.clear()
    screen.draw_text(text="MIC", x=10, y=20, font_size=24, color=0xFFCC00)
    screen.fill_rect(x=10, y=90, w=largura, h=22, color=0xFFCC00)
    screen.show_draw()
    time.sleep(0.08)
