from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

while True:
    luz = 520
    print("luz,", luz)
    screen.clear()
    screen.draw_text(text="REGISTRO", x=10, y=20, font_size=24, color=0x00FF00)
    screen.draw_text(text=str(luz), x=10, y=60, font_size=24, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(1)
