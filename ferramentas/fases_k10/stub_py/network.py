# Stub do network do MicroPython (Wi-Fi do ESP32).
STA_IF = 0
class WLAN:
    def __init__(self, modo): pass
    def active(self, sim=None): return True
    def scan(self): return [(b'rede-1', b'', 1, -40, 3, False), (b'rede-2', b'', 6, -70, 3, False)]
    def connect(self, ssid, senha): pass
    def disconnect(self): pass
    def isconnected(self): return False
    def ifconfig(self): return ('192.168.0.10', '255.255.255.0', '192.168.0.1', '8.8.8.8')
