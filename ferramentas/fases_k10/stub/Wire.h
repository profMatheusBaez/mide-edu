// Stub do Wire (I2C) do Arduino (só para conferir a sintaxe do C++ gerado).
#pragma once
#include <stdint.h>
struct WireStub {
  void beginTransmission(int) {}
  void write(int) {}
  int endTransmission(bool = true) { return 0; }
  int requestFrom(int, int) { return 0; }
  int available() { return 0; }
  int read() { return 0; }
};
extern WireStub Wire;
