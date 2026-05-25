
const DEFAULT_TAREFAS_COLS = [
  { id:'col_1', name:'Sempre precisa fazer', emoji:'🔁' },
  { id:'col_2', name:'Social Media', emoji:'💬' },
  { id:'col_3', name:'Design', emoji:'🎨' },
  { id:'col_4', name:'Vídeos', emoji:'🎬' },
];

function remapTaskDbId(task) {
  if (!task) return 0;
  const direct = parseInt(task.dbId || 0, 10) || 0;
  if (direct) return direct;
  const m = String(task.id || '').match(/^dbtask_(\d+)$/);
  return m ? (parseInt(m[1], 10) || 0) : 0;
}

function remapTaskIdentity(task) {
  if (!task) return 'empty';
  const uid = String(task.localUid || task.uid_local || '').trim();
  if (uid) return 'uid:' + uid;

  const id = String(task.id || '').trim();
  if (id && !/^dbtask_\d+$/.test(id)) return 'uid:' + id;

  const dbId = remapTaskDbId(task);
  if (dbId) return 'db:' + dbId;

  return 'sig:' + [
    task.title || task.titulo || '',
    task.desc || task.descricao || '',
    task.client || task.cliente || '',
    task.assignee || task.responsavel || '',
    task.createdBy || task.delegado_por || '',
    task.date || task.deadline || task.prazo || '',
    task.colId || task.coluna || '',
    task.status || task.estado || ''
  ].map(v => String(v).trim().toLowerCase()).join('|');
}

function remapNormalizeTask(task) {
  const t = { ...(task || {}) };
  if (!t.id) t.id = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  if (!t.localUid && !/^dbtask_\d+$/.test(String(t.id))) t.localUid = t.id;
  if (!t.colId) t.colId = t.coluna || 'col_1';
  if (!t.title) t.title = t.titulo || 'Sem título';
  if (t.desc === undefined) t.desc = t.descricao || '';
  if (t.client === undefined) t.client = t.cliente || '';
  if (t.assignee === undefined) t.assignee = t.responsavel || '';
  if (t.date === undefined) t.date = t.prazo || t.deadline || '';
  if (t.deadline === undefined) t.deadline = t.date || '';
  if (!Array.isArray(t.labels)) t.labels = [];
  if (!Array.isArray(t.subtasks)) t.subtasks = [];
  if (!Array.isArray(t.attachments)) t.attachments = [];
  if (!Array.isArray(t.comments)) t.comments = [];
  const status = String(t.status || t.estado || '').toLowerCase();
  if (t.done || ['finalizado','concluido','concluida'].includes(status)) {
    t.done = true;
    t.status = 'concluido';
  } else {
    t.done = false;
    t.status = t.status || 'pendente';
  }
  return t;
}

function remapNormalizeTarefasData(data) {
  const clean = (data && typeof data === 'object') ? data : {};
  const cols = Array.isArray(clean.cols) && clean.cols.length ? clean.cols : DEFAULT_TAREFAS_COLS.slice();
  const seenCols = new Set();
  const normalizedCols = cols
    .filter(c => c && c.id && !seenCols.has(c.id) && seenCols.add(c.id))
    .map(c => ({ id: String(c.id), name: c.name || c.nome || 'Seção', emoji: c.emoji || '' }));

  const byKey = new Map();
  (Array.isArray(clean.tasks) ? clean.tasks : []).forEach(raw => {
    const task = remapNormalizeTask(raw);
    const key = remapTaskIdentity(task);
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, task);
      return;
    }
    const currentDb = remapTaskDbId(current);
    const taskDb = remapTaskDbId(task);
    const preferNew =
      (task.done && !current.done) ||
      (!!taskDb && !currentDb) ||
      ((task.updatedAt || task.atualizado_em || task.completedAt || '') > (current.updatedAt || current.atualizado_em || current.completedAt || ''));
    byKey.set(key, preferNew ? { ...current, ...task } : { ...task, ...current });
  });

  return { cols: normalizedCols.length ? normalizedCols : DEFAULT_TAREFAS_COLS.slice(), tasks: Array.from(byKey.values()) };
}

function getTarefasData() {
  if (window.__tarefasData && Array.isArray(window.__tarefasData.tasks) && Array.isArray(window.__tarefasData.cols)) {
    window.__tarefasData = remapNormalizeTarefasData(window.__tarefasData);
    return window.__tarefasData;
  }

  if (window.__remoteData && window.__remoteData.tarefas) {
    window.__tarefasData = remapNormalizeTarefasData(window.__remoteData.tarefas);
    return window.__tarefasData;
  }

  const localData = tryLS(() => JSON.parse(localStorage.getItem('tt_tarefas_v1') || 'null'));
  if (localData && Array.isArray(localData.tasks)) {
    window.__tarefasData = remapNormalizeTarefasData(localData);
    return window.__tarefasData;
  }

  if (_store.tarefas && Array.isArray(_store.tarefas.tasks)) {
    window.__tarefasData = remapNormalizeTarefasData(_store.tarefas);
    return window.__tarefasData;
  }

  window.__tarefasData = remapNormalizeTarefasData({ cols: DEFAULT_TAREFAS_COLS, tasks: [] });
  return window.__tarefasData;
}

