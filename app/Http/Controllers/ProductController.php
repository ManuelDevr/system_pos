<?php

namespace App\Http\Controllers;

use App\Exports\ProductSampleExport;
use App\Imports\ProductsImport;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Unidad;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Producto::with([
                'categoria:id,nombre', 
                'marca:id,nombre',
                'conversiones.unidad:id,nombre,abreviatura'
            ])
            ->orderBy('nombre');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%")
                  ->orWhere('codigo_barras', 'ilike', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('categoria_id', $category);
        }

        return Inertia::render('Products/Index', [
            'productos' => $query->get(),
            'categorias' => Categoria::select('id', 'nombre', 'parent_id')->with('children:id,nombre,parent_id')->whereNull('parent_id')->get(),
            'marcas' => Marca::select('id', 'nombre')->get(),
            'unidades' => Unidad::select('id', 'nombre', 'abreviatura')->get(),
        ]);
    }

    public function store(StoreProductRequest $request, SupabaseStorageService $supabase)
    {
        $data = $request->validated();

        $imagenes = array_values(array_filter((array) $request->input('imagenes_keep', [])));

        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $file) {
                if (count($imagenes) >= 6) {
                    break;
                }
                $imagenes[] = $supabase->upload($file);
            }
        } elseif ($request->hasFile('imagen')) {
            $imagenes[] = $supabase->upload($request->file('imagen'));
        }

        $data['imagenes'] = array_values(array_slice($imagenes, 0, 6));
        $data['imagen_url'] = $data['imagenes'][0] ?? null;

        Producto::create($data);

        return redirect()->back()->with('success', 'Producto creado correctamente.');
    }

    public function update(UpdateProductRequest $request, Producto $producto, SupabaseStorageService $supabase)
    {
        $data = $request->validated();

        $imagenes = array_values(array_filter((array) $request->input('imagenes_keep', [])));

        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $file) {
                if (count($imagenes) >= 6) {
                    break;
                }
                $imagenes[] = $supabase->upload($file);
            }
        }

        $imageChanged = $request->hasFile('imagenes') || $imagenes !== array_values((array) ($producto->imagenes ?? []));
        if ($imageChanged) {
            $previous = $producto->imagenes ?? ($producto->imagen_url ? [$producto->imagen_url] : []);
            $removed = array_diff($previous, $imagenes);
            foreach ($removed as $url) {
                $supabase->delete($url);
            }
        }

        $data['imagenes'] = array_values(array_slice($imagenes, 0, 6));
        $data['imagen_url'] = $data['imagenes'][0] ?? null;

        $producto->update($data);

        return redirect()->back()->with('success', 'Producto actualizado.');
    }

    public function destroyImage(Producto $producto, SupabaseStorageService $supabase)
    {
        if ($producto->imagen_url) {
            $supabase->delete($producto->imagen_url);

            $imagenes = array_values(array_filter(
                (array) ($producto->imagenes ?? []),
                fn ($url) => $url !== $producto->imagen_url
            ));

            $producto->update([
                'imagen_url' => $imagenes[0] ?? null,
                'imagenes' => $imagenes,
            ]);
        }

        return redirect()->back()->with('success', 'Imagen eliminada correctamente.');
    }

    public function toggleStatus(Producto $producto)
    {
        $producto->estado = $producto->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $producto->save();

        return redirect()->back()->with('success', 'Estado del producto actualizado.');
    }

    public function storeConversion(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'unidad_id' => [
                'required',
                'exists:unidades,id',
                \Illuminate\Validation\Rule::unique('conversiones_unidad_producto')->where(function ($query) use ($producto) {
                    return $query->where('producto_id', $producto->id);
                })
            ],
            'cantidad' => 'required|integer|min:1',
            'factor' => 'required|numeric|min:0.0001',
            'codigo_barras' => 'nullable|string|max:50|unique:conversiones_unidad_producto,codigo_barras',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'tasa_descuento' => 'nullable|numeric|min:0|max:99.99',
        ], [
            'unidad_id.unique' => 'Este producto ya tiene registrada una conversión para esta unidad de medida.',
        ]);

        $producto->conversiones()->create($validated);

        return redirect()->back()->with('success', 'Conversión añadida correctamente.');
    }

    public function updateConversion(Request $request, \App\Models\ConversionUnidadProducto $conversion)
    {
        $validated = $request->validate([
            'unidad_id' => [
                'required',
                'exists:unidades,id',
                \Illuminate\Validation\Rule::unique('conversiones_unidad_producto')->where(function ($query) use ($conversion) {
                    return $query->where('producto_id', $conversion->producto_id);
                })->ignore($conversion->id)
            ],
            'cantidad' => 'required|integer|min:1',
            'factor' => 'required|numeric|min:0.0001',
            'codigo_barras' => 'nullable|string|max:50|unique:conversiones_unidad_producto,codigo_barras,' . $conversion->id,
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'tasa_descuento' => 'nullable|numeric|min:0|max:99.99',
        ]);

        $conversion->update($validated);

        return redirect()->back()->with('success', 'Conversión actualizada correctamente.');
    }

    public function toggleStatusConversion(\App\Models\ConversionUnidadProducto $conversion)
    {
        $conversion->estado = $conversion->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $conversion->save();

        return redirect()->back()->with('success', 'Estado de la conversión actualizado.');
    }

    public function destroyConversion(\App\Models\ConversionUnidadProducto $conversion)
    {
        $conversion->delete();
        return redirect()->back()->with('success', 'Conversión eliminada.');
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $import = new ProductsImport();

        try {
            Excel::import($import, $request->file('file'));
        } catch (\Exception $e) {
            \Log::error('Error al importar Excel: ' . $e->getMessage(), [
                'file' => $request->file('file')->getClientOriginalName(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Error al procesar el archivo: ' . $e->getMessage());
        }

        $errors = $import->getErrors();

        if (empty($errors)) {
            return redirect()->back()->with('success', 'Productos importados correctamente.');
        }

        $message = 'Importación completada con algunos errores:';
        foreach ($errors as $error) {
            $message .= ' | ' . $error;
        }

        return redirect()->back()->with('warning', $message);
    }

    public function downloadSampleExcel()
    {
        return Excel::download(new ProductSampleExport, 'plantilla_productos.xlsx');
    }
}
