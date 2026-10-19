import Logo from '@/Assets/Logo.jpg';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeftRight,
    Bookmark,
    Box,
    Building2,
    ChevronDown,
    ClipboardList,
    FilePlus2,
    FileText,
    History,
    Layers,
    LayoutGrid,
    Package,
    Receipt,
    Ruler,
    Settings2,
    ShieldCheck,
    ShoppingBag,
    Store,
    TrendingUp,
    Truck,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    FaBolt,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaUserFriends,
    FaUsers,
} from 'react-icons/fa';

const NavItem = ({ item, isOpen, isMobile, setOpen, isSubItem = false }) => {
    const isActive = item.routeName ? route().current(item.routeName) : false;

    return (
        <Link
            href={item.routeName ? route(item.routeName) : '#'}
            onClick={() => isMobile && setOpen(false)}
            className={`flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
            } ${isOpen || isMobile ? 'justify-start' : 'justify-center'} ${isSubItem ? 'relative mt-1' : ''}`}
        >
            {isSubItem && (
                <div className="absolute left-[-12px] top-1/2 h-[2px] w-3 -translate-y-1/2 bg-slate-200" />
            )}
            <item.icon
                className={`h-5 w-5 flex-shrink-0 ${isOpen || isMobile ? (isSubItem ? 'mr-3 h-4 w-4' : 'mr-3') : ''}`}
            />
            {(isOpen || isMobile) && <span>{item.label}</span>}
        </Link>
    );
};

