from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
screen.fill_circle(x=40, y=40, r=3, color=0xFFFFFF)
screen.fill_circle(x=120, y=90, r=3, color=0xFFCC00)
screen.fill_circle(x=200, y=160, r=3, color=0x00CCBB)
screen.show_draw()
