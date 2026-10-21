#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  Serial.begin(115200);
}

void loop() {
  uint64_t mic = k10.readMICData();
  Serial.print("MIC:");
  Serial.println((unsigned long)mic);
  delay(100);
}
