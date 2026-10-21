import { useCartStore } from '@/Hooks/useCartStore';
import { useTheme } from '@/Hooks/useTheme';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Minus,
    Monitor,
    Package,
    Plus,
    ShoppingCart,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    FaBars,
    FaBell,
    FaChevronDown,
    FaMoon,
    FaSignOutAlt,
    FaStore,
    FaSun,
    FaTrash,
    FaUser,
} from 'react-icons/fa';
import CommonModal from './CommonModal';

const routeTitles = {
    '/dashboard': 'Panel de Control',
    '/nuevo-producto': 'Nuevo Producto',
    '/mis-ventas': 'Mis Ventas',
    '/gestion-usuarios': 'Gestión de Usuarios',
    '/gestion-clientes': 'Gestión de Clientes',
    '/gestion-ventas': 'Gestión de Ventas',
    '/gestion-productos': 'Gestión de Productos',
    '/configuracion': 'Configuración',
    '/venta-rapida': 'Punto de Venta',
};

const Header = ({ toggleSidebar }) => {
    const { url, props } = usePage();
    const { auth, notifications } = props;
    const user = auth.user;

    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target)
            ) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const {
        items,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        getCount,
    } = useCartStore();

    const getPageTitle = (pathname) => {
        if (!pathname) return 'Sistema CMA';
        if (routeTitles[pathname]) return routeTitles[pathname];
        return 'Sistema CMA';
    };

    const pageTitle = getPageTitle(url);

    const IconButton = ({
        icon: Icon,
        badgeCount,
        onClick,
        title,
        colorClass = 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-indigo-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400',
    }) => (
        <button
            onClick={onClick}
            title={title}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${colorClass}`}
        >
            <Icon className="h-5 w-5" />
            {badgeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    {badgeCount}
                </span>
            )}
        </button>
    );

    return (
        <>
            <header className="sticky top-0 z-30 h-[70px] border-b border-slate-200 bg-white/80 backdrop-blur-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex h-full items-center justify-between px-3 sm:px-4">
                    <div className="flex min-w-0 shrink items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="-ml-2 shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                        >
                            <FaBars size={18} />
                        </button>
                        <div className="hidden min-w-0 sm:block">
                            <h1 className="truncate text-base font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-lg">
                                {pageTitle}
                            </h1>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Sistema de Gestión CMA
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <IconButton
                            icon={theme === 'dark' ? FaSun : FaMoon}
                            title={
                                theme === 'dark' ? 'Modo claro' : 'Modo oscuro'
                            }
                            onClick={() =>
                                setTheme(theme === 'dark' ? 'light' : 'dark')
                            }
                        />
                        <IconButton
                            icon={FaBell}
                            badgeCount={notifications?.length || 0}
                            title="Notificaciones"
                            onClick={() => setNotificationsOpen(true)}
                        />
                        <IconButton
                            icon={ShoppingCart}
                            badgeCount={getCount()}
                            title="Carrito de Compras"
                            onClick={() => setCartOpen(true)}
                        />

                        <div className="mx-0.5 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block"></div>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-sm font-bold text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden text-left xl:block">
                                    <p className="max-w-[100px] truncate text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
                                        {user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                        {user?.rol}
                                    </p>
                                </div>
                                <FaChevronDown
                                    className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isUserMenuOpen && (
                                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-[60] mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-900">
                                    <Link
                                        href={route('profile.edit')}
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                            <FaUser size={14} />
                                        </div>
                                        Perfil
                                    </Link>
                                    <a
                                        href="https://www.cma-shop.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <FaStore size={14} />
                                        </div>
                                        Mi Tienda web
                                    </a>
                                    <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                                    <div className="px-4 py-2">
                                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Tema
                                        </p>
                                        <div className="grid grid-cols-3 gap-1">
                                            <button
                                                onClick={() =>
                                                    setTheme('light')
                                                }
                                                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                                            >
                                                <FaSun size={12} /> Claro
                                            </button>
                                            <button
                                                onClick={() => setTheme('dark')}
                                                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                                            >
                                                <FaMoon size={12} /> Oscuro
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setTheme('system')
                                                }
                                                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold ${theme === 'system' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                                            >
                                                <Monitor size={12} /> Auto
                                            </button>
                                        </div>
                                    </div>
                                    <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                                    <button
                                        onClick={() =>
                                            router.post(route('logout'))
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                    >
                                        <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                                            <FaSignOutAlt size={14} />
                                        </div>
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal de Notificaciones */}
            <CommonModal
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                title="Centro de Notificaciones"
            >
                {!notifications || notifications.length === 0 ? (
                    <div className="py-10 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-200">
                            <FaBell size={32} />
                        </div>
                        <h4 className="font-bold text-slate-800">
                            Sin novedades
                        </h4>
                        <p className="text-xs text-slate-400">
                            Todo el inventario está bajo control.
                        </p>
                    </div>
                ) : (
                    <div className="custom-scrollbar max-h-[400px] space-y-3 overflow-y-auto pr-2">
                        {notifications.map((notif) => {
                            const isDanger = notif.type === 'danger';
                            const bgClass = isDanger
                                ? 'bg-rose-50 border-rose-100'
                                : 'bg-amber-50 border-amber-100';
                            const iconBgClass = isDanger
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-amber-100 text-amber-600';
                            const titleClass = isDanger
                                ? 'text-rose-900'
                                : 'text-amber-900';
                            const textClass = isDanger
                                ? 'text-rose-700'
                                : 'text-amber-700';
                            const Icon = isDanger ? XCircle : AlertTriangle;

                            return (
                                <div
                                    key={notif.id}
                                    className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all ${bgClass}`}
                                >
                                    <div
                                        className={`rounded-xl p-2 ${iconBgClass}`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h4
                                            className={`text-sm font-bold ${titleClass}`}
                                        >
                                            {notif.title}
                                        </h4>
                                        <p
                                            className={`mt-0.5 text-xs font-medium leading-relaxed ${textClass}`}
                                        >
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CommonModal>

            {/* Modal del Carrito */}
            <CommonModal
                isOpen={isCartOpen}
                onClose={() => setCartOpen(false)}
                title="Carrito Global"
            >
                {items.length === 0 ? (
                    <div className="py-10 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-200">
                            <ShoppingCart size={32} />
                        </div>
                        <h4 className="font-bold text-slate-800">
                            Carrito Vacío
                        </h4>
                        <p className="text-xs text-slate-400">
                            Agrega productos para procesar una venta.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="custom-scrollbar max-h-[350px] space-y-4 overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div
                                    key={`${item.id}-${item.unit_id}`}
                                    className="group flex items-center gap-4"
                                >
                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Package className="h-full w-full p-3 text-slate-200" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate text-sm font-bold text-slate-800">
                                            {item.nombre}
                                        </h4>
                                        <p className="mt-0.5 text-xs font-black text-indigo-600">
                                            S/ {item.precio.toFixed(2)}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.unit_id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center text-slate-500 transition-colors hover:text-indigo-600"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-black text-slate-700">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.unit_id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center text-slate-500 transition-colors hover:text-indigo-600"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.id,
                                                        item.unit_id,
                                                    )
                                                }
                                                className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 transition-colors hover:text-rose-500"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">
                                            S/{' '}
                                            {(
                                                item.precio * item.quantity
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Subtotal
                                </span>
                                <span className="text-2xl font-black text-indigo-600">
                                    S/ {getTotal().toFixed(2)}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={clearCart}
                                    className="rounded-xl bg-slate-100 p-3 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                                    title="Vaciar Carrito"
                                >
                                    <FaTrash size={18} />
                                </button>
                                <Link
                                    href={route('venta-rapida')}
                                    onClick={() => setCartOpen(false)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
                                >
                                    Continuar al Cobro
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </CommonModal>
        </>
    );
};

export default Header;
