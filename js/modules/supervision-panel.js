
let supervisaoCurrentMember = null;

function renderSupervisao() {
  // Sempre busca o estado atual do banco antes de montar a supervisão.
  // Assim colaboradores, metas, descontos e timers finalizados não ficam presos em cache/localStorage.
  if (!window.__supervisaoReloading && typeof window.__remoteStateReload === 'function') {
    window.__supervisaoReloading = true;
    try { window.__remoteStateReload(); } catch(e) { console.warn('[Supervisão] Falha ao recarregar dados remotos.', e); }
    setTimeout(() => { window.__supervisaoReloading = false; }, 400);
  }

  document.getElementById('supervisaoCards').style.display = 'grid';
  document.getElementById('supervisaoDetail').style.display = 'none';
  supervisaoCurrentMember = null;

  const group = getSupervisedGroup(currentUser.name);
  const collabs = getCollabs();
  const now = new Date();
  const yr = now.getFullYear(), mo = now.getMonth();
  const mk = monthKey(yr, mo);
  const colors = ['#4f8ef7','#22c55e','#f59e0b','#a855f7','#06b6d4','#ef4444'];

  const container = document.getElementById('supervisaoCards');
  container.style.gridTemplateColumns = 'repeat(auto-fill,minmax(320px,1fr))';
  container.innerHTML = group.map((name, i) => {
    const col = collabs.find(c => c.name === name);
    const role = col ? col.role : '';
    const color = colors[i % colors.length];
    const monthEntries = getEntries().filter(e => samePersonName(e.user, name) && isSameMonth(entryDate(e), now));
    const pts = monthEntries.reduce((s,e) => s + getEntryPoints(e, role), 0);
    const desc = getCollabDescontos(name, yr, mo);
    const net = Math.max(0, pts - desc);
    const metaObj = getMetaForMonth(name, mk);
    const nv = nivelMeta(net, metaObj);
    const totalH = sum(monthEntries) / 3600;

    // Mini progress bars
    const goals = metaObj ? [
      { label:'7%', target:metaObj.m1||0, color:'#22c55e' },
      { label:'14%', target:metaObj.m2||0, color:'#4f8ef7' },
      { label:'21%', target:metaObj.m3||0, color:'#a855f7' },
    ] : [];

    const barsHTML = goals.filter(g=>g.target>0).map(g => {
      const pct = Math.min((net/g.target)*100, 100).toFixed(0);
      const achieved = net >= g.target;
      const gap = Math.max(0, g.target - net);
      return `<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
          <span style="color:${g.color};font-weight:700">${g.label}</span>
          <span style="color:var(--muted)">${achieved ? '✓ Atingida!' : `Faltam ${gap} pts`}</span>
        </div>
        <div style="height:5px;background:var(--surface-3);border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${achieved?g.color:g.color+'88'};border-radius:99px"></div>
        </div>
      </div>`;
    }).join('') || `<p style="font-size:12px;color:var(--muted)">Sem meta definida.</p>`;

    return `
      <div onclick="openSupervisaoDetail('${name}')" style="background:var(--surface);border:1px solid var(--border);border-left:3px solid ${color};border-radius:18px;padding:20px;cursor:pointer;transition:.15s" onmouseover="this.style.borderColor='${color}'" onmouseout="this.style.borderColor='var(--border)';this.style.borderLeftColor='${color}'">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          ${getAvatar(name, 40, 12, 15)}
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:800">${esc(name)}</div>
            <div style="font-size:12px;color:var(--muted)">${esc(role)}</div>
          </div>
          <span class="nivel-badge ${nv.cls}" style="flex-shrink:0">${nv.label}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="background:rgba(168,85,247,.08);border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:900;color:#a855f7">${net}</div>
            <div style="font-size:10px;color:var(--muted)">pts líquidos</div>
          </div>
          <div style="background:var(--surface-2);border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:900">${monthEntries.length}</div>
            <div style="font-size:10px;color:var(--muted)">tarefas</div>
          </div>
          <div style="background:var(--surface-2);border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:900;color:var(--accent)">${totalH.toFixed(1)}h</div>
            <div style="font-size:10px;color:var(--muted)">horas</div>
          </div>
        </div>
        ${barsHTML}
        <div style="font-size:11px;color:var(--accent);text-align:right;margin-top:8px">Clique para detalhes →</div>
      </div>`;
  }).join('');
}

function openSupervisaoDetail(name) {
  supervisaoCurrentMember = name;
  document.getElementById('supervisaoCards').style.display = 'none';
  document.getElementById('supervisaoDetail').style.display = '';

  const collabs = getCollabs();
  const col = collabs.find(c => c.name === name);
  document.getElementById('supervisaoDetailName').textContent = name;
  document.getElementById('supervisaoDetailRole').textContent = col ? col.role : '';

  renderSupervisaoMemberStats();
  renderSupervisaoMemberEntries();
}

function closeSupervisaoDetail() {
  supervisaoCurrentMember = null;
  document.getElementById('supervisaoCards').style.display = 'grid';
  document.getElementById('supervisaoDetail').style.display = 'none';
  renderSupervisao();
}

function renderSupervisaoMemberStats() {
  const name = supervisaoCurrentMember;
  const collabs = getCollabs();
  const col = collabs.find(c => c.name === name);
  const role = col ? col.role : '';
  const now = new Date();
  const yr = now.getFullYear(), mo = now.getMonth();
  const mk = monthKey(yr, mo);

  const monthEntries = getEntries().filter(e => samePersonName(e.user, name) && isSameMonth(entryDate(e), now));
  const pts = monthEntries.reduce((s,e) => s+getEntryPoints(e,role),0);
  const desc = getCollabDescontos(name, yr, mo);
  const net = Math.max(0, pts - desc);
  const totalH = sum(monthEntries) / 3600;
  const metaObj = getMetaForMonth(name, mk);
  const nv = nivelMeta(net, metaObj);

  document.getElementById('supervisaoMemberStats').innerHTML = `
    <div class="stat accent"><div class="label">Horas este mês</div><div class="value">${totalH.toFixed(1)}h</div></div>
    <div class="stat"><div class="label">Tarefas</div><div class="value">${monthEntries.length}</div></div>
    <div class="stat" style="border-color:rgba(168,85,247,.3)"><div class="label">Pontos líquidos</div><div class="value" style="color:#a855f7">${net}</div></div>
    <div class="stat ${nv.nivel>0?'yellow':''}"><div class="label">Nível</div><div class="value" style="font-size:15px">${nv.label}</div></div>
  `;

  // Meta progress
  const metaBox = document.getElementById('supervisaoMetaProgress');
  if (!metaObj) {
    metaBox.innerHTML = `<p style="color:var(--muted);font-size:13px">Sem meta definida.</p>`;
  } else {
    const goals = [
      { label:'7%',  target:metaObj.m1||0, color:'#22c55e', medal:'🥉' },
      { label:'14%', target:metaObj.m2||0, color:'#4f8ef7', medal:'🥈' },
      { label:'21%', target:metaObj.m3||0, color:'#a855f7', medal:'🥇' },
    ];
    metaBox.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">` +
      goals.map(g => {
        if (!g.target) return `<div style="background:var(--surface-3);border-radius:12px;padding:14px;text-align:center;opacity:.4"><div>${g.medal}</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Não definida</div></div>`;
        const achieved = net >= g.target;
        const gap = Math.max(0, g.target - net);
        const pct = Math.min((net/g.target)*100,100).toFixed(0);
        return `<div style="background:rgba(0,0,0,.2);border:1px solid ${achieved?g.color:'transparent'};border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:22px">${g.medal}</div>
          <div style="font-size:11px;font-weight:700;color:${g.color};margin:4px 0">META ${g.label}</div>
          <div style="font-size:18px;font-weight:900;color:${achieved?g.color:'var(--text)'}">${g.target.toLocaleString('pt-BR')}</div>
          <div style="height:4px;background:var(--surface-3);border-radius:99px;overflow:hidden;margin:8px 0">
            <div style="height:100%;width:${pct}%;background:${achieved?g.color:g.color+'88'};border-radius:99px"></div>
          </div>
          ${achieved ? `<div style="font-size:11px;color:${g.color};font-weight:700">✓ Atingida!</div>` : `<div style="font-size:11px;color:var(--muted)">Faltam <strong style="color:${g.color}">${gap}</strong> pts</div>`}
        </div>`;
      }).join('') + `</div>`;
  }
}

