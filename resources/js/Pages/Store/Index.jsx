import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import StoreHeader from '@/Components/StoreHeader';
import StoreFooter from '@/Components/StoreFooter';
import banner1 from '@/Assets/Banner/banner1.webp';
import pretulLogo from '@/Assets/Marcas/pretul-logo.webp';
import soportexLogo from '@/Assets/Marcas/soportex_innova_logo.webp';
import stanleyLogo from '@/Assets/Marcas/stanley-logo.webp';
import strutekLogo from '@/Assets/Marcas/Strutek-logo.webp';
import truperLogo from '@/Assets/Marcas/Truper-logo.webp';

export default function StoreIndex({ categorias, productos, racksCategoria = null, racksProductos = [], construccionCategoria = null, construccionProductos = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showHelpWidget, setShowHelpWidget] = useState(true);
  const rackCarouselRef = useRef(null);
  const categoriesCarouselRef = useRef(null);
  const featuredCarouselRef = useRef(null);
  const ferreteriaCarouselRef = useRef(null);

  const scrollSlider = (ref, dir) => {
    const el = ref.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const productList = productos || [];

  const mainCategories = categorias || [];

  const racksProducts = racksProductos || [];
  const racksTitle = racksCategoria?.nombre || 'Racks y Soportes para TV';
  const racksCategoryId = racksCategoria?.id || null;

  const construccionProducts = construccionProductos || [];
  const construccionTitle = construccionCategoria?.nombre || 'Ferretería y Herramientas';
  const construccionCategoryId = construccionCategoria?.id || null;

  const categoryIcons = [
    'handyman',
    'power',
    'plumbing',
    'electrical_services',
    'construction',
    'hardware',
    'build',
    'engineering',
    'grid_view',
    'settings_brick_home',
  ];

  const slides = [
    {
      image: banner1,
      tag: 'Servicios de Instalación Elite',
      title: 'Hardware de Precisión y Montaje Profesional de TV',
      desc: 'Desde herramientas estructurales de uso rudo hasta sistemas de racks profesionales, proporcionamos los componentes industriales y la instalación experta que su proyecto exige.',
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgEAMQoSvf7kM2gmjoSyFpUSuC_0b0C2KmGC9_9riq4gBbXlFKApkSw0KXeTytWgKoTnoRCAln1cA77vqTHljvRxAnnu2Df62oLYCqfBBEqApdI-IeVAjHVled9857LOiCunwWkPXaPIOdDP9GNhsbcmPgmfp8aelF3vli4D2Jn5Y2ZM9BioSSe0YMvh8U9qPBttAm8cR5StWmMC_KMRudsot3GaTWOVr3fAM_9ZnFI9Sl1-qPfiBrvn5JOae6kFRMMGoOe1khZzM',
      tag: 'Herramientas de Alto Rendimiento',
      title: 'Equipamiento Profesional para Contratistas',
      desc: 'Herramientas eléctricas e inalámbricas con tecnología de punta diseñadas para resistir los entornos de trabajo más exigentes.',
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD-pfHKzTiL1tDakaBTagwr1NYxITB1nz9CzjvqvihjeJeyOtYP2oit7-BDlDUxnT25D0U8LauIvAij29c_IELwKWefpN6NQtVPIkw1jmviomkwFy8YQMPMdXl6jOazJmgeBGXBSo7cCaHCWNYO2Iuzfq-R8B46VLZDR6hel9cO2CergmN17vTsBFe9k0wrk9H8sufm28Zl7eBPDydz7Qt-rYpO2ytXUbrfdDZZQcJTPWQ_KIvOFXVVB6siBdUKxE9jl6_NloaI1Y',
      tag: 'Sistemas Industriales',
      title: 'Soportes de Nivel e Infraestructura Compleja',
      desc: 'Nivelación láser y estructuras avanzadas para instalaciones de video wall y despliegues comerciales en todo el país.',
    }
  ];

  const brands = [
    { id: 'pretul', name: 'Pretul', logo: pretulLogo },
    { id: 'soportex-innova', name: 'Soportex Innova', logo: soportexLogo },
    { id: 'stanley', name: 'Stanley', logo: stanleyLogo },
    { id: 'strutek', name: 'Strutek', logo: strutekLogo },
    { id: 'truper', name: 'Truper', logo: truperLogo },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans selection:bg-[#fea619]/30">
      <Head title="CMA Store - Tienda Hardware & Racks">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes infiniteScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-infinite-scroll {
            display: flex;
            width: max-content;
            animation: infiniteScroll 25s linear infinite;
          }
          .animate-infinite-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </Head>

      <StoreHeader categorias={categorias} />

      <main>
        {/* Carrusel Hero */}
        <section className="relative min-h-[600px] lg:min-h-[700px] bg-black overflow-hidden flex items-center">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105 hover:scale-100" style={{ backgroundImage: `url('${slide.image}')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30"></div>
            </div>
          ))}

          <div className="relative z-20 max-w-[1280px] mx-auto px-6 w-full py-16">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-[#fea619] text-black text-xs font-black rounded shadow-lg mb-6 uppercase tracking-widest animate-bounce">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                {slides[currentSlide].tag}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black mb-6 leading-[1.1] text-white drop-shadow-md transition-all duration-700">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg text-slate-200 mb-8 max-w-xl leading-relaxed">
                {slides[currentSlide].desc}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={route('store.catalog')}
                  className="h-13 px-8 bg-[#fea619] text-black font-extrabold text-sm rounded-xl flex items-center gap-2 hover:scale-105 hover:bg-[#ffb95f] active:scale-95 transition-all shadow-xl shadow-[#fea619]/20"
                >
                  Explorar Catálogo <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">bolt</span>
                </Link>
                {productList.length > 0 && (
                  <Link
                    href={route('store.detail', productList[0].id)}
                    className="h-13 px-8 bg-white/10 backdrop-blur-xl border border-white/30 text-white font-extrabold text-sm rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Ver Producto Destacado
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Indicadores de Carrusel */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${idx === currentSlide ? 'w-12 bg-[#fea619]' : 'w-3 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </section>

        {/* SLIDER INFINITE LOOP de Marcas y Logos */}
        <section className="py-7 border-y border-slate-200 bg-white overflow-hidden shadow-inner">
          <div className="animate-infinite-scroll flex items-center gap-16 select-none">
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={i}
                className="hover:scale-110 transition-all duration-300 cursor-pointer px-4 flex items-center"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  title={brand.name}
                  className="h-10 sm:h-12 w-auto object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                />
              </span>
            ))}
          </div>
        </section>

        {/* Categorías Técnicas */}
        <section className="py-20 max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-black mb-2">Categorías Técnicas</h2>
              <p className="text-slate-500 max-w-xl">Inventario de grado profesional seleccionado por su integridad estructural y precisión técnica.</p>
            </div>
            <Link href={route('store.catalog')} className="text-[#855300] font-bold text-sm flex items-center gap-1 hover:translate-x-2 transition-transform">
              Ver Catálogo Completo <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="relative">
            {/* Flecha izquierda */}
            <button
              onClick={() => scrollSlider(categoriesCarouselRef, -1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold text-black">chevron_left</span>
            </button>

            <div
              ref={categoriesCarouselRef}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
            >
              {mainCategories.length > 0 ? (
                mainCategories.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={route('store.catalog', { category: cat.id })}
                    className="group relative h-56 w-[280px] sm:w-[300px] shrink-0 snap-start rounded-2xl overflow-hidden border border-slate-200 bg-[#0f172a] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#fea619]/60 transition-all duration-500 flex flex-col justify-between p-6"
                  >
                    <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#fea619]/10 rounded-full group-hover:scale-150 group-hover:bg-[#fea619]/25 transition-all duration-700"></div>

                    <div className="flex items-start justify-between relative">
                      <span className="material-symbols-outlined text-4xl text-[#fea619] group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        {categoryIcons[idx % categoryIcons.length]}
                      </span>
                      {cat.children && cat.children.length > 0 && (
                        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
                          {cat.children.length} sub
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <h3 className="text-lg font-black text-white uppercase tracking-wide group-hover:text-[#fea619] transition-colors">
                        {cat.nombre}
                      </h3>
                      <span className="text-[#fea619] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all mt-1">
                        Explorar <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-bold">No hay categorías registradas.</p>
                </div>
              )}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => scrollSlider(categoriesCarouselRef, 1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold text-black">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Banner Promocional Racks y Soportes TV */}
        <section className="relative bg-[#f7f9fb] overflow-hidden py-4 lg:py-6">
          {/* Imágenes de fondo a los lados */}
          <img src={banner1} alt="" className="absolute inset-y-0 left-0 w-1/2 object-cover opacity-20" />
          <img src={banner1} alt="" className="absolute inset-y-0 right-0 w-1/2 object-cover opacity-20 -scale-x-100" />

          {/* Contenedor trapezoidal gris claro */}
          <div className="relative max-w-[1280px] mx-auto px-6">
            <div className="mx-auto max-w-3xl bg-[#eef1f4] text-center px-10 py-8 sm:px-16 shadow-lg [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
              <span className="inline-flex items-center gap-2 text-[#855300] bg-white/70 border border-slate-200 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-sm">tv</span>
                Solo Racks
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mt-2 uppercase">
                {racksTitle}
              </h2>
              <div className="w-12 h-[3px] bg-[#fea619] rounded-full mx-auto mt-3"></div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto mt-3">
                Te brindan una experiencia de entretenimiento increíble, manteniendo tu televisor
                seguro y organizado.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Productos Racks y Soportes */}
        <section className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{racksTitle}</h2>
            <Link
              href={route('store.catalog', racksCategoryId ? { category: racksCategoryId } : {})}
              className="text-[#ef4444] font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 hover:underline transition-all"
            >
              Ver todos los productos <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>

          {/* Carrusel horizontal con flechas */}
          <div className="relative">
            {/* Flecha izquierda */}
            <button
              onClick={() => scrollSlider(rackCarouselRef, -1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold">chevron_left</span>
            </button>

            <div
              ref={rackCarouselRef}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
            >
              {racksProducts.length > 0 ? (
                racksProducts.map((p) => {
                  const imgUrl = p.imagen_url
                    ? (p.imagen_url.startsWith('http://') || p.imagen_url.startsWith('https://')
                      ? p.imagen_url
                      : `/storage/${p.imagen_url}`)
                    : 'https://via.placeholder.com/300?text=Sin+Imagen';

                  return (
                    <div
                      key={p.id}
                      className="group bg-[#f7f9fb] rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-[280px] sm:w-[300px] shrink-0 snap-start"
                    >
                      <div className="h-64 p-6 relative overflow-hidden bg-white flex items-center justify-center">
                        <img className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" src={imgUrl} alt={p.nombre} />
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {p.marca?.nombre || p.categoria?.nombre || 'CMA'}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <span className="text-xs font-bold text-[#855300] mb-1">
                          {p.marca?.nombre ? `${p.marca.nombre} · ` : ''}SKU: {p.sku || 'N/A'}
                        </span>
                        <h4 className="font-bold text-base text-black mb-2 group-hover:text-[#855300] transition-colors line-clamp-2">{p.nombre}</h4>
                        <p className="text-xs text-slate-500 mb-4">Stock disponible: <span className="font-bold text-green-600">Disponibles</span></p>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-black">S/ {parseFloat(p.precio_venta || 0).toFixed(2)}</span>
                          </div>
                          <Link href={route('store.detail', p.id)} className="p-2.5 bg-black text-white rounded-xl hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-bold">No hay productos disponibles actualmente.</p>
                </div>
              )}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => scrollSlider(rackCarouselRef, 1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Banner Instalación de Rack para TV */}
        <section className="relative w-full bg-[#2D2D2D] py-16 lg:py-20 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          ></div>

          {/* Resplandores decorativos */}
          <div className="absolute -top-28 -right-24 w-[420px] h-[420px] bg-[#fea619]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] bg-[#fea619]/15 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative max-w-[1280px] mx-auto px-6">
            {/* Encabezado compacto */}
            <div className="flex flex-col items-center text-center mb-12 lg:mb-14">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-[#fea619] text-[11px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                <span className="material-symbols-outlined text-base">verified</span>
                Servicio de Instalación Profesional
              </span>
              <p className="text-white/70 text-sm sm:text-base mt-4 max-w-2xl mx-auto">
                Instalación segura y garantizada en todo Lima. Precios referenciales según distrito.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">

              {/* Columna Izquierda: Bloque naranja sobresaliente */}
              <div className="relative lg:-my-8">
                {/* Capa trasera para dar profundidad */}
                <div className="absolute -inset-2.5 bg-black/30 rounded-[30px] -rotate-2 hidden lg:block"></div>

                <div className="relative bg-gradient-to-br from-[#ffb95f] via-[#fea619] to-[#e8890d] rounded-[28px] px-9 py-12 shadow-2xl shadow-[#fea619]/30 flex flex-col justify-between min-h-[250px] overflow-hidden group">
                  {/* Marca de agua de TV */}
                  <span className="material-symbols-outlined absolute -right-6 -bottom-8 text-[140px] text-white/15 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 pointer-events-none">tv</span>
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="relative flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                      <span className="material-symbols-outlined text-2xl">hardware</span>
                    </span>
                    <span className="bg-black/15 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Garantizado
                    </span>
                  </div>

                  <div className="relative">
                    <h3 className="text-3xl lg:text-[2.6rem] font-black text-white leading-[1.08] drop-shadow-md">
                      Instalación de Rack para TV
                    </h3>
                    <div className="w-16 h-[3px] bg-white rounded-full mt-5"></div>
                  </div>
                </div>
              </div>

              {/* Columna Central: Información y Contacto */}
              <div className="text-white">
                <p className="text-base lg:text-lg leading-relaxed text-white/90 border-l-4 border-[#fea619] pl-5">
                  Si usted cuenta con un rack de tv nosotros realizamos la instalación sin ningún
                  problema. Los precios pueden variar dependiendo del distrito.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-9">
                  <a
                    href="https://wa.me/51932777858"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-4 py-4 bg-[#fea619] text-black font-bold text-sm rounded-full hover:scale-105 hover:bg-[#ffb95f] hover:shadow-2xl hover:shadow-[#fea619]/40 active:scale-95 transition-all shadow-lg cursor-pointer group/wa"
                  >
                    <span className="w-9 h-9 rounded-full bg-black text-[#fea619] flex items-center justify-center group-hover/wa:scale-110 transition-transform shrink-0">
                      <FaWhatsapp className="text-lg" />
                    </span>
                    <span className="leading-tight">Contáctanos</span>
                  </a>
                  <a
                    href="tel:+51932777858"
                    className="inline-flex items-center justify-center gap-2.5 px-4 py-4 bg-[#2D2D2D] border-2 border-[#fea619] text-[#fea619] font-bold text-sm rounded-full hover:bg-[#fea619] hover:text-black hover:scale-105 hover:shadow-2xl hover:shadow-[#fea619]/40 active:scale-95 transition-all shadow-lg cursor-pointer group/tel"
                  >
                    <span className="w-9 h-9 rounded-full bg-black text-[#fea619] flex items-center justify-center group-hover/tel:scale-110 transition-transform shrink-0">
                      <FaPhone className="text-base" />
                    </span>
                    <span className="leading-tight">932 777 858</span>
                  </a>
                </div>
              </div>

              {/* Columna Derecha: Precio y Detalle */}
              <div className="text-white lg:text-right">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Instalación desde</h4>
                <p className="text-5xl lg:text-6xl xl:text-7xl font-black text-[#fea619] leading-none mt-4 lg:mt-5 [text-shadow:0_6px_40px_rgba(254,166,25,0.45)] drop-shadow-lg">
                  S/ 50.00
                </p>

                <div className="mt-8 lg:mt-9 space-y-4">
                  <div className="flex lg:justify-end items-center gap-3 pb-4 border-b border-white/15">
                    <span className="w-6 h-6 rounded-full bg-[#fea619]/15 text-[#fea619] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </span>
                    <p className="text-sm text-white/90">Instalación de rack para TV</p>
                  </div>
                  <div className="flex lg:justify-end items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#fea619]/15 text-[#fea619] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </span>
                    <p className="text-sm text-white/90">Instalamos cualquier tipo de rack</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Banner Promocional Ferretería */}
        <section className="relative bg-[#f7f9fb] overflow-hidden py-4 lg:py-6 mt-8 lg:mt-12">
          <img src={banner1} alt="" className="absolute inset-y-0 left-0 w-1/2 object-cover opacity-20" />
          <img src={banner1} alt="" className="absolute inset-y-0 right-0 w-1/2 object-cover opacity-20 -scale-x-100" />

          <div className="relative max-w-[1280px] mx-auto px-6">
            <div className="mx-auto max-w-3xl bg-[#eef1f4] text-center px-10 py-8 sm:px-16 shadow-lg [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
              <span className="inline-flex items-center gap-2 text-[#855300] bg-white/70 border border-slate-200 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-sm">hardware</span>
                Ferretería CMA
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mt-2 uppercase">
                {construccionTitle}
              </h2>
              <div className="w-12 h-[3px] bg-[#fea619] rounded-full mx-auto mt-3"></div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto mt-3">
                Todo lo que necesitas para construir, reparar y mejorar. Calidad garantizada en cada
                herramienta de las mejores marcas.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Productos Ferretería */}
        <section className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{construccionTitle}</h2>
            <Link
              href={route('store.catalog', construccionCategoryId ? { category: construccionCategoryId } : {})}
              className="text-[#ef4444] font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 hover:underline transition-all"
            >
              Ver todos los productos <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>

          <div className="relative">
            {/* Flecha izquierda */}
            <button
              onClick={() => scrollSlider(ferreteriaCarouselRef, -1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold text-black">chevron_left</span>
            </button>

            <div
              ref={ferreteriaCarouselRef}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
            >
              {construccionProducts.length > 0 ? (
                construccionProducts.map((p) => {
                  const imgUrl = p.imagen_url
                    ? (p.imagen_url.startsWith('http://') || p.imagen_url.startsWith('https://')
                      ? p.imagen_url
                      : `/storage/${p.imagen_url}`)
                    : 'https://via.placeholder.com/300?text=Sin+Imagen';

                  return (
                    <div
                      key={p.id}
                      className="group bg-[#f7f9fb] rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-[280px] sm:w-[300px] shrink-0 snap-start"
                    >
                      <div className="h-64 p-6 relative overflow-hidden bg-white flex items-center justify-center">
                        <img className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" src={imgUrl} alt={p.nombre} />
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {p.marca?.nombre || p.categoria?.nombre || 'CMA'}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <span className="text-xs font-bold text-[#855300] mb-1">
                          {p.marca?.nombre ? `${p.marca.nombre} · ` : ''}SKU: {p.sku || 'N/A'}
                        </span>
                        <h4 className="font-bold text-base text-black mb-2 group-hover:text-[#855300] transition-colors line-clamp-2">{p.nombre}</h4>
                        <p className="text-xs text-slate-500 mb-4">Stock disponible: <span className="font-bold text-green-600">Disponibles</span></p>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-black">S/ {parseFloat(p.precio_venta || 0).toFixed(2)}</span>
                          </div>
                          <Link href={route('store.detail', p.id)} className="p-2.5 bg-black text-white rounded-xl hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-bold">No hay productos disponibles actualmente.</p>
                </div>
              )}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => scrollSlider(ferreteriaCarouselRef, 1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold text-black">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Widget Flotante de Atención */}
        <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-3">
          {showHelpWidget && (
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 px-5 py-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => setShowHelpWidget(false)}
                className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-slate-600">close</span>
              </button>
              <p className="text-sm font-bold text-slate-800">Hola, ¿Puedo ayudarte?</p>
            </div>
          )}
          <a
            href="https://wa.me/51932777858"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl shadow-black/20 hover:scale-110 hover:rotate-6 transition-transform cursor-pointer"
          >
            <FaWhatsapp className="text-3xl text-white" />
          </a>
        </div>

        {/* Sección de Productos Destacados */}
        <section className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#fea619]/10 border border-[#fea619]/30 text-[#855300] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Top Ventas
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-3">Más Vendidos / Favoritos</h2>
            </div>
            <Link
              href={route('store.catalog')}
              className="text-[#ef4444] font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 hover:underline transition-all shrink-0"
            >
              Ver todos los productos <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>

          <div className="relative">
            {/* Flecha izquierda */}
            <button
              onClick={() => scrollSlider(featuredCarouselRef, -1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold text-black">chevron_left</span>
            </button>

            <div
              ref={featuredCarouselRef}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
            >
              {productList.length > 0 ? (
                productList.map((item) => {
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
                          {item.marca?.nombre || item.categoria?.nombre || 'CMA'}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <span className="text-xs font-bold text-[#855300] mb-1">
                          {item.marca?.nombre ? `${item.marca.nombre} · ` : ''}SKU: {item.sku || 'N/A'}
                        </span>
                        <h4 className="font-bold text-base text-black mb-2 group-hover:text-[#855300] transition-colors line-clamp-2">{item.nombre}</h4>
                        <p className="text-xs text-slate-500 mb-4">Stock disponible: <span className="font-bold text-green-600">Disponibles</span></p>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-black">S/ {parseFloat(item.precio_venta || 0).toFixed(2)}</span>
                          </div>
                          <Link href={route('store.detail', item.id)} className="p-2.5 bg-black text-white rounded-xl hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-bold">No hay productos disponibles actualmente.</p>
                </div>
              )}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => scrollSlider(featuredCarouselRef, 1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center hover:bg-[#fea619] hover:text-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold text-black">chevron_right</span>
            </button>
          </div>
        </section>

        {/* ¿Por qué elegirnos? */}
        <section className="py-20 max-w-[1280px] mx-auto px-6">
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fea619]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 p-8 sm:p-14 items-center">
              {/* Columna Texto */}
              <div className="relative">
                <span className="inline-flex items-center gap-2 bg-[#fea619]/10 border border-[#fea619]/30 text-[#855300] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                  Nuestro Compromiso
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-black leading-tight mt-5">
                  ¿Por qué elegir <span className="text-[#855300]">Ferretería CMA?</span>
                </h2>
                <p className="text-slate-500 mt-4 leading-relaxed max-w-md">
                  Trabajamos con las marcas de mayor confianza del mercado y ofrecemos asesoría
                  técnica para que compres con total seguridad y respaldo.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    'Precios competitivos para ferreteros y contratistas',
                    'Stock actualizado en tiempo real desde nuestro POS',
                    'Atención personalizada y asesoría de instalación',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#fea619]/15 text-[#855300] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={route('store.catalog')}
                  className="mt-9 inline-flex items-center gap-2.5 px-7 py-3.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#fea619] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Explorar Catálogo
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>

              {/* Columna Tarjetas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-6 bg-[#f7f9fb] border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-[#fea619]/15 text-[#855300] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </span>
                  <h3 className="font-bold text-black mt-4">Marcas Líderes</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Pretul, Stanley, Truper, Strutek y Soportex Innova.</p>
                  <div className="flex items-center gap-2.5 mt-4 flex-wrap">
                    <img src={pretulLogo} alt="Pretul" className="h-5 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    <img src={stanleyLogo} alt="Stanley" className="h-5 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    <img src={truperLogo} alt="Truper" className="h-5 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                  </div>
                </div>

                <div className="p-6 bg-[#f7f9fb] border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-[#fea619]/15 text-[#855300] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-2xl">local_shipping</span>
                  </span>
                  <h3 className="font-bold text-black mt-4">Despacho y Delivery</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Coordinamos la entrega de tus pedidos a obra, casa o taller.</p>
                </div>

                <div className="p-6 bg-[#f7f9fb] border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-[#fea619]/15 text-[#855300] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </span>
                  <h3 className="font-bold text-black mt-4">Garantía CMA</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Respaldo y reposición por defectos de fábrica en productos certificados.</p>
                </div>

                <div className="p-6 bg-[#f7f9fb] border border-slate-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-[#fea619]/15 text-[#855300] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-2xl">handyman</span>
                  </span>
                  <h3 className="font-bold text-black mt-4">Asesoría Técnica</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Te orientamos a elegir la herramienta o material correcto para cada trabajo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <StoreFooter />
    </div>
  );
}
