document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value.trim();
  const link = form.link.value.trim();
  const sku = form.sku.value.trim();
  const imagem = form.imagem.value.trim();
  const data = form.data.value;

  if (!nome || !link || !sku || !imagem || !data) {
    document.getElementById("msgCadastro").innerText = "Preencha todos os campos.";
    return;
  }

  const docRef = db.collection("anuncios").doc(sku);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    await docRef.update({ nome, link, imagem, data });
  } else {
    await docRef.set({ nome, link, imagem, data });
  }

  document.getElementById("msgCadastro").innerText = "Cadastro salvo com sucesso!";
  form.reset();
});
