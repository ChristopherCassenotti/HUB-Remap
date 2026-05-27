const DEFAULT_TASK_POINTS = [
  // DESIGNER
  {id:'tp1',  role:'Designer', name:'Criação de arte (Card único)',          points:10},
  {id:'tp2',  role:'Designer', name:'Criação de arte (Carrossel)',           points:15},
  {id:'tp3',  role:'Designer', name:'Criação de capas',                      points:2},
  {id:'tp4',  role:'Designer', name:'Edição de vídeo (Conteúdos e anúncios)',points:15},
  {id:'tp5',  role:'Designer', name:'Adaptação stories',                     points:2},
  {id:'tp6',  role:'Designer', name:'Freelancer',                            points:10},
  {id:'tp7',  role:'Designer', name:'Criação identidade visual completa',    points:20},
  {id:'tp8',  role:'Designer', name:'Criação de logo',                       points:15},
  {id:'tp9',  role:'Designer', name:'Edição de fotos (Carros e etc)',        points:5},
  {id:'tp10', role:'Designer', name:'Postagem carros',                       points:4},
  {id:'tp11', role:'Designer', name:'Adaptação de Storys',                   points:2},
  {id:'tp12', role:'Designer', name:'Outras tarefas',                        points:3},
  // SOCIAL MEDIA
  {id:'tp13', role:'Social Media', name:'Copy',                              points:3},
  {id:'tp14', role:'Social Media', name:'Planejamento (4 posts)',            points:5},
  {id:'tp15', role:'Social Media', name:'Planejamento (8 posts)',            points:10},
  {id:'tp16', role:'Social Media', name:'Planejamento (12 posts)',           points:15},
  {id:'tp17', role:'Social Media', name:'Aprovação',                         points:2},
  {id:'tp18', role:'Social Media', name:'Programação',                       points:3},
  {id:'tp19', role:'Social Media', name:'Incluir planejamento no clickup',   points:4},
  {id:'tp20', role:'Social Media', name:'Conferência clientes (Todos os 60 clientes)', points:20},
  {id:'tp21', role:'Social Media', name:'Postagem google meu negócio',       points:3},
  {id:'tp22', role:'Social Media', name:'Conferência clientes',              points:3},
  {id:'tp23', role:'Social Media', name:'Reuniões de alinhamento',           points:3},
  // EDITOR DE VÍDEO / PROD. VISUAL
  {id:'tp24', role:'Editor de Vídeo', name:'Fotos e Vídeos Externas (Cada 30 min)', points:15},
  {id:'tp25', role:'Editor de Vídeo', name:'Edição de vídeo (Conteúdos e anúncios)',points:15},
  {id:'tp26', role:'Editor de Vídeo', name:'Edição de fotos',                points:10},
  {id:'tp27', role:'Editor de Vídeo', name:'Criação de roteiro (Cliente)',   points:5},
  {id:'tp28', role:'Editor de Vídeo', name:'Repassar vídeos para editar (Cliente)', points:5},
  {id:'tp29', role:'Editor de Vídeo', name:'Outras tarefas',                 points:3},
  // GESTOR DE TRÁFEGO
  {id:'tp30', role:'Gestor de Tráfego', name:'Criação de campanhas',         points:10},
  {id:'tp31', role:'Gestor de Tráfego', name:'Inclusão de criativos',        points:3},
  {id:'tp32', role:'Gestor de Tráfego', name:'Relatório clientes',           points:5},
  {id:'tp33', role:'Gestor de Tráfego', name:'Solicitação de criativos',     points:5},
  {id:'tp34', role:'Gestor de Tráfego', name:'Alinhamento com cliente',      points:5},
  {id:'tp35', role:'Gestor de Tráfego', name:'Verificação das campanhas',    points:1},
  {id:'tp36', role:'Gestor de Tráfego', name:'Outras tarefas',               points:3},
  // FILMMAKER
  {id:'tp37', role:'Filmmaker', name:'Gravação externa (Cada 30 min)',       points:15},
  {id:'tp38', role:'Filmmaker', name:'Edição de vídeo (Conteúdos e anúncios)',points:15},
  {id:'tp39', role:'Filmmaker', name:'Edição de reels',                      points:12},
  {id:'tp40', role:'Filmmaker', name:'Edição de fotos',                      points:10},
  {id:'tp41', role:'Filmmaker', name:'Criação de roteiro (Cliente)',         points:5},
  {id:'tp42', role:'Filmmaker', name:'Motion gráfico',                       points:15},
  {id:'tp43', role:'Filmmaker', name:'Vídeo institucional',                  points:20},
  {id:'tp44', role:'Filmmaker', name:'Tratamento de áudio',                  points:5},
  {id:'tp45', role:'Filmmaker', name:'Edição de depoimento cliente',         points:8},
  {id:'tp46', role:'Filmmaker', name:'Corte e montagem vídeo',               points:10},
  {id:'tp47', role:'Filmmaker', name:'Repassar vídeos para editar (Cliente)',points:5},
  {id:'tp48', role:'Filmmaker', name:'Outras tarefas',                       points:3},
];

function getTaskPoints() {
  const ls = tryLS(() => JSON.parse(localStorage.getItem('tt_taskpoints_v1') || 'null'));
  if (ls && ls.length) return ls;
  if (_store.taskPoints && _store.taskPoints.length) return _store.taskPoints;
  return DEFAULT_TASK_POINTS;
}
function setTaskPoints(val) {
  _store.taskPoints = val;
  tryLS(() => localStorage.setItem('tt_taskpoints_v1', JSON.stringify(val)));
}
function getDescontos() {
  const ls = tryLS(() => JSON.parse(localStorage.getItem('tt_descontos_v1') || 'null'));
  if (ls) return ls;
  return _store.descontos || [];
}
function setDescontos(val) {
  _store.descontos = val;
  tryLS(() => localStorage.setItem('tt_descontos_v1', JSON.stringify(val)));
}
function getMetas() {
  const ls = tryLS(() => JSON.parse(localStorage.getItem('tt_metas_v2') || 'null'));
  if (ls) return ls;
  return _store.metas || {};
}
function setMetas(val) {
  _store.metas = val;
  tryLS(() => localStorage.setItem('tt_metas_v2', JSON.stringify(val)));
}

