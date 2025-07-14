const sanitize = (v) => (v == null ? '' : String(v));

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
 const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['Nome', 'SKU'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  snap.forEach(doc => {
    const data = doc.data();
    const nome = data['Nome do Produto'] || data.nome || '';
const tr = document.createElement('tr');
    const nomeTd = document.createElement('td');
    nomeTd.textContent = sanitize(nome);
    tr.appendChild(nomeTd);

    const skuTd = document.createElement('td');
    skuTd.textContent = sanitize(doc.id);
    tr.appendChild(skuTd);

    table.appendChild(tr);
  });
   container.innerHTML = '';
  container.appendChild(table);
}

async function loadHistorico() {
  const container = document.getElementById('historicoContent');
  const snap = await db.collection('pedidos').get();
  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['SKU', 'Status', 'Valor'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  snap.forEach(doc => {
    const d = doc.data();
   const tr = document.createElement('tr');

    const skuTd = document.createElement('td');
    skuTd.textContent = sanitize(d['SKU']);
    tr.appendChild(skuTd);

    const statusTd = document.createElement('td');
    statusTd.textContent = sanitize(d['Status']);
    tr.appendChild(statusTd);

    const valorTd = document.createElement('td');
    valorTd.textContent = sanitize(d['Valor']);
    tr.appendChild(valorTd);

    table.appendChild(tr);
  });
 container.innerHTML = '';
  container.appendChild(table);
}

// Show default tab
showSection('listaAnuncios');
