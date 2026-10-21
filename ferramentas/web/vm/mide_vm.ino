/* ============================================================
 * MIDE VM — intérprete de bytecode para o Arduino Uno
 * ------------------------------------------------------------
 * A versão web da MIDE EDU não tem o compilador do Arduino. Ela
 * traduz o C++ do aluno (o subconjunto usado no curso) para um
 * bytecode simples, grava ESTE firmware + o bytecode na placa, e
 * este programa executa o bytecode.
 *
 * O bytecode fica na memória flash a partir de PROG_ADDR.
 * Cabeçalho (16 bytes):
 *   0  'M' 'V'          assinatura
 *   2  versao (u8)      = VM_VERSAO
 *   3  reservado
 *   4  tamanho (u16)    bytes do programa, contando o cabeçalho
 *   6  init  (u16)      endereço da inicialização das globais
 *   8  setup (u16)      endereço do setup()
 *  10  loop  (u16)      endereço do loop()
 *  12  globais (u16)    quantas células de 32 bits as globais usam
 *  14  soma (u16)       soma simples dos bytes 16..tamanho-1
 * ============================================================ */
#include <Arduino.h>
#include <avr/pgmspace.h>
#include <new.h>
#include <Wire.h>
#include <Servo.h>
#include <LiquidCrystal_I2C.h>

#define PROG_ADDR   0x4000UL
#define VM_VERSAO   1
#define MEMCELLS    224          // globais + pilha (32 bits cada) = 896 bytes
#define MAX_CHAMADAS 20
#define MAX_SERVOS  4

enum {
  OP_HALT = 0x00, OP_PUSHB, OP_PUSHW, OP_PUSHL, OP_POP, OP_DUP,
  OP_LDG, OP_STG, OP_LDL, OP_STL, OP_LDGA, OP_STGA, OP_LDLA, OP_STLA,
  OP_ADD = 0x10, OP_SUB, OP_MUL, OP_DIV, OP_MOD, OP_NEG, OP_AND, OP_OR,
  OP_XOR, OP_NOT, OP_SHL, OP_SHR, OP_LNOT, OP_EQ, OP_NE, OP_LT,
  OP_LE = 0x20, OP_GT, OP_GE, OP_SAR,
  OP_C8 = 0x24, OP_CU8, OP_C16, OP_CU16, OP_TOBOOL,
  OP_JMP = 0x30, OP_JZ, OP_JNZ, OP_CALL, OP_ENTER, OP_RET, OP_RETV,
  OP_SYS = 0x40, OP_PRINTS, OP_PRINTI, OP_PRINTNL, OP_LINE, OP_ARRINIT,
  OP_SWAP
};

enum {
  S_PINMODE = 1, S_DWRITE, S_DREAD, S_AREAD, S_AWRITE, S_DELAY, S_DELAYUS,
  S_MILLIS, S_MICROS, S_PULSEIN, S_PULSEIN3, S_TONE, S_TONE3, S_NOTONE,
  S_MAP, S_CONSTRAIN, S_ABS, S_MIN, S_MAX, S_RANDOM1, S_RANDOM2, S_RANDSEED,
  S_SBEGIN, S_SAVAIL, S_SREAD, S_SVATTACH, S_SVWRITE, S_SVREAD, S_SVDETACH,
  S_LCDNEW, S_LCDINIT, S_LCDBL, S_LCDNOBL, S_LCDCLEAR, S_LCDCURSOR, S_LCDHOME,
  S_SEND, S_SVATTACH4, S_SPEEK, S_SPARSEINT, S_SFLUSH, S_SVWRITEUS,
  S_LCDDISPLAY, S_LCDNODISPLAY, S_LCDBLINK, S_LCDNOBLINK, S_LCDCURSORON,
  S_LCDCURSOROFF, S_SHIFTOUT, S_SQRT
};

static int32_t mem[MEMCELLS];
static uint16_t sp;              // próxima posição livre da pilha (índice em mem)
static uint16_t fp;              // base do quadro da função atual
static uint16_t pc;              // posição no programa
static uint16_t linha;           // linha do código do aluno (para mensagens de erro)
static uint16_t tamanho, nglobais;
static bool serialLigada = false;

struct Quadro { uint16_t pc, fp; };
static Quadro chamadas[MAX_CHAMADAS];
static uint8_t profundidade;

static Servo servos[MAX_SERVOS];
static uint8_t lcdMem[sizeof(LiquidCrystal_I2C)] __attribute__((aligned(2)));
static LiquidCrystal_I2C *lcd = 0;

static inline uint8_t  lerB(uint16_t a) { return pgm_read_byte(PROG_ADDR + a); }
static inline uint16_t lerW(uint16_t a) { return pgm_read_word(PROG_ADDR + a); }
static inline uint32_t lerL(uint16_t a) { return pgm_read_dword(PROG_ADDR + a); }

