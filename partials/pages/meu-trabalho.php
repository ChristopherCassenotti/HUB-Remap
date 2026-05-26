<!-- ── PAGE: MEU TRABALHO ── -->
<div id="page-mywork" class="page">
    <div class="page-header">
        <h2>Meu trabalho</h2>
        <p>Suas tarefas e horas registradas.</p>
    </div>
    <div class="stats" id="myStats"></div>

    <!-- Horas por cliente este mês -->
    <div class="card" style="margin-bottom:18px">
        <h3><i class="bi bi-person-rolodex"></i> Horas por cliente — este mês</h3>
        <div id="myClientHours" style="margin-top:14px;display:grid;gap:10px"></div>
    </div>

    <div class="card">
        <div class="section-header">
            <h3>Minhas tarefas</h3>
            <div style="display:flex;gap:8px">
                <select id="myPeriodFilter" onchange="renderMyWork()"
                    style="width:auto;padding:8px 12px;font-size:13px">
                    <option value="all">Todos os períodos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mês</option>
                </select>
                <button class="btn-yellow btn-sm" onclick="exportMyCSV()">Exportar</button>
            </div>
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Tarefa</th>
                        <th>Categoria</th>
                        <th>Início</th>
                        <th>Fim</th>
                        <th>Duração</th>
                        <th>Pontos</th>
                    </tr>
                </thead>
                <tbody id="myWorkTable"></tbody>
            </table>
        </div>
    </div>
</div>