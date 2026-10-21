from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

umidade = 60
while True:
    largura = min(200, int(umidade * 2))
    screen.clear()
    screen.draw_text(text="UMIDADE", x=10, y=20, font_size=24, color=0x00CCBB)
    screen.fill_rect(x=10, y=90, w=largura, h=24, color=0x00CCBB)
    screen.draw_text(text=str(umidade), x=10, y=130, font_size=20, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(1)
