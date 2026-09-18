import { usePage } from '@inertiajs/react';
import React from 'react';

const InvoiceA4 = React.forwardRef(({ sale }, ref) => {
    const { config } = usePage().props;
    if (!sale) return null;

    const fecha = sale.created_at
        ? new Date(sale.created_at).toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleDateString('es-PE');

    const logoUrl = config?.logo_empresa
        ? config.logo_empresa.startsWith('http://') ||
          config.logo_empresa.startsWith('https://')
            ? config.logo_empresa
            : `/storage/${config.logo_empresa}`
        : null;

    return (
        <div
            ref={ref}
            className="w-[794px] bg-white p-10 font-sans text-[12px] text-black"
        >
            <div className="mb-8 flex justify-between">
                <div>
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="mb-2 h-16 object-contain"
                        />
                    )}
                    <h1 className="text-lg font-black">
                        {config?.nombre_empresa || 'Ferretería CMA'}
                    </h1>
                    {config?.ruc && (
                        <p className="text-[11px]">RUC: {config.ruc}</p>
                    )}
                    {config?.direccion && (
                        <p className="text-[11px]">{config.direccion}</p>
                    )}
                    {config?.telefono && (
                        <p className="text-[11px]">Tel: {config.telefono}</p>
                    )}
                </div>
                <div className="h-fit rounded border border-black p-3 text-right">
                    <p className="text-xs font-black uppercase">FACTURA</p>
                    <p className="font-mono text-lg font-black">
                        {sale.nro_comprobante}
                    </p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded border border-black p-3 text-[11px]">
                <p>
                    <span className="font-bold">CLIENTE:</span>{' '}
                    {sale.nombre_cliente ||
                        sale.cliente?.nombre ||
                        'Clientes Varios'}
                </p>
                <p>
                    <span className="font-bold">RUC/DNI:</span>{' '}
                    {sale.documento_cliente || sale.cliente?.ruc_dni || '-'}
                </p>
                <p>
                    <span className="font-bold">DIRECCIÓN:</span>{' '}
                    {sale.cliente?.direccion || '-'}
                </p>
                <p>
                    <span className="font-bold">FECHA:</span> {fecha}
                </p>
            </div>

            <table className="w-full border-collapse text-[11px]">
                <thead>
                    <tr className="border-b border-black">
                        <th className="p-2 text-left font-black">CANT.</th>
                        <th className="p-2 text-left font-black">SKU</th>
                        <th className="p-2 text-left font-black">
                            DESCRIPCIÓN
                        </th>
                        <th className="p-2 text-right font-black">
                            P. UNITARIO
                        </th>
                        <th className="p-2 text-right font-black">IMPORTE</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.detalles?.map((item) => (
                        <tr key={item.id} className="border-b border-black/20">
                            <td className="p-2">{item.cantidad}</td>
                            <td className="p-2">
                                {item.producto?.sku || 'N/A'}
                            </td>
                            <td className="p-2">
                                {item.producto?.nombre || 'Producto'}
                                {parseFloat(item.descuento || 0) > 0 && (
                                    <span className="block text-[10px] text-black/50">
                                        Desc: -S/{' '}
                                        {parseFloat(item.descuento).toFixed(2)}
                                    </span>
                                )}
                            </td>
                            <td className="p-2 text-right">
                                S/ {parseFloat(item.precio_unitario).toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-bold">
                                S/ {parseFloat(item.subtotal).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="ml-auto mt-6 w-64 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                        S/{' '}
                        {parseFloat(sale.base_imponible || sale.total).toFixed(
                            2,
                        )}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>IGV ({parseFloat(config?.igv) || 18}%):</span>
                    <span>S/ {parseFloat(sale.igv || 0).toFixed(2)}</span>
                </div>
                {parseFloat(sale.descuento || 0) > 0 && (
                    <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span>-S/ {parseFloat(sale.descuento).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between border-t border-black pt-2 text-sm font-black">
                    <span>TOTAL:</span>
                    <span>S/ {parseFloat(sale.total).toFixed(2)}</span>
                </div>
                {sale.pagado_con !== undefined && sale.pagado_con !== null && (
                    <div className="flex justify-between pt-1">
                        <span>PAGO CON:</span>
                        <span>S/ {parseFloat(sale.pagado_con).toFixed(2)}</span>
                    </div>
                )}
                {sale.vuelto !== undefined && sale.vuelto !== null && (
                    <div className="flex justify-between">
                        <span>VUELTO:</span>
                        <span>S/ {parseFloat(sale.vuelto).toFixed(2)}</span>
                    </div>
                )}
            </div>

            <p className="mt-12 text-center text-[9px] text-black/60">
                Documento emitido electrónicamente ·{' '}
                {config?.nombre_empresa || 'Ferretería CMA'} · Gracias por su
                compra
            </p>
        </div>
    );
});

InvoiceA4.displayName = 'InvoiceA4';
export default InvoiceA4;
