// Compilador MakeCode (micro:bit V2) no navegador, sem rede.
// Reúne o serviço do makecode-core (MIT) + o serviço de linguagem do makecode-browser (MIT).
import { Ctx } from 'makecode-core/built/service';
import { setHost } from 'makecode-core/built/host';
import { BrowserLanguageService } from 'makecode-browser/built/languageService';

const enc = new TextEncoder(), dec = new TextDecoder('utf8');

function criarHost() {
  return {
    createLanguageServiceAsync: async (editor) => new BrowserLanguageService(editor),
    requestAsync: async (opts) => {
      // Só existe conteúdo local. Qualquer pedido externo é recusado de propósito.
      const e = new Error('MB_SEM_REDE: ' + (opts && opts.url));
      e.mbSemRede = true;
      throw e;
    },
    bufferToString: (b) => dec.decode(b),
    stringToBuffer: (s, encoding) => {
      if (encoding === 'base64') {
        const bin = atob(s); const u = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        return u;
      }
      return enc.encode(s);
    },
    base64EncodeBufferAsync: async (b) => {
      let s = ''; const u = new Uint8Array(b);
      for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
      return btoa(s);
    },
    guidGen: () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
    getEnvironmentVariable: () => undefined,
  };
}

async function baixarTexto(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Não consegui carregar ' + url + ' (' + r.status + ')');
  return r.text();
}

/* Dentro do worker do compilador: nenhuma chamada de rede. (No Node o makecode faz o mesmo
   override; no navegador o pxt tentaria buscar a lista de pacotes em cdn.makecode.com.) */
const REMENDO_WORKER = '\n;pxt.packagesConfigAsync = () => Promise.resolve({});\n';

let _promessa = null;

/** baseUrl: pasta com target.json, pxtworker.js e hexcache/  (ex.: 'js/vendor/makecode/') */
export function criarCompilador(baseUrl) {
  if (_promessa) return _promessa;
  _promessa = (async () => {
    setHost(criarHost());
    const [targetTxt, pxtWorkerBruto] = await Promise.all([
      baixarTexto(baseUrl + 'target.json'), baixarTexto(baseUrl + 'pxtworker.js')]);
    const pxtWorkerJs = pxtWorkerBruto + REMENDO_WORKER;
    const targetJson = JSON.parse(targetTxt);
    const mem = new Map();
    const hexPend = new Map();
    const cache = {
      rootPath: null,
      expandKey: (k) => k,
      async getAsync(k) {
        if (mem.has(k)) return mem.get(k);
        if (k.startsWith('cpp-')) {
          const sha = k.slice(4);
          if (!hexPend.has(sha)) {
            hexPend.set(sha, fetch(baseUrl + 'hexcache/' + sha + '.hex').then(async (r) => {
              if (!r.ok) return undefined;
              return new Uint8Array(await r.arrayBuffer());
            }).catch(() => undefined));
          }
          return hexPend.get(sha);
        }
        return undefined;
      },
      async setAsync(k, v) { mem.set(k, v instanceof Uint8Array ? v : enc.encode(String(v))); },
    };
    const editor = {
      cache, versionNumber: 1, cdnUrl: 'https://cdn.makecode.com', website: 'local://makecode/',
      simUrl: null, pxtWorkerJs, targetJson, webConfig: { cdnUrl: 'https://cdn.makecode.com' }, targetConfig: {},
    };
    const svc = Object.create(Ctx.prototype);
    svc.editor = editor; svc.makerHw = false; svc.supportsGhPkgs = false;
    await svc.initAsync();
    await svc.setUserAsync({ linkedPackage: async () => null });

    let fila = Promise.resolve();
    async function compilarUma(codigo, opts) {
      opts = opts || {};
      const deps = Object.assign({ core: '*', microphone: '*' }, opts.bluetooth ? { bluetooth: '*' } : { radio: '*' });
      const files = { 'main.ts': codigo };
      Object.assign(files, opts.arquivosExtras || {});
      const cfg = { name: 'programa', dependencies: deps, files: Object.keys(files), targetVersion: targetJson.versions.target, supportedTargets: ['microbit'], binaryonly: true };
      const prj = { config: cfg, mkcConfig: { hwVariant: 'v2' }, files: Object.assign({ 'pxt.json': JSON.stringify(cfg, null, 4) }, files) };
      try {
        await svc.installGhPackagesAsync(prj);
        const res = await svc.simpleCompileAsync(prj, { native: true });
        const diag = (res.diagnostics || []).map((d) => ({
          arquivo: d.fileName, linha: d.line != null ? d.line + 1 : null, coluna: d.column != null ? d.column + 1 : null,
          categoria: d.category, texto: typeof d.messageText === 'string' ? d.messageText : flatMsg(d.messageText),
        }));
        if (res.errorMessage) return { ok: false, erros: diag, mensagem: res.errorMessage };
        const hex = res.outfiles && (res.outfiles['mbcodal-binary.hex']);
        if (!res.success || !hex) return { ok: false, erros: diag.filter((d) => d.categoria === 1), mensagem: 'Erros no programa.' };
        return { ok: true, hex, avisos: diag.filter((d) => d.categoria !== 1) };
      } catch (e) {
        if (e && (e.mbSemRede || /MB_SEM_REDE/.test(String(e.message)))) {
          return { ok: false, erros: [], mensagem: 'Esta combinação de blocos exige um runtime que não está no cache local.', semHex: true };
        }
        return { ok: false, erros: [], mensagem: String(e && e.message || e) };
      }
    }
    function flatMsg(m) { let s = ''; for (let c = m; c; c = c.next) s += (s ? ' ' : '') + c.messageText; return s; }

    return {
      versao: targetJson.versions.target,
      compilar: (codigo, opts) => (fila = fila.then(() => compilarUma(codigo, opts), () => compilarUma(codigo, opts))),
    };
  })();
  return _promessa;
}
