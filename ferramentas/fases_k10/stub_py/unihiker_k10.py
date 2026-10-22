# Stub da biblioteca MicroPython da UNIHIKER K10 (API do firmware 0.9.2, como na
# documentação da UNIHIKER), só para rodar no PC o MicroPython gerado pelos blocos e
# conferir nomes e argumentos. Não desenha nada.
class _Tela:
    def init(self, dir=2): pass
    def show_bg(self, color=0): pass
    def draw_text(self, text="", x=0, y=0, font_size=16, color=0, line=None): assert isinstance(text, str)
    def show_draw(self): pass
    def clear(self): pass
    def set_width(self, width=1): pass
    def draw_point(self, x=0, y=0, color=0): pass
    def draw_line(self, x0=0, y0=0, x1=0, y1=0, color=0): pass
    def draw_circle(self, x=0, y=0, r=0, bcolor=0, fcolor=None): pass
    def draw_rect(self, x=0, y=0, w=0, h=0, bcolor=0, fcolor=None): pass
    def draw_qr_code(self, text="", x=0, y=0, size=1): pass
    def show_camera(self, camera): pass
screen = _Tela()

class _RGB:
    def write(self, num=-1, color=None, R=None, G=None, B=None): pass
    def brightness(self, valor): assert 0 <= valor <= 9
    def clear(self): pass
rgb = _RGB()

class button:
    a = 'a'
    b = 'b'
    def __init__(self, qual): self.qual = qual
    def status(self): return 0

class _Luz:
    def read(self): return 520
light = _Luz()

class _Acel:
    def read_x(self): return 0
    def read_y(self): return 0
    def read_z(self): return 1000
acce = _Acel()

class _Clima:
    def read_temp(self): return 25.0
    def read_temp_f(self): return 77.0
    def read_humi(self): return 60.0
temp_humi = _Clima()

class _Mic:
    def recode_tf(self, name="", time=5): pass
    def recode_sys(self, name="", time=5): pass
mic = _Mic()

class _Alto:
    def play_tf_music(self, name): pass
    def play_sys_music(self, name): pass
speaker = _Alto()
