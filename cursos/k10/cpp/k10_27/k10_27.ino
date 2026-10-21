#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  uint64_t mic = k10.readMICData();
  int largura = constrain((int)(mic / 40), 0, 220);
  k10.canvas->canvasClear();
  k10.canvas->canvasText("MIC", 1, 0xFFCC00);
  k10.canvas->canvasRectangle(10, 90, largura, 22, 0xFFCC00, 0xFFCC00, true);
  k10.canvas->updateCanvas();
  delay(80);
}
