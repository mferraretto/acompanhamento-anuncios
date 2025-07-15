import { sanitize, parseNumber, removeInvalid } from './utils.js';
const db = window.db;

document.getElementById('btnSalvarDesempenho').addEventListener('click', async () => {
  try {
    const input = document.getElementById('inputPlanilhaDesempenho');
    const preview = document.getElementById('previewDesempenho');
    const cardsContainer = document.getElementById('desempenhoCards');

    if (!input.files.length) {
      alert('Selecione a planilha de desempenho.');
      return;
    }

    const file = input.files[0];
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    ['SKU', 'Visualizações', 'Cliques', 'Vendas', 'Conversão (%)', 'Receita'].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    cardsContainer.innerHTML = '';

    for (const row of rows) {
      const sku = String(row['SKU da Variação'] || '').trim();
      const itemId = String(row['ID do Item'] || '').trim();
      if (!itemId) continue;

      const safeId = itemId.replace(/[.#$/\[\]]/g, '-'); // Firebase-safe ID

      const dados = {
        itemId,
        sku,
        visualizacoes: parseNumber(row['Visualizações da Página do Produto'] || row['Total de visualizações'] || 0),
        cliques: parseNumber(row['Unidades (adicionar ao carrinho)'] || row['Total de cliques'] || 0),
        vendas: parseNumber(row['Unidades (Pedido pago)'] || row['Total de pedidos pagos'] || 0),
        conversao: parseNumber(row['Taxa de conversão (Pedido pago)'] || row['Taxa de conversão (%)'] || 0),
        receita: parseNumber(row['Vendas (Pedido pago) (BRL)'] || row['Valor total do pedido'] || 0),
        dataRegistro: new Date().toISOString()
      };

      // Validação básica
      if (
        isNaN(dados.visualizacoes) ||
        isNaN(dados.cliques) ||
        isNaN(dados.vendas) ||
        isNaN(dados.conversao) ||
        isNaN(dados.receita)
      ) {
        console.warn(`⚠️ Dados inválidos para SKU: ${sku}`, dados);
        continue;
      }

      // Tabela
      const tr = document.createElement('tr');
      [dados.sku, dados.visualizacoes, dados.cliques, dados.vendas, dados.conversao, dados.receita].forEach(val => {
        const td = document.createElement('td');
        td.textContent = sanitize(val);
        tr.appendChild(td);
      });
      table.appendChild(tr);

      // Card
      const card = document.createElement('div');
      card.className = 'card';

      const title = document.createElement('h3');
      title.textContent = sanitize(sku);
      card.appendChild(title);

      const makeP = (label, value) => {
        const p = document.createElement('p');
        p.textContent = label + ' ';
        const strong = document.createElement('strong');
        strong.textContent = value;
        p.appendChild(strong);
        return p;
      };

      card.appendChild(makeP('👁 Visualizações:', dados.visualizacoes));
      card.appendChild(makeP('🖱 Cliques:', dados.cliques));
      card.appendChild(makeP('🛒 Vendas:', dados.vendas));
      card.appendChild(makeP('📈 Conversão:', `${dados.conversao}%`));
      card.appendChild(makeP('💰 Receita:', `R$ ${dados.receita.toFixed(2)}`));

      cardsContainer.appendChild(card);

      // Salvar no Firebase usando ID do Item como chave
      const payload = removeInvalid(dados);
const desempenhoRef = db.collection('desempenho').doc(safeId);
await desempenhoRef.set({ itemId: safeId }, { merge: true }); // metadados básicos

const historicoRef = desempenhoRef.collection('historico').doc(payload.dataRegistro);
await historicoRef.set(payload); // Salva evolução diária
    }

    preview.innerHTML = '';
    preview.appendChild(table);
    alert('✅ Dados de desempenho salvos com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao salvar desempenho:', err);
    alert('❌ Falha ao salvar desempenho');
  }
});
import Chart from 'chart.js/auto';

const selectItemId = document.getElementById('graficoItemId');
const selectPeriodo = document.getElementById('graficoPeriodo');
const canvas = document.getElementById('graficoCanvas');
let chart = null;

async function carregarItemIds() {
  const snapshot = await db.collection('desempenho').get();
  const unicos = [...new Set(snapshot.docs.map(d => d.data().itemId))];

  // Arrays com os dois selects (original e o segundo para comparação)
  const selects = [
    document.getElementById('graficoItemId'),
    document.getElementById('graficoItemId2')
  ];

  selects.forEach(select => {
    select.innerHTML = '<option value="">Selecione</option>';
    unicos.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      select.appendChild(opt);
    });
  });
}

carregarItemIds();


selectItemId.addEventListener('change', renderChart);
selectPeriodo.addEventListener('change', renderChart);
async function renderChart() {
  const itemId1 = document.getElementById('graficoItemId').value;
  const itemId2 = document.getElementById('graficoItemId2').value;
  const dias = parseInt(document.getElementById('graficoPeriodo').value);
  if (!itemId1 || !dias) return;

  const hoje = new Date();
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() - dias);

  async function buscarDados(itemId) {
    const historicoRef = db.collection('desempenho').doc(itemId).collection('historico');
    const snapshot = await historicoRef
      .where('dataRegistro', '>=', dataLimite.toISOString())
      .orderBy('dataRegistro')
      .get();
    return snapshot.docs.map(doc => doc.data());
  }

  const dados1 = await buscarDados(itemId1);
  const dados2 = itemId2 ? await buscarDados(itemId2) : [];

  const labels = [...new Set([...dados1, ...dados2].map(d => new Date(d.dataRegistro).toLocaleDateString()))].sort();

  function mapPorData(dados, campo) {
    const mapa = {};
    dados.forEach(d => {
      const dia = new Date(d.dataRegistro).toLocaleDateString();
      mapa[dia] = d[campo] || 0;
    });
    return labels.map(label => mapa[label] || 0);
  }

  const datasets = [
    {
      label: `👁 Visualizações (${itemId1})`,
      data: mapPorData(dados1, 'visualizacoes'),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      stack: 'a',
    },
    {
      label: `🖱 Cliques (${itemId1})`,
      data: mapPorData(dados1, 'cliques'),
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      stack: 'a',
    },
    {
      label: `📈 Conversão (%) (${itemId1})`,
      data: mapPorData(dados1, 'conversao'),
      type: 'line',
      yAxisID: 'y1',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: false
    }
  ];

  if (itemId2) {
    datasets.push(
      {
        label: `👁 Visualizações (${itemId2})`,
        data: mapPorData(dados2, 'visualizacoes'),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        stack: 'b',
      },
      {
        label: `🖱 Cliques (${itemId2})`,
        data: mapPorData(dados2, 'cliques'),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        stack: 'b',
      },
      {
        label: `📈 Conversão (%) (${itemId2})`,
        data: mapPorData(dados2, 'conversao'),
        type: 'line',
        yAxisID: 'y1',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false
      }
    );
  }

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          mode: 'index',
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Volume' } },
        y1: {
          beginAtZero: true,
          position: 'right',
          title: { display: true, text: 'Conversão (%)' },
          ticks: { callback: v => `${v}%` },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}


