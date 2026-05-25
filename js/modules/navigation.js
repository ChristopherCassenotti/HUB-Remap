
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  document.querySelectorAll(`.nav-item`).forEach(n => {
    if (n.getAttribute('onclick')?.includes(`'${id}'`)) n.classList.add('active');
  });

  // Render on open
  if (id === 'timer') { applyDefaultCategoryFromUserRole('categoryInput'); setTimeout(() => { try { if (document.querySelectorAll('.task-line-row').length === 0) addTaskLine(); else updateTaskDropdown(); } catch(e) {} try { loadActiveTimersFromDb(); } catch(e) {} try { renderActiveTimers(); } catch(e) {} try { renderTimerSidePanel(); } catch(e) {} }, 0); }
  if (id === 'retroativo') {
    applyDefaultCategoryFromUserRole('rCategoryInput');
    const todayStr = new Date().toISOString().slice(0,10);
    const rDate = document.getElementById('rDate');
    if (rDate && !rDate.value) rDate.value = todayStr;
    fillRetroClientList();
    setupRetroListeners();
    renderRetroTable();
    setTimeout(() => { try { updateRetroTaskDropdown(); } catch(e) {} }, 0);
  }
  if (id === 'painel') renderPainel();
  if (id === 'mywork') renderMyWork();
  if (id === 'tarefas') renderKanban();
  if (id === 'supervisao') renderSupervisao();
  if (id === 'pontuacao') { renderTaskPoints(); renderMetasGrid(); renderDescontosTable(); }
  if (id === 'dashboard') renderDashboard();
  if (id === 'clients') renderClientGrid();
  if (id === 'clientsCollab') renderClientGridCollab();
  if (id === 'team') renderTeam();
}