function setTarefasData(data) {
  const normalized = remapNormalizeTarefasData(data);
  _store.tarefas = normalized;
  window.__tarefasData = normalized;
  tryLS(() => localStorage.setItem('tt_tarefas_v1', JSON.stringify(normalized)));

  try {
    if (window.__remapSaveTarefasToDb) window.__remapSaveTarefasToDb(normalized);
  } catch(e) {
    console.warn('[Remap] Falha ao enviar tarefas para o banco:', e);
  }
}

function initTarefasData() {
  const d = getTarefasData();
  if (!d.cols || d.cols.length === 0) {
    setTarefasData({ cols: DEFAULT_TAREFAS_COLS.slice(), tasks: [] });
  }
}

// State
function isTaskConcluida(task) {
  const status = String(task.status || task.estado || '').toLowerCase();
  return !!task.done || status === 'finalizado' || status === 'concluido' || status === 'concluida';
}

let kFilter = 'all';
let currentTaskId = null;
let currentTaskColId = null;
let dragSrcCard = null;

function setKFilter(f, el) {
  kFilter = f;
  document.querySelectorAll('.kfb-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderKanban();
}

// ── RENDER ──
function renderKanban() {
  initTarefasData();
  const data = getTarefasData();
  const now = new Date();
  const todayStr = now.toISOString().slice(0,10);
  const board = document.getElementById('kanbanBoard');
  if (!board) return;

  board.innerHTML = '';

  data.cols.forEach(col => {
    let tasks = data.tasks.filter(t => t.colId === col.id && !isTaskConcluida(t));

    // Filter
    if (kFilter === 'mine') tasks = tasks.filter(t => t.assignee === currentUser.name);
    if (kFilter === 'today') tasks = tasks.filter(t => t.date === todayStr);
    if (kFilter === 'overdue') tasks = tasks.filter(t => t.date && t.date < todayStr && !t.done);

    const colEl = document.createElement('div');
    colEl.className = 'kanban-col';
    colEl.dataset.colId = col.id;

    const doneTasks = tasks.filter(t => t.done).length;

    colEl.innerHTML = `
      <div class="kanban-col-header">
        <div class="kanban-col-title">
          ${col.emoji ? `<span>${col.emoji}</span>` : ''}
          <span>${esc(col.name)}</span>
          <span class="kanban-col-count">${tasks.length}</span>
        </div>
        <button class="kanban-col-menu" onclick="openColMenu('${col.id}',this)">···</button>
      </div>
      <div class="kanban-cards" id="cards-${col.id}" data-col-id="${col.id}"></div>
      <button class="add-task-btn" id="addBtn-${col.id}" onclick="showInlineForm('${col.id}')">
        <span style="font-size:16px;color:var(--muted)">+</span> Adicionar tarefa
      </button>
      <div id="itf-${col.id}" style="display:none"></div>`;

    board.appendChild(colEl);

    const cardsEl = colEl.querySelector(`#cards-${col.id}`);

    tasks.forEach(task => {
      const card = buildTaskCard(task, todayStr);
      cardsEl.appendChild(card);
    });

    // Drag-over on column
    cardsEl.addEventListener('dragover', e => { e.preventDefault(); colEl.classList.add('drag-over'); });
    cardsEl.addEventListener('dragleave', () => colEl.classList.remove('drag-over'));
    cardsEl.addEventListener('drop', e => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      if (dragSrcCard) {
        const d = getTarefasData();
        const t = d.tasks.find(x => x.id === dragSrcCard);
        if (t) {   t.colId = col.id;   setTarefasData(d);   remapSaveTaskColumnToDb(t);   renderKanban(); }
      }
    });
  });

  // Add section button
  const addCol = document.createElement('button');
  addCol.className = 'add-col-btn';
  addCol.innerHTML = '+ Nova seção';
  addCol.onclick = openNewColModal;
  board.appendChild(addCol);
}

async function remapSaveTaskColumnToDb(task) {
  if (!task || !task.dbId) return;

  try {
    await fetch(remapApiUrl('tarefas.php'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: task.dbId,
        coluna: task.colId || 'col_1'
      })
    });
  } catch (e) {
    console.warn('[Remap] Falha ao salvar coluna da tarefa:', e);
  }
}

