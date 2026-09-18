import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import BrandManager from '@/Components/Inventory/BrandManager';

export default function Index() {
  const { marcas } = usePage().props;

  return (
    <AuthenticatedLayout>
      <Head title="Marcas" />
      <BrandManager brands={marcas} />
    </AuthenticatedLayout>
  );
}
