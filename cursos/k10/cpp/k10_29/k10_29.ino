#include "unihiker_k10.h"


UNIHIKER_K10 k10;
Music music;

void setup() {
  k10.begin();

}

void loop() {
  if (k10.buttonA->isPressed()) {
    music.playTone(262, 4000);
  }
  if (k10.buttonB->isPressed()) {
    music.playTone(392, 4000);
  }
  delay(80);
}
