import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreHeader from '@/Components/StoreHeader';
import StoreFooter from '@/Components/StoreFooter';
import { formatStock, formatFactor } from '@/Utils/format';
import { getYouTubeId } from '@/Utils/video';

export default function StoreDetail({ producto, similares, categorias }) {
  const [activeTab, setActiveTab] = useState('details');
  const [added, setAdded] = useState(false);

  const conversiones = (producto?.conversiones || []).filter((c) => c && (c.estado === 'Activo' || c.estado === undefined || c.estado === null));
  const hasConversions = conversiones.length > 0;
  const [selectedConvId, setSelectedConvId] = useState(null);
  const selectedConv = conversiones.find((c) => c.id === selectedConvId) || null;

  const basePrice = parseFloat(producto?.precio_venta || 0);
  const baseDiscountPct = parseFloat(producto?.tasa_descuento || 0);
  const hasBaseDiscount = baseDiscountPct > 0 && baseDiscountPct < 100 && basePrice > 0;
  const baseOldPrice = hasBaseDiscount ? basePrice / (1 - baseDiscountPct / 100) : null;

  const convPrice = selectedConv ? parseFloat(selectedConv.precio_venta || 0) : 0;
  const convDiscountPct = selectedConv ? parseFloat(selectedConv.tasa_descuento || 0) : 0;
  const hasConvDiscount = convDiscountPct > 0 && convDiscountPct < 100 && convPrice > 0;
  const convCurrentPrice = hasConvDiscount ? convPrice * (1 - convDiscountPct / 100) : convPrice;
  const convOldPrice = hasConvDiscount ? convPrice : null;

  const fmtPrice = (v, decimals = 2) => `S/ ${parseFloat(v || 0).toFixed(decimals || 2)}`;

  const [activeMedia, setActiveMedia] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbsRef = useRef(null);

  const resolveImg = (url) => {
    if (!url) return url;
    return url.startsWith('http://') || url.startsWith('https://') ? url : `/storage/${url}`;
  };

  const imgUrl = resolveImg(producto?.imagen_url) || 'https://via.placeholder.com/500?text=Sin+Imagen';

  const rawImagenes = producto?.imagenes?.length
    ? producto.imagenes.filter(Boolean)
    : (producto?.imagen_url ? [producto.imagen_url] : []);
  const showVideo = producto?.mostrar_video !== false;
  const youtubeVideoId = showVideo ? getYouTubeId(producto?.video_url) : null;

  const galleryMedia = rawImagenes.map((url) => ({ type: 'image', url: resolveImg(url) }));
  if (galleryMedia.length === 0) galleryMedia.push({ type: 'image', url: imgUrl });
  if (youtubeVideoId) galleryMedia.push({ type: 'video' });
  const activeSlide = galleryMedia[activeMedia];

  const goMedia = (dir) => setActiveMedia((i) => (i + dir + galleryMedia.length) % galleryMedia.length);
  const scrollThumbs = (dir) => {
    if (thumbsRef.current) thumbsRef.current.scrollBy({ top: dir * 120, behavior: 'smooth' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = producto?.nombre || 'Producto CMA Store';
    const text = `${title} - S/ ${parseFloat(producto?.precio_venta || 0).toFixed(2)} | CMA Store`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        /* cancelado */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* sin soporte */
    }
  };

  const cat = producto?.categoria;
  const topCat = cat?.parent ?? null;
  const subCat = cat && cat.parent ? cat : null;

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedCarouselRef = useRef(null);
  const scrollSlider = (ref, dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans flex flex-col selection:bg-[#fea619]/30">
      <Head title={`${producto?.nombre || 'Producto'} | CMA Store`}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>

      <StoreHeader categorias={categorias} />

      <main className="flex-grow max-w-[1280px] mx-auto px-6 py-8 w-full">
        {/* Breadcrumb: Categoría / Subcategoría / Producto */}
        <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-8 text-xs font-medium text-slate-400">
          <Link href={route('store.index')} className="hover:text-black transition-colors">Inicio</Link>
          <span className="text-slate-300 select-none">/</span>
          <Link href={route('store.catalog')} className="hover:text-black transition-colors">Productos</Link>
          <span className="text-slate-300 select-none">/</span>
          {topCat && (
            <>
              <Link href={route('store.catalog', { category: topCat.id })} className="hover:text-black transition-colors truncate max-w-[200px]">
                {topCat.nombre}
              </Link>
              <span className="text-slate-300 select-none">/</span>
            </>
          )}
          {subCat && (
            <>
              <Link href={route('store.catalog', { category: subCat.id })} className="hover:text-black transition-colors truncate max-w-[200px]">
                {subCat.nombre}
              </Link>
              <span className="text-slate-300 select-none">/</span>
            </>
          )}
          {cat && !cat.parent && (
            <>
              <Link href={route('store.catalog', { category: cat.id })} className="hover:text-black transition-colors truncate max-w-[200px]">
                {cat.nombre}
              </Link>
              <span className="text-slate-300 select-none">/</span>
            </>
          )}
          <span className="text-black font-black underline decoration-[#fea619] decoration-2 underline-offset-4">
            {producto?.nombre || 'Detalle'}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Galería de Producto: Miniaturas + Visor Principal */}
          <div className="lg:col-span-7">
            <div className="flex gap-4">
              {/* Columna Izquierda: Miniaturas Verticales */}
              <div className="flex flex-col items-center w-20 sm:w-24 shrink-0">
                <button
                  onClick={() => scrollThumbs(-1)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-[#fea619]/10 hover:border-[#fea619]/40 transition-colors cursor-pointer mb-2"
                  aria-label="Ver miniaturas anteriores"
                >
                  <span className="material-symbols-outlined text-base text-slate-500">expand_less</span>
                </button>

                <div ref={thumbsRef} className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[380px] pr-0.5">
                  {galleryMedia.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMedia(idx)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden bg-white border transition-all cursor-pointer group/thumb ${
                        activeMedia === idx ? 'border-[2.5px] border-black shadow-md' : 'border border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {m.type === 'video' ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black">
                          <span className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center group-hover/thumb:bg-[#fea619] group-hover/thumb:border-[#fea619] transition-colors">
                            <span className="material-symbols-outlined text-lg text-white group-hover/thumb:text-black">play_arrow</span>
                          </span>
                        </span>
                      ) : (
                        <img src={m.url} alt={`${producto?.nombre || 'Producto'} ${idx + 1}`} className="w-full h-full object-contain" />
                      )}
                      {activeMedia === idx && (
                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#fea619]"></span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => scrollThumbs(1)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-[#fea619]/10 hover:border-[#fea619]/40 transition-colors cursor-pointer mt-2"
                  aria-label="Ver más miniaturas"
                >
                  <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
                </button>
              </div>

              {/* Columna Derecha: Visor Principal */}
              <div className="flex-1 relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center min-h-[400px]">
                {activeSlide.type === 'video' ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title={`Video - ${producto?.nombre || 'Producto'}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    key={activeMedia}
                    src={activeSlide.url}
                    className="max-h-[400px] object-contain hover:scale-105 transition-transform duration-500 animate-in fade-in duration-300"
                    alt={producto?.nombre}
                  />
                )}

                {/* Botones flotantes: Corazón y Compartir */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => setFavorited(!favorited)}
                    aria-label="Agregar a favoritos"
                    className={`w-10 h-10 rounded-full bg-white border shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      favorited ? 'border-[#fea619] text-[#ef4444]' : 'border-slate-200 text-slate-400 hover:text-[#ef4444]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{favorited ? 'favorite' : 'favorite_border'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Compartir producto"
                    className={`w-10 h-10 rounded-full bg-white border shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      copied ? 'border-emerald-400 text-emerald-600' : 'border-slate-200 text-slate-400 hover:text-[#855300]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{copied ? 'check' : 'share'}</span>
                  </button>
                </div>

                {galleryMedia.length > 1 && (
                  <>
                    {/* Flecha derecha: avanzar */}
                    <button
                      onClick={() => goMedia(1)}
                      aria-label="Siguiente foto"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:border-[#fea619] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl font-bold text-black">chevron_right</span>
                    </button>
                    {/* Flecha izquierda: retroceder */}
                    <button
                      onClick={() => goMedia(-1)}
                      aria-label="Foto anterior"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:border-[#fea619] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl font-bold text-black">chevron_left</span>
                    </button>
                  </>
                )}

                {/* Indicador de posición (dots) */}
                {galleryMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-3 py-2 shadow-md">
                    {galleryMedia.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveMedia(idx)}
                        aria-label={`Ver foto ${idx + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeMedia === idx ? 'w-6 bg-[#fea619]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información Producto */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {producto?.categoria?.nombre && (
                  <span className="bg-[#fea619] text-black text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">{producto.categoria.nombre}</span>
                )}
                {producto?.marca?.nombre && (
                  <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">{producto.marca.nombre}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black mb-2">{producto?.nombre}</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                SKU: <span className="font-bold text-black">{producto?.sku || 'N/A'}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-black">
                {selectedConv ? fmtPrice(convCurrentPrice) : fmtPrice(basePrice)}
              </span>
              {selectedConv ? (
                hasConvDiscount && convOldPrice > convCurrentPrice && (
                  <span className="text-xs text-slate-400 line-through">{fmtPrice(convOldPrice)}</span>
                )
              ) : (
                hasBaseDiscount && baseOldPrice > basePrice && (
                  <span className="text-xs text-slate-400 line-through">{fmtPrice(baseOldPrice)}</span>
                )
              )}
              {(selectedConv ? hasConvDiscount : hasBaseDiscount) && (
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                  -{selectedConv ? Math.round(convDiscountPct) : Math.round(baseDiscountPct)}%
                </span>
              )}
            </div>

            {/* Selector de Unidades de Medida */}
            {hasConversions && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Presentación / Unidad de Venta</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      !selectedConv ? 'bg-black text-white border-black shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {producto?.unidad_medida || 'Unidad'}
                    <span className={`block text-[10px] font-semibold mt-0.5 ${!selectedConv ? 'text-orange-300' : 'text-slate-400'}`}>
                      {selectedConv ? '' : `S/ ${parseFloat(producto?.precio_venta || 0).toFixed(2)}`}
                    </span>
                  </button>
                  {conversiones.map((conv) => {
                    const convDisc = parseFloat(conv.tasa_descuento || 0);
                    const hasConvDisc = convDisc > 0 && convDisc < 100;
                    const convPriceNow = hasConvDisc ? parseFloat(conv.precio_venta || 0) * (1 - convDisc / 100) : parseFloat(conv.precio_venta || 0);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConvId(conv.id)}
                        className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                          selectedConvId === conv.id ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:border-slate-400'
                        }`}
                      >
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${selectedConvId === conv.id ? 'text-white' : 'text-slate-700'}`}>
                          {conv.unidad?.nombre || conv.unidad_medida || 'Presentación'}
                          {hasConvDisc && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${selectedConvId === conv.id ? 'bg-orange-400 text-black' : 'bg-green-600 text-white'}`}>
                              -{Math.round(convDisc)}%
                            </span>
                          )}
                        </span>
                        <span className={`block text-[10px] font-semibold mt-0.5 ${selectedConvId === conv.id ? 'text-orange-300' : 'text-slate-400'}`}>
                          {conv.factor > 1 ? `${formatFactor(conv.factor)} unidades` : ''} · S/ {convPriceNow.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedConv && selectedConv.factor > 1 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Esta presentación equivale a <span className="font-bold text-black">{formatFactor(selectedConv.factor)}</span> unidades de{' '}
                    <span className="font-bold text-black">{producto?.unidad_medida || 'unidad'}</span>.
                  </p>
                )}
              </div>
            )}

            {/* Especificaciones Rápidas */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-400 uppercase">Stock Disponible</p>
                <p className="font-black text-black mt-0.5">{formatStock(producto?.stock, producto?.unidad_medida)}</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-400 uppercase">Unidad Base</p>
                <p className="font-black text-black mt-0.5">{producto?.unidad_medida || 'UN'}</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-12 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shadow-md ${added ? 'bg-emerald-600 text-white' : 'bg-black text-white hover:bg-slate-800'}`}
              >
                <span className="material-symbols-outlined text-sm">{added ? 'check' : 'shopping_cart'}</span>
                <span>{added ? '¡Añadido al Carrito!' : 'Agregar al Carrito'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de Detalle */}
        <section className="mt-16 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex gap-6 border-b border-slate-100 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`font-bold text-sm pb-2 border-b-2 transition-all cursor-pointer ${activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-black'}`}
            >
              Detalles del Producto
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`font-bold text-sm pb-2 border-b-2 transition-all cursor-pointer ${activeTab === 'specs' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-black'}`}
            >
              Especificaciones Técnicas
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed animate-in fade-in duration-300">
              <p>
                {producto?.nombre} es un producto garantizado para ferretería e instalaciones de alta calidad.
              </p>
              <p>
                Categoría: <span className="font-bold text-black">{producto?.categoria?.nombre || 'General'}</span> | Marca: <span className="font-bold text-black">{producto?.marca?.nombre || 'Sin Marca'}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-xs animate-in fade-in duration-300">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">SKU</span>
                <span className="font-bold text-black">{producto?.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Unidad de Medida</span>
                <span className="font-bold text-black">{producto?.unidad_medida || 'UN'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Video del Producto */}
        {showVideo && (
        <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-2 bg-[#fea619]/10 border border-[#fea619]/30 text-[#855300] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-sm">play_circle</span>
              Video
            </span>
            <h2 className="text-lg sm:text-xl font-black text-black">Video del Producto</h2>
          </div>

          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
            {youtubeVideoId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`Video - ${producto?.nombre || 'Producto'}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center px-6 py-16">
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-white/80">play_arrow</span>
                </div>
                <p className="text-white font-black text-lg mt-5">Video Disponible Próximamente</p>
                <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                  Estamos preparando un video explicativo para este producto. Vuelve pronto para verlo en acción.
                </p>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Productos Relacionados */}
        {similares.length > 0 && (
          <section className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#fea619]/10 border border-[#fea619]/30 text-[#855300] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Productos Relacionados
                </span>
                <h2 className="text-lg sm:text-xl font-black text-black mt-2.5">
                  Los clientes también vieron
                </h2>
              </div>
              <Link
                href={route('store.catalog', { category: producto?.categoria_id })}
                className="text-[#ef4444] font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 hover:underline transition-all shrink-0"
              >
                Ver más <span className="material-symbols-outlined text-base">chevron_right</span>
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => scrollSlider(relatedCarouselRef, -1)}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl font-bold text-black">chevron_left</span>
              </button>

              <div ref={relatedCarouselRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2">
                {similares.map((item) => {
                  const imgUrl = item.imagen_url
                    ? (item.imagen_url.startsWith('http://') || item.imagen_url.startsWith('https://')
                      ? item.imagen_url
                      : `/storage/${item.imagen_url}`)
                    : 'https://via.placeholder.com/300?text=Sin+Imagen';

                  return (
                    <div
                      key={item.id}
                      className="group bg-[#f7f9fb] rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-[280px] sm:w-[300px] shrink-0 snap-start"
                    >
                      <div className="h-64 p-6 relative overflow-hidden bg-white flex items-center justify-center">
                        <img className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" src={imgUrl} alt={item.nombre} />
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {item.marca?.nombre || 'CMA'}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <span className="text-xs font-bold text-[#855300] mb-1">SKU: {item.sku || 'N/A'}</span>
                        <h4 className="font-bold text-base text-black mb-2 group-hover:text-[#855300] transition-colors line-clamp-2">{item.nombre}</h4>
                        <p className="text-xs text-slate-500 mb-4">Stock disponible: <span className="font-bold text-green-600">Disponibles</span></p>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                          <span className="text-xl font-black text-black">S/ {parseFloat(item.precio_venta || 0).toFixed(2)}</span>
                          <Link href={route('store.detail', item.id)} className="p-2.5 bg-black text-white rounded-xl hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => scrollSlider(relatedCarouselRef, 1)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl font-bold text-black">chevron_right</span>
              </button>
            </div>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