function buildTaskCard(task, todayStr) {
  const card = document.createElement('div');
  const pClass = `priority-${task.priority||4}`;
  card.className = `kanban-card ${pClass} ${task.done ? 'done' : ''}`;
  card.dataset.taskId = task.id;
  card.draggable = true;

  // Date display
  let dateHtml = '';
  if (task.date) {
    const isToday = task.date === todayStr;
    const isOverdue = task.date < todayStr && !task.done;
    const label = isToday ? 'Hoje' : formatTaskDate(task.date);
    const cls = isOverdue ? 'overdue' : isToday ? 'today' : '';
    dateHtml = `<span class="kanban-meta-chip ${cls}">📅 ${label}${task.recurrence ? ' 🔁' : ''}</span>`;
  }

  // Subtasks
  const subDone = (task.subtasks||[]).filter(s=>s.done).length;
  const subTotal = (task.subtasks||[]).length;
  const subHtml = subTotal > 0 ? `<span class="kanban-meta-chip">🔗 ${subDone}/${subTotal}</span>` : '';

  // Avatar
  let avatarHtml = '';
  if (task.assignee) {
    const img = COLLAB_AVATARS[task.assignee];
    avatarHtml = img
      ? `<div class="kanban-avatar"><img src="${img}" /></div>`
      : `<div class="kanban-avatar-initials">${task.assignee[0]}</div>`;
  }

  // Priority check circle class
  const pNum = task.priority || 4;
  const checkCls = task.done ? 'checked' : `p${pNum}`;

  // Priority label
  const pLabels = {1:'Alta',2:'Média',3:'Baixa',4:''};
  const pColors = {1:'#ef4444',2:'#f59e0b',3:'#4f8ef7',4:''};
  const priorityHtml = task.priority && task.priority < 4
    ? `<span class="kanban-meta-chip" style="color:${pColors[task.priority]};font-weight:700">● ${pLabels[task.priority]}</span>`
    : '';

  // Client chip
  const clientHtml = task.client
    ? `<span class="kanban-meta-chip" style="color:var(--muted-2)">🏢 ${esc(task.client)}</span>`
    : '';

  // Assignee
  let assigneeHtml = '';
  if (task.assignee) {
    const img = COLLAB_AVATARS[task.assignee];
    const firstName = task.assignee.split(' ')[0];
    assigneeHtml = img
      ? `<div style="display:flex;align-items:center;gap:4px"><div class="kanban-avatar"><img src="${img}" /></div><span style="font-size:11px;color:var(--muted)">${esc(firstName)}</span></div>`
      : `<div style="display:flex;align-items:center;gap:4px"><div class="kanban-avatar-initials">${task.assignee[0]}</div><span style="font-size:11px;color:var(--muted)">${esc(firstName)}</span></div>`;
  }

  // Timer state
  const isRunning = kanbanTimer && kanbanTimer.taskId === task.id;
  const timerLabel = isRunning
    ? `<span class="card-timer-display" id="ktimer-${task.id}">⏱ ${fmtKTimerDisplay()}</span>`
    : `<span style="font-size:12px;font-weight:700">▶ Timer</span>`;
  const pauseLabel = isRunning && kanbanTimer.pausedAt ? '▶ Retomar' : '⏸ Pausar';
  const pauseBtn = isRunning ? `<button class="card-timer-btn" id="kpausebtn-${task.id}" onclick="event.stopPropagation();pauseKanbanTimer('${task.id}')" title="Pausar ou retomar timer" style="padding:5px 10px;color:var(--yellow);border-color:var(--yellow)">${pauseLabel}</button>` : '';

  card.innerHTML = `
    <div class="kanban-card-top">
      <div class="task-check ${checkCls}" onclick="event.stopPropagation();toggleTaskDone('${task.id}')"></div>
      <div class="kanban-card-body">
        <div class="kanban-card-title ${task.done?'done':''}">${esc(task.title)}</div>
${task.desc ? `<div class="kanban-card-desc">${linkifyText(task.desc)}</div>` : ''}
<div class="kanban-card-meta" style="margin-top:6px">
          ${clientHtml}
          ${dateHtml}
          ${subHtml}
          ${priorityHtml}
          ${(task.labels||[]).map(l=>`<span class="kanban-meta-chip"><span style="width:6px;height:6px;border-radius:50%;background:${l.color};display:inline-block"></span>${esc(l.name)}</span>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
      ${assigneeHtml || '<div></div>'}
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end">
        ${pauseBtn}
        <button class="card-timer-btn ${isRunning && !kanbanTimer.pausedAt?'running':''}" id="ktimerbtn-${task.id}"
          onclick="event.stopPropagation();toggleKanbanTimer('${task.id}','${esc(task.title)}','${esc(task.colId)}')"
          title="${isRunning?'Finalizar e salvar timer':'Iniciar timer'}"
          style="${isRunning?'':'background:rgba(34,197,94,.1);color:var(--green);border-color:var(--green);padding:5px 12px;'}">
          ${timerLabel}
        </button>
      </div>
    </div>`;

  card.addEventListener('click', () => openTaskModal(task.id));
  card.addEventListener('dragstart', () => { dragSrcCard = task.id; card.classList.add('dragging'); });
  card.addEventListener('dragend', () => { dragSrcCard = null; card.classList.remove('dragging'); });

  return card;
}

function formatTaskDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day:'numeric', month:'short' });
}

// ── COL ACTIONS ──
function openColMenu(colId, btn) {
  const rect = btn.getBoundingClientRect();
  const picker = document.getElementById('kPicker');
  picker.classList.remove('hidden');
  picker.style.top = (rect.bottom + 6) + 'px';
  picker.style.left = rect.left + 'px';
  document.getElementById('kPickerContent').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:700">Seção</div>
    <button onclick="renameCol('${colId}');closeKPicker()" style="display:block;width:100%;background:transparent;border:0;text-align:left;padding:8px;cursor:pointer;color:var(--text);border-radius:6px;font-size:13px">✏️ Renomear</button>
    <button onclick="deleteCol('${colId}');closeKPicker()" style="display:block;width:100%;background:transparent;border:0;text-align:left;padding:8px;cursor:pointer;color:var(--red);border-radius:6px;font-size:13px">🗑 Excluir seção</button>`;
  setTimeout(() => document.addEventListener('click', closeKPicker, { once: true }), 0);
}