function renderSupervisaoMemberEntries() {
  const name = supervisaoCurrentMember;
  if (!name) return;
  const collabs = getCollabs();
  const col = collabs.find(c => c.name === name);
  const role = col ? col.role : '';
  const period = document.getElementById('supervisaoMemberPeriod').value;
  const now = new Date();
  let entries = getEntries().filter(e => samePersonName(e.user, name));
  if (period === 'month') entries = entries.filter(e => isSameMonth(entryDate(e), now));

  const tbody = document.getElementById('supervisaoMemberTable');
  if (!entries.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><div class="ei"><i class="bi bi-clipboard-minus"></i></div>Nenhuma tarefa registrada.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = entries.map(e => {
    const pts = getEntryPoints(e, role);
    return `<tr id="srow-${e.id}">
      <td>${esc(e.date)}</td>
      <td><strong>${esc(e.client)}</strong></td>
      <td>${esc(e.task)}${e.taskDesc?`<div style="font-size:11px;color:var(--muted)">${esc(e.taskDesc)}</div>`:''}</td>
      <td><span class="badge badge-blue">${esc(e.category)}</span></td>
      <td>${formatDuration(e.durationSeconds)}</td>
      <td><span class="pts-badge blue" id="spts-${e.id}">${formatPointsValue(pts)} pts</span></td>
      <td>
        <button class="btn-dark btn-sm" onclick="openEditEntryModal('${e.id}','${esc(e.task)}',${Number(pts)||0},'${esc(e.taskDesc||'')}')" style="font-size:11px;padding:5px 10px"><i class="bi bi-pen" style="color:#eeeeee;"></i> Editar</button>
      </td>
    </tr>`;
  }).join('');
}

// ── Supervisão lancamento modal ──
function openSupervisaoLancamento() {
  document.getElementById('supervisaoLancamentoModal').classList.remove('hidden');
  document.getElementById('supervisaoLancamentoFor').textContent = `Para: ${supervisaoCurrentMember}`;
  document.getElementById('slDate').value = new Date().toISOString().slice(0,10);
  // Populate client list
  const saved = getClients().map(c=>c.name);
  const dl = document.getElementById('slClientList');
  dl.innerHTML = saved.map(c=>`<option value="${esc(c)}"></option>`).join('');
  // Set category based on member's role
  const collabs = getCollabs();
  const col = collabs.find(c=>c.name===supervisaoCurrentMember);
  const roleMap = {'Designer':'Design','Social Media':'Social Media','Editor de Vídeo':'Edição de Vídeo','Filmmaker':'Filmmaker','Gestor de Tráfego':'Tráfego Pago'};
  if (col && roleMap[col.role]) {
    document.getElementById('slCategory').value = roleMap[col.role];
  }
  updateSLTaskDropdown();
}
function closeSupervisaoLancamento() { document.getElementById('supervisaoLancamentoModal').classList.add('hidden'); }

function updateSLTaskDropdown() {
  const cat = document.getElementById('slCategory').value;
  const collabs = getCollabs();
  const col = collabs.find(c=>c.name===supervisaoCurrentMember);
  const role = col ? col.role : '';
  _populateTaskSelect(document.getElementById('slTask'), cat, role);
  updateSLPointsPreview();
}

function updateSLPointsPreview() {
  const sel = document.getElementById('slTask');
  const qty = parseInt(document.getElementById('slQty').value)||1;
  const preview = document.getElementById('slPointsPreview');
  if (!sel.value) { preview.style.display='none'; return; }
  const tp = getTaskPoints().find(p=>p.id===sel.value);
  if (tp) { preview.textContent=`⭐ ${tp.points * qty} pontos`; preview.style.display=''; }
}

async function saveSupervisaoLancamento() {
  const client = document.getElementById('slClient').value.trim();
  const taskSelVal = document.getElementById('slTask').value;
  const dateVal = document.getElementById('slDate').value;
  const startT = document.getElementById('slStart').value;
  const endT = document.getElementById('slEnd').value;
  if (!client) return alert('Informe o cliente.');
  if (!taskSelVal) return alert('Selecione a tarefa.');
  if (!dateVal||!startT||!endT) return alert('Preencha data e horários.');

  const tp = getTaskPoints().find(p=>String(p.id)===String(taskSelVal));
  const qty = parseInt(document.getElementById('slQty').value, 10)||1;
  const startDate = new Date(`${dateVal}T${startT}:00`);
  const endDate = new Date(`${dateVal}T${endT}:00`);
  const durationSeconds = Math.round((endDate-startDate)/1000);
  if (durationSeconds <= 0) return alert('Horário de fim deve ser após o início.');

  const collabs = getCollabs();
  const col = collabs.find(c=>c.name===supervisaoCurrentMember);

  const entry = {
    id: 'sup_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
    client,
    task: tp ? tp.name : '',
    taskDesc: document.getElementById('slDesc').value.trim(),
    taskPoints: tp ? Number(tp.points || 0) * qty : 0,
    taskLines: tp ? [{ id: tp.id, name: tp.name, points: Number(tp.points || 0), qty }] : [],
    category: document.getElementById('slCategory').value,
    user: supervisaoCurrentMember,
    role: col ? col.role : '',
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    date: startDate.toLocaleDateString('pt-BR'),
    durationSeconds,
    launchedBy: currentUser.name,
    source: 'supervisao'
  };

  const btn = document.querySelector('#supervisaoLancamentoModal .btn-primary');
  const oldText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  try {
    const dbSave = await remapSaveTimerToDb(entry, null);

    if (!dbSave || !dbSave.success) {
      console.error('[Supervisão] Não salvou lançamento no banco.', dbSave);
      alert('Não foi possível salvar no banco. Veja o console.');
      return;
    }

    entry.dbId = dbSave.id || null;

    const entries = getEntries();
    if (!entries.some(e => String(e.id) === String(entry.id))) {
      entries.unshift(entry);
      set('entries', entries);
    }

    if (typeof window.__remoteStateReload === 'function') {
      try { window.__remoteStateReload(); } catch(e) {}
    }

    closeSupervisaoLancamento();
    renderSupervisaoMemberStats();
    renderSupervisaoMemberEntries();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = oldText || 'Salvar'; }
  }
}

// ── Supervisão desconto modal ──
function openSupervisaoDesconto() {
  document.getElementById('supervisaoDescontoModal').classList.remove('hidden');
  document.getElementById('supervisaoDescontoFor').textContent = `Para: ${supervisaoCurrentMember}`;
  document.getElementById('sdMotivo').value = '';
  document.getElementById('sdPontos').value = '';
}
function closeSupervisaoDesconto() { document.getElementById('supervisaoDescontoModal').classList.add('hidden'); }
function saveSupervisaoDesconto() {
  const motivo = document.getElementById('sdMotivo').value.trim();
  const points = parseInt(document.getElementById('sdPontos').value);
  if (!motivo) return alert('Informe o motivo.');
  if (!points||points<=0) return alert('Informe a quantidade de pontos.');
  const desc = getDescontos();
  desc.push({ id:'desc_'+Date.now(), collab:supervisaoCurrentMember, motivo, points, date:new Date().toISOString(), appliedBy:currentUser.name });
  setDescontos(desc);
  closeSupervisaoDesconto();
  renderSupervisaoMemberStats();
}

