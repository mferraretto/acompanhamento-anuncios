async function gerarGraficoEvolucao() {
  const itemId1 = document.getElementById('filtroEvolucaoAnuncio1').value;
  const itemId2 = document.getElementById('filtroEvolucaoAnuncio2').value;
  const dias = parseInt(document.getElementById('filtroEvolucaoPeriodo').value);

  if (!itemId1) return alert('Selecione pelo menos um anúncio.');
  const THRESHOLD = 0.2;

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

  const labels = dados1.map(d => new Date(d.dataRegistro).toLocaleDateString());
  const datasetConversao1 = dados1.map(d => d.conversao || 0);
  const datasetConversao2 = dados2.map(d => d.conversao || 0);
  const datasetCliques1 = dados1.map(d => d.cliques || 0);
  const datasetVisualizacoes1 = dados1.map(d => d.visualizacoes || 0);
function calcAlertas(arr) {
    const res = [];
    for (let i = 0; i < arr.length; i++) {
      if (i === 0) {
        res.push(false);
        continue;
      }
      const prev = arr[i - 1];
      const curr = arr[i];
      const diff = prev === 0 ? 1 : Math.abs((curr - prev) / prev);
      res.push(diff > THRESHOLD);
    }
    return res;
  }

  const alertConv1 = calcAlertas(datasetConversao1);
  const alertConv2 = calcAlertas(datasetConversao2);
  const alertVisual = calcAlertas(datasetVisualizacoes1);
  const alertCliques = calcAlertas(datasetCliques1);
  const ctxLinha = document.getElementById('graficoLinhaConversao').getContext('2d');
  const ctxBarras = document.getElementById('graficoBarrasMetricas').getContext('2d');

  if (window.graficoLinha) window.graficoLinha.destroy();
  if (window.graficoBarras) window.graficoBarras.destroy();

  window.graficoLinha = new Chart(ctxLinha, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Conversão - ${itemId1}`,
          data: datasetConversao1,
          borderColor: 'blue',
 tension: 0.3,
          pointBackgroundColor: datasetConversao1.map((_, i) =>
            alertConv1[i] ? 'red' : 'blue'
          ),
          pointBorderColor: datasetConversao1.map((_, i) =>
            alertConv1[i] ? 'red' : 'blue'
          )
        },
        ...(itemId2 ? [{
          label: `Conversão - ${itemId2}`,
          data: datasetConversao2,
          borderColor: 'orange',
tension: 0.3,
          pointBackgroundColor: datasetConversao2.map((_, i) =>
            alertConv2[i] ? 'red' : 'orange'
          ),
          pointBorderColor: datasetConversao2.map((_, i) =>
            alertConv2[i] ? 'red' : 'orange'
          )
        }] : [])
      ]
    },
    options: {
      plugins: {
 tooltip: {
          callbacks: {
            label(ctx) {
              const label = `${ctx.dataset.label}: ${ctx.parsed.y}%`;
              const alerts = ctx.dataset.label.includes(itemId1) ? alertConv1 : alertConv2;
              if (alerts[ctx.dataIndex]) {
                const prev = ctx.dataIndex > 0 ? ctx.dataset.data[ctx.dataIndex - 1] : 0;
                const diff = prev ? ((ctx.parsed.y - prev) / prev) * 100 : 100;
                const sign = diff > 0 ? '+' : '';
                return `${label} (Alerta: ${sign}${diff.toFixed(1)}% vs dia anterior)`;
              }
              return label;
            }
          }
        },
        title: { display: true, text: 'Evolução da Conversão (%)' }
      },
      scales: { y: { beginAtZero: true, title: { display: true, text: '%' } } }
    }
  });

  window.graficoBarras = new Chart(ctxBarras, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Visualizações',
          data: datasetVisualizacoes1,
backgroundColor: datasetVisualizacoes1.map((_, i) =>
            alertVisual[i] ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.5)'
          )
        },
        {
          label: 'Cliques',
          data: datasetCliques1,
 backgroundColor: datasetCliques1.map((_, i) =>
            alertCliques[i] ? 'rgba(255, 99, 132, 0.7)' : 'rgba(255, 206, 86, 0.5)'
          )
        }
      ]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Visualizações x Cliques' },
       tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label(ctx) {
              const label = `${ctx.dataset.label}: ${ctx.parsed.y}`;
              const idx = ctx.dataIndex;
              const ds = ctx.datasetIndex;
              const alerts = ds === 0 ? alertVisual : alertCliques;
              if (alerts[idx]) {
                const prev = ctx.dataset.data[idx - 1] ?? 0;
                const diff = prev ? ((ctx.parsed.y - prev) / prev) * 100 : 100;
                const sign = diff > 0 ? '+' : '';
                return `${label} (Alerta: ${sign}${diff.toFixed(1)}% vs dia anterior)`;
              }
              return label;
            }
          }
        }
      },
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: { y: { beginAtZero: true } }
    }
  });
}

window.gerarGraficoEvolucao = gerarGraficoEvolucao;

const selectAnuncio1 = document.getElementById('filtroEvolucaoAnuncio1');
const selectAnuncio2 = document.getElementById('filtroEvolucaoAnuncio2');
const selectPeriodoEvolucao = document.getElementById('filtroEvolucaoPeriodo');

async function carregarItemIdsEvolucao() {
  const snapshot = await db.collection('desempenho').get();
  const unicos = [...new Set(snapshot.docs.map(d => d.data().itemId))];
  const buildOptions = (select) => {
    select.innerHTML = '<option value="">Selecione</option>';
    unicos.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      select.appendChild(opt);
    });
  };
  buildOptions(selectAnuncio1);
  buildOptions(selectAnuncio2);
}

carregarItemIdsEvolucao();

selectAnuncio1.addEventListener('change', gerarGraficoEvolucao);
selectAnuncio2.addEventListener('change', gerarGraficoEvolucao);
selectPeriodoEvolucao.addEventListener('change', gerarGraficoEvolucao);
