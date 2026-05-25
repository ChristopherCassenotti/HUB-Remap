
let taskLineCount = 0;

function updateTaskDropdown() {
  // Rebuild all existing task line selects when category changes
  document.querySelectorAll('.task-line-select').forEach(sel => {
    const qty = sel.closest('.task-line-row')?.querySelector('.task-line-qty');
    const currentVal = sel.value;
    _populateTaskSelect(sel, document.getElementById('categoryInput').value, currentUser.role);
    if (currentVal) sel.value = currentVal;
    if (qty) updateLinePreview(sel.closest('.task-line-row'));
  });
  updateTaskTotal();
  // If no lines exist yet, add one
  if (document.querySelectorAll('.task-line-row').length === 0) addTaskLine();
}

function addTaskLine() {
  const id = ++taskLineCount;
  const cat = document.getElementById('categoryInput')?.value || 'Design';
  const container = document.getElementById('taskLinesList');
  const row = document.createElement('div');
  row.className = 'task-line-row';
  row.dataset.id = id;
  row.style.cssText = 'background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px';
  row.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center">
      <select class="task-line-select" onchange="onLineSelectChange(this);updateTaskTotal()" style="font-size:13px;padding:8px 10px">
        <option value="">— Selecione —</option>
      </select>
      <div style="display:flex;align-items:center;gap:6px;white-space:nowrap">
        <span style="font-size:12px;color:var(--muted)">Qtd:</span>
        <input type="number" class="task-line-qty" min="1" max="99" value="1"
          oninput="updateLinePreview(this.closest('.task-line-row'));updateTaskTotal()"
          style="width:56px;padding:7px 8px;font-size:13px;text-align:center;border-radius:8px">
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="task-line-pts" style="font-size:12px;color:#a855f7;font-weight:700;min-width:60px;text-align:right"></span>
        <button type="button" onclick="removeTaskLine(${id})" style="background:transparent;border:1px solid var(--border);border-radius:8px;padding:5px 9px;color:var(--muted);width:auto;font-size:14px;cursor:pointer" title="Remover">✕</button>
      </div>
    </div>
    <!-- Custom task fields (hidden by default) -->
    <div class="custom-task-fields" style="display:none;margin-top:10px;display:none;gap:8px;grid-template-columns:1fr auto">
      <input type="text" class="custom-task-name" placeholder="Nome da tarefa personalizada..." style="font-size:13px;padding:8px 10px;border-radius:10px">
      <div style="display:flex;align-items:center;gap:6px;white-space:nowrap">
        <span style="font-size:12px;color:var(--muted)">Pts:</span>
        <input type="number" class="custom-task-pts" min="1" max="999" placeholder="0"
          oninput="updateLinePreview(this.closest('.task-line-row'));updateTaskTotal()"
          style="width:60px;padding:7px 8px;font-size:13px;text-align:center;border-radius:8px">
      </div>
    </div>`;
  container.appendChild(row);
  const sel = row.querySelector('.task-line-select');
  _populateTaskSelect(sel, cat, currentUser.role);
}

function onLineSelectChange(sel) {
  const row = sel.closest('.task-line-row');
  const customFields = row.querySelector('.custom-task-fields');
  if (sel.value === '__custom__') {
    customFields.style.display = 'grid';
  } else {
    customFields.style.display = 'none';
  }
  updateLinePreview(row);
}

function removeTaskLine(id) {
  const row = document.querySelector(`.task-line-row[data-id="${id}"]`);
  if (row) row.remove();
  updateTaskTotal();
}

function updateLinePreview(row) {
  const sel = row.querySelector('.task-line-select');
  const qty = parseInt(row.querySelector('.task-line-qty').value) || 1;
  const ptsEl = row.querySelector('.task-line-pts');
  if (!sel.value) { ptsEl.textContent = ''; return; }
  const tp = getTaskPoints().find(p => p.id === sel.value);
  if (tp) ptsEl.textContent = `+${tp.points * qty} pts`;
}

function updateTaskTotal() {
  const rows = document.querySelectorAll('.task-line-row');
  let total = 0;
  rows.forEach(row => {
    const sel = row.querySelector('.task-line-select');
    const qty = parseInt(row.querySelector('.task-line-qty').value) || 1;
    const tp = getTaskPoints().find(p => p.id === sel?.value);
    if (tp) total += tp.points * qty;
  });
  const preview = document.getElementById('taskTotalPreview');
  const label = document.getElementById('taskTotalLabel');
  if (total > 0) {
    const mode = getTimerPointModeFromForm();
    label.textContent = mode === 'time_30m'
      ? `⭐ Base: ${formatTimerPoints(total)} pontos • +50% a cada 30 min completos`
      : `⭐ Total: ${formatTimerPoints(total)} pontos`;
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
  }
}


function addRetroTaskLine() {
  const container = document.getElementById('retroTaskLinesList');
  if (!container) return;

  const id = ++retroTaskLineCount;
  const cat = document.getElementById('rCategoryInput')?.value || 'Design';
  const role = currentUser?.role || '';

  const row = document.createElement('div');
  row.className = 'retro-task-line-row';
  row.dataset.id = String(id);
  row.style.cssText = 'background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px';
  row.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center">
      <select class="retro-task-line-select" onchange="onRetroLineSelectChange(this);updateRetroTaskTotal()" style="font-size:13px;padding:8px 10px">
        <option value="">— Selecione —</option>
      </select>
      <div style="display:flex;align-items:center;gap:6px;white-space:nowrap">
        <span style="font-size:12px;color:var(--muted)">Qtd:</span>
        <input type="number" class="retro-task-line-qty" min="1" max="99" value="1"
          oninput="updateRetroLinePreview(this.closest('.retro-task-line-row'));updateRetroTaskTotal()"
          style="width:56px;padding:7px 8px;font-size:13px;text-align:center;border-radius:8px">
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="retro-task-line-pts" style="font-size:12px;color:#a855f7;font-weight:700;min-width:60px;text-align:right"></span>
        <button type="button" onclick="removeRetroTaskLine(${id})" style="background:transparent;border:1px solid var(--border);border-radius:8px;padding:5px 9px;color:var(--muted);width:auto;font-size:14px;cursor:pointer" title="Remover">✕</button>
      </div>
    </div>`;

  container.appendChild(row);

  const sel = row.querySelector('.retro-task-line-select');
  _populateTaskSelect(sel, cat, role);
  updateRetroLinePreview(row);
  updateRetroTaskTotal();
}

function onRetroLineSelectChange(sel) {
  const row = sel?.closest('.retro-task-line-row');
  if (!row) return;
  updateRetroLinePreview(row);
  updateRetroTaskTotal();
}

function removeRetroTaskLine(id) {
  const row = document.querySelector(`.retro-task-line-row[data-id="${id}"]`);
  if (row) row.remove();

  const hasRows = document.querySelectorAll('.retro-task-line-row').length > 0;
  if (!hasRows) addRetroTaskLine();

  updateRetroTaskTotal();
}

function updateRetroLinePreview(row) {
  if (!row) return;

  const sel = row.querySelector('.retro-task-line-select');
  const qtyEl = row.querySelector('.retro-task-line-qty');
  const ptsEl = row.querySelector('.retro-task-line-pts');

  if (!ptsEl) return;

  const qty = Math.max(1, parseInt(qtyEl?.value, 10) || 1);
  if (qtyEl && String(qtyEl.value) !== String(qty)) qtyEl.value = String(qty);

  if (!sel?.value) {
    ptsEl.textContent = '';
    return;
  }

  const tp = getTaskPoints().find(p => String(p.id) === String(sel.value));
  const basePts = tp ? Number(tp.points || 0) * qty : 0;
  ptsEl.textContent = tp ? `+${formatTimerPoints(basePts)} pts base` : '';
}

function getRetroPointModeFromForm() {
  const mode = document.getElementById('retroPointMode')?.value || 'fixed';
  return normalizeTimerPointMode(mode);
}

function getRetroCurrentDurationSeconds() {
  try {
    if (retroMode === 'horario') {
      const start = document.getElementById('rStart')?.value;
      const end = document.getElementById('rEnd')?.value;
      if (!start || !end) return 0;

      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const totalMin = (eh * 60 + em) - (sh * 60 + sm);
      return totalMin > 0 ? totalMin * 60 : 0;
    }

    const hours = parseInt(document.getElementById('rHours')?.value, 10) || 0;
    const minutes = parseInt(document.getElementById('rMinutes')?.value, 10) || 0;
    return Math.max(0, hours * 3600 + minutes * 60);
  } catch (e) {
    return 0;
  }
}

function getRetroBasePoints(lines = null) {
  const taskLines = Array.isArray(lines) ? lines : collectRetroTaskLines();
  return taskLines.reduce((sum, item) => {
    return sum + Number(item.points || 0) * Number(item.qty || 1);
  }, 0);
}

