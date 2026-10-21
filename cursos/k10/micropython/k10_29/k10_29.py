from unihiker_k10 import button
import time

a = button(button.a)
b = button(button.b)
while True:
    if a.status():
        print("NOTA 262")
    if b.status():
        print("NOTA 392")
    time.sleep(0.08)