const CollapsibleSection = ({ section, isOpen, isMobile, setOpen }) => {
    const { auth } = usePage().props;
    const permissions = auth.permissions || [];
    const visibleItems = section.items.filter(
        (item) => !item.permission || permissions.includes(item.permission),
    );
    const hasActiveItem = visibleItems.some((item) =>
        item.routeName ? route().current(item.routeName) : false,
    );
    const [isCollapsed, setIsCollapsed] = useState(!hasActiveItem);
    const [showFloating, setShowFloating] = useState(false);
    const hideTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    if (visibleItems.length === 0) return null;

    const handleMouseEnter = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setShowFloating(true);
    };

    const handleMouseLeave = () => {
        hideTimer.current = setTimeout(() => setShowFloating(false), 100);
    };

    // --- MODO COLAPSADO: Menú Flotante TIPO POPOVER (CLARO) ---
    if (!isOpen && !isMobile) {
        return (
            <div
                className="relative flex flex-col items-center py-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    onClick={() => setShowFloating(!showFloating)}
                    className={`rounded-xl p-2.5 transition-all duration-300 ${showFloating ? 'scale-110 bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <section.icon size={22} />
                </button>

                {showFloating && (
                    <div className="animate-in fade-in slide-in-from-left-2 absolute left-full top-0 z-[60] ml-2 w-64 duration-200">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                            <div className="-mx-3 -mt-3 mb-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <section.icon size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {section.title}
                                    </span>
                                </div>
                            </div>

                            <div className="relative space-y-1 pl-2">
                                {/* Línea vertical del árbol */}
                                <div className="absolute bottom-4 left-4 top-0 w-[1.5px] bg-slate-200" />

                                {visibleItems.map((item) => {
                                    const isItemActive = route().current(
                                        item.routeName,
                                    );
                                    return (
                                        <Link
                                            key={item.label}
                                            href={route(item.routeName)}
                                            onClick={() =>
                                                setShowFloating(false)
                                            }
                                            className={`group relative flex h-10 items-center rounded-xl pl-8 pr-3 text-xs font-bold transition-all ${
                                                isItemActive
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            {/* Línea horizontal del árbol */}
                                            <div
                                                className={`absolute left-2 top-1/2 h-[1.5px] w-4 -translate-y-1/2 transition-colors ${
                                                    isItemActive
                                                        ? 'bg-indigo-400'
                                                        : 'bg-slate-200 group-hover:bg-slate-300'
                                                }`}
                                            />

                                            <item.icon
                                                className={`mr-2.5 h-4 w-4 transition-opacity ${isItemActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
                                            />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- MODO EXPANDIDO: Acordeón Suave ---
    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
                    !isCollapsed ? 'bg-slate-50' : 'hover:bg-slate-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`rounded-lg p-1.5 transition-colors ${!isCollapsed ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 group-hover:text-slate-600'}`}
                    >
                        <section.icon size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700">
                        {section.title}
                    </span>
                </div>
                <ChevronDown
                    className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="relative ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-4">
                    {visibleItems.map((item) => (
                        <NavItem
                            key={item.label}
                            item={item}
                            isOpen={isOpen}
                            isMobile={isMobile}
                            setOpen={setOpen}
                            isSubItem={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ isOpen, setOpen, isMobile }) => {
    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    const menuStructure = [
        {
            type: 'item',
            icon: LayoutGrid,
            label: 'Inicio',
            routeName: 'dashboard',
            permission: 'ver_dashboard',
        },
        {
            type: 'item',
            icon: Store,
            label: 'Mi Tienda Web',
            external: 'https://www.cma-shop.com',
        },
        {
            type: 'item',
            icon: FaBolt,
            label: 'Venta Rápida',
            routeName: 'venta-rapida',
            permission: 'realizar_ventas',
        },
        {
            type: 'item',
            icon: Wallet,
            label: 'Caja',
            routeName: 'caja.index',
            permission: 'abrir_caja',
        },
        {
            type: 'section',
            title: 'Inventario',
            icon: Package,
            items: [
                {
                    icon: Box,
                    label: 'Gestión de Productos',
                    routeName: 'gestion-productos',
                    permission: 'gestionar_productos',
                },
                {
                    icon: Layers,
                    label: 'Categorías',
                    routeName: 'categorias.index',
                    permission: 'gestionar_mantenimiento',
                },
                {
                    icon: Bookmark,
                    label: 'Marcas',
                    routeName: 'marcas.index',
                    permission: 'gestionar_mantenimiento',
                },
                {
                    icon: Ruler,
                    label: 'Unidad de medidas',
                    routeName: 'unidades.index',
                    permission: 'gestionar_mantenimiento',
                },
                {
                    icon: ArrowLeftRight,
                    label: 'Transferencias',
                    routeName: 'transferencias.index',
                    permission: 'transferir_stock',
                },
            ],
        },
        {
            type: 'section',
            title: 'Ventas',
            icon: ShoppingBag,
            items: [
                {
                    icon: History,
                    label: 'Historial de ventas',
                    routeName: 'gestion-ventas',
                    permission: 'ver_historial_ventas',
                },
                {
                    icon: Wallet,
                    label: 'Historial de cajas',
                    routeName: 'caja.historial',
                    permission: 'ver_historial_ventas',
                },
                {
                    icon: FilePlus2,
                    label: 'Notas de debito',
                    routeName: 'notas-debito.index',
                    permission: 'ver_historial_ventas',
                },
                {
                    icon: Truck,
                    label: 'Guias de remision',
                    routeName: 'guias.index',
                    permission: 'emitir_guia',
                },
                {
                    icon: FileText,
                    label: 'Proforma',
                    routeName: 'cotizaciones.index',
                    permission: 'gestionar_productos',
                },
            ],
        },
        {
            type: 'section',
            title: 'Contabilidad',
            icon: FileText,
            items: [
                {
                    icon: TrendingUp,
                    label: 'Reporte de venta',
                    routeName: 'reportes.rvie',
                    permission: 'ver_reporte_rvie',
                },
                {
                    icon: Receipt,
                    label: 'Reporte de compra',
                    routeName: 'reportes.rce',
                    permission: 'ver_reporte_rce',
                },
                {
                    icon: TrendingUp,
                    label: 'Utilidad',
                    routeName: 'reportes.utilidad',
                    permission: 'ver_utilidad',
                },
                {
                    icon: AlertTriangle,
                    label: 'Ajuste de stock',
                    routeName: 'inventory.adjustments',
                    permission: 'gestionar_mantenimiento',
                },
                {
                    icon: ClipboardList,
                    label: 'Kardex',
                    routeName: 'kardex.index',
                    permission: 'ver_kardex',
                },
            ],
        },
        {
            type: 'section',
            title: 'Clientes y proveedores',
            icon: FaUserFriends,
            items: [
                {
                    icon: FaUserFriends,
                    label: 'Clientes',
                    routeName: 'gestion-clientes',
                    permission: 'gestionar_clientes',
                },
                {
                    icon: Building2,
                    label: 'Proveedores',
                    routeName: 'proveedores.index',
                    permission: 'gestionar_mantenimiento',
                },
            ],
        },
        {
            type: 'section',
            title: 'Personal',
            icon: FaUsers,
            items: [
                {
                    icon: FaUsers,
                    label: 'Grupo de personal',
                    routeName: 'grupo-personal.index',
                    permission: 'gestionar_usuarios',
                },
                {
                    icon: FaUsers,
                    label: 'Usuarios',
                    routeName: 'gestion-usuarios',
                    permission: 'gestionar_usuarios',
                },
            ],
        },
        {
            type: 'section',
            title: 'Configuraciones',
            icon: Settings2,
            items: [
                {
                    icon: Building2,
                    label: 'Datos de empresa',
                    routeName: 'configuracion',
                    permission: 'configuracion_sistema',
                },
                {
                    icon: Store,
                    label: 'Sucursales',
                    routeName: 'sucursales.index',
                    permission: 'gestionar_sucursales',
                },
                {
                    icon: ShieldCheck,
                    label: 'Privilegios',
                    routeName: 'privilegios.index',
                    permission: 'configurar_privilegios',
                },
            ],
        },
    ];

    const sidebarWidth = isMobile ? '280px' : isOpen ? '280px' : '80px';

    return (
        <aside
            className={`fixed top-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out`}
            style={{
                width: sidebarWidth,
                left: isMobile ? (isOpen ? '0' : '-280px') : '0',
            }}
        >
            <div className="flex h-[70px] flex-shrink-0 items-center justify-between border-b border-slate-200 px-4">
                <Link
                    href={route('dashboard')}
                    className={`flex items-center ${isOpen || isMobile ? 'justify-start' : 'justify-center'} group w-full`}
                >
                    <div className="rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="h-9 w-9 object-contain"
                        />
                    </div>
                    {(isOpen || isMobile) && (
                        <div className="ml-3">
                            <h1 className="text-lg font-black italic tracking-tighter text-slate-800">
                                CMA{' '}
                                <span className="font-bold text-indigo-600">
                                    POS
                                </span>
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                Ferretería
                            </p>
                        </div>
                    )}
                </Link>
                {isMobile && (
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 text-slate-400 transition-colors hover:text-slate-600"
                    >
                        <FaTimes size={20} />
                    </button>
                )}
            </div>

            <nav
                className={`flex-1 space-y-4 px-3 py-8 ${isOpen || isMobile ? 'overflow-y-auto' : 'overflow-y-visible'} custom-scrollbar`}
            >
                {menuStructure.map((element, idx) => {
                    if (element.type === 'item') {
                        if (
                            element.permission &&
                            !userPermissions.includes(element.permission)
                        )
                            return null;

                        if (element.external) {
                            return (
                                <a
                                    key={idx}
                                    href={element.external}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 items-center rounded-xl px-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100"
                                >
                                    <element.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {(isOpen || isMobile) && (
                                        <span>{element.label}</span>
                                    )}
                                </a>
                            );
                        }
                        return (
                            <NavItem
                                key={idx}
                                item={element}
                                isOpen={isOpen}
                                isMobile={isMobile}
                                setOpen={setOpen}
                            />
                        );
                    }
                    return (
                        <CollapsibleSection
                            key={idx}
                            section={element}
                            isOpen={isOpen}
                            isMobile={isMobile}
                            setOpen={setOpen}
                        />
                    );
                })}
            </nav>

            {!isMobile && (
                <div
                    className={`flex-shrink-0 border-t border-slate-100 bg-slate-50/50 p-4 ${!isOpen ? 'pb-12 pt-5' : ''}`}
                >
                    <button
                        onClick={() => setOpen(!isOpen)}
                        title={isOpen ? 'Minimizar menú' : 'Expandir menú'}
                        className={`flex h-11 w-full items-center justify-center rounded-xl transition-all duration-300 ${
                            isOpen
                                ? 'text-slate-400 hover:text-indigo-600'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        }`}
                    >
                        {isOpen ? (
                            <FaChevronLeft className="h-5 w-5" />
                        ) : (
                            <FaChevronRight className="h-5 w-5" />
                        )}
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
