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
// Converte data da planilha (texto ou número Excel) para formato ISO
const rawDate = row['DATA'] || row['Data'] || row['data'];
let dataRegistroISO = new Date().toISOString(); // fallback padrão

if (rawDate) {
  if (typeof rawDate === 'string' && rawDate.includes('/')) {
    const [dia, mes, ano] = rawDate.split('/');
    if (dia && mes && ano) {
      const dateObj = new Date(`${ano}-${mes}-${dia}T00:00:00`);
      if (!isNaN(dateObj)) {
        dataRegistroISO = dateObj.toISOString();
      }
    }
  } else if (!isNaN(rawDate)) {
    const excelDate = new Date((Number(rawDate) - 25569) * 86400 * 1000);
    if (!isNaN(excelDate)) {
      dataRegistroISO = excelDate.toISOString();
    }
  }
}


// Agora sim, constrói o objeto completo com a data correta
const dados = {
  itemId,
  sku,
  visualizacoes: parseNumber(row['Visualizações da Página do Produto'] || row['Total de visualizações'] || 0),
  cliques: parseNumber(row['Unidades (adicionar ao carrinho)'] || row['Total de cliques'] || 0),
  vendas: parseNumber(row['Unidades (Pedido pago)'] || row['Total de pedidos pagos'] || 0),
  conversao: parseNumber(row['Taxa de conversão (Pedido pago)'] || row['Taxa de conversão (%)'] || 0),
  receita: parseNumber(row['Vendas (Pedido pago) (BRL)'] || row['Valor total do pedido'] || 0),
  dataRegistro: dataRegistroISO
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
await desempenhoRef.set({ itemId, ...payload }, { merge: true });

const dataId = payload.dataRegistro.split('T')[0]; // só a data: yyyy-mm-dd
const historicoRef = desempenhoRef.collection('historico').doc(dataId);
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
// Chart.js already loaded globally via CDN in index.html
const Chart = window.Chart;
const selectItemId = document.getElementById('selectItemId');
const selectPeriodo = document.getElementById('selectPeriodo');
const canvas = document.getElementById('graficoConversao');
let chart = null;

async function carregarItemIds() {
  const snapshot = await db.collection('desempenho').get();
  const unicos = [...new Set(snapshot.docs.map(d => d.data().itemId))];
  selectItemId.innerHTML = '<option value="">Selecione</option>';
  unicos.forEach(id => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    selectItemId.appendChild(opt);
  });
}
carregarItemIds();

selectItemId.addEventListener('change', renderChart);
selectPeriodo.addEventListener('change', renderChart);

async function renderChart() {
  const itemId = selectItemId.value;
  const dias = parseInt(selectPeriodo.value);
  if (!itemId || !dias) return;
    const THRESHOLD = 0.2; // 20%


  const hoje = new Date();
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() - dias);

  const historicoRef = db.collection('desempenho').doc(itemId).collection('historico');
const snapshot = await historicoRef
  .where('dataRegistro', '>=', dataLimite.toISOString())
  .orderBy('dataRegistro')
  .get();

  const dados = snapshot.docs
    .map(doc => doc.data())
    .filter(d => new Date(d.dataRegistro) >= dataLimite);

  const labels = dados.map(d => new Date(d.dataRegistro).toLocaleDateString());
  const visualizacoes = dados.map(d => d.visualizacoes || 0);
  const cliques = dados.map(d => d.cliques || 0);
  const conversao = dados.map(d => parseFloat(d.conversao || 0));
function calcAlertas(arr) {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      if (i === 0) {
        out.push(false);
        continue;
      }
      const prev = arr[i - 1];
      const curr = arr[i];
      const diff = prev === 0 ? 1 : Math.abs((curr - prev) / prev);
      out.push(diff > THRESHOLD);
    }
    return out;
  }

  const alertVisual = calcAlertas(visualizacoes);
  const alertCliques = calcAlertas(cliques);
  const alertConv = calcAlertas(conversao);
  if (chart) chart.destroy(); // Limpa gráfico anterior

  chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Visualizações',
          data: visualizacoes,
 backgroundColor: visualizacoes.map((_, i) =>
            alertVisual[i] ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.5)'
          ),
        },
        {
          label: 'Cliques',
          data: cliques,
backgroundColor: cliques.map((_, i) =>
            alertCliques[i] ? 'rgba(255, 99, 132, 0.7)' : 'rgba(255, 206, 86, 0.5)'
          ),
        },
        {
          label: 'Conversão (%)',
          data: conversao,
          type: 'line',
          yAxisID: 'y1',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
fill: false,
          pointBackgroundColor: conversao.map((_, i) =>
            alertConv[i] ? 'red' : 'rgba(75, 192, 192, 1)'
          ),
          pointBorderColor: conversao.map((_, i) =>
            alertConv[i] ? 'red' : 'rgba(75, 192, 192, 1)'
          )
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
       plugins: {
        tooltip: {
          callbacks: {
            label(ctx) {
              const label = `${ctx.dataset.label}: ${ctx.parsed.y}`;
              const idx = ctx.dataIndex;
              const ds = ctx.datasetIndex;
              const alerts = [alertVisual, alertCliques, alertConv][ds] || [];
              if (alerts[idx]) {
                const prev = ds === 0 ? visualizacoes[idx - 1] : ds === 1 ? cliques[idx - 1] : conversao[idx - 1];
                const diff = prev ? ((ctx.parsed.y - prev) / prev) * 100 : 100;
                const sign = diff > 0 ? '+' : '';
                return `${label} (Alerta: ${sign}${diff.toFixed(1)}% vs dia anterior)`;
              }
              return label;
            }
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

