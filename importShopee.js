import { registrarAlteracoes } from './logAlteracoes.js';
import { sanitize, removeInvalid } from './utils.js';

const db = window.db;

document.getElementById('btnSalvarShopeePlanilhas').addEventListener('click', async () => {
  try {
    const input = document.getElementById('inputShopeePlanilhas');
    const preview = document.getElementById('previewShopeePlanilhas');
    const files = input.files;

    if (!files.length) return alert('Nenhuma planilha selecionada.');

    const readExcel = async (file) => {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { defval: '', range: 2 });
    };

    const merged = {};

    for (let file of files) {
      const lower = file.name.toLowerCase();
      const rows = await readExcel(file);
      for (const row of rows) {
        const itemId = row['ID do Produto'] ?? row['et_title_product_id'];
        if (!itemId) continue;
        if (!merged[itemId]) merged[itemId] = {};

        if (lower.includes('basic')) {
          merged[itemId].sku = row['SKU'] || row['item_sku'] || row['SKU de referência'];
          merged[itemId].name = row['name'] || row['Nome do Produto'];
          merged[itemId].description = row['description'] || row['Descrição do Produto'];
        } else if (lower.includes('media')) {
          merged[itemId].main_image = row['main_image'] || row['Imagem de capa'];
          const secondary = [];
          Object.keys(row).forEach(k => {
            const lk = k.toLowerCase();
            if (lk.startsWith('image') && lk !== 'main_image' && row[k]) {
              secondary.push(row[k]);
            }
          });
          if (secondary.length) merged[itemId].secondary_images = secondary;
        } else if (lower.includes('shipping')) {
          merged[itemId].weight = row['weight'] || row['Peso do Produto/kg'] || row['et_title_product_weight'];
          merged[itemId].length = row['length'] || row['Comprimento'] || row['et_title_product_length'];
          merged[itemId].width = row['width'] || row['Largura'] || row['et_title_product_width'];
          merged[itemId].height = row['height'] || row['Altura'] || row['et_title_product_height'];
        }
      }
    }

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    ['ID', 'SKU', 'Nome', 'Peso', 'Medidas', 'Imagem', 'Conversão (%)'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (const itemId in merged) {
      const item = merged[itemId];
      const row = document.createElement('tr');

      const idTd = document.createElement('td');
      idTd.textContent = sanitize(itemId);
      row.appendChild(idTd);

      const skuTd = document.createElement('td');
      skuTd.textContent = sanitize(item.sku);
      row.appendChild(skuTd);

      const nameTd = document.createElement('td');
      nameTd.textContent = sanitize(item.name);
      row.appendChild(nameTd);

      const weightTd = document.createElement('td');
      weightTd.textContent = sanitize(item.weight);
      row.appendChild(weightTd);

      const measureTd = document.createElement('td');
      measureTd.textContent = `${sanitize(item.length)} x ${sanitize(item.width)} x ${sanitize(item.height)}`;
      row.appendChild(measureTd);

      const imgTd = document.createElement('td');
      const img = document.createElement('img');
      img.src = sanitize(item.main_image);
      img.width = 50;
      imgTd.appendChild(img);
      row.appendChild(imgTd);

      const docRef = db.collection('anuncios').doc(itemId);
      const docSnap = await docRef.get();
      const antigo = docSnap.exists ? docSnap.data() : {};

      const desempenhoRef = await db.collection('desempenho').doc(itemId).get();
      const desempenho = desempenhoRef.exists ? desempenhoRef.data() : null;

      if (antigo.name && item.name !== antigo.name && desempenho) {
        const antigaConversao = parseFloat(antigo.conversao || 0);
        const novaConversao = parseFloat(desempenho.conversao || 0);
        const diff = novaConversao - antigaConversao;

        if (diff > 0) {
          nameTd.style.backgroundColor = '#d4edda';
          nameTd.title = `Nome alterado e conversão subiu ${diff.toFixed(2)}%`;
        } else if (diff < 0) {
          nameTd.style.backgroundColor = '#f8d7da';
          nameTd.title = `Nome alterado e conversão caiu ${Math.abs(diff).toFixed(2)}%`;
        }
      }

      const conversaoTd = document.createElement('td');
      if (desempenho) {
        const conversao = parseFloat(desempenho.conversao || 0);
        conversaoTd.textContent = `${conversao.toFixed(2)}%`;

        if (conversao < 1) {
          conversaoTd.style.color = 'red';
          conversaoTd.style.fontWeight = 'bold';
        } else if (conversao >= 2.5) {
          conversaoTd.style.color = 'green';
        }
      } else {
        conversaoTd.textContent = 'Sem dados';
        conversaoTd.style.color = 'gray';
      }
      row.appendChild(conversaoTd);

      const itemLimpo = removeInvalid(item);
      itemLimpo.itemId = itemId;
      await registrarAlteracoes(itemId, 'Shopee', itemLimpo, antigo);
      await docRef.set(itemLimpo, { merge: true });

      table.appendChild(row);
    }

    preview.innerHTML = '';
    preview.appendChild(table);
    alert('Anúncios salvos no Firebase!');
  } catch (err) {
    console.error('Erro ao salvar planilhas', err);
    alert('Falha ao salvar planilhas.');
  }
});

