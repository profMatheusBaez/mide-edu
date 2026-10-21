from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

temperatura = 25.0
while True:
    screen.clear()
    screen.draw_text(text="TEMP C", x=10, y=20, font_size=24, color=0xFFCC00)
    screen.draw_text(text=str(temperatura), x=10, y=60, font_size=32, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(1)
