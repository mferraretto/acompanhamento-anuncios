import { sanitize } from './utils.js';
import { db } from './firebase.js';

const sections = {
  cadastro: document.getElementById('cadastro'),
  historico: document.getElementById('historico'),
  listaAnuncios: document.getElementById('listaAnuncios'),
  evolucao: document.getElementById('evolucao'),
  relatorio: document.getElementById('relatorio'),
  comparativo: document.getElementById('comparativo'),
 alteracoes: document.getElementById('alteracoes'),
  desempenho: document.getElementById('desempenho')

};

function showSection(id) {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  const activeSection = document.getElementById(id);
  if (activeSection) {
    activeSection.classList.add("active");
  }
}

document.querySelectorAll('#menuTabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.section;
    showSection(id);

   if (id === 'listaAnuncios') {
      loadAnuncios();
    } else if (id === 'historico') {
      loadHistorico();
    } else if (id === 'alteracoes') {
      loadAlteracoes();
    } else if (id === 'desempenho') {
      loadDesempenho(); // ✅ CHAMANDO A FUNÇÃO!
    }
  });
});

// Ativar aba "cadastro" por padrão
document.addEventListener("DOMContentLoaded", () => {
  showSection('cadastro');
});



async function loadAnuncios() {
  const container = document.getElementById('listaAnunciosContent');
  const snap = await db.collection('anuncios').get();

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['SKU', 'Nome', 'Descrição', 'Peso', 'Comp.', 'Larg.', 'Altura', 'Imagem de Capa', 'Imagens Extras'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  snap.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');

    // SKU
    const skuTd = document.createElement('td');
    skuTd.textContent = sanitize(doc.id);
    tr.appendChild(skuTd);

    // Nome
    const nomeTd = document.createElement('td');
    nomeTd.textContent = sanitize(data.name || data.nome || '');
    tr.appendChild(nomeTd);

    // Descrição
    const descTd = document.createElement('td');
    descTd.textContent = sanitize(data.description || '');
    tr.appendChild(descTd);

    // Peso
    const pesoTd = document.createElement('td');
    pesoTd.textContent = sanitize(data.weight || data.peso || '');
    tr.appendChild(pesoTd);

    // Comprimento
    const compTd = document.createElement('td');
    compTd.textContent = sanitize(data.length || data.comprimento || '');
    tr.appendChild(compTd);

    // Largura
    const largTd = document.createElement('td');
    largTd.textContent = sanitize(data.width || data.largura || '');
    tr.appendChild(largTd);

    // Altura
    const altTd = document.createElement('td');
    altTd.textContent = sanitize(data.height || data.altura || '');
    tr.appendChild(altTd);

    // Imagem de Capa
    const imgTd = document.createElement('td');
    if (data.main_image || data.imagem) {
      const img = document.createElement('img');
      img.src = sanitize(data.main_image || data.imagem);
      img.width = 50;
      imgTd.appendChild(img);
    }
    tr.appendChild(imgTd);

    // Imagens Extras
    const extrasTd = document.createElement('td');
    const extras = data.secondary_images || [];
    extras.forEach(url => {
      const img = document.createElement('img');
      img.src = sanitize(url);
      img.width = 30;
      img.style.margin = '2px';
      extrasTd.appendChild(img);
    });
    tr.appendChild(extrasTd);

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
async function loadAlteracoes() {
  const container = document.getElementById('alteracoesContent');
  const snap = await db.collection('alteracoes').orderBy('data', 'desc').limit(100).get();

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['SKU', 'Campo', 'De', 'Para', 'Origem', 'Data'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  snap.forEach(doc => {
    const d = doc.data();
    const tr = document.createElement('tr');

    const skuTd = document.createElement('td');
    skuTd.textContent = sanitize(d.sku);
    tr.appendChild(skuTd);

    const campoTd = document.createElement('td');
    campoTd.textContent = sanitize(d.campo);
    tr.appendChild(campoTd);

    const deTd = document.createElement('td');
    deTd.textContent = sanitize(d.de);
    tr.appendChild(deTd);

    const paraTd = document.createElement('td');
    paraTd.textContent = sanitize(d.para);
    tr.appendChild(paraTd);

    const origemTd = document.createElement('td');
    origemTd.textContent = sanitize(d.origem);
    tr.appendChild(origemTd);

    const dataTd = document.createElement('td');
    const dataFormatada = new Date(d.data).toLocaleString('pt-BR');
    dataTd.textContent = dataFormatada;
    tr.appendChild(dataTd);

    table.appendChild(tr);
  });

  container.innerHTML = '';
  container.appendChild(table);
}
async function loadDesempenho() {
  const container = document.getElementById('desempenhoCards');
  container.innerHTML = '';

  const snap = await db.collection('desempenho').get();

  snap.forEach(doc => {
    const d = doc.data();
    const card = document.createElement('div');
    card.style.border = '1px solid #ccc';
    card.style.borderRadius = '10px';
    card.style.padding = '15px';
    card.style.margin = '10px 0';
    card.style.backgroundColor = '#fff';
    card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    card.innerHTML = `
      <strong>SKU:</strong> ${d.sku || '---'}<br>
      <strong>Nome:</strong> ${d.nome || '---'}<br>
      <strong>Visualizações:</strong> ${d.visualizacoes || 0}<br>
      <strong>Cliques:</strong> ${d.cliques || 0}<br>
      <strong>Vendas:</strong> ${d.vendas || 0}<br>
      <strong>CTR:</strong> ${d.ctr || '0%'}<br>
      <strong>Data:</strong> ${new Date(d.data?.seconds * 1000).toLocaleDateString('pt-BR')}
    `;
    container.appendChild(card);
  });
}

// Show default tab
showSection('listaAnuncios');
