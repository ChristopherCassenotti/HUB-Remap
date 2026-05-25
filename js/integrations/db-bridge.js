
(function(){
  if (window.__remapFullDbBridgeInstalled) return;
  window.__remapFullDbBridgeInstalled = true;

  const API = 'api/full_state.php';
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  window.__remapNativeSetItem = nativeSet;
  window.__remapNativeRemoveItem = nativeRemove;
  const saveTimers = {};
  let applyingRemote = false;
  let lastPayloadHash = '';

  function safeParse(v, fallback){
    try { return JSON.parse(v); } catch(e){ return fallback; }
  }

  function normalizePayload(data){
    if (!data || !data.success || !data.data) return null;
    return data.data;
  }

  function applyRemote(data){
      if (data.tarefas) {
  window.__tarefasData = data.tarefas;
}
    if (!data) return false;
    applyingRemote = true;
    window.__remapApplyingRemote = true;

    const map = {
      collabs: 'tt_collabs_v2',
      clients: 'tt_clients_v2',
      metas: 'tt_metas_v2',
      taskpoints: 'tt_taskpoints_v1',
      descontos: 'tt_descontos_v1',
      entries: 'tt_entries_v2',
      tarefas: 'tt_tarefas_v1'
    };

    Object.keys(map).forEach(k => {
      if (data[k] !== undefined && data[k] !== null) {
        const value = (k === 'tarefas' && typeof remapNormalizeTarefasData === 'function') ? remapNormalizeTarefasData(data[k]) : data[k];
        if (k === 'tarefas') { window.__tarefasData = value; try { _store.tarefas = value; } catch(e) {} }
        nativeSet.call(localStorage, map[k], JSON.stringify(value));
      }
    });

    applyingRemote = false;
    window.__remapApplyingRemote = false;
    return true;
  }

  async function fetchRemote(){
    try {
      const res = await fetch(API + '?_=' + Date.now(), { cache:'no-store' });
      const json = await res.json();
      const payload = normalizePayload(json);
      const hash = JSON.stringify(payload);
      if (payload && hash !== lastPayloadHash) {
        lastPayloadHash = hash;
        applyRemote(payload);
        rerenderCurrent();
      }
      return payload;
    } catch(e) {
      console.warn('Falha ao buscar dados do banco:', e);
      return null;
    }
  }

  function fetchRemoteSync(){
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', API + '?_=' + Date.now(), false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        const json = safeParse(xhr.responseText, null);
        const payload = normalizePayload(json);
        if (payload) {
          lastPayloadHash = JSON.stringify(payload);
          applyRemote(payload);
          return payload;
        }
      }
    } catch(e) {
      console.warn('Falha ao buscar dados sync:', e);
    }
    return null;
  }

  async function saveKey(key, value){
    if (applyingRemote || window.__remapApplyingRemote) return;
    if (!key || !key.startsWith('tt_')) return;
    // Tarefas são salvas pelo bloco REMAP TASK DB DIRECT SAVE, evitando duplicidade.
    if (key === 'tt_tarefas_v1') return;
    if (window.__remapIsPersistentLocalKey && window.__remapIsPersistentLocalKey(key)) return;
    if (key === 'tt_user_v2' || key === 'tt_api_token') return;

    clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(async () => {
      try {
        await fetch(API, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify({ key, value })
        });
        await fetchRemote();
      } catch(e) {
        console.warn('Falha ao salvar no banco:', key, e);
      }
    }, 100);
  }

  Storage.prototype.setItem = function(key, value){
    nativeSet.call(this, key, value);
    saveKey(key, value);
  };

  Storage.prototype.removeItem = function(key){
    nativeRemove.call(this, key);
    if (!applyingRemote && key && key.startsWith('tt_') && !(window.__remapIsPersistentLocalKey && window.__remapIsPersistentLocalKey(key)) && key !== 'tt_user_v2' && key !== 'tt_api_token') {
      saveKey(key, null);
    }
  };

  function rerenderCurrent(){
    try {
      if (typeof renderTeam === 'function') renderTeam();
      if (typeof renderMetasGrid === 'function') renderMetasGrid();
      if (typeof renderDescontos === 'function') renderDescontos();
      if (typeof renderPointsConfig === 'function') renderPointsConfig();
      if (typeof renderDesempenho === 'function') renderDesempenho();
      if (typeof renderPerformance === 'function') renderPerformance();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderClients === 'function') renderClients();
      if (typeof renderKanban === 'function') renderKanban();
      if (typeof renderPainel === 'function') renderPainel();
      if (typeof renderMyWork === 'function') renderMyWork();
      if (typeof updateTimerClientSelect === 'function') updateTimerClientSelect();
      if (typeof fillClientDatalist === 'function') fillClientDatalist();

      const active = document.querySelector('.page.active');
      if (active && typeof showPage === 'function') {
        const pageName = active.id ? active.id.replace('page-', '') : '';
        if (pageName) {
          try { showPage(pageName); } catch(e) {}
        }
      }
    } catch(e) {
      console.warn('Falha ao redesenhar:', e);
    }
  }

  // Override login para garantir dados frescos logo após entrar.
  window.__remapOriginalOpenApp = window.openApp;
  if (typeof window.openApp === 'function') {
    window.openApp = function(){
      fetchRemoteSync();
      window.__remapOriginalOpenApp();
      setTimeout(rerenderCurrent, 150);
    };
  }

  // Override saveCollab para persistir equipe no banco imediatamente.
  window.__remapOriginalSaveCollab = window.saveCollab;
  if (typeof window.saveCollab === 'function') {
    window.saveCollab = function(){
      window.__remapOriginalSaveCollab();
      setTimeout(async () => {
        await fetchRemote();
        rerenderCurrent();
      }, 350);
    };
  }

  // Override saveMeta, se existir.
  window.__remapOriginalSaveMeta = window.saveMeta;
  if (typeof window.saveMeta === 'function') {
    window.saveMeta = function(){
      window.__remapOriginalSaveMeta();
      setTimeout(async () => {
        await fetchRemote();
        rerenderCurrent();
      }, 350);
    };
  }

  // Override saveDesconto/applyDesconto, se existirem.
  ['saveDesconto','applyDesconto','saveDiscount','applyDiscount'].forEach(fn => {
    if (typeof window[fn] === 'function') {
      const original = window[fn];
      window['__remapOriginal_' + fn] = original;
      window[fn] = function(){
        const ret = original.apply(this, arguments);
        setTimeout(async () => {
          await fetchRemote();
          rerenderCurrent();
        }, 350);
        return ret;
      };
    }
  });

  // Override funções comuns de registro/pontuação.
  ['saveTaskPoint','saveTaskPoints','addTaskPoint','completeTask','toggleTaskDone','saveTaskModal','saveTask'].forEach(fn => {
    if (typeof window[fn] === 'function') {
      const original = window[fn];
      window['__remapOriginal_' + fn] = original;
      window[fn] = function(){
        const ret = original.apply(this, arguments);
        setTimeout(async () => {
          await fetchRemote();
          rerenderCurrent();
        }, 350);
        return ret;
      };
    }
  });

  window.__remoteStateReload = fetchRemoteSync;
  window.__remapDbRefresh = fetchRemote;
  window.__remapRerender = rerenderCurrent;

  fetchRemoteSync();
  // Polling geral desativado. O check_updates.php passa a controlar
  // quando realmente buscar e redesenhar dados, sem atrapalhar digitação.
  // setInterval(fetchRemote, 1500);
})();
