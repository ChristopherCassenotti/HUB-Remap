
/* ════════════════════════════════════════
   REMAP AUTO UPDATE SEGURO
   Atualiza sozinho quando alguém altera tarefas/supervisão,
   mas não mexe na tela enquanto alguém estiver digitando/editando.
   ════════════════════════════════════════ */
(function(){
  if (window.__remapAutoUpdateSeguroInstalled) return;
  window.__remapAutoUpdateSeguroInstalled = true;

  const API_CHECK = 'api/check_updates.php';
  const API_SYNC = 'api/sync.php';

  let lastTasksUpdate = null;
  let lastSupervisaoUpdate = null;
  let isChecking = false;
  let firstRun = true;

  let lastUserInteractionAt = 0;

  function markUserInteraction() {
    lastUserInteractionAt = Date.now();
  }

  ['input','keydown','mousedown','touchstart','change'].forEach(evt => {
    document.addEventListener(evt, markUserInteraction, true);
  });

  function isEditingSomething() {
    const recentInteraction = (Date.now() - lastUserInteractionAt) < 2500;

    return !!(
      recentInteraction ||
      document.querySelector('input:focus') ||
      document.querySelector('textarea:focus') ||
      document.querySelector('select:focus') ||
      document.querySelector('.modal-overlay:not(.hidden)') ||
      document.querySelector('.task-modal-overlay:not(.hidden)') ||
      document.querySelector('.inline-task-form') ||
      document.querySelector('[contenteditable="true"]:focus')
    );
  }

  function getActivePage() {
    const active = document.querySelector('.page.active');
    return active && active.id ? active.id.replace('page-', '') : '';
  }

  function nativeSet(key, value) {
    try {
      if (window.__remapSetStateItem) {
        window.__remapSetStateItem(key, value);
      } else {
        window.__remapApplyingRemote = true;
        localStorage.setItem(key, value);
        window.__remapApplyingRemote = false;
      }
    } catch(e) {
      window.__remapApplyingRemote = false;
    }
  }

  async function pullSyncFromDb() {
    const res = await fetch(API_SYNC + '?_=' + Date.now(), { cache: 'no-store' });
    const json = await res.json();

    if (!json || !json.success || !json.data) return null;

    const data = json.data;

    if (data.collabs) nativeSet('tt_collabs_v2', JSON.stringify(data.collabs));
    if (data.clients) nativeSet('tt_clients_v2', JSON.stringify(data.clients));
    if (data.metas) nativeSet('tt_metas_v2', JSON.stringify(data.metas));
    if (data.descontos) nativeSet('tt_descontos_v1', JSON.stringify(data.descontos));
    if (data.pontos) nativeSet('tt_pontos_tarefas_v1', JSON.stringify(data.pontos));
    if (data.taskPoints) nativeSet('tt_taskpoints_v1', JSON.stringify(data.taskPoints));
    if (data.entries) nativeSet('tt_entries_v2', JSON.stringify(data.entries));
    if (data.tarefas) {
      const normalizedTasks = (typeof remapNormalizeTarefasData === 'function') ? remapNormalizeTarefasData(data.tarefas) : data.tarefas;
      window.__tarefasData = normalizedTasks;
      try { _store.tarefas = normalizedTasks; } catch(e) {}
      nativeSet('tt_tarefas_v1', JSON.stringify(normalizedTasks));
    }

    return data;
  }

  function renderTarefasOnly() {
    const page = getActivePage();

    try { if (typeof renderKanban === 'function') renderKanban(); } catch(e) {}
    try { if (typeof renderPersonalTasks === 'function') renderPersonalTasks(); } catch(e) {}
    try { if (typeof renderPainel === 'function' && page === 'painel') renderPainel(); } catch(e) {}
    try { if (typeof renderTasks === 'function') renderTasks(); } catch(e) {}
    try { if (typeof updateTaskDropdown === 'function') updateTaskDropdown(); } catch(e) {}
    try { if (typeof updateRetroTaskDropdown === 'function') updateRetroTaskDropdown(); } catch(e) {}
  }

  function renderSupervisaoOnly() {
    const page = getActivePage();

    // Proteção igual às tarefas: atualiza apenas as telas relacionadas
    // e evita redesenhar "Meu grupo" fora de hora.
    const isSupervisaoPage = page === 'supervisao';
    const isDesempenhoPage = page === 'desempenho' || page === 'performance' || page === 'dashboard' || page === 'equipe' || page === 'metas' || page === 'descontos';

    if (isSupervisaoPage) {
      try { if (typeof renderSupervisao === 'function') renderSupervisao(); } catch(e) {}
      try { if (typeof renderGroupSupervision === 'function') renderGroupSupervision(); } catch(e) {}
      try { if (typeof renderSupervisaoGrupo === 'function') renderSupervisaoGrupo(); } catch(e) {}
      try { if (typeof renderSupervisorPage === 'function') renderSupervisorPage(); } catch(e) {}
      return;
    }

    if (isDesempenhoPage) {
      try { if (typeof renderDesempenho === 'function') renderDesempenho(); } catch(e) {}
      try { if (typeof renderPerformance === 'function') renderPerformance(); } catch(e) {}
      try { if (typeof renderMetasGrid === 'function') renderMetasGrid(); } catch(e) {}
      try { if (typeof renderDescontos === 'function') renderDescontos(); } catch(e) {}
      try { if (typeof renderDashboard === 'function') renderDashboard(); } catch(e) {}
      try { if (typeof renderTeam === 'function') renderTeam(); } catch(e) {}
    }
  }

  async function checkUpdates() {
    if (isChecking) return;
    if (isEditingSomething()) return;

    isChecking = true;

    try {
      const res = await fetch(API_CHECK + '?_=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();

      if (!data || data.success === false) return;

      const tasksStamp = data.tarefas_updated_at || null;
      const supervisaoStamp = data.supervisao_updated_at || null;

      if (firstRun) {
        lastTasksUpdate = tasksStamp;
        lastSupervisaoUpdate = supervisaoStamp;
        firstRun = false;

        await pullSyncFromDb();
        // Na primeira carga, não força render global.
        // Cada página renderiza normalmente ao ser aberta.
        if (getActivePage() === 'tarefas' || getActivePage() === 'painel') renderTarefasOnly();
        if (getActivePage() === 'supervisao') renderSupervisaoOnly();
        return;
      }

      const tasksChanged = tasksStamp && tasksStamp !== lastTasksUpdate;
      const supervisaoChanged = supervisaoStamp && supervisaoStamp !== lastSupervisaoUpdate;

      if (tasksChanged || supervisaoChanged) {
        await pullSyncFromDb();

        if (tasksChanged) renderTarefasOnly();
        if (supervisaoChanged) renderSupervisaoOnly();

        lastTasksUpdate = tasksStamp;
        lastSupervisaoUpdate = supervisaoStamp;
      }
    } catch(e) {
      console.warn('[Remap] atualização automática falhou:', e);
    } finally {
      isChecking = false;
    }
  }

  window.__remapCheckUpdates = checkUpdates;
  window.__remapPullSyncFromDb = pullSyncFromDb;
  window.__remapIsEditingSomething = isEditingSomething;

  setTimeout(checkUpdates, 600);
  setInterval(checkUpdates, 2500);
})();