function updateRetroTaskTotal() {
  const preview = document.getElementById('retroTaskTotalPreview');
  const label = document.getElementById('retroTaskTotalLabel');

  if (!preview || !label) return;

  const taskLines = collectRetroTaskLines();
  const baseTotal = getRetroBasePoints(taskLines);
  const pointMode = getRetroPointModeFromForm();
  const durationSeconds = getRetroCurrentDurationSeconds();
  const finalTotal = calculateTimerPointsByMode(baseTotal, durationSeconds, pointMode);

  if (baseTotal > 0) {
    if (pointMode === 'time_30m') {
      const durationLabel = durationSeconds > 0 ? formatDuration(durationSeconds) : 'tempo não informado';
      label.textContent = `⭐ Base: ${formatTimerPoints(baseTotal)} pts • ${durationLabel} • Total: ${formatTimerPoints(finalTotal)} pts`;
    } else {
      label.textContent = `⭐ Total: ${formatTimerPoints(baseTotal)} pontos`;
    }
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
  }
}

function collectRetroTaskLines() {
  const lines = [];

  document.querySelectorAll('.retro-task-line-row').forEach(row => {
    const sel = row.querySelector('.retro-task-line-select');
    const qtyEl = row.querySelector('.retro-task-line-qty');

    if (!sel?.value) return;

    const tp = getTaskPoints().find(p => String(p.id) === String(sel.value));
    if (!tp) return;

    const qty = Math.max(1, parseInt(qtyEl?.value, 10) || 1);

    lines.push({
      id: tp.id,
      name: tp.name,
      points: Number(tp.points || 0),
      qty
    });
  });

  return lines;
}

function resetRetroTaskLines() {
  const list = document.getElementById('retroTaskLinesList');
  if (list) list.innerHTML = '';

  retroTaskLineCount = 0;

  const preview = document.getElementById('retroTaskTotalPreview');
  if (preview) preview.style.display = 'none';

  setTimeout(() => addRetroTaskLine(), 0);
}

function normalizeTaskFunctionKey(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function taskRoleFromSelectedFunction(category, role = '') {
  const key = normalizeTaskFunctionKey(category);
  const roleKey = normalizeTaskFunctionKey(role);

  const map = {
    'design': 'designer',
    'designer': 'designer',
    'social media': 'social media',
    'edicao de video': 'editor de video',
    'editor de video': 'editor de video',
    'filmmaker': 'filmmaker',
    'gravacoes': 'filmmaker',
    'trafego pago': 'gestor de trafego',
    'gestor de trafego': 'gestor de trafego'
  };

  return map[key] || map[roleKey] || key || roleKey || '';
}

function categoryFromUserRole(role = '') {
  const key = normalizeTaskFunctionKey(role);
  const map = {
    'designer': 'Design',
    'design': 'Design',
    'social media': 'Social Media',
    'editor de video': 'Edição de Vídeo',
    'edicao de video': 'Edição de Vídeo',
    'filmmaker': 'Filmmaker',
    'gestor de trafego': 'Tráfego Pago',
    'trafego pago': 'Tráfego Pago'
  };
  return map[key] || '';
}

function applyDefaultCategoryFromUserRole(selectId) {
  const el = document.getElementById(selectId);
  if (!el || el.dataset.userTouched === '1') return;

  const suggested = categoryFromUserRole(currentUser?.role || '');
  if (!suggested) return;

  const hasOption = Array.from(el.options || []).some(opt => opt.value === suggested);
  if (!hasOption) return;

  // Evita que Gestor/Social/Editor entrem no timer vendo tarefas de Design por padrão.
  if (!el.value || el.value === 'Design' || el.dataset.autoRoleDefault === '1') {
    el.value = suggested;
    el.dataset.autoRoleDefault = '1';
  }
}

function getTaskPointsBySelectedFunction(category, role = '') {
  const all = Array.isArray(getTaskPoints()) ? getTaskPoints() : [];
  const selectedRole = taskRoleFromSelectedFunction(category, role);

  if (!selectedRole) return all;

  const filtered = all.filter(p => {
    const pointRole = normalizeTaskFunctionKey(p?.role || '');
    return pointRole === selectedRole || pointRole === 'todos' || pointRole === 'geral';
  });

  return filtered.length ? filtered : all;
}

function _populateTaskSelect(selEl, category, role) {
  const el = typeof selEl === 'string' ? document.getElementById(selEl) : selEl;
  if (!el) return;

  const filtered = getTaskPointsBySelectedFunction(category, role);
  const selectedLabel = category || role || 'função selecionada';

  el.innerHTML = `<option value="">— Selecione a tarefa —</option>` +
    (filtered.length
      ? filtered.map(p => `<option value="${esc(p.id)}">${esc(p.name)} (${formatPointsValue(Number(p.points || 0))} pts)</option>`).join('')
      : `<option value="" disabled>Nenhuma tarefa cadastrada para ${esc(selectedLabel)}</option>`);
}

// Legacy stubs (used by retroativo)
function onTaskSelectChange() {
  const sel = document.getElementById('taskSelect');
  const preview = document.getElementById('taskPointsPreview');
  const label = document.getElementById('taskPointsLabel');
  if (!sel || !sel.value) { if(preview) preview.style.display = 'none'; return; }
  const tp = getTaskPoints().find(p => p.id === sel.value);
  if (tp && preview && label) { label.textContent = `⭐ ${tp.points} pontos — ${tp.name}`; preview.style.display = ''; }
}

function makeLocalUid(prefix = 'timer') {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return prefix + '_' + window.crypto.randomUUID();
  }
  return prefix + '_' + Date.now() + '_' + Math.random().toString(16).slice(2);
}

let activeTimers = [];
let activeTimerId = null;
let activeTimersLoaded = false;
let editingTimerId = null;

function getActiveTimerById(id) {
  return activeTimers.find(t => String(t.id) === String(id)) || null;
}

function getRunningMultiTimer() {
  return activeTimers.find(t => t.status === 'rodando') || null;
}

function getSelectedMultiTimer() {
  return getActiveTimerById(activeTimerId) || getRunningMultiTimer() || activeTimers[0] || null;
}

function getMultiTimerElapsedSeconds(timer) {
  if (!timer) return 0;
  const base = Number(timer.elapsedSeconds || 0);
  if (timer.status !== 'rodando' || !timer.runningStartedAt) return Math.max(0, base);
  const diff = Math.round((Date.now() - new Date(timer.runningStartedAt).getTime()) / 1000);
  return Math.max(0, base + Math.max(0, diff));
}

function getTimerPointModeFromForm() {
  return document.getElementById('timerPointMode')?.value === 'time_30m' ? 'time_30m' : 'fixed';
}

function normalizeTimerPointMode(mode) {
  return mode === 'time_30m' ? 'time_30m' : 'fixed';
}

function formatTimerPoints(value) {
  const n = Number(value || 0);
  const normalized = Math.round(n * 10) / 10;
  return normalized.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

function calculateTimerPointsByMode(basePoints, durationSeconds, mode) {
  const base = Number(basePoints || 0);
  if (normalizeTimerPointMode(mode) !== 'time_30m') return base;
  const completedBlocks = Math.floor(Math.max(0, Number(durationSeconds || 0)) / 1800);
  const total = base + (completedBlocks * (base * 0.5));
  return Math.round(total * 10) / 10;
}

function getTimerBasePoints(timer) {
  if (!timer) return 0;
  if (timer.baseTaskPoints !== undefined && timer.baseTaskPoints !== null && timer.baseTaskPoints !== '') {
    return Number(timer.baseTaskPoints || 0);
  }
  if (Array.isArray(timer.taskLines) && timer.taskLines.length) {
    return timer.taskLines.reduce((sum, line) => sum + Number(line.points || 0) * Number(line.qty || 1), 0);
  }
  return Number(timer.taskPoints || 0);
}

function getTimerCurrentPoints(timer) {
  return calculateTimerPointsByMode(getTimerBasePoints(timer), getMultiTimerElapsedSeconds(timer), timer?.pointMode);
}

function getTimerPointModeLabel(mode) {
  return normalizeTimerPointMode(mode) === 'time_30m' ? '+50% a cada 30 min' : 'pontos fixos';
}

function setActiveMultiTimer(id) {
  activeTimerId = id;
  activeTimer = getSelectedMultiTimer();
  renderActiveTimers();
  updateActiveTimerDisplays();
}

function ensureMultiTimerTicker() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateActiveTimerDisplays, 1000);
}

function remapTimerPayloadFromActive(timer) {
  return {
    uid_local: timer.id,
    usuario: timer.user || currentUser?.name || '',
    cargo: timer.role || currentUser?.role || '',
    cliente: timer.client || '',
    tarefa: timer.task || '',
    descricao: timer.taskDesc || '',
    categoria: timer.category || '',
    pontos: Number(timer.taskPoints || 0),
    pontos_base: Number(timer.baseTaskPoints ?? timer.taskPoints ?? 0),
    modo_pontos: normalizeTimerPointMode(timer.pointMode),
    task_lines: Array.isArray(timer.taskLines) ? timer.taskLines : [],
    iniciado_em: timer.start || new Date().toISOString(),
    segundos_acumulados: Number(timer.elapsedSeconds || 0)
  };
}

