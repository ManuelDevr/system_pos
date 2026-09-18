import React from 'react';
import { Link } from '@inertiajs/react';
import Logo from '../Assets/Logo.jpg';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden font-sans antialiased">
            {/* Left Side: Illustration / Branding */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-indigo-600 relative overflow-hidden items-center justify-center p-12">
                {/* Background Pattern / Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-700 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                        <img src={Logo} alt="Logo" className="h-24 w-auto object-contain" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                        Gestión Inteligente para tu Ferretería
                    </h2>
                    <p className="text-lg text-indigo-100 font-medium leading-relaxed opacity-90">
                        Optimiza tus ventas, controla tu inventario y haz crecer tu negocio con el sistema CMA. 
                        Todo lo que necesitas en un solo lugar.
                    </p>
                    
                    <div className="mt-12 flex justify-center gap-8">
                        <div className="text-center">
                            <p className="text-3xl font-black text-white">+500</p>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mt-1">Productos</p>
                        </div>
                        <div className="w-px h-12 bg-indigo-400 opacity-30"></div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white">100%</p>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mt-1">Seguro</p>
                        </div>
                        <div className="w-px h-12 bg-indigo-400 opacity-30"></div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white">24/7</p>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mt-1">Acceso</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-slate-50 md:bg-white relative">
                <div className="w-full max-w-md">
                    {/* Mobile Logo Only */}
                    <div className="md:hidden flex justify-center mb-10">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                            <img src={Logo} alt="Logo" className="h-16 w-auto" />
                        </div>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Bienvenido de nuevo</h1>
                        <p className="text-slate-500 font-medium">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>

                    <div className="relative">
                        {children}
                    </div>

                    {/* Footer / Legal */}
                    <div className="mt-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Ferretería CMA. Todos los derechos reservados.
                    </div>
                </div>
            </div>
        </div>
    );
}
