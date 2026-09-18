import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (product, unit = null) => {
                const items = get().items;

                // Identificamos el item por ID de producto Y ID de conversión (o null si es base)
                const unitId = unit && unit.unidad_id ? unit.unidad_id : null;
                const conversionId = unit && unit.id ? unit.id : null;

                const existingItem = items.find(
                    (item) =>
                        item.id === product.id &&
                        item.conversion_id === conversionId,
                );

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id &&
                            item.conversion_id === conversionId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                id: product.id,
                                nombre: product.nombre,
                                precio: unit
                                    ? parseFloat(unit.precio_venta)
                                    : parseFloat(product.precio_venta),
                                quantity: 1,
                                unit_id: unitId,
                                unit_name: unit
                                    ? unit.unidad.nombre
                                    : product.unidad_medida,
                                image: product.imagen_url,
                                stock_base: product.stock,
                                factor: unit ? parseFloat(unit.factor) : 1,
                                conversion_id: conversionId,
                                discount: 0,
                            },
                        ],
                    });
                }
            },

            updateQuantity: (id, conversion_id, quantity) => {
                if (quantity < 1) return;
                const items = get().items;
                set({
                    items: items.map((item) =>
                        item.id === id && item.conversion_id === conversion_id
                            ? { ...item, quantity }
                            : item,
                    ),
                });
            },

            removeFromCart: (id, conversion_id) => {
                set({
                    items: get().items.filter(
                        (item) =>
                            !(
                                item.id === id &&
                                item.conversion_id === conversion_id
                            ),
                    ),
                });
            },

            setDiscount: (id, conversion_id, amount) => {
                set({
                    items: get().items.map((item) =>
                        item.id === id && item.conversion_id === conversion_id
                            ? {
                                  ...item,
                                  discount: Math.max(
                                      parseFloat(amount) || 0,
                                      0,
                                  ),
                              }
                            : item,
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getSubtotal: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.precio * item.quantity,
                    0,
                );
            },

            getTotal: () => {
                return get().items.reduce((acc, item) => {
                    const lineTotal = item.precio * item.quantity;
                    return (
                        acc +
                        Math.max(
                            lineTotal - (parseFloat(item.discount) || 0),
                            0,
                        )
                    );
                }, 0);
            },

            getDiscountTotal: () => {
                return get().items.reduce((acc, item) => {
                    const lineTotal = item.precio * item.quantity;
                    return (
                        acc +
                        Math.min(parseFloat(item.discount) || 0, lineTotal)
                    );
                }, 0);
            },

            getCount: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.quantity,
                    0,
                );
            },
        }),
        {
            name: 'cart-storage',
        },
    ),
);
