/* Navigation and progress for the Academy visual identity. Uses the real curriculum. */
'use strict';
function atualizarAcademyProgresso() {
  const feitas = FASES.filter(f => progresso.feitas[f.id]).length;
  const percentual = FASES.length ? Math.round(feitas / FASES.length * 100) : 0;
  $('#curriculo-progresso').style.setProperty('--progress', percentual + '%');
  $('#curriculo-progresso').setAttribute('aria-valuenow', percentual);
  $('#curriculo-percentual').textContent = percentual + '%';
  $('#xp-progresso').max = XP_POR_NIVEL;
  $('#xp-progresso').value = progresso.xp % XP_POR_NIVEL;
  $('#xp-progresso').title = `${progresso.xp % XP_POR_NIVEL} de ${XP_POR_NIVEL} XP para o próximo nível`;
  $('#bt-professor').setAttribute('aria-pressed', String(estado.professor));
}

function mostrarConquistas() {
  const feitas = FASES.filter(f => progresso.feitas[f.id]).length;
  abrirModal('Suas conquistas', `<p><b>Nível ${nivelDe(progresso.xp)}</b> · ${progresso.xp} XP · ${feitas} de ${FASES.length} medalhas. Cada missão concluída com upload vale uma medalha.</p>` +
    '<div class="conquista-lista">' + MODULOS.map(m => {
      const fases = fasesDoModulo(m.id);
      const n = fases.filter(f => progresso.feitas[f.id]).length;
      return `<div class="conquista-card"><img src="${ASSETS}${m.icone}" alt=""><strong>${escapar(m.nome)}</strong><small>${n}/${fases.length} missões concluídas</small><progress max="${fases.length}" value="${n}" aria-label="${escapar(m.nome)}: ${n} de ${fases.length}"></progress></div>`;
    }).join('') + '</div>');
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarAcademyProgresso();
  const painelObserver = new ResizeObserver(atualizarDicaRolar);
  painelObserver.observe($('#didatico'));
  painelObserver.observe($('#did-conteudo'));
  $('#nav-inicio').addEventListener('click', () => {
    abrirModal('Aprender hoje. Criar o amanhã.', '<p>Seu próximo circuito começa com uma ideia. Explore os módulos, leia a montagem e pratique o código linha por linha.</p>' +
      (estado.fase ? `<p><b>Sua missão atual:</b> ${escapar(estado.fase.nome)}</p>` : '<p>Monte um programa em <b>Blocos</b> ou em Python e envie ao hub. Os exemplos ficam na lateral.</p>'), [
        { rotulo:'Guia de introdução', acao:() => { acGuia(); return false; } },
        { rotulo:'Continuar aprendendo', primario:true },
      ]);
  });
  $('#nav-modulos').addEventListener('click', () => {
    $('#lateral').scrollIntoView({ behavior:'smooth', block:'nearest' });
    $('#lista-fases .grupo-mod.selecionado')?.focus();
  });
  $('#nav-projetos').addEventListener('click', () => {
    abrirModal('Seus projetos', '<p>Experimente suas ideias no Editor C++ ou abra um sketch salvo no computador.</p>' +
      `<div class="card-info"><span>Projeto atual: <b>${escapar($('#rotulo-sketch').textContent)}</b></span></div>`, [
        { rotulo:'Abrir sketch', acao:acAbrirSketch },
        { rotulo:'Novo sketch', acao:acNovoSketch },
        { rotulo:'Ir para o editor', primario:true, acao:() => trocarAba('livre') },
      ]);
  });
  for (const id of ['nav-conquistas', 'bt-medalhas', 'incentivo']) $('#' + id).addEventListener('click', mostrarConquistas);
  $('#nav-ajuda').addEventListener('click', acGuia);
  $('#bt-professor').addEventListener('click', acModoProfessor);
  $('#bt-perfil').addEventListener('click', acPreferencias);
  document.addEventListener('click', ev => {
    if (!ev.target.closest('#ferramentas-ide')) $('#ferramentas-ide').open = false;
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') $('#ferramentas-ide').open = false;
  });
});
