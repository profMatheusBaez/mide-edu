#!/usr/bin/env python3
"""Compila um sketch Arduino Uno (subconjunto do pipeline do arduino-cli) -> .hex"""
import os, re, subprocess, sys, hashlib, glob
W='/home/claude/avrbuild'
CORE=W+'/user/hardware/arduino/avr'
LIBS={'Wire':[CORE+'/libraries/Wire/src', CORE+'/libraries/Wire/src/utility'],
      'Servo':[W+'/user/libraries/Servo/src', W+'/user/libraries/Servo/src/avr'],
      'LiquidCrystal_I2C':[W+'/user/libraries/LiquidCrystal_I2C']}
INC=['-I'+CORE+'/cores/arduino','-I'+CORE+'/variants/standard']+['-I'+d for v in LIBS.values() for d in v]
COM=['-c','-g','-Os','-w','-ffunction-sections','-fdata-sections','-flto','-mmcu=atmega328p','-DF_CPU=16000000L','-DARDUINO=10607','-DARDUINO_AVR_UNO','-DARDUINO_ARCH_AVR','-MMD']
CXX=['avr-g++']+COM+['-std=gnu++11','-fpermissive','-fno-exceptions','-fno-threadsafe-statics','-Wno-error=narrowing']
CC=['avr-gcc']+COM+['-std=gnu11','-fno-fat-lto-objects']
AS=['avr-gcc','-c','-g','-x','assembler-with-cpp','-flto','-MMD','-mmcu=atmega328p','-DF_CPU=16000000L','-DARDUINO=10607','-DARDUINO_AVR_UNO','-DARDUINO_ARCH_AVR']
OBJ=W+'/obj'
def comp(src, out):
    if os.path.exists(out) and os.path.getmtime(out)>os.path.getmtime(src): return out
    os.makedirs(os.path.dirname(out),exist_ok=True)
    if src.endswith('.S'): cmd=AS+INC+[src,'-o',out]
    elif src.endswith('.c'): cmd=CC+INC+[src,'-o',out]
    else: cmd=CXX+INC+[src,'-o',out]
    subprocess.run(cmd,check=True); return out
def core_objs():
    objs=[]
    for f in sorted(glob.glob(CORE+'/cores/arduino/*')):
        if f.endswith(('.c','.cpp','.S')): objs.append(comp(f, OBJ+'/core/'+os.path.basename(f)+'.o'))
    return objs
def lib_objs(names):
    objs=[]
    for n in names:
        for d in LIBS[n]:
            for f in sorted(glob.glob(d+'/*')):
                if f.endswith(('.c','.cpp')): objs.append(comp(f, OBJ+'/lib_'+n+'/'+os.path.basename(f)+'.o'))
    return objs
TIPOS=r'(?:unsigned\s+|signed\s+)?(?:void|int|long|float|double|bool|boolean|byte|char|word|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|String)'
def prototipos(src):
    protos=[]
    for m in re.finditer(r'^('+TIPOS+r'\s*\*?\s+([A-Za-z_]\w*)\s*\([^;{)]*\))\s*\{', src, re.M):
        if m.group(2) in ('setup','loop'): continue
        protos.append(m.group(1)+';')
    return protos
def build(code, outhex):
    usa=[n for n in LIBS if re.search(r'#include\s*[<"]'+n+r'\.h[>"]', code)]
    if 'LiquidCrystal_I2C' in usa and 'Wire' not in usa: usa.append('Wire')
    # protótipos depois dos #include (como o arduino-cli)
    linhas=code.split('\n'); ult=-1
    for i,l in enumerate(linhas):
        if l.strip().startswith('#include') or l.strip().startswith('#define'): ult=i
    protos=prototipos(code)
    corpo='\n'.join(linhas[:ult+1]+protos+linhas[ult+1:])
    cpp='#include <Arduino.h>\n'+corpo+'\n'
    h=hashlib.sha1(cpp.encode()).hexdigest()[:12]
    d=OBJ+'/sk_'+h; os.makedirs(d,exist_ok=True)
    open(d+'/sketch.cpp','w').write(cpp)
    so=comp(d+'/sketch.cpp', d+'/sketch.o')
    elf=d+'/sketch.elf'
    subprocess.run(['avr-gcc','-w','-Os','-g','-flto','-fuse-linker-plugin','-Wl,--gc-sections','-mmcu=atmega328p','-o',elf,so]+lib_objs(usa)+core_objs()+['-lm'],check=True)
    subprocess.run(['avr-objcopy','-O','ihex','-R','.eeprom',elf,outhex],check=True)
    sz=subprocess.run(['avr-size','-A',elf],capture_output=True,text=True).stdout
    return sz
if __name__=='__main__':
    print(build(open(sys.argv[1]).read(), sys.argv[2]))
