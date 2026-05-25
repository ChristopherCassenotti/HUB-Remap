<!-- ── MODAL: META COLABORADOR ── -->
<div id="metaModal" class="modal-overlay hidden">
  <div class="modal">
    <h3>Configurar metas de pontos</h3>
    <input type="hidden" id="metaCollabId" />
    <p id="metaCollabName" style="color:var(--accent);font-weight:700;font-size:15px"></p>
    <label>Mês de referência</label>
    <select id="metaMonthSel"></select>
    <div style="margin-top:18px;display:grid;gap:12px">
      <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:12px;padding:14px">
        <div style="font-size:12px;font-weight:700;color:#22c55e;margin-bottom:8px">🥉 META 7% — Nível Bronze</div>
        <input id="metaM1" type="number" placeholder="Ex: 4494" style="border-color:rgba(34,197,94,.3)" />
        <div style="font-size:11px;color:var(--muted);margin-top:5px">Pontuação mínima para atingir o bônus de 7%</div>
      </div>
      <div style="background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.2);border-radius:12px;padding:14px">
        <div style="font-size:12px;font-weight:700;color:#4f8ef7;margin-bottom:8px">🥈 META 14% — Nível Prata</div>
        <input id="metaM2" type="number" placeholder="Ex: 4788" style="border-color:rgba(79,142,247,.3)" />
        <div style="font-size:11px;color:var(--muted);margin-top:5px">Pontuação mínima para atingir o bônus de 14%</div>
      </div>
      <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:12px;padding:14px">
        <div style="font-size:12px;font-weight:700;color:#a855f7;margin-bottom:8px">🥇 META 21% — Nível Ouro</div>
        <input id="metaM3" type="number" placeholder="Ex: 5082" style="border-color:rgba(168,85,247,.3)" />
        <div style="font-size:11px;color:var(--muted);margin-top:5px">Pontuação mínima para atingir o bônus de 21%</div>
      </div>
    </div>
    <div id="metaHistorico" style="margin-top:16px;display:none">
      <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Histórico de metas</div>
      <div id="metaHistoricoList" class="summary-list"></div>
    </div>
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeMetaModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveMeta()">Salvar metas</button>
    </div>
  </div>
</div>

<!-- ── MODAL: DESCONTO ── -->
<div id="descontoModal" class="modal-overlay hidden">
  <div class="modal">
    <h3>Aplicar desconto de pontos</h3>
    <p>Informe o colaborador, motivo e quantidade de pontos a descontar.</p>
    <label>Colaborador</label>
    <select id="descontoCollab"></select>
    <label>Motivo</label>
    <input id="descontoMotivo" placeholder="Ex: Não incluiu artes no ClickUp no prazo" />
    <label>Pontos a descontar</label>
    <input id="descontoPontos" type="number" min="1" placeholder="Ex: 20" />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeDescontoModal()">Cancelar</button>
      <button class="btn-red" onclick="saveDesconto()">Aplicar desconto</button>
    </div>
  </div>
</div>

<!-- ══ SHORTCUT MODAL ══ -->
<div id="shortcutModal" class="modal-overlay hidden">
  <div class="modal" style="max-width:420px">
    <h3 id="shortcutModalTitle">Novo atalho</h3>
    <input type="hidden" id="scId" />
    <label>Nome</label>
    <input id="scName" placeholder="Ex: ClickUp, WhatsApp, Drive..." />
    <label>Descrição <span style="color:var(--muted);font-size:11px">(opcional)</span></label>
    <input id="scDesc" placeholder="Ex: Gerenciamento de tarefas" />
    <label>URL</label>
    <input id="scUrl" placeholder="https://..." />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeShortcutModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveShortcut()">Salvar</button>
    </div>
  </div>
</div>

<!-- ══ CALENDAR CONFIG MODAL ══ -->
<div id="calendarModal" class="modal-overlay hidden">
  <div class="modal" style="max-width:500px">
    <h3>📅 Conectar Google Agenda</h3>
    <p style="color:var(--muted);font-size:13px;margin-bottom:12px">Cole o link de incorporação do seu Google Agenda abaixo.</p>
    <div style="background:var(--surface-2);border-radius:12px;padding:14px;font-size:12px;color:var(--muted-2);margin-bottom:14px;line-height:1.7">
      <strong style="color:var(--text)">Como obter o link:</strong><br>
      1. Acesse <strong>calendar.google.com</strong><br>
      2. Clique em ⚙ Configurações → seu calendário<br>
      3. Role até <strong>"Integrar agenda"</strong><br>
      4. Copie o link do campo <strong>"Link HTML público"</strong> e cole abaixo
    </div>
    <label>Link de incorporação (src do iframe)</label>
    <input id="calendarUrl" placeholder="https://calendar.google.com/calendar/embed?src=..." />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeCalendarConfig()">Cancelar</button>
      <button class="btn-primary" onclick="saveCalendarConfig()">Conectar</button>
    </div>
  </div>
