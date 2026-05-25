let retroMode = 'horario';
const retroIds = []; // IDs exibidos na tabela de registros retroativos do usuário logado

function getRetroUserStorageKey() {
  const userKey = normalizePersonName(currentUser?.name || 'anonimo').replace(/[^a-z0-9]+/g, '_') || 'anonimo';
  return `tt_retro_ids_v1_${userKey}`;
}

function getRetroWindowKey() {
  return `__retroIds_${getRetroUserStorageKey()}`;
}

function getRetroIds() {
  let ids = [];
  const storageKey = getRetroUserStorageKey();
  const windowKey = getRetroWindowKey();

  if (window.__lastRetroUserStorageKey !== storageKey) {
    retroIds.splice(0, retroIds.length);
    window.__lastRetroUserStorageKey = storageKey;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) ids = saved;
  } catch (e) {}

  if (Array.isArray(window[windowKey])) {
    ids = ids.concat(window[windowKey]);
  }

  if (Array.isArray(retroIds)) {
    ids = ids.concat(retroIds);
  }

  const unique = [];
  const seen = new Set();

  ids.forEach(id => {
    const key = String(id || '').trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(key);
  });

  window[windowKey] = unique;
  retroIds.splice(0, retroIds.length, ...unique);

  return unique;
}

function setRetroIds(ids) {
  const unique = [];
  const seen = new Set();
  const storageKey = getRetroUserStorageKey();
  const windowKey = getRetroWindowKey();

  (Array.isArray(ids) ? ids : []).forEach(id => {
    const key = String(id || '').trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(key);
  });

  window[windowKey] = unique;
  retroIds.splice(0, retroIds.length, ...unique);

  try {
    localStorage.setItem(storageKey, JSON.stringify(unique));
    localStorage.removeItem('tt_retro_ids_v1');
  } catch (e) {}

  return unique;
}

async function persistRetroState(entries, ids) {
  set('entries', entries);
  setRetroIds(ids);

  // O histórico geral fica em tt_entries_v2 para dashboard/supervisão.
  // A lista de IDs do retroativo é local por usuário para não misturar registros.
  try {
    if (typeof remapPersistStateNow === 'function') {
      await remapPersistStateNow('tt_entries_v2', entries);
    }
  } catch (e) {
    console.warn('[Retroativo] Não foi possível forçar persistência do estado local.', e);
  }
}

function normalizeRetroEntry(entry) {
  if (!entry) return null;

  const id = String(entry.id || entry.uid_local || entry.uidLocal || '').trim();
  if (!id) return null;

  return {
    ...entry,
    id,
    user: entry.user || entry.usuario || currentUser?.name || '',
    role: entry.role || entry.cargo || currentUser?.role || '',
    isRetroativo: true,
    source: entry.source || 'retroativo'
  };
}

async function addRetroEntryToLocal(entry) {
  const safeEntry = normalizeRetroEntry(entry);
  if (!safeEntry) return;

  const currentEntries = Array.isArray(getEntries()) ? getEntries() : [];

  // Remove duplicados pelo ID local e também pelo ID retornado do banco, se existir.
  const filteredEntries = currentEntries.filter(item => {
    const sameLocalId = String(item?.id || '') === String(safeEntry.id);
    const sameDbId = safeEntry.dbId && String(item?.dbId || '') === String(safeEntry.dbId);
    return !sameLocalId && !sameDbId;
  });

  const updatedEntries = [safeEntry, ...filteredEntries];

  const updatedRetroIds = [
    safeEntry.id,
    ...getRetroIds().filter(id => String(id) !== String(safeEntry.id))
  ];

  await persistRetroState(updatedEntries, updatedRetroIds);
}

function switchRetroMode(mode) {
  retroMode = mode;
  document.querySelectorAll('#retroTabs .tab').forEach((t,i) => {
    t.classList.toggle('active', (i===0 && mode==='horario') || (i===1 && mode==='duracao'));
  });
  document.getElementById('retroModeHorario').style.display = mode === 'horario' ? '' : 'none';
  document.getElementById('retroModeDuracao').style.display = mode === 'duracao' ? '' : 'none';
  updateDurationPreview();
  updateRetroTaskTotal();
}

