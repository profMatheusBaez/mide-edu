/* ============================================================
 * _makecode_node.mjs — utilitário dos testes (só desenvolvimento)
 * Compila JavaScript do MakeCode (micro:bit V2) em Node, SEM REDE,
 * com os mesmos arquivos vendorizados que o navegador usa:
 * js/vendor/makecode/{target.json,pxtworker.js,hexcache/}.
 *
 *   const { compilarJS } = await import('./_makecode_node.mjs');
 *   const r = await compilarJS('basic.showString("oi")');
 *   r.ok  r.hex  r.erros  r.ms
 * ============================================================ */
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(aqui, '..');
const VEND = path.join(RAIZ, 'js', 'vendor', 'makecode');
const require = createRequire(path.join(aqui, 'x.js'));

const { setHost } = require('makecode-core/built/host');
const { createNodeHost } = require('makecode/built/nodeHost');
const mkc = require('makecode-core/built/mkc');
const downloader = require('makecode-core/built/downloader');

const targetJson = JSON.parse(fs.readFileSync(path.join(VEND, 'target.json'), 'utf8'));
const pxtWorkerJs = fs.readFileSync(path.join(VEND, 'pxtworker.js'), 'utf8');
const mem = new Map();
const cache = {
  rootPath: null,
  expandKey: (k) => k,
  async getAsync(k) {
    if (mem.has(k)) return mem.get(k);
    if (k.startsWith('cpp-')) {
      const f = path.join(VEND, 'hexcache', k.slice(4) + '.hex');
      if (fs.existsSync(f)) return fs.readFileSync(f);
    }
    return undefined;
  },
  async setAsync(k, v) { mem.set(k, Buffer.from(v)); },
};
downloader.downloadAsync = async () => ({
  cache, versionNumber: 1, cdnUrl: 'https://cdn.makecode.com', website: 'https://makecode.microbit.org/',
  simUrl: null, pxtWorkerJs, targetJson, webConfig: { cdnUrl: 'https://cdn.makecode.com' }, targetConfig: {},
});
setHost(createNodeHost());
mkc.setLogging({ log() {}, error() {}, debug() {} });   // o mkc é falador

/* MESMAS dependências que o compilador do navegador usa (bundle mk-entry.js):
   core + microphone + (radio | bluetooth). São as combinações que têm hex no cache. */
export async function compilarJS(codigo, opcoes = {}) {
  const dir = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'mb-'));
  const deps = Object.assign({ core: '*', microphone: '*' }, opcoes.bluetooth ? { bluetooth: '*' } : { radio: '*' });
  const files = Object.assign({ 'main.ts': codigo }, opcoes.arquivosExtras || {});
  const cfg = { name: 'programa', dependencies: deps, files: Object.keys(files), targetVersion: targetJson.versions.target, supportedTargets: ['microbit'], binaryonly: true };
  fs.writeFileSync(path.join(dir, 'pxt.json'), JSON.stringify(cfg));
  for (const [k, v] of Object.entries(files)) fs.writeFileSync(path.join(dir, k), v);
  const t0 = Date.now();
  try {
    const prj = new mkc.Project(dir, cache);
    prj.hwVariant = 'v2';
    prj.writePxtModules = false;
    const res = await prj.buildAsync({ native: true });
    const diag = (res.diagnostics || []).map((d) => ({
      arquivo: d.fileName, linha: d.line != null ? d.line + 1 : null, categoria: d.category,
      texto: typeof d.messageText === 'string' ? d.messageText : (d.messageText && d.messageText.messageText) || '',
    }));
    const hex = res.outfiles && res.outfiles['mbcodal-binary.hex'];
    const erros = diag.filter((d) => d.categoria === 1);
    return { ok: !!(res.success && hex && !erros.length), hex, erros, avisos: diag.filter((d) => d.categoria !== 1), ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, hex: null, erros: [{ texto: String(e && e.message || e) }], avisos: [], ms: Date.now() - t0 };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