// ── Edit entry modal (supervisor) ──
function openEditEntryModal(id, task, pts, desc) {
  document.getElementById('editEntryModal').classList.remove('hidden');
  document.getElementById('editEntryId').value = id;
  document.getElementById('editEntryTask').value = task;
  document.getElementById('editEntryPoints').value = pts;
  document.getElementById('editEntryDesc').value = desc;
}
function closeEditEntryModal() { document.getElementById('editEntryModal').classList.add('hidden'); }
function saveEditEntry() {
  const id = document.getElementById('editEntryId').value;
  const task = document.getElementById('editEntryTask').value.trim();
  const pts = parseInt(document.getElementById('editEntryPoints').value);
  const desc = document.getElementById('editEntryDesc').value.trim();
  if (!task) return alert('Informe o nome da tarefa.');
  if (isNaN(pts)||pts<0) return alert('Pontos inválidos.');
  const entries = getEntries();
  const idx = entries.findIndex(e=>e.id===id);
  if (idx===-1) return;
  entries[idx].task = task;
  entries[idx].taskPoints = pts;
  entries[idx].taskDesc = desc;
  set('entries', entries);
  closeEditEntryModal();
  renderSupervisaoMemberStats();
  renderSupervisaoMemberEntries();
}

// ════════════════════════════════════════
// PAINEL PESSOAL
// ════════════════════════════════════════

function getPainelData(key) {
  return tryLS(() => JSON.parse(localStorage.getItem(`tt_painel_${currentUser?.name||'user'}_${key}`) || 'null')) || (_store[`painel_${key}`] || null);
}
function setPainelData(key, val) {
  _store[`painel_${key}`] = val;
  tryLS(() => localStorage.setItem(`tt_painel_${currentUser?.name||'user'}_${key}`, JSON.stringify(val)));
}

function renderPainel() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = (currentUser?.name||'').split(' ')[0];
  const grEl = document.getElementById('painelGreeting');
  const dtEl = document.getElementById('painelDate');
  if (grEl) grEl.textContent = `${greet}, ${firstName}! 👋`;
  if (dtEl) dtEl.textContent = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  syncPainelNotesFields(getPainelData('notes') || '', true);
  renderShortcuts();
  renderPersonalTasks();
  renderCalendar();
  renderPainelLayout();
}

function syncPainelNotesFields(value, onlyFirstLoad=false) {
  ['painelNotes','painelNotesInline'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (onlyFirstLoad && el.dataset.loaded) return;
    el.value = value || '';
    el.dataset.loaded = '1';
  });
}

function saveNotes(sourceEl) {
  const value = sourceEl ? sourceEl.value : (document.getElementById('painelNotes')?.value || document.getElementById('painelNotesInline')?.value || '');
  setPainelData('notes', value);
  ['painelNotes','painelNotesInline'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el !== sourceEl) el.value = value;
  });
}
function clearNotes() {
  if (!confirm('Limpar as notas?')) return;
  setPainelData('notes', '');
  syncPainelNotesFields('', false);
}

function getPainelViewMode() {
  const saved = getPainelData('viewMode');
  return saved === 'clickup' ? 'clickup' : 'calendar_clickup';
}
function setPainelViewMode(mode) {
  setPainelData('viewMode', mode === 'clickup' ? 'clickup' : 'calendar_clickup');
  renderPainelLayout();
}

