document.getElementById("btnSalvarShopeePlanilhas").addEventListener("click", async () => {
  try {
    const input = document.getElementById("inputShopeePlanilhas");
    const preview = document.getElementById("previewShopeePlanilhas");
    const files = input.files;

    if (!files.length) return alert("Nenhuma planilha selecionada.");

    let combinedData = {};

     const readExcel = async (file) => {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      return data;
    };

for (let file of files) {
      const data = await readExcel(file);
      const headers = data[1]; // segunda linha tem os nomes dos campos
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        const sku = row[headers["SKU de referência"]] || row["SKU de referência"];
        if (!sku) continue;
        if (!combinedData[sku]) combinedData[sku] = {};
        Object.keys(headers).forEach((key) => {
          combinedData[sku][headers[key]] = row[key];
        });
      }
    }
  

   let html = "<table><tr><th>Imagem</th><th>Nome</th><th>SKU</th><th>Peso</th><th>Medidas</th></tr>";
    for (let sku in combinedData) {
      const item = combinedData[sku];
      html += `<tr>
        <td><img src="${item['Imagem de capa'] || ""}" width="50"/></td>
        <td>${item['Nome do Produto'] || ""}</td>
        <td>${sku}</td>
        <td>${item['Peso do Produto/kg'] || ""}</td>
        <td>${item['Comprimento'] || ""} x ${item['Largura'] || ""} x ${item['Altura'] || ""}</td>
      </tr>`;

   // Salvar no Firestore
      const docRef = db.collection("anuncios").doc(sku);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        await docRef.update(item);
      } else {
        await docRef.set(item);
      }
  }
 html += "</table>";
    preview.innerHTML = html;
    alert("Anúncios salvos no Firebase!");
  } catch (err) {
    console.error("Erro ao salvar planilhas", err);
    alert("Falha ao salvar planilhas.");
      }
});
