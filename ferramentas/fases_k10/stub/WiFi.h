// Stub do WiFi do ESP32 (só para conferir a sintaxe do C++ gerado).
#pragma once
#include "unihiker_k10.h"
enum { WIFI_STA = 1, WL_CONNECTED = 3 };
struct IPStub { String toString() { return String(); } };
struct WiFiStub {
  void mode(int) {}
  void disconnect() {}
  void begin(const char *, const char *) {}
  int status() { return 0; }
  int scanNetworks() { return 0; }
  String SSID(int) { return String(); }
  IPStub localIP() { return IPStub(); }
};
extern WiFiStub WiFi;
