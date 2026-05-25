<!-- ── PAGE: TAREFAS ── -->
    <div id="page-tarefas" class="page kanban-page">
      <div class="kanban-page-header">
        <div>
          <h2 style="font-size:22px;font-weight:800">Tarefas</h2>
          <p style="font-size:13px;color:var(--muted);margin-top:2px">Organize e delegue tarefas no board.</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div class="kanban-filter-bar" id="kFilterBar">
            <span class="kfb-chip active" onclick="setKFilter('all',this)">Todas</span>
            <span class="kfb-chip" onclick="setKFilter('mine',this)">Minhas</span>
            <span class="kfb-chip" onclick="setKFilter('today',this)">Hoje</span>
            <span class="kfb-chip" onclick="setKFilter('overdue',this)">Atrasadas</span>
          </div>
          <button class="btn-dark btn-sm" onclick="openNewColModal()">+ Seção</button>
        </div>
      </div>
      <div class="kanban-board" id="kanbanBoard"></div>
    </div>
