import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import CategoryManager from '@/Components/Inventory/CategoryManager';

export default function Index() {
  const { categorias } = usePage().props;

  return (
    <AuthenticatedLayout>
      <Head title="Categorías" />
      <CategoryManager categories={categorias} />
    </AuthenticatedLayout>
  );
}