async function remapTimerApi(payload, method = 'POST') {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (method !== 'GET') options.body = JSON.stringify(payload || {});

  const res = await fetch(remapApiUrl('timer.php'), options);
  const text = await res.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('[Timer] Resposta inválida do timer.php:', text);
    return { success: false, message: 'Resposta inválida do timer.php', raw: text, status: res.status };
  }

  if (!res.ok || !json || !json.success) {
    console.error('[Timer] Erro na API timer.php:', { status: res.status, resposta: json, payload });
    return json || { success: false, message: 'Erro na API timer.php', status: res.status };
  }

  return json;
}


// Salva um registro finalizado direto na tabela `timer`.
// Usado pelo Registro Retroativo e pelo timer do Kanban.
// Mantém compatibilidade com registros simples e com múltiplas tarefas/quantidades.
async function remapSaveTimerToDb(entry, task = null) {
  try {
    if (!entry) {
      console.error('[Timer] Registro vazio ao tentar salvar no banco.');
      return { success: false, message: 'Registro vazio.' };
    }

    const taskDbId = task ? remapTaskDbId(task) : null;

    const payload = {
      action: 'log',
      tarefa_id: taskDbId || null,
      uid_local: entry.id || entry.uid_local || entry.localUid || entry.fromKanban || entry.taskId || null,

      usuario: entry.user || currentUser?.name || '',
      cargo: entry.role || currentUser?.role || '',

      cliente: entry.client || '',
      tarefa: entry.task || '',
      descricao: entry.taskDesc || entry.desc || '',
      categoria: entry.category || '',
      pontos: Number(entry.taskPoints ?? entry.points ?? 0),
      pontos_base: Number(entry.baseTaskPoints ?? entry.basePoints ?? entry.pontos_base ?? entry.taskPoints ?? entry.points ?? 0),
      modo_pontos: normalizeTimerPointMode(entry.pointMode || entry.modo_pontos || entry.point_mode || 'fixed'),
      task_lines: Array.isArray(entry.taskLines) ? entry.taskLines : [],

      inicio: entry.start,
      fim: entry.end,
      duracao: Number(entry.durationSeconds || entry.duration || 0),
      status: 'finalizado'
    };

    if (!payload.usuario || !payload.inicio || !payload.fim || !payload.duracao) {
      console.error('[Timer] Payload incompleto para salvar no banco.', payload);
      return { success: false, message: 'Payload incompleto.' };
    }

    const res = await fetch(remapApiUrl('timer.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let json = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('[Timer] Resposta inválida do timer.php ao salvar registro.', {
        status: res.status,
        resposta: text,
        payload
      });
      return { success: false, message: 'Resposta inválida do timer.php.', raw: text, status: res.status };
    }

    if (!res.ok || !json || !json.success) {
      console.error('[Timer] Registro não salvo no MySQL.', {
        status: res.status,
        resposta: json,
        payload
      });
      return json || { success: false, message: 'Erro ao salvar timer.', status: res.status };
    }

    console.info('[Timer] Registro salvo no banco.', {
      id: json.id,
      cliente: payload.cliente,
      tarefa: payload.tarefa,
      usuario: payload.usuario
    });

    return json;

  } catch (e) {
    console.error('[Timer] Falha inesperada ao salvar no MySQL.', e);
    return { success: false, message: 'Falha inesperada ao salvar timer.' };
  }
}

