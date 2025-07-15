import { sanitize } from './utils.js';
const db = window.db;

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
  const desempenhoSnap = await db.collection('desempenho').get();

  const desempenhoMap = {};
  desempenhoSnap.forEach(doc => desempenhoMap[doc.id] = doc.data());

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['SKU', 'Nome', 'Descrição', 'Peso', 'Comp.', 'Larg.', 'Altura', 'Imagem de Capa', 'Imagens Extras', 'Vendas', 'Visualizações', 'Conversão'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  snap.forEach(doc => {
    const data = doc.data();
    const tr = document.createElement('tr');

    const sku = sanitize(doc.id);
    const desempenho = desempenhoMap[sku] || {};

    const createTd = value => {
      const td = document.createElement('td');
      td.textContent = sanitize(value);
      return td;
    };

    tr.appendChild(createTd(sku));
    tr.appendChild(createTd(data.name || data.nome || ''));
    tr.appendChild(createTd(data.description || ''));
    tr.appendChild(createTd(data.weight || data.peso || ''));
    tr.appendChild(createTd(data.length || data.comprimento || ''));
    tr.appendChild(createTd(data.width || data.largura || ''));
    tr.appendChild(createTd(data.height || data.altura || ''));

    const imgTd = document.createElement('td');
    if (data.main_image || data.imagem) {
      const img = document.createElement('img');
      img.src = sanitize(data.main_image || data.imagem);
      img.width = 50;
      imgTd.appendChild(img);
    }
    tr.appendChild(imgTd);

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

    tr.appendChild(createTd(desempenho.vendas || 0));
    tr.appendChild(createTd(desempenho.visualizacoes || 0));

    const conversaoTd = document.createElement('td');
    const conversao = desempenho.conversao || 0;
    conversaoTd.textContent = `${conversao}%`;

    // Cor de alerta
    if (conversao < 1) {
      conversaoTd.style.color = 'red';
    } else if (conversao >= 3) {
      conversaoTd.style.color = 'green';
    }

    // Tooltip com data
    if (desempenho.dataRegistro) {
      const dataObj = new Date(desempenho.dataRegistro);
      conversaoTd.title = `Última atualização: ${dataObj.toLocaleDateString('pt-BR')}`;
    }

    tr.appendChild(conversaoTd);
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

    const addField = (label, value) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = value;
      p.textContent = label + ' ';
      p.appendChild(strong);
      card.appendChild(p);
    };

    addField('SKU:', d.sku || '---');
    addField('Visualizações:', d.visualizacoes || 0);
    addField('Cliques:', d.cliques || 0);
    addField('Vendas:', d.vendas || 0);
    addField('Conversão:', `${d.conversao || 0}%`);
    addField('Receita:', `R$ ${(d.receita ?? 0).toFixed(2)}`);
    addField('Data:', new Date(d.dataRegistro).toLocaleDateString('pt-BR'));
    container.appendChild(card);
  });
}

// Show default tab
showSection('listaAnuncios');
