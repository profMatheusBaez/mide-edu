const fs=require('fs');const C=require('/home/claude/src/ide_web/js/mide_compilador.js');
let ok=0;for(const f of fs.readdirSync('fases').sort()){const src=fs.readFileSync('fases/'+f,'utf8');const r=C.compilar(src);
if(r.ok){ok++;fs.writeFileSync('fases/'+f.replace('.ino','.mvb'),Buffer.from(r.bytes));console.log(f.padEnd(14),'bytes',r.info.tamanho,'globais',r.info.globais);}else console.log(f,'ERRO',JSON.stringify(r.erros));}
console.log('ok',ok);
