export const sanitize = (v) => (v == null ? '' : String(v));
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
