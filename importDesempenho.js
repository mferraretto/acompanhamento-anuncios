import { sanitize, parseNumber, removeInvalid } from './utils.js';
const db = window.db;

document.getElementById('btnSalvarDesempenho').addEventListener('click', async () => {
  const input = document.getElementById('inputPlanilhaDesempenho');
  const preview = document.getElementById('previewDesempenho');
  const cardsContainer = document.getElementById('desempenhoCards');

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
  ['SKU', 'Visualizações', 'Cliques', 'Vendas', 'Conversão (%)', 'Receita'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  cardsContainer.innerHTML = '';

 try {
    for (const row of rows) {
      const sku = row['Identificação do Produto'] || row['SKU'] || row['Parent SKU'] || '';
      if (!sku) continue;


      const dados = {
        sku,
        visualizacoes: parseNumber(row['Total de visualizações'] || row['Visualizações'] || 0),
        cliques: parseNumber(row['Total de cliques'] || row['Cliques'] || 0),
        vendas: parseNumber(row['Total de pedidos pagos'] || row['Vendas'] || 0),
        conversao: parseNumber(row['Taxa de conversão (%)'] || row['Conversão (%)'] || 0),
        receita: parseNumber(row['Valor total do pedido'] || row['Receita'] || 0),
        dataRegistro: new Date().toISOString()
      };

      const tr = document.createElement('tr');
      [dados.sku, dados.visualizacoes, dados.cliques, dados.vendas, dados.conversao, dados.receita].forEach(val => {
        const td = document.createElement('td');
        td.textContent = sanitize(val);
        tr.appendChild(td);
      });
      table.appendChild(tr);
       const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${sanitize(sku)}</h3>
        <p>👁 Visualizações: <strong>${dados.visualizacoes}</strong></p>
        <p>🖱 Cliques: <strong>${dados.cliques}</strong></p>
        <p>🛒 Vendas: <strong>${dados.vendas}</strong></p>
        <p>📈 Conversão: <strong>${dados.conversao}%</strong></p>
        <p>💰 Receita: <strong>R$ ${dados.receita.toFixed(2)}</strong></p>
      `;
      cardsContainer.appendChild(card);

    const payload = removeInvalid(dados);
      await db.collection('desempenho').doc(sku).set(payload, { merge: true });
    }
  } catch (err) {
    console.error('Erro ao salvar desempenho', err);
    alert('Falha ao salvar desempenho');
    return;
  }

  preview.innerHTML = '';
  preview.appendChild(table);
  alert('Dados de desempenho salvos com sucesso!');
});
