/* ============================================================
 * mide_serial.js — gravação no Arduino Uno pelo navegador
 * ------------------------------------------------------------
 * Fala o protocolo STK500 v1 do bootloader do Uno (optiboot) por
 * uma porta da Web Serial: reinicia a placa (DTR/RTS), sincroniza,
 * confere a assinatura do ATmega328P, lê cada página da flash e só
 * regrava as que mudaram, conferindo depois de gravar.
 *
 * Sem DOM: o mesmo código roda no navegador e nos testes em Node
 * (com uma porta simulada pelo avr8js rodando o optiboot de verdade).
 * ============================================================ */
(function (raiz) {
  'use strict';
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------------- conexão serial ---------------- */
  class Conexao {
    constructor(porta) { this.porta = porta; this.fila = []; this.espera = null; this.aoDados = null; this.leitor = null; this.lendo = null; this.fechando = false; }
    async abrir(baud) {
      await this.porta.open({ baudRate: baud, bufferSize: 8192 });
      this.baud = baud;
      this.lendo = this.laco();
    }
    async laco() {
      while (this.porta.readable && !this.fechando) {
        this.leitor = this.porta.readable.getReader();
        try {
          for (;;) {
            const { value, done } = await this.leitor.read();
            if (done) break;
            if (value && value.length) this.receber(value);
          }
        } catch (e) { /* erro de enquadramento etc.: continua lendo */ }
        finally { try { this.leitor.releaseLock(); } catch (e) { } }
      }
    }
    receber(bytes) {
      if (this.aoDados) { this.aoDados(bytes); return; }
      for (const b of bytes) this.fila.push(b);
      if (this.espera) this.espera();
    }
    limpar() { this.fila.length = 0; }
    async escrever(bytes) {
      const w = this.porta.writable.getWriter();
      try { await w.write(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes)); }
      finally { w.releaseLock(); }
    }
    async ler(n, ms) {
      const limite = Date.now() + ms;
      while (this.fila.length < n) {
        const resta = limite - Date.now();
        if (resta <= 0) throw new Error('a placa não respondeu');
        await new Promise((r) => { this.espera = r; setTimeout(r, Math.min(resta, 50)); });
        this.espera = null;
      }
      return Uint8Array.from(this.fila.splice(0, n));
    }
    async sinais(dtr) { try { await this.porta.setSignals({ dataTerminalReady: dtr, requestToSend: dtr }); } catch (e) { } }
    async fechar() {
      this.fechando = true;
      try { if (this.leitor) await this.leitor.cancel(); } catch (e) { }
      try { await this.lendo; } catch (e) { }
      try { await this.porta.close(); } catch (e) { }
    }
  }

  /* ---------------- gravação (STK500 / optiboot) ---------------- */
  const PROGRESSO = { fase: 'ocioso', porta: '', desde: 0, pct: 0 };
  function marcar(fase, porta) { PROGRESSO.fase = fase; PROGRESSO.porta = porta || ''; PROGRESSO.desde = Date.now(); }

  async function comando(c, bytes, nResp, ms) {
    await c.escrever([...bytes, 0x20]);
    const r = await c.ler(nResp + 2, ms || 800);
    if (r[0] !== 0x14 || r[r.length - 1] !== 0x10) throw new Error('resposta estranha do bootloader');
    return r.slice(1, -1);
  }

  /* Reinicia a placa pelo DTR/RTS e conversa com o bootloader. O optiboot
   * pisca o LED por uns 300 ms antes de ler a serial e desiste depois de 1 s
   * sem conversa; se a primeira tentativa cair durante as piscadas e se
   * perder, reinicia de novo e espera um pouco mais antes de chamar. */
  async function sincronizar(c) {
    for (const espera of [50, 320, 180, 480]) {
      await c.sinais(false); await dormir(120); await c.sinais(true);
      await dormir(espera);
      c.limpar();
      await c.escrever([0x30, 0x20]);
      try {
        const r = await c.ler(2, 700);
        if (r[0] === 0x14 && r[1] === 0x10) {
          // confirma com mais uma sincronização (como o avrdude)
          await dormir(20); c.limpar();
          await c.escrever([0x30, 0x20]);
          const r2 = await c.ler(2, 500);
          if (r2[0] === 0x14 && r2[1] === 0x10) { c.limpar(); return true; }
        }
      } catch (e) { /* tenta de novo, reiniciando a placa */ }
    }
    return false;
  }

  async function gravarImagem(porta, img, trechos, avisar) {
    let c = null, ok = false;
    for (const baud of [115200, 57600]) {
      c = new Conexao(porta);
      try { await c.abrir(baud); } catch (e) {
        throw new Error('Não consegui abrir a porta USB. Feche outros programas que usam a placa (Arduino IDE, outra aba da MIDE) e tente de novo.');
      }
      avisar(`Procurando o bootloader a ${baud} baud…`);
      if (await sincronizar(c)) { ok = true; break; }
      await c.fechar();
    }
    if (!ok) throw new Error('A placa não respondeu ao pedido de gravação. Confira o cabo USB, se é um Arduino Uno e tente de novo (às vezes ajuda apertar o botão RESET da placa logo depois de clicar em Upload).');
    try {
      const sig = await comando(c, [0x75], 3);
      const assinatura = [...sig].map((x) => x.toString(16).padStart(2, '0')).join(' ');
      if (!(sig[0] === 0x1E && sig[1] === 0x95 && [0x0F, 0x14, 0x16].includes(sig[2]))) {
        throw new Error(`Esta placa não parece um Arduino Uno (assinatura ${assinatura}). A MIDE web grava só no Uno.`);
      }
      avisar(`Arduino Uno encontrado (ATmega328P, assinatura ${assinatura}).`);
      await comando(c, [0x50], 0);   // entra no modo de programação
      // Páginas a gravar. Trecho marcado como 'firmware' (a MIDE VM, igual em todo
      // upload): se a primeira, a do meio e a última já estão iguais na placa, o
      // firmware já está lá e só o programa do aluno é gravado (upload rápido).
      const lerPagina = async (a) => {
        await comando(c, [0x55, (a >> 1) & 0xFF, (a >> 9) & 0xFF], 0);
        return comando(c, [0x74, 0x00, 0x80, 0x46], 128, 1000);
      };
      const igual = (lido, a) => lido.every((x, i) => x === img[a + i]);
      const tarefas = [];   // {a, conferirAntes}
      for (const [ini, fim, tipo] of trechos) {
        const pags = [];
        for (let a = ini - (ini % 128); a < fim; a += 128) pags.push(a);
        if (tipo === 'firmware' && pags.length > 3) {
          const amostra = [pags[0], pags[pags.length >> 1], pags[pags.length - 1]];
          let todas = true;
          for (const a of amostra) if (!igual(await lerPagina(a), a)) { todas = false; break; }
          if (todas) { avisar('O firmware da MIDE já está na placa: gravando só o seu programa.'); continue; }
          for (const a of pags) tarefas.push({ a, conferirAntes: false });
        } else for (const a of pags) tarefas.push({ a, conferirAntes: true });
      }
      let escritas = 0, iguais = 0;
      for (let k = 0; k < tarefas.length; k++) {
        const { a, conferirAntes } = tarefas[k];
        if (conferirAntes && igual(await lerPagina(a), a)) { iguais++; PROGRESSO.pct = (k + 1) / tarefas.length; continue; }
        await comando(c, [0x55, (a >> 1) & 0xFF, (a >> 9) & 0xFF], 0);
        await comando(c, [0x64, 0x00, 0x80, 0x46, ...img.slice(a, a + 128)], 0, 1500);
        if (!igual(await lerPagina(a), a)) throw new Error(`A conferência falhou no endereço 0x${a.toString(16)}. Tente gravar de novo.`);
        escritas++;
        PROGRESSO.pct = (k + 1) / tarefas.length;
      }
      await comando(c, [0x51], 0);   // sai do modo de programação: a placa reinicia com o programa novo
      return { escritas, iguais, total: tarefas.length };
    } finally {
      await c.fechar();
    }
  }


  const api = { Conexao, gravarImagem, PROGRESSO, marcar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.MideSerial = api;
})(typeof window !== 'undefined' ? window : globalThis);
