// Testa o gerador da aba Joystick: compila o .ino na MIDE VM e (se houver g++) como C++,
// e confere o gamepad.py com o Python. Uso: node ferramentas/joystick/testar_joystick.js [pasta_saida]
const fs = require('fs'), path = require('path'), cp = require('child_process');
const J = require('../../js/joystick_gen.js');
const C = require('../../js/mide_compilador.js');
const saida = process.argv[2] || fs.mkdtempSync(path.join(require('os').tmpdir(), 'joy-'));
fs.mkdirSync(saida, { recursive: true });

const casos = {
  padrao: J.configPadrao(),
  completo: { porta: 'COM5', sensores: [
    { tipo: 'botao', pino: 2, curto: true, longo: true, teclaCurto: 'space', teclaLongo: 'shift', msLongo: 600 },
    { tipo: 'botao', pino: 3, curto: false, longo: true, teclaCurto: '', teclaLongo: 'e', msLongo: 1000 },
    { tipo: 'botao', pino: 4, curto: true, longo: false, teclaCurto: 'mouse_esq', teclaLongo: '', msLongo: 500 },
    { tipo: 'ultra', trig: 6, echo: 7, faixas: [{ min: 0, max: 15, tecla: 'w', modo: 'segurar' }, { min: 16, max: 40, tecla: 'enter', modo: 'toque' }, { min: 41, max: 80, tecla: '', modo: 'segurar' }] },
    { tipo: 'pot', pino: 'A0', faixas: [{ min: 0, max: 341, tecla: 'a', modo: 'segurar' }, { min: 342, max: 682, tecla: '', modo: 'segurar' }, { min: 683, max: 1023, tecla: 'd', modo: 'segurar' }] },
    { tipo: 'pot', pino: 'A1', faixas: [{ min: 0, max: 500, tecla: '1', modo: 'toque' }, { min: 501, max: 1023, tecla: '2', modo: 'toque' }] },
    { tipo: 'led', pino: 12, tecla: 'space' },
    { tipo: 'led', pino: 13, tecla: 'w' },
    { tipo: 'led', pino: 11, tecla: 'z' },
  ] },
  so_led: { sensores: [{ tipo: 'led', pino: 13, tecla: '' }] },
  maximo: { sensores: [
    ...[2, 3, 4, 5, 6, 7, 8, 9].map((p, i) => ({ tipo: 'botao', pino: p, curto: true, longo: true, teclaCurto: 'abcdefgh'[i], teclaLongo: 'ijklmnop'[i], msLongo: 500 })),
    { tipo: 'ultra', trig: 10, echo: 11, faixas: [0, 1, 2, 3].map((k) => ({ min: k * 20, max: k * 20 + 19, tecla: 'f' + (k + 1), modo: 'segurar' })) },
    ...['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((p) => ({ tipo: 'pot', pino: p, faixas: [{ min: 0, max: 511, tecla: 'q', modo: 'segurar' }, { min: 512, max: 1023, tecla: 'r', modo: 'segurar' }] })),
    { tipo: 'led', pino: 12, tecla: 'a' }, { tipo: 'led', pino: 13, tecla: 'q' },
  ] },
};

const stub = `#include <stdint.h>
typedef bool boolean; typedef uint8_t byte;
#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define A0 14
#define A1 15
#define A2 16
#define A3 17
#define A4 18
#define A5 19
void pinMode(int,int); void digitalWrite(int,int); int digitalRead(int); int analogRead(int);
unsigned long millis(); void delay(unsigned long); void delayMicroseconds(unsigned int);
unsigned long pulseIn(int,int,unsigned long);
template<class T> T abs(T x){return x<0?-x:x;}
struct S_{ void begin(long); void print(const char*); void print(int); void println(const char*); } Serial;
`;
let falhas = 0;
const temGpp = (() => { try { cp.execSync('g++ --version', { stdio: 'ignore' }); return true; } catch (e) { return false; } })();
for (const [nome, cfg] of Object.entries(casos)) {
  const g = J.gerar(cfg);
  fs.writeFileSync(path.join(saida, nome + '.ino'), g.ino);
  fs.writeFileSync(path.join(saida, nome + '.py'), g.py);
  const r = C.compilar(g.ino);
  const ok1 = r.ok;
  let ok2 = true, ok3 = true, msg = '';
  if (!r.ok) msg += ' VM: ' + JSON.stringify(r.erros);
  if (temGpp) {
    const f = path.join(saida, nome + '.cpp');
    fs.writeFileSync(f, stub + g.ino);
    try { cp.execSync(`g++ -std=c++11 -fsyntax-only -Wall -Wno-unused-variable "${f}"`, { stdio: 'pipe' }); }
    catch (e) { ok2 = false; msg += ' g++: ' + e.stderr; }
  }
  try { cp.execSync(`python3 -m py_compile "${path.join(saida, nome + '.py')}"`, { stdio: 'pipe' }); }
  catch (e) { ok3 = false; msg += ' py: ' + e.stderr; }
  const det = J.gerar(cfg).ino === g.ino;
  const ok = ok1 && ok2 && ok3 && det;
  if (!ok) falhas++;
  console.log(`${ok ? 'OK ' : 'ERRO'} ${nome.padEnd(9)} ações=${g.acoes.length} bytecode=${r.ok ? r.info.tamanho + 'B globais=' + r.info.globais : '-'} erros=${g.erros.length} avisos=${g.avisos.length}${msg}`);
}
const zipBytes = J.zip([{ nome: 'a.txt', texto: 'olá' }, { nome: 'b/c.txt', texto: 'x'.repeat(100) }]);
fs.writeFileSync(path.join(saida, 't.zip'), zipBytes);
try { const out = cp.execSync(`python3 -c "import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip(), z.namelist(), z.read('a.txt').decode())" "${path.join(saida, 't.zip')}"`).toString().trim(); console.log('zip:', out); if (!/None/.test(out)) falhas++; }
catch (e) { falhas++; console.log('zip ERRO', e.message); }
console.log(falhas ? `${falhas} falha(s)` : 'tudo certo', '— arquivos em', saida);
process.exit(falhas ? 1 : 0);