// Returns base meta for a specific month key (YYYY-MM)
// Returns {m1,m2,m3} for a specific month, falling back to nearest past month
function getMetaForMonth(collabName, mk) {
  const metas = getMetas();
  const history = metas[collabName] || {};
  if (history[mk] && typeof history[mk] === 'object') return history[mk];
  // Legacy: if stored as a number (old format), convert
  if (history[mk] && typeof history[mk] === 'number') {
    const b = history[mk];
    return { m1: Math.round(b*1.07), m2: Math.round(b*1.14), m3: Math.round(b*1.21) };
  }
  const keys = Object.keys(history).sort().reverse();
  const before = keys.find(k => k <= mk);
  if (!before) return null;
  const val = history[before];
  if (typeof val === 'object') return val;
  if (typeof val === 'number') return { m1: Math.round(val*1.07), m2: Math.round(val*1.14), m3: Math.round(val*1.21) };
  return null;
}

function monthKey(yr, mo) {
  return `${yr}-${String(mo+1).padStart(2,'0')}`;
}

// Normalização de usuário/pontos para manter Timer, Retroativo, Meu Trabalho e Desempenho batendo
function normalizeUserNameForCompare(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameUserName(a, b) {
  const na = normalizeUserNameForCompare(a);
  const nb = normalizeUserNameForCompare(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  const fa = na.split(' ')[0] || '';
  const fb = nb.split(' ')[0] || '';
  if (fa && fb && fa === fb) return true;

  // Cobre casos como "Christopher" x "Christopher Cassenoti" ou "Alexandre Damacena" x "Carlos Alexandre Damacena".
  if (na.length >= 6 && nb.includes(na)) return true;
  if (nb.length >= 6 && na.includes(nb)) return true;

  return false;
}

function isTaskPointAllowedForCurrentUser(point, user = currentUser) {
  const userRole = normalizeUserNameForCompare(user?.role || '');
  const pointRole = normalizeUserNameForCompare(point?.role || '');

  if (!userRole) return false;
  if (userRole === 'diretor') return true;
  if (!pointRole || pointRole === 'todos') return true;

  return pointRole === userRole;
}

function getEntryPoints(entry, role = '') {
  if (!entry) return 0;

  const direct = entry.taskPoints ?? entry.points ?? entry.pontos;
  if (direct !== undefined && direct !== null && direct !== '' && Number.isFinite(Number(direct))) {
    return Number(direct);
  }

  const lines = Array.isArray(entry.taskLines) ? entry.taskLines : [];
  if (lines.length) {
    return lines.reduce((sum, line) => sum + Number(line.points || 0) * Number(line.qty || 1), 0);
  }

  const base = entry.baseTaskPoints ?? entry.basePoints ?? entry.base_points;
  if (base !== undefined && base !== null && base !== '' && Number.isFinite(Number(base))) {
    return Number(base);
  }

  return Number(matchTaskPoints(entry.task || '', role) || 0);
}

function formatPointsValue(value) {
  const n = Number(value || 0);
  if (typeof formatTimerPoints === 'function') return formatTimerPoints(n);
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1))).replace('.', ',');
}

// Match a task description to point value
function matchTaskPoints(taskDesc, role) {
  const pts = getTaskPoints();
  const desc = taskDesc.toLowerCase();
  // Try exact / contains match for current role or "Todos"
  const roleMatches = pts.filter(p => p.role === role || p.role === 'Todos');
  let best = null, bestScore = 0;
  roleMatches.forEach(p => {
    const keyword = p.name.toLowerCase();
    if (desc.includes(keyword) || keyword.includes(desc)) {
      if (p.name.length > bestScore) { best = p; bestScore = p.name.length; }
    }
  });
  if (best) return best.points;
  // Fallback: "Outras tarefas"
  const fallback = roleMatches.find(p => p.name.toLowerCase().includes('outras'));
  return fallback ? fallback.points : 3;
}

// Get total points for a collaborator in a given month
function getCollabPoints(userName, userRole, year, month) {
  const entries = getEntries().filter(e => {
    const d = entryDate(e);
    return samePersonName(e.user, userName) && d.getFullYear() === year && d.getMonth() === month;
  });
  return entries.reduce((s, e) => s + getEntryPoints(e, userRole), 0);
}

function getCollabDescontos(userName, year, month) {
  return getDescontos().filter(d => {
    const dt = new Date(d.date);
    return samePersonName(d.collab, userName) && dt.getFullYear() === year && dt.getMonth() === month;
  }).reduce((s, d) => s + (parseFloat(d.points) || 0), 0);
}

function nivelMeta(pts, metaObj) {
  if (!metaObj) return { nivel: 0, label: 'Sem meta', cls: 'nivel-0', m1: 0, m2: 0, m3: 0 };
  const m1 = metaObj.m1 || 0;
  const m2 = metaObj.m2 || 0;
  const m3 = metaObj.m3 || 0;
  if (m3 && pts >= m3) return { nivel: 3, label: 'Meta 21% ✓', cls: 'nivel-21', m1, m2, m3 };
  if (m2 && pts >= m2) return { nivel: 2, label: 'Meta 14% ✓', cls: 'nivel-14', m1, m2, m3 };
  if (m1 && pts >= m1) return { nivel: 1, label: 'Meta 7% ✓',  cls: 'nivel-7',  m1, m2, m3 };
  return { nivel: 0, label: 'Abaixo da meta', cls: 'nivel-0', m1, m2, m3 };
}

// Todos os colaboradores cadastrados podem ter metas individuais.
function userHasMeta(name, role) {
  return true;
}

