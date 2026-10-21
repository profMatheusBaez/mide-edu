from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

passos = 0
while True:
    screen.clear()
    screen.draw_text(text="PASSOS", x=10, y=20, font_size=24, color=0x00CCBB)
    screen.draw_text(text=str(passos), x=10, y=65, font_size=36, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(0.2)
