import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
    User,
    UserPlus,
} from 'lucide-react';

const CAMPOS = [
    {
        name: 'name',
        label: 'Nombre Completo',
        type: 'text',
        autoComplete: 'name',
        placeholder: 'Nombre y apellidos',
        icon: User,
    },
    {
        name: 'email',
        label: 'Correo Electrónico',
        type: 'email',
        autoComplete: 'username',
        placeholder: 'nombre@ejemplo.com',
        icon: Mail,
    },
];

export default function Register() {
    const [verPassword, setVerPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Crear Administrador" />

            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                    <ShieldCheck size={18} />
                </div>
                <div>
                    <p className="text-sm font-black text-indigo-800 uppercase tracking-tighter">
                        Primera configuración
                    </p>
                    <p className="mt-1 text-xs font-medium text-indigo-700">
                        Crea la cuenta del administrador. Esta opción solo
                        estará disponible una vez; después el acceso se
                       gestionará desde el sistema.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {CAMPOS.map((campo) => {
                    const Icon = campo.icon;

                    return (
                        <div key={campo.name}>
                            <label
                                htmlFor={campo.name}
                                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                            >
                                {campo.label}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                                    <Icon
                                        size={18}
                                        className="text-slate-400"
                                    />
                                </div>
                                <input
                                    id={campo.name}
                                    type={campo.type}
                                    name={campo.name}
                                    value={data[campo.name]}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-2xl text-slate-800 font-medium transition-all shadow-sm group-hover:bg-slate-100 focus:bg-white"
                                    autoComplete={campo.autoComplete}
                                    placeholder={campo.placeholder}
                                    onChange={(e) =>
                                        setData(
                                            campo.name,
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <InputError
                                message={errors[campo.name]}
                                className="mt-2 ml-1"
                            />
                        </div>
                    );
                })}

                <div>
                    <label
                        htmlFor="password"
                        className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                    >
                        Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="password"
                            type={verPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-2xl text-slate-800 font-medium transition-all shadow-sm group-hover:bg-slate-100 focus:bg-white"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setVerPassword(!verPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {verPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.password}
                        className="mt-2 ml-1"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                    >
                        Repetir Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="password_confirmation"
                            type={verPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-2xl text-slate-800 font-medium transition-all shadow-sm group-hover:bg-slate-100 focus:bg-white"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setVerPassword(!verPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {verPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 ml-1"
                    />
                </div>

                <div className="flex gap-3 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle
                        size={16}
                        className="text-amber-500 shrink-0 mt-0.5"
                    />
                    <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
                        La contraseña debe tener al menos 8 caracteres e
                        incluir mayúscula, minúscula, un número y un símbolo
                        (por ejemplo: Admin2026!).
                    </p>
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
                                <UserPlus size={18} />
                                Crear Administrador
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
