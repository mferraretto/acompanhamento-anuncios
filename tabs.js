const sections = {
  historico: document.getElementById('historico'),
  listaAnuncios: document.getElementById('listaAnuncios'),
  evolucao: document.getElementById('evolucao'),
  relatorio: document.getElementById('relatorio'),
  comparativo: document.getElementById('comparativo')
};

function showSection(id) {
  Object.values(sections).forEach(sec => sec.classList.remove('active'));
  sections[id].classList.add('active');
}

document.querySelectorAll('#menuTabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.section;
    showSection(id);
    if (id === 'listaAnuncios') {
      loadAnuncios();
    } else if (id === 'historico') {
      loadHistorico();
    }
  });
});

async function loadAnuncios() {
  const container = document.getElementById('listaAnunciosContent');
  const snap = await db.collection('anuncios').get();
  let html = '<table><tr><th>Nome</th><th>SKU</th></tr>';
  snap.forEach(doc => {
    const data = doc.data();
    const nome = data['Nome do Produto'] || data.nome || '';
    html += `<tr><td>${nome}</td><td>${doc.id}</td></tr>`;
  });
  html += '</table>';
  container.innerHTML = html;
}

async function loadHistorico() {
  const container = document.getElementById('historicoContent');
  const snap = await db.collection('pedidos').get();
  let html = '<table><tr><th>SKU</th><th>Status</th><th>Valor</th></tr>';
  snap.forEach(doc => {
    const d = doc.data();
    html += `<tr><td>${d['SKU'] || ''}</td><td>${d['Status'] || ''}</td><td>${d['Valor'] || ''}</td></tr>`;
  });
  html += '</table>';
  container.innerHTML = html;
}

// Show default tab
showSection('listaAnuncios');
