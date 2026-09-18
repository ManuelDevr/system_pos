import {
    Banknote,
    CheckCircle,
    CreditCard,
    Landmark,
    Loader2,
    Search,
    Send,
    Smartphone,
    User,
} from 'lucide-react';

const paymentIcons = {
    Efectivo: Banknote,
    Transferencia: Landmark,
    Yape: Smartphone,
    Plin: Smartphone,
    BCP: Landmark,
};

export default function SaleSummaryPanel({
    metodosPago,
    paymentMethod,
    setPaymentMethod,
    setPaidWith,
    tipoComprobante,
    setTipoComprobante,
    tipoDocumento,
    setTipoDocumento,
    numeroDocumento,
    setNumeroDocumento,
    nombreCliente,
    setNombreCliente,
    consultandoDoc,
    docError,
    docOrigen,
    consultarDocumento,
    canConsultar,
    disabled,
    onPay,
    enviarSunat,
    setEnviarSunat,
    sunatHint,
}) {
    const isFactura = tipoComprobante === 'Factura';
    const maxDocLength = tipoDocumento === 'RUC' ? 11 : 8;

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h2 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <User size={16} />
                    </span>
                    Datos Generales
                </h2>

                {/* Tipo de Comprobante */}
                <div className="space-y-2">
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Tipo de Comprobante
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Boleta', 'Factura', 'Ticket'].map((tipo) => (
                            <button
                                key={tipo}
                                onClick={() => setTipoComprobante(tipo)}
                                className={`rounded-lg border px-2 py-2.5 text-xs font-bold transition-all ${
                                    tipoComprobante === tipo
                                        ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-slate-800'
                                }`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cliente */}
                <div className="mt-5 space-y-2">
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Cliente {numeroDocumento ? '' : '(opcional)'}
                    </label>

                    {/* Tipo de documento */}
                    <div className="grid grid-cols-2 gap-2">
                        {['RUC', 'DNI'].map((tipo) => {
                            const active = tipoDocumento === tipo;
                            const locked = isFactura && tipo !== 'RUC';
                            return (
                                <button
                                    key={tipo}
                                    onClick={() => {
                                        if (locked) return;
                                        setTipoDocumento(tipo);
                                    }}
                                    disabled={locked}
                                    className={`rounded-lg border px-2 py-2 text-xs font-bold transition-all ${
                                        locked
                                            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                                            : active
                                              ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100'
                                              : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-slate-800'
                                    }`}
                                >
                                    {tipo}
                                    {locked && (
                                        <span className="ml-1 text-[9px] uppercase">
                                            (fijo)
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Número de documento + Consultar */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder={
                                tipoDocumento === 'RUC'
                                    ? 'RUC (11 dígitos)'
                                    : 'DNI (8 dígitos)'
                            }
                            value={numeroDocumento}
                            onChange={(e) =>
                                setNumeroDocumento(
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, maxDocLength),
                                )
                            }
                            className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                        />
                        <button
                            onClick={consultarDocumento}
                            disabled={consultandoDoc || !canConsultar}
                            className="rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-600"
                            title="Verifica el documento con el cliente y consulta el nombre"
                        >
                            {consultandoDoc ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Search size={16} />
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">
                        Verifica el número con tu cliente y presiona "Consultar"
                        para autocompletar el nombre.
                    </p>

                    {/* Nombre / Razón Social */}
                    <input
                        type="text"
                        placeholder="Nombre / Razón Social"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                    />

                    {docError && (
                        <p className="flex items-start gap-1.5 text-[11px] font-bold text-rose-600">
                            <CheckCircle size={13} className="mt-0.5 shrink-0" />
                            {docError}
                        </p>
                    )}
                    {!docError &&
                        docOrigen &&
                        numeroDocumento.length === maxDocLength && (
                            <p className="flex items-start gap-1.5 text-[11px] font-bold text-emerald-600">
                                <CheckCircle
                                    size={13}
                                    className="mt-0.5 shrink-0"
                                />
                                {docOrigen === 'local'
                                    ? 'Cliente encontrado en el sistema'
                                    : 'Nombre verificado en ApisPeru'}
                            </p>
                        )}
                </div>

                {/* Método de Pago */}
                <div className="mt-5 space-y-2">
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Método de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                        {metodosPago.map((method) => {
                            const Icon = paymentIcons[method] || CreditCard;
                            const active = paymentMethod === method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => {
                                        setPaymentMethod(method);
                                        if (
                                            method !== 'Efectivo' &&
                                            typeof setPaidWith === 'function'
                                        )
                                            setPaidWith('');
                                    }}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold transition-all ${
                                        active
                                            ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-slate-700'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {method}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Envío a SUNAT */}
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <Send size={15} />
                            </span>
                            <div>
                                <p className="text-sm font-black text-slate-800">
                                    Emitir a SUNAT
                                </p>
                                <p className="text-[10px] font-bold text-slate-400">
                                    Boleta (03) / Factura (01)
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={enviarSunat}
                            onClick={() => setEnviarSunat(!enviarSunat)}
                            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                                enviarSunat ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                    enviarSunat ? 'left-6' : 'left-1'
                                }`}
                            />
                        </button>
                    </div>
                    {enviarSunat && sunatHint && (
                        <p className="mt-3 flex items-start gap-1.5 text-[11px] font-bold text-amber-700">
                            <CheckCircle
                                size={13}
                                className="mt-0.5 shrink-0"
                            />
                            {sunatHint}
                        </p>
                    )}
                </div>

                {/* Botón Realizar Venta */}
                <button
                    onClick={onPay}
                    disabled={disabled}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-violet-100 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-violet-600"
                >
                    <CheckCircle size={20} />
                    Realizar Venta
                </button>
                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    El stock y el kardex se actualizarán automáticamente
                </p>
            </section>
        </div>
    );
}