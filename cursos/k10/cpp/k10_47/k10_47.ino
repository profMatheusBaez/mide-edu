#include "unihiker_k10.h"
#include <WiFi.h>

UNIHIKER_K10 k10;


void setup() {
  k10.begin();
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
}

void loop() {
  int redes = WiFi.scanNetworks();
  for (int i = 0; i < redes; i++) {
    Serial.println(WiFi.SSID(i));
  }
  Serial.println("---");
  delay(5000);
}
