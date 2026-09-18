import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Placeholder({ title }) {
    return (
        <AuthenticatedLayout>
            <Head title={title} />
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                <p className="text-slate-500 text-center">
                    Esta página está en proceso de migración.<br />
                    Pronto tendrás aquí todas las funcionalidades de tu sistema original.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