async function renameCol(colId) {
  const d = getTarefasData();
  const col = d.cols.find(c => c.id === colId);
  if (!col) return;
  const name = prompt('Novo nome da seção:', col.name);
  if (!name || !name.trim()) return;
  col.name = name.trim();
  setTarefasData(d);
  try { await saveColumnToDb(col, d.cols.findIndex(c => c.id === colId)); } catch(e) {}
  renderKanban();
}

async function deleteCol(colId) {
  if (!confirm('Excluir seção? As tarefas desta seção serão marcadas como concluídas para não voltarem duplicadas.')) return;
  const d = getTarefasData();
  d.cols = d.cols.filter(c => c.id !== colId);
  d.tasks.forEach(t => {
    if (t.colId === colId) {
      t.done = true;
      t.status = 'concluido';
      t.completedAt = new Date().toISOString();
    }
  });
  setTarefasData(d);
  try {
    await fetch(remapApiUrl('colunas.php') + '?id=' + encodeURIComponent(colId), { method: 'DELETE' });
  } catch(e) {
    console.warn('[Remap] Falha ao remover coluna no banco:', e);
  }
  renderKanban();
  renderPersonalTasks();
}

function openNewColModal() { document.getElementById('newColModal').classList.remove('hidden'); document.getElementById('newColName').value = ''; }
function closeNewColModal() { document.getElementById('newColModal').classList.add('hidden'); }
async function saveNewCol() {
  const name = document.getElementById('newColName').value.trim();
  if (!name) return alert('Informe o nome da seção.');

  const d = getTarefasData();

  const newCol = {
    id: 'col_' + Date.now(),
    name,
    emoji: ''
  };

d.cols.push(newCol);
setTarefasData(d);

await saveColumnToDb(newCol, d.cols.length);

closeNewColModal();
renderKanban();
}
async function saveColumnToDb(col, ordem = 0) {
  try {
    await fetch(remapApiUrl('colunas.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: col.id,
        name: col.name,
        emoji: col.emoji || '',
        ordem
      })
    });
  } catch (e) {
    console.warn('[Remap] Falha ao salvar coluna:', e);
  }
}
// ── TASK ACTIONS ──
function openNewTaskModal(defaultColId) {
  const d = getTarefasData();
  const sel = document.getElementById('ntSection');
  sel.innerHTML = d.cols.map(c => `<option value="${c.id}" ${c.id===defaultColId?'selected':''}>${esc(c.name)}</option>`).join('');
  const asel = document.getElementById('ntAssignee');
  const collabs = getCollabs();
  asel.innerHTML = `<option value="">— Sem responsável —</option>` + collabs.map(c => `<option value="${esc(c.name)}" ${c.name===currentUser.name?'selected':''}>${esc(c.name)}</option>`).join('');
  document.getElementById('ntTitle').value = '';
  document.getElementById('ntDate').value = '';
  document.getElementById('ntPriority').value = '4';
  document.getElementById('newTaskModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('ntTitle').focus(), 50);
}
function closeNewTaskModal() { document.getElementById('newTaskModal').classList.add('hidden'); }

function saveNewTask() {
  const title = document.getElementById('ntTitle').value.trim();
  if (!title) return alert('Informe o título.');
  const d = getTarefasData();
  const localTaskUid = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const task = {
    id: localTaskUid,
    localUid: localTaskUid,
    colId: document.getElementById('ntSection').value,
    title,
    desc: '',
    assignee: document.getElementById('ntAssignee').value,
    date: document.getElementById('ntDate').value,
    deadline: '',
    priority: parseInt(document.getElementById('ntPriority').value) || 4,
    recurrence: '',
    labels: [],
    subtasks: [],
    attachments: [],
    comments: [],
    done: false,
    createdBy: currentUser.name,
    createdAt: new Date().toISOString(),
  };
  d.tasks.unshift(task);
  setTarefasData(d);
  closeNewTaskModal();
  renderKanban();
  // Open the task for further editing
  openTaskModal(task.id);
}

function toggleTaskDone(taskId) {
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === taskId);
  if (!t) return;
  t.done = !t.done;
  t.status = t.done ? 'concluido' : 'pendente';
  if (t.done) t.completedAt = new Date().toISOString();
  if (t.done) {
    if (kanbanTimer && kanbanTimer.taskId === taskId) stopKanbanTimer(true);
    // Award points when completing
    const collabs = getCollabs();
    const col = collabs.find(c => c.name === (t.assignee || currentUser.name));
    const role = col ? col.role : currentUser.role;
    const pts = t.taskPoints || matchTaskPoints(t.title, role) || 3;
    // Save a zero-duration entry just for points tracking
    const entry = {
      id: 'ktask_done_' + Date.now(),
      client: t.client || '—',
      task: t.title,
      taskDesc: t.desc || '',
      taskPoints: pts,
      category: 'Tarefas',
      user: t.assignee || currentUser.name,
      role: role,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      date: new Date().toLocaleDateString('pt-BR'),
      durationSeconds: 0,
      fromKanban: taskId,
    };
    const entries = getEntries();
    entries.unshift(entry);
    set('entries', entries);
    // Remove from board after short delay
    setTimeout(() => {
      const d2 = getTarefasData();
      d2.tasks = d2.tasks.filter(x => x.id !== taskId);
      setTarefasData(d2);
      renderKanban();
      renderPersonalTasks();
    }, 800);
  }
  setTarefasData(d);
  renderKanban();
  renderPersonalTasks();
}

