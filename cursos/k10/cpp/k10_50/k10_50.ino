#include "unihiker_k10.h"
#include <WiFi.h>

UNIHIKER_K10 k10;


void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  WiFi.mode(WIFI_STA);
}

void loop() {
  int luz = k10.readALS();
  k10.canvas->canvasClear();
  k10.canvas->canvasText("IOT K10", 1, 0x00CCBB);
  k10.canvas->canvasText(WiFi.status() == WL_CONNECTED ? "ONLINE" : "SEM REDE", 2, WiFi.status() == WL_CONNECTED ? 0x00FF00 : 0xFF0000);
  k10.canvas->canvasText("LUZ " + String(luz), 3, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(1000);
}