/* ---------------- erro: avisa no Serial e pisca o LED 13 ---------------- */
static void erro(const __FlashStringHelper *msg) {
  if (!serialLigada) { Serial.begin(9600); serialLigada = true; }
  for (;;) {
    Serial.print(F("\r\n[MIDE] ERRO na linha "));
    Serial.print(linha);
    Serial.print(F(": "));
    Serial.println(msg);
    pinMode(13, OUTPUT);
    for (uint8_t i = 0; i < 10; i++) { digitalWrite(13, HIGH); delay(100); digitalWrite(13, LOW); delay(100); }
    delay(1000);
  }
}

static inline void empurra(int32_t v) {
  if (sp >= MEMCELLS) erro(F("memoria cheia (variaveis ou chamadas demais)"));
  mem[sp++] = v;
}
static inline int32_t tira() {
  if (sp <= nglobais) erro(F("pilha vazia (erro interno)"));
  return mem[--sp];
}

static void imprimirNumero(Print &p, int32_t v, uint8_t tipo) {
  switch (tipo) {
    case 1: p.write((uint8_t)v); break;           // char
    case 2: p.print((uint32_t)v, HEX); break;
    case 3: p.print((uint32_t)v, BIN); break;
    case 4: p.print((uint32_t)v, OCT); break;
    default: p.print(v); break;
  }
}

static Print &destino(uint8_t flags) {
  if (flags & 2) {
    if (!lcd) erro(F("o LCD nao foi criado"));
    return *lcd;
  }
  return Serial;
}

static LiquidCrystal_I2C &oLcd() {
  if (!lcd) erro(F("o LCD nao foi criado"));
  return *lcd;
}

static Servo &oServo(int32_t i) {
  if (i < 0 || i >= MAX_SERVOS) erro(F("servo invalido"));
  return servos[i];
}

static void sys(uint8_t id) {
  int32_t a, b, c, d, e;
  switch (id) {
    case S_PINMODE:  b = tira(); a = tira(); pinMode(a, b); break;
    case S_DWRITE:   b = tira(); a = tira(); digitalWrite(a, b ? HIGH : LOW); break;
    case S_DREAD:    a = tira(); empurra(digitalRead(a)); break;
    case S_AREAD:    a = tira(); empurra(analogRead(a)); break;
    case S_AWRITE:   b = tira(); a = tira(); analogWrite(a, b); break;
    case S_DELAY:    a = tira(); if (a > 0) delay(a); break;
    case S_DELAYUS:  a = tira(); if (a > 0) delayMicroseconds(a); break;
    case S_MILLIS:   empurra(millis()); break;
    case S_MICROS:   empurra(micros()); break;
    case S_PULSEIN:  b = tira(); a = tira(); empurra(pulseIn(a, b)); break;
    case S_PULSEIN3: c = tira(); b = tira(); a = tira(); empurra(pulseIn(a, b, c)); break;
    case S_TONE:     b = tira(); a = tira(); tone(a, b); break;
    case S_TONE3:    c = tira(); b = tira(); a = tira(); tone(a, b, c); break;
    case S_NOTONE:   a = tira(); noTone(a); break;
    case S_MAP:
      e = tira(); d = tira(); c = tira(); b = tira(); a = tira();
      if (c == b) erro(F("map com faixa de entrada vazia"));
      empurra((a - b) * (e - d) / (c - b) + d); break;
    case S_CONSTRAIN: c = tira(); b = tira(); a = tira(); empurra(a < b ? b : (a > c ? c : a)); break;
    case S_ABS:      a = tira(); empurra(a < 0 ? -a : a); break;
    case S_MIN:      b = tira(); a = tira(); empurra(a < b ? a : b); break;
    case S_MAX:      b = tira(); a = tira(); empurra(a > b ? a : b); break;
    case S_RANDOM1:  a = tira(); empurra(random(a)); break;
    case S_RANDOM2:  b = tira(); a = tira(); empurra(random(a, b)); break;
    case S_RANDSEED: a = tira(); randomSeed(a); break;
    case S_SBEGIN:   a = tira(); Serial.begin(a); serialLigada = true; break;
    case S_SAVAIL:   empurra(Serial.available()); break;
    case S_SREAD:    empurra(Serial.read()); break;
    case S_SPEEK:    empurra(Serial.peek()); break;
    case S_SPARSEINT: empurra(Serial.parseInt()); break;
    case S_SFLUSH:   Serial.flush(); break;
    case S_SEND:     Serial.end(); serialLigada = false; break;
    case S_SVATTACH: b = tira(); a = tira(); oServo(a).attach(b); break;
    case S_SVATTACH4: d = tira(); c = tira(); b = tira(); a = tira(); oServo(a).attach(b, c, d); break;
    case S_SVWRITE:  b = tira(); a = tira(); oServo(a).write(b); break;
    case S_SVWRITEUS: b = tira(); a = tira(); oServo(a).writeMicroseconds(b); break;
    case S_SVREAD:   a = tira(); empurra(oServo(a).read()); break;
    case S_SVDETACH: a = tira(); oServo(a).detach(); break;
    case S_LCDNEW:
      c = tira(); b = tira(); a = tira();
      lcd = new (lcdMem) LiquidCrystal_I2C((uint8_t)a, (uint8_t)b, (uint8_t)c);
      break;
    case S_LCDINIT:  oLcd().init(); break;
    case S_LCDBL:    oLcd().backlight(); break;
    case S_LCDNOBL:  oLcd().noBacklight(); break;
    case S_LCDCLEAR: oLcd().clear(); break;
    case S_LCDCURSOR: b = tira(); a = tira(); oLcd().setCursor(a, b); break;
    case S_LCDHOME:  oLcd().home(); break;
    case S_LCDDISPLAY: oLcd().display(); break;
    case S_LCDNODISPLAY: oLcd().noDisplay(); break;
    case S_LCDBLINK: oLcd().blink(); break;
    case S_LCDNOBLINK: oLcd().noBlink(); break;
    case S_LCDCURSORON: oLcd().cursor(); break;
    case S_LCDCURSOROFF: oLcd().noCursor(); break;
    case S_SHIFTOUT: d = tira(); c = tira(); b = tira(); a = tira(); shiftOut(a, b, c, d); break;
    case S_SQRT:     a = tira(); empurra(a < 0 ? 0 : (int32_t)sqrt((double)a)); break;
    default: erro(F("comando desconhecido"));
  }
}