async function deleteCurrentTask() {
  if (!currentTaskId) return;
  if (!confirm('Excluir esta tarefa?')) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;

  // Não apaga do banco: marca como concluída e deixa a tarefa sumir da tela.
  t.done = true;
  t.status = 'concluido';
  t.completedAt = new Date().toISOString();

  setTarefasData(d);

  const dbId = remapTaskDbId(t);
  if (dbId) {
    try {
      await fetch(remapApiUrl('tarefas.php') + '?id=' + encodeURIComponent(dbId), { method: 'DELETE' });
    } catch(e) {
      console.warn('[Remap] Falha ao marcar tarefa como concluída no banco:', e);
    }
  }

  closeTaskModal();
  renderKanban();
  renderPersonalTasks();
}
function renderTmDescPreview() {
  const descEl = document.getElementById('tmDesc');
  const previewEl = document.getElementById('tmDescPreview');

  if (!descEl || !previewEl) return;

  const text = (descEl.value || '').trim();
  previewEl.innerHTML = text
    ? linkifyText(descEl.value)
    : '<span style="color:var(--muted)">Sem descrição</span>';

  descEl.classList.add('hidden');
  previewEl.classList.remove('hidden');
  previewEl.style.display = 'block';
}

function editTmDesc() {
  const descEl = document.getElementById('tmDesc');
  const previewEl = document.getElementById('tmDescPreview');

  if (!descEl || !previewEl) return;

  previewEl.classList.add('hidden');
  previewEl.style.display = 'none';
  descEl.classList.remove('hidden');
  descEl.style.display = 'block';

  setTimeout(() => {
    descEl.focus();
    const len = descEl.value.length;
    try { descEl.setSelectionRange(len, len); } catch(e) {}
  }, 0);
}

function finishEditTmDesc() {
  saveTaskFromModal(false);
  renderTmDescPreview();
}

window.editTmDesc = editTmDesc;
window.finishEditTmDesc = finishEditTmDesc;

// ── TASK MODAL ──
function openTaskModal(taskId) {
  const d = getTarefasData();
  const task = d.tasks.find(t => t.id === taskId);
  if (!task) return;
  currentTaskId = taskId;

  const overlay = document.getElementById('taskModalOverlay');
  overlay.classList.remove('hidden');

  // Breadcrumb
  const col = d.cols.find(c => c.id === task.colId);
  document.getElementById('tmBreadSection').textContent = col ? col.name : '';

  // Title / desc
  document.getElementById('tmTitle').value = task.title;

  // Mantém a descrição editável no textarea e mostra os links clicáveis na prévia abaixo
  const tmDescEl = document.getElementById('tmDesc');
  if (tmDescEl) tmDescEl.value = task.desc || '';
  renderTmDescPreview();

  // Check
  const chk = document.getElementById('tmCheck');
  chk.className = `task-check ${task.done ? 'checked' : `p${task.priority||4}`}`;

  // Properties
  document.getElementById('tmSection').textContent = col ? col.name : '—';
  renderTmAssignee(task);
  document.getElementById('tmDate').value = task.date || '';
  document.getElementById('tmDeadline').value = task.deadline || '';
  renderTmPriority(task);
  renderTmRecurrence(task);
  renderTmLabels(task);

  // Subtasks
  renderTmSubtasks(task);

  // Attachments
  renderTmAttachments(task);

  // Comments
  renderTmComments(task);

  // Comment avatar
  const avEl = document.getElementById('tmCommentAvatar');
  const img = COLLAB_AVATARS[currentUser.name];
  avEl.innerHTML = img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:8px">` : `<div style="width:28px;height:28px;border-radius:8px;background:var(--accent);display:grid;place-items:center;font-size:11px;font-weight:800;color:#fff">${currentUser.name[0]}</div>`;
}

