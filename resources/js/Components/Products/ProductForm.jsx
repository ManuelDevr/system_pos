import React, { useState, useEffect } from 'react';
import {
  Archive, Diamond, Package, Tag as TagIcon, AlertTriangle, ShoppingCart,
  FileText, DollarSign, Percent, Ruler, Building, Plus, Edit, Save, TrendingUp, RotateCcw, ScanLine, Image as ImageIcon, Trash2, Upload, Link2 as LinkIcon, X, FolderTree
} from 'lucide-react';
import { useForm, usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import CommonModal from '@/Components/CommonModal';
import UnitManager from '@/Components/Inventory/UnitManager';

const CategoryQuickCreate = ({ onClose, categorias }) => {
  const { data, setData, post, processing, errors } = useForm({ nombre: '', parent_id: '', descripcion: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('categorias.store'), {
      onSuccess: () => { toast.success('Categoría creada'); onClose(); },
      onError: (errs) => toast.error(Object.values(errs)[0] || 'Error al crear'),
    });
  };
  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Nombre" name="cat-nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} icon={TagIcon} placeholder="Nombre de la categoría" error={errors.nombre} required />
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Categoría Padre</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FolderTree className="w-4 h-4 text-slate-400" /></span>
            <select value={data.parent_id} onChange={e => setData('parent_id', e.target.value)} className="w-full pl-10 pr-3 py-2 bg-slate-50 text-sm text-slate-800 border border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg appearance-none">
              <option value="">Ninguna (categoría principal)</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
          <textarea value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} className="w-full pl-3 pr-3 py-2 bg-slate-50 text-sm text-slate-800 border border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg resize-none" rows="2" placeholder="Opcional" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-10 px-4 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={processing} className="h-10 px-6 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"><Save size={15} /> Crear</button>
        </div>
      </form>
    </div>
  );
};

const BrandQuickForm = ({ onClose, marcaToEdit }) => {
  const isEdit = !!marcaToEdit;
  const { data, setData, post, put, processing, errors } = useForm({
    nombre: marcaToEdit?.nombre || '',
    estado: marcaToEdit?.estado || 'Activo',
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const opts = {
      onSuccess: () => { toast.success(isEdit ? 'Marca actualizada' : 'Marca creada'); onClose(); },
      onError: (errs) => toast.error(Object.values(errs)[0] || 'Error al guardar'),
    };
    if (isEdit) put(route('marcas.update', marcaToEdit.id), opts);
    else post(route('marcas.store'), opts);
  };
  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Nombre" name="brand-nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} icon={Building} placeholder="Nombre de la marca" error={errors.nombre} required />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-10 px-4 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={processing} className="h-10 px-6 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"><Save size={15} /> {isEdit ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </div>
  );
};

const FormSection = ({ title, icon: Icon, children, gridCols = 'sm:grid-cols-2' }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6">
      <Icon className="w-5 h-5 text-indigo-500" />
      <span>{title}</span>
    </h3>
    <div className={`grid grid-cols-1 ${gridCols} gap-x-6 gap-y-4`}>
      {children}
    </div>
  </div>
);

