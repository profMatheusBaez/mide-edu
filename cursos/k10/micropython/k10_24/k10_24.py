from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

while True:
    screen.clear()
    screen.draw_text(text="GESTO", x=10, y=20, font_size=28, color=0xFFFFFF)
    screen.draw_text(text="incline a placa", x=10, y=70, font_size=18, color=0x00CCBB)
    screen.show_draw()
    time.sleep(0.15)
