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
  let normalized = str;
  if (str.includes(',') && str.includes('.')) {
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    normalized = str.replace(',', '.');
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
