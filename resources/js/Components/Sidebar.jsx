import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  FaHome, 
  FaMoneyBillWave, FaUsers, FaUserFriends, 
  FaChevronLeft, FaChevronRight, FaPlus,
  FaBolt, FaTimes, FaShieldAlt
} from 'react-icons/fa';
import { Settings, Box, Search, LayoutGrid, ClipboardList, Layers, History, ShieldCheck, Building2, ChevronDown, ChevronRight, Package, ShoppingCart, ShoppingBag, Settings2, AlertTriangle, FileText, TrendingUp, Receipt, Store, Bookmark, Ruler } from 'lucide-react';
import Logo from '@/Assets/Logo.jpg';

const NavItem = ({ item, isOpen, isMobile, setOpen, isSubItem = false }) => {
    const isActive = item.routeName ? route().current(item.routeName) : false;

    return (
        <Link 
            href={item.routeName ? route(item.routeName) : '#'} 
            onClick={() => isMobile && setOpen(false)}
            className={`flex items-center h-10 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            } ${(isOpen || isMobile) ? 'justify-start' : 'justify-center'} ${isSubItem ? 'mt-1 relative' : ''}`}
        >
            {isSubItem && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-slate-200" />
            )}
            <item.icon className={`w-5 h-5 flex-shrink-0 ${(isOpen || isMobile) ? (isSubItem ? 'mr-3 w-4 h-4' : 'mr-3') : ''}`} />
            {(isOpen || isMobile) && <span>{item.label}</span>}
        </Link>
    );
};