function closeTaskModal() {
  document.getElementById('taskModalOverlay').classList.add('hidden');
  currentTaskId = null;
  renderKanban();
}

function closeTaskModalIfOutside(e) {
  if (e.target === document.getElementById('taskModalOverlay')) closeTaskModal();
}

function navTask(dir) {
  const d = getTarefasData();
  const idx = d.tasks.findIndex(t => t.id === currentTaskId);
  const next = d.tasks[idx + dir];
  if (next) openTaskModal(next.id);
}

function toggleTaskDoneModal() {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (t) {
    t.done = !t.done;
    t.status = t.done ? 'concluido' : 'pendente';
    if (t.done) t.completedAt = new Date().toISOString();
    setTarefasData(d);
    if (t.done) closeTaskModal(); else openTaskModal(currentTaskId);
  }
}

function saveTaskFromModal(updatePreview = true) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  t.title = document.getElementById('tmTitle').value;
  t.desc = document.getElementById('tmDesc').value;
  t.date = document.getElementById('tmDate').value;
  t.deadline = document.getElementById('tmDeadline').value;
  setTarefasData(d);
  if (updatePreview) renderTmDescPreview();
}

function renderTmAssignee(task) {
  const el = document.getElementById('tmAssignee');
  if (!task.assignee) { el.innerHTML = '<span style="color:var(--muted)">+ Atribuir</span>'; return; }
  const img = COLLAB_AVATARS[task.assignee];
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px">
      ${img ? `<img src="${img}" style="width:18px;height:18px;border-radius:4px;object-fit:cover">` : `<div style="width:18px;height:18px;border-radius:4px;background:var(--accent);display:grid;place-items:center;font-size:9px;color:#fff;font-weight:800">${task.assignee[0]}</div>`}
      <span>${esc(task.assignee.split(' ')[0])}</span>
    </div>`;
}

function renderTmPriority(task) {
  const labels = ['', 'Alta', 'Média', 'Baixa', 'Sem prioridade'];
  const colors = ['', '#ef4444', '#f59e0b', '#4f8ef7', 'var(--muted)'];
  const dots   = ['', '🔴 ', '🟡 ', '🔵 ', ''];
  const p = task.priority || 4;
  document.getElementById('tmPriority').innerHTML = `<span class="priority-dot" style="background:${colors[p]}"></span>${dots[p]}${labels[p]}`;
}

function renderTmRecurrence(task) {
  const labels = { '': '— Nenhuma', 'daily': 'Todo dia', 'weekly': 'Toda semana', 'monthly': 'Todo mês' };
  document.getElementById('tmRecurrence').textContent = labels[task.recurrence||''] || '—';
}

function renderTmLabels(task) {
  const el = document.getElementById('tmLabels');
  if (!task.labels || !task.labels.length) { el.textContent = '+ Adicionar'; return; }
  el.innerHTML = task.labels.map(l => `<span style="background:${l.color}22;color:${l.color};padding:2px 8px;border-radius:99px;font-size:11px">${esc(l.name)}</span>`).join(' ');
}

function cyclePriority() {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  const cycle = [1,2,3,4];
  const idx = cycle.indexOf(t.priority||4);
  t.priority = cycle[(idx+1) % cycle.length];
  setTarefasData(d);
  renderTmPriority(t);
}

function cycleRecurrence() {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  const cycle = ['', 'daily', 'weekly', 'monthly'];
  const idx = cycle.indexOf(t.recurrence||'');
  t.recurrence = cycle[(idx + 1) % cycle.length];
  setTarefasData(d);
  renderTmRecurrence(t);
}

// ── SUBTASKS ──
function renderTmSubtasks(task) {
  const list = document.getElementById('tmSubList');
  const done = (task.subtasks||[]).filter(s=>s.done).length;
  document.getElementById('tmSubCount').textContent = `${done}/${(task.subtasks||[]).length}`;
  list.innerHTML = (task.subtasks||[]).map((s,i) => `
    <div class="subtask-row">
      <div class="subtask-check ${s.done?'checked':''}" onclick="toggleSubtask(${i})"></div>
      <input class="subtask-input" value="${esc(s.title)}" oninput="updateSubtitle(${i},this.value)" style="${s.done?'text-decoration:line-through;color:var(--muted)':''}" />
      <button onclick="deleteSubtask(${i})" style="background:transparent;border:0;color:var(--muted);cursor:pointer;width:auto;padding:3px 6px;font-size:14px">✕</button>
    </div>`).join('');
}

function addSubtask() {
  const inp = document.getElementById('tmNewSub');
  const title = inp.value.trim();
  if (!title || !currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  if (!t.subtasks) t.subtasks = [];
  t.subtasks.push({ title, done: false });
  setTarefasData(d);
  inp.value = '';
  renderTmSubtasks(t);
}

function toggleSubtask(idx) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t || !t.subtasks[idx]) return;
  t.subtasks[idx].done = !t.subtasks[idx].done;
  setTarefasData(d);
  renderTmSubtasks(t);
}

function updateSubtitle(idx, val) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (t && t.subtasks[idx]) { t.subtasks[idx].title = val; setTarefasData(d); }
}

function deleteSubtask(idx) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  t.subtasks.splice(idx, 1);
  setTarefasData(d);
  renderTmSubtasks(t);
}

// ── ATTACHMENTS ──
function handleAttachment(event) {
  if (!currentTaskId) return;
  const files = Array.from(event.target.files);
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  if (!t.attachments) t.attachments = [];

  let pending = files.length;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      t.attachments.push({ name: file.name, type: file.type, data: e.target.result });
      pending--;
      if (pending === 0) { setTarefasData(d); renderTmAttachments(t); }
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function renderTmAttachments(task) {
  const list = document.getElementById('tmAttachList');
  if (!task.attachments || !task.attachments.length) { list.innerHTML = ''; return; }
  list.innerHTML = task.attachments.map((a, i) => {
    const isImg = a.type && a.type.startsWith('image/');
    return `<div class="attach-item">
      ${isImg ? `<img class="attach-thumb" src="${a.data}" />` : `<div class="attach-thumb" style="background:var(--surface-3);display:grid;place-items:center;font-size:18px">📄</div>`}
      <span class="attach-name">${esc(a.name)}</span>
      <a href="${a.data}" download="${esc(a.name)}" style="color:var(--accent);font-size:12px;text-decoration:none;white-space:nowrap">⬇</a>
      <button class="attach-del" onclick="deleteAttachment(${i})">✕</button>
    </div>`;
  }).join('');
}

function deleteAttachment(idx) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  t.attachments.splice(idx, 1);
  setTarefasData(d);
  renderTmAttachments(t);
}

// ── COMMENTS ──
function addComment() {
  if (!currentTaskId) return;
  const inp = document.getElementById('tmCommentInput');
  const text = inp.value.trim();
  if (!text) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  if (!t.comments) t.comments = [];
  t.comments.push({ author: currentUser.name, text, at: new Date().toISOString() });
  setTarefasData(d);
  inp.value = '';
  renderTmComments(t);
}

function renderTmComments(task) {
  const list = document.getElementById('tmCommentList');
  if (!task.comments || !task.comments.length) { list.innerHTML = ''; return; }
  list.innerHTML = task.comments.map(c => {
    const img = COLLAB_AVATARS[c.author];
    return `<div class="comment-item">
      ${img ? `<img src="${img}" style="width:28px;height:28px;border-radius:8px;object-fit:cover;flex-shrink:0">` : `<div style="width:28px;height:28px;border-radius:8px;background:var(--accent);display:grid;place-items:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0">${c.author[0]}</div>`}
      <div class="comment-body">
        <div class="comment-author">${esc(c.author)} <span class="comment-time">${new Date(c.at).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div>
        <div class="comment-text">${esc(c.text)}</div>
      </div>
    </div>`;
  }).join('');
}

// ── PICKERS ──
function openAssigneePicker() {
  if (!currentTaskId) return;
  const collabs = getCollabs();
  const picker = document.getElementById('kPicker');
  const propRow = document.getElementById('tmAssignee').closest('.task-prop-row');
  const rect = propRow.getBoundingClientRect();
  picker.classList.remove('hidden');
  picker.style.top = (rect.bottom + 4) + 'px';
  picker.style.left = rect.left + 'px';
  picker.style.right = 'auto';
  document.getElementById('kPickerContent').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:700">Responsável</div>
    <div onclick="setAssignee('');closeKPicker()" style="padding:7px 8px;cursor:pointer;border-radius:6px;font-size:13px;color:var(--muted)">— Remover</div>
    ${collabs.map(c => {
      const img = COLLAB_AVATARS[c.name];
      return `<div onclick="setAssignee('${esc(c.name)}');closeKPicker()" style="display:flex;align-items:center;gap:8px;padding:7px 8px;cursor:pointer;border-radius:6px;font-size:13px" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">
        ${img ? `<img src="${img}" style="width:22px;height:22px;border-radius:6px;object-fit:cover">` : `<div style="width:22px;height:22px;border-radius:6px;background:var(--accent);display:grid;place-items:center;font-size:10px;color:#fff;font-weight:800">${c.name[0]}</div>`}
        ${esc(c.name)}
      </div>`;
    }).join('')}`;
  setTimeout(() => document.addEventListener('click', closeKPicker, { once: true }), 0);
}

function setAssignee(name) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  t.assignee = name;
  setTarefasData(d);
  renderTmAssignee(t);
}