function normalizeRoleName(role) {
  return String(role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}
function getDefaultClickupViewByRole() {
  const role = normalizeRoleName(currentUser?.role || '');
  if (role.includes('social')) return 'linhaEditorial';
  if (role.includes('designer')) return 'criacaoArtes';
  if (role.includes('editor de video') || role.includes('editor')) return 'criacaoVideos';
  if (role.includes('gestor') || role.includes('trafego')) return 'otimizacao';
  if (role.includes('filmmaker') || role.includes('diretor')) return 'newAgenda';
  return 'linhaEditorial';
}
function getActiveClickupViewId() {
  const saved = getPainelData('clickupView');
  return CLICKUP_PUBLIC_VIEWS.some(v => v.id === saved) ? saved : getDefaultClickupViewByRole();
}
function setClickupView(id) {
  if (!CLICKUP_PUBLIC_VIEWS.some(v => v.id === id)) return;
  setPainelData('clickupView', id);
  renderClickupViews();
}
function isClickupSidebarCollapsed() {
  return getPainelData('clickupSidebarCollapsed') === true;
}
function toggleClickupSidebar() {
  setPainelData('clickupSidebarCollapsed', !isClickupSidebarCollapsed());
  renderClickupViews();
}
function getClickupViewDef(id) {
  return CLICKUP_PUBLIC_VIEWS.find(v => v.id === id) || CLICKUP_PUBLIC_VIEWS[0];
}

function renderPainelLayout() {
  const mode = getPainelViewMode();
  const isClickupOnly = mode === 'clickup';
  const grid = document.getElementById('painelGrid');
  if (grid) {
    grid.classList.toggle('mode-clickup-only', isClickupOnly);
    grid.classList.toggle('mode-calendar-clickup', !isClickupOnly);
  }
  document.getElementById('viewModeCalendarClickup')?.classList.toggle('active', !isClickupOnly);
  document.getElementById('viewModeClickup')?.classList.toggle('active', isClickupOnly);

  const delegatedPanel = document.getElementById('delegatedTasksPanel');
  const clickupTasksPanel = document.getElementById('clickupTasksPanel');
  const notesTasksPanel = document.getElementById('notesTasksPanel');
  if (delegatedPanel) delegatedPanel.style.display = 'none';
  if (clickupTasksPanel) clickupTasksPanel.style.display = isClickupOnly ? 'none' : 'flex';
  if (notesTasksPanel) notesTasksPanel.style.display = isClickupOnly ? 'flex' : 'none';

  const title = document.getElementById('painelTasksTitle');
  if (title) title.textContent = isClickupOnly ? '📌 Tarefas pessoais e notas' : '📌 Tarefas pessoais e ClickUp';

  renderClickupViews();
}

function renderClickupViews() {
  const activeId = getActiveClickupViewId();
  const active = getClickupViewDef(activeId);
  renderClickupViewer('clickupTaskViewer', activeId);
  renderClickupViewer('clickupTopViewer', activeId);
  renderClickupViewer('timerClickupViewer', activeId);
  const topLabel = document.getElementById('clickupTopActiveLabel');
  const taskLabel = document.getElementById('clickupTaskActiveLabel');
  const timerLabel = document.getElementById('timerClickupActiveLabel');
  if (topLabel) topLabel.textContent = active?.label || '';
  if (taskLabel) taskLabel.textContent = active?.label || '';
  if (timerLabel) timerLabel.textContent = active?.label || '';
}

function renderClickupViewer(containerId, activeId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const active = getClickupViewDef(activeId);
  const sidebarCollapsed = isClickupSidebarCollapsed();
  const sidebarToggleLabel = sidebarCollapsed ? '☰ Menu' : '⟨ Recolher';
  const groups = CLICKUP_PUBLIC_VIEWS.reduce((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});
  const nav = Object.entries(groups).map(([group, items]) => `
    <div class="clickup-group">
      <div class="clickup-group-head ${CLICKUP_GROUP_HEAD_CLASSES[group] || ''}"><span>${CLICKUP_GROUP_ICONS[group] || '📁'} ${esc(group)}</span><span>•••</span></div>
      ${items.map(item => `
        <div class="clickup-option ${item.id === activeId ? 'active' : ''}" onclick="setClickupView('${item.id}')">
          <span class="clickup-option-left">
            <span class="clickup-option-icon">${esc(item.icon || '›')}</span>
            <span class="clickup-option-label">${esc(item.label)}</span>
          </span>
        </div>`).join('')}
    </div>`).join('');

  const safeUrl = (active?.url || CLICKUP_DEFAULT_PUBLIC_URL || '').trim();
  const frame = safeUrl ? `
    <div class="clickup-view-toolbar">
      <div class="clickup-view-toolbar-left">
        <button type="button" class="clickup-sidebar-toggle" onclick="toggleClickupSidebar()" title="Recolher ou abrir menu do ClickUp">${sidebarToggleLabel}</button>
        <div class="clickup-view-title">${esc(active.label)}</div>
      </div>
      <a class="clickup-open-link" href="${esc(safeUrl)}" target="_blank" rel="noopener">Abrir fora ↗</a>
    </div>
    <iframe class="clickup-view-frame ${CLICKUP_FORCE_DARK_IFRAME ? 'force-dark' : ''}" src="${esc(safeUrl)}" loading="lazy" allowfullscreen></iframe>` : `
    <div class="clickup-empty">
      <div>
        <div style="font-size:30px;margin-bottom:8px">🗂️</div>
        <strong>${esc(active?.label || 'ClickUp')}</strong><br>
        Cole o link público dessa visualização no objeto <strong>CLICKUP_PUBLIC_VIEWS</strong> dentro do index.html.
      </div>
    </div>`;

  el.innerHTML = `
    <div class="clickup-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}">
      <div class="clickup-mini-sidebar">${nav}</div>
      <div class="clickup-view-area">${frame}</div>
    </div>`;
}

function getTimerSideViewMode() {
  const saved = getPainelData('timerSideViewMode');
  return ['calendar_clickup', 'clickup', 'none'].includes(saved) ? saved : 'calendar_clickup';
}
function setTimerSideViewMode(mode) {
  const normalized = ['calendar_clickup', 'clickup', 'none'].includes(mode) ? mode : 'calendar_clickup';
  setPainelData('timerSideViewMode', normalized);
  renderTimerSidePanel();
}
function renderTimerSidePanel() {
  const mode = getTimerSideViewMode();
  const isClickupOnly = mode === 'clickup';
  const isNone = mode === 'none';
  const grid = document.getElementById('timerSideGrid');
  if (grid) {
    grid.classList.toggle('mode-clickup', isClickupOnly);
    grid.classList.toggle('mode-calendar-clickup', mode === 'calendar_clickup');
    grid.classList.toggle('mode-none', isNone);
  }
  document.getElementById('timerViewModeCalendarClickup')?.classList.toggle('active', mode === 'calendar_clickup');
  document.getElementById('timerViewModeClickup')?.classList.toggle('active', isClickupOnly);
  document.getElementById('timerViewModeNone')?.classList.toggle('active', isNone);
  if (!isNone) {
    renderClickupViews();
    renderTimerCalendar();
  }
}

function renderTimerCalendar() {
  const area = document.getElementById('timerCalendarArea');
  if (!area) return;
  const url = getCalendarUrl();
  if (!url) {
    area.innerHTML = `
      <div style="text-align:center;padding:28px;color:var(--muted)">
        <div style="font-size:34px;margin-bottom:10px">📅</div>
        <p style="font-size:13px;margin-bottom:12px">Conecte seu Google Agenda para visualizá-lo aqui.</p>
        <button class="btn-primary btn-sm" onclick="openCalendarConfig()">Conectar agora</button>
      </div>`;
    return;
  }
  area.innerHTML = `<iframe src="${esc(url)}" class="timer-calendar-frame" frameborder="0" scrolling="no"></iframe>`;
}

// ── SHORTCUTS (favicon auto, direct click) ──
function getShortcuts() { return getPainelData('shortcuts') || []; }
function setShortcuts(v) { setPainelData('shortcuts', v); }

function renderShortcuts() {
  const query = (document.getElementById('shortcutSearch')?.value||'').toLowerCase();
  let list = getShortcuts();
  if (query) list = list.filter(s => s.name.toLowerCase().includes(query)||(s.desc||'').toLowerCase().includes(query));
  const el = document.getElementById('shortcutList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:8px">${query?'Nenhum resultado.':'Clique em + Adicionar para criar atalhos.'}</div>`;
    return;
  }
  el.innerHTML = list.map(s => {
    // Auto favicon via Google S2
    let faviconSrc = '';
    try { faviconSrc = `https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=64`; } catch(e){}
    const iconHtml = faviconSrc
      ? `<img src="${faviconSrc}" style="width:28px;height:28px;border-radius:6px" onerror="this.outerHTML='<span style=\\'font-size:20px\\'>🔗</span>'" />`
      : `<span style="font-size:20px">🔗</span>`;
    return `
      <div class="shortcut-item" onclick="window.open('${esc(s.url)}','_blank')" title="${esc(s.url)}">
        <div class="shortcut-icon">${iconHtml}</div>
        <div class="shortcut-info">
          <div class="shortcut-name">${esc(s.name)}</div>
          ${s.desc?`<div class="shortcut-desc">${esc(s.desc)}</div>`:''}
        </div>
        <div class="shortcut-actions" onclick="event.stopPropagation()">
          <button onclick="openShortcutModal('${s.id}')">Editar</button>
          <button onclick="deleteShortcut('${s.id}')" style="color:var(--red)">✕</button>
        </div>
      </div>`;
  }).join('');
}

function openShortcutModal(id) {
  document.getElementById('shortcutModal').classList.remove('hidden');
  if (id) {
    const s = getShortcuts().find(x=>x.id===id); if (!s) return;
    document.getElementById('shortcutModalTitle').textContent = 'Editar atalho';
    document.getElementById('scId').value=id;
    document.getElementById('scName').value=s.name;
    document.getElementById('scDesc').value=s.desc||'';
    document.getElementById('scUrl').value=s.url;
  } else {
    document.getElementById('shortcutModalTitle').textContent = 'Novo atalho';
    ['scId','scName','scDesc','scUrl'].forEach(i=>document.getElementById(i).value='');
    setTimeout(()=>document.getElementById('scName').focus(),50);
  }
}
function closeShortcutModal() { document.getElementById('shortcutModal').classList.add('hidden'); }
function saveShortcut() {
  const name=document.getElementById('scName').value.trim();
  const url=document.getElementById('scUrl').value.trim();
  if (!name) return alert('Informe o nome.');
  if (!url) return alert('Informe a URL.');
  const fullUrl = url.startsWith('http')?url:'https://'+url;
  const id = document.getElementById('scId').value||'sc_'+Date.now();
  const s = { id, name, desc:document.getElementById('scDesc').value.trim(), url:fullUrl };
  const list = getShortcuts().filter(x=>x.id!==id);
  list.push(s);
  setShortcuts(list); closeShortcutModal(); renderShortcuts();
}
function deleteShortcut(id) {
  if (!confirm('Remover?')) return;
  setShortcuts(getShortcuts().filter(s=>s.id!==id)); renderShortcuts();
}

// Open date picker reliably when clicking anywhere on the date button/row
function openNativeDatePicker(inputId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const input = document.getElementById(inputId);
  if (!input) return;

  input.focus({ preventScroll: true });

  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker();
      return;
    } catch (e) {}
  }

  input.click();
}