</div>

<!-- ══ TASK DETAIL MODAL ══ -->
<div id="taskModalOverlay" class="task-modal-overlay hidden" onclick="closeTaskModalIfOutside(event)">
  <div class="task-modal" id="taskModalPanel" onclick="event.stopPropagation()">
    <!-- Header -->
    <div class="task-modal-header">
      <div class="task-modal-breadcrumb">
        <span id="tmBreadSection" style="color:var(--accent)"></span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="task-modal-nav">
          <button onclick="navTask(-1)" title="Anterior">↑</button>
          <button onclick="navTask(1)" title="Próximo">↓</button>
        </div>
        <button onclick="closeTaskModal()" style="background:transparent;border:0;color:var(--muted);cursor:pointer;width:auto;padding:5px 8px;border-radius:6px;font-size:18px">✕</button>
      </div>
    </div>

    <div class="task-modal-inner">
      <!-- Left: content -->
      <div class="task-modal-left">
        <!-- Check + title -->
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
          <div id="tmCheck" class="task-check" style="width:22px;height:22px;margin-top:4px" onclick="toggleTaskDoneModal()"></div>
          <div style="flex:1">
            <input id="tmTitle" class="task-title-input" placeholder="Nome da tarefa..." oninput="saveTaskFromModal()" />
<textarea 
  id="tmDesc" 
  class="task-desc-input hidden" 
  placeholder="Descrição..." 
  rows="3" 
  oninput="saveTaskFromModal(false)"
  onblur="finishEditTmDesc()"></textarea>

<div 
  id="tmDescPreview"
  onclick="editTmDesc()"
  title="Clique para editar a descrição"
  style="font-size:13px;line-height:1.6;color:var(--muted-2);white-space:pre-wrap;cursor:pointer;min-height:20px">
</div>

<button 
  type="button"
  onclick="editTmDesc()" 
  style="width:auto;background:transparent;color:var(--accent);padding:4px 0;font-size:12px;margin-top:6px">
  ✏️ Editar descrição
</button>       
</div>
        </div>

        <!-- Subtasks -->
        <div class="subtasks-section">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:13px;font-weight:700">Subtarefas</span>
            <span id="tmSubCount" style="font-size:11px;color:var(--muted)"></span>
          </div>
          <div id="tmSubList"></div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding:6px 0;border-bottom:1px solid var(--border)">
            <div class="subtask-check"></div>
            <input id="tmNewSub" class="subtask-input" placeholder="Adicionar subtarefa..." onkeydown="if(event.key==='Enter')addSubtask()" style="color:var(--muted)" />
            <button onclick="addSubtask()" class="btn-dark btn-sm" style="width:auto;padding:4px 10px;font-size:12px">+</button>
          </div>
        </div>

        <!-- Attachments -->
        <div style="margin-top:24px">
          <div style="font-size:13px;font-weight:700;margin-bottom:10px">Anexos</div>
          <div class="attach-list" id="tmAttachList"></div>
          <label style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--muted-2)">
            📎 Adicionar arquivo
            <input type="file" accept="image/*,application/pdf" multiple style="display:none" onchange="handleAttachment(event)" />
          </label>
        </div>

        <!-- Comments -->
        <div class="comments-section">
          <div style="font-size:13px;font-weight:700;margin-bottom:10px">Comentários</div>
          <div id="tmCommentList"></div>
          <div class="comment-input-row">
            <div style="width:28px;height:28px;border-radius:8px;overflow:hidden;flex-shrink:0" id="tmCommentAvatar"></div>
            <textarea id="tmCommentInput" class="comment-box" placeholder="Comentar..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();addComment()}"></textarea>
            <button class="btn-primary btn-sm" onclick="addComment()" style="width:auto;align-self:flex-end">Enviar</button>
          </div>
        </div>
      </div>

      <!-- Right: properties -->
      <div class="task-modal-right">
        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">Propriedades</div>

        <!-- Seção -->
        <div class="task-prop-row" onclick="openSectionPicker()">
          <span class="task-prop-label">Seção</span>
          <span class="task-prop-value" id="tmSection">—</span>
        </div>

        <!-- Responsável -->
        <div class="task-prop-row" onclick="openAssigneePicker()">
          <span class="task-prop-label">Responsável</span>
          <div class="task-prop-value" id="tmAssignee">—</div>
        </div>

        <!-- Data -->
        <div class="task-prop-row" onclick="openNativeDatePicker('tmDate', event)">
          <span class="task-prop-label">Data</span>
          <input type="date" id="tmDate" style="border:0;background:transparent;color:var(--accent);font-size:12px;cursor:pointer;outline:none;font-family:'DM Sans',sans-serif" onclick="event.stopPropagation()" onchange="saveTaskFromModal()" />
        </div>

        <!-- Prazo -->
        <div class="task-prop-row" onclick="openNativeDatePicker('tmDeadline', event)">
          <span class="task-prop-label">Prazo</span>
          <input type="date" id="tmDeadline" style="border:0;background:transparent;color:var(--muted-2);font-size:12px;cursor:pointer;outline:none;font-family:'DM Sans',sans-serif" onclick="event.stopPropagation()" onchange="saveTaskFromModal()" />
        </div>

        <!-- Prioridade -->
        <div class="task-prop-row" onclick="cyclePriority()">
          <span class="task-prop-label">Prioridade</span>
          <span class="task-prop-value" id="tmPriority">—</span>
        </div>

        <!-- Recorrência -->
        <div class="task-prop-row" onclick="cycleRecurrence()">
          <span class="task-prop-label">Recorrência</span>
          <span class="task-prop-value" id="tmRecurrence">—</span>
        </div>

        <!-- Etiquetas -->
        <div class="task-prop-row" onclick="openLabelPicker()">
          <span class="task-prop-label">Etiquetas</span>
          <span class="task-prop-value" id="tmLabels">+ Adicionar</span>
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
          <button class="btn-red btn-sm" style="width:100%" onclick="deleteCurrentTask()">🗑 Excluir tarefa</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Pickers (section, assignee, label) -->
