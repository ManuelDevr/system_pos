import { usePage } from '@inertiajs/react';
import React from 'react';

const ProformaA4 = React.forwardRef(({ proforma }, ref) => {
    const { config } = usePage().props;
    if (!proforma) return null;

    const fecha = proforma.created_at
        ? new Date(proforma.created_at).toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleDateString('es-PE');

    const logoUrl = config?.logo_empresa
        ? config.logo_empresa.startsWith('http://') ||
          config.logo_empresa.startsWith('https://')
            ? config.logo_empresa
            : `/storage/${config.logo_empresa}`
        : null;

    const fechaVencimiento = (() => {
        if (!proforma.created_at) return '-';
        const d = new Date(proforma.created_at);
        d.setDate(d.getDate() + 15);
        return d.toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
    })();

    return (
        <div
            ref={ref}
            className="w-[794px] bg-white p-10 font-sans text-[12px] text-black"
        >
            <div className="mb-8 flex items-stretch justify-between gap-4">
                <div className="flex items-start gap-3">
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-16 object-contain"
                        />
                    )}
                    <div className="text-[11px] leading-tight">
                        <p className="text-lg font-black">
                            {config?.nombre_empresa || 'Ferretería CMA'}
                        </p>
                        {config?.ruc && (
                            <p className="text-[10px]">R.U.C. N° {config.ruc}</p>
                        )}
                        <p>{config?.direccion || 'San Juan de Miraflores Av Salvador Allende 429'}</p>
                        <p>TEL: {config?.telefono || '9412324105'}</p>
                        <p>CORREO: {config?.correo || 'CMA.STORE.OFICIAL@GMAIL.COM'}</p>
                    </div>
                </div>
                <div className="flex min-h-[120px] w-48 shrink-0 flex-col items-center justify-center gap-3 rounded border border-black p-3 text-center">
                    {config?.ruc && (
                        <p className="text-[10px] font-black uppercase leading-none">
                            R.U.C. N° {config.ruc}
                        </p>
                    )}
                    <p className="text-xl font-black uppercase leading-none">
                        PROFORMA
                    </p>
                    <p className="font-mono text-lg font-black leading-none">
                        {proforma.nro_cotizacion}
                    </p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2 rounded border border-black p-3 text-[11px]">
                <div>
                    <p className="font-black uppercase">Fecha de Emisión</p>
                    <p>{fecha}</p>
                </div>
                <div>
                    <p className="font-black uppercase">Fecha de Vencimiento</p>
                    <p>{fechaVencimiento}</p>
                </div>
                <div>
                    <p className="font-black uppercase">Vendedor</p>
                    <p>{proforma.user?.name || '-'}</p>
                </div>
                <div>
                    <p className="font-black uppercase">Cliente</p>
                    <p>{proforma.cliente_nombre || 'Clientes Varios'}</p>
                    {proforma.cliente_telefono && (
                        <p className="text-[10px] text-black/60">Tel: {proforma.cliente_telefono}</p>
                    )}
                </div>
            </div>

            <table className="w-full border-collapse text-[11px]">
                <thead>
                    <tr className="border-b border-black">
                        <th className="p-2 text-left font-black">CANT.</th>
                        <th className="p-2 text-left font-black">CÓD.</th>
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
                    {proforma.detalles?.map((item) => (
                        <tr key={item.id} className="border-b border-black/20">
                            <td className="p-2">{item.cantidad}</td>
                            <td className="p-2">{item.producto_id}</td>
                            <td className="p-2">
                                {item.producto_nombre}
                                {parseFloat(item.descuento || 0) > 0 && (
                                    <span className="block text-[10px] text-black/50">
                                        Desc: -S/ {parseFloat(item.descuento).toFixed(2)}
                                    </span>
                                )}
                            </td>
                            <td className="p-2 text-right">
                                S/ {parseFloat(item.precio_unitario).toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-bold">
                                S/ {parseFloat(item.subtotal_descuento ?? item.subtotal).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="ml-auto mt-6 w-64 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>S/ {parseFloat(proforma.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(proforma.descuento || 0) > 0 && (
                    <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span>-S/ {parseFloat(proforma.descuento).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>IGV ({(parseFloat(config?.igv) || 18).toFixed(0)}%):</span>
                    <span>S/ {parseFloat(proforma.igv || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-black pt-2 text-sm font-black">
                    <span>TOTAL:</span>
                    <span>S/ {parseFloat(proforma.total).toFixed(2)}</span>
                </div>
            </div>

            {proforma.observaciones && (
                <div className="mt-8 rounded border border-black/30 p-3 text-[11px]">
                    <p className="mb-1 font-black uppercase">Observaciones</p>
                    <p className="whitespace-pre-line text-black/80">
                        {proforma.observaciones}
                    </p>
                </div>
            )}

            <p className="mt-12 text-center text-[9px] text-black/60">
                Documento de proforma — no constituye comprobante de pago ·{' '}
                {config?.nombre_empresa || 'Ferretería CMA'} · {config?.correo || 'CMA.STORE.OFICIAL@GMAIL.COM'}
            </p>
        </div>
    );
});

ProformaA4.displayName = 'ProformaA4';
export default ProformaA4;