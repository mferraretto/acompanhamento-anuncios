document.getElementById("savePedidosBtn").addEventListener("click", async () => {
  try {
    const input = document.getElementById("inputPlanilhaPedidos");
    const preview = document.getElementById("previewPedidos");
    if (!input.files.length) return alert("Selecione a planilha de pedidos.");

   const file = input.files[0];
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  let html = "<table><tr><th>SKU</th><th>Status</th><th>Valor</th></tr>";
    for (let row of data) {
      html += `<tr><td>${row["SKU"] || ""}</td><td>${row["Status"] || ""}</td><td>${row["Valor"] || ""}</td></tr>`;
      await db.collection("pedidos").add(row);
    }
    html += "</table>";
    preview.innerHTML = html;
    alert("Pedidos salvos no Firebase!");
  } catch (err) {
    console.error("Erro ao salvar pedidos", err);
    alert("Falha ao salvar pedidos.");
  }
 
});