function remapDbDateToIso(value) {
  if (!value) return new Date().toISOString();
  const normalized = String(value).replace(' ', 'T');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function remapParseTaskLines(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch(e) {
    return [];
  }
}

function remapTimerFromDb(row) {
  const status = row.status === 'rodando' ? 'rodando' : 'pausado';
  const elapsed = Number(row.segundos_atuais ?? row.segundos_acumulados ?? 0) || 0;
  const lines = remapParseTaskLines(row.task_lines_json);
  const linesBase = Array.isArray(lines) && lines.length
    ? lines.reduce((sum, line) => sum + Number(line.points || 0) * Number(line.qty || 1), 0)
    : 0;
  const basePoints = Number(row.pontos_base ?? row.base_points ?? 0) || linesBase || Number(row.pontos || 0);
  const pointMode = normalizeTimerPointMode(row.modo_pontos || row.point_mode || row.pointMode);

  return {
    id: row.uid_local || ('dbactive_' + row.id),
    dbId: Number(row.id || 0) || null,
    client: row.cliente || '',
    task: row.tarefa || '',
    taskDesc: row.descricao || '',
    taskPoints: Number(row.pontos || basePoints || 0),
    baseTaskPoints: basePoints,
    pointMode,
    taskLines: lines,
    category: row.categoria || '',
    user: row.usuario || currentUser?.name || '',
    role: row.cargo || currentUser?.role || '',
    start: remapDbDateToIso(row.iniciado_em || row.criado_em),
    elapsedSeconds: elapsed,
    runningStartedAt: status === 'rodando' ? new Date().toISOString() : null,
    status
  };
}

async function loadActiveTimersFromDb(force = false) {
  if (!currentUser || (activeTimersLoaded && !force)) {
    renderActiveTimers();
    updateActiveTimerDisplays();
    return;
  }

  try {
    const url = remapApiUrl('timer.php') + '?action=active&usuario=' + encodeURIComponent(currentUser.name);
    const res = await fetch(url);
    const text = await res.text();
    let json = null;

    try { json = text ? JSON.parse(text) : null; }
    catch(e) {
      console.error('[Timer] Resposta inválida ao buscar timers ativos:', text);
      renderActiveTimers();
      return;
    }

    if (!res.ok || !json || !json.success) {
      console.error('[Timer] Não foi possível carregar timers ativos:', json);
      renderActiveTimers();
      return;
    }

    activeTimers = Array.isArray(json.data) ? json.data.map(remapTimerFromDb) : [];
    const running = getRunningMultiTimer();
    activeTimerId = running?.id || activeTimers[0]?.id || null;
    activeTimer = getSelectedMultiTimer();
    activeTimersLoaded = true;
    renderActiveTimers();
    updateActiveTimerDisplays();
    ensureMultiTimerTicker();
  } catch(e) {
    console.error('[Timer] Falha ao carregar timers ativos:', e);
    renderActiveTimers();
  }
}

async function pauseMultiTimer(id, options = {}) {
  const timer = getActiveTimerById(id);
  if (!timer || timer.status !== 'rodando') return true;

  timer.elapsedSeconds = getMultiTimerElapsedSeconds(timer);
  timer.runningStartedAt = null;
  timer.status = 'pausado';

  if (!options.skipApi) {
    const json = await remapTimerApi({ action: 'active_pause', uid_local: timer.id, usuario: timer.user || currentUser?.name || '' });
    if (!json.success) return false;
  }

  activeTimer = getSelectedMultiTimer();
  renderActiveTimers();
  updateActiveTimerDisplays();
  return true;
}

async function resumeMultiTimer(id) {
  const timer = getActiveTimerById(id);
  if (!timer) return;

  const running = getRunningMultiTimer();
  if (running && String(running.id) !== String(timer.id)) {
    await pauseMultiTimer(running.id);
  }

  const json = await remapTimerApi({ action: 'active_resume', uid_local: timer.id, usuario: timer.user || currentUser?.name || '' });
  if (!json.success) return;

  timer.status = 'rodando';
  timer.runningStartedAt = new Date().toISOString();
  activeTimerId = timer.id;
  activeTimer = timer;
  renderActiveTimers();
  updateActiveTimerDisplays();
  ensureMultiTimerTicker();
}

async function cancelMultiTimer(id) {
  const timer = getActiveTimerById(id);
  if (!timer) return;
  if (!confirm('Cancelar este timer aberto? O tempo dele não será registrado.')) return;

  const json = await remapTimerApi({ action: 'active_cancel', uid_local: timer.id, usuario: timer.user || currentUser?.name || '' });
  if (!json.success) return;

  activeTimers = activeTimers.filter(t => String(t.id) !== String(id));
  if (String(activeTimerId) === String(id)) activeTimerId = getRunningMultiTimer()?.id || activeTimers[0]?.id || null;
  activeTimer = getSelectedMultiTimer();
  renderActiveTimers();
  updateActiveTimerDisplays();
}

async function finishMultiTimer(id) {
  const timer = getActiveTimerById(id);
  if (!timer || timer.saving) return;

  timer.saving = true;
  renderActiveTimers();

  const localDuration = Math.max(1, getMultiTimerElapsedSeconds(timer));
  const basePoints = getTimerBasePoints(timer);
  const pointMode = normalizeTimerPointMode(timer.pointMode);
  const estimatedFinalPoints = calculateTimerPointsByMode(basePoints, localDuration, pointMode);
  const json = await remapTimerApi({
    action: 'active_finish',
    uid_local: timer.id,
    usuario: timer.user || currentUser?.name || '',
    pontos_base: basePoints,
    modo_pontos: pointMode,
    pontos_final: estimatedFinalPoints
  });

  timer.saving = false;

  if (!json.success) {
    renderActiveTimers();
    return;
  }

  const startDate = new Date(timer.start);
  const endIso = json.fim ? remapDbDateToIso(json.fim) : new Date().toISOString();
  const durationSeconds = Number(json.duracao || localDuration) || localDuration;
  const finalPoints = Number(json.pontos ?? calculateTimerPointsByMode(basePoints, durationSeconds, pointMode));

  const entry = {
    id: timer.id,
    dbId: json.id || null,
    client: timer.client,
    task: timer.task,
    taskDesc: timer.taskDesc,
    taskPoints: finalPoints,
    baseTaskPoints: basePoints,
    pointMode,
    taskLines: timer.taskLines,
    category: timer.category,
    user: timer.user,
    role: timer.role,
    start: timer.start,
    end: endIso,
    date: formatDateBR(startDate),
    durationSeconds
  };

  const entries = getEntries();
  if (!entries.some(e => String(e.id) === String(entry.id))) {
    entries.unshift(entry);
    set('entries', entries);
  }

  activeTimers = activeTimers.filter(t => String(t.id) !== String(id));
  if (String(activeTimerId) === String(id)) activeTimerId = getRunningMultiTimer()?.id || activeTimers[0]?.id || null;
  activeTimer = getSelectedMultiTimer();

  renderActiveTimers();
  updateActiveTimerDisplays();
  fillClientDatalist();

  try { renderToday(); } catch(e) {}
  try { renderDashboard(); } catch(e) {}

  const status = document.getElementById('timerStatus');
  if (status) status.innerHTML = `✓ Timer registrado! <span style="color:#a855f7;font-weight:700">+${formatTimerPoints(finalPoints)} pontos</span>`;
}

function renderActiveTimers() {
  const list = document.getElementById('activeTimersList');
  if (!list) return;

  if (!activeTimers.length) {
    list.innerHTML = `<div class="multi-timer-empty">Nenhum timer aberto no momento.</div>`;
    return;
  }

  list.innerHTML = activeTimers.map(t => {
    const timerId = String(t.id || '');
    const selected = timerId === String(activeTimerId);
    const running = t.status === 'rodando';
    const currentPoints = getTimerCurrentPoints(t);
    const pointModeLabel = getTimerPointModeLabel(t.pointMode);
    const statusClass = running ? 'running' : 'paused';
    const statusLabel = running ? '● Rodando' : '⏸ Pausado';
    const mainAction = running
      ? `<button type="button" class="btn-yellow js-mt-action" data-action="pause" data-id="${esc(timerId)}">⏸ Pausar</button>`
      : `<button type="button" class="btn-green js-mt-action" data-action="resume" data-id="${esc(timerId)}">▶ Continuar</button>`;

    return `
      <div class="multi-timer-card ${selected ? 'active' : ''}" data-id="${esc(timerId)}">
        <div class="multi-timer-top">
          <div style="min-width:0">
            <div class="multi-timer-title">${esc(t.client || 'Sem cliente')}</div>
            <div class="multi-timer-sub">${esc(t.task || 'Sem tarefa')}</div>
            <div class="multi-timer-sub" id="mt-points-${esc(timerId)}">⭐ ${formatTimerPoints(currentPoints)} pts • ${esc(pointModeLabel)}</div>
            <span class="multi-timer-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="multi-timer-time" id="mt-elapsed-${esc(timerId)}">${formatDuration(getMultiTimerElapsedSeconds(t), true)}</div>
        </div>
        <div class="multi-timer-actions">
          ${mainAction}
          <button type="button" class="btn-dark js-mt-action" data-action="edit" data-id="${esc(timerId)}">✏️ Editar</button>
          <button type="button" class="btn-red js-mt-action" data-action="finish" data-id="${esc(timerId)}" ${t.saving ? 'disabled' : ''}>${t.saving ? 'Salvando...' : '⏹ Finalizar'}</button>
          <button type="button" class="btn-dark js-mt-action" data-action="cancel" data-id="${esc(timerId)}">Cancelar</button>
        </div>
      </div>
    `;
  }).join('');

  attachMultiTimerHandlers();
}

function attachMultiTimerHandlers() {
  const list = document.getElementById('activeTimersList');
  if (!list) return;

  list.querySelectorAll('.multi-timer-card').forEach(card => {
    card.onclick = () => setActiveMultiTimer(card.dataset.id);
  });

  list.querySelectorAll('.js-mt-action').forEach(btn => {
    btn.onclick = async (event) => {
      event.stopPropagation();

      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (!id || !action) return;

      btn.disabled = true;

      try {
        if (action === 'pause') await pauseMultiTimer(id);
        if (action === 'resume') await resumeMultiTimer(id);
        if (action === 'edit') { editMultiTimer(id); btn.disabled = false; return; }
        if (action === 'finish') await finishMultiTimer(id);
        if (action === 'cancel') await cancelMultiTimer(id);
      } catch (e) {
        console.error('[Timer] Erro ao executar ação do timer.', { action, id, error: e });
        btn.disabled = false;
      }
    };
  });
}

function updateActiveTimerDisplays() {
  activeTimers.forEach(t => {
    const el = document.getElementById('mt-elapsed-' + t.id);
    if (el) el.textContent = formatDuration(getMultiTimerElapsedSeconds(t), true);

    const ptsEl = document.getElementById('mt-points-' + t.id);
    if (ptsEl) ptsEl.textContent = `⭐ ${formatTimerPoints(getTimerCurrentPoints(t))} pts • ${getTimerPointModeLabel(t.pointMode)}`;
  });

  const selected = getSelectedMultiTimer();
  activeTimer = selected;

  const display = document.getElementById('timerDisplay');
  const status = document.getElementById('timerStatus');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const startBtn = document.getElementById('startBtn');

  if (startBtn) startBtn.disabled = false;

  if (!selected) {
    if (display) {
      display.textContent = '00:00:00';
      display.classList.remove('running');
    }
    if (status) status.innerHTML = 'Nenhuma tarefa em andamento.';
    if (pauseBtn) { pauseBtn.disabled = true; pauseBtn.textContent = '⏸ Pausar'; }
    if (stopBtn) stopBtn.disabled = true;
    return;
  }

  if (display) {
    display.textContent = formatDuration(getMultiTimerElapsedSeconds(selected), true);
    display.classList.toggle('running', selected.status === 'rodando');
  }

  if (status) {
    const statusLabel = selected.status === 'rodando' ? 'Rodando' : 'Pausado';
    const pointsLabel = `⭐ ${formatTimerPoints(getTimerCurrentPoints(selected))} pts`;
    status.innerHTML = `${statusLabel} em <strong>${esc(selected.client || 'Sem cliente')}</strong> — ${esc(selected.task || 'Sem tarefa')} <span style="color:#a855f7;font-weight:700">${pointsLabel}</span>`;
  }

  if (pauseBtn) {
    pauseBtn.disabled = false;
    pauseBtn.textContent = selected.status === 'rodando' ? '⏸ Pausar' : '▶ Retomar';
  }

  if (stopBtn) stopBtn.disabled = false;
}

function collectTimerTaskLinesFromForm() {
  const taskLines = [];
  const rows = document.querySelectorAll('.task-line-row');
  for (const row of rows) {
    const sel = row.querySelector('.task-line-select');
    const qty = parseInt(row.querySelector('.task-line-qty')?.value, 10) || 1;
    if (!sel?.value) continue;
    const tp = getTaskPoints().find(p => String(p.id) === String(sel.value));
    if (tp) taskLines.push({ id: tp.id, name: tp.name, points: Number(tp.points || 0), qty });
  }
  return taskLines;
}
function setTimerTaskLines(lines = []) {
  const list = document.getElementById('taskLinesList');
  if (list) list.innerHTML = '';
  taskLineCount = 0;

  const normalized = Array.isArray(lines) && lines.length ? lines : [];
  if (!normalized.length) {
    addTaskLine();
    updateTaskTotal();
    return;
  }

  normalized.forEach(item => {
    addTaskLine();
    const row = document.querySelector('#taskLinesList .task-line-row:last-child');
    if (!row) return;
    const sel = row.querySelector('.task-line-select');
    const qty = row.querySelector('.task-line-qty');
    const itemId = String(item.id || '');
    if (sel && itemId) {
      if (![...sel.options].some(opt => String(opt.value) === itemId)) {
        const opt = document.createElement('option');
        opt.value = itemId;
        opt.textContent = `${item.name || 'Tarefa'} (${item.points || 0} pts)`;
        sel.appendChild(opt);
      }
      sel.value = itemId;
    }
    if (qty) qty.value = Math.max(1, parseInt(item.qty, 10) || 1);
    updateLinePreview(row);
  });
  updateTaskTotal();
}
function editMultiTimer(id) {
  const timer = getActiveTimerById(id);
  if (!timer) return;

  editingTimerId = timer.id;
  activeTimerId = timer.id;
  activeTimer = timer;

  const clientEl = document.getElementById('clientInput');
  const categoryEl = document.getElementById('categoryInput');
  const descEl = document.getElementById('taskInput');
  const startBtn = document.getElementById('startBtn');
  const bar = document.getElementById('timerEditBar');
  const label = document.getElementById('timerEditLabel');

  if (clientEl) clientEl.value = timer.client || '';
  if (categoryEl) categoryEl.value = timer.category || categoryEl.value || 'Design';
  if (descEl) descEl.value = timer.taskDesc || '';
  const pointModeEl = document.getElementById('timerPointMode');
  if (pointModeEl) pointModeEl.value = normalizeTimerPointMode(timer.pointMode);
  setTimerTaskLines(timer.taskLines || []);

  if (startBtn) startBtn.textContent = '💾 Salvar alterações';
  if (bar) bar.style.display = 'flex';
  if (label) label.textContent = `${timer.client || 'Sem cliente'} — ${timer.task || 'Sem tarefa'}`;

  renderActiveTimers();
  updateActiveTimerDisplays();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function cancelTimerEdit() {
  editingTimerId = null;
  const startBtn = document.getElementById('startBtn');
  const bar = document.getElementById('timerEditBar');
  if (startBtn) startBtn.textContent = '▶ Novo timer';
  if (bar) bar.style.display = 'none';
  resetTimerFormForNext();
}
async function saveActiveTimerEdit(id) {
  const timer = getActiveTimerById(id);
  if (!timer) {
    cancelTimerEdit();
    return;
  }

  const client = document.getElementById('clientInput')?.value.trim() || '';
  if (!client) return alert('Informe o cliente.');

  const taskLines = collectTimerTaskLinesFromForm();
  if (!taskLines.length) return alert('Selecione pelo menos uma tarefa.');

  const basePoints = taskLines.reduce((s, t) => s + Number(t.points || 0) * Number(t.qty || 1), 0);
  const pointMode = getTimerPointModeFromForm();
  const totalPoints = calculateTimerPointsByMode(basePoints, getMultiTimerElapsedSeconds(timer), pointMode);
  const taskSummary = taskLines.map(t => t.qty > 1 ? `${t.qty}× ${t.name}` : t.name).join(', ');
  const desc = document.getElementById('taskInput')?.value.trim() || '';
  const category = document.getElementById('categoryInput')?.value || timer.category || '';

  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'Salvando...';
  }

  const oldSnapshot = { ...timer, taskLines: Array.isArray(timer.taskLines) ? [...timer.taskLines] : [] };

  Object.assign(timer, {
    client,
    task: taskSummary,
    taskDesc: desc,
    taskPoints: totalPoints,
    baseTaskPoints: basePoints,
    pointMode,
    taskLines,
    category
  });

  renderActiveTimers();
  updateActiveTimerDisplays();

  const json = await remapTimerApi({
    action: 'active_update',
    uid_local: timer.id,
    usuario: timer.user || currentUser?.name || '',
    cliente: client,
    tarefa: taskSummary,
    descricao: desc,
    categoria: category,
    cargo: timer.role || currentUser?.role || '',
    pontos: totalPoints,
    pontos_base: basePoints,
    modo_pontos: pointMode,
    task_lines: taskLines
  });

  if (!json.success) {
    Object.assign(timer, oldSnapshot);
    renderActiveTimers();
    updateActiveTimerDisplays();
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = '💾 Salvar alterações';
    }
    return alert(json.message || 'Não foi possível atualizar o timer.');
  }

  editingTimerId = null;
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = '▶ Novo timer';
  }
  const bar = document.getElementById('timerEditBar');
  if (bar) bar.style.display = 'none';
  resetTimerFormForNext();
  renderActiveTimers();
  updateActiveTimerDisplays();
}

