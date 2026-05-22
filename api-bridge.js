
/* ════════════════════════════════════════
   REMAP API BRIDGE — banco como fonte principal
   LocalStorage persistente apenas para: sessão, token e painel pessoal.
   Todo o restante fica em memória e sincroniza com a API.
   ════════════════════════════════════════ */
(function(){
  const API_STATE_URL = 'api/state.php';
  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;

  window.__remapNativeGetItem = nativeGet;
  window.__remapNativeSetItem = nativeSet;
  window.__remapNativeRemoveItem = nativeRemove;
  window.__remapVolatileState = window.__remapVolatileState || {};

  const saveTimers = {};
  const bootKeys = new Set();

  function safeParse(txt) {
    try { return JSON.parse(txt); } catch(e) { return null; }
  }

  function isPersistentLocalKey(key) {
    return key === 'tt_user_v2' || key === 'tt_api_token' || /^tt_painel_/.test(key || '');
  }

  function isRemapKey(key) {
    return typeof key === 'string' && key.startsWith('tt_');
  }

  function cleanupOldLocalStorage() {
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (isRemapKey(key) && !isPersistentLocalKey(key)) toRemove.push(key);
      }
      toRemove.forEach(key => nativeRemove.call(localStorage, key));
    } catch(e) {}
  }

  function setStateValue(key, value) {
    if (isRemapKey(key) && !isPersistentLocalKey(key)) {
      window.__remapVolatileState[key] = String(value);
      try { nativeRemove.call(localStorage, key); } catch(e) {}
      return;
    }
    nativeSet.call(localStorage, key, value);
  }

  function getStateValue(key) {
    if (isRemapKey(key) && !isPersistentLocalKey(key) && Object.prototype.hasOwnProperty.call(window.__remapVolatileState, key)) {
      return window.__remapVolatileState[key];
    }
    return nativeGet.call(localStorage, key);
  }

  function removeStateValue(key) {
    if (isRemapKey(key) && !isPersistentLocalKey(key)) {
      delete window.__remapVolatileState[key];
      try { nativeRemove.call(localStorage, key); } catch(e) {}
      return;
    }
    nativeRemove.call(localStorage, key);
  }

  window.__remapIsPersistentLocalKey = isPersistentLocalKey;
  window.__remapSetStateItem = setStateValue;
  window.__remapGetStateItem = getStateValue;
  window.__remapRemoveStateItem = removeStateValue;

function renderTmDescPreview() {
  const descEl = document.getElementById('tmDesc');
  const previewEl = document.getElementById('tmDescPreview');

  if (!descEl || !previewEl) return;

  const text = descEl.value || '';

  previewEl.innerHTML = text ? linkifyText(text) : '<span style="color:var(--muted)">Sem descrição</span>';

  descEl.classList.add('hidden');
  previewEl.classList.remove('hidden');
}

function editTmDesc() {
  const descEl = document.getElementById('tmDesc');
  const previewEl = document.getElementById('tmDescPreview');

  if (!descEl || !previewEl) return;

  previewEl.classList.add('hidden');
  descEl.classList.remove('hidden');
  descEl.focus();
}

function finishEditTmDesc() {
  saveTaskFromModal();
  renderTmDescPreview();
}

  function loadRemoteStateSync() {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', API_STATE_URL + '?all=1&_=' + Date.now(), false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = safeParse(xhr.responseText);
        if (res && res.success && res.data) {
          Object.keys(res.data).forEach(key => {
            if (res.data[key] !== null && res.data[key] !== undefined) {
              bootKeys.add(key);
              setStateValue(key, typeof res.data[key] === 'string' ? res.data[key] : JSON.stringify(res.data[key]));
            }
          });
        }
      }
    } catch(e) {
      console.warn('API bridge: não foi possível carregar estado remoto.', e);
    }
  }

  async function saveRemoteState(key, value) {
    if (!isRemapKey(key)) return;
    if (isPersistentLocalKey(key)) return;

    clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(async () => {
      try {
        await fetch(API_STATE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        });
      } catch(e) {
        console.warn('API bridge: falha ao salvar estado remoto.', key, e);
      }
    }, 50);
  }

  Storage.prototype.getItem = function(key) {
    return getStateValue(key);
  };

  Storage.prototype.setItem = function(key, value) {
    setStateValue(key, value);
    saveRemoteState(key, value);
  };

  Storage.prototype.removeItem = function(key) {
    removeStateValue(key);
    if (isRemapKey(key) && !isPersistentLocalKey(key)) {
      saveRemoteState(key, null);
    }
  };

  window.__remoteStateReload = function(){
    loadRemoteStateSync();
  };

  cleanupOldLocalStorage();
  loadRemoteStateSync();
  cleanupOldLocalStorage();
})();
