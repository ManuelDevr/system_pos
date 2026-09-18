import React, { useState, useRef, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { FaUserCircle, FaBell, FaSignOutAlt, FaTrash, FaBars, FaUser, FaStore, FaChevronDown } from 'react-icons/fa';
import { ShoppingCart, AlertTriangle, XCircle, Package, Plus, Minus, X } from 'lucide-react';
import { useCartStore } from '@/Hooks/useCartStore';
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { items, updateQuantity, removeFromCart, clearCart, getTotal, getCount } = useCartStore();

  const getPageTitle = (pathname) => {
    if (!pathname) return 'Sistema CMA';
    if (routeTitles[pathname]) return routeTitles[pathname];
    return 'Sistema CMA';
  };
  
  const pageTitle = getPageTitle(url);

  const IconButton = ({ icon: Icon, badgeCount, onClick, title, colorClass = "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-indigo-500" }) => (
    <button
      onClick={onClick}
      title={title}
      className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${colorClass}`}
    >
      <Icon className="w-5 h-5" />
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border border-white">
          {badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-[70px] bg-white/80 backdrop-blur-lg border-b border-slate-200 transition-colors duration-300">
        <div className="flex items-center justify-between h-full px-3 sm:px-4">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <button 
                onClick={toggleSidebar}
                className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden shrink-0"
            >
                <FaBars size={18} />
            </button>
            <div className="hidden sm:block min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">{pageTitle}</h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sistema de Gestión CMA</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
            
            <div className="w-px h-6 bg-slate-200 mx-0.5 hidden sm:block"></div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0 text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user?.name || 'Usuario'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user?.rol}</p>
                </div>
                <FaChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href={route('profile.edit')}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all w-full"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <FaUser size={14} />
                    </div>
                    Perfil
                  </Link>
                  <a
                    href={route('store.index')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all w-full"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <FaStore size={14} />
                    </div>
                    Mi Tienda web
                  </a>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => router.post(route('logout'))}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all w-full"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
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
      <CommonModal isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} title="Centro de Notificaciones">
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                <FaBell size={32} />
            </div>
            <h4 className="text-slate-800 font-bold">Sin novedades</h4>
            <p className="text-xs text-slate-400">Todo el inventario está bajo control.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {notifications.map(notif => {
              const isDanger = notif.type === 'danger';
              const bgClass = isDanger ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100';
              const iconBgClass = isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600';
              const titleClass = isDanger ? 'text-rose-900' : 'text-amber-900';
              const textClass = isDanger ? 'text-rose-700' : 'text-amber-700';
              const Icon = isDanger ? XCircle : AlertTriangle;

              return (
              <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-2xl border group transition-all ${bgClass}`}>
                <div className={`p-2 rounded-xl ${iconBgClass}`}>
                    <Icon size={20} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${titleClass}`}>{notif.title}</h4>
                  <p className={`text-xs mt-0.5 font-medium leading-relaxed ${textClass}`}>{notif.message}</p>
                </div>
              </div>
            )})}
          </div>
        )}
      </CommonModal>

      {/* Modal del Carrito */}
      <CommonModal isOpen={isCartOpen} onClose={() => setCartOpen(false)} title="Carrito Global">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                <ShoppingCart size={32} />
            </div>
            <h4 className="text-slate-800 font-bold">Carrito Vacío</h4>
            <p className="text-xs text-slate-400">Agrega productos para procesar una venta.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {items.map(item => (
                <div key={`${item.id}-${item.unit_id}`} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                    {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" />
                    ) : <Package className="w-full h-full p-3 text-slate-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.nombre}</h4>
                    <p className="text-xs font-black text-indigo-600 mt-0.5">S/ {item.precio.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                            <button onClick={() => updateQuantity(item.id, item.unit_id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"><Minus size={12} /></button>
                            <span className="w-8 text-center text-xs font-black text-slate-700">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.unit_id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.unit_id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-tighter transition-colors">Eliminar</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">S/ {(item.precio * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-2xl font-black text-indigo-600">S/ {getTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                    onClick={clearCart}
                    className="p-3 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                    title="Vaciar Carrito"
                >
                  <FaTrash size={18} />
                </button>
                <Link 
                    href={route('venta-rapida')} 
                    onClick={() => setCartOpen(false)}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all text-center flex items-center justify-center gap-2"
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