async function startTimer() {
  if (editingTimerId) {
    await saveActiveTimerEdit(editingTimerId);
    return;
  }
  const client = document.getElementById('clientInput').value.trim();
  if (!client) return alert('Informe o cliente.');

  const rows = document.querySelectorAll('.task-line-row');
  const taskLines = [];
  for (const row of rows) {
    const sel = row.querySelector('.task-line-select');
    const qty = parseInt(row.querySelector('.task-line-qty').value, 10) || 1;
    if (!sel?.value) continue;
    const tp = getTaskPoints().find(p => String(p.id) === String(sel.value));
    if (tp) taskLines.push({ id: tp.id, name: tp.name, points: Number(tp.points || 0), qty });
  }
  if (taskLines.length === 0) return alert('Selecione pelo menos uma tarefa.');

  const running = getRunningMultiTimer();
  if (running) await pauseMultiTimer(running.id);

  const basePoints = taskLines.reduce((s, t) => s + Number(t.points || 0) * Number(t.qty || 1), 0);
  const pointMode = getTimerPointModeFromForm();
  const totalPoints = calculateTimerPointsByMode(basePoints, 0, pointMode);
  const taskSummary = taskLines.map(t => t.qty > 1 ? `${t.qty}× ${t.name}` : t.name).join(', ');
  const desc = document.getElementById('taskInput').value.trim();
  const now = new Date().toISOString();

  const timer = {
    id: makeLocalUid('active_timer'),
    client,
    task: taskSummary,
    taskDesc: desc,
    taskPoints: totalPoints,
    baseTaskPoints: basePoints,
    pointMode,
    taskLines,
    category: document.getElementById('categoryInput').value,
    user: currentUser.name,
    role: currentUser.role,
    start: now,
    elapsedSeconds: 0,
    runningStartedAt: now,
    status: 'rodando',
    saving: true
  };

  activeTimers.unshift(timer);
  activeTimerId = timer.id;
  activeTimer = timer;
  renderActiveTimers();
  updateActiveTimerDisplays();
  ensureMultiTimerTicker();

  const json = await remapTimerApi({ action: 'active_start', ...remapTimerPayloadFromActive(timer) });
  timer.saving = false;

  if (!json.success) {
    activeTimers = activeTimers.filter(t => String(t.id) !== String(timer.id));
    activeTimerId = getRunningMultiTimer()?.id || activeTimers[0]?.id || null;
    activeTimer = getSelectedMultiTimer();
    renderActiveTimers();
    updateActiveTimerDisplays();
    alert(json.message || 'Não foi possível iniciar o timer no banco.');
    return;
  }

  timer.dbId = json.id || null;
  resetTimerFormForNext();
  renderActiveTimers();
  updateActiveTimerDisplays();
}

function resetTimerFormForNext() {
  const taskInput = document.getElementById('taskInput');
  if (taskInput) taskInput.value = '';

  const list = document.getElementById('taskLinesList');
  if (list) list.innerHTML = '';

  taskLineCount = 0;

  const preview = document.getElementById('taskTotalPreview');
  if (preview) preview.style.display = 'none';

  const pointModeEl = document.getElementById('timerPointMode');
  if (pointModeEl) pointModeEl.value = 'fixed';

  setTimeout(() => addTaskLine(), 0);
}

function getActiveTimerElapsedSeconds() {
  return getMultiTimerElapsedSeconds(getSelectedMultiTimer());
}

async function pauseTimer() {
  const selected = getSelectedMultiTimer();
  if (!selected) return;

  if (selected.status === 'rodando') {
    await pauseMultiTimer(selected.id);
  } else {
    await resumeMultiTimer(selected.id);
  }
}

async function stopTimer() {
  const selected = getSelectedMultiTimer();
  if (!selected) return;
  await finishMultiTimer(selected.id);
}

function updateTimerDisplay() {
  updateActiveTimerDisplays();
}


// ════════════════════════════════════════
// CLIENT DATALIST
// ════════════════════════════════════════
function fillClientDatalist() {
  const saved = getClients().map(c => c.name);
  const fromEntries = getEntries().map(e => e.client);
  const all = [...new Set([...saved, ...fromEntries])].sort();
  const dl = document.getElementById('clientList');
  dl.innerHTML = all.map(c => `<option value="${esc(c)}"></option>`).join('');
}

