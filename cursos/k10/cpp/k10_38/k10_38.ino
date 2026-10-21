#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.initBgCamerImage();
  k10.setBgCamerImage(true);
  k10.creatCanvas();
  k10.initSDFile();
}

void loop() {
  if (k10.buttonA->isPressed()) {
    k10.photoSaveToTFCard("S:/photo.bmp");
    k10.canvas->canvasText("foto salva", 1, 0x00FF00);
    k10.canvas->updateCanvas();
    delay(1000);
  }
  delay(50);
}