/* Executa a partir de `inicio` até o RET do nível mais de fora. */
static void executar(uint16_t inicio) {
  pc = inicio;
  profundidade = 0;
  fp = sp;
  int32_t a, b;
  uint16_t w, n;
  for (;;) {
    uint8_t op = lerB(pc++);
    switch (op) {
      case OP_HALT: for (;;) { }
      case OP_PUSHB: empurra((int8_t)lerB(pc)); pc += 1; break;
      case OP_PUSHW: empurra((int16_t)lerW(pc)); pc += 2; break;
      case OP_PUSHL: empurra((int32_t)lerL(pc)); pc += 4; break;
      case OP_POP:   tira(); break;
      case OP_DUP:   a = tira(); empurra(a); empurra(a); break;
      case OP_SWAP:  b = tira(); a = tira(); empurra(b); empurra(a); break;
      case OP_LDG:   w = lerW(pc); pc += 2; empurra(mem[w]); break;
      case OP_STG:   w = lerW(pc); pc += 2; mem[w] = tira(); break;
      case OP_LDL:   w = fp + lerB(pc); pc += 1; empurra(mem[w]); break;
      case OP_STL:   w = fp + lerB(pc); pc += 1; mem[w] = tira(); break;
      case OP_LDGA:
      case OP_LDLA: {
        uint16_t base = (op == OP_LDGA) ? lerW(pc) : (uint16_t)(fp + lerB(pc));
        pc += (op == OP_LDGA) ? 2 : 1;
        n = lerW(pc); pc += 2;
        a = tira();
        if (a < 0 || a >= (int32_t)n) erro(F("posicao fora do vetor"));
        empurra(mem[base + a]);
        break;
      }
      case OP_STGA:
      case OP_STLA: {
        uint16_t base = (op == OP_STGA) ? lerW(pc) : (uint16_t)(fp + lerB(pc));
        pc += (op == OP_STGA) ? 2 : 1;
        n = lerW(pc); pc += 2;
        b = tira(); a = tira();
        if (a < 0 || a >= (int32_t)n) erro(F("posicao fora do vetor"));
        mem[base + a] = b;
        break;
      }
      case OP_ADD: b = tira(); a = tira(); empurra(a + b); break;
      case OP_SUB: b = tira(); a = tira(); empurra(a - b); break;
      case OP_MUL: b = tira(); a = tira(); empurra(a * b); break;
      case OP_DIV: b = tira(); a = tira(); if (!b) erro(F("divisao por zero")); empurra(a / b); break;
      case OP_MOD: b = tira(); a = tira(); if (!b) erro(F("divisao por zero")); empurra(a % b); break;
      case OP_NEG: a = tira(); empurra(-a); break;
      case OP_AND: b = tira(); a = tira(); empurra(a & b); break;
      case OP_OR:  b = tira(); a = tira(); empurra(a | b); break;
      case OP_XOR: b = tira(); a = tira(); empurra(a ^ b); break;
      case OP_NOT: a = tira(); empurra(~a); break;
      case OP_SHL: b = tira(); a = tira(); empurra(a << b); break;
      case OP_SHR: b = tira(); a = tira(); empurra((int32_t)((uint32_t)a >> b)); break;
      case OP_SAR: b = tira(); a = tira(); empurra(a >> b); break;
      case OP_LNOT: a = tira(); empurra(!a); break;
      case OP_EQ: b = tira(); a = tira(); empurra(a == b); break;
      case OP_NE: b = tira(); a = tira(); empurra(a != b); break;
      case OP_LT: b = tira(); a = tira(); empurra(a < b); break;
      case OP_LE: b = tira(); a = tira(); empurra(a <= b); break;
      case OP_GT: b = tira(); a = tira(); empurra(a > b); break;
      case OP_GE: b = tira(); a = tira(); empurra(a >= b); break;
      case OP_C8:   a = tira(); empurra((int8_t)a); break;
      case OP_CU8:  a = tira(); empurra((uint8_t)a); break;
      case OP_C16:  a = tira(); empurra((int16_t)a); break;
      case OP_CU16: a = tira(); empurra((uint16_t)a); break;
      case OP_TOBOOL: a = tira(); empurra(a != 0); break;
      case OP_JMP: pc = lerW(pc); break;
      case OP_JZ:  w = lerW(pc); pc += 2; if (!tira()) pc = w; break;
      case OP_JNZ: w = lerW(pc); pc += 2; if (tira()) pc = w; break;
      case OP_CALL: {
        w = lerW(pc); uint8_t nargs = lerB(pc + 2); pc += 3;
        if (profundidade >= MAX_CHAMADAS) erro(F("chamadas demais (funcao chamando ela mesma?)"));
        chamadas[profundidade].pc = pc;
        chamadas[profundidade].fp = fp;
        profundidade++;
        fp = sp - nargs;
        pc = w;
        break;
      }
      case OP_ENTER: {
        uint8_t total = lerB(pc); pc += 1;
        while (sp < fp + total) empurra(0);
        break;
      }
      case OP_RET:
      case OP_RETV: {
        a = (op == OP_RETV) ? tira() : 0;
        sp = fp;
        if (profundidade == 0) return;
        profundidade--;
        pc = chamadas[profundidade].pc;
        fp = chamadas[profundidade].fp;
        if (op == OP_RETV) empurra(a);
        break;
      }
      case OP_SYS: sys(lerB(pc++)); break;
      case OP_PRINTS: {
        w = lerW(pc); uint8_t flags = lerB(pc + 2); pc += 3;
        Print &p = destino(flags);
        for (;;) { char ch = lerB(w++); if (!ch) break; p.write(ch); }
        if (flags & 1) p.println();
        break;
      }
      case OP_PRINTI: {
        uint8_t flags = lerB(pc++);
        a = tira();
        Print &p = destino(flags);
        imprimirNumero(p, a, (flags >> 2) & 7);
        if (flags & 1) p.println();
        break;
      }
      case OP_PRINTNL: { uint8_t flags = lerB(pc++); destino(flags).println(); break; }
      case OP_LINE: linha = lerW(pc); pc += 2; break;
      case OP_ARRINIT: {
        uint16_t dest = lerW(pc), cont = lerW(pc + 2); uint8_t tam = lerB(pc + 4); pc += 5;
        if (dest + cont > MEMCELLS) erro(F("vetores grandes demais para a memoria"));
        for (uint16_t i = 0; i < cont; i++) {
          if (tam == 1) a = (int8_t)lerB(pc);
          else if (tam == 2) a = (int16_t)lerW(pc);
          else a = (int32_t)lerL(pc);
          pc += tam;
          mem[dest + i] = a;
        }
        break;
      }
      default:
        erro(F("bytecode invalido"));
    }
  }
}

static bool programaValido() {
  if (lerB(0) != 'M' || lerB(1) != 'V' || lerB(2) != VM_VERSAO) return false;
  tamanho = lerW(4);
  if (tamanho < 16 || PROG_ADDR + tamanho > 0x7E00UL) return false;
  uint16_t soma = 0;
  for (uint16_t i = 16; i < tamanho; i++) soma += lerB(i);
  return soma == lerW(14);
}

void setup() {
  if (!programaValido()) {
    // Sem programa: pisca devagar o LED 13 e avisa no Serial.
    Serial.begin(9600);
    pinMode(13, OUTPUT);
    for (;;) {
      Serial.println(F("[MIDE] Nenhum programa gravado. Use o botao Upload da MIDE EDU."));
      digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);
    }
  }
  nglobais = lerW(12);
  if (nglobais >= MEMCELLS) { linha = 0; erro(F("variaveis globais demais")); }
  for (uint16_t i = 0; i < MEMCELLS; i++) mem[i] = 0;
  sp = nglobais;
  executar(lerW(6));     // inicialização das globais
  executar(lerW(8));     // setup()
}

void loop() {
  executar(lerW(10));    // loop()
}
