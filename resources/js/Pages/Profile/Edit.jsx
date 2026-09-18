import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { FaUser, FaLock, FaCamera, FaShieldAlt } from 'react-icons/fa';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const TABS = [
    {
        key: 'profile',
        icon: FaUser,
        label: 'Perfil',
    },
    {
        key: 'security',
        icon: FaShieldAlt,
        label: 'Seguridad',
    },
];

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <AuthenticatedLayout>
            <Head title="Mi Perfil" />

            <div className="w-full">
                {/* ── Banner de perfil ─────────────────────────────────── */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl overflow-hidden mb-6 shadow-lg">
                    {/* Decoración de fondo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-white" />
                        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white" />
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 px-8 py-8">
                        {/* Avatar con iniciales */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-xl">
                                <span className="text-3xl font-black text-white tracking-tight">
                                    {getInitials(user.name)}
                                </span>
                            </div>
                        </div>

                        {/* Info del usuario */}
                        <div className="text-center sm:text-left flex-1 pb-1">
                            <h1 className="text-2xl font-bold text-white leading-tight">{user.name}</h1>
                            <p className="text-indigo-200 text-sm mt-1">{user.email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white border border-white/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                    {user.role || 'Usuario activo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Layout dos columnas: Tabs izq + Contenido der ────── */}
                <div className="flex gap-6 items-start">

                    {/* Columna Tabs (sidebar vertical) */}
                    <div className="w-52 shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-3 py-3 space-y-1">
                                {TABS.map(({ key, icon: Icon, label }) => {
                                    const isActive = activeTab === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setActiveTab(key)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                isActive ? 'bg-indigo-100' : 'bg-slate-100'
                                            }`}>
                                                <Icon size={13} className={
                                                    isActive ? 'text-indigo-600' : 'text-slate-500'
                                                } />
                                            </div>
                                            <span>{label}</span>
                                            {isActive && (
                                                <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Columna Contenido principal */}
                    <div className="flex-1 min-w-0">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                                    <div className="p-2 rounded-lg bg-indigo-100">
                                        <FaUser size={14} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Información del Perfil</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">Nombre y correo electrónico de tu cuenta</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                                    <div className="p-2 rounded-lg bg-slate-100">
                                        <FaShieldAlt size={14} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Seguridad</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">Cambia tu contraseña de acceso</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdatePasswordForm />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
