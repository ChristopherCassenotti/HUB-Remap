const TEAM_ROSTER = [
  { name: 'Renan Morandi',        role: 'Diretor'          },
  { name: 'Gustavo Ferreira',     role: 'Diretor'          },
  { name: 'Jéssica Dahmer',       role: 'Social Media'     },
  { name: 'Irno Dahmer',          role: 'Designer'         },
  { name: 'Mario Junior',         role: 'Designer'         },
  { name: 'André Lisboa',         role: 'Designer'         },
  { name: 'Otavio Pereira',       role: 'Filmmaker'        },
  { name: 'Eduardo Neubauer',     role: 'Filmmaker'        },
  { name: 'Alexandre Damacena',   role: 'Editor de Vídeo'  },
  { name: 'Christopher Cassenoti',role: 'Gestor de Tráfego'},
];

function normalizeLoginText(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getLoginRoster() {
  const savedCollabs = getCollabs();
  const merged = [...TEAM_ROSTER];
  savedCollabs.forEach(c => {
    if (!merged.some(u => normalizeLoginText(u.name) === normalizeLoginText(c.name))) {
      merged.push({ name: c.name, role: c.role || 'Colaborador' });
    }
  });
  return merged;
}

async function login() {
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!name) return alert('Digite o seu nome ou e-mail.');
  if (!pass) return alert('Digite a sua senha.');

  try {
    const payload = name.includes('@') ? { email: name, senha: pass } : { nome: name, senha: pass };
    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); }
    catch(e) {
      console.error('Resposta inválida da API:', raw);
      return alert('Resposta inválida da API. Verifique o arquivo api/login.php.');
    }

    if (!res.ok || !data.success) {
      return alert(data.message || 'Não foi possível entrar.');
    }

    localStorage.setItem('tt_api_token', data.token || '');
    if (window.__remoteStateReload) window.__remoteStateReload();

    seedDemoData();
    currentUser = {
      name: data.user.nome,
      role: data.user.cargo || 'Colaborador',
      email: data.user.email,
      id: data.user.id
    };
    setSession(currentUser);
    openApp();
  } catch (e) {
    console.error('login error:', e);
    alert('Erro ao entrar no sistema: ' + e.message);
  }
}

function logout() {
  clearSession();
  tryLS(() => localStorage.removeItem('tt_api_token'));
  location.reload();
}

function openApp() {
  try {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    const avatarEl = document.getElementById('sidebarAvatar');
    const avatarImg = COLLAB_AVATARS[currentUser.name];
    if (avatarImg) {
      avatarEl.innerHTML = '';
      avatarEl.style.background = 'transparent';
      avatarEl.style.overflow = 'hidden';
      avatarEl.style.padding = '0';
      const img = document.createElement('img');
      img.src = avatarImg;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:10px';
      avatarEl.appendChild(img);
    } else {
      avatarEl.textContent = currentUser.name[0].toUpperCase();
    }
    document.getElementById('sidebarName').textContent = currentUser.name;
    document.getElementById('sidebarRole').textContent = currentUser.role;

    const isDir = currentUser.role === 'Diretor';
    const isSuper = isSupervisor(currentUser.name);
    if (isDir) {
      document.getElementById('directorNav').style.display = '';
    } else {
      document.getElementById('clientsNavCollab').style.display = '';
      if (isSuper) {
        document.getElementById('supervisorNav').style.display = '';
        document.getElementById('sidebarRole').textContent = currentUser.role + ' · Supervisor';
      }
    }

    fillClientDatalist();
    showPage('painel');
    setTimeout(() => {
      try { applyDefaultCategoryFromUserRole('categoryInput'); if (document.querySelectorAll('.task-line-row').length === 0) addTaskLine(); else updateTaskDropdown(); } catch(e) {}
      try { applyDefaultCategoryFromUserRole('rCategoryInput'); updateRetroTaskDropdown(); } catch(e) {}
      try { loadActiveTimersFromDb(true); } catch(e) {}
    }, 0);
  } catch(e) {
    console.error('openApp error:', e);
    alert('Erro ao abrir o app: ' + e.message);
  }
}
function linkifyText(text) {
  if (!text) return '';

  const safe = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return safe.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" style="color:#60a5fa;text-decoration:underline;word-break:break-all;">$1</a>'
  );
}