// ════════════════════════════════════════
// MY WORK
// ════════════════════════════════════════
function renderMyWork() {
  const period = document.getElementById('myPeriodFilter').value;
  const now = new Date();
  const allEntries = getEntries();
  const myAllEntries = allEntries.filter(e => entryBelongsToUser(e, currentUser.name));
  let myEntries = filterByPeriod(myAllEntries, period, now);

  // Os cards do topo precisam ser sempre o resumo real do usuário logado.
  // Eles não podem depender do filtro da tabela, senão "Hoje/Semana/Mês/Pontos" muda quando o filtro muda.
  const todayEntries = myAllEntries.filter(e => isSameDay(entryDate(e), now));
  const weekEntries  = myAllEntries.filter(e => isSameWeek(entryDate(e), now));
  const monthEntriesOnly = myAllEntries.filter(e => isSameMonth(entryDate(e), now));

  const today = sum(todayEntries);
  const week  = sum(weekEntries);
  const month = sum(monthEntriesOnly);
  const myPts = monthEntriesOnly.reduce((s,e) => s + getEntryPoints(e, currentUser.role), 0);

  document.getElementById('myStats').innerHTML = `
    <div class="stat accent"><div class="label">Hoje</div><div class="value">${fmtH(today)}</div></div>
    <div class="stat"><div class="label">Semana</div><div class="value">${fmtH(week)}</div></div>
    <div class="stat"><div class="label">Mês</div><div class="value">${fmtH(month)}</div></div>
    <div class="stat" style="border-color:rgba(168,85,247,.3)"><div class="label">Pontos este mês</div><div class="value" style="color:#a855f7">${formatPoints(myPts)}</div></div>
  `;

  // Horas por cliente — mês atual (sempre, independente do filtro de período)
  const monthEntries = myAllEntries.filter(e => isSameMonth(entryDate(e), now));
  const byClient = {};
  monthEntries.forEach(e => { byClient[e.client] = (byClient[e.client] || 0) + e.durationSeconds; });
  const sortedClients = Object.entries(byClient).sort((a,b) => b[1]-a[1]);
  const totalMonthSecs = Object.values(byClient).reduce((s,v) => s+v, 0);
  const clientBox = document.getElementById('myClientHours');
  if (sortedClients.length === 0) {
    clientBox.innerHTML = `<p style="color:var(--muted);font-size:13px">Nenhum registro este mês.</p>`;
  } else {
    clientBox.innerHTML = sortedClients.map(([name, secs]) => {
      const pct = totalMonthSecs > 0 ? ((secs / totalMonthSecs) * 100).toFixed(0) : 0;
      const barColor = '#4f8ef7';
      return `
        <div style="display:grid;grid-template-columns:160px 1fr auto;gap:12px;align-items:center">
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(name)}</div>
          <div style="height:6px;background:var(--surface-3);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:99px;transition:width .5s"></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:var(--accent);white-space:nowrap">${fmtH(secs)}</div>
        </div>`;
    }).join('');
  }

  const tbody = document.getElementById('myWorkTable');
  if (!myEntries.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty"><div class="ei">📋</div>Nenhuma tarefa registrada ainda.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = myEntries.map(e => {
    const pts = getEntryPoints(e, currentUser.role);
    return `<tr id="row-${e.id}">
      <td>${esc(e.date)}</td>
      <td><strong>${esc(e.client)}</strong></td>
      <td><strong>${esc(e.task)}</strong>${e.taskDesc ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(e.taskDesc)}</div>` : ''}</td>
      <td><span class="badge badge-blue">${esc(e.category)}</span></td>
      <td class="mono">${fmtTime(e.start)}</td>
      <td class="mono">${fmtTime(e.end)}</td>
      <td><strong>${formatDuration(e.durationSeconds)}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="pts-badge blue" id="pts-label-${e.id}">${formatPoints(pts)} pts</span>
          <button onclick="editEntryPoints('${e.id}',${Number(pts) || 0})" style="background:transparent;border:1px solid var(--border);border-radius:6px;padding:3px 7px;cursor:pointer;color:var(--muted);width:auto;font-size:11px" title="Editar pontos">✏️</button>
          <button style="background:transparent;border:1px solid var(--border);border-radius:6px;padding:3px 7px;cursor:pointer;color:var(--muted);width:auto;font-size:11px" onclick="deleteWorkEntry('${e.id}')">
  🗑️
</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}
    async function deleteWorkEntry(entryId) {
      if (!entryId) return;
    
      if (!confirm('Deseja excluir este registro de trabalho?')) return;
    
      try {
        const entries = getEntries();
        const updated = entries.filter(e => e.id !== entryId);
    
        set('entries', updated);
    
        if (typeof renderMyWork === 'function') renderMyWork();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderPerformance === 'function') renderPerformance();
    
        await fetch(remapApiUrl('timer.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_by_uid',
            uid_local: entryId
          })
        });
    
      } catch (e) {
        console.error('Erro ao excluir registro:', e);
        alert('Erro ao excluir registro.');
      }
    }
    
function editEntryPoints(entryId, currentPts) {
  const newPts = prompt(`Editar pontos desta tarefa:\nValor atual: ${currentPts} pts\n\nNovo valor:`, currentPts);
  if (newPts === null) return; // cancelled
  const parsed = Number(String(newPts).replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return alert('Valor inválido. Use um número maior ou igual a 0.');
  const entries = getEntries();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx === -1) return;
  entries[idx].taskPoints = parsed;
  set('entries', entries);
  // Update badge inline without full re-render
  const label = document.getElementById(`pts-label-${entryId}`);
  if (label) label.textContent = `${formatPoints(parsed)} pts`;
  // Also update the button's onclick
  const btn = label?.nextElementSibling;
  if (btn) btn.setAttribute('onclick', `editEntryPoints('${entryId}',${parsed})`);
}

function exportMyCSV() {
  const entries = getEntries().filter(e => entryBelongsToUser(e, currentUser.name));
  downloadCSV(entries, `meu-trabalho-${currentUser.name}`);
}
// ════════════════════════════════════════
function renderDashboard() {
  const entries = getFilteredEntries();
  const allEntries = getEntries();
  updateFilters(allEntries);
  updateDirStats(entries);
  renderCharts(entries);
  renderSummaries(entries);
  renderTable(entries);
}

function getFilteredEntries() {
  let entries = getEntries();
  const period = document.getElementById('periodFilter')?.value || 'all';
  const client = document.getElementById('clientFilter')?.value || 'all';
  const user = document.getElementById('userFilter')?.value || 'all';
  const role = document.getElementById('roleFilter')?.value || 'all';
  const now = new Date();
  entries = filterByPeriod(entries, period, now);
  if (client !== 'all') entries = entries.filter(e => e.client === client);
  if (user !== 'all') entries = entries.filter(e => isSameUserName(e.user, user));
  if (role !== 'all') entries = entries.filter(e => e.role === role);
  return entries;
}

function updateFilters(entries) {
  syncSelect('clientFilter', [...new Set(entries.map(e => e.client))].sort());
  syncSelect('userFilter', [...new Set(entries.map(e => e.user))].sort());
  syncSelect('roleFilter', [...new Set(entries.map(e => e.role))].sort());
}

function syncSelect(id, values) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = `<option value="all">Todos</option>` + values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  sel.value = values.includes(cur) ? cur : 'all';
}

function updateDirStats(entries) {
  const now = new Date();
  const month = entries.filter(e => isSameMonth(new Date(e.start), now));
  const totalHours = sum(entries) / 3600;
  const clients = getClients();

  // Total revenue of active clients
  const totalRevenue = clients.reduce((a, c) => a + (parseFloat(c.value) || 0), 0);

  // Total cost (collabs)
  const collabs = getCollabs();
  const totalCost = collabs.reduce((a, c) => a + (parseFloat(c.salary) || 0), 0);
  const margin = totalRevenue - totalCost;

  document.getElementById('dirStats').innerHTML = `
    <div class="stat accent"><div class="label">Horas registradas</div><div class="value">${totalHours.toFixed(1)}h</div><div class="sub">${entries.length} registros</div></div>
    <div class="stat green"><div class="label">Receita mensal</div><div class="value">R$${fmtMoney(totalRevenue)}</div><div class="sub">${clients.length} clientes</div></div>
    <div class="stat red"><div class="label">Custo equipe</div><div class="value">R$${fmtMoney(totalCost)}</div><div class="sub">${collabs.length} colaboradores</div></div>
    <div class="stat ${margin >= 0 ? 'green' : 'red'}"><div class="label">Margem bruta</div><div class="value">R$${fmtMoney(margin)}</div><div class="sub">${totalRevenue > 0 ? ((margin/totalRevenue)*100).toFixed(0) : 0}% da receita</div></div>
  `;
}

