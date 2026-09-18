import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import GrupoManager from '@/Components/Personal/GrupoManager';

export default function Grupo() {
  const { grupos } = usePage().props;

  return (
    <AuthenticatedLayout>
      <Head title="Grupo de Personal" />
      <GrupoManager grupos={grupos} />
    </AuthenticatedLayout>
  );
}