#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  Serial.begin(115200);
}

void loop() {
  int luz = k10.readALS();
  String mensagem = "luz=" + String(luz);
  Serial.println(mensagem);
  delay(1000);
}
