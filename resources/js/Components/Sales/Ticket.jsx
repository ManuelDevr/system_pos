import { usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';
import React from 'react';

const Ticket = React.forwardRef(({ sale }, ref) => {
    const { config } = usePage().props;

    if (!sale) return null;

    // Formatear fecha y hora
    const fechaEmision = sale.created_at
        ? new Date(sale.created_at).toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleDateString('es-PE');
    const horaEmision = sale.created_at
        ? new Date(sale.created_at).toLocaleTimeString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleTimeString('es-PE');

    // Determinar ruta del logo de la empresa
    const logoUrl = config?.logo_empresa
        ? config.logo_empresa.startsWith('http://') ||
          config.logo_empresa.startsWith('https://')
            ? config.logo_empresa
            : `/storage/${config.logo_empresa}`
        : null;

    return (
        <div
            ref={ref}
            className="w-[280px] bg-white p-4 font-mono text-[10px] leading-tight text-black"
        >
            {/* Información de la Empresa */}
            <div className="mb-2 space-y-1 text-center">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="mx-auto h-auto max-h-12 w-12 object-contain"
                    />
                ) : (
                    <Package className="mx-auto h-6 w-6 text-slate-400" />
                )}
                <h2 className="text-xs font-bold uppercase">
                    {config?.nombre_empresa || 'Ferretería CMA'}
                </h2>
                {config?.direccion && (
                    <p className="text-[9px]">{config.direccion}</p>
                )}
                {config?.ruc && <p className="text-[9px]">RUC: {config.ruc}</p>}
                {config?.telefono && (
                    <p className="text-[9px]">Tel: {config.telefono}</p>
                )}
            </div>

            <div className="my-2 border-t border-dashed border-black"></div>

            {/* Datos del Comprobante */}
            <div className="mb-2 space-y-0.5">
                <p className="font-bold">COMPROBANTE: {sale.nro_comprobante}</p>
                <p>FECHA DE EMISIÓN: {fechaEmision}</p>
                <p>HORA: {horaEmision}</p>
                <p className="truncate">
                    CLIENTE:{' '}
                    <span className="font-bold">
                        {sale.nombre_cliente ||
                            sale.cliente?.nombre ||
                            'CLIENTES VARIOS'}
                    </span>
                </p>
                {(sale.documento_cliente || sale.cliente?.ruc_dni) && (
                    <p>
                        DNI/RUC:{' '}
                        {sale.documento_cliente || sale.cliente?.ruc_dni}
                    </p>
                )}
                <p className="truncate">
                    VENDEDOR: {sale.user?.name || 'Cajero'}
                </p>
            </div>

            <div className="my-2 border-t border-dashed border-black"></div>

            {/* Detalle de Artículos */}
            <table className="w-full text-[9px]">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="w-[35px] pb-1 text-left font-bold">
                            CANT.
                        </th>
                        <th className="w-[40px] pb-1 text-left font-bold">
                            SKU
                        </th>
                        <th className="w-[35px] pb-1 text-left font-bold">
                            U.D.M.
                        </th>
                        <th className="pb-1 text-left font-bold">
                            DESCRIPCIÓN
                        </th>
                        <th className="w-[45px] pb-1 text-right font-bold">
                            P.U.
                        </th>
                        <th className="w-[50px] pb-1 text-right font-bold">
                            TOTAL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sale.detalles?.map((item) => {
                        const productSku = item.producto?.sku || 'N/A';
                        const unitAbrev =
                            item.unidad?.abreviatura ||
                            item.producto?.unidad_medida ||
                            'UN';
                        const productName = item.producto?.nombre || 'Producto';
                        const unitPrice = parseFloat(
                            item.precio_unitario || 0,
                        ).toFixed(2);
                        const totalItem = parseFloat(
                            item.subtotal || 0,
                        ).toFixed(2);
                        const discountItem = parseFloat(item.descuento || 0);

                        return (
                            <tr
                                key={item.id}
                                className="border-b border-slate-100 last:border-b-0"
                            >
                                <td className="py-1 align-top font-bold">
                                    {item.cantidad}
                                </td>
                                <td className="truncate py-1 align-top text-[8px]">
                                    {productSku}
                                </td>
                                <td className="py-1 align-top uppercase">
                                    {unitAbrev}
                                </td>
                                <td className="max-w-[90px] break-words py-1">
                                    {productName}
                                    {discountItem > 0 && (
                                        <span className="block text-[8px] text-black/60">
                                            Desc: -S/ {discountItem.toFixed(2)}
                                        </span>
                                    )}
                                </td>
                                <td className="py-1 text-right align-top">
                                    S/ {unitPrice}
                                </td>
                                <td className="py-1 text-right align-top font-bold">
                                    S/ {totalItem}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="my-2 border-t border-dashed border-black"></div>

            {/* Totales */}
            <div className="mb-3 space-y-1 text-right text-[9px]">
                <p className="text-xs font-bold">
                    IMPORTE TOTAL: S/ {parseFloat(sale.total || 0).toFixed(2)}
                </p>
                <div className="my-1 border-t border-dotted border-black/50"></div>
                {parseFloat(sale.descuento || 0) > 0 && (
                    <p>
                        DESCUENTO:{' '}
                        <span className="font-bold">
                            -S/ {parseFloat(sale.descuento).toFixed(2)}
                        </span>
                    </p>
                )}
                <p>
                    MÉTODO DE PAGO:{' '}
                    <span className="font-bold">
                        {sale.metodo_pago || 'EFECTIVO'}
                    </span>
                </p>
                {sale.pagado_con !== undefined && sale.pagado_con !== null && (
                    <p>PAGO CON: S/ {parseFloat(sale.pagado_con).toFixed(2)}</p>
                )}
                {sale.vuelto !== undefined && sale.vuelto !== null && (
                    <p>VUELTO: S/ {parseFloat(sale.vuelto).toFixed(2)}</p>
                )}
            </div>

            <div className="mt-2 space-y-0.5 border-t border-dashed border-black pt-2 text-center text-[9px]">
                <div className="text-[8px]">
                    <p className="font-bold">¡Gracias por su compra!</p>
                    <p>Ferretería CMA le desea un excelente día.</p>
                </div>
            </div>
        </div>
    );
});

Ticket.displayName = 'Ticket';

export default Ticket;
