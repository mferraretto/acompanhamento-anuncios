document.getElementById("btnSalvarShopeePlanilhas").addEventListener("click", async () => {
  const input = document.getElementById("inputShopeePlanilhas");
  const preview = document.getElementById("previewShopeePlanilhas");
  const files = input.files;

  if (!files.length) return alert("Nenhuma planilha selecionada.");

  let combinedData = {};

  const readExcel = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Segunda linha (index 1) contém os nomes reais dos campos
    const headerRow = rows[1];
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      let rowObj = {};
      for (let j = 0; j < headerRow.length; j++) {
        const colName = headerRow[j];
        rowObj[colName] = row[j];
      }

      const sku = rowObj["SKU de referência"];
      if (!sku) continue;

      if (!combinedData[sku]) combinedData[sku] = {};
      Object.assign(combinedData[sku], rowObj);
    }
  };

  for (let file of files) {
    await readExcel(file);
  }

  let html = "<table><tr><th>Imagem</th><th>Nome</th><th>SKU</th><th>Peso</th><th>Medidas</th></tr>";
  for (let sku in combinedData) {
    const item = combinedData[sku];

    // Campos padronizados
    const produto = {
      sku: sku,
      nome: item["Nome do Produto"] || "",
      descricao: item["Descrição do Produto"] || "",
      imagem: item["Imagem de capa"] || "",
      peso: item["Peso do Produto/kg"] || "",
      medidas: {
        comprimento: item["Comprimento"] || "",
        largura: item["Largura"] || "",
        altura: item["Altura"] || ""
      },
      dataAtualizacao: new Date().toISOString()
    };

    html += `<tr>
      <td><img src="${produto.imagem}" width="50"/></td>
      <td>${produto.nome}</td>
      <td>${produto.sku}</td>
      <td>${produto.peso}</td>
      <td>${produto.medidas.comprimento} x ${produto.medidas.largura} x ${produto.medidas.altura}</td>
    </tr>`;

    try {
      await db.collection("anuncios").doc(sku).set(produto, { merge: true });
    } catch (err) {
      console.error("Erro ao salvar SKU:", sku, err);
    }
  }

  html += "</table>";
  preview.innerHTML = html;
  alert("✅ Anúncios salvos com sucesso!");
});