// ── PERSONAL TASKS (priority + date + disappear on done) ──
function editPersonalTask(taskId) {
  const tasks = getPersonalTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const el = document.getElementById(`pt-title-${taskId}`);
  if (!el) return;

  el.innerHTML = `
    <input 
      id="pt-input-${taskId}"
      value="${esc(task.title || '')}"
      style="width:100%;background:var(--surface-2);border:1px solid var(--accent);border-radius:8px;color:var(--text);font-size:12px;font-weight:700;padding:6px 8px;outline:none"
      onkeydown="if(event.key==='Enter') savePersonalTaskEdit('${taskId}'); if(event.key==='Escape') renderPersonalTasks();"
      onblur="savePersonalTaskEdit('${taskId}')"
    />
  `;

  const input = document.getElementById(`pt-input-${taskId}`);
  input.focus();
  input.select();
}

function savePersonalTaskEdit(taskId) {
  const input = document.getElementById(`pt-input-${taskId}`);
  if (!input) return;

  const tasks = getPersonalTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.title = input.value.trim();

  setPersonalTasks(tasks);
  renderPersonalTasks();
}
function getPersonalTasks() { return getPainelData('ptasks') || []; }
function setPersonalTasks(v) { setPainelData('ptasks', v); }

const PT_PRIORITY = {
  alta:  { label:'Alta',  color:'#ef4444', bg:'rgba(239,68,68,.12)',   dot:'🔴' },
  media: { label:'Média', color:'#f59e0b', bg:'rgba(245,158,11,.12)',  dot:'🟡' },
  baixa: { label:'Baixa', color:'#4f8ef7', bg:'rgba(79,142,247,.12)', dot:'🔵' },
};

