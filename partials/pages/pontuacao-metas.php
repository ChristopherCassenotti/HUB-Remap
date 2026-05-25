<!-- ── PAGE: PONTUAÇÃO / METAS (Diretor) ── -->
    <div id="page-pontuacao" class="page">
      <div class="page-header">
        <h2>Pontuação e Metas</h2>
        <p>Configure as tarefas pontuadas por cargo e defina metas individuais para todos os colaboradores.</p>
      </div>

      <div class="tabs" id="pontTabs">
        <div class="tab active" onclick="showPontTab('tarefas')">Tarefas por cargo</div>
        <div class="tab" onclick="showPontTab('metas')">Metas dos colaboradores</div>
        <div class="tab" onclick="showPontTab('descontos')">Descontos de pontos</div>
      </div>

      <!-- Sub: Tarefas -->
      <div id="pontTab-tarefas">
        <div class="section-header">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <select id="pontRoleFilter" onchange="renderTaskPoints()" style="width:auto;padding:8px 14px;font-size:13px">
              <option value="Designer">Designer</option>
              <option value="Social Media">Social Media</option>
              <option value="Editor de Vídeo">Editor de Vídeo / Prod. Visual</option>
              <option value="Filmmaker">Filmmaker</option>
              <option value="Gestor de Tráfego">Gestor de Tráfego</option>
            </select>
            <button class="btn-primary btn-sm" onclick="openTaskPointModal()">+ Criar tipo de tarefa</button>
          </div>
          <span style="font-size:12px;color:var(--muted);font-style:italic">Crie, edite e ajuste a pontuação de cada tipo de tarefa</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tarefa</th><th>Pontos</th><th>Cargo</th><th style="width:180px">Ações</th></tr></thead>
            <tbody id="taskPointsTable"></tbody>
          </table>
        </div>
      </div>

      <!-- Sub: Metas -->
      <div id="pontTab-metas" style="display:none">
        <div class="collab-grid" id="metasGrid" style="margin-top:4px"></div>
      </div>

      <!-- Sub: Descontos -->
      <div id="pontTab-descontos" style="display:none">
        <div class="section-header">
          <div></div>
          <button class="btn-red btn-sm" onclick="openDescontoModal()">+ Aplicar desconto</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Colaborador</th><th>Motivo</th><th>Pontos</th><th></th></tr></thead>
            <tbody id="descontosTable"></tbody>
          </table>
        </div>
      </div>
    </div>
