from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

x = 0
while True:
    screen.clear()
    screen.fill_circle(x=x, y=120, r=12, color=0x00FF00)
    screen.show_draw()
    x = x + 8
    if x > 240:
        x = 0
    time.sleep(0.05)
