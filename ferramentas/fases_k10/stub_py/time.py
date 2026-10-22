# Stub de time: depois de algumas esperas o programa termina (o "while True" não roda para sempre).
_n = [0]
def sleep(s):
    assert s >= 0
    _n[0] += 1
    if _n[0] > 40:
        raise SystemExit('fim')
def sleep_ms(ms): sleep(ms / 1000)
