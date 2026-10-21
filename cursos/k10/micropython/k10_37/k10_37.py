from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
screen.draw_rect(x=30, y=50, w=180, h=180, color=0xFFCC00)
screen.draw_text(text="enquadre", x=10, y=20, font_size=22, color=0xFFFFFF)
screen.show_draw()