function fillRetroClientList() {
  const saved = getClients().map(c => c.name);
  const fromEntries = getEntries().map(e => e.client);
  const all = [...new Set([...saved, ...fromEntries].filter(Boolean))].sort();
  const dl = document.getElementById('rClientList');
  if (dl) dl.innerHTML = all.map(c => `<option value="${esc(c)}"></option>`).join('');
}

let retroTaskLineCount = 0;

function updateRetroTaskDropdown() {
  const cat = document.getElementById('rCategoryInput')?.value || 'Design';
  const role = currentUser?.role || '';
  const rows = document.querySelectorAll('.retro-task-line-row');

  rows.forEach(row => {
    const sel = row.querySelector('.retro-task-line-select');
    const currentVal = sel?.value || '';
    _populateTaskSelect(sel, cat, role);
    if (currentVal && [...sel.options].some(opt => String(opt.value) === String(currentVal))) {
      sel.value = currentVal;
    }
    updateRetroLinePreview(row);
  });

  if (!rows.length) {
    addRetroTaskLine();
  }

  updateRetroTaskTotal();
}

function onRetroTaskSelectChange() {
  const sel = document.getElementById('rTaskSelect');
  const preview = document.getElementById('rTaskPointsPreview');
  const label = document.getElementById('rTaskPointsLabel');

  if (!sel || !preview || !label) return;

  if (!sel.value) {
    preview.style.display = 'none';
    return;
  }

  const tp = getTaskPoints().find(p => String(p.id) === String(sel.value));

  if (tp) {
    label.textContent = `⭐ ${tp.points} pontos — ${tp.name}`;
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
    console.warn('[Retroativo] Tarefa selecionada não encontrada na pontuação.', {
      tarefaSelecionada: sel.value
    });
  }
}

function _populateTaskSelect(selEl, category, role) {
  const el = typeof selEl === 'string'
    ? document.getElementById(selEl)
    : selEl;

  if (!el) {
    console.warn('[Tarefas] Select não encontrado para popular tarefas.', { selEl });
    return;
  }

  const filtered = getTaskPointsBySelectedFunction(category, role);
  const selectedLabel = category || role || 'função selecionada';

  el.innerHTML = `<option value="">— Selecione a tarefa —</option>` +
    (filtered.length
      ? filtered.map(p => `
        <option value="${esc(p.id)}">
          ${esc(p.name)} (${formatPointsValue(Number(p.points || 0))} pts)
        </option>
      `).join('')
      : `<option value="" disabled>Nenhuma tarefa cadastrada para ${esc(selectedLabel)}</option>`);
}

function setupRetroListeners() {
  ['rStart','rEnd','rHours','rMinutes','retroPointMode'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.retroListenerBound) {
      const handler = () => {
        if (id === 'rStart' || id === 'rEnd') updateDurationPreview();
        updateRetroTaskTotal();
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
      el.dataset.retroListenerBound = '1';
    }
  });
}

function updateDurationPreview() {
  const start = document.getElementById('rStart')?.value;
  const end   = document.getElementById('rEnd')?.value;
  const el    = document.getElementById('rDurationPreview');

  if (!el) return;
  if (!start || !end) {
    el.textContent = '';
    return;
  }

  const [sh,sm] = start.split(':').map(Number);
  const [eh,em] = end.split(':').map(Number);

  let totalMin = (eh * 60 + em) - (sh * 60 + sm);

  if (totalMin <= 0) {
    el.innerHTML = `<span style="color:var(--red)">⚠ Horário de fim deve ser após o início.</span>`;
    return;
  }

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  el.innerHTML = `<span style="color:var(--green)">✓ Duração: <strong>${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'min' : ''}</strong></span>`;
  updateRetroTaskTotal();
}

