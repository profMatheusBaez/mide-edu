#include "unihiker_k10.h"
#include <WiFi.h>

UNIHIKER_K10 k10;


void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
}

void loop() {
  int redes = WiFi.scanNetworks();
  k10.canvas->canvasClear();
  k10.canvas->canvasText("REDES WIFI", 1, 0x00CCBB);
  k10.canvas->canvasText(String(redes), 2, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(4000);
}
