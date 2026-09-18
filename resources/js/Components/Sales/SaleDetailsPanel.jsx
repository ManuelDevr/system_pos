import { Minus, Plus, Search, Trash2 } from 'lucide-react';

export default function SaleDetailsPanel({
    searchTerm,
    setSearchTerm,
    filteredProducts,
    addToCart,
    cart,
    updateQty,
    removeItem,
    setDiscount,
    igvRate,
    subtotal,
    discountTotal,
    igv,
    total,
    paidWith,
    setPaidWith,
    vuelto,
    isValidMonto,
    paymentMethod,
    isScanning,
}) {
    const qtyOf = (productId) =>
        cart.find((i) => i.id === productId)?.quantity || 0;

    const lineTotal = (item) =>
        Math.max(
            item.precio * item.quantity - (parseFloat(item.discount) || 0),
            0,
        );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600">
                    Detalles de Venta
                </h2>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                    {cart.length} producto{cart.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Buscar Producto */}
            <div className="relative">
                {isScanning && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        Escaneando...
                    </span>
                )}
                <Search
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isScanning ? 'hidden' : 'text-slate-400'
                    }`}
                />
                <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchTerm.trim().length > 3) {
                            const found = filteredProducts.length > 0;
                            if (found) {
                                addToCart(filteredProducts[0]);
                            }
                        }
                    }}
                    placeholder="Buscar producto por nombre o código..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                />
                {filteredProducts.length > 0 && searchTerm.trim() && (
                    <div className="custom-scrollbar absolute z-30 mt-2 w-full overflow-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                        {filteredProducts.map((p) => {
                            const present = qtyOf(p.id) > 0;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-violet-50"
                                >
                                    <span className="text-slate-400">
                                        {present ? (
                                            <CheckChip />
                                        ) : (
                                            <Plus size={15} />
                                        )}
                                    </span>
                                    <span className="flex-1 truncate text-sm font-bold text-slate-800">
                                        {p.nombre}
                                    </span>
                                    <span className="text-sm font-semibold text-violet-600">
                                        S/ {p.precio_venta}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tabla de productos */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="custom-scrollbar max-h-[40vh] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10 bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Producto</th>
                                <th className="px-3 py-3 text-center">Cant.</th>
                                <th className="px-3 py-3 text-right">
                                    P. Unit.
                                </th>
                                <th className="px-3 py-3 text-right">
                                    Desc. S/
                                </th>
                                <th className="px-3 py-3 text-right">Total</th>
                                <th className="px-2 py-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {cart.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center"
                                    >
                                        <p className="text-sm font-semibold text-slate-400">
                                            No hay productos en la venta
                                        </p>
                                    </td>
                                </tr>
                            )}
                            {cart.map((item) => (
                                <tr key={`${item.id}-${item.conversion_id}`}>
                                    <td className="px-4 py-3">
                                        <p className="max-w-[180px] truncate text-sm font-bold text-slate-800">
                                            {item.nombre}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Cód: {item.id}
                                        </p>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200">
                                            <button
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.conversion_id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="p-1.5 text-slate-500 hover:text-violet-600"
                                            >
                                                <Minus size={13} />
                                            </button>
                                            <span className="w-6 text-center text-sm font-black text-slate-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.conversion_id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="p-1.5 text-slate-500 hover:text-violet-600"
                                            >
                                                <Plus size={13} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-right text-sm font-medium text-slate-500">
                                        S/ {item.precio.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.discount || ''}
                                            onChange={(e) =>
                                                setDiscount(
                                                    item.id,
                                                    item.conversion_id,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-sm font-bold text-slate-700 focus:border-violet-500 focus:ring-0"
                                        />
                                    </td>
                                    <td className="px-3 py-3 text-right text-sm font-black text-slate-800">
                                        S/ {lineTotal(item).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                removeItem(
                                                    item.id,
                                                    item.conversion_id,
                                                )
                                            }
                                            className="p-1.5 text-slate-300 transition-colors hover:text-red-500"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resumen horizontal: Subtotal / IGV / Total */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Subtotal
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-700">
                        S/ {(subtotal - discountTotal).toFixed(2)}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        IGV ({igvRate * 100}%)
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-700">
                        S/ {igv.toFixed(2)}
                    </p>
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-600 p-4 text-center shadow-lg shadow-violet-100">
                    <p className="text-[11px] font-black uppercase tracking-widest text-violet-100">
                        Total
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                        S/ {total.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Monto recibido y vuelto (solo efectivo) */}
            {paymentMethod === 'Efectivo' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-100/60 p-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                Monto recibido{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={paidWith}
                                onChange={(e) =>
                                    setPaidWith(sanitizeAmount(e.target.value))
                                }
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-bold shadow-sm focus:ring-0 ${
                                    !isValidMonto
                                        ? 'border-red-400 text-red-600 focus:border-red-500'
                                        : 'border-slate-200 text-slate-800 focus:border-violet-500'
                                }`}
                            />
                            {!isValidMonto && (
                                <p className="text-[10px] font-bold text-rose-500">
                                    Debe ser un número mayor al total (S/{' '}
                                    {total.toFixed(2)})
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                Vuelto
                            </label>
                            <div
                                className={`flex h-[46px] items-center rounded-xl border px-4 text-lg font-black shadow-sm ${
                                    isValidMonto
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-slate-50 text-slate-300'
                                }`}
                            >
                                S/ {vuelto.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function sanitizeAmount(value) {
    let clean = value.replace(/[^0-9.]/g, '');
    const firstDot = clean.indexOf('.');
    if (firstDot !== -1) {
        clean =
            clean.slice(0, firstDot + 1) +
            clean.slice(firstDot + 1).replace(/\./g, '');
    }
    return clean;
}

function CheckChip() {
    return (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">
            ✓
        </span>
    );
}
