<!-- ── PAGE: TIMER ── -->
<div id="page-timer" class="page timer-workspace-page active">
    <div class="page-header">
        <h2>Registrar tempo</h2>
        <p>Selecione o cliente, as tarefas executadas e inicie o cronômetro.</p>
    </div>

    <div class="timer-workspace-layout">
        <div class="timer-left-col">
            <div class="timer-card">
                <div class="grid-2">
                    <div>
                        <label for="clientInput">Cliente</label>
                        <input id="clientInput" list="clientList" placeholder="Selecione ou digite..." />
                        <datalist id="clientList"></datalist>
                    </div>
                    <div>
                        <label for="categoryInput">Categoria</label>
                        <select id="categoryInput" onchange="this.dataset.userTouched='1';updateTaskDropdown()">
                            <option value="Design">Design</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Edição de Vídeo">Edição de Vídeo</option>
                            <option value="Filmmaker">Filmmaker</option>
                            <option value="Tráfego Pago">Tráfego Pago</option>
                            <option value="Planejamento">Planejamento</option>
                            <option value="Reunião">Reunião</option>
                            <option value="Atendimento">Atendimento</option>
                            <option value="Direção / Estratégia">Direção / Estratégia</option>
                        </select>
                    </div>
                </div>

                <!-- Tarefas múltiplas -->
                <label style="margin-top:16px">Tarefas executadas</label>
                <div id="taskLinesList" style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px"></div>
                <button type="button" class="btn-dark btn-sm" style="width:auto" onclick="addTaskLine()">+ Adicionar
                    tarefa</button>

                <div style="margin-top:14px">
                    <label for="timerPointMode">Tipo de contagem de pontos</label>
                    <select id="timerPointMode" onchange="updateTaskTotal()">
                        <option value="fixed">Pontos fixos da tarefa</option>
                        <option value="time_30m">Pontos por tempo (+50% a cada 30 min)</option>
                    </select>
                    <div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.4">
                        Exemplo: tarefa de 10 pontos ganha +5 pontos a cada 30 minutos completos.
                    </div>
                </div>

                <div id="taskTotalPreview"
                    style="display:none;margin-top:12px;padding:12px 16px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.25);border-radius:12px">
                    <span style="color:#a855f7;font-weight:700;font-size:14px" id="taskTotalLabel"></span>
                </div>

                <label for="taskInput" style="margin-top:16px">Descrição geral <span
                        style="color:var(--muted);font-weight:400;font-size:11px">(opcional)</span></label>
                <textarea id="taskInput"
                    placeholder="Ex: Artes semana 3 do cliente Buiú, incluindo stories e carrossel..."
                    style="min-height:60px"></textarea>

                <div id="timerEditBar" class="timer-edit-bar">
                    <span>Editando o timer: <strong id="timerEditLabel"></strong></span>
                    <button type="button" class="btn-dark" onclick="cancelTimerEdit()">Cancelar edição</button>
                </div>

                <div class="timer-display-box">
                    <div
                        style="font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em">
                        Cronômetro</div>
                    <div id="timerDisplay" class="timer-display">00:00:00</div>
                    <div id="timerStatus" class="timer-status">Nenhuma tarefa em andamento.</div>
                    <div class="timer-actions" style="grid-template-columns:1fr 1fr 1fr">
                        <button id="startBtn" class="btn-green" onclick="startTimer()">▶ Novo timer</button>
                        <button id="pauseBtn" class="btn-yellow" onclick="pauseTimer()" disabled>⏸ Pausar</button>
                        <button id="stopBtn" class="btn-red" onclick="stopTimer()" disabled>⏹ Finalizar</button>
                    </div>
                </div>

                <div class="multi-timers-panel">
                    <div class="multi-timers-head">
                        <strong>Timers abertos</strong>
                        <span>Você pode pausar um e continuar outro depois.</span>
                    </div>
                    <div id="activeTimersList" class="multi-timers-list">
                        <div class="multi-timer-empty">Nenhum timer aberto no momento.</div>
                    </div>
                </div>
            </div>
        </div>

        <aside class="timer-side-panel">
            <div class="timer-side-head">
                <h3><i class="bi bi-arrow-down-right-circle"></i> Área de apoio</h3>
                <div class="painel-view-switch" aria-label="Tipo de visualização do timer">
                    <span class="painel-view-switch-label">Visualização</span>
                    <button class="painel-view-btn active" id="timerViewModeCalendarClickup"
                        onclick="setTimerSideViewMode('calendar_clickup')">Calendar + ClickUp</button>
                    <button class="painel-view-btn" id="timerViewModeClickup"
                        onclick="setTimerSideViewMode('clickup')">ClickUp</button>
                    <button class="painel-view-btn" id="timerViewModeNone"
                        onclick="setTimerSideViewMode('none')">Nenhuma</button>
                </div>
            </div>

            <div class="timer-side-grid mode-calendar-clickup" id="timerSideGrid">
                <div class="painel-card timer-side-clickup-card">
                    <div class="painel-card-header">
                        <h3><i class="bi bi-folder"></i> ClickUp</h3>
                        <span style="font-size:12px;color:var(--muted)" id="timerClickupActiveLabel"></span>
                    </div>
                    <div class="clickup-embed-holder" id="timerClickupViewer"></div>
                </div>

                <div class="painel-card timer-side-calendar-card">
                    <div class="painel-card-header">
                        <h3><i class="bi bi-calendar-event"></i> Google Agenda</h3>
                        <button class="btn-dark btn-sm" onclick="openCalendarConfig()">⚙ Configurar</button>
                    </div>
                    <div id="timerCalendarArea"></div>
                </div>
            </div>
        </aside>
    </div>
</div>