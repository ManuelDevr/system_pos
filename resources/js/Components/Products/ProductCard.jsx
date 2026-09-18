import React from 'react';
import { Package, ShoppingCart, Eye, Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product, onAdd, onView }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center">
        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <ImageIcon size={64} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
        )}
        
        {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Agotado</span>
            </div>
        )}

        <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button 
                onClick={onView}
                className="p-3 bg-white text-slate-800 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
                title="Ver Detalle"
            >
                <Eye size={20} />
            </button>
            <button 
                onClick={onAdd}
                disabled={isOutOfStock}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                title="Añadir al Carrito"
            >
                <ShoppingCart size={20} />
            </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {product.marca?.nombre || 'General'}
        </p>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight flex-1">
            {product.nombre}
        </h3>
        
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Precio Venta</span>
                <span className="text-xl font-black text-indigo-600">S/ {parseFloat(product.precio_venta).toFixed(2)}</span>
            </div>
            <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock</span>
                <span className={`text-xs font-black ${isOutOfStock ? 'text-rose-500' : 'text-slate-700'}`}>
                    {parseInt(product.stock, 10)} {product.unidad_medida}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}
