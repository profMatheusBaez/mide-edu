from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import time

x = 120
y = 120
while True:
    screen.clear()
    screen.fill_circle(x=x, y=y, r=10, color=0x00FF00)
    screen.show_draw()
    time.sleep(0.06)
