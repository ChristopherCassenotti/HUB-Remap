<!-- ── PAGE: DASHBOARD (DIRETOR) ── -->
    <div id="page-dashboard" class="page">
      <div class="page-header">
        <h2>Dashboard Geral</h2>
        <p>Visão financeira e operacional completa.</p>
      </div>
      <div class="stats" id="dirStats"></div>

      <div class="filters">
        <div class="filter-group">
          <label for="periodFilter">Período</label>
          <select id="periodFilter" onchange="renderDashboard()">
            <option value="all">Todos</option>
            <option value="today">Hoje</option>
            <option value="week">Semana atual</option>
            <option value="month">Mês atual</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="clientFilter">Cliente</label>
          <select id="clientFilter" onchange="renderDashboard()"><option value="all">Todos</option></select>
        </div>
        <div class="filter-group">
          <label for="userFilter">Colaborador</label>
          <select id="userFilter" onchange="renderDashboard()"><option value="all">Todos</option></select>
        </div>
        <div class="filter-group">
          <label for="roleFilter">Cargo</label>
          <select id="roleFilter" onchange="renderDashboard()"><option value="all">Todos</option></select>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:18px">
        <div class="chart-box">
          <h3>Horas por cliente</h3>
          <canvas id="clientChart"></canvas>
        </div>
        <div class="chart-box">
          <h3>Horas por cargo</h3>
          <canvas id="roleChart"></canvas>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:18px">
        <div class="chart-box">
          <h3>Custo por colaborador (R$)</h3>
          <canvas id="costChart"></canvas>
        </div>
        <div class="chart-box">
          <h3>Horas x Pacote por cliente</h3>
          <canvas id="packageChart"></canvas>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:18px">
        <div class="chart-box">
          <h3>Margem por cliente (R$)</h3>
          <canvas id="marginChart"></canvas>
        </div>
        <div class="chart-box">
          <h3>Comparativo mensal de horas</h3>
          <canvas id="monthlyChart"></canvas>
        </div>
      </div>

      <div class="card" style="margin-bottom:18px">
        <h3>🏆 Ranking de colaboradores — horas este mês</h3>
        <div id="rankingList" class="summary-list" style="margin-top:10px"></div>
      </div>

      <div class="grid-2" style="margin-bottom:18px">
        <div class="card">
          <h3>Resumo semanal</h3>
          <div id="weeklySummary" class="summary-list"></div>
        </div>
        <div class="card">
          <h3>Resumo mensal</h3>
          <div id="monthlySummary" class="summary-list"></div>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <h3>Histórico completo</h3>
          <div style="display:flex;gap:8px">
            <button class="btn-yellow btn-sm" onclick="exportCSV()">Exportar CSV</button>
            <button class="btn-red btn-sm" onclick="clearData()">Limpar dados</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th><th>Colaborador</th><th>Cargo</th><th>Cliente</th>
                <th>Tarefa</th><th>Categoria</th><th>Início</th><th>Fim</th>
                <th>Duração</th><th>Custo (R$)</th>
              </tr>
            </thead>
            <tbody id="entriesTable"></tbody>
          </table>
        </div>
      </div>
    </div>
