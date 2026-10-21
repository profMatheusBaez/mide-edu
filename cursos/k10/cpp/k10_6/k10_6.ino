#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.rgb->write(-1, 0x000000);
  k10.rgb->brightness(4);
  k10.rgb->write(0, 0x00FF00);
}

void loop() {

}