<div id="kPicker" class="hidden" onclick="event.stopPropagation()" style="position:fixed;z-index:400;background:var(--surface);border:1px solid var(--border-strong);border-radius:14px;padding:10px;min-width:200px;box-shadow:0 20px 60px rgba(0,0,0,.4)">
  <div id="kPickerContent"></div>
</div>

<!-- New column modal -->
<div id="newColModal" class="modal-overlay hidden">
  <div class="modal" style="max-width:380px">
    <h3>Nova seção</h3>
    <label>Nome da seção</label>
    <input id="newColName" placeholder="Ex: Design, Social Media, Vídeos..." />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeNewColModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveNewCol()">Criar seção</button>
    </div>
  </div>
</div>

<!-- New task quick modal -->
<div id="newTaskModal" class="modal-overlay hidden">
  <div class="modal" style="max-width:480px">
    <h3>Nova tarefa</h3>
    <label>Título</label>
    <input id="ntTitle" placeholder="Nome da tarefa..." />
    <label>Seção</label>
    <select id="ntSection"></select>
    <label>Responsável</label>
    <select id="ntAssignee"></select>
    <label>Data</label>
    <input id="ntDate" type="date" />
    <label>Prioridade</label>
    <select id="ntPriority">
      <option value="4">Sem prioridade</option>
      <option value="3">🔵 Baixa</option>
      <option value="2">🟡 Média</option>
      <option value="1">🔴 Alta</option>
    </select>
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeNewTaskModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveNewTask()">Criar tarefa</button>
    </div>
  </div>
</div>