async function saveRetroativo() {
  const feedback = document.getElementById('rFeedback');
  const saveBtn = document.querySelector('button[onclick="saveRetroativo()"]');

  if (window.__savingRetroativo) return;

  const client   = document.getElementById('rClientInput')?.value.trim();
  const category = document.getElementById('rCategoryInput')?.value;
  const dateVal  = document.getElementById('rDate')?.value;

  const taskLines = collectRetroTaskLines();
  const taskName = taskLines
    .map(t => Number(t.qty || 1) > 1 ? `${Number(t.qty || 1)}× ${t.name}` : t.name)
    .join(', ');
  const taskBasePoints = getRetroBasePoints(taskLines);
  const pointMode = getRetroPointModeFromForm();
  let taskPoints = taskBasePoints;
  const desc = document.getElementById('rTaskInput')?.value.trim() || '';

  if (!client)           { if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Informe o cliente.</span>`; return; }
  if (!taskLines.length) { if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Adicione pelo menos uma tarefa.</span>`; return; }
  if (!dateVal)          { if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Selecione a data.</span>`; return; }

  let startISO;
  let endISO;
  let durationSeconds;

  try {
    if (retroMode === 'horario') {
      const startT = document.getElementById('rStart')?.value;
      const endT   = document.getElementById('rEnd')?.value;

      if (!startT || !endT) {
        if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Preencha os horários de início e fim.</span>`;
        return;
      }

      const startDate = new Date(`${dateVal}T${startT}:00`);
      const endDate   = new Date(`${dateVal}T${endT}:00`);
      durationSeconds = Math.round((endDate - startDate) / 1000);

      if (durationSeconds <= 0) {
        if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Horário de fim deve ser após o início.</span>`;
        return;
      }

      startISO = startDate.toISOString();
      endISO   = endDate.toISOString();

    } else {
      const hours   = parseInt(document.getElementById('rHours')?.value, 10) || 0;
      const minutes = parseInt(document.getElementById('rMinutes')?.value, 10) || 0;
      durationSeconds = hours * 3600 + minutes * 60;

      if (durationSeconds <= 0) {
        if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Informe pelo menos 1 minuto.</span>`;
        return;
      }

      const startT = document.getElementById('rStartOnly')?.value || '09:00';
      const startDate = new Date(`${dateVal}T${startT}:00`);
      const endDate   = new Date(startDate.getTime() + durationSeconds * 1000);

      startISO = startDate.toISOString();
      endISO   = endDate.toISOString();
    }

    taskPoints = calculateTimerPointsByMode(taskBasePoints, durationSeconds, pointMode);

    const id = 'retro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    const entry = {
      id,
      client,
      task: taskName,
      taskDesc: desc,
      taskPoints,
      baseTaskPoints: taskBasePoints,
      pointMode,
      taskLines,
      category,
      user: currentUser?.name || '',
      role: currentUser?.role || '',
      start: startISO,
      end: endISO,
      date: new Date(startISO).toLocaleDateString('pt-BR'),
      durationSeconds,
      isRetroativo: true,
      source: 'retroativo'
    };

    window.__savingRetroativo = true;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.dataset.originalText = saveBtn.dataset.originalText || saveBtn.textContent;
      saveBtn.textContent = 'Salvando...';
    }

    if (feedback) {
      feedback.innerHTML = `<span style="color:var(--muted)">Salvando registro...</span>`;
    }

    const dbSave = await remapSaveTimerToDb(entry, null);

    if (!dbSave || !dbSave.success) {
      if (feedback) feedback.innerHTML = `<span style="color:var(--red)">⚠ Não foi possível salvar no banco. Veja o console.</span>`;
      return;
    }

    entry.dbId = dbSave.id || null;
    entry.savedAt = new Date().toISOString();

    await addRetroEntryToLocal(entry);

    renderRetroTable();

    if (typeof renderToday === 'function') renderToday();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderPerformance === 'function') renderPerformance();
    if (typeof renderMyWork === 'function') renderMyWork();

    if (feedback) {
      const pointsLabel = pointMode === 'time_30m'
        ? `+${formatTimerPoints(taskPoints)} pts <span style="color:var(--muted)">(base ${formatTimerPoints(taskBasePoints)} pts)</span>`
        : `+${formatTimerPoints(taskPoints)} pts`;
      feedback.innerHTML = `<span style="color:var(--green)">✓ <strong>${esc(taskName)}</strong> para <strong>${esc(client)}</strong> — <span style="color:#a855f7">${pointsLabel}</span></span>`;
    }

    const rTaskInput = document.getElementById('rTaskInput');
    if (rTaskInput) rTaskInput.value = '';

    resetRetroTaskLines();

    if (retroMode === 'horario') {
      const rStart = document.getElementById('rStart');
      const rEnd = document.getElementById('rEnd');
      const rDurationPreview = document.getElementById('rDurationPreview');

      if (rStart && rEnd) {
        rStart.value = rEnd.value;
        rEnd.value = '';
      }

      if (rDurationPreview) rDurationPreview.textContent = '';
    } else {
      const rHours = document.getElementById('rHours');
      const rMinutes = document.getElementById('rMinutes');

      if (rHours) rHours.value = '';
      if (rMinutes) rMinutes.value = '';
    }

    fillClientDatalist();
    fillRetroClientList();

  } catch (e) {
    console.error('[Retroativo] Falha inesperada ao salvar registro.', e);
    if (feedback) {
      feedback.innerHTML = `<span style="color:var(--red)">⚠ Erro inesperado ao salvar. Veja o console.</span>`;
    }

  } finally {
    window.__savingRetroativo = false;

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = saveBtn.dataset.originalText || '✓ Salvar registro';
    }
  }
}

