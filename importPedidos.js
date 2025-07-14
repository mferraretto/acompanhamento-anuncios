
import { sanitize, removeInvalid } from './utils.js';

// Import logistics spreadsheet and update existing products
document.getElementById('savePedidosBtn').addEventListener('click', async () => {
  try {
    const input = document.getElementById('inputPlanilhaPedidos');
    const preview = document.getElementById('previewPedidos');
    if (!input.files.length) {
      return alert('Selecione a planilha de logística.');
    }


    const file = input.files[0];
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
   const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    ['ID', 'Peso', 'Comprimento', 'Largura', 'Altura'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (const row of rows) {
      const id = String(row['ID do Produto'] || '').trim();
      if (!id) continue;

      const peso = row['Peso do Produto/kg'];
      const comprimento = row['Comprimento'];
      const largura = row['Largura'];
      const altura = row['Altura'];

      const tr = document.createElement('tr');
      [id, peso, comprimento, largura, altura].forEach(val => {
        const td = document.createElement('td');
        td.textContent = sanitize(val);
        tr.appendChild(td);
      });
      table.appendChild(tr);

      const payload = removeInvalid({ peso, comprimento, largura, altura });
      await db.collection('anuncios').doc(id).set(payload, { merge: true });
    }

    preview.innerHTML = '';
    preview.appendChild(table);
    alert('Logística atualizada no Firebase!');
  } catch (err) {
   console.error('Erro ao salvar logística', err);
    alert('Falha ao salvar logística.');
  }
 });
