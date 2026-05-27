<!-- SIDEBAR -->
<nav class="sidebar">
    <div class="brand">
        <div class="logo" style="background:#000;padding:2px;"><img src="./remap.png"
                style="width:100%;height:100%;object-fit:contain;border-radius:12px;" alt="Remap" /></div>
        <div>
            <h1>HUB Remap</h1>
            <p style="font-size:11px;color:var(--muted)">Interno</p>
        </div>
    </div>
    <style>
    </style>
    <div class="nav-group">
        <div class="nav-label">Geral</div>
        <div class="sidebar-link nav-item active" onclick="showPage('painel')"><i class="bi bi-house"></i> Painel
            pessoal</div>
        <div class="sidebar-link nav-item" onclick="showPage('tarefas')"><i class="bi bi-check-square"></i> Tarefas
        </div>
        <div class="sidebar-link nav-item" onclick="showPage('timer')"><i class="bi bi-stopwatch"></i> Timer</div>
        <div class="sidebar-link nav-item" onclick="showPage('retroativo')"><i class="bi bi-floppy"></i> Registro
            retroativo</div>
        <div class="sidebar-link nav-item" onclick="showPage('mywork')" id="navMywork"><i
                class="bi bi-person-workspace"></i> Meu
            trabalho
        </div>
        <div class="sidebar-link nav-item" onclick="openDesempenho()"><i class="bi bi-trophy"></i> Desempenho</div>
    </div>

    <div class="nav-group" id="directorNav" style="display:none">
        <div class="sidebar-link nav-label">Diretor</div>
        <div class="sidebar-link nav-item" onclick="showPage('dashboard')"><i class="bi bi-graph-up-arrow"></i>
            Dashboard</div>
        <div class="sidebar-link nav-item" onclick="showPage('clients')"><i class="bi bi-building-check"></i>Clientes
        </div>
        <div class="sidebar-link nav-item" onclick="showPage('team')"><i class="bi bi-people"></i> Equipe</div>
        <div class="sidebar-link nav-item" onclick="showPage('pontuacao')"><i class="bi bi-star"></i> Pontuação / Metas
        </div>
    </div>

    <div class="nav-group" id="supervisorNav" style="display:none">
        <div class="nav-label">Supervisão</div>
        <div class="sidebar-link nav-item" onclick="showPage('supervisao')"><i class="bi bi-eye"></i> Meu grupo</div>
    </div>

    <div class="nav-group" id="clientsNavCollab" style="display:none">
        <div class="nav-label">Clientes</div>
        <div class="sidebar-link nav-item" onclick="showPage('clientsCollab')"><i class="bi bi-building-check"></i>Ver
            Clientes
        </div>
    </div>

    <div class="sidebar-footer">
        <div class="user-badge">
            <div class="user-avatar" id="sidebarAvatar"></div>
            <div>
                <div class="name" id="sidebarName"></div>
                <div class="role" id="sidebarRole"></div>
            </div>
        </div>
        <button class="btn-dark btn-sm" style="width:100%" onclick="logout()">Sair</button>
    </div>
</nav>