const CollapsibleSection = ({ section, isOpen, isMobile, setOpen }) => {
    const { auth } = usePage().props;
    const permissions = auth.permissions || [];
    const visibleItems = section.items.filter(item => !item.permission || permissions.includes(item.permission));
    const hasActiveItem = visibleItems.some(item => item.routeName ? route().current(item.routeName) : false);
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
                    className={`p-2.5 rounded-xl transition-all duration-300 ${showFloating ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <section.icon size={22} />
                </button>

                {showFloating && (
                    <div className="absolute left-full ml-2 top-0 z-[60] w-64 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-3">
                            <div className="px-4 py-3 mb-3 border-b border-slate-100 bg-slate-50/50 -mx-3 -mt-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <section.icon size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">{section.title}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-1 relative pl-2">
                                {/* Línea vertical del árbol */}
                                <div className="absolute left-4 top-0 bottom-4 w-[1.5px] bg-slate-200" />
                                
                                {visibleItems.map((item) => {
                                    const isItemActive = route().current(item.routeName);
                                    return (
                                        <Link 
                                            key={item.label}
                                            href={route(item.routeName)}
                                            onClick={() => setShowFloating(false)}
                                            className={`flex items-center h-10 pl-8 pr-3 rounded-xl text-xs font-bold transition-all relative group ${
                                                isItemActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            {/* Línea horizontal del árbol */}
                                            <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-[1.5px] transition-colors ${
                                                isItemActive ? 'bg-indigo-400' : 'bg-slate-200 group-hover:bg-slate-300'
                                            }`} />
                                            
                                            <item.icon className={`w-4 h-4 mr-2.5 transition-opacity ${isItemActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    !isCollapsed ? 'bg-slate-50' : 'hover:bg-slate-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${!isCollapsed ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        <section.icon size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700">{section.title}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-5 relative">
                    {visibleItems.map((item) => (
                        <NavItem key={item.label} item={item} isOpen={isOpen} isMobile={isMobile} setOpen={setOpen} isSubItem={true} />
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
        permission: 'ver_dashboard' 
    },
    { 
        type: 'item', 
        icon: Store, 
        label: 'Mi Tienda Web', 
        routeName: 'store.index', 
    },
    { 
        type: 'item', 
        icon: FaBolt, 
        label: 'Venta Rápida', 
        routeName: 'venta-rapida', 
        permission: 'realizar_ventas' 
    },
    { 
        type: 'section',
        title: 'Inventario', 
        icon: Package,
        items: [
            { icon: Box, label: 'Gestión de Productos', routeName: 'gestion-productos', permission: 'gestionar_productos' },
            { icon: Layers, label: 'Categorías', routeName: 'categorias.index', permission: 'gestionar_mantenimiento' },
            { icon: Bookmark, label: 'Marcas', routeName: 'marcas.index', permission: 'gestionar_mantenimiento' },
            { icon: Ruler, label: 'Unidad de medidas', routeName: 'unidades.index', permission: 'gestionar_mantenimiento' }
        ]
    },
    { 
        type: 'section',
        title: 'Ventas', 
        icon: ShoppingBag,
        items: [
            { icon: History, label: 'Historial de ventas', routeName: 'gestion-ventas', permission: 'ver_historial_ventas' },
            { icon: FileText, label: 'Proforma', routeName: 'cotizaciones.index', permission: 'gestionar_productos' },
        ]
    },
    { 
        type: 'section',
        title: 'Contabilidad', 
        icon: FileText,
        items: [
            { icon: TrendingUp, label: 'Reporte de venta', routeName: 'reportes.rvie', permission: 'ver_reporte_rvie' },
            { icon: Receipt, label: 'Reporte de compra', routeName: 'reportes.rce', permission: 'ver_reporte_rce' },
            { icon: AlertTriangle, label: 'Ajuste de stock', routeName: 'inventory.adjustments', permission: 'gestionar_mantenimiento' },
            { icon: ClipboardList, label: 'Kardex', routeName: 'kardex.index', permission: 'ver_kardex' },
        ]
    },
    { 
        type: 'section',
        title: 'Clientes y proveedores', 
        icon: FaUserFriends,
        items: [
            { icon: FaUserFriends, label: 'Clientes', routeName: 'gestion-clientes', permission: 'gestionar_clientes' },
            { icon: Building2, label: 'Proveedores', routeName: 'proveedores.index', permission: 'gestionar_mantenimiento' },
        ]
    },
    { 
        type: 'section',
        title: 'Personal', 
        icon: FaUsers,
        items: [
            { icon: FaUsers, label: 'Grupo de personal', routeName: 'grupo-personal.index', permission: 'gestionar_usuarios' },
            { icon: FaUsers, label: 'Usuarios', routeName: 'gestion-usuarios', permission: 'gestionar_usuarios' },
        ]
    },
    { 
        type: 'section',
        title: 'Configuraciones', 
        icon: Settings2,
        items: [
            { icon: Building2, label: 'Datos de empresa', routeName: 'configuracion', permission: 'configuracion_sistema' },
            { icon: Store, label: 'Sucursales', routeName: 'sucursales.index', permission: 'gestionar_sucursales' },
            { icon: ShieldCheck, label: 'Privilegios', routeName: 'privilegios.index', permission: 'configurar_privilegios' }
        ]
    }
  ];

  const sidebarWidth = isMobile ? '280px' : (isOpen ? '280px' : '80px');

  return (
    <aside 
      className={`fixed top-0 h-full flex flex-col bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out shadow-sm`}
      style={{ width: sidebarWidth, left: isMobile ? (isOpen ? '0' : '-280px') : '0' }}
    >
      <div className="flex items-center justify-between h-[70px] px-4 border-b border-slate-200 flex-shrink-0">
        <Link 
            href={route('dashboard')}
            className={`flex items-center ${(isOpen || isMobile) ? 'justify-start' : 'justify-center'} w-full group`}
        >
            <div className="p-1.5 bg-white rounded-xl shadow-lg border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                <img src={Logo} alt="Logo" className="w-9 h-9 object-contain" />
            </div>
            {(isOpen || isMobile) && (
                <div className="ml-3">
                    <h1 className="text-lg font-black text-slate-800 tracking-tighter italic">CMA <span className="text-indigo-600 font-bold">POS</span></h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ferretería</p>
                </div>
            )}
        </Link>
        {isMobile && (
            <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes size={20} />
            </button>
        )}
      </div>

      <nav className={`flex-1 px-3 py-8 space-y-4 ${isOpen || isMobile ? 'overflow-y-auto' : 'overflow-y-visible'} custom-scrollbar`}>
        {menuStructure.map((element, idx) => {
            if (element.type === 'item') {
                if (element.permission && !userPermissions.includes(element.permission)) return null;
                
                if (element.routeName === 'store.index') {
                    return (
                        <a 
                            key={idx}
                            href={route(element.routeName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center h-10 px-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100"
                        >
                            <element.icon className="w-5 h-5 flex-shrink-0 mr-3" />
                            {(isOpen || isMobile) && <span>{element.label}</span>}
                        </a>
                    );
                }
                return <NavItem key={idx} item={element} isOpen={isOpen} isMobile={isMobile} setOpen={setOpen} />;
            }
            return <CollapsibleSection key={idx} section={element} isOpen={isOpen} isMobile={isMobile} setOpen={setOpen} />;
        })}
      </nav>

      {!isMobile && (
        <div className={`p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0 ${!isOpen ? 'pt-5 pb-12' : ''}`}>
            <button
                onClick={() => setOpen(!isOpen)}
                title={isOpen ? 'Minimizar menú' : 'Expandir menú'}
                className={`h-11 w-full flex items-center justify-center rounded-xl transition-all duration-300 ${
                    isOpen ? 'text-slate-400 hover:text-indigo-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                }`}
            >
                {isOpen ? <FaChevronLeft className="w-5 h-5" /> : <FaChevronRight className="w-5 h-5" />}
            </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
