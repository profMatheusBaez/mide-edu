#include "unihiker_k10.h"


UNIHIKER_K10 k10;
Music music;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.initSDFile();
}

void loop() {
  if (k10.buttonA->isPressed()) {
    k10.canvas->canvasText("gravando", 1, 0xFFCC00);
    k10.canvas->updateCanvas();
    music.recordSaveToTFCard("S:/sound.wav", 3);
    k10.canvas->canvasText("salvo", 1, 0x00FF00);
    k10.canvas->updateCanvas();
  }
  delay(100);
}
