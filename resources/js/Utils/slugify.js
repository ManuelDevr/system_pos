export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function productRoute(routeFn, product) {
  return routeFn('productos.show', [product.id, slugify(product.nombre)]);
}