function renderPersonalTasks() {
  const myTasks = getPersonalTasks().filter(t => !t.done);
  const personalEl = document.getElementById('personalTaskList');
  const delegatedEl = document.getElementById('delegatedTaskList');
  const cntEl = document.getElementById('personalTaskCount');
  const personalCntEl = document.getElementById('personalOnlyTaskCount');
  const delegatedCntEl = document.getElementById('delegatedTaskCount');

  // Delegadas = tarefas do kanban atribuídas ao usuário logado, ainda não finalizadas
  const delegated = getTarefasData().tasks.filter(t =>
    t.assignee === currentUser.name && !isTaskConcluida(t)
  );

  const total = myTasks.length + delegated.length;
  if (cntEl) cntEl.textContent = `${total} pendente${total!==1?'s':''}`;
  if (personalCntEl) personalCntEl.textContent = `${myTasks.length} pendente${myTasks.length!==1?'s':''}`;
  if (delegatedCntEl) delegatedCntEl.textContent = `${delegated.length} pendente${delegated.length!==1?'s':''}`;

  const today = new Date().toISOString().slice(0,10);

  // Ordena tarefas pessoais por prioridade e data
  const priorityOrder = { alta:0, media:1, baixa:2, '':3 };
  const sorted = [...myTasks].sort((a,b) => {
    const po = (priorityOrder[a.priority||'']||3) - (priorityOrder[b.priority||'']||3);
    if (po !== 0) return po;
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  let personalHtml = '';
  if (sorted.length) {
    personalHtml = sorted.map(t => {
      const p = t.priority ? PT_PRIORITY[t.priority] : null;
      const isOverdue = t.date && t.date < today;
      const isToday = t.date && t.date === today;
      const dateLabel = !t.date ? '' : isToday ? 'Hoje' : isOverdue ? `Atrasado · ${formatTaskDate(t.date)}` : formatTaskDate(t.date);
      const dateColor = isOverdue ? 'var(--red)' : isToday ? 'var(--green)' : 'var(--muted)';
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:10px;margin-bottom:7px;background:${p?p.bg:'var(--surface)'};border:1px solid ${p?p.color+'33':'var(--border)'}">
          <button onclick="donePersonalTask('${t.id}')"
            style="width:22px;height:22px;border-radius:50%;border:2px solid ${p?p.color:'var(--border-strong)'};background:transparent;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:0"
            title="Concluir tarefa"></button>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"   id="pt-title-${t.id}"
  onclick="editPersonalTask('${t.id}')"">${linkifyText(t.title)}</div>
            ${(p || dateLabel) ? `<div style="display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap">
              ${p ? `<span style="font-size:10px;color:${p.color};font-weight:700">${p.dot} ${p.label}</span>` : ''}
              ${dateLabel ? `<span style="font-size:10px;color:${dateColor}">📅 ${dateLabel}</span>` : ''}
            </div>` : ''}
          </div>
          <button onclick="deletePersonalTaskById('${t.id}')" style="background:transparent;border:0;color:var(--muted);cursor:pointer;width:auto;padding:1px 5px;font-size:13px;flex-shrink:0;opacity:.6">✕</button>
        </div>`;
    }).join('');
  } else {
    personalHtml = `<div style="color:var(--muted);font-size:13px;padding:22px 0;text-align:center">✓ Nenhuma tarefa pessoal pendente.</div>`;
  }

  let delegatedHtml = '';
  if (delegated.length) {
    delegatedHtml = delegated.map(t => {
      const d = getTarefasData();
      const col = d.cols.find(c=>c.id===t.colId);
      const isOverdue = t.date && t.date < today;
      const isToday = t.date && t.date === today;
      const dateLabel = !t.date ? '' : isToday ? 'Hoje' : isOverdue ? `Atrasado · ${formatTaskDate(t.date)}` : formatTaskDate(t.date);
      const dateColor = isOverdue ? 'var(--red)' : isToday ? 'var(--green)' : 'var(--muted)';
      const pColors = {1:'#ef4444',2:'#f59e0b',3:'#4f8ef7'};
      const pLabels = {1:'Alta',2:'Média',3:'Baixa'};
      const pDots = {1:'🔴',2:'🟡',3:'🔵'};
      const p = t.priority && t.priority < 4;
      const isRunning = kanbanTimer && kanbanTimer.taskId === t.id;
      const timerLabel = isRunning
        ? `<span class="card-timer-display" id="ptimer-${t.id}">⏱ ${fmtKTimerDisplay()}</span>`
        : `<span style="font-size:12px;font-weight:700">▶ Timer</span>`;
      const pauseLabel = isRunning && kanbanTimer.pausedAt ? '▶ Retomar' : '⏸ Pausar';
      const pauseBtn = isRunning ? `<button class="card-timer-btn" id="ppausebtn-${t.id}" onclick="event.stopPropagation();pauseKanbanTimer('${t.id}')" title="Pausar ou retomar timer" style="padding:5px 10px;color:var(--yellow);border-color:var(--yellow)">${pauseLabel}</button>` : '';
      return `
        <div style="display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin-bottom:8px;background:rgba(79,142,247,.06);border:1px solid rgba(79,142,247,.2);cursor:pointer" onclick="openTaskModal('${t.id}')">
          <div class="task-check ${t.done?'checked':`p${t.priority||4}`}" style="width:20px;height:20px;margin-top:0" onclick="event.stopPropagation();toggleTaskDone('${t.id}')" title="Finalizar tarefa"></div>
          <div style="min-width:0">
            <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${linkifyText(t.title)}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap">
              ${t.client ? `<span style="font-size:11px;color:var(--muted-2)">🏢 ${esc(t.client)}</span>` : ''}
              ${col ? `<span style="font-size:11px;color:var(--muted)"># ${esc(col.name)}</span>` : ''}
              ${p ? `<span style="font-size:11px;color:${pColors[t.priority]};font-weight:700">${pDots[t.priority]} ${pLabels[t.priority]}</span>` : ''}
              ${dateLabel ? `<span style="font-size:11px;color:${dateColor}">📅 ${dateLabel}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end">
            ${pauseBtn}
            <button class="card-timer-btn ${isRunning && !kanbanTimer.pausedAt?'running':''}" id="ptimerbtn-${t.id}"
              onclick="event.stopPropagation();toggleKanbanTimer('${t.id}','${esc(t.title)}','${esc(t.colId)}')"
              title="${isRunning?'Finalizar e salvar timer':'Iniciar timer'}"
              style="${isRunning?'':'background:rgba(34,197,94,.1);color:var(--green);border-color:var(--green);padding:5px 12px;'}">
              ${timerLabel}
            </button>
          </div>
          <button class="btn-green btn-sm" style="white-space:nowrap;padding:6px 10px" onclick="event.stopPropagation();toggleTaskDone('${t.id}')">✓ Finalizar</button>
        </div>`;
    }).join('');
  } else {
    delegatedHtml = `<div style="color:var(--muted);font-size:13px;padding:22px 0;text-align:center">✓ Nenhuma tarefa delegada pendente.</div>`;
  }

  if (personalEl) personalEl.innerHTML = personalHtml;
  if (delegatedEl) delegatedEl.innerHTML = delegatedHtml;
}
function addPersonalTask() {
  const inp  = document.getElementById('personalTaskInput');
  const pri  = document.getElementById('ptPriority');
  const dateEl = document.getElementById('ptDate');
  let title = inp.value.trim();
  if (!title) { inp.focus(); return; }

  // Smart date: use parsed date if manual not set
  const smartResult = parseNaturalDate(title);
  let date = dateEl?.value || '';
  if (!date && smartResult) date = smartResult.date;

  const tasks = getPersonalTasks();
  tasks.push({ id:'pt_'+Date.now(), title, done:false, priority: pri?.value||'', date });
  setPersonalTasks(tasks);
  inp.value = '';
  if (pri) pri.value = '';
  if (dateEl) dateEl.value = '';
  const preview = document.getElementById('ptDatePreview');
  if (preview) preview.textContent = '';
  renderPersonalTasks();
}

function donePersonalTask(id) {
  const tasks = getPersonalTasks();
  const t = tasks.find(x=>x.id===id);
  if (!t) return;
  t.done = true;
  setPersonalTasks(tasks);
  // Animate out then re-render
  renderPersonalTasks();
}

function deletePersonalTaskById(id) {
  setPersonalTasks(getPersonalTasks().filter(t=>t.id!==id));
  renderPersonalTasks();
}

// Legacy wrappers
function togglePersonalTask(idx) {
  const t=getPersonalTasks(); if (t[idx]) { t[idx].done=!t[idx].done; setPersonalTasks(t); renderPersonalTasks(); }
}
function deletePersonalTask(idx) {
  const t=getPersonalTasks(); t.splice(idx,1); setPersonalTasks(t); renderPersonalTasks();
}

// ── NATURAL DATE PARSER ──
function parseNaturalDate(text) {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const offset = d => {
    const r = new Date(today);
    r.setDate(r.getDate() + d);
    return r.toISOString().slice(0,10);
  };
  const weekdayMap = { 'segunda':1,'terca':2,'quarta':3,'quinta':4,'sexta':5,'sabado':6,'domingo':0,
    'segunda-feira':1,'terca-feira':2,'quarta-feira':3,'quinta-feira':4,'sexta-feira':5 };

  // hoje / hoje à noite / hoje de manhã
  if (/\bhoje\b/.test(t)) return { date: offset(0), label: 'Hoje' };
  // amanhã
  if (/\bamanh[aã]\b/.test(t)) return { date: offset(1), label: 'Amanhã' };
  // depois de amanhã
  if (/depois de amanh[aã]/.test(t)) return { date: offset(2), label: 'Depois de amanhã' };
  // essa semana / esta semana
  if (/essa semana|esta semana/.test(t)) return { date: offset(0), label: 'Esta semana' };
  // semana que vem / próxima semana
  if (/semana (que vem|proxima|que vem)/.test(t)) return { date: offset(7), label: 'Semana que vem' };
  // próximo [dia da semana]
  for (const [name, wd] of Object.entries(weekdayMap)) {
    if (t.includes(name)) {
      const cur = today.getDay();
      let diff = wd - cur;
      if (diff <= 0) diff += 7;
      return { date: offset(diff), label: `${name.charAt(0).toUpperCase()+name.slice(1)}` };
    }
  }
  // em X dias
  const diasMatch = t.match(/em (\d+) dia/);
  if (diasMatch) return { date: offset(parseInt(diasMatch[1])), label: `Em ${diasMatch[1]} dias` };
  // daqui X dias
  const daquiMatch = t.match(/daqui (\d+) dia/);
  if (daquiMatch) return { date: offset(parseInt(daquiMatch[1])), label: `Em ${daquiMatch[1]} dias` };
  // DD/MM
  const dmMatch = t.match(/(\d{1,2})\/(\d{1,2})/);
  if (dmMatch) {
    const d = parseInt(dmMatch[1]), m = parseInt(dmMatch[2])-1;
    const yr = now.getMonth() > m ? now.getFullYear()+1 : now.getFullYear();
    const dt = new Date(yr, m, d);
    return { date: dt.toISOString().slice(0,10), label: `${d}/${m+1}` };
  }
  return null;
}

function ptSmartParse() {
  const val = document.getElementById('personalTaskInput')?.value || '';
  const result = parseNaturalDate(val);
  const preview = document.getElementById('ptDatePreview');
  const dateEl  = document.getElementById('ptDate');
  if (result) {
    if (preview) preview.textContent = `📅 ${result.label} detectado`;
    if (dateEl && !dateEl.value) dateEl.value = result.date;
  } else {
    if (preview) preview.textContent = '';
    // don't clear manual date
  }
}

function smartParseInlineTask(colId) {
  const val = document.getElementById(`itf-title-${colId}`)?.value || '';
  const result = parseNaturalDate(val);
  if (result && itfState[colId]) {
    itfState[colId].date = result.date;
    const lbl = document.getElementById(`itf-date-lbl-${colId}`);
    if (lbl) lbl.textContent = result.label;
    const btn = lbl?.closest('.itf-btn');
    if (btn) btn.classList.add('active');
  }
}

// ── GOOGLE CALENDAR (updated with taller iframe) ──
function getCalendarUrl() { return getPainelData('calendarUrl') || ''; }
function setCalendarUrl(v) { setPainelData('calendarUrl', v); }

function renderCalendar() {
  const url = getCalendarUrl();
  const area = document.getElementById('calendarArea');
  if (!area) return;
  if (!url) {
    area.innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--muted)">
        <div style="font-size:36px;margin-bottom:12px">📅</div>
        <p style="font-size:14px;margin-bottom:14px">Conecte seu Google Agenda para visualizá-lo aqui.</p>
        <button class="btn-primary btn-sm" onclick="openCalendarConfig()">Conectar agora</button>
      </div>`;
    return;
  }
  area.innerHTML = `<iframe src="${esc(url)}" style="width:100%;height:350px;border:0;border-radius:12px;background:white" frameborder="0" scrolling="no"></iframe>`;
}

function openCalendarConfig() {
  document.getElementById('calendarModal').classList.remove('hidden');
  document.getElementById('calendarUrl').value = getCalendarUrl();
  setTimeout(()=>document.getElementById('calendarUrl').focus(),50);
}
function closeCalendarConfig() { document.getElementById('calendarModal').classList.add('hidden'); }
function saveCalendarConfig() {
  const url = document.getElementById('calendarUrl').value.trim();
  setCalendarUrl(url);
  closeCalendarConfig();
  renderCalendar();
  renderTimerCalendar();
}

// ── KANBAN TIMER ──
let kanbanTimer = null; // { taskId, colId, taskTitle, start, pausedSeconds, pausedAt, interval }

function toggleKanbanTimer(taskId, taskTitle, colId) {
  if (kanbanTimer && kanbanTimer.taskId === taskId) {
    stopKanbanTimer(true);
  } else {
    if (kanbanTimer) stopKanbanTimer(false); // stop previous without saving
    startKanbanTimer(taskId, taskTitle, colId);
  }
  renderPersonalTasks();
}

function startKanbanTimer(taskId, taskTitle, colId) {
  const d = getTarefasData();
  const task = d.tasks.find(t => t.id === taskId);
  kanbanTimer = { taskId, colId, taskTitle, start: new Date(), pausedSeconds: 0, pausedAt: null };
  kanbanTimer.interval = setInterval(() => {
    const btn = document.getElementById(`ktimerbtn-${taskId}`);
    const disp = document.getElementById(`ktimer-${taskId}`);
    const pDisp = document.getElementById(`ptimer-${taskId}`);
    const label = '⏱ ' + fmtKTimerDisplay();
    if (disp) disp.textContent = label;
    if (pDisp) pDisp.textContent = label;
  }, 1000);
  // Update the card button immediately
  const btn = document.getElementById(`ktimerbtn-${taskId}`);
  const pBtn = document.getElementById(`ptimerbtn-${taskId}`);
  if (btn) {
    btn.classList.add('running');
    btn.innerHTML = `<span class="card-timer-display" id="ktimer-${taskId}">⏱ 00:00</span>`;
    btn.title = 'Parar e salvar';
  }
  if (pBtn) {
    pBtn.classList.add('running');
    pBtn.innerHTML = `<span class="card-timer-display" id="ptimer-${taskId}">⏱ 00:00</span>`;
    pBtn.title = 'Parar e salvar';
  }
  const kPause = document.getElementById(`kpausebtn-${taskId}`);
  const pPause = document.getElementById(`ppausebtn-${taskId}`);
  [kPause, pPause].forEach(b => { if (b) { b.disabled = false; b.textContent = '⏸ Pausar'; } });
}

function getKanbanTimerElapsedSeconds() {
  if (!kanbanTimer) return 0;
  const now = kanbanTimer.pausedAt ? new Date(kanbanTimer.pausedAt) : new Date();
  const paused = kanbanTimer.pausedSeconds || 0;
  return Math.max(0, Math.round((now - kanbanTimer.start) / 1000) - paused);
}

function pauseKanbanTimer(taskId) {
  if (!kanbanTimer || kanbanTimer.taskId !== taskId) return;
  if (kanbanTimer.pausedAt) {
    kanbanTimer.pausedSeconds = (kanbanTimer.pausedSeconds || 0) + Math.max(0, Math.round((new Date() - new Date(kanbanTimer.pausedAt)) / 1000));
    kanbanTimer.pausedAt = null;
  } else {
    kanbanTimer.pausedAt = new Date().toISOString();
  }
  const label = kanbanTimer.pausedAt ? '▶ Retomar' : '⏸ Pausar';
  const kPause = document.getElementById(`kpausebtn-${taskId}`);
  const pPause = document.getElementById(`ppausebtn-${taskId}`);
  [kPause, pPause].forEach(b => { if (b) b.textContent = label; });
  const btn = document.getElementById(`ktimerbtn-${taskId}`);
  const pBtn = document.getElementById(`ptimerbtn-${taskId}`);
  [btn, pBtn].forEach(b => { if (b) b.classList.toggle('running', !kanbanTimer.pausedAt); });
  const disp = document.getElementById(`ktimer-${taskId}`);
  const pDisp = document.getElementById(`ptimer-${taskId}`);
  const tLabel = '⏱ ' + fmtKTimerDisplay();
  if (disp) disp.textContent = tLabel;
  if (pDisp) pDisp.textContent = tLabel;
}

function stopKanbanTimer(save) {
  if (!kanbanTimer) return;
  clearInterval(kanbanTimer.interval);
  if (save) {
    const end = new Date();
    const durationSeconds = Math.max(1, getKanbanTimerElapsedSeconds());
    const d = getTarefasData();
    const task = d.tasks.find(t => t.id === kanbanTimer.taskId);
    const collabs = getCollabs();
    const col = collabs.find(c => c.name === currentUser.name);
    const role = col ? col.role : currentUser.role;
    const clientName = task ? (task.client || '—') : '—';

    // Save time entry (NO points yet — points only awarded when task is marked done)
    const entry = {
      id: 'ktask_' + Date.now(),
      client: clientName,
      task: kanbanTimer.taskTitle,
      taskDesc: task ? task.desc : '',
      taskPoints: 0, // points awarded on completion, not on timer stop
      category: 'Tarefas',
      user: currentUser.name,
      role: currentUser.role,
      start: kanbanTimer.start.toISOString(),
      end: end.toISOString(),
      date: kanbanTimer.start.toLocaleDateString('pt-BR'),
      durationSeconds,
      fromKanban: kanbanTimer.taskId,
    };
    const entries = getEntries();
    entries.unshift(entry);
    set('entries', entries);
    remapSaveTimerToDb(entry, task);

    // Show feedback
    const btn = document.getElementById(`ktimerbtn-${kanbanTimer.taskId}`);
    const pBtn = document.getElementById(`ptimerbtn-${kanbanTimer.taskId}`);
    [btn, pBtn].forEach(b => {
      if (b) {
        b.innerHTML = `✓ ${formatDuration(durationSeconds)}`;
        b.style.color = 'var(--green)';
        b.style.borderColor = 'var(--green)';
      }
    });
    setTimeout(() => { renderKanban(); renderPersonalTasks(); }, 800);
  }
  kanbanTimer = null;
  if (!save) { renderKanban(); renderPersonalTasks(); }
}

function fmtKTimerDisplay() {
  if (!kanbanTimer) return '00:00';
  const s = getKanbanTimerElapsedSeconds();
  const m = Math.floor(s / 60), sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m/60);
    return `${h}:${String(m%60).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ── INLINE TASK FORM ──
let itfState = {}; // per-column form state

function showInlineForm(colId) {
  // Hide all other open forms
  document.querySelectorAll('[id^="itf-"]').forEach(el => {
    if (el.id !== `itf-${colId}`) { el.style.display = 'none'; el.innerHTML = ''; }
  });
  document.querySelectorAll('[id^="addBtn-"]').forEach(el => el.style.display = '');

  const formEl = document.getElementById(`itf-${colId}`);
  const btnEl = document.getElementById(`addBtn-${colId}`);
  btnEl.style.display = 'none';

  const collabs = getCollabs();
  const todayStr = new Date().toISOString().slice(0,10);
  const myName = currentUser.name;

  // Init state for this col
  itfState[colId] = { priority: 4, date: '', assignee: myName, recurrence: '' };

  formEl.style.display = '';
  formEl.innerHTML = `
    <div class="inline-task-form" id="itf-form-${colId}">
      <input type="text" id="itf-title-${colId}" placeholder="Nome da tarefa... (ex: &quot;Artes hoje&quot; ou &quot;Reunião amanhã&quot;)" onkeydown="itfKeydown(event,'${colId}')" oninput="smartParseInlineTask('${colId}')" autofocus />
      <textarea class="itf-desc" id="itf-desc-${colId}" placeholder="Descrição" rows="1" onkeydown="itfDescKeydown(event,'${colId}')"></textarea>
      <div style="margin-top:6px">
        <input list="itf-clients-${colId}" id="itf-client-${colId}" placeholder="🏢 Cliente (obrigatório)" style="border:0;background:var(--surface-3);color:var(--text);font-size:12px;width:100%;outline:none;border-radius:8px;padding:6px 10px;font-family:'DM Sans',sans-serif" />
        <datalist id="itf-clients-${colId}">${getClients().map(c=>`<option value="${esc(c.name)}"></option>`).join('')}</datalist>
      </div>
      <div class="itf-toolbar">
        <!-- Date -->
        <label class="itf-btn itf-date-btn" title="Data" style="cursor:pointer" onclick="openNativeDatePicker('itf-date-${colId}', event)">
          📅 <span id="itf-date-lbl-${colId}">Data</span>
          <input type="date" id="itf-date-${colId}" onchange="itfSetDate('${colId}')" />
        </label>
        <!-- Priority -->
        <button class="itf-btn" id="itf-pri-btn-${colId}" onclick="itfCyclePriority('${colId}')" title="Prioridade">
          🚩 P4
        </button>
        <!-- Assignee -->
        <button class="itf-btn" id="itf-assign-btn-${colId}" onclick="itfOpenAssignee('${colId}',this)" title="Responsável">
          👤 ${esc(myName.split(' ')[0])}
        </button>
        <!-- Recurrence -->
        <button class="itf-btn" id="itf-rec-btn-${colId}" onclick="itfCycleRecurrence('${colId}')" title="Recorrência">
          🔁
        </button>
        <!-- Section tag -->
        <div class="itf-section-tag">
          # ${esc(getTarefasData().cols.find(c=>c.id===colId)?.name||'')}
        </div>
        <!-- Actions -->
        <div class="itf-actions">
          <button class="btn-dark btn-sm" onclick="hideInlineForm('${colId}')">✕</button>
          <button class="btn-primary btn-sm" onclick="submitInlineTask('${colId}')">▶</button>
        </div>
      </div>
    </div>`;

  document.getElementById(`itf-title-${colId}`).focus();
}

function hideInlineForm(colId) {
  const formEl = document.getElementById(`itf-${colId}`);
  const btnEl = document.getElementById(`addBtn-${colId}`);
  if (formEl) { formEl.style.display = 'none'; formEl.innerHTML = ''; }
  if (btnEl) btnEl.style.display = '';
}

function itfKeydown(e, colId) {
  if (e.key === 'Enter') { e.preventDefault(); submitInlineTask(colId); }
  if (e.key === 'Escape') hideInlineForm(colId);
}
function itfDescKeydown(e, colId) {
  if (e.key === 'Escape') hideInlineForm(colId);
}

function itfSetDate(colId) {
  const val = document.getElementById(`itf-date-${colId}`).value;
  itfState[colId].date = val;
  const lbl = document.getElementById(`itf-date-lbl-${colId}`);
  if (lbl) lbl.textContent = val ? formatTaskDate(val) : 'Data';
  const btn = lbl?.closest('.itf-btn');
  if (btn) btn.classList.toggle('active', !!val);
}

function itfCyclePriority(colId) {
  const s = itfState[colId];
  const cycle = [4,1,2,3]; // none→Alta→Média→Baixa→none
  const idx = cycle.indexOf(s.priority);
  s.priority = cycle[(idx+1) % cycle.length];
  const labels = {4:'Prioridade', 1:'Alta', 2:'Média', 3:'Baixa'};
  const icons  = {4:'🚩', 1:'🔴', 2:'🟡', 3:'🔵'};
  const cls    = {4:'', 1:'itf-priority-p1', 2:'itf-priority-p2', 3:'itf-priority-p3'};
  const btn = document.getElementById(`itf-pri-btn-${colId}`);
  if (btn) {
    btn.textContent = `${icons[s.priority]} ${labels[s.priority]}`;
    btn.className = `itf-btn ${cls[s.priority]}`;
  }
}

function itfCycleRecurrence(colId) {
  const s = itfState[colId];
  const cycle = ['','daily','weekly','monthly'];
  const idx = cycle.indexOf(s.recurrence||'');
  s.recurrence = cycle[(idx+1)%cycle.length];
  const labels = {'':'🔁','daily':'🔁 Diário','weekly':'🔁 Semanal','monthly':'🔁 Mensal'};
  const btn = document.getElementById(`itf-rec-btn-${colId}`);
  if (btn) {
    btn.textContent = labels[s.recurrence];
    btn.classList.toggle('active', !!s.recurrence);
  }
}

function itfOpenAssignee(colId, btn) {
  const collabs = getCollabs();
  const picker = document.getElementById('kPicker');
  const rect = btn.getBoundingClientRect();
  picker.classList.remove('hidden');
  picker.style.top = (rect.bottom + 4) + 'px';
  picker.style.left = rect.left + 'px';
  picker.style.right = 'auto';
  document.getElementById('kPickerContent').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:700">Responsável</div>
    <div onclick="itfSetAssignee('${colId}','');closeKPicker()" style="padding:7px 8px;cursor:pointer;border-radius:6px;font-size:13px;color:var(--muted)">— Sem responsável</div>
    ${collabs.map(c => {
      const img = COLLAB_AVATARS[c.name];
      return `<div onclick="itfSetAssignee('${colId}','${esc(c.name)}');closeKPicker()" style="display:flex;align-items:center;gap:8px;padding:7px 8px;cursor:pointer;border-radius:6px;font-size:13px" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">
        ${img ? `<img src="${img}" style="width:22px;height:22px;border-radius:6px;object-fit:cover">` : `<div style="width:22px;height:22px;border-radius:6px;background:var(--accent);display:grid;place-items:center;font-size:10px;color:#fff;font-weight:800">${c.name[0]}</div>`}
        ${esc(c.name)}
      </div>`;
    }).join('')}`;
  setTimeout(() => document.addEventListener('click', closeKPicker, {once:true}), 0);
}

function itfSetAssignee(colId, name) {
  itfState[colId].assignee = name;
  const btn = document.getElementById(`itf-assign-btn-${colId}`);
  if (btn) btn.textContent = `👤 ${name ? esc(name.split(' ')[0]) : 'Ninguém'}`;
}

function submitInlineTask(colId) {
  const titleEl  = document.getElementById(`itf-title-${colId}`);
  const descEl   = document.getElementById(`itf-desc-${colId}`);
  const clientEl = document.getElementById(`itf-client-${colId}`);
  const title  = titleEl?.value.trim();
  const client = clientEl?.value.trim();
  if (!title)  { titleEl?.focus();  return; }
  if (!client) {
    clientEl?.focus();
    clientEl.style.border = '1px solid var(--red)';
    clientEl.placeholder = '⚠ Cliente obrigatório';
    return;
  }
  const s = itfState[colId] || {};
  // Smart date: if no manual date set, try to parse from title
  if (!s.date) {
    const smartResult = parseNaturalDate(title);
    if (smartResult) s.date = smartResult.date;
  }
  const d = getTarefasData();
  const localTaskUid = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const task = {
    id: localTaskUid,
    localUid: localTaskUid,
    colId, title,
    desc: descEl?.value.trim() || '',
    client,
    assignee: s.assignee || currentUser.name,
    date: s.date || '',
    deadline: '',
    priority: s.priority || 4,
    recurrence: s.recurrence || '',
    labels: [],
    subtasks: [],
    attachments: [],
    comments: [],
    done: false,
    createdBy: currentUser.name,
    createdAt: new Date().toISOString(),
  };
  d.tasks.push(task);
  setTarefasData(d);
  hideInlineForm(colId);
  renderKanban();
  setTimeout(() => showInlineForm(colId), 50);
}
