/* ============================================================
 * testar_mb_curso.mjs — currículo da micro:bit V2 (só desenvolvimento)
 * Confere as 90 fases × 2 linguagens: estrutura, texto ASCII no código
 * (o aluno digita), 100% das linhas com explicação própria (nenhuma cai
 * na explicação genérica), arquivos de ícone e coerência com o gerado.
 *   cd ferramentas && node testar_mb_curso.mjs
 * ============================================================ */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarScripts, RAIZ } from './_blockly_headless.mjs';

carregarScripts(['microbit_suporte', 'microbit_curso', 'microbit_fases_gerado']);

let falhas = 0, total = 0;
function ok(cond, msg) { total++; if (!cond) { falhas++; console.log('  FALHOU: ' + msg); } }
const secao = (t) => console.log('== ' + t);

secao('estrutura');
ok(MB_MODULOS.length === 18, '18 módulos');
ok(MB_FASES_GERADAS.length === 90, '90 fases (' + MB_FASES_GERADAS.length + ')');
for (let m = 0; m < 18; m++) ok(MB_FASES_GERADAS.filter((f) => f.modulo === m).length === 5, 'módulo ' + (m + 1) + ' com 5 fases');
const nomes = new Set();
for (const f of MB_FASES_GERADAS) {
  const id = 'mb_' + f.numero;
  ok(!nomes.has(f.nome + '|' + f.modulo), id + ' nome repetido no módulo');
  nomes.add(f.nome + '|' + f.modulo);
  for (const k of ['nome', 'objetivo', 'conceito', 'resultado', 'desafio', 'js', 'py']) ok(typeof f[k] === 'string' && f[k].trim().length > 0, id + ': campo ' + k);
  ok(f.conceito.length >= 120, id + ': conceito curto demais');
  ok(f.blocos && f.blocos.blocks, id + ': blocos');
  if (f.modulo >= 10) ok(!!f.aviso || f.modulo === 9, id + ': módulo de componente externo deve ter aviso de ligação');
}

secao('byte a byte: blocos → JavaScript e MicroPython');
/* 1. As 90 fases × 2 linguagens: o que os geradores produzem AGORA a partir dos blocos é idêntico ao que está gravado. */
{
  const r = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'gerar_fases_microbit.mjs'), '--verificar', '--sem-compilar'], { encoding: 'utf8' });
  ok(r.status === 0, 'gerar_fases_microbit --verificar: ' + (r.stdout + r.stderr).trim().split('\n').slice(-4).join(' | '));
}
/* 2. Instantâneo revisado à mão: a fase-desafio de cada módulo (36 arquivos em ferramentas/esperados). */
for (let m = 0; m < 18; m++) {
  const n = m * 5 + 5;
  const f = MB_FASES_GERADAS.find((x) => x.numero === n);
  const base = path.join(path.dirname(fileURLToPath(import.meta.url)), 'esperados', 'mb_' + String(n).padStart(2, '0') + '_desafio');
  ok(fs.readFileSync(base + '.js', 'utf8') === f.js, 'mb_' + n + ' JavaScript difere do esperado');
  ok(fs.readFileSync(base + '.py', 'utf8') === f.py, 'mb_' + n + ' MicroPython difere do esperado');
}

secao('ícones dos módulos');
for (const m of MB_MODULOS) ok(fs.existsSync(path.join(RAIZ, 'assets', m.icone)), 'ícone ' + m.icone);

for (const linguagem of ['js', 'micropython']) {
  secao('currículo ' + linguagem);
  const fases = criarCursoMicrobit(linguagem);
  ok(fases.length === 90, linguagem + ': 90 fases');
  ok(new Set(fases.map((f) => f.id)).size === 90, linguagem + ': ids únicos');
  for (const f of fases) {
    const linhas = f.secoes[0].linhas;
    ok(linhas.length >= 1, f.id + ': linhas');
    ok(f.solucao.trimEnd().split('\n').filter((l) => l.trim()).length === linhas.length, f.id + ': linhas = solução');
    ok(!/[^\x20-\x7E\n]/.test(f.solucao), f.id + ' (' + linguagem + '): código só com ASCII imprimível — ' + (f.solucao.match(/[^\x20-\x7E\n]/) || [''])[0]);
    ok(!/\t/.test(f.solucao), f.id + ': sem tabulação');
    for (const l of linhas) {
      ok(l.explicacao && l.explicacao !== MB_EXPLICACAO_GENERICA, f.id + ' (' + linguagem + '): linha sem explicação própria: ' + l.codigo);
      ok(!/\bundefined\b|\[object/.test(l.explicacao || ''), f.id + ': explicação estranha em ' + l.codigo);
    }
    ok(mbNormalizarCodigo(f.solucao) === mbNormalizarCodigo(f.solucao), f.id + ': normalização estável');
  }
}

console.log('\n' + (falhas ? falhas + ' FALHA(S) em ' + total + ' verificações' : 'OK: ' + total + ' verificações'));
process.exit(falhas ? 1 : 0);
