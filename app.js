import { removeInvalid } from './utils.js';

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const form = e.target;
    const nome = form.nome.value.trim();
    const link = form.link.value.trim();
    const sku = form.sku.value.trim();
    const imagem = form.imagem.value.trim();
    const data = form.data.value;

    if (!nome || !link || !sku || !imagem || !data) {
      document.getElementById("msgCadastro").innerText = "Preencha todos os campos.";
      return;
    }

    const docRef = db.collection("anuncios").doc(sku);
    const docSnap = await docRef.get();
    const timestamp = firebase.firestore.Timestamp.now();

    const payload = removeInvalid({ nome, link, sku, imagem, data, criadoEm: timestamp });

    if (docSnap.exists) {
      await docRef.update(payload);
    } else {
      await docRef.set(payload);
    }

    document.getElementById("msgCadastro").innerText = "Cadastro salvo com sucesso!";
    setTimeout(() => {
      document.getElementById("msgCadastro").innerText = "";
    }, 3000);
    
    form.reset();
  } catch (err) {
    console.error("Erro ao salvar cadastro", err);
    alert("Falha ao salvar cadastro.");
  }
});
async function gerarGraficoEvolucao() {
  const id1 = document.getElementById("filtroEvolucaoAnuncio1").value;
  const id2 = document.getElementById("filtroEvolucaoAnuncio2").value;
  const dias = parseInt(document.getElementById("filtroEvolucaoPeriodo").value);

  if (!id1) return alert("Selecione ao menos o Anúncio 1");

  const hoje = new Date();
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() - dias);

  async function obterDados(id) {
    const historicoRef = db.collection('desempenho').doc(id).collection('historico');
    const snap = await historicoRef
      .where('dataRegistro', '>=', dataLimite.toISOString())
      .orderBy('dataRegistro')
      .get();

    return snap.docs.map(doc => doc.data());
  }

  const dados1 = await obterDados(id1);
  const dados2 = id2 ? await obterDados(id2) : [];

  const labels = dados1.map(d => new Date(d.dataRegistro).toLocaleDateString());
  const conv1 = dados1.map(d => parseFloat(d.conversao || 0));
  const conv2 = dados2.map(d => parseFloat(d.conversao || 0));
  const views1 = dados1.map(d => d.visualizacoes || 0);
  const cliques1 = dados1.map(d => d.cliques || 0);

  const ctxLinha = document.getElementById("graficoLinhaConversao").getContext("2d");
  const ctxBarras = document.getElementById("graficoBarrasMetricas").getContext("2d");

  if (window.chartLinha) window.chartLinha.destroy();
  if (window.chartBarras) window.chartBarras.destroy();

  window.chartLinha = new Chart(ctxLinha, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Conversão - ${id1}`,
          data: conv1,
          borderColor: 'blue',
          fill: false
        },
        id2 && {
          label: `Conversão - ${id2}`,
          data: conv2,
          borderColor: 'orange',
          fill: false
        }
      ].filter(Boolean)
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}%` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Conversão (%)' },
          ticks: { callback: v => `${v}%` }
        }
      }
    }
  });

  window.chartBarras = new Chart(ctxBarras, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `Visualizações - ${id1}`,
          data: views1,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        },
        {
          label: `Cliques - ${id1}`,
          data: cliques1,
          backgroundColor: 'rgba(255, 206, 86, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Volume' } }
      }
    }
  });
}
