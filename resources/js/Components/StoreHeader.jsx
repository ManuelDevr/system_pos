import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { formatStock } from '@/Utils/format';

const iconOf = (cat) => {
  const n = String(cat?.nombre || '').toLowerCase();
  if (/rack|soporte|tv|monitor|pantalla/.test(n)) return 'tv';
  if (/cinta|tape/.test(n)) return 'tape_measure';
  if (/caja|pack|cajon/.test(n)) return 'inventory_2';
  if (/pintura|paint|latex/.test(n)) return 'palette';
  if (/clavo|clavos|nail/i.test(n)) return 'handyman';
  if (/electric|electr|cable|convertidor|conversor|audio|video|hdmi|digital|tv/.test(n)) return 'bolt';
  if (/gasfiteria|plumb|tuber|grifo|caño|llave/.test(n)) return 'plumbing';
  if (/herramient|tool/.test(n)) return 'hardware';
  if (/construccion|build|material/.test(n)) return 'construction';
  return 'folder_open';
};

const imgOf = (p) => {
  if (!p?.imagen_url) return 'https://via.placeholder.com/100?text=Img';
  return /^https?:\/\//.test(p.imagen_url) ? p.imagen_url : `/storage/${p.imagen_url}`;
};

export default function StoreHeader({ categorias = [], initialSearch = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  const [megaRendered, setMegaRendered] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimer = useRef(null);

  const [activeMainCat, setActiveMainCat] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const activeNavCat = urlParams.get('category') || '';

  useEffect(() => {
    if (categorias?.length) {
      if (activeMainCat === null || !categorias.some((c) => c.id === activeMainCat)) {
        setActiveMainCat(categorias[0].id);
      }
    }
  }, [categorias, activeMainCat]);

  const block = categorias?.find((c) => c.id === activeMainCat) || categorias?.[0] || null;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/tienda-web/buscar?q=${encodeURIComponent(searchQuery.trim())}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = route('store.catalog', { search: searchQuery.trim() });
    }
  };

  const openMega = () => {
    clearTimeout(megaTimer.current);
    setMegaRendered(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMegaOpen(true)));
  };

  const closeMega = () => {
    setMegaOpen(false);
    megaTimer.current = setTimeout(() => setMegaRendered(false), 200);
  };

  const SubRow = ({ cat, compact = false }) => {
    const d = cat.destacado;
    const href = d ? route('store.detail', d.id) : route('store.catalog', { category: cat.id });
    return (
      <Link href={href} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all group/sub">
        <span className={`${compact ? 'w-9 h-9' : 'w-11 h-11'} rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0`}>
          <img src={imgOf(d)} alt={cat.nombre} loading="lazy" className="w-full h-full object-contain p-0.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block ${compact ? 'text-[11px]' : 'text-xs'} font-bold text-slate-700 truncate group-hover/sub:text-black`}>{cat.nombre}</span>
          <span className="block text-[10px] font-semibold text-emerald-600 truncate">
            Stock: {formatStock(d?.stock, d?.unidad_medida)}
          </span>
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* 1. Cabecera Principal (Main Header) */}
      <header className="w-full bg-white border-b border-slate-200 shadow-md relative z-50">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-20 gap-6">
          {/* Izquierda: Logo Principal */}
          <Link href={route('store.index')} className="font-black text-2xl text-black uppercase tracking-tight flex items-center gap-2 group shrink-0">
            <span className="bg-[#fea619] text-black px-2.5 py-1 rounded-lg text-base group-hover:scale-105 transition-transform shadow-sm">CMA</span>
            <span className="group-hover:text-[#855300] transition-colors font-extrabold tracking-wider">STORE</span>
          </Link>

          {/* Centro: Barra de búsqueda ancha con bordes redondeados y botón naranja */}
          <div ref={searchBoxRef} className="flex-1 max-w-2xl mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-50 rounded-full border border-slate-300 p-1 focus-within:border-[#fea619] focus-within:ring-2 focus-within:ring-[#fea619]/20 transition-all shadow-inner">
              <span className="material-symbols-outlined text-slate-400 text-xl pl-4">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full px-3 text-slate-800 placeholder-slate-400 font-medium"
                placeholder="Buscar productos, marcas, herramientas..."
                type="text"
              />
              <button
                type="submit"
                className="bg-[#fea619] hover:bg-[#ffb95f] text-black w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shrink-0"
              >
                <span className="material-symbols-outlined text-xl font-bold">search</span>
              </button>
            </form>

            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[1000] overflow-hidden">
                {suggestions.length > 0 ? (
                  <ul className="max-h-96 overflow-y-auto py-2">
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <Link href={route('store.detail', p.id)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fea619]/10 transition-colors">
                          <img src={imgOf(p)} alt={p.nombre} className="w-12 h-12 object-contain bg-slate-50 rounded-lg border border-slate-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-black truncate">{p.nombre}</p>
                            <p className="text-[11px] text-slate-500">{p.marca?.nombre || 'CMA'} · SKU: {p.sku || 'N/A'}</p>
                          </div>
                          <span className="text-sm font-black text-[#855300] shrink-0">S/ {parseFloat(p.precio_venta || 0).toFixed(2)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 px-4 py-4">No se encontraron productos para "{searchQuery.trim()}".</p>
                )}
                <Link
                  href={route('store.catalog', { search: searchQuery.trim() })}
                  className="block text-center py-2.5 text-xs font-bold text-[#855300] bg-slate-50 hover:bg-[#fea619]/10 border-t border-slate-100"
                >
                  Ver todos los resultados
                </Link>
              </div>
            )}
          </div>

          {/* Derecha: Caja del Carrito de Compras Mejorada */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={route('store.catalog')}
              className="flex items-center gap-3 bg-[#fea619]/10 hover:bg-[#fea619]/20 border border-[#fea619]/30 px-4 py-2 rounded-full transition-all group shadow-sm"
            >
              <div className="relative w-9 h-9 bg-[#fea619] text-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <span className="material-symbols-outlined text-lg font-bold">shopping_bag</span>
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  0
                </span>
              </div>
              <span className="text-sm font-black text-black tracking-tight">S/ 0.00</span>
            </Link>
          </div>
        </div>

        {/* 2. Menú de Categorías (Navbar Azul Marino) */}
        <nav className="w-full bg-[#0f172a] text-white shadow-md relative z-40">
          <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-2 h-12 font-bold text-xs">
            {/* Botón Hamburger "Productos" */}
            <div className="relative shrink-0 py-1" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <Link
                href={route('store.catalog')}
                className="bg-[#fea619] text-black font-black px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#ffb95f] transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg font-black">menu</span>
                <span>Productos</span>
                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </Link>

              {/* VENTANA MODAL MEGAMENÚ: panel lateral izquierdo + panel derecho en 4 columnas */}
              {megaRendered && block && (
                <div
                  className="absolute top-full left-0 w-[min(1180px,92vw)] z-50 mt-1 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-2xl shadow-black/15 ring-1 ring-black/5 transition-all duration-200 ease-out origin-top-left"
                  style={{
                    opacity: megaOpen ? 1 : 0,
                    transform: megaOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
                    pointerEvents: megaOpen ? 'auto' : 'none',
                  }}
                >
                  <div className="flex max-h-[70vh] overflow-hidden">
                    {/* Panel Lateral Izquierdo: Categorías Principales */}
                    <aside className="w-68 sm:w-72 shrink-0 bg-[#f4f6f8] border-r border-slate-200 p-3 overflow-y-auto no-scrollbar rounded-l-2xl">
                      {categorias.map((cat) => {
                        const active = block.id === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setActiveMainCat(cat.id)}
                            className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer mb-1 ${
                              active
                                ? 'bg-white text-[#855300] font-black shadow-sm border border-slate-200'
                                : 'text-slate-700 hover:bg-white/70'
                            }`}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <span className={`material-symbols-outlined text-lg ${active ? 'text-[#fea619]' : 'text-slate-400'} shrink-0`}>
                                {iconOf(cat)}
                              </span>
                              <span className="text-xs truncate">{cat.nombre}</span>
                            </span>
                            <span className={`material-symbols-outlined text-base shrink-0 ${active ? 'text-[#855300]' : 'text-slate-300 group-hover:text-slate-500'}`}>
                              chevron_right
                            </span>
                          </button>
                        );
                      })}
                    </aside>

                    {/* Panel Derecho: Categoría seleccionada con subcategorías en columnas */}
                    <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-[#855300] text-sm font-black uppercase tracking-widest flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-xl text-[#fea619]">{iconOf(block)}</span>
                          {block.nombre}
                        </h3>
                        <Link
                          href={route('store.catalog', { category: block.id })}
                          className="text-xs font-bold text-slate-600 hover:text-[#855300] flex items-center gap-1 shrink-0"
                        >
                          Ver todo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>

                      {block.children?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">
                          {block.children.map((sub) => (
                            <div key={sub.id}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="border-l-[3px] border-[#2563eb] pl-2.5">
                                  <Link
                                    href={route('store.catalog', { category: sub.id })}
                                    className="text-[11px] font-black text-slate-800 uppercase tracking-wide hover:text-[#855300] transition-colors"
                                  >
                                    {sub.nombre}
                                  </Link>
                                </div>
                                <Link
                                  href={route('store.catalog', { category: sub.id })}
                                  className="text-[10px] font-bold text-[#855300] hover:underline whitespace-nowrap"
                                >
                                  Ver todo
                                </Link>
                              </div>
                              <ul className="space-y-0.5">
                                {sub.productos?.length ? (
                                  sub.productos.slice(0, 4).map((p) => (
                                    <li key={p.id}>
                                      <Link
                                        href={route('store.detail', p.id)}
                                        className="block py-1 text-xs text-slate-500 hover:text-[#855300] hover:font-semibold truncate transition-colors"
                                      >
                                        {p.nombre}
                                      </Link>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-[11px] text-slate-300 py-1">Próximamente</li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-1">
                          {block.productos?.length ? (
                            block.productos.map((p) => (
                              <li key={p.id}>
                                <Link
                                  href={route('store.detail', p.id)}
                                  className="block py-1.5 text-xs text-slate-500 hover:text-[#855300] hover:font-semibold truncate transition-colors"
                                >
                                  {p.nombre}
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-slate-300 py-1">Próximamente</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categorías Principales Horizontales con Dropdown Simple */}
            <div className="flex items-center gap-1 overflow-visible flex-1 py-1 px-2">
              <Link href={route('store.catalog')} className="px-3 py-1.5 text-slate-200 hover:text-[#fea619] transition-colors whitespace-nowrap shrink-0">
                Inicio
              </Link>
              {categorias && categorias.slice(0, 4).map((cat) => {
                const isActive = activeNavCat === String(cat.id);
                return (
                  <div key={cat.id} className="relative group/cat shrink-0">
                    <Link
                      href={route('store.catalog', { category: cat.id })}
                      className={`px-3 py-1.5 transition-colors whitespace-nowrap uppercase tracking-wider text-[11px] flex items-center gap-1 cursor-pointer ${
                        isActive ? 'text-[#fea619]' : 'text-slate-200 hover:text-[#fea619]'
                      }`}
                    >
                      <span>{cat.nombre}</span>
                      {cat.children && cat.children.length > 0 && (
                        <span className={`material-symbols-outlined text-[14px] transition-all ${isActive ? 'text-[#4ade80]' : 'text-slate-400 group-hover/cat:text-[#fea619] group-hover/cat:rotate-180'}`}>
                          expand_more
                        </span>
                      )}
                    </Link>

                    {/* Dropdown simple: lista vertical de solo texto */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="hidden group-hover/cat:block absolute top-full left-0 z-50 pt-2 w-56 bg-white text-slate-800 rounded-md border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden">
                          <Link
                            href={route('store.catalog', { category: cat.id })}
                            className={`flex items-center justify-between px-4 py-2.5 text-xs font-black border-b border-slate-100 hover:bg-[#fea619]/10 transition-colors ${
                              isActive ? 'text-[#855300]' : 'text-slate-800'
                            }`}
                          >
                            Todos
                            {isActive && <span className="material-symbols-outlined text-sm text-[#4ade80]">check</span>}
                          </Link>
                          {cat.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={route('store.catalog', { category: sub.id })}
                              className="block px-4 py-2 text-xs font-semibold text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
                            >
                              {sub.nombre}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <Link
                href={route('store.catalog')}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-[#fea619] hover:text-black text-white rounded-xl transition-all whitespace-nowrap uppercase tracking-wider text-[11px] font-black flex items-center gap-1 shrink-0 ml-auto"
              >
                <span>Otros</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}