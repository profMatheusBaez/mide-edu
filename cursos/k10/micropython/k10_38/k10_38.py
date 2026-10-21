from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import button
import time

a = button(button.a)
while True:
    if a.status():
        print("salvar foto no microSD")
    time.sleep(0.05)
