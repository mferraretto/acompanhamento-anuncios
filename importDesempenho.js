import { sanitize } from './utils.js';

document.getElementById('btnSalvarDesempenho').addEventListener('click', async () => {
  try {
    const input = document.getElementById('inputPlanilhaDesempenho');
    const file = input.files[0];
    if (!file) return alert('Selecione a planilha de desempenho.');

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    ['Item ID', 'SKU', 'Parent SKU', 'Visitas', 'Cliques', 'Pedidos', 'Receita', 'Conversão (%)'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (const row of rows) {
      const id = String(row['Item ID'] || '').trim();
      if (!id) continue;

      const visitas = parseInt(row['Total Visits']) || 0;
      const cliques = parseInt(row['Total Clicks']) || 0;
      const pedidos = parseInt(row['Total Orders']) || 0;
      const receita = parseFloat(row['Sales Revenue']) || 0;
      const conversao = cliques > 0 ? ((pedidos / cliques) * 100).toFixed(2) : '0.00';

      // Mostrar na tabela
      const tr = document.createElement('tr');
      [id, row['SKU'], row['Parent SKU'], visitas, cliques, pedidos, receita.toFixed(2), conversao].forEach(val => {
        const td = document.createElement('td');
        td.textContent = sanitize(val);
        tr.appendChild(td);
      });
      table.appendChild(tr);

      // Salvar no Firebase em um subdocumento de desempenho
      await db.collection('anuncios').doc(id).set({
        desempenho: {
          visitas,
          cliques,
          pedidos,
          receita,
          conversao: parseFloat(conversao),
          dataAtualizacao: new Date().toISOString()
        }
      }, { merge: true });
    }

    document.getElementById('previewDesempenho').innerHTML = '';
    document.getElementById('previewDesempenho').appendChild(table);
    alert('Desempenho salvo no Firebase!');
  } catch (err) {
    console.error('Erro ao importar desempenho:', err);
    alert('Falha ao salvar desempenho.');
  }
});
