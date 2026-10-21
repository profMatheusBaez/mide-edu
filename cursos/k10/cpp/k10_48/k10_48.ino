#include "unihiker_k10.h"
#include <WiFi.h>

UNIHIKER_K10 k10;


void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  const char* ssid = "SUA_REDE";
  const char* senha = "SUA_SENHA";
  WiFi.begin(ssid, senha);
}

void loop() {
  k10.canvas->canvasClear();
  if (WiFi.status() == WL_CONNECTED) {
    k10.canvas->canvasText("ONLINE", 1, 0x00FF00);
    k10.canvas->canvasText(WiFi.localIP().toString(), 2, 0xFFFFFF);
  } else {
    k10.canvas->canvasText("OFFLINE", 1, 0xFF0000);
  }
  k10.canvas->updateCanvas();
  delay(1000);
}
