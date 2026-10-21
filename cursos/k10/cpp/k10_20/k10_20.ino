#include "unihiker_k10.h"


UNIHIKER_K10 k10;
DFRobot_AHT20 clima;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.rgb->brightness(4);
  while (clima.begin() != 0) {
    delay(1000);
  }
}

void loop() {
  clima.startMeasurementReady(true);
  float temp = clima.getTemperature_C();
  float umid = clima.getHumidity_RH();
  uint32_t cor = (temp > 28 || umid > 75) ? 0xFF0000 : 0x00FF00;
  k10.rgb->write(-1, cor);
  k10.canvas->canvasClear();
  k10.canvas->canvasText("ESTACAO K10", 1, 0xFFFFFF);
  k10.canvas->canvasText("T " + String(temp, 1) + " C", 2, 0xFFCC00);
  k10.canvas->canvasText("U " + String(umid, 1) + " %", 3, 0x00CCBB);
  k10.canvas->updateCanvas();
  delay(1000);
}