function renderCharts(entries) {
  const byClient = groupSeconds(entries, 'client');
  const byRole = groupSeconds(entries, 'role');
  const collabs = getCollabs();
  const clients = getClients();
  const now = new Date();

  charts.client = drawBarChart(charts.client, 'clientChart', byClient, 'Horas', '#4f8ef7');
  charts.role = drawBarChart(charts.role, 'roleChart', byRole, 'Horas', '#a855f7');

  // Cost per collaborator
  const byUser = groupSeconds(entries, 'user');
  const costData = {};
  collabs.forEach(c => {
    const hours = (byUser[c.name] || 0) / 3600;
    const hourlyRate = (parseFloat(c.salary) || 0) / (parseFloat(c.monthHours) || 176);
    costData[c.name] = +(hours * hourlyRate).toFixed(2);
  });
  charts.cost = drawBarChart(charts.cost, 'costChart', costData, 'Custo R$', '#f59e0b');

  // Hours x Package per client
  const packageLabels = [], packageUsed = [], packageTotal = [];
  clients.forEach(c => {
    const usedSeconds = byClient[c.name] || 0;
    const usedHours = usedSeconds / 3600;
    const totalHours = parseFloat(c.hours) || 0;
    if (totalHours > 0) {
      packageLabels.push(c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name);
      packageUsed.push(+usedHours.toFixed(2));
      packageTotal.push(totalHours);
    }
  });
  if (charts.package) charts.package.destroy();
  const ctx4 = document.getElementById('packageChart');
  if (packageLabels.length) {
    charts.package = new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: packageLabels,
        datasets: [
          { label: 'Horas usadas', data: packageUsed, backgroundColor: 'rgba(79,142,247,.8)', borderRadius: 6 },
          { label: 'Horas do pacote', data: packageTotal, backgroundColor: 'rgba(255,255,255,.08)', borderRadius: 6 }
        ]
      },
      options: chartOptions()
    });
  }

  // Margin per client
  const marginLabels = [], marginVals = [], marginColors = [];
  clients.forEach(c => {
    const monthEntries = entries.filter(e => e.client === c.name);
    let clientCost = 0;
    monthEntries.forEach(e => {
      const col = collabs.find(x => x.name === e.user);
      if (col) clientCost += (parseFloat(col.salary)/(parseFloat(col.monthHours)||176)) * (e.durationSeconds/3600);
    });
    const revenue = parseFloat(c.value) || 0;
    if (revenue > 0 || clientCost > 0) {
      marginLabels.push(c.name.length > 12 ? c.name.slice(0,12)+'…' : c.name);
      marginVals.push(+(revenue - clientCost).toFixed(2));
      marginColors.push(revenue - clientCost >= 0 ? 'rgba(34,197,94,.8)' : 'rgba(239,68,68,.8)');
    }
  });
  if (charts.margin) charts.margin.destroy();
  const ctx5 = document.getElementById('marginChart');
  if (marginLabels.length) {
    charts.margin = new Chart(ctx5, {
      type: 'bar',
      data: { labels: marginLabels, datasets: [{ label: 'Margem R$', data: marginVals, backgroundColor: marginColors, borderRadius: 6 }] },
      options: chartOptions()
    });
  }

  // Monthly comparison (last 6 months)
  const monthlyData = {};
  const allEntries = getEntries();
  allEntries.forEach(e => {
    const d = new Date(e.start);
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    monthlyData[label] = (monthlyData[label] || 0) + e.durationSeconds;
  });
  // Sort by date
  const sortedMonths = Object.entries(monthlyData)
    .sort((a,b) => {
      const toD = s => { const p=s.split('/'); return new Date(`20${p[1]}`,['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].indexOf(p[0].replace('.','').toLowerCase()),1); };
      return toD(a[0]) - toD(b[0]);
    }).slice(-6);
  if (charts.monthly) charts.monthly.destroy();
  const ctx6 = document.getElementById('monthlyChart');
  charts.monthly = new Chart(ctx6, {
    type: 'line',
    data: {
      labels: sortedMonths.map(x => x[0]),
      datasets: [{
        label: 'Horas totais',
        data: sortedMonths.map(x => +(x[1]/3600).toFixed(1)),
        borderColor: '#4f8ef7', backgroundColor: 'rgba(79,142,247,.1)',
        borderWidth: 2, pointRadius: 4, fill: true, tension: 0.4
      }]
    },
    options: chartOptions()
  });

  // Ranking
  renderRanking(entries);
}

function renderRanking(entries) {
  const now = new Date();
  const monthEntries = entries.filter(e => isSameMonth(new Date(e.start), now));
  const byUser = groupSeconds(monthEntries, 'user');
  const ranked = Object.entries(byUser).sort((a,b) => b[1]-a[1]);
  const medals = ['🥇','🥈','🥉'];
  const box = document.getElementById('rankingList');
  if (!ranked.length) { box.innerHTML = '<p style="color:var(--muted);font-size:13px">Nenhum registro este mês.</p>'; return; }
  box.innerHTML = ranked.map(([name, secs], i) => `
    <div class="summary-item">
      <span class="si-name">${medals[i] || `${i+1}.`} ${esc(name)}</span>
      <strong>${fmtH(secs)}</strong>
    </div>
  `).join('');
}

function drawBarChart(instance, id, dataObj, label, color) {
  if (instance) instance.destroy();
  const ctx = document.getElementById(id);
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj).map(s => +(s / 3600).toFixed(2));
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label, data, backgroundColor: color + 'cc', borderRadius: 6 }] },
    options: chartOptions()
  });
}

function chartOptions() {
  return {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'DM Sans' } } } },
    scales: {
      x: { ticks: { color: '#6b7280', font: { family: 'DM Sans', size: 11 } }, grid: { color: 'rgba(255,255,255,.05)' } },
      y: { ticks: { color: '#6b7280', font: { family: 'DM Sans', size: 11 } }, grid: { color: 'rgba(255,255,255,.05)' } }
    }
  };
}

function renderSummaries(entries) {
  renderSummaryBox('weeklySummary', groupByWeek(entries));
  renderSummaryBox('monthlySummary', groupByMonth(entries));
}

function renderSummaryBox(id, data) {
  const box = document.getElementById(id);
  const rows = Object.entries(data).sort().reverse();
  if (!rows.length) { box.innerHTML = '<p style="color:var(--muted);font-size:13px">Nenhum registro.</p>'; return; }
  box.innerHTML = rows.map(([label, seconds]) => `
    <div class="summary-item">
      <span class="si-name">${esc(label)}</span>
      <strong>${fmtH(seconds)}</strong>
    </div>
  `).join('');
}

