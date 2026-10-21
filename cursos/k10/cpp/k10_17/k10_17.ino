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
  float temp = clima.getTemperature_C();
  k10.canvas->canvasClear();
  k10.canvas->canvasText("TEMP C", 1, 0xFFCC00);
  k10.canvas->canvasText(String(temp, 1), 2, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(1000);
}