// Mario's meta level: majority of his group (Designers + Editor de Vídeo only)
function getMarioGroupLevel(mk) {
  const group = getSupervisedGroup('Mario Junior');
  const collabs = getCollabs();
  const now = new Date();
  const yr = parseInt(mk.split('-')[0]);
  const mo = parseInt(mk.split('-')[1]) - 1;

  // Only count eligible roles in group
  const eligible = group.filter(name => {
    const col = collabs.find(c => c.name === name);
    return col && META_ELIGIBLE_ROLES.includes(col.role);
  });

  if (!eligible.length) return { nivel: 0, label: 'Sem grupo elegível', cls: 'nivel-0' };

  // Get level each member reached
  const levels = eligible.map(name => {
    const col = collabs.find(c => c.name === name);
    const role = col ? col.role : '';
    const pts = getCollabPoints(name, role, yr, mo);
    const desc = getCollabDescontos(name, yr, mo);
    const net = Math.max(0, pts - desc);
    const metaObj = getMetaForMonth(name, mk);
    return nivelMeta(net, metaObj).nivel; // 0,1,2,3
  });

  const total = levels.length;
  // Count how many reached each level or above
  const count3 = levels.filter(l => l >= 3).length;
  const count2 = levels.filter(l => l >= 2).length;
  const count1 = levels.filter(l => l >= 1).length;

  // Majority = more than 50%
  const threshold = total / 2;
  let marioLevel = 0;
  if (count1 > threshold) marioLevel = 1;
  if (count2 > threshold) marioLevel = 2;
  if (count3 > threshold) marioLevel = 3;

  const labels = ['Abaixo da meta', 'Meta 7% ✓', 'Meta 14% ✓', 'Meta 21% ✓'];
  const classes = ['nivel-0', 'nivel-7', 'nivel-14', 'nivel-21'];
  const levelDetail = eligible.map(name => {
    const col = collabs.find(c => c.name === name);
    const role = col ? col.role : '';
    const pts = getCollabPoints(name, role, yr, mo);
    const desc = getCollabDescontos(name, yr, mo);
    const net = Math.max(0, pts - desc);
    const metaObj = getMetaForMonth(name, mk);
    const nv = nivelMeta(net, metaObj);
    return { name, nv };
  });

  return {
    nivel: marioLevel,
    label: labels[marioLevel],
    cls: classes[marioLevel],
    levelDetail, // breakdown per member
    counts: { total, c1: count1, c2: count2, c3: count3 },
  };
}

// ── DESEMPENHO OVERLAY ──
function openDesempenho() {
  document.getElementById('desempenhoPage').classList.remove('hidden');
  document.getElementById('desempenhoUserPill').textContent = `${currentUser.name} • ${currentUser.role}`;
  const isDir = currentUser.role === 'Diretor';
  document.getElementById('desTabEquipe').style.display = isDir ? '' : 'none';

  // Hide "Meu desempenho" tab entirely for Directors
  const tabMeu = document.querySelector('#desempenhoTabs .tab:first-child');
  if (tabMeu) tabMeu.style.display = isDir ? 'none' : '';

  document.getElementById('desempenhoSubtitle').textContent = isDir
    ? 'Evolução e metas da equipe em tempo real.'
    : 'Suas metas, pontos e evolução ao longo do tempo.';

  showDesTab(isDir ? 'equipe' : 'meu');
}

function closeDesempenho() {
  document.getElementById('desempenhoPage').classList.add('hidden');
}

let currentDesTab = 'meu';
function showDesTab(tab) {
  currentDesTab = tab;
  ['meu','equipe','tabela'].forEach(t => {
    document.getElementById('desTab-'+t).style.display = t===tab ? '' : 'none';
  });
  document.querySelectorAll('#desempenhoTabs .tab').forEach((el,i) => {
    el.classList.toggle('active', ['meu','equipe','tabela'][i]===tab);
  });
  if (tab==='meu') renderDesempenho();
  if (tab==='equipe') renderEquipeDesempenho();
  if (tab==='tabela') renderTabelaPontos();
}

function getPeriodRange(selId) {
  const val = document.getElementById(selId)?.value || 'current';
  const now = new Date();
  if (val === 'current') return { yr: now.getFullYear(), mo: now.getMonth(), all: false };
  if (val === 'last') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { yr: d.getFullYear(), mo: d.getMonth(), all: false };
  }
  return { yr: null, mo: null, all: true };
}

function filterEntriesByPeriod(entries, pRange) {
  if (pRange.all) return entries;
  return entries.filter(e => {
    const d = entryDate(e);
    return d.getFullYear() === pRange.yr && d.getMonth() === pRange.mo;
  });
}