function renderTable(entries) {
  const collabs = getCollabs();
  const tbody = document.getElementById('entriesTable');
  if (!entries.length) { tbody.innerHTML = `<tr><td colspan="10"><div class="empty"><div class="ei">📊</div>Nenhum registro encontrado.</div></td></tr>`; return; }

  tbody.innerHTML = entries.map(e => {
    const collab = collabs.find(c => c.name === e.user);
    const hourlyRate = collab ? (parseFloat(collab.salary) / (parseFloat(collab.monthHours) || 176)) : 0;
    const cost = hourlyRate * (e.durationSeconds / 3600);
    return `
      <tr>
        <td>${esc(e.date)}</td>
        <td>${esc(e.user)}</td>
        <td><span class="badge badge-blue">${esc(e.role)}</span></td>
        <td><strong>${esc(e.client)}</strong></td>
        <td style="max-width:180px;color:var(--muted-2)">${esc(e.task)}</td>
        <td>${esc(e.category)}</td>
        <td class="mono">${fmtTime(e.start)}</td>
        <td class="mono">${fmtTime(e.end)}</td>
        <td><strong>${formatDuration(e.durationSeconds)}</strong></td>
        <td style="color:var(--yellow)">R$${cost.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

// ════════════════════════════════════════
// CLIENTS
// ════════════════════════════════════════
function openClientModal(id) {
  const modal = document.getElementById('clientModal');
  modal.classList.remove('hidden');
  if (id) {
    const c = getClients().find(x => x.id === id);
    if (!c) return;
    document.getElementById('clientModalTitle').textContent = 'Editar cliente';
    document.getElementById('clientModalId').value = id;
    document.getElementById('cmName').value = c.name;
    document.getElementById('cmValue').value = c.value;
    document.getElementById('cmHours').value = c.hours;
    document.getElementById('cmNotes').value = c.notes;
  } else {
    document.getElementById('clientModalTitle').textContent = 'Novo cliente';
    document.getElementById('clientModalId').value = '';
    ['cmName','cmValue','cmHours','cmNotes'].forEach(i => document.getElementById(i).value = '');
  }
}
function closeClientModal() { document.getElementById('clientModal').classList.add('hidden'); }

function saveClient() {
  const name = document.getElementById('cmName').value.trim();
  if (!name) return alert('Informe o nome do cliente.');
  const id = document.getElementById('clientModalId').value || crypto.randomUUID();
  const client = { id, name, value: document.getElementById('cmValue').value, hours: document.getElementById('cmHours').value, notes: document.getElementById('cmNotes').value.trim() };

  const clients = getClients().filter(c => c.id !== id);
  clients.push(client);
  set('clients', clients);
  closeClientModal();
  renderClientGrid();
  fillClientDatalist();
}

function deleteClient(id) {
  if (!confirm('Remover este cliente?')) return;
  set('clients', getClients().filter(c => c.id !== id));
  renderClientGrid();
  fillClientDatalist();
}

function renderClientGrid() {
  const clients = getClients();
  const entries = getEntries();
  const collabs = getCollabs();
  const now = new Date();
  const grid = document.getElementById('clientGrid');

  if (!clients.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="ei">🏢</div>Nenhum cliente cadastrado ainda.</div>`; return; }

  grid.innerHTML = clients.map(c => {
    const monthEntries = entries.filter(e => e.client === c.name && isSameMonth(new Date(e.start), now));
    const usedHours = sum(monthEntries) / 3600;
    const totalHours = parseFloat(c.hours) || 0;
    const pct = totalHours > 0 ? Math.min((usedHours / totalHours) * 100, 100) : 0;
    const fillClass = pct < 70 ? 'ok' : pct < 90 ? 'warn' : 'over';
    const badgeClass = pct < 70 ? 'badge-green' : pct < 90 ? 'badge-yellow' : 'badge-red';

    // Custo gerado neste cliente no mês
    let clientCost = 0;
    monthEntries.forEach(e => {
      const col = collabs.find(x => x.name === e.user);
      if (col) {
        const rate = parseFloat(col.salary) / (parseFloat(col.monthHours) || 176);
        clientCost += rate * (e.durationSeconds / 3600);
      }
    });
    const revenue = parseFloat(c.value) || 0;
    const margin = revenue - clientCost;
    const marginPct = revenue > 0 ? ((margin / revenue) * 100).toFixed(0) : '—';
    const marginColor = margin >= 0 ? 'var(--green)' : 'var(--red)';

    return `
      <div class="client-card">
        <div class="cname">${esc(c.name)}</div>
        <div class="client-meta">
          <span>Valor plano: <strong>R$ ${fmtMoney(revenue)}/mês</strong></span>
          <span>Custo gerado: <strong style="color:var(--yellow)">R$ ${clientCost.toFixed(0)}</strong></span>
          <span>Margem: <strong style="color:${marginColor}">R$ ${fmtMoney(margin)} (${marginPct}%)</strong></span>
          ${c.notes ? `<span style="margin-top:6px;color:var(--muted);font-size:12px">${esc(c.notes)}</span>` : ''}
        </div>
        ${totalHours > 0 ? `
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Horas este mês</span>
              <span class="badge ${badgeClass}">${usedHours.toFixed(1)}h / ${totalHours}h</span>
            </div>
            <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
          </div>
        ` : `<div style="margin-top:8px;font-size:12px;color:var(--muted)">${usedHours.toFixed(1)}h registradas este mês</div>`}
        <div class="client-actions">
          <button class="btn-dark btn-sm" onclick="openClientModal('${c.id}')">Editar</button>
          <button class="btn-red btn-sm" onclick="deleteClient('${c.id}')">Remover</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderClientGridCollab() {
  const clients = getClients();
  const entries = getEntries();
  const now = new Date();
  const grid = document.getElementById('clientGridCollab');
  if (!clients.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="ei">🏢</div>Nenhum cliente cadastrado.</div>`; return; }
  grid.innerHTML = clients.map(c => {
    const monthEntries = entries.filter(e => e.client === c.name && isSameMonth(new Date(e.start), now));
    const myMonthEntries = monthEntries.filter(e => entryBelongsToUser(e, currentUser.name));
    const totalH = sum(monthEntries) / 3600;
    const myH = sum(myMonthEntries) / 3600;
    const totalHours = parseFloat(c.hours) || 0;
    const pct = totalHours > 0 ? Math.min((totalH / totalHours) * 100, 100) : 0;
    const fillClass = pct < 70 ? 'ok' : pct < 90 ? 'warn' : 'over';
    const badgeClass = pct < 70 ? 'badge-green' : pct < 90 ? 'badge-yellow' : 'badge-red';
    return `
      <div class="client-card">
        <div class="cname">${esc(c.name)}</div>
        <div class="client-meta">
          <span>Horas totais este mês: <strong>${totalH.toFixed(1)}h</strong></span>
          <span>Suas horas neste cliente: <strong style="color:var(--accent)">${myH.toFixed(1)}h</strong></span>
          ${c.notes ? `<span style="margin-top:6px;color:var(--muted);font-size:12px">${esc(c.notes)}</span>` : ''}
        </div>
        ${totalHours > 0 ? `
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Horas do pacote</span>
              <span class="badge ${badgeClass}">${totalH.toFixed(1)}h / ${totalHours}h</span>
            </div>
            <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ════════════════════════════════════════
// TEAM
// ════════════════════════════════════════
function openCollabModal(id) {
  const modal = document.getElementById('collabModal');
  modal.classList.remove('hidden');
  if (id) {
    const c = getCollabs().find(x => x.id === id);
    if (!c) return;
    document.getElementById('collabModalTitle').textContent = 'Editar colaborador';
    document.getElementById('collabModalId').value = id;
    document.getElementById('colName').value = c.name;
    document.getElementById('colRole').value = c.role;
    document.getElementById('colSalary').value = c.salary;
    document.getElementById('colMonthHours').value = c.monthHours || 176;
  } else {
    document.getElementById('collabModalTitle').textContent = 'Cadastrar colaborador';
    document.getElementById('collabModalId').value = '';
    ['colName','colSalary'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('colMonthHours').value = 176;
  }
}
function closeCollabModal() { document.getElementById('collabModal').classList.add('hidden'); }

function saveCollab() {
  const name = document.getElementById('colName').value.trim();
  if (!name) return alert('Informe o nome.');
  const id = document.getElementById('collabModalId').value || crypto.randomUUID();
  const collab = { id, name, role: document.getElementById('colRole').value, salary: document.getElementById('colSalary').value, monthHours: document.getElementById('colMonthHours').value };
  const collabs = getCollabs().filter(c => c.id !== id);
  collabs.push(collab);
  set('collabs', collabs);
  closeCollabModal();
  renderTeam();
}

function deleteCollab(id) {
  if (!confirm('Remover colaborador?')) return;
  set('collabs', getCollabs().filter(c => c.id !== id));
  renderTeam();
}

function renderTeam() {
  const collabs = getCollabs();
  const entries = getEntries();
  const now = new Date();
  const grid = document.getElementById('collabGrid');

  const monthEntries = entries.filter(e => isSameMonth(new Date(e.start), now));

  if (!collabs.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="ei">👥</div>Nenhum colaborador cadastrado.</div>`; return; }

  grid.innerHTML = collabs.map(c => {
    const myEntries = monthEntries.filter(e => isSameUserName(e.user, c.name));
    const hours = sum(myEntries) / 3600;
    const hourlyRate = parseFloat(c.salary) / (parseFloat(c.monthHours) || 176);
    const cost = hours * hourlyRate;
    const topClient = topClientFor(myEntries);
    const colors = ['#4f8ef7','#22c55e','#f59e0b','#a855f7','#06b6d4','#ef4444'];
    const color = colors[collabs.indexOf(c) % colors.length];

    return `
      <div class="collab-card">
        <div class="collab-top">
          <div class="collab-avatar" style="background:${color};overflow:hidden;padding:0">${getAvatar(c.name, 38, 11, 14)}</div>
          <div>
            <div class="collab-name">${esc(c.name)}</div>
            <div class="collab-role">${esc(c.role)}</div>
          </div>
        </div>
        <div class="collab-stats">
          <div class="collab-stat"><div class="cv">${hours.toFixed(1)}h</div><div class="cl">Horas/mês</div></div>
          <div class="collab-stat"><div class="cv">R$${fmtMoney(parseFloat(c.salary)||0)}</div><div class="cl">Salário</div></div>
          <div class="collab-stat"><div class="cv" style="color:var(--yellow)">R$${cost.toFixed(0)}</div><div class="cl">Custo gerado</div></div>
          <div class="collab-stat"><div class="cv" style="color:var(--muted-2);font-size:12px">${topClient || '—'}</div><div class="cl">Top cliente</div></div>
        </div>
        <div class="client-actions" style="margin-top:12px">
          <button class="btn-dark btn-sm" onclick="openCollabModal('${c.id}')">Editar</button>
          <button class="btn-red btn-sm" onclick="deleteCollab('${c.id}')">Remover</button>
        </div>
      </div>
    `;
  }).join('');

  // Team chart
  const byUser = {};
  collabs.forEach(c => {
    const hrs = sum(monthEntries.filter(e => isSameUserName(e.user, c.name))) / 3600;
    byUser[c.name] = +hrs.toFixed(2);
  });
  if (charts.team) charts.team.destroy();
  const ctx = document.getElementById('teamChart');
  charts.team = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(byUser),
      datasets: [{ label: 'Horas este mês', data: Object.values(byUser), backgroundColor: '#4f8ef7cc', borderRadius: 8 }]
    },
    options: chartOptions()
  });
}

function topClientFor(entries) {
  const byClient = groupSeconds(entries, 'client');
  if (!Object.keys(byClient).length) return null;
  return Object.entries(byClient).sort((a,b) => b[1]-a[1])[0][0];
}
