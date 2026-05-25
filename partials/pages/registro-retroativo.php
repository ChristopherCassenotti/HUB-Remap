<!-- ── PAGE: REGISTRO RETROATIVO ── -->
    <div id="page-retroativo" class="page" style="max-width:700px">
      <div class="page-header">
        <h2>Registro retroativo</h2>
        <p>Cadastre horas trabalhadas em datas e horários passados.</p>
      </div>

      <div class="timer-card">
        <div class="grid-2">
          <div>
            <label for="rClientInput">Cliente</label>
            <input id="rClientInput" list="rClientList" placeholder="Selecione ou digite..." />
            <datalist id="rClientList"></datalist>
          </div>
          <div>
            <label for="rCategoryInput">Categoria</label>
            <select id="rCategoryInput" onchange="this.dataset.userTouched='1';updateRetroTaskDropdown()">
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

        <!-- Tarefas múltiplas no registro retroativo -->
        <label style="margin-top:16px">Tarefas executadas</label>
        <div id="retroTaskLinesList" style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px"></div>
        <button type="button" class="btn-dark btn-sm" style="width:auto" onclick="addRetroTaskLine()">+ Adicionar tarefa</button>

        <div id="retroTaskTotalPreview" style="display:none;margin-top:12px;padding:12px 16px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.25);border-radius:12px">
          <span style="color:#a855f7;font-weight:700;font-size:14px" id="retroTaskTotalLabel"></span>
        </div>

        <div class="grid-2" style="margin-top:14px">
          <div>
            <label for="retroPointMode">Tipo de contagem de pontos</label>
            <select id="retroPointMode" onchange="updateRetroTaskTotal()">
              <option value="fixed">Pontos fixos da tarefa</option>
              <option value="time_30m">Pontos por tempo (+50% a cada 30 min)</option>
            </select>
          </div>
          <div style="display:flex;align-items:flex-end;color:var(--muted);font-size:12px;line-height:1.4;padding-bottom:8px">
            No modo por tempo, a cada 30 minutos completos soma metade do valor base novamente.
          </div>
        </div>

        <label for="rTaskInput" style="margin-top:14px">Descrição geral <span style="color:var(--muted);font-weight:400;font-size:11px">(opcional)</span></label>
        <textarea id="rTaskInput" placeholder="Detalhes adicionais sobre a tarefa..."></textarea>

        <div style="margin-top:18px;padding:18px;background:var(--bg);border:1px solid var(--border);border-radius:14px">
          <div style="font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px">📅 Data e horário</div>

          <div class="grid-2">
            <div>
              <label for="rDate">Data</label>
              <input id="rDate" type="date" />
            </div>
            <div></div>
          </div>

          <div style="margin-top:4px">
            <div style="font-size:12px;color:var(--muted-2);font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin:14px 0 10px">Como prefere informar o tempo?</div>
            <div class="tabs" id="retroTabs">
              <div class="tab active" onclick="switchRetroMode('horario')">Horário de início/fim</div>
              <div class="tab" onclick="switchRetroMode('duracao')">Duração total</div>
            </div>
          </div>

          <!-- Modo horário -->
          <div id="retroModeHorario">
            <div class="grid-2">
              <div>
                <label for="rStart">Horário de início</label>
                <input id="rStart" type="time" />
              </div>
              <div>
                <label for="rEnd">Horário de fim</label>
                <input id="rEnd" type="time" />
              </div>
            </div>
            <div id="rDurationPreview" style="margin-top:10px;font-size:13px;color:var(--muted);min-height:20px"></div>
          </div>

          <!-- Modo duração -->
          <div id="retroModeDuracao" style="display:none">
            <div class="grid-2">
              <div>
                <label for="rHours">Horas</label>
                <input id="rHours" type="number" min="0" max="24" placeholder="0" />
              </div>
              <div>
                <label for="rMinutes">Minutos</label>
                <input id="rMinutes" type="number" min="0" max="59" placeholder="0" />
              </div>
            </div>
            <div style="margin-top:10px">
              <label for="rStartOnly">Horário de início (opcional)</label>
              <input id="rStartOnly" type="time" placeholder="Deixe em branco para usar 00:00" />
            </div>
          </div>
        </div>

        <div id="rFeedback" style="margin-top:12px;font-size:13px;min-height:20px"></div>
        <button class="btn-primary" style="margin-top:16px" onclick="saveRetroativo()">✓ Salvar registro</button>
      </div>

      <!-- Últimos registros retroativos desta sessão -->
      <div class="card" style="margin-top:20px">
        <h3>Registros retroativos adicionados</h3>
        <div class="table-wrap" style="margin-top:12px">
          <table>
            <thead>
              <tr>
                <th>Data</th><th>Cliente</th><th>Tarefa</th><th>Início</th><th>Fim</th><th>Duração</th><th></th>
              </tr>
            </thead>
            <tbody id="retroTable"></tbody>
          </table>
        </div>
      </div>
    </div>
