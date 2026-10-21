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
  String estado = "OK";
  uint32_t cor = 0x00FF00;
  if (temp < 20) { estado = "FRIO"; cor = 0x0000FF; }
  if (temp > 28) { estado = "QUENTE"; cor = 0xFF0000; }
  k10.rgb->write(-1, cor);
  k10.canvas->canvasClear();
  k10.canvas->canvasText(estado, 1, cor);
  k10.canvas->canvasText(String(temp, 1), 2, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(1000);
}
