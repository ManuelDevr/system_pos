import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreHeader from '@/Components/StoreHeader';
import StoreFooter from '@/Components/StoreFooter';
import { formatStock } from '@/Utils/format';

const FILTER_THEMES = [
  {
    match: ['rack', 'soporte', 'soporte de tv', 'mount'],
    hideSubcats: false,
    attrSections: [
      { key: 'pantalla', label: 'Tamaño de Pantalla', options: ['32"-55"', '65"-85"'] },
    ],
  },
  {
    match: ['convertidor', 'conversor', 'electronica', 'audio', 'video', 'tv', 'hdmi', 'digital', 'dvb', 'amplificador'],
    hideSubcats: false,
    attrSections: [
      { key: 'resolucion', label: 'Resolución', options: ['HD', 'Full HD', '4K', '8K'] },
      { key: 'digital', label: 'Producto digital', options: ['Digital', 'Analógico', 'Wi-Fi', 'Bluetooth'] },
    ],
  },
];

export default function StoreCatalog({ productos, categorias, marcas, priceRange }) {
  const [viewMode, setViewMode] = useState('grid');
  const [openSections, setOpenSections] = useState({ categorias: true, marca: true, precio: true });
  const [expandedCat, setExpandedCat] = useState(null);
  const priceDebounce = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const activeSearch = urlParams.get('search') || '';
  const activeCategory = urlParams.get('category') || '';
  const activeBrand = urlParams.get('brand') || '';
  const activeSort = urlParams.get('sort') || '';
  const activeMinPrice = urlParams.get('min_price') || '';
  const activeMaxPrice = urlParams.get('max_price') || '';

  const maxPrice = priceRange?.max || 2000;
  const minPriceFloor = priceRange?.min || 0;

  const activeAttrs = {};
  urlParams.forEach((v, k) => {
    const m = k.match(/^attrs\[(.+)\]$/);
    if (m && v) activeAttrs[m[1]] = v;
  });

  const [searchQuery, setSearchQuery] = useState(activeSearch);
  const [draftMin, setDraftMin] = useState(activeMinPrice);
  const [draftMax, setDraftMax] = useState(activeMaxPrice);
  const [sliderMax, setSliderMax] = useState(activeMaxPrice || maxPrice);

  useEffect(() => {
    setSearchQuery(activeSearch);
    setDraftMin(activeMinPrice);
    setDraftMax(activeMaxPrice);
    setSliderMax(activeMaxPrice || maxPrice);
  }, [activeSearch, activeMinPrice, activeMaxPrice, maxPrice]);

  const productList = productos?.data || productos || [];

  const activeFilters = {
    search: activeSearch,
    category: activeCategory,
    brand: activeBrand,
    sort: activeSort,
    min_price: activeMinPrice,
    max_price: activeMaxPrice,
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== '') || Object.keys(activeAttrs).length > 0;

  const findCategoryName = (id) => {
    if (!categorias) return null;
    for (const c of categorias) {
      if (String(c.id) === String(id)) return c.nombre;
      const sub = c.children?.find((ch) => String(ch.id) === String(id));
      if (sub) return sub.nombre;
    }
    return null;
  };

  const activeCategoryName = findCategoryName(activeCategory);

  const theme = activeCategoryName
    ? FILTER_THEMES.find((t) => t.match.some((k) => activeCategoryName.toLowerCase().includes(k)))
    : null;

  const findCatType = (id) => {
    if (!categorias) return null;
    for (const cat of categorias) {
      if (String(cat.id) === String(id)) return 'parent';
      if (cat.children?.some((ch) => String(ch.id) === String(id))) return 'sub';
    }
    return null;
  };
  const catType = activeCategory ? findCatType(activeCategory) : null;

  const sections = [];
  if (theme) {
    if (!theme.hideSubcats) sections.push({ type: 'cats', label: 'Sub-Categoría' });
    theme.attrSections.forEach((s) => sections.push({ type: 'attrs', ...s }));
    sections.push({ type: 'brand', label: 'Marca' });
    sections.push({ type: 'price', label: 'Gama de Precios' });
  } else {
    sections.push({ type: 'cats', label: 'Sub-Categoría' });
    sections.push({ type: 'brand', label: 'Marca' });
    sections.push({ type: 'price', label: 'Gama de Precios' });
  }

  const attrOptionLabel = (key, value) => {
    const sec = theme?.attrSections.find((s) => s.key === key);
    return sec ? `${sec.label}: ${value}` : `${key}: ${value}`;
  };

  const chips = [];
  if (activeSearch) chips.push({ key: 'search', label: `Búsqueda: ${activeSearch}` });
  if (activeCategory) chips.push({ key: 'category', label: activeCategoryName ? `Categoría: ${activeCategoryName}` : `Categoría: #${activeCategory}` });
  if (activeBrand) chips.push({ key: 'brand', label: `Marca: ${marcas?.find((m) => String(m.id) === String(activeBrand))?.nombre || `#${activeBrand}`}` });
  if (activeMinPrice) chips.push({ key: 'min_price', label: `Precio mín: S/ ${activeMinPrice}` });
  if (activeMaxPrice) chips.push({ key: 'max_price', label: `Precio máx: S/ ${activeMaxPrice}` });
  Object.entries(activeAttrs).forEach(([k, v]) => {
    chips.push({ key: `attr_${k}`, label: attrOptionLabel(k, v) });
  });

  const applyFilters = (changes) => {
    const q = { ...activeFilters, ...changes };
    Object.keys(q).forEach((k) => {
      if (q[k] === '' || q[k] === null || q[k] === undefined) delete q[k];
      if (typeof q[k] === 'object' && Object.keys(q[k]).length === 0) delete q[k];
    });
    delete q.page;
    router.get(route('store.catalog'), q, { preserveState: true, replace: true });
  };

  const toggleAttr = (sectionKey, option) => {
    const next = { ...activeAttrs };
    if (next[sectionKey] === option) delete next[sectionKey];
    else next[sectionKey] = option;
    applyFilters({ attrs: next });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search: searchQuery.trim() });
  };

  const toggleCategory = (id) => {
    applyFilters({ category: activeCategory === String(id) ? '' : String(id) });
  };

  const toggleExpandCat = (id) => {
    setExpandedCat((prev) => (prev === id ? null : id));
  };

  const toggleBrand = (id) => {
    applyFilters({ brand: activeBrand === String(id) ? '' : String(id) });
  };

  const handleSort = (e) => {
    applyFilters({ sort: e.target.value });
  };

  const handleMinInput = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (Number(val) < 0) val = '';
    setDraftMin(val);
    clearTimeout(priceDebounce.current);
    priceDebounce.current = setTimeout(() => {
      applyFilters({ min_price: val });
    }, 500);
  };

  const handleMaxInput = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (Number(val) < 0) val = '';
    setDraftMax(val);
    setSliderMax(val ? Math.min(Number(val), maxPrice) : maxPrice);
    clearTimeout(priceDebounce.current);
    priceDebounce.current = setTimeout(() => {
      applyFilters({ max_price: val });
    }, 500);
  };

  const handlePriceSlider = (e) => {
    const val = e.target.value;
    setSliderMax(val);
    setDraftMax(val);
    clearTimeout(priceDebounce.current);
    priceDebounce.current = setTimeout(() => {
      applyFilters({ max_price: val });
    }, 300);
  };

  const removeFilter = (key) => {
    if (key === 'category') return applyFilters({ category: '' });
    if (key === 'brand') return applyFilters({ brand: '' });
    if (key === 'search') {
      setSearchQuery('');
      return applyFilters({ search: '' });
    }
    if (key === 'min_price') {
      setDraftMin('');
      return applyFilters({ min_price: '' });
    }
    if (key === 'max_price') {
      setDraftMax('');
      setSliderMax(maxPrice);
      return applyFilters({ max_price: '' });
    }
    if (key.startsWith('attr_')) {
      const attrKey = key.slice(5);
      const next = { ...activeAttrs };
      delete next[attrKey];
      return applyFilters({ attrs: next });
    }
  };

  const cleanFilters = () => {
    setSearchQuery('');
    setDraftMin('');
    setDraftMax('');
    setSliderMax(maxPrice);
    router.get(route('store.catalog'), {}, { preserveState: true, replace: true });
  };

  const toggleSection = (key) => {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  };

  const goToPage = (page) => {
    const q = { ...activeFilters };
    Object.keys(q).forEach((k) => {
      if (q[k] === '' || q[k] === null || q[k] === undefined) delete q[k];
    });
    router.get(route('store.catalog'), { ...q, page }, { preserveState: true, replace: false });
  };

  const currentPrice = (item) => parseFloat(item.precio_venta || 0);
  const oldPriceOf = (item) => {
    const cur = currentPrice(item);
    const raw = item.old_price ?? item.precio_anterior;
    if (raw) {
      const val = parseFloat(raw);
      if (Number.isFinite(val) && val > 0 && val > cur) return val;
    }
    const rate = parseFloat(item.tasa_descuento || 0);
    if (rate > 0 && rate < 100 && cur > 0) return cur / (1 - rate / 100);
    return null;
  };
  const discountOf = (item) => {
    const old = oldPriceOf(item);
    const cur = currentPrice(item);
    if (old && old > cur && cur > 0) return Math.round(((old - cur) / old) * 100);
    const rate = parseFloat(item.tasa_descuento || 0);
    return rate > 0 && rate < 100 ? Math.round(rate) : null;
  };
  const productImg = (item) => {
    if (!item.imagen_url) return 'https://via.placeholder.com/300?text=Sin+Imagen';
    return /^https?:\/\//.test(item.imagen_url) ? item.imagen_url : `/storage/${item.imagen_url}`;
  };

  const sectionIsOpen = (key) => openSections[key] !== false;

  const sectionHeader = (key, label) => (
    <button onClick={() => toggleSection(key)} className="w-full flex items-center justify-between py-1 text-left cursor-pointer">
      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`material-symbols-outlined text-base text-slate-400 transition-transform duration-200 ${sectionIsOpen(key) ? 'rotate-180' : ''}`}>expand_more</span>
    </button>
  );

  const renderSection = (sec) => {
    if (sec.type === 'cats') {
      const key = 'categorias';

      if (catType === 'parent' || catType === 'sub') {
        const parentCat = catType === 'parent'
          ? categorias.find((c) => String(c.id) === String(activeCategory))
          : categorias.find((c) => c.children?.some((ch) => String(ch.id) === String(activeCategory)));
        const parentId = catType === 'parent' ? activeCategory : (parentCat ? String(parentCat.id) : null);
        if (!parentCat) return null;
        const isParentActive = catType === 'parent';
        return (
          <div key={key} className="py-2 border-b border-slate-100">
            {sectionHeader(key, sec.label)}
            {sectionIsOpen(key) && (
              <div className="mt-1 space-y-0.5 text-sm font-medium">
                <button
                  onClick={() => toggleCategory(parentId)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${isParentActive ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-600 hover:text-black hover:bg-slate-50'}`}
                >
                  <span>Todas</span>
                </button>
                {parentCat.children?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => toggleCategory(sub.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer truncate ${activeCategory === String(sub.id) ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-500 hover:text-black hover:bg-slate-50'}`}
                  >
                    {sub.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={key} className="py-2 border-b border-slate-100">
          {sectionHeader(key, sec.label)}
          {sectionIsOpen(key) && (
            <div className="mt-1 space-y-0.5 text-sm font-medium">
              <button
                onClick={() => toggleCategory('')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${!activeCategory ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-600 hover:text-black hover:bg-slate-50'}`}
              >
                <span>Todas</span>
              </button>
              {categorias?.map((cat) => (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    onClick={() => (cat.children?.length ? toggleExpandCat(cat.id) : toggleCategory(cat.id))}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${activeCategory === String(cat.id) ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-600 hover:text-black hover:bg-slate-50'}`}
                  >
                    <span className="truncate">{cat.nombre}</span>
                    {cat.children?.length > 0 && (
                      <span className={`material-symbols-outlined text-sm text-slate-400 transition-transform duration-200 shrink-0 ${expandedCat === cat.id ? 'rotate-180' : ''}`}>expand_more</span>
                    )}
                  </button>
                  {expandedCat === cat.id && cat.children?.length > 0 && (
                    <div className="ml-4 pl-3 border-l-2 border-[#fea619]/30 space-y-0.5">
                      {cat.children.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => toggleCategory(sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer truncate ${activeCategory === String(sub.id) ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-500 hover:text-black hover:bg-slate-50'}`}
                        >
                          {sub.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (sec.type === 'attrs') {
      const key = `attrs_${sec.key}`;
      return (
        <div key={key} className="py-2 border-b border-slate-100">
          {sectionHeader(key, sec.label)}
          {sectionIsOpen(key) && (
            <div className="mt-1 space-y-1.5 text-sm font-medium">
              {sec.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer hover:text-black transition-colors">
                  <input
                    type="checkbox"
                    checked={activeAttrs[sec.key] === opt}
                    onChange={() => toggleAttr(sec.key, opt)}
                    className="rounded border-slate-300 accent-[#fea619] focus:ring-[#fea619]/50"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (sec.type === 'brand') {
      const key = 'marca';
      return (
        <div key={key} className="py-2 border-b border-slate-100">
          {sectionHeader(key, sec.label)}
          {sectionIsOpen(key) && (
            <div className="mt-1 space-y-1.5 text-sm font-medium max-h-64 overflow-y-auto no-scrollbar pr-1">
              {marcas?.length > 0 ? (
                marcas.map((m) => (
                  <label key={m.id} className="flex items-center gap-2.5 cursor-pointer hover:text-black transition-colors">
                    <input
                      type="checkbox"
                      checked={activeBrand === String(m.id)}
                      onChange={() => toggleBrand(m.id)}
                      className="rounded border-slate-300 accent-[#fea619] focus:ring-[#fea619]/50"
                    />
                    <span className="truncate">{m.nombre}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-400">No hay marcas registradas.</p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (sec.type === 'price') {
      const key = 'precio';
      const range = Math.max(1, maxPrice - minPriceFloor);
      const step = range < 100 ? (range < 50 ? 1 : 5) : 50;
      const handleKeyDown = (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === ',' ) e.preventDefault();
      };
      const pct = maxPrice > minPriceFloor ? ((Number(sliderMax || minPriceFloor) - minPriceFloor) / (maxPrice - minPriceFloor)) * 100 : 100;
      return (
        <div key={key} className="py-2">
          {sectionHeader(key, sec.label)}
          {sectionIsOpen(key) && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus-within:border-[#fea619] transition-colors">
                  <span className="text-[10px] font-black text-slate-400">S/</span>
                  <input
                    type="number"
                    min="0"
                    max={maxPrice}
                    value={draftMin}
                    onChange={handleMinInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Min"
                    className="bg-transparent w-full text-xs font-bold outline-none placeholder-slate-300 no-spinner"
                  />
                </div>
                <span className="text-slate-400 text-xs">–</span>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus-within:border-[#fea619] transition-colors">
                  <span className="text-[10px] font-black text-slate-400">S/</span>
                  <input
                    type="number"
                    min="0"
                    max={maxPrice}
                    value={draftMax}
                    onChange={handleMaxInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Max"
                    className="bg-transparent w-full text-xs font-bold outline-none placeholder-slate-300 no-spinner"
                  />
                </div>
              </div>

              <div className="relative mt-5">
                <input
                  type="range"
                  min={minPriceFloor}
                  max={maxPrice}
                  step={step}
                  value={sliderMax}
                  onChange={handlePriceSlider}
                  className="w-full accent-[#fea619] cursor-pointer"
                  style={{ height: '4px' }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1">
                <span>S/ {Number(minPriceFloor).toLocaleString()}</span>
                <span className="text-[#855300] font-extrabold">S/ {Number(sliderMax || minPriceFloor).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans flex flex-col selection:bg-[#fea619]/30">
      <Head title="Catálogo de Productos - CMA Store">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>

      <StoreHeader key={activeSearch} categorias={categorias} initialSearch={activeSearch} />

      <main className="flex-grow max-w-[1280px] mx-auto px-6 py-8 w-full">
        {/* Banner Promocional */}
        <section className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e0532e] via-[#c8451e] to-[#932a10] shadow-xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute -bottom-12 left-1/4 w-48 h-48 bg-black/20 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4 px-6 sm:px-10 lg:px-12 py-6 lg:h-[150px] w-full">
            {/* Bloque Izquierdo: Textos Promocionales */}
            <div className="text-center lg:text-left max-w-md shrink-0">
              <h1 className="text-white font-black text-lg sm:text-xl lg:text-2xl leading-tight">
                Innovación y Calidad en Racks y Ferretería
              </h1>
              <p className="mt-1.5 text-white/90 text-xs sm:text-sm font-semibold">
                Lo último en soportes de TV y herramientas{' '}
                <span className="inline-block bg-black text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full align-middle shadow">
                  está aquí
                </span>
              </p>
            </div>

            {/* Bloque Centro: Muestra de Productos */}
            <div className="hidden md:flex items-center justify-center gap-3 shrink-0">
              {productList.slice(0, 4).map((item) => {
                const thumbUrl = item.imagen_url
                  ? (/^https?:\/\//.test(item.imagen_url) ? item.imagen_url : `/storage/${item.imagen_url}`)
                  : 'https://via.placeholder.com/100?text=CMA';
                return (
                  <img
                    key={item.id}
                    src={thumbUrl}
                    alt={item.nombre}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/95 object-contain p-1.5 shadow-md ring-1 ring-white/40 hover:scale-110 hover:rotate-2 transition-transform"
                  />
                );
              })}
            </div>

            {/* Bloque Derecho: Insignias de Servicio */}
            <div className="flex items-center justify-center gap-5 lg:gap-6 shrink-0">
              {[
                { icon: 'local_shipping', label: 'Envíos a todo el país' },
                { icon: 'verified_user', label: 'Compra segura garantizada' },
                { icon: 'storefront', label: 'Retira o solicita tu instalación' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black text-white flex items-center justify-center shadow-lg ring-2 ring-white/30">
                    <span className="material-symbols-outlined text-lg sm:text-xl">{b.icon}</span>
                  </span>
                  <span className="text-white text-[10px] font-bold leading-tight max-w-[95px]">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtros */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              {/* Título de la Categoría Activa */}
              {activeCategoryName && (
                <div className="pb-3 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#855300]">category</span>
                    {catType === 'parent' || theme ? 'Categoría' : 'Sub-Categoría'}
                  </span>
                  <h2 className="text-lg font-black text-black leading-tight mt-1">{activeCategoryName}</h2>
                </div>
              )}

              <div className="pb-3 border-b border-slate-100 mb-1 flex items-center justify-between gap-2">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#855300]">tune</span>
                  Filtros
                </h3>
                {hasActiveFilters && (
                  <button onClick={cleanFilters} className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                    Limpiar
                  </button>
                )}
              </div>

              {/* Chips de Filtros Activos */}
              {chips.length > 0 && (
                <div className="py-3 border-b border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <button
                        key={chip.key}
                        onClick={() => removeFilter(chip.key)}
                        className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        {chip.label}
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Secciones de Filtros Dinámicas por Categoría */}
              {sections.map((sec) => renderSection(sec))}
            </div>
          </aside>

          {/* Contenido Derecho */}
          <div className="flex-1 min-w-0">
            {/* Barra Superior de Ordenamiento y Estado */}
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between gap-3 flex-wrap mb-6">
              <span className="text-sm font-bold text-slate-700">
                {productList.length} de <span className="text-black font-extrabold">{productos?.total ?? productList.length}</span> resultados
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={activeSort}
                  onChange={handleSort}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <option value="">Destacados / Relevancia</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                </select>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}
                  >
                    <span className="material-symbols-outlined text-lg">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${viewMode === 'list' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}
                  >
                    <span className="material-symbols-outlined text-lg">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grilla / Lista de Productos */}
            {productList.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {productList.map((item) => {
                    const old = oldPriceOf(item);
                    const disc = discountOf(item);
                    return (
                      <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative aspect-square bg-white p-5 flex items-center justify-center overflow-hidden border-b border-slate-100">
                          <img className="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500" src={productImg(item)} alt={item.nombre} />
                          {disc !== null && (
                            <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                              -{disc}%
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          {item.marca?.nombre && (
                            <span className="text-[10px] font-black tracking-widest uppercase text-[#855300] mb-1">{item.marca.nombre}</span>
                          )}
                          <Link
                            href={route('store.detail', item.id)}
                            className="font-bold text-sm text-black leading-snug line-clamp-2 mb-3 group-hover:text-[#855300] transition-colors"
                          >
                            {item.nombre}
                          </Link>
                          <div className="mt-auto">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {old !== null && (
                                <span className="text-xs font-semibold text-slate-400 line-through">S/ {old.toFixed(2)}</span>
                              )}
                              <span className="text-lg font-black text-black">S/ {currentPrice(item).toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">local_shipping</span>
                              Envío a todo el país · Retiro en tienda
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                              <span className="text-[10px] font-bold text-emerald-600">Stock: {formatStock(item.stock, item.unidad_medida)}</span>
                              <Link
                                href={route('store.detail', item.id)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-[#fea619] hover:text-black transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Ver
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {productList.map((item) => {
                    const old = oldPriceOf(item);
                    const disc = discountOf(item);
                    return (
                      <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="sm:w-44 shrink-0 bg-white p-4 flex items-center justify-center min-h-[160px] border-b sm:border-b-0 sm:border-r border-slate-100">
                          <img className="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500" src={productImg(item)} alt={item.nombre} />
                        </div>
                        <div className="p-5 flex flex-1 flex-col justify-center gap-1">
                          <div className="flex items-center gap-2">
                            {item.marca?.nombre && (
                              <span className="text-[10px] font-black tracking-widest uppercase text-[#855300]">{item.marca.nombre}</span>
                            )}
                            {disc !== null && (
                              <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">-{disc}%</span>
                            )}
                          </div>
                          <Link href={route('store.detail', item.id)} className="font-bold text-base text-black leading-snug group-hover:text-[#855300] transition-colors">
                            {item.nombre}
                          </Link>
                          <div className="flex items-baseline gap-2 mt-1">
                            {old !== null && (
                              <span className="text-xs font-semibold text-slate-400 line-through">S/ {old.toFixed(2)}</span>
                            )}
                            <span className="text-xl font-black text-black">S/ {currentPrice(item).toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-xs">local_shipping</span>
                            Envío a todo el país · Retiro en tienda
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-bold text-emerald-600">Stock: {formatStock(item.stock, item.unidad_medida)}</span>
                            <Link
                              href={route('store.detail', item.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-[#fea619] hover:text-black transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Ver Producto
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">search_off</span>
                <p className="text-slate-500 font-bold">
                  {hasActiveFilters
                    ? 'No se encontraron productos con los filtros seleccionados.'
                    : 'No se encontraron productos registrados en el POS.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={cleanFilters} className="mt-4 text-xs font-bold text-white bg-black px-5 py-2.5 rounded-xl hover:bg-[#fea619] hover:text-black transition-all">
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {productos && productos.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => goToPage(Number(productos.current_page) - 1)}
                  disabled={!productos.prev_page_url}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-xs font-bold text-slate-600">Página {productos.current_page} de {productos.last_page}</span>
                <button
                  onClick={() => goToPage(Number(productos.current_page) + 1)}
                  disabled={!productos.next_page_url}
                  className="px-4 py-2.5 bg-black text-white border border-black rounded-xl text-xs font-bold hover:bg-[#fea619] hover:text-black hover:border-[#fea619] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
