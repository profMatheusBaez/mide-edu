from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import button
import time

x = 100
a = button(button.a)
b = button(button.b)
while True:
    if a.status():
        x -= 5
    if b.status():
        x += 5
    x = max(0, min(200, x))
    screen.clear()
    screen.fill_rect(x=x, y=130, w=35, h=35, color=0x00CCBB)
    screen.show_draw()
    time.sleep(0.04)
