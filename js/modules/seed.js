function seedDemoData() {
  const clients = [
  { id: 'cl001', name: "Balbicar", value: '800', hours: '0', notes: '' },
  { id: 'cl002', name: "Coara Ve\u00edculos", value: '700', hours: '0', notes: '' },
  { id: 'cl003', name: "Fabkar", value: '500', hours: '0', notes: '' },
  { id: 'cl004', name: "Krebs Clean", value: '600', hours: '0', notes: '' },
  { id: 'cl005', name: "Premier", value: '600', hours: '0', notes: '' },
  { id: 'cl006', name: "RHS Ve\u00edculos", value: '1200', hours: '0', notes: '' },
  { id: 'cl007', name: "RHS Motos", value: '1000', hours: '0', notes: '' },
  { id: 'cl008', name: "V8", value: '600', hours: '0', notes: '' },
  { id: 'cl009', name: "Woldam", value: '1100', hours: '0', notes: '' },
  { id: 'cl010', name: "Hosp. Vet. Santa Maria", value: '597', hours: '0', notes: '' },
  { id: 'cl011', name: "Cl\u00ednica Viva Mais", value: '1200', hours: '0', notes: '' },
  { id: 'cl012', name: "Sunset +", value: '2000', hours: '0', notes: '' },
  { id: 'cl013', name: "Hobbi Tintas", value: '900', hours: '0', notes: '' },
  { id: 'cl014', name: "Paddock Racing", value: '700', hours: '0', notes: '' },
  { id: 'cl015', name: "Bui\u00fa Ve\u00edculos", value: '1200', hours: '0', notes: '' },
  { id: 'cl016', name: "Di Paula", value: '1047', hours: '0', notes: '' },
  { id: 'cl017', name: "Novacki", value: '2100', hours: '0', notes: '' },
  { id: 'cl018', name: "Karol Cabelos", value: '1300', hours: '0', notes: '' },
  { id: 'cl019', name: "Susy Magnani", value: '1200', hours: '0', notes: '' },
  { id: 'cl020', name: "Jr Advocacia", value: '700', hours: '0', notes: '' },
  { id: 'cl021', name: "Tucanos Seguros", value: '800', hours: '0', notes: '' },
  { id: 'cl022', name: "Lettor Escrit\u00f3rio Virtual", value: '400', hours: '0', notes: '' },
  { id: 'cl023', name: "Shineray", value: '1000', hours: '0', notes: '' },
  { id: 'cl024', name: "Etra Mate Porto Vit\u00f3ria", value: '997', hours: '0', notes: '' },
  { id: 'cl025', name: "Jonathan Ve\u00edculos", value: '2100', hours: '0', notes: '' },
  { id: 'cl026', name: "Lenz e Ribeiro ADV", value: '2000', hours: '0', notes: '' },
  { id: 'cl027', name: "Casa Lar Ca\u00e7ador", value: '450', hours: '0', notes: '' },
  { id: 'cl028', name: "Hosp Saint Hill", value: '3800', hours: '0', notes: '' },
  { id: 'cl029', name: "Dra Aline Assoni", value: '1200', hours: '0', notes: '' },
  { id: 'cl030', name: "Andressa Dentista", value: '1000', hours: '0', notes: '' },
  { id: 'cl031', name: "Dr. Pedro Blanco", value: '1600', hours: '0', notes: '' },
  { id: 'cl032', name: "Casa de Apoio", value: '2400', hours: '0', notes: '' },
  { id: 'cl033', name: "2 Tabelionato", value: '1000', hours: '0', notes: '' },
  { id: 'cl034', name: "Melo Advogados", value: '1700', hours: '0', notes: '' },
  { id: 'cl035', name: "Farm\u00e1cia Brasil Poupatlar", value: '800', hours: '0', notes: '' },
  { id: 'cl036', name: "GBL Climatizadora", value: '1000', hours: '0', notes: '' },
  { id: 'cl037', name: "Madibell", value: '1000', hours: '0', notes: '' },
  { id: 'cl038', name: "Ad\u00e2mio Pe\u00e7os", value: '1000', hours: '0', notes: '' },
  { id: 'cl039', name: "Dr. Ricardo Rigo Burkle", value: '1300', hours: '0', notes: '' },
  { id: 'cl040', name: "Dalgallo Motors", value: '900', hours: '0', notes: '' },
  { id: 'cl041', name: "Nea Incorporadora", value: '500', hours: '0', notes: '' },
  { id: 'cl042', name: "CECW", value: '1000', hours: '0', notes: '' },
  { id: 'cl043', name: "Mister Pizzaria", value: '2100', hours: '0', notes: '' },
  { id: 'cl044', name: "Dr. Alinne Dentista", value: '1200', hours: '0', notes: '' },
  { id: 'cl045', name: "Green Whaser", value: '800', hours: '0', notes: '' },
  { id: 'cl046', name: "Zoio Burger", value: '400', hours: '0', notes: '' },
  { id: 'cl047', name: "Cl\u00ednica Vital", value: '2300', hours: '0', notes: '' },
  { id: 'cl048', name: "Zap Petiscaria", value: '500', hours: '0', notes: '' },
  { id: 'cl049', name: "Erva Mate Vargem Grande", value: '800', hours: '0', notes: '' },
  { id: 'cl050', name: "100B", value: '1000', hours: '0', notes: '' },
  { id: 'cl051', name: "Novacki Madeiras", value: '900', hours: '0', notes: '' },
  { id: 'cl052', name: "Novacki Fazenda", value: '900', hours: '0', notes: '' },
  { id: 'cl053', name: "Vogel Incorporadora", value: '1300', hours: '0', notes: '' },
  { id: 'cl054', name: "Umanizzato Odontologia", value: '1100', hours: '0', notes: '' },
  { id: 'cl055', name: "Eduardo Arquiteto", value: '1200', hours: '0', notes: '' },
  { id: 'cl056', name: "Abc da Constru\u00e7\u00e3o", value: '1400', hours: '0', notes: '' },
  { id: 'cl057', name: "Larissa Engenharia de Alimentos", value: '1500', hours: '0', notes: '' },
  { id: 'cl058', name: "EPG Engenharia e Constru\u00e7\u00f5es", value: '900', hours: '0', notes: '' },
  { id: 'cl059', name: "Instituto Diligentia", value: '1200', hours: '0', notes: '' }
  ];

  // Seed task points default
  _store.taskPoints = DEFAULT_TASK_POINTS;

  // Seed supervisor config — Mario Junior supervises his group
  const supervisorConfig = {
    'Mario Junior': ['Irno Dahmer', 'André Lisboa', 'Eduardo Neubauer', 'Otavio Pereira', 'Christopher Cassenoti'],
  };
  _store.supervisors = supervisorConfig;
  tryLS(() => localStorage.setItem('tt_supervisors_v1', JSON.stringify(supervisorConfig)));

  // Seed metas — se a API já trouxe metas, mantém; senão inicia vazio.
  const existingMetas = tryLS(() => JSON.parse(localStorage.getItem('tt_metas_v2') || 'null'));
  const demoMetas = existingMetas || {};
  _store.metas = demoMetas;
  tryLS(() => localStorage.setItem('tt_metas_v2', JSON.stringify(demoMetas)));

  const collabs = [
    { id:'u001', name:'Renan Morandi',        role:'Diretor',           salary:'0', monthHours:'176' },
    { id:'u002', name:'Gustavo Ferreira',     role:'Diretor',           salary:'0', monthHours:'176' },
    { id:'u003', name:'Jéssica Dahmer',       role:'Social Media',      salary:'0', monthHours:'176' },
    { id:'u004', name:'Irno Dahmer',          role:'Designer',          salary:'0', monthHours:'176' },
    { id:'u005', name:'Mario Junior',         role:'Designer',          salary:'0', monthHours:'176' },
    { id:'u006', name:'André Lisboa',         role:'Designer',          salary:'0', monthHours:'176' },
    { id:'u007', name:'Otavio Pereira',       role:'Filmmaker',         salary:'0', monthHours:'176' },
    { id:'u008', name:'Eduardo Neubauer',     role:'Filmmaker',         salary:'0', monthHours:'176' },
    { id:'u009', name:'Alexandre Damacena',   role:'Editor de Vídeo',   salary:'0', monthHours:'176' },
    { id:'u010', name:'Christopher Cassenoti',role:'Gestor de Tráfego', salary:'0', monthHours:'176' },
  ];

  // API mode: se o banco/API já trouxe clientes e usuários, eles têm prioridade.
  const apiClients = tryLS(() => JSON.parse(localStorage.getItem('tt_clients_v2') || 'null'));
  const apiCollabs = tryLS(() => JSON.parse(localStorage.getItem('tt_collabs_v2') || 'null'));

  _store.clients = (apiClients && apiClients.length) ? apiClients : clients;
  _store.collabs = (apiCollabs && apiCollabs.length) ? apiCollabs : collabs;

  tryLS(() => localStorage.setItem('tt_collabs_v2', JSON.stringify(_store.collabs)));
  tryLS(() => localStorage.setItem('tt_clients_v2', JSON.stringify(_store.clients)));

  // Entries: load from localStorage if saved, otherwise start empty
  const lsEntries = tryLS(() => JSON.parse(localStorage.getItem('tt_entries_v2') || 'null'));
  if (lsEntries && lsEntries.length) { _store.entries = lsEntries; return; }

  // Start with no entries — real team will register their own
  _store.entries = [];
  _store.descontos = [];
  tryLS(() => localStorage.setItem('tt_descontos_v1', JSON.stringify([])));
}