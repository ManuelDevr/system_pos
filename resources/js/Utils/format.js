export const cleanStock = (stock) => {
  const n = parseFloat(stock);
  if (!Number.isFinite(n)) return 0;
  if (Number.isInteger(n)) return n;
  return parseFloat(n.toFixed(2));
};

export const unitLabel = (unidad, stock) => {
  const u = String(unidad || 'UN').trim();
  if (/^(UN|UND|U)$/i.test(u)) return 'UN';
  if (Number(stock) > 1) {
    const lower = u.toLowerCase();
    if (lower.endsWith('d')) return `${u}es`;
    if (lower.endsWith('s')) return u;
    return `${u}s`;
  }
  return u;
};

export const formatStock = (stock, unidad) => `${cleanStock(stock)} ${unitLabel(unidad, stock)}`;

export const formatFactor = (factor) => {
  const n = parseFloat(factor);
  if (!Number.isFinite(n)) return factor ?? '';
  return Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(4)).toString();
};