import { registrarAlteracoes } from './logAlteracoes.js';
import { db } from './firebase.js';

// Parse and merge Shopee spreadsheets (basic, media and shipping)
import { sanitize, removeInvalid } from './utils.js';

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
      // Skip metadata rows (first two rows) and use the third row as header
      return XLSX.utils.sheet_to_json(sheet, { defval: '', range: 2 });
    };

 const merged = {};

    for (let file of files) {
      const lower = file.name.toLowerCase();
      const rows = await readExcel(file);
      for (const row of rows) {
let productId = row['ID do Produto'] ?? row['et_title_product_id'];
        if (!productId && lower.includes('shipping')) {
          productId = row['SKU'] || row['item_sku'] || row['SKU de referência'];
        }
        if (!productId) continue;
        if (!merged[productId]) merged[productId] = {};

        if (lower.includes('basic')) {
          merged[productId].sku = row['SKU'] || row['item_sku'] || row['SKU de referência'];
          merged[productId].name = row['name'] || row['Nome do Produto'];
          merged[productId].description = row['description'] || row['Descrição do Produto'];
        } else if (lower.includes('media')) {
          merged[productId].main_image = row['main_image'] || row['Imagem de capa'];
          const secondary = [];
          Object.keys(row).forEach(k => {
            const lk = k.toLowerCase();
            if (lk.startsWith('image') && lk !== 'main_image' && row[k]) {
              secondary.push(row[k]);
            }
          });
          if (secondary.length) merged[productId].secondary_images = secondary;
        } else if (lower.includes('shipping')) {
         merged[productId].weight =
            row['weight'] ||
            row['Peso do Produto/kg'] ||
            row['et_title_product_weight'];
          merged[productId].length =
            row['length'] ||
            row['Comprimento'] ||
            row['et_title_product_length'];
          merged[productId].width =
            row['width'] ||
            row['Largura'] ||
            row['et_title_product_width'];
          merged[productId].height =
            row['height'] ||
            row['Altura'] ||
            row['et_title_product_height'];
        }
      }
    }
  

   const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['ID', 'SKU', 'Nome', 'Peso', 'Medidas', 'Imagem'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (const productId in merged) {
    const item = merged[productId];
    const row = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.textContent = sanitize(productId);
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

    table.appendChild(row);

const cleanItem = removeInvalid(item);
const docRef = db.collection('anuncios').doc(productId);
const docSnap = await docRef.get();
const antigo = docSnap.exists ? docSnap.data() : {};
await registrarAlteracoes(productId, 'Shopee', cleanItem, antigo);
await docRef.set(cleanItem, { merge: true });
  }

  preview.innerHTML = '';
  preview.appendChild(table);
    alert('Anúncios salvos no Firebase!');
  } catch (err) {
    console.error('Erro ao salvar planilhas', err);
    alert('Falha ao salvar planilhas.');
  }
});
