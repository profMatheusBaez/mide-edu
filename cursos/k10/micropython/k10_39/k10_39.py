from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import button
import time

b = button(button.b)
while True:
    if b.status():
        print("mostrar foto do microSD")
    time.sleep(0.05)
