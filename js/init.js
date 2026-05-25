window.addEventListener('load', () => {
  seedDemoData();

  ['loginName', 'loginPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => {
      if (e.key === 'Enter') login();
    });
  });

  currentUser = getSession();
  if (currentUser) openApp();
});

// Sincroniza alterações de tarefas entre abas/janelas abertas do sistema
window.addEventListener('storage', (e) => {
  if (e.key === 'tt_tarefas_v1') {
    renderKanban();
    renderPersonalTasks();
  }
});

window.__remapLastStateSignature = '';
function __remapGetStateSignature() {
  const keys = [
    'tt_clients_v2',
    'tt_collabs_v2',
    'tt_tarefas_v1',
    'tt_metas_v2',
    'tt_entries_v2',
    'tt_taskpoints_v1',
    'tt_descontos_v1',
    'tt_supervisors_v1'
  ];
  return keys.map(k => `${k}:${localStorage.getItem(k) || ''}`).join('|');
}
function __remapRenderActivePage() {
  try {
    const activePage = document.querySelector('.page.active');
    const activeId = activePage ? activePage.id.replace('page-', '') : 'painel';

    // Atualiza listas globais usadas por selects e datalists
    try { fillClientDatalist(); } catch(e) {}
    try { updateTaskDropdown(); } catch(e) {}
    try { updateRetroTaskDropdown(); } catch(e) {}

    // Usa a navegação original do sistema para renderizar a página atual
    if (typeof showPage === 'function') showPage(activeId);

    // Garante atualização das áreas que aparecem em mais de uma tela
    try { renderKanban(); } catch(e) {}
    try { renderPersonalTasks(); } catch(e) {}
    try { renderPainel(); } catch(e) {}
  } catch(e) {
    console.warn('Falha ao redesenhar tela após sincronização:', e);
  }
}
function __remapSyncAndRender() {
  try {
    const before = __remapGetStateSignature();
    if (window.__remoteStateReload) window.__remoteStateReload();
    const after = __remapGetStateSignature();
    if (after !== before) {
      window.__remapLastStateSignature = after;
      __remapRenderActivePage();
    }
  } catch(e) {
    console.warn('Falha ao sincronizar estado remoto:', e);
  }
}
window.addEventListener('load', () => {
  window.__remapLastStateSignature = __remapGetStateSignature();
  // setInterval(__remapSyncAndRender, 1500); // desativado
});

/* REMAP AUTO SYNC — pontos, metas, descontos e desempenho */
(function(){
  if (window.__remapPointsSyncInstalled) return;
  window.__remapPointsSyncInstalled = true;

  function activePageId(){
    const active = document.querySelector('.page.active');
    return active ? active.id : '';
  }

  function rerenderActive(){
    try {
      const page = activePageId();

      if (typeof renderPointsPage === 'function') renderPointsPage();
      if (typeof renderMetasGrid === 'function') renderMetasGrid();
      if (typeof renderDescontos === 'function') renderDescontos();
      if (typeof renderDesempenho === 'function') renderDesempenho();
      if (typeof renderPerformance === 'function') renderPerformance();
      if (typeof renderDashboard === 'function') renderDashboard();

      if (typeof showPage === 'function' && page) {
        const pageName = page.replace('page-', '');
        // Reaplica apenas se a função existir e sem trocar a aba visual.
        try { showPage(pageName); } catch(e) {}
      }
    } catch(e) {
      console.warn('Falha ao redesenhar dados de pontuação:', e);
    }
  }

  // Atualização por intervalo desativada aqui para evitar conflito com o
  // REMAP AUTO UPDATE SEGURO, que já respeita usuário digitando/editando.
  // setInterval(() => {
  //   try {
  //     if (window.__remoteStateReload) {
  //       window.__remoteStateReload();
  //       rerenderActive();
  //     }
  //   } catch(e) {}
  // }, 1800);

  window.__remapRerenderPoints = rerenderActive;
})();
