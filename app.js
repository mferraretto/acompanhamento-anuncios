const removeInvalid = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && (typeof v !== 'number' || Number.isFinite(v))) {
      out[k] = v;
    }
  }
  return out;
};

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
 try {
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
       const payload = removeInvalid({ nome, link, imagem, data });
    if (docSnap.exists) {
      await docRef.update(payload);
    } else {
      await docRef.set(payload);
    }

 document.getElementById("msgCadastro").innerText = "Cadastro salvo com sucesso!";
    form.reset();
  } catch (err) {
    console.error("Erro ao salvar cadastro", err);
    alert("Falha ao salvar cadastro.");
  }
});
