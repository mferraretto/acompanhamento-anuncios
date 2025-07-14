// Parse and merge Shopee spreadsheets (basic, media and shipping)
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
      // Skip technical header row (first row) when parsing
      return XLSX.utils.sheet_to_json(sheet, { defval: '', range: 1 });
    };

 const merged = {};

    for (let file of files) {
      const lower = file.name.toLowerCase();
      const rows = await readExcel(file);
      for (const row of rows) {
        const productId = row['et_title_product_id'];
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
         merged[productId].weight = row['weight'] || row['Peso do Produto/kg'];
          merged[productId].length = row['length'] || row['Comprimento'];
          merged[productId].width = row['width'] || row['Largura'];
          merged[productId].height = row['height'] || row['Altura'];
        }
      }
    }
  

   let html = '<table><tr><th>ID</th><th>SKU</th><th>Nome</th><th>Peso</th><th>Medidas</th><th>Imagem</th></tr>';
   for (const productId in merged) {
      const item = merged[productId];
      html += `<tr>
        <td>${productId}</td>
        <td>${item.sku || ''}</td>
        <td>${item.name || ''}</td>
        <td>${item.weight || ''}</td>
        <td>${(item.length || '')} x ${(item.width || '')} x ${(item.height || '')}</td>
        <td><img src="${item.main_image || ''}" width="50"/></td>
      </tr>`;

   await db.collection('anuncios').doc(productId).set(item, { merge: true });
    }
    html += '</table>';
    preview.innerHTML = html;
    alert('Anúncios salvos no Firebase!');
  } catch (err) {
    console.error('Erro ao salvar planilhas', err);
    alert('Falha ao salvar planilhas.');
  }
});
