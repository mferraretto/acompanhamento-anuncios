export const sanitize = (v) => (v == null ? '' : String(v));
export const removeInvalid = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && (typeof v !== 'number' || Number.isFinite(v))) {
      out[k] = v;
    }
  }
  return out;
};
