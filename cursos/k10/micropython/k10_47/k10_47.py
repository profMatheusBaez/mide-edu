import network
import time

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
while True:
    for rede in wifi.scan():
        print(rede[0])
    print("---")
    time.sleep(5)
