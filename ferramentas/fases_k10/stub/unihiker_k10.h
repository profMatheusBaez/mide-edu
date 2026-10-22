// Stub mínimo da biblioteca da UNIHIKER K10 + Arduino, só para conferir com g++ -fsyntax-only
// que o C++ gerado pelos blocos usa a API com a quantidade e o tipo certos de argumentos.
// (Assinaturas conferidas nas 60 atividades da trilha, que rodam na placa.)
#pragma once
#include <stdint.h>
#include <stddef.h>
#include <math.h>

class String {
 public:
  String() {}
  String(const char *) {}
  String(int) {}
  String(long) {}
  String(unsigned long) {}
  String(unsigned long long) {}
  String(double, int = 2) {}
  String(float, int) {}
  String operator+(const String &) const { return *this; }
  String &operator+=(const String &) { return *this; }
  bool operator==(const String &) const { return true; }
  const char *c_str() const { return ""; }
};
inline String operator+(const char *, const String &s) { return s; }

struct SerialStub {
  void begin(long) {}
  template <class T> void print(T) {}
  template <class T> void println(T) {}
  void println() {}
};
extern SerialStub Serial;
void delay(unsigned long);
void delayMicroseconds(unsigned int);
unsigned long millis();
long random(long, long);
long map(long, long, long, long, long);
template <class T, class A, class B> T constrain(T x, A a, B b) { return x < a ? a : (x > b ? b : x); }

enum Gesture { ScreenUp, ScreenDown, TiltLeft, TiltRight, TiltForward, TiltBack, Shake };

struct Canvas {
  void canvasText(const String &, int, uint32_t) {}
  void canvasText(const char *, int, uint32_t) {}
  void updateCanvas() {}
  void canvasClear() {}
  void canvasPoint(int, int, uint32_t) {}
  void canvasLine(int, int, int, int, uint32_t) {}
  void canvasCircle(int, int, int, uint32_t, uint32_t, bool) {}
  void canvasRectangle(int, int, int, int, uint32_t, uint32_t, bool) {}
  void canvasDrawImage(int, int, const String &) {}
};
struct RGB { void write(int, uint32_t) {} void brightness(int) {} };
struct Button { bool isPressed() { return false; } };

class UNIHIKER_K10 {
 public:
  Canvas *canvas;
  RGB *rgb;
  Button *buttonA, *buttonB;
  void begin() {}
  void initScreen(int) {}
  void creatCanvas() {}
  void setScreenBackground(uint32_t) {}
  void initBgCamerImage() {}
  void setBgCamerImage(bool) {}
  void initSDFile() {}
  void photoSaveToTFCard(const String &) {}
  void canvasDrawCode(const String &) {}
  int readALS() { return 0; }
  int getAccelerometerX() { return 0; }
  int getAccelerometerY() { return 0; }
  int getAccelerometerZ() { return 0; }
  int getStrength() { return 0; }
  bool isGesture(Gesture) { return false; }
  uint64_t readMICData() { return 0; }
};

class DFRobot_AHT20 {
 public:
  int begin() { return 0; }
  bool startMeasurementReady(bool) { return true; }
  float getTemperature_C() { return 0; }
  float getHumidity_RH() { return 0; }
};

class Music {
 public:
  void playTone(int, int) {}
  void recordSaveToTFCard(const String &, int) {}
  void playTFCardAudio(const String &) {}
};
