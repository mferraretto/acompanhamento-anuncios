import { db } from './firebase.js';
import { sanitize } from './utils.js';

document.getElementById('btnSalvarDesempenho').addEventListener('click', async () => {
  const input = document.getElementById('inputPlanilhaDesempenho');
  const preview = document.getElementById('previewDesempenho');

  if (!input.files.length) {
    alert('Selecione a planilha de desempenho.');
    return;
  }

  const file = input.files[0];
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['SKU', 'Visualizações', 'Cliques', 'Vendas', 'CTR', 'Receita'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (const row of rows) {
    const sku = row['Identificação do Produto'] || row['SKU'] || row['Parent SKU'] || '';
    if (!sku) continue;

    const dados = {
      sku,
      visualizacoes: row['Total de visualizações'] || row['Visualizações'] || 0,
      cliques: row['Total de cliques'] || row['Cliques'] || 0,
      vendas: row['Total de pedidos pagos'] || row['Vendas'] || 0,
      conversao: row['Taxa de conversão (%)'] || row['Conversão (%)'] || 0,
      ctr: row['CTR'] || row['Taxa de conversão (%)'] || '0%',
      receita: row['Valor total do pedido'] || row['Receita'] || 0,
      dataRegistro: new Date().toISOString(),
      data: firebase.firestore.Timestamp.now()
    };

    // Exibir visualmente na tabela
    const tr = document.createElement('tr');
    [sku, dados.visualizacoes, dados.cliques, dados.vendas, dados.ctr, dados.receita].forEach(val => {
      const td = document.createElement('td');
      td.textContent = sanitize(val);
      tr.appendChild(td);
    });
    table.appendChild(tr);

    // Atualizar Firebase em duas coleções (anuncios e desempenho)
    await db.collection('anuncios').doc(sku).set({ desempenho: dados }, { merge: true });
    await db.collection('desempenho').doc(sku).set(dados, { merge: true });
  }

  preview.innerHTML = '';
  preview.appendChild(table);
  alert('Dados de desempenho salvos com sucesso!');
});