function renderDesempenho() {
  const pRange = getPeriodRange('desPeriodSel');
  const now = new Date();
  const yr = pRange.all ? now.getFullYear() : pRange.yr;
  const mo = pRange.all ? now.getMonth() : pRange.mo;

  const allMyEntries = getEntries().filter(e => entryBelongsToUser(e, currentUser.name));
  const myEntries = filterEntriesByPeriod(allMyEntries, pRange);

  const myPts = myEntries.reduce((s,e) => s + getEntryPoints(e, currentUser.role), 0);
  const myDesc = pRange.all ? getDescontos().filter(d=>samePersonName(d.collab,currentUser.name)).reduce((s,d)=>s+(parseFloat(d.points)||0),0)
                             : getCollabDescontos(currentUser.name, yr, mo);
  const myNet = Math.max(0, myPts - myDesc);
  const mk = monthKey(yr, mo);
  const myMeta = getMetaForMonth(currentUser.name, mk);
  const nivel = nivelMeta(myNet, myMeta);

  const isNoMeta = NO_META_USERS.includes(currentUser.name);
  const isMarioSuper = SUPERVISOR_META_USERS.includes(currentUser.name);

  // Stats — hide nivel for no-meta users
  document.getElementById('desempenhoStats').innerHTML = `
    <div class="stat accent"><div class="label">Pontos brutos</div><div class="value">${formatPoints(myPts)}</div><div class="sub">${myEntries.length} tarefas</div></div>
    <div class="stat red"><div class="label">Descontos</div><div class="value">-${formatPoints(myDesc)}</div><div class="sub">aplicados</div></div>
    <div class="stat green"><div class="label">Pontos líquidos</div><div class="value">${formatPoints(myNet)}</div><div class="sub">acumulado</div></div>
    ${!isNoMeta ? `<div class="stat ${nivel.nivel>0?'yellow':''}"><div class="label">Nível atingido</div><div class="value" style="font-size:16px">${isMarioSuper ? getMarioGroupLevel(mk).label : nivel.label}</div></div>` : `<div class="stat"><div class="label">Horas este mês</div><div class="value">${fmtH(sum(myEntries.filter(e=>isSameMonth(entryDate(e),now))))}</div></div>`}
  `;

  // Meta progress — big cards with countdown
  const metaBox = document.getElementById('metaProgress');

  if (isNoMeta) {
    // No meta for Renan, Jéssica, Gustavo
    metaBox.innerHTML = `<div style="text-align:center;padding:32px;color:var(--muted)"><div style="font-size:32px;margin-bottom:10px"><i class="bi bi-pie-chart"></i></div><p>Acompanhe suas horas e tarefas registradas acima.</p></div>`;
  } else if (isMarioSuper) {
    // Mario: show group-derived meta
    const groupResult = getMarioGroupLevel(mk);
    const levelColors = ['var(--muted)', '#22c55e', '#4f8ef7', '#a855f7'];
    const levelColor = levelColors[groupResult.nivel];
    metaBox.innerHTML = `
      <div style="background:var(--surface-2);border:2px solid ${levelColor};border-radius:18px;padding:24px;margin-bottom:16px">
        <div style="font-size:13px;color:var(--muted);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Meta do grupo — maioria simples</div>
        <div style="font-size:32px;font-weight:900;color:${levelColor};margin-bottom:6px">${groupResult.label}</div>
        <div style="font-size:13px;color:var(--muted-2)">Baseado no desempenho dos ${groupResult.counts?.total||0} colaboradores elegíveis do seu grupo</div>
        <div style="display:flex;gap:16px;margin-top:14px;flex-wrap:wrap">
          <span style="font-size:12px;color:#22c55e">✓ 7%: ${groupResult.counts?.c1||0}/${groupResult.counts?.total||0} pessoas</span>
          <span style="font-size:12px;color:#4f8ef7">✓ 14%: ${groupResult.counts?.c2||0}/${groupResult.counts?.total||0} pessoas</span>
          <span style="font-size:12px;color:#a855f7">✓ 21%: ${groupResult.counts?.c3||0}/${groupResult.counts?.total||0} pessoas</span>
        </div>
      </div>
      <div style="display:grid;gap:8px">
        ${(groupResult.levelDetail||[]).map(({name, nv}) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--surface-2);border-radius:10px">
            <span style="font-size:13px;font-weight:600">${esc(name)}</span>
            <span class="nivel-badge ${nv.cls}">${nv.label}</span>
          </div>`).join('')}
      </div>`;
  } else if (!myMeta) {
    metaBox.innerHTML = `<div style="text-align:center;padding:32px;color:var(--muted)"><div style="font-size:32px;margin-bottom:10px"><i class="bi bi-bar-chart-fill" style="color:#E23D6C"></i></div><p>Nenhuma meta definida para este mês.<br>Aguarde a definição pelo Diretor.</p></div>`;
  } else {
    const { m1, m2, m3 } = nivel;
    const goals = [
      { pct: '7%',  target: m1, color: '#22c55e', bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.25)',  medal: '🥉', label: 'Bronze' },
      { pct: '14%', target: m2, color: '#4f8ef7', bg: 'rgba(79,142,247,.08)', border: 'rgba(79,142,247,.25)', medal: '🥈', label: 'Prata'  },
      { pct: '21%', target: m3, color: '#a855f7', bg: 'rgba(168,85,247,.08)', border: 'rgba(168,85,247,.25)', medal: '🥇', label: 'Ouro'   },
    ];
    metaBox.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">` +
      goals.map(g => {
        if (!g.target) return `<div style="background:var(--surface-3);border-radius:16px;padding:20px;text-align:center;opacity:.4"><div style="font-size:24px">${g.medal}</div><div style="font-size:12px;color:var(--muted);margin-top:6px">Meta ${g.pct} não definida</div></div>`;
        const achieved = myNet >= g.target;
        const missing = Math.max(0, g.target - myNet);
        const barPct = Math.min((myNet / g.target) * 100, 100).toFixed(1);
        return `
          <div style="background:${g.bg};border:1px solid ${achieved ? g.color : g.border};border-radius:16px;padding:20px;position:relative;overflow:hidden">
            ${achieved ? `<div style="position:absolute;top:10px;right:12px;font-size:11px;font-weight:800;color:${g.color};background:${g.bg};border:1px solid ${g.color};border-radius:99px;padding:2px 8px">ATINGIDA ✓</div>` : ''}
            <div style="font-size:28px;margin-bottom:8px">${g.medal}</div>
            <div style="font-size:13px;font-weight:700;color:${g.color};margin-bottom:2px">META ${g.pct} — ${g.label}</div>
            <div style="font-size:26px;font-weight:900;color:${achieved ? g.color : 'var(--text)'};margin:8px 0">${g.target.toLocaleString('pt-BR')}</div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:12px">pontos necessários</div>
            <div style="height:6px;background:var(--surface-3);border-radius:99px;margin-bottom:10px;overflow:hidden">
              <div style="height:100%;width:${barPct}%;background:${achieved ? g.color : g.color+'88'};border-radius:99px;transition:width .6s"></div>
            </div>
            ${achieved
              ? `<div style="font-size:13px;font-weight:700;color:${g.color}">✓ Parabéns! Meta atingida!</div>`
              : `<div style="font-size:13px;color:var(--muted-2)">Faltam <strong style="color:${g.color};font-size:18px">${missing.toLocaleString('pt-BR')}</strong> pontos</div>
                 <div style="font-size:11px;color:var(--muted);margin-top:4px">${myNet.toLocaleString('pt-BR')} / ${g.target.toLocaleString('pt-BR')} pts (${barPct}%)</div>`
            }
          </div>`;
      }).join('') + `</div>` +
      `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">` +
      goals.map(g => {
        if (!g.target) return `<div></div>`;
        return `<div style="background:var(--surface-2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Média/dia para ${g.pct}</div>
          <div style="font-size:18px;font-weight:800;color:${g.color}">${Math.ceil(g.target/22)}</div>
          <div style="font-size:10px;color:var(--muted)">pts/dia (22 dias)</div>
        </div>`;
      }).join('') + `</div>`;
  }

  // Show/hide ranking based on role
  const rankingCard = document.getElementById('rankingCard');
  if (rankingCard) rankingCard.style.display = currentUser.role === 'Diretor' ? '' : 'none';

  // Ranking (Diretor only)
  const collabs = getCollabs();
  const nowYr = now.getFullYear(), nowMo = now.getMonth();
  const allUsers = [...new Set([...collabs.map(c=>c.name), ...getEntries().map(e=>e.user)])];
  const ranked = allUsers.map(name => {
    const col = collabs.find(c=>c.name===name);
    const role = col ? col.role : (getEntries().find(e=>isSameUserName(e.user, name))?.role||'');
    const pts = getCollabPoints(name,role,nowYr,nowMo);
    const desc = getCollabDescontos(name,nowYr,nowMo);
    return { name, pts: Math.max(0,pts-desc) };
  }).sort((a,b)=>b.pts-a.pts);
  const medals = ['🥇','🥈','🥉'];
  document.getElementById('rankingPontos').innerHTML = ranked.map((r,i)=>`
    <div class="summary-item">
      <span class="si-name" style="${r.name===currentUser.name?'color:var(--accent);font-weight:700':''}">${medals[i]||`${i+1}.`} ${esc(r.name)}${r.name===currentUser.name?' (você)':''}</span>
      <span class="pts-badge ${i===0?'gold':i===1?'silver':'blue'}">${r.pts} pts</span>
    </div>`).join('');

  // Weekly (my points)
  const weekData = {};
  allMyEntries.forEach(e=>{
    const d = entryDate(e);
    const wk = `Semana ${getWeekNum(d)} / ${d.getFullYear()}`;
    weekData[wk] = (weekData[wk]||0) + getEntryPoints(e, currentUser.role);
  });
  const weekSorted = Object.entries(weekData).sort().reverse().slice(0,8);
  document.getElementById('semanalPontos').innerHTML = weekSorted.length
    ? weekSorted.map(([w,p])=>`<div class="summary-item"><span class="si-name">${esc(w)}</span><span class="pts-badge blue">${formatPoints(p)} pts</span></div>`).join('')
    : '<p style="color:var(--muted);font-size:13px">Nenhum registro.</p>';

  // Monthly evolution chart
  const monthData = {};
  allMyEntries.forEach(e=>{
    const d = entryDate(e);
    const label = d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'});
    monthData[label] = (monthData[label]||0) + getEntryPoints(e, currentUser.role);
  });
  const sortedM = Object.entries(monthData).slice(-8);
  if (charts.pontosMonth) charts.pontosMonth.destroy();
  const ctx = document.getElementById('pontosMonthChart');
  charts.pontosMonth = new Chart(ctx, {
    type:'line',
    data:{ labels:sortedM.map(x=>x[0]), datasets:[{label:'Pontos', data:sortedM.map(x=>x[1]), borderColor:'#a855f7', backgroundColor:'rgba(168,85,247,.1)', borderWidth:2, pointRadius:5, fill:true, tension:0.4}] },
    options: chartOptions()
  });

  // My tasks breakdown
  const tbody = document.getElementById('myPontosTable');
  const monthEntriesForTable = getEntries().filter(e=>entryBelongsToUser(e,currentUser.name) && isSameMonth(entryDate(e),now));
  tbody.innerHTML = monthEntriesForTable.length
    ? monthEntriesForTable.map(e=>`
        <tr>
          <td>${esc(e.date)}</td>
          <td>${esc(e.client)}</td>
          <td style="color:var(--muted-2)">${esc(e.task)}</td>
          <td><span class="pts-badge blue">${formatPoints(getEntryPoints(e,currentUser.role))} pts</span></td>
        </tr>`).join('')
    : `<tr><td colspan="4"><div class="empty"><div class="ei"><i class="bi bi-clipboard-minus"></i></div>Nenhuma tarefa este mês.</div></td></tr>`;
}

