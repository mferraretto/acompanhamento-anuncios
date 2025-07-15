export const sanitize = (v) => {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
export const parseNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  const str = String(value ?? '').trim();
  if (!str) return 0;
const cleaned = str
    .replace(/R\$/g, '')
    .replace(/%/g, '')
    .replace(/\s+/g, '');
  let normalized = cleaned;
  if (str.includes(',') && str.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    normalized = cleaned.replace(',', '.');
  }
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
};
export const removeInvalid = (obj) => {
 if (Array.isArray(obj)) {
    return obj
      .map((v) => removeInvalid(v))
      .filter(
        (v) =>
          v !== undefined && (typeof v !== 'number' || Number.isFinite(v))
      );
  }

  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const cleaned = removeInvalid(v);
      if (cleaned !== undefined) {
        out[k] = cleaned;
      }
    }
    return out;
  }

  if (obj === undefined) {
    return undefined;
  }

  if (typeof obj === 'number' && !Number.isFinite(obj)) {
    return undefined;
  }
  return obj;
};
export function cleanItem(dado) {
  // coloque aqui a lógica da sua função
  // por exemplo:
  return {
    itemId: dado.itemId || '',
    nome: sanitize(dado.nome),
    visualizacoes: parseNumber(dado.visualizacoes),
    cliques: parseNumber(dado.cliques),
    conversao: parseNumber(dado.conversao),
    dataRegistro: dado.dataRegistro || new Date().toISOString()
  };
}
