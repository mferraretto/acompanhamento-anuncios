
const sanitize = (v) => (v == null ? '' : String(v));
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
  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  ['SKU', 'Status', 'Valor'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (let row of data) {
    const tr = document.createElement('tr');
    const skuTd = document.createElement('td');
    skuTd.textContent = sanitize(row['SKU']);
    tr.appendChild(skuTd);

    const statusTd = document.createElement('td');
    statusTd.textContent = sanitize(row['Status']);
    tr.appendChild(statusTd);

    const valorTd = document.createElement('td');
    valorTd.textContent = sanitize(row['Valor']);
    tr.appendChild(valorTd);

    table.appendChild(tr);
    await db.collection("pedidos").add(row);
  }

  preview.innerHTML = '';
  preview.appendChild(table);
    alert("Pedidos salvos no Firebase!");
  } catch (err) {
    console.error("Erro ao salvar pedidos", err);
    alert("Falha ao salvar pedidos.");
  }
 
});
