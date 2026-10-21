from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
screen.draw_line(x0=10, y0=20, x1=220, y1=20, color=0xFFFFFF)
screen.draw_circle(x=80, y=120, r=30, color=0x00CCBB)
screen.draw_rect(x=130, y=90, w=70, h=60, color=0xFFCC00)
screen.show_draw()
