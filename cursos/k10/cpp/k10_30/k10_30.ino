#include "unihiker_k10.h"


UNIHIKER_K10 k10;
Music music;

void setup() {
  k10.begin();
  k10.rgb->brightness(4);
}

void loop() {
  uint64_t mic = k10.readMICData();
  if (mic > 4000) {
    k10.rgb->write(-1, 0xFF0000);
    music.playTone(880, 2000);
  } else {
    k10.rgb->write(-1, 0x000000);
  }
  delay(120);
}
