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
  if (k10.buttonB->isPressed()) {
    k10.canvas->canvasText("tocando", 1, 0x00CCBB);
    k10.canvas->updateCanvas();
    music.playTFCardAudio("S:/sound.wav");
  }
  delay(100);
}
