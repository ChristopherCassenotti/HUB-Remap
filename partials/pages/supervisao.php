<!-- ── PAGE: SUPERVISÃO ── -->
    <div id="page-supervisao" class="page">
      <div class="page-header">
        <h2>Supervisão do grupo</h2>
        <p>Acompanhe, edite e lance tarefas para os colaboradores do seu grupo.</p>
      </div>

      <!-- Group member cards -->
      <div id="supervisaoCards" style="display:grid;gap:16px;margin-bottom:24px"></div>

      <!-- Detail panel: shown when a member is selected -->
      <div id="supervisaoDetail" style="display:none">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">
          <button class="btn-dark btn-sm" onclick="closeSupervisaoDetail()">← Voltar ao grupo</button>
          <div id="supervisaoDetailName" style="font-size:18px;font-weight:800"></div>
          <div id="supervisaoDetailRole" style="font-size:13px;color:var(--muted)"></div>
        </div>

        <!-- Member stats -->
        <div class="stats" id="supervisaoMemberStats" style="margin-bottom:20px"></div>

        <!-- Meta progress -->
        <div class="card" style="margin-bottom:18px">
          <h3>🎯 Metas do mês</h3>
          <div id="supervisaoMetaProgress" style="margin-top:14px"></div>
        </div>

        <!-- Actions row -->
        <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
          <button class="btn-primary btn-sm" onclick="openSupervisaoLancamento()">+ Lançar tarefa</button>
          <button class="btn-red btn-sm" onclick="openSupervisaoDesconto()">− Aplicar desconto</button>
          <select id="supervisaoMemberPeriod" onchange="renderSupervisaoMemberEntries()" style="width:auto;padding:8px 14px;font-size:13px;margin-left:auto">
            <option value="month">Este mês</option>
            <option value="all">Todo o período</option>
          </select>
        </div>

        <!-- Entries table -->
        <div class="card">
          <h3>📋 Tarefas registradas</h3>
          <div class="table-wrap" style="margin-top:12px">
            <table>
              <thead><tr><th>Data</th><th>Cliente</th><th>Tarefa</th><th>Categoria</th><th>Duração</th><th>Pontos</th><th></th></tr></thead>
              <tbody id="supervisaoMemberTable"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
