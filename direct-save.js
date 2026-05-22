
/* REMAP TASK DB DIRECT SAVE — garante que tarefas vão para o banco */
(function(){
  if (window.__remapTaskDirectSaveInstalled) return;
  window.__remapTaskDirectSaveInstalled = true;

  let taskSaveTimer = null;

  window.__remapSaveTarefasToDb = function(data){
    clearTimeout(taskSaveTimer);
    taskSaveTimer = setTimeout(async () => {
      try {
        await fetch('api/sync.php', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({
            key: 'tt_tarefas_v1',
            value: JSON.stringify(data)
          })
        });

        if (typeof window.__remapCheckUpdates === 'function') {
          setTimeout(window.__remapCheckUpdates, 250);
        }
      } catch(e) {
        console.warn('[Remap] Não foi possível salvar tarefas no banco:', e);
      }
    }, 120);
  };
})();
