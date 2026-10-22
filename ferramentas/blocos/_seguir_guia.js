/* Injetado no navegador pelos testes: faz o papel do aluno seguindo o guia. A cada passo,
   lê GUIA.ultimo e faz exatamente o que a instrução pede, usando o bloco da toolbox (com os
   encaixes que ele traz), como o arrastar faria. Devolve o resumo da missão. */
window.__seguirGuia = async function (limite) {
  const ws = estadoBlocos.workspace;
  const espera = () => new Promise((r) => setTimeout(r, 0));
  const log = [];
  for (let n = 0; n < (limite || 600); n++) {
    guiaAtualizar();
    const r = GUIA.ultimo;
    if (!r) return { ok: false, erro: 'sem guia', log };
    if (r.completo) return { ok: true, passos: n, log };
    if (r.extras && r.extras.length) return { ok: false, erro: 'extras: ' + r.extras.map((b) => b.type).join(','), log };
    const p = r.passo;
    const texto = guiaTextoDoPasso(r).texto;
    log.push(texto);
    if (p.tipo === 'bloco') {
      if (r.errado) return { ok: false, erro: 'bloco errado no caminho: ' + r.errado.type, log };
      if (!p.item) return { ok: false, erro: 'bloco ' + p.no.type + ' não está na toolbox', log };
      if (!p.categoria) return { ok: false, erro: 'bloco ' + p.no.type + ' sem categoria', log };
      const def = JSON.parse(JSON.stringify(p.item)); delete def.kind;
      const b = Blockly.serialization.blocks.append(def, ws);
      if (p.lugar.tipo === 'topo') { b.moveBy(20 + 40 * (n % 5), 20 + 30 * n); }
      else {
        const pai = r.pai;
        if (!pai) return { ok: false, erro: 'sem pai para ' + p.no.type, log };
        const con = p.lugar.tipo === 'proximo' ? pai.nextConnection : pai.getInput(p.lugar.nome).connection;
        const minha = b.outputConnection || b.previousConnection;
        if (!con || !minha) return { ok: false, erro: 'sem encaixe ' + p.no.type, log };
        try { con.connect(minha); } catch (e) { return { ok: false, erro: 'não encaixou ' + p.no.type + ': ' + e.message, log }; }
        if (!b.getParent()) return { ok: false, erro: 'não encaixou ' + p.no.type, log };
      }
    } else if (p.tipo === 'campo') {
      const f = r.bloco && r.bloco.getField(p.campo);
      if (!f) return { ok: false, erro: 'campo ' + p.campo + ' não existe em ' + (r.bloco && r.bloco.type), log };
      if (typeof f.getVariable === 'function') {
        const mapa = ws.getVariableMap(); const v = mapa.getVariable(p.valor) || mapa.createVariable(p.valor);
        f.setValue(v.getId());
      } else f.setValue(p.valor);
      if (!guiaIgual(guiaCampoVivo(r.bloco, p.campo), p.valor)) return { ok: false, erro: 'campo ' + p.campo + ' não aceitou ' + p.valor, log };
    } else {
      const b = r.bloco;
      b.loadExtraState ? b.loadExtraState(p.no.extraState) : b.domToMutation && b.domToMutation(Blockly.utils.xml.textToDom('<mutation></mutation>'));
    }
    await espera();
  }
  return { ok: false, erro: 'passos demais', log };
};
