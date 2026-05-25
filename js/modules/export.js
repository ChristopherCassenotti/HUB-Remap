function exportCSV() { downloadCSV(getFilteredEntries(), 'timetracker-geral'); }

function downloadCSV(entries, filename) {
  const collabs = getCollabs();
  const header = ['Data','Colaborador','Cargo','Cliente','Tarefa','Categoria','Inicio','Fim','Duracao_h','Custo_R$'];
  const rows = entries.map(e => {
    const col = collabs.find(c => c.name === e.user);
    const rate = col ? parseFloat(col.salary)/(parseFloat(col.monthHours)||176) : 0;
    const cost = (rate * e.durationSeconds/3600).toFixed(2);
    return [e.date,e.user,e.role,e.client,e.task,e.category,fmtTime(e.start),fmtTime(e.end),(e.durationSeconds/3600).toFixed(2),cost];
  });
  const csv = [header,...rows].map(r=>r.map(c=>`"${String(c).replaceAll('"','""')}"`).join(';')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`${filename}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function clearData() {
  if (!confirm('Apagar todos os registros de tempo?')) return;
  set('entries', []);
  renderDashboard();
}