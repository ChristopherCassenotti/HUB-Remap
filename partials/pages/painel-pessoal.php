<!-- ── PAGE: PAINEL PESSOAL ── -->
    <div id="page-painel" class="page active">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 id="painelGreeting" style="font-size:22px;font-weight:800">Bom dia! 👋</h2>
          <p style="color:var(--muted);font-size:13px;margin-top:2px" id="painelDate"></p>
        </div>
        <div class="painel-view-switch" aria-label="Tipo de visualização do painel">
          <span class="painel-view-switch-label">Visualização</span>
          <button class="painel-view-btn active" id="viewModeCalendarClickup" onclick="setPainelViewMode('calendar_clickup')">Calendar + ClickUp</button>
          <button class="painel-view-btn" id="viewModeClickup" onclick="setPainelViewMode('clickup')">ClickUp</button>
        </div>
      </div>

      <div class="painel-grid mode-calendar-clickup" id="painelGrid">
        <!-- COL 1: Atalhos -->
        <div class="painel-card painel-col-shortcuts">
          <div class="painel-card-header">
            <h3>🔗 Atalhos</h3>
            <button class="btn-primary btn-sm" onclick="openShortcutModal()">+ Adicionar</button>
          </div>
          <div class="shortcut-search">
            <input id="shortcutSearch" placeholder="Filtrar..." oninput="renderShortcuts()" />
            <input id="googleSearch" placeholder="🔍 Google..." onkeydown="if(event.key==='Enter')window.open('https://google.com/search?q='+encodeURIComponent(this.value),'_blank')" style="flex:1;font-size:13px;padding:8px 12px;border-radius:10px" />
          </div>
          <div class="shortcut-list" id="shortcutList"></div>
        </div>

        <!-- COL 2: Tarefas pessoais e delegadas -->
        <div class="painel-card painel-col-tasks">
          <div class="painel-card-header">
            <h3 id="painelTasksTitle">📌 Tarefas pessoais</h3>
            <span style="font-size:12px;color:var(--muted)" id="personalTaskCount"></span>
          </div>

          <div class="painel-tasks-grid">
            <div class="painel-task-col">
              <div class="painel-task-col-head">
                <h4>📌 Tarefas pessoais</h4>
                <span id="personalOnlyTaskCount"></span>
              </div>
              <div class="pt-list-scroll" id="personalTaskList"></div>

              <!-- Smart add form -->
              <div class="task-add-box">
                <input id="personalTaskInput"
                  placeholder='Ex: "Reunião hoje" ou "Ligar amanhã"'
                  style="border:0;background:transparent;color:var(--text);font-size:13px;width:100%;outline:none;font-family:'DM Sans',sans-serif"
                  oninput="ptSmartParse()" onkeydown="if(event.key==='Enter')addPersonalTask()" />
                <div class="smart-date-preview" id="ptDatePreview"></div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                  <select id="ptPriority" style="width:auto;padding:4px 8px;font-size:12px;border-radius:8px">
                    <option value="">Prioridade</option>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Média</option>
                    <option value="baixa">🔵 Baixa</option>
                  </select>
                  <input id="ptDate" type="date" style="width:auto;padding:4px 8px;font-size:12px;border-radius:8px" title="Ou escreva no título: hoje, amanhã..." />
                  <button class="btn-primary btn-sm" style="margin-left:auto" onclick="addPersonalTask()">+ Adicionar</button>
                </div>
              </div>
              <p style="font-size:11px;color:var(--muted);margin-top:8px">Apenas você vê estas tarefas.</p>
            </div>

            <div class="painel-task-col" id="delegatedTasksPanel">
              <div class="painel-task-col-head">
                <h4>📬 Tarefas delegadas</h4>
                <span id="delegatedTaskCount"></span>
              </div>
              <div class="pt-list-scroll" id="delegatedTaskList"></div>
            </div>

            <div class="painel-task-col painel-clickup-col" id="clickupTasksPanel" style="display:none">
              <div class="painel-task-col-head">
                <h4>🗂️ ClickUp</h4>
                <span id="clickupTaskActiveLabel"></span>
              </div>
              <div class="clickup-embed-holder" id="clickupTaskViewer"></div>
            </div>

            <div class="painel-task-col painel-notes-inline-col" id="notesTasksPanel" style="display:none">
              <div class="painel-task-col-head">
                <h4>📝 Notas do dia</h4>
                <span>salvo automático</span>
              </div>
              <textarea class="notes-area" id="painelNotesInline" placeholder="Suas anotações do dia..." oninput="saveNotes(this)" style="flex:1;min-height:330px"></textarea>
              <button class="btn-dark btn-sm" style="margin-top:10px;align-self:flex-end" onclick="clearNotes()">Limpar notas</button>
            </div>
          </div>
        </div>

        <!-- COL 3: Notas -->
        <div class="painel-card painel-col-notes" style="display:flex;flex-direction:column">
          <div class="painel-card-header">
            <h3>📝 Notas do dia</h3>
            <button class="btn-dark btn-sm" onclick="clearNotes()">Limpar</button>
          </div>
          <textarea class="notes-area" id="painelNotes" placeholder="Suas anotações do dia..." oninput="saveNotes(this)" style="flex:1;min-height:220px"></textarea>
          <p style="font-size:11px;color:var(--muted);margin-top:8px;border-top:1px solid var(--border);padding-top:8px">Notas salvas automaticamente na sessão.</p>
        </div>

        <!-- TOP: ClickUp (modo ClickUp) -->
        <div class="painel-card painel-col-clickup-top" id="painelClickupTopCard" style="display:none">
          <div class="painel-card-header">
            <h3>🗂️ ClickUp</h3>
            <span style="font-size:12px;color:var(--muted)" id="clickupTopActiveLabel"></span>
          </div>
          <div class="clickup-embed-holder" id="clickupTopViewer"></div>
        </div>

        <!-- FULL WIDTH: Google Agenda (menor) -->
        <div class="painel-card painel-col-cal">
          <div class="painel-card-header">
            <h3>📅 Google Agenda</h3>
            <button class="btn-dark btn-sm" onclick="openCalendarConfig()">⚙ Configurar</button>
          </div>
          <div id="calendarArea">
            <div style="text-align:center;padding:18px;color:var(--muted)">
              <div style="font-size:28px;margin-bottom:10px">📅</div>
              <p style="font-size:13px;margin-bottom:12px">Conecte seu Google Agenda para visualizá-lo aqui.</p>
              <button class="btn-primary btn-sm" onclick="openCalendarConfig()">Conectar agora</button>
            </div>
          </div>
        </div>
      </div>
    </div>
