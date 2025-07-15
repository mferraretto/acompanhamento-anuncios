// graficoEvolucao.js
export async function gerarGraficoEvolucao(db) {
  const itemId1 = document.getElementById('filtroEvolucaoAnuncio1').value;
  const itemId2 = document.getElementById('filtroEvolucaoAnuncio2').value;
  const dias = parseInt(document.getElementById('filtroEvolucaoPeriodo').value);

  if (!itemId1) return alert('Selecione pelo menos um anúncio.');

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
          tension: 0.3
        },
        ...(itemId2 ? [{
          label: `Conversão - ${itemId2}`,
          data: datasetConversao2,
          borderColor: 'orange',
          tension: 0.3
        }] : [])
      ]
    },
    options: {
      plugins: {
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%` } },
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
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        },
        {
          label: 'Cliques',
          data: datasetCliques1,
          backgroundColor: 'rgba(255, 206, 86, 0.5)'
        }
      ]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Visualizações x Cliques' },
        tooltip: { mode: 'index', intersect: false }
      },
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: { y: { beginAtZero: true } }
    }
  });
}
