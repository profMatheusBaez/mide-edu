#include "unihiker_k10.h"


UNIHIKER_K10 k10;
DFRobot_AHT20 clima;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  while (clima.begin() != 0) {
    delay(1000);
  }
}

void loop() {
  clima.startMeasurementReady(true);
  float umid = clima.getHumidity_RH();
  int largura = constrain((int)(umid * 2), 0, 200);
  k10.canvas->canvasClear();
  k10.canvas->canvasText("UMIDADE", 1, 0x00CCBB);
  k10.canvas->canvasRectangle(10, 90, largura, 24, 0x00CCBB, 0x00CCBB, true);
  k10.canvas->canvasText(String(umid, 1), 3, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(1000);
}