<!-- ── MODAL: SUPERVISÃO — LANÇAR TAREFA ── -->
<div id="supervisaoLancamentoModal" class="modal-overlay hidden">
  <div class="modal">
    <h3>Lançar tarefa</h3>
    <p id="supervisaoLancamentoFor" style="color:var(--accent);font-weight:700;font-size:14px;margin-bottom:4px"></p>
    <label>Cliente</label>
    <input id="slClient" list="slClientList" placeholder="Selecione ou digite..." />
    <datalist id="slClientList"></datalist>
    <label>Categoria</label>
    <select id="slCategory" onchange="updateSLTaskDropdown()">
      <option value="Design">Design</option>
      <option value="Social Media">Social Media</option>
      <option value="Edição de Vídeo">Edição de Vídeo</option>
      <option value="Filmmaker">Filmmaker</option>
      <option value="Tráfego Pago">Tráfego Pago</option>
      <option value="Planejamento">Planejamento</option>
      <option value="Reunião">Reunião</option>
      <option value="Atendimento">Atendimento</option>
    </select>
    <label>Tarefa</label>
    <select id="slTask" onchange="updateSLPointsPreview()">
      <option value="">— Selecione —</option>
    </select>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">
      <div>
        <label>Quantidade</label>
        <input id="slQty" type="number" min="1" max="99" value="1" oninput="updateSLPointsPreview()" />
      </div>
      <div>
        <label>Data</label>
        <input id="slDate" type="date" />
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>
        <label>Início</label>
        <input id="slStart" type="time" value="09:00" />
      </div>
      <div>
        <label>Fim</label>
        <input id="slEnd" type="time" value="10:00" />
      </div>
    </div>
    <label>Descrição <span style="color:var(--muted);font-size:11px">(opcional)</span></label>
    <input id="slDesc" placeholder="Detalhes adicionais..." />
    <div id="slPointsPreview" style="display:none;margin-top:10px;padding:10px 14px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.25);border-radius:10px;font-size:13px;color:#a855f7;font-weight:700"></div>
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeSupervisaoLancamento()">Cancelar</button>
      <button class="btn-primary" onclick="saveSupervisaoLancamento()">Salvar</button>
    </div>
  </div>
</div>

<!-- ── MODAL: SUPERVISÃO — DESCONTO ── -->
<div id="supervisaoDescontoModal" class="modal-overlay hidden">
  <div class="modal">
    <h3>Aplicar desconto de pontos</h3>
    <p id="supervisaoDescontoFor" style="color:var(--accent);font-weight:700;font-size:14px;margin-bottom:4px"></p>
    <label>Motivo</label>
    <input id="sdMotivo" placeholder="Ex: Não incluiu artes no ClickUp no prazo" />
    <label>Pontos a descontar</label>
    <input id="sdPontos" type="number" min="1" placeholder="Ex: 20" />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeSupervisaoDesconto()">Cancelar</button>
      <button class="btn-red" onclick="saveSupervisaoDesconto()">Aplicar desconto</button>
    </div>
  </div>
</div>

<!-- ── MODAL: EDITAR ENTRADA (supervisor) ── -->
<div id="editEntryModal" class="modal-overlay hidden">
  <div class="modal">
    <h3>Editar registro</h3>
    <input type="hidden" id="editEntryId" />
    <label>Tarefa</label>
    <input id="editEntryTask" />
    <label>Pontos</label>
    <input id="editEntryPoints" type="number" min="0" />
    <label>Descrição</label>
    <input id="editEntryDesc" />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeEditEntryModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveEditEntry()">Salvar</button>
    </div>
  </div>
</div>

<!-- ── MODAL: CLIENTE ── -->
<div id="clientModal" class="modal-overlay hidden">
  <div class="modal">
    <h3 id="clientModalTitle">Novo cliente</h3>
    <p>Preencha as informações do cliente.</p>
    <input type="hidden" id="clientModalId" />
    <label>Nome do cliente</label>
    <input id="cmName" placeholder="Ex: Buiú Veículos" />
    <label>Valor mensal do plano (R$)</label>
    <input id="cmValue" type="number" placeholder="Ex: 2500" />
    <label>Horas mensais incluídas no pacote</label>
    <input id="cmHours" type="number" placeholder="Ex: 40 (deixe 0 se ilimitado)" />
    <label>Observações</label>
    <textarea id="cmNotes" placeholder="Informações relevantes sobre o cliente..."></textarea>
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeClientModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveClient()">Salvar cliente</button>
    </div>
  </div>
</div>

<!-- ── MODAL: COLABORADOR ── -->
<div id="collabModal" class="modal-overlay hidden">
  <div class="modal">
    <h3 id="collabModalTitle">Cadastrar colaborador</h3>
    <p>Informe os dados para cálculo de custo/hora.</p>
    <input type="hidden" id="collabModalId" />
    <label>Nome do colaborador</label>
    <input id="colName" placeholder="Ex: Maria Souza" />
    <label>Cargo</label>
    <select id="colRole">
      <option>Designer</option>
      <option>Social Media</option>
      <option>Editor de Vídeo</option>
      <option>Filmmaker</option>
      <option>Gestor de Tráfego</option>
      <option>Diretor</option>
    </select>
    <label>Salário mensal (R$)</label>
    <input id="colSalary" type="number" placeholder="Ex: 3500" />
    <label>Horas mensais contratadas</label>
    <input id="colMonthHours" type="number" placeholder="Ex: 176" value="176" />
    <div class="modal-actions">
      <button class="btn-dark" onclick="closeCollabModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveCollab()">Salvar</button>
    </div>
  </div>
</div>
