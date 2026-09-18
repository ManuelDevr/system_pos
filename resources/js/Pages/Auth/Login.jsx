import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            {status && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 items-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <AlertCircle size={18} />
                    </div>
                    <p className="text-sm font-bold text-emerald-800 uppercase tracking-tighter">{status}</p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-2xl text-slate-800 font-medium transition-all shadow-sm group-hover:bg-slate-100 focus:bg-white"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2 ml-1" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                        {/* {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )} */}
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-2xl text-slate-800 font-medium transition-all shadow-sm group-hover:bg-slate-100 focus:bg-white"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2 ml-1" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                        />
                        <span className="ms-3 text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Recordarme</span>
                    </label>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
