#include "unihiker_k10.h"


UNIHIKER_K10 k10;
Music music;

void setup() {
  k10.begin();

}

void loop() {
  music.playTone(440, 4000);
  delay(1000);
}