function renderEquipeDesempenho() {
  const pRange = getPeriodRange('desEquipeMes');
  const now = new Date();
  const yr = pRange.all ? now.getFullYear() : pRange.yr;
  const mo = pRange.all ? now.getMonth() : pRange.mo;
  const mk = monthKey(yr, mo);
  const collabs = getCollabs();
  const colors = ['#4f8ef7','#22c55e','#f59e0b','#a855f7','#06b6d4','#ef4444'];
  const allEntriesAll = getEntries();

  // ── EVOLUTION CARDS — one per collaborator ──
  const evContainer = document.getElementById('equipeEvolutionCards');
  evContainer.innerHTML = collabs.map((c, i) => {
    const entries = filterEntriesByPeriod(allEntriesAll.filter(e=>samePersonName(e.user,c.name)), pRange);
    const pts = entries.reduce((s,e)=>s+getEntryPoints(e,c.role),0);
    const desc = pRange.all
      ? getDescontos().filter(d=>samePersonName(d.collab,c.name)).reduce((s,d)=>s+(parseFloat(d.points)||0),0)
      : getCollabDescontos(c.name, yr, mo);
    const net = Math.max(0, pts - desc);
    const hasMeta = userHasMeta(c.name, c.role);
    const isMario = SUPERVISOR_META_USERS.includes(c.name);
    const metaObj = (hasMeta && !isMario) ? getMetaForMonth(c.name, mk) : null;
    const nv = isMario ? getMarioGroupLevel(mk) : nivelMeta(net, metaObj);
    const color = colors[i % colors.length];

    // Meta bars
    let metaBarsHTML = '';
    if (!hasMeta) {
      metaBarsHTML = `<p style="color:var(--muted);font-size:12px;margin-top:8px">Cargo sem metas individuais.</p>`;
    } else if (isMario) {
      const gr = getMarioGroupLevel(mk);
      const levelColor = ['var(--muted)','#22c55e','#4f8ef7','#a855f7'][gr.nivel];
      metaBarsHTML = `<div style="margin-top:8px;padding:10px;background:rgba(0,0,0,.2);border-radius:10px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Meta derivada do grupo</div>
        <div style="font-size:15px;font-weight:800;color:${levelColor}">${gr.label}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">7%: ${gr.counts?.c1||0} · 14%: ${gr.counts?.c2||0} · 21%: ${gr.counts?.c3||0} / ${gr.counts?.total||0}</div>
      </div>`;
    } else {
      const goals = metaObj ? [
        { label:'7%',  target:metaObj.m1||0, color:'#22c55e', medal:'🥉' },
        { label:'14%', target:metaObj.m2||0, color:'#4f8ef7', medal:'🥈' },
        { label:'21%', target:metaObj.m3||0, color:'#a855f7', medal:'🥇' },
      ] : [];
      metaBarsHTML = goals.length === 0
        ? `<p style="color:var(--muted);font-size:12px;margin-top:8px">Sem meta definida para este mês.</p>`
        : goals.map(g => {
            if (!g.target) return '';
            const achieved = net >= g.target;
            const gap = Math.max(0, g.target - net);
            const pct = Math.min((net/g.target)*100,100).toFixed(0);
            return `<div style="margin-top:10px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:12px;font-weight:700;color:${g.color}">${g.medal} Meta ${g.label} — ${g.target.toLocaleString('pt-BR')} pts</span>
                <span style="font-size:12px;color:${achieved?g.color:'var(--muted-2)'}">
                  ${achieved ? `<strong style="color:${g.color}">✓ Atingida!</strong>` : `Faltam <strong style="color:${g.color}">${gap.toLocaleString('pt-BR')}</strong> pts`}
                </span>
              </div>
              <div style="height:7px;background:var(--surface-3);border-radius:99px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${achieved?g.color:g.color+'99'};border-radius:99px;transition:width .6s"></div>
              </div>
            </div>`;
          }).join('');
    }

    // Last 3 tasks
    const last3 = [...entries].sort((a,b)=>entryDate(b)-entryDate(a)).slice(0,3);
    const last3HTML = last3.length === 0
      ? `<p style="color:var(--muted);font-size:12px">Nenhuma tarefa registrada.</p>`
      : last3.map(e => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:12px;font-weight:600;color:var(--text)">${esc(e.task)}</div>
              <div style="font-size:11px;color:var(--muted)">${esc(e.client)} · ${esc(e.date)}</div>
            </div>
            <span class="pts-badge blue" style="flex-shrink:0;margin-left:8px">+${formatPoints(getEntryPoints(e,c.role))} pts</span>
          </div>`).join('');

    return `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:22px;border-left:3px solid ${color}">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:12px">
            ${getAvatar(c.name, 40, 12, 15)}
            <div>
              <div style="font-size:16px;font-weight:800">${esc(c.name)}</div>
              <div style="font-size:12px;color:var(--muted)">${esc(c.role)}</div>
            </div>
          </div>
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <div style="text-align:center">
              <div style="font-size:22px;font-weight:900;color:#a855f7">${net.toLocaleString('pt-BR')}</div>
              <div style="font-size:11px;color:var(--muted)">pts líquidos</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:22px;font-weight:900;color:var(--accent)">${entries.length}</div>
              <div style="font-size:11px;color:var(--muted)">tarefas</div>
            </div>
            ${desc > 0 ? `<div style="text-align:center"><div style="font-size:22px;font-weight:900;color:var(--red)">-${desc}</div><div style="font-size:11px;color:var(--muted)">descontos</div></div>` : ''}
            <span class="nivel-badge ${nv.cls}">${nv.label}</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Progresso das metas</div>
            ${metaBarsHTML}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Últimas 3 tarefas</div>
            ${last3HTML}
          </div>
        </div>
      </div>`;
  }).join('');

  // Table
  const tbody = document.getElementById('equipeDesempenhoTable');
  tbody.innerHTML = collabs.map(c=>{
    const entries = filterEntriesByPeriod(allEntriesAll.filter(e=>samePersonName(e.user,c.name)), pRange);
    const pts = entries.reduce((s,e)=>s+getEntryPoints(e,c.role),0);
    const desc = pRange.all
      ? getDescontos().filter(d=>samePersonName(d.collab,c.name)).reduce((s,d)=>s+(parseFloat(d.points)||0),0)
      : getCollabDescontos(c.name, yr, mo);
    const net = Math.max(0,pts-desc);
    const hasMeta = userHasMeta(c.name, c.role);
    const isMario = SUPERVISOR_META_USERS.includes(c.name);
    const meta = hasMeta && !isMario ? getMetaForMonth(c.name, mk) : null;
    const nv = isMario ? getMarioGroupLevel(mk) : nivelMeta(net, meta);
    return `<tr>
      <td><strong>${esc(c.name)}</strong></td>
      <td>${esc(c.role)}</td>
      <td>${entries.length}</td>
      <td><span class="pts-badge blue">${formatPoints(pts)}</span></td>
      <td style="color:var(--red)">-${desc}</td>
      <td><strong>${formatPoints(net)}</strong></td>
      <td style="color:#22c55e">${hasMeta && !isMario ? (nv.m1||'—') : (isMario ? '↓ grupo' : '—')}</td>
      <td style="color:#4f8ef7">${hasMeta && !isMario ? (nv.m2||'—') : '—'}</td>
      <td style="color:#a855f7">${hasMeta && !isMario ? (nv.m3||'—') : '—'}</td>
      <td><span class="nivel-badge ${hasMeta ? nv.cls : 'nivel-0'}">${hasMeta ? nv.label : '—'}</span></td>
    </tr>`;
  }).join('');

  // Monthly comparison chart
  const allEntries = getEntries();
  const monthLabels = [...new Set(allEntries.map(e=>{
    const d=entryDate(e);
    return d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'});
  }))].sort();
  const datasets = collabs.slice(0,6).map((c,i)=>({
    label: c.name,
    data: monthLabels.map(label=>{
      return allEntries.filter(e=>{
        const d=entryDate(e);
        return samePersonName(e.user,c.name) && d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})===label;
      }).reduce((s,e)=>s+getEntryPoints(e,c.role),0);
    }),
    borderColor: colors[i%colors.length],
    backgroundColor: 'transparent',
    borderWidth:2, pointRadius:3, tension:0.4
  }));
  if (charts.equipeMonth) charts.equipeMonth.destroy();
  const ctx2 = document.getElementById('equipeMonthChart');
  charts.equipeMonth = new Chart(ctx2, { type:'line', data:{ labels:monthLabels.slice(-6), datasets }, options:chartOptions() });
}

function renderTabelaPontos() {
  const role = document.getElementById('desTabelaRole').value;
  const pts = getTaskPoints().filter(p=>p.role===role||p.role==='Todos');
  document.getElementById('desTabelaBody').innerHTML = pts.map(p=>`
    <tr>
      <td>${esc(p.name)}</td>
      <td><span class="pts-badge blue">${p.points} pts</span></td>
    </tr>`).join('');
}

// ── PONTUAÇÃO PAGE ──
let currentPontTab = 'tarefas';
function showPontTab(tab) {
  currentPontTab = tab;
  ['tarefas','metas','descontos'].forEach(t => {
    document.getElementById('pontTab-'+t).style.display = t===tab?'':'none';
  });
  document.querySelectorAll('#pontTabs .tab').forEach((el,i) => {
    el.classList.toggle('active', ['tarefas','metas','descontos'][i]===tab);
  });
  if (tab==='tarefas') renderTaskPoints();
  if (tab==='metas') renderMetasGrid();
  if (tab==='descontos') renderDescontosTable();
}

function renderTaskPoints() {
  const role = document.getElementById('pontRoleFilter').value;
  const pts = getTaskPoints().filter(p => p.role === role || p.role === 'Todos');
  const tbody = document.getElementById('taskPointsTable');
  tbody.innerHTML = pts.map(p => `
    <tr>
      <td>${esc(p.name)}</td>
      <td><span class="pts-badge blue">${p.points} pts</span></td>
      <td style="color:var(--muted);font-size:12px">${esc(p.role)}</td>
      <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <button class="btn-dark btn-sm" onclick="openTaskPointModal('${esc(jsStr(p.id))}')" style="font-size:11px;padding:5px 10px">✏️ Editar</button>
        <button class="btn-red btn-sm" onclick="deleteTaskPoint('${esc(jsStr(p.id))}')" style="font-size:11px;padding:5px 10px">Excluir</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="4"><div class="empty"><div class="ei">⭐</div>Nenhuma tarefa para este cargo.</div></td></tr>`;
}

function openTaskPointModal(id) {
  document.getElementById('taskPointModal').classList.remove('hidden');
  document.getElementById('tpId').value = id || '';
  const title = document.getElementById('taskPointModalTitle');
  if (title) title.textContent = id ? 'Editar tarefa pontuada' : 'Nova tarefa pontuada';
  if (id) {
    const p = getTaskPoints().find(x=>String(x.id)===String(id));
    if (p) {
      document.getElementById('tpName').value=p.name;
      document.getElementById('tpRole').value=p.role;
      document.getElementById('tpPoints').value=p.points;
    }
  } else {
    document.getElementById('tpName').value='';
    document.getElementById('tpPoints').value='';
    document.getElementById('tpRole').value = document.getElementById('pontRoleFilter').value;
  }
  setTimeout(() => document.getElementById('tpName')?.focus(), 50);
}
function closeTaskPointModal() { document.getElementById('taskPointModal').classList.add('hidden'); }

async function saveTaskPoint() {
  const name = document.getElementById('tpName').value.trim();
  const points = parseInt(document.getElementById('tpPoints').value, 10);
  const role = document.getElementById('tpRole').value;
  if (!name || !points || points <= 0) return alert('Preencha o nome da tarefa e uma pontuação maior que zero.');

  const id = document.getElementById('tpId').value || 'tp_'+Date.now();
  const all = getTaskPoints().filter(p=>String(p.id)!==String(id));
  all.push({ id, role, name, points });
  all.sort((a,b) => String(a.role).localeCompare(String(b.role), 'pt-BR') || String(a.name).localeCompare(String(b.name), 'pt-BR'));

  setTaskPoints(all);
  try {
    await remapPersistStateNow('tt_taskpoints_v1', all);
    if (window.__remoteStateReload) window.__remoteStateReload();
  } catch(e) {
    console.warn('Falha ao salvar tipo de tarefa no banco:', e);
    alert('Salvei localmente, mas não consegui confirmar no banco. Verifique a conexão/API.');
  }
  closeTaskPointModal();
  renderTaskPoints();
  try { updateTaskDropdown(); updateRetroTaskDropdown(); } catch(e) {}
}

async function deleteTaskPoint(id) {
  if (!confirm('Remover esta tarefa pontuada?')) return;
  const all = getTaskPoints().filter(p=>String(p.id)!==String(id));
  setTaskPoints(all);
  try {
    await remapPersistStateNow('tt_taskpoints_v1', all);
    if (window.__remoteStateReload) window.__remoteStateReload();
  } catch(e) {
    console.warn('Falha ao remover tipo de tarefa no banco:', e);
    alert('Removi localmente, mas não consegui confirmar no banco.');
  }
  renderTaskPoints();
}

// Metas
function renderMetasGrid() {
  const collabs = getCollabs();
  const now = new Date();
  const mk = monthKey(now.getFullYear(), now.getMonth());
  const grid = document.getElementById('metasGrid');

  if (!collabs.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="ei">👥</div>Nenhum colaborador cadastrado.</div>`;
    return;
  }

  const metas = getMetas();

  grid.innerHTML = collabs.map((c) => {
    const metaObj = getMetaForMonth(c.name, mk);
    const m1 = metaObj ? (metaObj.m1 || '—') : '—';
    const m2 = metaObj ? (metaObj.m2 || '—') : '—';
    const m3 = metaObj ? (metaObj.m3 || '—') : '—';

    const pts = Math.max(
      0,
      getCollabPoints(c.name, c.role, now.getFullYear(), now.getMonth()) -
      getCollabDescontos(c.name, now.getFullYear(), now.getMonth())
    );

    const pct = (metaObj && metaObj.m3) ? Math.min((pts / metaObj.m3) * 100, 100) : 0;
    const histCount = Object.keys(metas[c.name] || {}).length;
    const nv = nivelMeta(pts, metaObj);

    return `
      <div class="collab-card">
        <div class="collab-top">
          ${getAvatar(c.name, 38, 11, 14)}
          <div>
            <div class="collab-name">${esc(c.name)}</div>
            <div class="collab-role">${esc(c.role || 'Sem cargo')}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
          <div style="background:rgba(34,197,94,.1);border-radius:8px;padding:8px;text-align:center">
            <div style="color:#22c55e;font-weight:800;font-size:15px">${m1}</div>
            <div style="color:var(--muted);font-size:10px">7%</div>
          </div>
          <div style="background:rgba(79,142,247,.1);border-radius:8px;padding:8px;text-align:center">
            <div style="color:#4f8ef7;font-weight:800;font-size:15px">${m2}</div>
            <div style="color:var(--muted);font-size:10px">14%</div>
          </div>
          <div style="background:rgba(168,85,247,.1);border-radius:8px;padding:8px;text-align:center">
            <div style="color:#a855f7;font-weight:800;font-size:15px">${m3}</div>
            <div style="color:var(--muted);font-size:10px">21%</div>
          </div>
        </div>

        <div style="font-size:12px;color:var(--muted);margin-bottom:6px">
          Pontos atuais:
          <strong style="color:var(--text)">${formatPointsValue(pts)}</strong>
          &nbsp;•&nbsp;
          <span class="nivel-badge ${nv.cls}" style="font-size:10px">${nv.label}</span>
        </div>

        ${histCount > 0
          ? `<div style="font-size:11px;color:var(--muted);margin-bottom:8px">${histCount} mês${histCount > 1 ? 'es' : ''} com meta registrada</div>`
          : `<div style="font-size:11px;color:var(--muted);margin-bottom:8px">Nenhuma meta registrada ainda</div>`
        }

        ${metaObj && metaObj.m3
          ? `<div class="progress-wrap">
              <div class="progress-label">
                <span>Progresso até 21%</span>
                <span>${pct.toFixed(0)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${pct < 60 ? 'ok' : pct < 90 ? 'warn' : 'over'}" style="width:${pct}%"></div>
              </div>
            </div>`
          : ''
        }

        <button class="btn-primary btn-sm" style="width:100%;margin-top:12px" onclick="openMetaModal('${esc(jsStr(c.id))}','${esc(jsStr(c.name))}')">Definir metas</button>
      </div>`;
  }).join('');
}

function openMetaModal(id, name) {
  document.getElementById('metaModal').classList.remove('hidden');
  document.getElementById('metaCollabId').value = id;
  document.getElementById('metaCollabName').textContent = name;

  const sel = document.getElementById('metaMonthSel');
  const now = new Date();
  const opts = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d.getFullYear(), d.getMonth());
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    opts.push(`<option value="${key}">${label}</option>`);
  }
  sel.innerHTML = opts.join('');

  function loadMonth() {
    const existing = getMetaForMonth(name, sel.value);
    document.getElementById('metaM1').value = existing ? (existing.m1 || '') : '';
    document.getElementById('metaM2').value = existing ? (existing.m2 || '') : '';
    document.getElementById('metaM3').value = existing ? (existing.m3 || '') : '';
  }
  loadMonth();
  sel.onchange = loadMonth;

  // Histórico
  const metas = getMetas();
  const history = metas[name] || {};
  const histEl = document.getElementById('metaHistorico');
  const histList = document.getElementById('metaHistoricoList');
  const histEntries = Object.entries(history).sort().reverse();
  if (histEntries.length) {
    histList.innerHTML = histEntries.map(([k, v]) => {
      const [yr, mo] = k.split('-').map(Number);
      const label = new Date(yr, mo-1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const vals = typeof v === 'object' ? `7%: ${v.m1||'—'} / 14%: ${v.m2||'—'} / 21%: ${v.m3||'—'}` : `base: ${v}`;
      return `<div class="summary-item"><span class="si-name">${label}</span><span style="font-size:12px;color:var(--muted-2)">${vals}</span></div>`;
    }).join('');
    histEl.style.display = '';
  } else {
    histEl.style.display = 'none';
  }
}

function closeMetaModal() { document.getElementById('metaModal').classList.add('hidden'); }

async function saveMeta() {
  const id = document.getElementById('metaCollabId')?.value;
  const mk = document.getElementById('metaMonthSel')?.value;

  const m1 = parseInt(document.getElementById('metaM1')?.value, 10) || 0;
  const m2 = parseInt(document.getElementById('metaM2')?.value, 10) || 0;
  const m3 = parseInt(document.getElementById('metaM3')?.value, 10) || 0;

  if (!id) {
    console.warn('[Meta] Nenhum colaborador selecionado.');
    return;
  }

  if (!mk) {
    console.warn('[Meta] Nenhum mês selecionado.');
    return;
  }

  if (!m1 && !m2 && !m3) {
    console.warn('[Meta] Nenhum valor de meta informado.');
    return;
  }

  const collab = getCollabs().find(c =>
    String(c.id) === String(id) || String(c.dbId) === String(id)
  );

  if (!collab) {
    console.error('[Meta] Colaborador não encontrado.', { id });
    return;
  }

  try {
    const payload = {
      colaborador: collab.name,
      mes: mk,
      meta_7: m1,
      meta_14: m2,
      meta_21: m3
    };

    const res = await fetch('api/metas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let json;

    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('[Meta] Resposta inválida da API metas.php.', {
        status: res.status,
        resposta: text
      });
      return;
    }

    if (!res.ok || !json.success) {
      console.error('[Meta] Erro ao salvar meta no banco.', {
        status: res.status,
        resposta: json,
        payload
      });
      return;
    }

    const metas = getMetas();
    if (!metas[collab.name]) metas[collab.name] = {};

    metas[collab.name][mk] = { m1, m2, m3 };
    setMetas(metas);

    if (typeof window.__remoteStateReload === 'function') {
      window.__remoteStateReload();
    }

    closeMetaModal();
    renderMetasGrid();

    console.info('[Meta] Meta salva com sucesso.', {
      colaborador: collab.name,
      mes: mk,
      metas: { m1, m2, m3 }
    });

  } catch (e) {
    console.error('[Meta] Falha inesperada ao salvar meta.', e);
  }
} 

// Descontos
function renderDescontosTable() {
  const descontos = getDescontos();
  const tbody = document.getElementById('descontosTable');
  if (!descontos.length) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="ei"><i class="bi bi-check-square"></i></div>Nenhum desconto aplicado.</div></td></tr>`; return; }
  tbody.innerHTML = descontos.slice().reverse().map(d => `
    <tr class="desconto-row">
      <td>${new Date(d.date).toLocaleDateString('pt-BR')}</td>
      <td>${esc(d.collab)}</td>
      <td>${esc(d.motivo)}</td>
      <td><span class="pts-badge red">-${d.points} pts</span></td>
      <td><button class="btn-dark btn-sm" onclick="deleteDesconto('${d.id}')">Remover</button></td>
    </tr>`).join('');
}

function openDescontoModal() {
  document.getElementById('descontoModal').classList.remove('hidden');
  const sel = document.getElementById('descontoCollab');
  sel.innerHTML = getCollabs().map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
  document.getElementById('descontoMotivo').value = '';
  document.getElementById('descontoPontos').value = '';
}
function closeDescontoModal() { document.getElementById('descontoModal').classList.add('hidden'); }
function saveDesconto() {
  const collab = document.getElementById('descontoCollab').value;
  const motivo = document.getElementById('descontoMotivo').value.trim();
  const points = parseInt(document.getElementById('descontoPontos').value);
  if (!motivo) return alert('Informe o motivo.');
  if (!points || points <= 0) return alert('Informe a quantidade de pontos.');
  const desc = getDescontos();
  desc.push({ id:'desc_'+Date.now(), collab, motivo, points, date: new Date().toISOString() });
  setDescontos(desc);
  closeDescontoModal();
  renderDescontosTable();
}
function deleteDesconto(id) {
  if (!confirm('Remover este desconto?')) return;
  setDescontos(getDescontos().filter(d=>d.id!==id));
  renderDescontosTable();
}