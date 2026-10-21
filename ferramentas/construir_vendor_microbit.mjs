/* Reconstrói os bundles de js/vendor/microbit e js/vendor/makecode a partir dos pacotes npm
 * (só desenvolvimento). Os arquivos JÁ construídos ficam no app; isto existe para auditar/atualizar.
 *   cd ferramentas && npm install && node construir_vendor_microbit.mjs
 * Os dados (target.json, pxtworker.js, hexcache/, micropython-v2.hex) NÃO são reconstruídos aqui —
 * vêm dos pacotes pxt-microbit@9.1.1, pxt-core@13.0.1 e do release v2.1.2 do MicroPython (VERSOES-MICROBIT.txt). */
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..', 'js', 'vendor');
const comum = { bundle: true, format: 'iife', platform: 'browser', target: 'es2020', minify: true, legalComments: 'none' };
await build({ ...comum, entryPoints: [path.join(aqui, 'vendor-src/mc-entry.js')], globalName: 'MicrobitConnection', outfile: path.join(raiz, 'microbit/microbit-connection.js') });
await build({ ...comum, entryPoints: [path.join(aqui, 'vendor-src/fs-entry.js')], globalName: 'MicrobitFs', outfile: path.join(raiz, 'microbit/microbit-fs.js') });
await build({ ...comum, entryPoints: [path.join(aqui, 'vendor-src/mk-entry.js')], globalName: 'MakeCodeCompiler', alias: { path: path.join(aqui, 'vendor-src/pathshim.js') }, outfile: path.join(raiz, 'makecode/makecode-compiler.js') });
console.log('ok');
