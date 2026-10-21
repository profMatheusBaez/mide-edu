#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  Serial.begin(115200);
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.initSDFile();
}

void loop() {
  int luz = k10.readALS();
  Serial.print("luz,");
  Serial.println(luz);
  k10.canvas->canvasClear();
  k10.canvas->canvasText("REGISTRO", 1, 0x00FF00);
  k10.canvas->canvasText(String(luz), 2, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(1000);
}
