<!-- ══════════════ DESEMPENHO — PÁGINA SEPARADA ══════════════ -->
<div id="desempenhoPage" class="hidden"
    style="position:fixed;inset:0;background:var(--bg);z-index:200;overflow-y:auto;">
    <div style="max-width:1100px;margin:0 auto;padding:28px 32px">

        <!-- Header -->
        <div
            style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:14px">
                <div class="logo" style="font-size:20px"><i class="bi bi-trophy-fill" style="color:	#f4cd2a;"></i>
                </div>
                <div>
                    <h1 style="font-size:22px;font-weight:800">Desempenho</h1>
                    <p id="desempenhoSubtitle" style="font-size:13px;color:var(--muted);margin-top:2px">Suas metas,
                        pontos e evolução.</p>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
                <div id="desempenhoUserPill"
                    style="background:var(--surface-2);border:1px solid var(--border);border-radius:99px;padding:8px 14px;font-size:13px;color:var(--muted-2)">
                </div>
                <button class="btn-dark btn-sm" onclick="closeDesempenho()">← Voltar</button>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tabs" id="desempenhoTabs" style="margin-bottom:24px">
            <div class="tab active" onclick="showDesTab('meu')">Meu desempenho</div>
            <div class="tab" id="desTabEquipe" style="display:none" onclick="showDesTab('equipe')">Equipe</div>
            <div class="tab" onclick="showDesTab('tabela')">Tabela de pontos</div>
        </div>

        <!-- ─ MEU DESEMPENHO ─ -->
        <div id="desTab-meu">
            <div class="stats" id="desempenhoStats" style="margin-bottom:22px"></div>

            <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
                <label style="margin:0;font-size:12px;color:var(--muted-2)">Período:</label>
                <select id="desPeriodSel" onchange="renderDesempenho()"
                    style="width:auto;padding:8px 14px;font-size:13px">
                    <option value="current">Mês atual</option>
                    <option value="last">Mês anterior</option>
                    <option value="all">Todo o período</option>
                </select>
            </div>

            <div class="card" style="margin-bottom:18px">
                <h3><i class="bi bi-bar-chart"></i> Progresso das metas</h3>
                <div id="metaProgress" style="margin-top:14px"></div>
            </div>

            <div class="grid-2" style="margin-bottom:18px">
                <div class="card" id="rankingCard">
                    <h3><i class="bi bi-trophy" style="color:yellow;"></i> Ranking — pontos este mês</h3>
                    <div id="rankingPontos" class="summary-list" style="margin-top:10px"></div>
                </div>
                <div class="card">
                    <h3><i class="bi bi-calendar-event"></i> Comparativo semanal</h3>
                    <div id="semanalPontos" class="summary-list" style="margin-top:10px"></div>
                </div>
            </div>

            <div class="card" style="margin-bottom:18px">
                <h3><i class="bi bi-graph-up"></i> Evolução mensal de pontos</h3>
                <canvas id="pontosMonthChart" style="max-height:240px;margin-top:12px"></canvas>
            </div>

            <div class="card">
                <h3><i class="bi bi-clipboard2-data"></i> Tarefas e pontos — mês atual</h3>
                <div class="table-wrap" style="margin-top:12px">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Tarefa</th>
                                <th>Pontos</th>
                            </tr>
                        </thead>
                        <tbody id="myPontosTable"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ─ EQUIPE ─ -->
        <div id="desTab-equipe" style="display:none">
            <div
                style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
                <select id="desEquipeMes" onchange="renderEquipeDesempenho()"
                    style="width:auto;padding:8px 14px;font-size:13px">
                    <option value="current">Mês atual</option>
                    <option value="last">Mês anterior</option>
                    <option value="all">Todo o período</option>
                </select>
                <span style="font-size:12px;color:var(--muted)">Atualizado em tempo real com os registros do
                    sistema</span>
            </div>

            <!-- Evolução em tempo real — cards grandes por colaborador -->
            <div id="equipeEvolutionCards" style="display:grid;gap:16px;margin-bottom:24px"></div>

            <!-- Tabela comparativa -->
            <div class="card" style="margin-bottom:18px">
                <h3>📊 Tabela comparativa</h3>
                <div class="table-wrap" style="margin-top:12px">
                    <table>
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Cargo</th>
                                <th>Tarefas</th>
                                <th>Pts brutos</th>
                                <th>Descontos</th>
                                <th>Pts líquidos</th>
                                <th>Meta 7%</th>
                                <th>Meta 14%</th>
                                <th>Meta 21%</th>
                                <th>Nível</th>
                            </tr>
                        </thead>
                        <tbody id="equipeDesempenhoTable"></tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <h3>📈 Comparativo mensal da equipe</h3>
                <canvas id="equipeMonthChart" style="max-height:280px;margin-top:12px"></canvas>
            </div>
        </div>

        <!-- ─ TABELA DE PONTOS ─ -->
        <div id="desTab-tabela" style="display:none">
            <div style="margin-bottom:16px">
                <select id="desTabelaRole" onchange="renderTabelaPontos()"
                    style="width:auto;padding:8px 14px;font-size:13px">
                    <option value="Designer">Designer</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Editor de Vídeo">Editor de Vídeo / Prod. Visual</option>
                    <option value="Filmmaker">Filmmaker</option>
                    <option value="Gestor de Tráfego">Gestor de Tráfego</option>
                </select>
            </div>
            <div class="card">
                <p style="font-size:12px;color:var(--muted);margin-bottom:14px">Pontos são atribuídos automaticamente
                    com base na descrição da tarefa registrada.</p>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Tarefa</th>
                                <th style="width:140px">Pontuação</th>
                            </tr>
                        </thead>
                        <tbody id="desTabelaBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
</div>
<div id="taskPointModal" class="modal-overlay hidden">
    <div class="modal">
        <h3 id="taskPointModalTitle">Nova tarefa pontuada</h3>
        <input type="hidden" id="tpId" />
        <label>Nome da tarefa</label>
        <input id="tpName" placeholder="Ex: Criação de carrossel" />
        <label>Cargo</label>
        <select id="tpRole">
            <option value="Designer">Designer</option>
            <option value="Social Media">Social Media</option>
            <option value="Editor de Vídeo">Editor de Vídeo / Prod. Visual</option>
            <option value="Filmmaker">Filmmaker</option>
            <option value="Gestor de Tráfego">Gestor de Tráfego</option>
            <option value="Todos">Todos os cargos</option>
        </select>
        <label>Pontos</label>
        <input id="tpPoints" type="number" min="1" placeholder="Ex: 15" />
        <div class="modal-actions">
            <button class="btn-dark" onclick="closeTaskPointModal()">Cancelar</button>
            <button class="btn-primary" onclick="saveTaskPoint()">Salvar</button>
        </div>
    </div>
</div>