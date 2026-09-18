import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import UnitManager from '@/Components/Inventory/UnitManager';

export default function Index() {
  const { unidades } = usePage().props;

  return (
    <AuthenticatedLayout>
      <Head title="Unidades de Medida" />
      <UnitManager units={unidades} />
    </AuthenticatedLayout>
  );
}
