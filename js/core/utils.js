function filterByPeriod(entries, period, now) {
  if (period === 'today') return entries.filter(e => isSameDay(entryDate(e), now));
  if (period === 'week') return entries.filter(e => isSameWeek(entryDate(e), now));
  if (period === 'month') return entries.filter(e => isSameMonth(entryDate(e), now));
  return entries;
}

function groupSeconds(entries, key) {
  return entries.reduce((acc, e) => { acc[e[key]] = (acc[e[key]]||0) + e.durationSeconds; return acc; }, {});
}
function groupByWeek(entries) {
  return entries.reduce((acc, e) => {
    const d = new Date(e.start);
    const label = `Semana ${getWeekNum(d)} / ${d.getFullYear()}`;
    acc[label] = (acc[label]||0) + e.durationSeconds; return acc;
  }, {});
}
function groupByMonth(entries) {
  return entries.reduce((acc, e) => {
    const d = new Date(e.start);
    const label = d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    acc[label] = (acc[label]||0) + e.durationSeconds; return acc;
  }, {});
}
function sum(entries) { return entries.reduce((t,e)=>t+e.durationSeconds,0); }
function isSameDay(a,b) { return a.toDateString()===b.toDateString(); }
function isSameMonth(a,b) { return a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear(); }
function isSameWeek(a,b) { return startOfWeek(a).toDateString()===startOfWeek(b).toDateString(); }
function startOfWeek(date) { const d=new Date(date); const day=d.getDay(); d.setDate(d.getDate()-day+(day===0?-6:1)); d.setHours(0,0,0,0); return d; }
function getWeekNum(date) { const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const dn=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-dn); const y=new Date(Date.UTC(d.getUTCFullYear(),0,1)); return Math.ceil((((d-y)/86400000)+1)/7); }
function formatDuration(s,clock=false) { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; if(clock)return[h,m,sec].map(n=>String(n).padStart(2,'0')).join(':'); if(h>0)return`${h}h ${m}min`; if(m>0)return`${m}min`; return`${s}s`; }
function fmtH(seconds) { const h=seconds/3600; if(h<1)return`${Math.round(seconds/60)}min`; return`${h.toFixed(1).replace('.',',')}h`; }
function fmtMoney(n) { return n.toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0}); }
function formatDateBR(d) { return d.toLocaleDateString('pt-BR'); }
function fmtTime(iso) { return new Date(iso).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
function esc(v) { return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;'); }
function jsStr(v) {
  return String(v ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}
function remapPersistStateNow(key, value) {
  try {
    if (window.__remapApplyingRemote) return Promise.resolve(null);
    if (!key || !key.startsWith('tt_')) return Promise.resolve(null);
    return fetch('api/full_state.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: JSON.stringify(value) })
    }).then(async (res) => {
      let json = null;
      try { json = await res.json(); } catch(e) {}
      if (!res.ok || (json && json.success === false)) {
        throw new Error((json && json.message) || 'Falha ao salvar no banco.');
      }
      return json;
    });
  } catch(e) {
    return Promise.reject(e);
  }
}