function openSectionPicker() {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const picker = document.getElementById('kPicker');
  const propRow = document.getElementById('tmSection').closest('.task-prop-row');
  const rect = propRow.getBoundingClientRect();
  picker.classList.remove('hidden');
  picker.style.top = (rect.bottom + 4) + 'px';
  picker.style.left = rect.left + 'px';
  document.getElementById('kPickerContent').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:700">Mover para</div>
    ${d.cols.map(c => `<div onclick="moveTaskToCol('${c.id}');closeKPicker()" style="padding:7px 8px;cursor:pointer;border-radius:6px;font-size:13px" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">${esc(c.name)}</div>`).join('')}`;
  setTimeout(() => document.addEventListener('click', closeKPicker, { once: true }), 0);
}

function moveTaskToCol(colId) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (t) {   t.colId = colId;   setTarefasData(d);   remapSaveTaskColumnToDb(t); }
  const col = d.cols.find(c => c.id === colId);
  document.getElementById('tmSection').textContent = col ? col.name : '—';
  document.getElementById('tmBreadSection').textContent = col ? col.name : '';
}

function openLabelPicker() {
  if (!currentTaskId) return;
  const presets = [
    { name:'Urgente', color:'#ef4444' }, { name:'Design', color:'#a855f7' },
    { name:'Social Media', color:'#4f8ef7' }, { name:'Vídeo', color:'#06b6d4' },
    { name:'Cliente', color:'#22c55e' }, { name:'Revisão', color:'#f59e0b' },
  ];
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  const picker = document.getElementById('kPicker');
  const propRow = document.getElementById('tmLabels').closest('.task-prop-row');
  const rect = propRow.getBoundingClientRect();
  picker.classList.remove('hidden');
  picker.style.top = (rect.bottom + 4) + 'px';
  picker.style.left = rect.left + 'px';
  document.getElementById('kPickerContent').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:700">Etiquetas</div>
    ${presets.map(p => {
      const active = (t.labels||[]).some(l => l.name === p.name);
      const bg = active ? 'background:var(--surface-3)' : '';
      return `<div onclick="toggleLabel('${p.name}','${p.color}')" style="display:flex;align-items:center;gap:8px;padding:7px 8px;cursor:pointer;border-radius:6px;font-size:13px;${bg}" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">
        <span style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0"></span>
        ${p.name}
        ${active ? '<span style="margin-left:auto;color:var(--green)">✓</span>' : ''}
      </div>`;
    }).join('')}
    <div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;display:flex;gap:6px;align-items:center">
      <input id="customLabelInput" placeholder="Nova etiqueta..." onclick="event.stopPropagation()" onkeydown="if(event.key==='Enter'){event.preventDefault();addCustomLabel()}" style="flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px 8px;color:var(--text);font-size:12px;outline:none" />
      <button type="button" onclick="addCustomLabel()" style="width:auto;padding:7px 9px;border-radius:8px;background:var(--accent);color:#fff;font-size:12px;font-weight:700">+</button>
    </div>`;
  setTimeout(() => document.addEventListener('click', closeKPicker, { once: true }), 0);
}

