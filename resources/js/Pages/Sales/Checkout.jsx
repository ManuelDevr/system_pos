import CommonModal from '@/Components/CommonModal';
import SaleDetailsPanel from '@/Components/Sales/SaleDetailsPanel';
import SaleOptionsModal from '@/Components/Sales/SaleOptionsModal';
import SaleSummaryPanel from '@/Components/Sales/SaleSummaryPanel';
import { useCartStore } from '@/Hooks/useCartStore';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Package, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function Checkout({
    serie,
    numero,
    serie_factura,
    numero_factura,
    igv,
    metodos_pago,
    productos,
}) {
    const { config, flash } = usePage().props;

    const {
        items: cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        setDiscount,
        clearCart,
        getSubtotal: cartSubtotal,
        getTotal: cartTotal,
        getDiscountTotal: cartDiscount,
    } = useCartStore();

    const [tipoComprobante, setTipoComprobante] = useState('Boleta');
    const [enviarSunat, setEnviarSunat] = useState(true);
    const [tipoDocumento, setTipoDocumento] = useState('DNI');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [nombreCliente, setNombreCliente] = useState('');
    const [consultandoDoc, setConsultandoDoc] = useState(false);
    const [docError, setDocError] = useState(null);
    const [docOrigen, setDocOrigen] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [isUnitModalOpen, setUnitModalOpen] = useState(false);
    const [productForUnits, setProductForUnits] = useState(null);

    const metodosPago = useMemo(() => {
        const list =
            Array.isArray(metodos_pago) && metodos_pago.length > 0
                ? metodos_pago
                : Array.isArray(config?.metodos_pago)
                  ? config.metodos_pago
                  : [];
        return list.length > 0
            ? list
            : ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'BCP'];
    }, [metodos_pago, config]);

    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [paidWith, setPaidWith] = useState('');

    const [sale, setSale] = useState(null);
    const [isOptionsModalOpen, setOptionsModalOpen] = useState(false);
    const lastSaleIdRef = useRef(null);

    const igvRate = useMemo(
        () => parseFloat(igv ?? config?.igv ?? 18) || 18,
        [igv, config],
    );
    const subtotal = cartSubtotal();
    const descuentoTotal = cartDiscount();
    const total = cartTotal();
    const igvAmount = (total * (igvRate / 100)) / (1 + igvRate / 100);
    const vuelto = useMemo(
        () => Math.max(0, (parseFloat(paidWith) || 0) - total),
        [paidWith, total],
    );
    const montoValido = useMemo(() => {
        if (paidWith.trim() === '') return false;
        const amount = parseFloat(paidWith);
        return !Number.isNaN(amount) && amount > 0 && amount > total;
    }, [paidWith, total]);

    const isFactura = tipoComprobante === 'Factura';
    const serieActual = isFactura
        ? serie_factura || 'F001'
        : serie || 'B001';
    const numeroActual = isFactura
        ? numero_factura || '000001'
        : numero || '000001';

    const maxDocLength = tipoDocumento === 'RUC' ? 11 : 8;
    const canConsultar = numeroDocumento.length === maxDocLength;

    const sunatHint = useMemo(() => {
        if (!enviarSunat) return null;
        if (isFactura) {
            if (numeroDocumento.length !== 11) {
                return 'La Factura requiere el RUC del cliente (11 dígitos)';
            }
            if (!nombreCliente.trim()) {
                return 'Presiona "Consultar" o ingresa el nombre del cliente';
            }
            return null;
        }
        if (numeroDocumento === '') return null;
        if (![8, 11].includes(numeroDocumento.length)) {
            return 'DNI (8) o RUC (11) para la Boleta';
        }
        if (!nombreCliente.trim()) {
            return 'Consulta el documento o ingresa el nombre del cliente';
        }
        return null;
    }, [enviarSunat, isFactura, numeroDocumento, nombreCliente]);

    // Consulta manual del documento: primero BD local (gratis), luego ApisPeru.
    const consultarDocumento = async () => {
        if (!canConsultar || consultandoDoc) return;
        setConsultandoDoc(true);
        setDocError(null);
        setDocOrigen(null);
        try {
            const res = await fetch(
                `/clientes/consulta-documento?numero=${encodeURIComponent(
                    numeroDocumento,
                )}`,
            );
            const data = await res.json();
            if (res.ok) {
                setNombreCliente(data.nombre || '');
                setDocOrigen(data.origen || null);
            } else {
                setNombreCliente('');
                setDocError(
                    data?.message || 'No se pudo consultar el documento',
                );
            }
        } catch {
            setNombreCliente('');
            setDocError('Error al consultar el documento. Intenta de nuevo.');
        } finally {
            setConsultandoDoc(false);
        }
    };

    useEffect(() => {
        if (isFactura && tipoDocumento !== 'RUC') setTipoDocumento('RUC');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFactura]);

    // Al cambiar el número, el nombre mostrado ya no le corresponde.
    const handleSetNumeroDocumento = (value) => {
        setNumeroDocumento(value);
        setDocError(null);
        setDocOrigen(null);
        setNombreCliente('');
    };

    const handleSetTipoDocumento = (tipo) => {
        const maxLen = tipo === 'RUC' ? 11 : 8;
        setTipoDocumento(tipo);
        setNumeroDocumento((prev) => prev.slice(0, maxLen));
        setDocError(null);
        setDocOrigen(null);
        setNombreCliente('');
    };

    // Cuando el backend confirma la venta, abrimos OPCIONES DE VENTA
    useEffect(() => {
        if (flash?.last_sale && flash.last_sale.id !== lastSaleIdRef.current) {
            lastSaleIdRef.current = flash.last_sale.id;
            setSale(flash.last_sale);
            setOptionsModalOpen(true);
            clearCart();
            setNumeroDocumento('');
            setNombreCliente('');
            setDocError(null);
            setDocOrigen(null);
            setTipoDocumento('DNI');
            setPaidWith('');
            setPaymentMethod('Efectivo');
        }
    }, [flash]);

    // Lógica del Escáner de Código de Barras
    const barcodeBuffer = useRef('');
    const lastKeyTime = useRef(Date.now());

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
                return;

            const currentTime = Date.now();
            if (currentTime - lastKeyTime.current > 50) {
                barcodeBuffer.current = '';
            }
            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 3) {
                    processBarcode(barcodeBuffer.current);
                    barcodeBuffer.current = '';
                    e.preventDefault();
                }
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productos, cart]);

    const processBarcode = (code, showToastOnError = true) => {
        let product = productos.find(
            (p) => p.codigo_barras === code || p.sku === code,
        );
        if (product) {
            const baseUnit =
                product.conversiones && product.conversiones.length > 0
                    ? {
                          isBase: true,
                          unidad: {
                              nombre: product.unidad_medida,
                          },
                          precio_venta: product.precio_venta,
                          factor: 1,
                      }
                    : null;
            handleAddToCart(product, baseUnit);
            return true;
        }

        for (const p of productos) {
            const conv = p.conversiones.find((c) => c.codigo_barras === code);
            if (conv) {
                handleAddToCart(p, conv);
                return true;
            }
        }

        if (showToastOnError) {
            toast.error(`Código no encontrado: ${code}`);
        }
        return false;
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const search = searchTerm.toLowerCase();
        return productos
            .filter(
                (p) =>
                    p.nombre.toLowerCase().includes(search) ||
                    (p.sku && p.sku.toLowerCase().includes(search)) ||
                    (p.codigo_barras && p.codigo_barras.includes(search)),
            )
            .slice(0, 12);
    }, [productos, searchTerm]);

    const handleAddToCart = (product, unit = null) => {
        if (!unit && product.conversiones && product.conversiones.length > 0) {
            setProductForUnits(product);
            setUnitModalOpen(true);
            return;
        }

        const factor = unit ? parseFloat(unit.factor) : 1;
        const requestedQty = 1;
        const physicalUnitsRequested = requestedQty * factor;

        const totalPhysicalInCart = cart.reduce((t, item) => {
            if (item.id === product.id) {
                const itemFactor = item.factor || 1;
                return t + item.quantity * itemFactor;
            }
            return t;
        }, 0);

        const totalNeeded = totalPhysicalInCart + physicalUnitsRequested;

        if (product.stock < totalNeeded) {
            toast.error(
                `Stock insuficiente. Solo quedan ${product.stock} ${product.unidad_medida} en total.`,
            );
            return;
        }

        addToCart(product, unit);
        const unitName = unit
            ? unit.unidad
                ? unit.unidad.nombre
                : 'Presentación'
            : product.unidad_medida;
        toast.success(`${product.nombre} (${unitName}) añadido`);
        setUnitModalOpen(false);
        setSearchTerm('');
    };

    const handlePay = () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }
        if (paymentMethod === 'Efectivo') {
            const amount = parseFloat(paidWith);
            if (paidWith.trim() === '' || Number.isNaN(amount)) {
                toast.error('Ingresa el monto recibido');
                return;
            }
            if (amount <= 0) {
                toast.error('El monto recibido debe ser mayor a 0');
                return;
            }
            if (amount < total) {
                toast.error('Monto insuficiente');
                return;
            }
            if (amount <= total) {
                toast.error('El monto recibido debe ser mayor al total');
                return;
            }
        }

        if (enviarSunat && sunatHint) {
            toast.error(sunatHint);
            return;
        }

        router.post(
            route('ventas.store'),
            {
                total: total,
                pagado_con: paymentMethod === 'Efectivo' ? parseFloat(paidWith) : null,
                vuelto: paymentMethod === 'Efectivo' ? vuelto : null,
                descuento: descuentoTotal,
                metodo_pago: paymentMethod,
                tipo_comprobante: tipoComprobante,
                enviar_sunat: enviarSunat,
                cliente_tipo_doc: numeroDocumento ? tipoDocumento : null,
                cliente_documento: numeroDocumento || null,
                cliente_nombre: nombreCliente.trim() || null,
                items: cart.map((item) => ({
                    producto_id: item.id,
                    cantidad: item.quantity,
                    precio_unitario: item.precio,
                    unidad_id: item.unit_id,
                    conversion_id: item.conversion_id,
                    descuento: item.discount || 0,
                })),
            },
            {
                onSuccess: () => toast.success('Venta registrada'),
                onError: (err) =>
                    toast.error(err.error || 'Error al procesar la venta'),
            },
        );
    };

    const handleCloseOptions = () => {
        setOptionsModalOpen(false);
        router.visit(route('venta-rapida'));
    };

    const handleNewSale = () => {
        clearCart();
        setNumeroDocumento('');
        setNombreCliente('');
        setDocError(null);
        setDocOrigen(null);
        setTipoDocumento('DNI');
        setPaidWith('');
        setPaymentMethod('Efectivo');
        setSearchTerm('');
        setTipoComprobante('Boleta');
        setEnviarSunat(true);
        setOptionsModalOpen(false);
        router.visit(route('venta-rapida'));
    };

    const updateQty = (id, conversionId, qty) =>
        updateQuantity(id, conversionId, qty);

    const removeItem = (id, conversionId) => removeFromCart(id, conversionId);

    return (
        <AuthenticatedLayout>
            <Head title="Realizar Venta" />

            <div className="-mx-2 -mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:-mx-4 sm:-mt-4 sm:p-6 lg:-mx-6 lg:-mt-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                        onClick={handleNewSale}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                    >
                        <Plus size={16} /> Nueva Venta
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-violet-600" />
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 sm:text-2xl">
                                Realizar Venta
                            </h1>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Confirma los datos y el método de pago para
                            completar la venta
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700">
                            {serieActual}
                        </span>
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                            Nº{' '}
                            <span className="text-slate-800">
                                {numeroActual}
                            </span>
                        </span>
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                            IGV {igvRate.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                            <ShoppingCart
                                size={40}
                                className="text-slate-300"
                            />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">
                            No hay productos para cobrar
                        </h3>
                        <p className="mb-6 mt-1 text-sm text-slate-500">
                            Agrega productos desde el buscador de la derecha.
                        </p>
                        <button
                            onClick={handleNewSale}
                            className="rounded-xl bg-violet-600 px-6 py-3 font-black text-white shadow-lg shadow-violet-100 transition-all hover:bg-violet-700 active:scale-95"
                        >
                            Nueva Venta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Columna izquierda: Datos Generales (comprobante, cliente, método de pago, Realizar Venta) */}
                        <div className="lg:col-span-1">
                            <SaleSummaryPanel
                                metodosPago={metodosPago}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                setPaidWith={setPaidWith}
                                tipoComprobante={tipoComprobante}
                                setTipoComprobante={setTipoComprobante}
                                tipoDocumento={tipoDocumento}
                                setTipoDocumento={handleSetTipoDocumento}
                                numeroDocumento={numeroDocumento}
                                setNumeroDocumento={handleSetNumeroDocumento}
                                nombreCliente={nombreCliente}
                                setNombreCliente={setNombreCliente}
                                consultandoDoc={consultandoDoc}
                                docError={docError}
                                docOrigen={docOrigen}
                                consultarDocumento={consultarDocumento}
                                canConsultar={canConsultar}
                                disabled={
                                    cart.length === 0 ||
                                    (paymentMethod === 'Efectivo' &&
                                        !montoValido)
                                }
                                onPay={handlePay}
                                enviarSunat={enviarSunat}
                                setEnviarSunat={setEnviarSunat}
                                sunatHint={sunatHint}
                            />
                        </div>

                        {/* Columna derecha: Detalles de Venta (buscador, tabla, resumen, monto recibido/vuelto) */}
                        <div className="lg:col-span-2">
                            <SaleDetailsPanel
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filteredProducts={filteredProducts}
                                addToCart={handleAddToCart}
                                cart={cart}
                                updateQty={updateQty}
                                removeItem={removeItem}
                                setDiscount={setDiscount}
                                igvRate={igvRate / 100}
                                subtotal={subtotal}
                                discountTotal={descuentoTotal}
                                igv={igvAmount}
                                total={total}
                                paidWith={paidWith}
                                setPaidWith={setPaidWith}
                                vuelto={vuelto}
                                isValidMonto={montoValido}
                                paymentMethod={paymentMethod}
                                isScanning={false}
                            />
                        </div>
                    </div>
                )}
            </div>

            <CommonModal
                isOpen={isUnitModalOpen}
                onClose={() => setUnitModalOpen(false)}
                title="Seleccionar Presentación"
            >
                <div className="space-y-4">
                    <p className="mb-4 text-sm font-medium text-slate-600">
                        Elige cómo deseas vender este producto:
                    </p>
                    <button
                        onClick={() =>
                            handleAddToCart(productForUnits, {
                                isBase: true,
                                unidad: {
                                    nombre: productForUnits.unidad_medida,
                                },
                                precio_venta: productForUnits.precio_venta,
                                factor: 1,
                            })
                        }
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-violet-400 hover:bg-violet-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-white p-2 text-slate-400 shadow-sm">
                                <Package size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-800">
                                    {productForUnits?.unidad_medida}
                                </p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Unidad Base
                                </p>
                            </div>
                        </div>
                        <span className="text-lg font-black text-indigo-600">
                            S/{' '}
                            {parseFloat(
                                productForUnits?.precio_venta || 0,
                            ).toFixed(2)}
                        </span>
                    </button>

                    {productForUnits?.conversiones.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() =>
                                handleAddToCart(productForUnits, conv)
                            }
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-violet-400 hover:bg-violet-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white p-2 text-slate-400 shadow-sm">
                                    <Package size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">
                                        {conv.unidad.nombre}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">
                                        Equivale a {parseFloat(conv.factor)}{' '}
                                        {productForUnits?.unidad_medida}
                                    </p>
                                </div>
                            </div>
                            <span className="text-lg font-black text-indigo-600">
                                S/ {parseFloat(conv.precio_venta).toFixed(2)}
                            </span>
                        </button>
                    ))}

                    <button
                        onClick={() => setUnitModalOpen(false)}
                        className="w-full py-3 text-sm font-bold text-slate-400 transition-colors hover:text-slate-600"
                    >
                        Cancelar
                    </button>
                </div>
            </CommonModal>

            <SaleOptionsModal
                isOpen={isOptionsModalOpen}
                onClose={() => setOptionsModalOpen(false)}
                onNewSale={handleCloseOptions}
                sale={sale}
            />
        </AuthenticatedLayout>
    );
}
