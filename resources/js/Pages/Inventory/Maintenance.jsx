import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Layers, Bookmark, Ruler, Settings2 } from 'lucide-react';
import CategoryManager from '@/Components/Inventory/CategoryManager';
import BrandManager from '@/Components/Inventory/BrandManager';
import UnitManager from '@/Components/Inventory/UnitManager';

export default function Maintenance() {
    const { categorias, marcas, unidades } = usePage().props;
    const [activeTab, setActiveTab] = useState('categories');

    const tabs = [
        { id: 'categories', label: 'Categorías', icon: Layers },
        { id: 'brands', label: 'Marcas', icon: Bookmark },
        { id: 'units', label: 'Unidades', icon: Ruler },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Mantenimiento de Inventario" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600 bg-white'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                        {activeTab === 'categories' && (
                            <div className="animate-in fade-in duration-300">
                                <CategoryManager categories={categorias} onClose={() => {}} />
                            </div>
                        )}
                        {activeTab === 'brands' && (
                            <div className="animate-in fade-in duration-300">
                                <BrandManager brands={marcas} onClose={() => {}} />
                            </div>
                        )}
                        {activeTab === 'units' && (
                            <div className="animate-in fade-in duration-300">
                                <UnitManager units={unidades} onClose={() => {}} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