async function deleteRetroEntry(id) {
  const idStr = String(id || '');

  const entries = getEntries().filter(e => String(e.id || '') !== idStr);
  const ids = getRetroIds().filter(rid => String(rid) !== idStr);

  await persistRetroState(entries, ids);

  try {
    await fetch(remapApiUrl('timer.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_by_uid',
        uid_local: idStr
      })
    });
  } catch (e) {
    console.warn('[Retroativo] Registro removido da tela, mas não foi possível remover do timer.php.', e);
  }

  renderRetroTable();

  if (typeof renderToday === 'function') renderToday();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderPerformance === 'function') renderPerformance();
  if (typeof renderMyWork === 'function') renderMyWork();
}

function renderRetroTable() {
  const tbody = document.getElementById('retroTable');
  if (!tbody) return;

  const ids = getRetroIds();
  const allEntries = Array.isArray(getEntries()) ? getEntries() : [];

  let rows = allEntries.filter(e => {
    const entryId = String(e?.id || '');
    const isMarked = ids.includes(entryId);
    const looksRetro = e?.isRetroativo === true || e?.source === 'retroativo' || entryId.startsWith('retro_');
    const belongsToCurrentUser = entryBelongsToUser(e, currentUser?.name || '');

    // A tabela do retroativo é particular do usuário logado.
    // O seletor pode mostrar todas as tarefas, mas os registros exibidos ficam separados por usuário.
    return belongsToCurrentUser && (isMarked || looksRetro);
  });

  // Remove duplicados visuais por ID local e por ID do banco.
  const seen = new Set();
  rows = rows.filter(e => {
    const key = e?.dbId ? `db_${e.dbId}` : `local_${e?.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty" style="padding:20px">
            <div class="ei">📝</div>
            Nenhum registro adicionado ainda.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map(e => `
    <tr>
      <td>${esc(e.date || '')}</td>
      <td><strong>${esc(e.client || '')}</strong></td>
      <td style="max-width:200px;color:var(--muted-2)">${esc(e.task || '')}</td>
      <td class="mono">${fmtTime(e.start)}</td>
      <td class="mono">${fmtTime(e.end)}</td>
      <td><strong>${formatDuration(Number(e.durationSeconds || 0))}</strong></td>
      <td>
        <button class="btn-red btn-sm" onclick="deleteRetroEntry('${esc(e.id)}')">
          Remover
        </button>
      </td>
    </tr>
  `).join('');
}
