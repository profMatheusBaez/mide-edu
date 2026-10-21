const fs=require('fs');const C=require('/home/claude/src/ide_web/js/mide_compilador.js');const {simular,montarVM,hexParaImagem}=require('../sim/run.js');
const f=process.argv[2], seg=+(process.argv[3]||0.4);
const r=C.compilar(fs.readFileSync(f+'.ino','utf8'));if(!r.ok){console.log(r.erros);process.exit(1)}
const fw=fs.readFileSync('../vm/mide_vm.hex','utf8');
const a=simular(hexParaImagem(fs.readFileSync(f+'.hex','utf8')),seg).serial, b=simular(montarVM(fw,r.bytes),seg).serial;
console.log(a===b?'IGUAL':'DIFERENTE', r.info);const la=a.split('\n'),lb=b.split('\n');for(let i=0;i<Math.max(la.length,lb.length);i++)console.log((la[i]===lb[i]?'  ':'!!')+JSON.stringify(la[i])+' | '+JSON.stringify(lb[i]));
