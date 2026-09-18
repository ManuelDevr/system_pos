import { Link } from '@inertiajs/react';

export default function StoreFooter() {
  return (
    <footer className="bg-black text-white py-12 border-t border-slate-800">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <span className="font-black text-lg text-white uppercase tracking-wider block mb-3">CMA Store</span>
          <p className="text-slate-400 text-xs leading-relaxed">Hardware de precisión e instalación técnica garantizada para ferretería y contratistas.</p>
        </div>
        <div>
          <h5 className="font-bold uppercase text-xs text-[#fea619] mb-3">Navegación</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href={route('store.index')} className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link href={route('store.catalog')} className="hover:text-white transition-colors">Catálogo de Productos</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold uppercase text-xs text-[#fea619] mb-3">Contacto</h5>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-[#25D366] mt-0.5">whatsapp</span>
              <span>
                <span className="text-slate-300 font-bold block">WhatsApp</span>
                941 117 410 &nbsp;|&nbsp; 973 749 506
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-[#fea619] mt-0.5">mail</span>
              <span>
                <span className="text-slate-300 font-bold block">Email</span>
                cma.tiendaoficial@gmail.com
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-[#fea619] mt-0.5">schedule</span>
              <span>
                <span className="text-slate-300 font-bold block">Horario</span>
                Lun a Vie: 9:00 am – 6:00 pm · Sáb: 9:00 am – 2:00 pm
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold uppercase text-xs text-[#fea619] mb-3">Ubicación</h5>
          <p className="text-xs text-slate-400">San Juan de Miraflores Av Salvador Allende 429 - Tienda Principal CMA</p>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-6 pt-8 mt-8 border-t border-white/10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CMA Hardware & Installation Services. Todos los derechos reservados.
      </div>
    </footer>
  );
}