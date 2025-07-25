import { removeInvalid } from './utils.js';

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
    const timestamp = firebase.firestore.Timestamp.now();

    const payload = removeInvalid({ nome, link, sku, imagem, data, criadoEm: timestamp });

    if (docSnap.exists) {
      await docRef.update(payload);
    } else {
      await docRef.set(payload);
    }

    document.getElementById("msgCadastro").innerText = "Cadastro salvo com sucesso!";
    setTimeout(() => {
      document.getElementById("msgCadastro").innerText = "";
    }, 3000);
    
    form.reset();
  } catch (err) {
    console.error("Erro ao salvar cadastro", err);
    alert("Falha ao salvar cadastro.");
  }
});