function addCustomLabel() {
  const input = document.getElementById('customLabelInput');
  const name = (input?.value || '').trim();
  if (!name || !currentTaskId) return;
  const colors = ['#4f8ef7', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  const color = colors[Math.abs(hash) % colors.length];
  toggleLabel(name, color);
  setTimeout(() => {
    const nextInput = document.getElementById('customLabelInput');
    if (nextInput) nextInput.value = '';
  }, 0);
}

function toggleLabel(name, color) {
  if (!currentTaskId) return;
  const d = getTarefasData();
  const t = d.tasks.find(x => x.id === currentTaskId);
  if (!t) return;
  if (!t.labels) t.labels = [];
  const idx = t.labels.findIndex(l => l.name === name);
  if (idx >= 0) t.labels.splice(idx, 1);
  else t.labels.push({ name, color });
  setTarefasData(d);
  renderTmLabels(t);
  openLabelPicker(); // re-render picker
}

function closeKPicker() {
  document.getElementById('kPicker').classList.add('hidden');
}

// Garante que todos os onclicks inline do modal encontrem as funções corretas.
Object.assign(window, {
  openTaskModal, closeTaskModal, closeTaskModalIfOutside, navTask, toggleTaskDoneModal,
  saveTaskFromModal, deleteCurrentTask, editTmDesc, finishEditTmDesc, renderTmDescPreview,
  addSubtask, toggleSubtask, updateSubtitle, deleteSubtask,
  handleAttachment, deleteAttachment, addComment,
  openAssigneePicker, setAssignee, openSectionPicker, moveTaskToCol,
  openLabelPicker, toggleLabel, addCustomLabel, closeKPicker,
  cyclePriority, cycleRecurrence
});
