export async function registrarAlteracoes(sku, origem, novoPayload, antigoPayload) {
  if (!sku || !novoPayload) return;

  for (const campo in novoPayload) {
    const novoValor = novoPayload[campo];
    const antigoValor = antigoPayload?.[campo];

    if (antigoValor !== undefined && antigoValor !== novoValor) {
      await db.collection('alteracoes').add({
        sku,
        campo,
        de: antigoValor,
        para: novoValor,
        data: new Date().toISOString(),
        origem
      });
    }
  }
}