const FormInput = ({ label, id, icon: Icon, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="w-4 h-4 text-slate-400" />
      </span>
      <input
        id={id}
        {...props}
        className={`w-full pl-10 pr-3 py-2 text-sm text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg bg-slate-50 ${error ? 'border-red-500' : ''}`}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const FormDisplay = ({ label, value, icon: Icon, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="w-4 h-4 text-slate-400" />
        </span>
      )}
      <div className={`w-full h-[38px] flex items-center ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-slate-100 text-sm text-slate-900 border border-slate-200 rounded-lg font-bold`}>
        {value}
      </div>
    </div>
  </div>
);

const FormSelectWithButtons = ({ label, id, icon: Icon, children, onCreate, onEdit, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative flex-grow">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="w-4 h-4 text-slate-400" />
        </span>
        <select id={id} {...props} className={`w-full pl-10 pr-8 py-2 bg-slate-50 text-sm text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg appearance-none ${error ? 'border-red-500' : ''}`}>
          {children}
        </select>
      </div>
      <button type="button" onClick={onCreate} title="Crear nuevo" className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-sm"><Plus size={16} /></button>
      {onEdit && (
        <button type="button" onClick={onEdit} title="Gestionar" className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"><Edit size={16} /></button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const ProductForm = ({ productToEdit, onClose }) => {
  const { categorias, marcas, unidades, productos: allProducts = [] } = usePage().props;
  const isEdit = !!productToEdit;

  const { data, setData, processing, errors, reset, clearErrors } = useForm({
    nombre: '',
    descripcion: '',
    sku: '',
    codigo_barras: '',
    stock: 0,
    stock_minimo: 0,
    precio_compra: '',
    margen_ganancia: '',
    precio_venta: '',
    tasa_descuento: 0,
    unidad_medida: 'Unidad',
    categoria_id: '',
    marca_id: '',
    estado: 'Activo',
    video_url: '',
    mostrar_video: false,
  });

  const [existingImagenes, setExistingImagenes] = useState(() => {
    const imgs = productToEdit?.imagenes?.length
      ? productToEdit.imagenes
      : (productToEdit?.imagen_url ? [productToEdit.imagen_url] : []);
    return imgs;
  });
  const [nuevasImagenes, setNuevasImagenes] = useState([]);

  const resolveImg = (url) => {
    if (!url) return url;
    return url.startsWith('http://') || url.startsWith('https://') ? url : `/storage/${url}`;
  };

  const allImagenes = [
    ...existingImagenes.map((url) => ({ src: resolveImg(url), key: `existing-${url}` })),
    ...nuevasImagenes.map(({ file, preview }) => ({ src: preview, key: `new-${preview}` })),
  ];

  const preventNegative = (e) => {
    if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
  };

  // Sincronizar datos cuando el componente se monta o cambia el producto
  useEffect(() => {
    if (isEdit && productToEdit) {
        setData({
            nombre: productToEdit.nombre || '',
            descripcion: productToEdit.descripcion || '',
            sku: productToEdit.sku || '',
            codigo_barras: productToEdit.codigo_barras || '',
            stock: productToEdit.stock !== undefined && productToEdit.stock !== null ? parseInt(productToEdit.stock, 10) : 0,
            stock_minimo: productToEdit.stock_minimo !== undefined && productToEdit.stock_minimo !== null ? parseInt(productToEdit.stock_minimo, 10) : 0,
            precio_compra: productToEdit.precio_compra !== undefined ? productToEdit.precio_compra : '',
            margen_ganancia: productToEdit.margen_ganancia !== undefined ? productToEdit.margen_ganancia : '',
            precio_venta: productToEdit.precio_venta !== undefined ? productToEdit.precio_venta : '',
            tasa_descuento: productToEdit.tasa_descuento || 0,
            unidad_medida: productToEdit.unidad_medida || 'Unidad',
            categoria_id: productToEdit.categoria_id || '',
            marca_id: productToEdit.marca_id || '',
            estado: productToEdit.estado || 'Activo',
            video_url: productToEdit.video_url || '',
            mostrar_video: !!productToEdit.video_url && productToEdit.mostrar_video !== false,
        });
        setExistingImagenes(
          productToEdit.imagenes?.length
            ? [...productToEdit.imagenes]
            : (productToEdit.imagen_url ? [productToEdit.imagen_url] : [])
        );
        setNuevasImagenes([]);
    } else if (!isEdit) {
        reset();
        setExistingImagenes([]);
        setNuevasImagenes([]);
    }
    clearErrors();
  }, [productToEdit, isEdit]);

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isBrandOpen, setBrandOpen] = useState(false);
  const [isUnitOpen, setUnitOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Recalcular precio de venta
  useEffect(() => {
    const costo = parseFloat(data.precio_compra) || 0;
    const utilidad = parseFloat(data.margen_ganancia) || 0;
    const descuento = parseFloat(data.tasa_descuento) || 0;
    const precioBruto = costo + utilidad;
    const precioFinal = precioBruto * (1 - descuento / 100);
    setData('precio_venta', precioFinal > 0 ? precioFinal.toFixed(2) : '0.00');
  }, [data.precio_compra, data.margen_ganancia, data.tasa_descuento]);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const allowed = Math.max(0, 6 - existingImagenes.length - nuevasImagenes.length);
    files.slice(0, allowed).forEach((file) => {
      setNuevasImagenes((prev) => [...prev, { file, preview: URL.createObjectURL(file) }]);
    });
    e.target.value = '';
  };

  const handleImageRemove = (index) => {
    if (index < existingImagenes.length) {
      setExistingImagenes((prev) => prev.filter((_, i) => i !== index));
    } else {
      const i = index - existingImagenes.length;
      setNuevasImagenes((prev) => {
        const removed = prev[i];
        if (removed) URL.revokeObjectURL(removed.preview);
        return prev.filter((_, idx) => idx !== i);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const options = {
        onSuccess: () => {
            toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
            if (onClose) onClose();
            else reset();
        },
        onError: (errs) => {
            const firstError = Object.values(errs)[0];
            toast.error(firstError || 'Error al guardar el producto');
        }
    };

    const fd = new FormData();
    fd.append('_method', isEdit ? 'PUT' : 'POST');
    nuevasImagenes.forEach(({ file }) => fd.append('imagenes[]', file));
    existingImagenes.forEach((url) => fd.append('imagenes_keep[]', url));
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        fd.append(key, value);
      }
    });

    router.post(isEdit
      ? route('productos.update', productToEdit.id)
      : route('productos.store'), fd, options
    );
  };

  const gananciaNeta = (parseFloat(data.precio_venta) || 0) - (parseFloat(data.precio_compra) || 0);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Información General" icon={Package}>
              <FormInput 
                label="Nombre del Producto" 
                name="nombre" 
                value={data.nombre} 
                onChange={e => setData('nombre', e.target.value)} 
                icon={TagIcon} 
                className="sm:col-span-2" 
                placeholder="Ej: Martillo de 16oz"
                error={errors.nombre}
                required 
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                <div className="relative">
                    <span className="absolute top-3 left-0 flex items-center pl-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                    </span>
                    <textarea 
                        value={data.descripcion} 
                        onChange={e => setData('descripcion', e.target.value)} 
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 text-sm text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg"
                        rows="3"
                        placeholder="Detalles técnicos, dimensiones, etc."
                    />
                </div>
              </div>
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="SKU / Código" name="sku" value={data.sku} onChange={e => setData('sku', e.target.value)} icon={Archive} placeholder="Ej: HER-001" error={errors.sku} />
                <div>
                  <label htmlFor="codigo_barras" className="block text-sm font-medium text-slate-600 mb-1">Código de Barras</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <ScanLine className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        id="codigo_barras"
                        name="codigo_barras"
                        value={data.codigo_barras}
                        onChange={e => setData('codigo_barras', e.target.value)}
                        placeholder="Escanee o ingrese EAN-13"
                        className={`w-full pl-10 pr-3 py-2 text-sm text-slate-800 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg bg-slate-50 ${errors.codigo_barras ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        let isUnique = false;
                        let generatedCode = '';
                        let attempts = 0;
                        while (!isUnique && attempts < 100) {
                          attempts++;
                          // Generar código numérico aleatorio de 12 dígitos (estilo EAN-12/13)
                          generatedCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                          const existsInProducts = allProducts.some(p => p.codigo_barras === generatedCode || (p.conversiones && p.conversiones.some(c => c.codigo_barras === generatedCode)));
                          if (!existsInProducts) {
                            isUnique = true;
                          }
                        }
                        setData('codigo_barras', generatedCode);
                        toast.success('Código numérico generado correctamente');
                      }}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all font-bold text-xs flex items-center gap-2 border border-indigo-100 whitespace-nowrap"
                      title="Generar código de barras numérico único"
                    >
                      <Plus size={14} />
                      Generar
                    </button>
                  </div>
                  {errors.codigo_barras && <p className="text-xs text-red-500 mt-1">{errors.codigo_barras}</p>}
                </div>
              </div>
              <FormSelectWithButtons 
                label="Unidad Base" 
                icon={Ruler}
                value={data.unidad_medida}
                onChange={e => setData('unidad_medida', e.target.value)}
                onCreate={() => setUnitOpen(true)}
                onEdit={() => setUnitOpen(true)}
                error={errors.unidad_medida}
              >
                {unidades.map(u => <option key={u.id} value={u.nombre}>{u.nombre} ({u.abreviatura})</option>)}
              </FormSelectWithButtons>
            </FormSection>

            <FormSection title="Precios e Inventario" icon={DollarSign}>
              <FormInput label="Precio Compra (Costo)" type="number" step="0.01" min="0" value={data.precio_compra} onChange={e => setData('precio_compra', e.target.value)} onKeyDown={preventNegative} icon={DollarSign} error={errors.precio_compra} />
              <FormInput label="Margen Ganancia (S/)" type="number" step="0.01" min="0" value={data.margen_ganancia} onChange={e => setData('margen_ganancia', e.target.value)} onKeyDown={preventNegative} icon={TrendingUp} error={errors.margen_ganancia} />
              <FormInput label="Descuento (%)" type="number" step="0.01" min="0" max="100" value={data.tasa_descuento} onChange={e => setData('tasa_descuento', e.target.value)} onKeyDown={preventNegative} icon={Percent} error={errors.tasa_descuento} />
              <FormDisplay label="Ganancia Neta" value={`S/ ${gananciaNeta.toFixed(2)}`} icon={TrendingUp} />
              <FormDisplay label="Precio de Venta Final" value={`S/ ${data.precio_venta}`} className="sm:col-span-2 text-indigo-600" />
              
              <FormInput label="Stock Actual" type="number" step="1" min="0" value={data.stock} onChange={e => setData('stock', e.target.value ? parseInt(e.target.value, 10) : '')} onKeyDown={preventNegative} icon={ShoppingCart} error={errors.stock} required />
              <FormInput label="Stock Mínimo (Alerta)" type="number" step="1" min="0" value={data.stock_minimo} onChange={e => setData('stock_minimo', e.target.value ? parseInt(e.target.value, 10) : '')} onKeyDown={preventNegative} icon={AlertTriangle} error={errors.stock_minimo} />
            </FormSection>
          </div>

          <div className="space-y-6">
            <FormSection title="Clasificación" icon={Diamond} gridCols="grid-cols-1">
              <FormSelectWithButtons 
                label="Categoría" 
                icon={TagIcon}
                value={data.categoria_id}
                onChange={e => setData('categoria_id', e.target.value)}
                onCreate={() => setCategoryOpen(true)}
                error={errors.categoria_id}
              >
                <option value="">Seleccione categoría</option>
                {categorias.map(cat => (
                  <React.Fragment key={cat.id}>
                    <option value={cat.id} className="font-bold">{cat.nombre}</option>
                    {cat.children.map(sub => <option key={sub.id} value={sub.id}>   {sub.nombre}</option>)}
                  </React.Fragment>
                ))}
              </FormSelectWithButtons>

              <FormSelectWithButtons 
                label="Marca" 
                icon={Building}
                value={data.marca_id}
                onChange={e => setData('marca_id', e.target.value)}
                onCreate={() => { setEditingBrand(null); setBrandOpen(true); }}
                onEdit={() => {
                  const selected = marcas.find(m => m.id == data.marca_id);
                  if (selected) { setEditingBrand(selected); setBrandOpen(true); }
                  else toast.error('Selecciona una marca primero');
                }}
                error={errors.marca_id}
              >
                <option value="">Seleccione marca</option>
                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </FormSelectWithButtons>
            </FormSection>

            <FormSection title="Imágenes y Video" icon={ImageIcon} gridCols="grid-cols-1">
              <div>
                <p className="text-xs text-slate-500 mb-3">Puedes subir hasta 6 imágenes. La primera será la imagen principal del producto.</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {allImagenes.map((img, idx) => (
                    <div key={img.key} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                      <img src={img.src} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Principal</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleImageRemove(idx)}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow hover:bg-rose-50 text-rose-500 transition-colors"
                        title="Quitar imagen"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {allImagenes.length < 6 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group">
                      <Upload size={22} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">Añadir</span>
                      <span className="text-[9px] text-slate-300">{allImagenes.length}/6</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">PNG, JPG, WEBP · Máx 2MB por imagen</p>
                {(errors.imagenes || errors['imagenes.0']) && (
                  <p className="text-xs text-red-500 mt-1">{errors.imagenes || errors['imagenes.0']}</p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-700">Mostrar video en el detalle del producto</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Activa la casilla para poder ingresar el link del video.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setData('mostrar_video', !data.mostrar_video)}
                  className={`relative h-[26px] w-[52px] rounded-full transition-colors flex-shrink-0 ${
                    data.mostrar_video ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  title={data.mostrar_video ? 'Desactivar' : 'Activar'}
                >
                  <span
                    className={`absolute top-[3px] size-[20px] rounded-full bg-white shadow transition-all ${
                      data.mostrar_video ? 'left-[28px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              <FormInput
                label="Link del Video (YouTube)"
                name="video_url"
                value={data.video_url}
                onChange={e => setData('video_url', e.target.value)}
                icon={LinkIcon}
                placeholder="https://www.youtube.com/watch?v=XXXX o el ID del video"
                error={errors.video_url}
                disabled={!data.mostrar_video}
              />
            </FormSection>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { reset(); clearErrors(); setExistingImagenes([]); setNuevasImagenes([]); }} className="h-11 px-6 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RotateCcw size={18} /> Limpiar
            </button>
            <button type="submit" disabled={processing} className="h-11 px-8 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50">
              <Save size={18} /> {isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
        </div>
      </form>

      {/* Modales Auxiliares */}
      <CommonModal isOpen={isCategoryOpen} onClose={() => setCategoryOpen(false)} title="Nueva Categoría" maxWidth="md">
        <CategoryQuickCreate onClose={() => setCategoryOpen(false)} categorias={categorias} />
      </CommonModal>
      <CommonModal isOpen={isBrandOpen} onClose={() => { setBrandOpen(false); setEditingBrand(null); }} title={editingBrand ? 'Editar Marca' : 'Nueva Marca'} maxWidth="md">
        <BrandQuickForm onClose={() => { setBrandOpen(false); setEditingBrand(null); }} marcaToEdit={editingBrand} />
      </CommonModal>
      <CommonModal isOpen={isUnitOpen} onClose={() => setUnitOpen(false)} title="Unidades de Medida">
        <UnitManager units={unidades} onClose={() => setUnitOpen(false)} />
      </CommonModal>
    </>
  );
};

export default ProductForm;
