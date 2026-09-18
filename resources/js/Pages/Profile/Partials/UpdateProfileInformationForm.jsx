import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateName = (value) => {
        if (!value.trim()) {
            setNameError('El nombre es obligatorio.');
            return false;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
            setNameError('El nombre solo puede contener letras y espacios.');
            return false;
        }
        if (value.trim().length < 2) {
            setNameError('El nombre debe tener al menos 2 caracteres.');
            return false;
        }
        setNameError('');
        return true;
    };

    const validateEmail = (value) => {
        if (!value.trim()) {
            setEmailError('El correo electrónico es obligatorio.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('El correo debe tener un formato válido (ej: usuario@dominio.com).');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setData('name', value);
        validateName(value);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setData('email', value);
        validateEmail(value);
    };

    const submit = (e) => {
        e.preventDefault();
        const nameOk = validateName(data.name);
        const emailOk = validateEmail(data.email);
        if (!nameOk || !emailOk) return;
        patch(route('profile.update'));
    };

    const nameIsValid = data.name && !nameError && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(data.name) && data.name.trim().length >= 2;
    const emailIsValid = data.email && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

    return (
        <section className={className}>
            <header className="mb-6">
                <p className="text-sm text-slate-500 mt-1">
                    Actualiza el nombre y correo electrónico asociados a tu cuenta.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                {/* Campo Nombre */}
                <div>
                    <InputLabel htmlFor="name" value="Nombre completo" className="text-slate-700 font-semibold text-sm mb-1" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                            <FaUser size={14} />
                        </span>
                        <TextInput
                            id="name"
                            className={`mt-1 block w-full pl-9 pr-9 rounded-lg border transition-colors duration-200 ${
                                nameError
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300 bg-red-50'
                                    : nameIsValid
                                    ? 'border-green-400 focus:border-green-400 focus:ring-green-300 bg-green-50'
                                    : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-200'
                            }`}
                            value={data.name}
                            onChange={handleNameChange}
                            required
                            isFocused
                            autoComplete="name"
                            placeholder="Ej: Juan Pérez"
                        />
                        {data.name && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {nameIsValid
                                    ? <FaCheckCircle className="text-green-500" size={14} />
                                    : <FaTimesCircle className="text-red-400" size={14} />
                                }
                            </span>
                        )}
                    </div>
                    {nameError && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <FaTimesCircle size={11} /> {nameError}
                        </p>
                    )}
                    {nameIsValid && (
                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle size={11} /> Nombre válido
                        </p>
                    )}
                    <InputError className="mt-1" message={errors.name} />
                </div>

                {/* Campo Email */}
                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" className="text-slate-700 font-semibold text-sm mb-1" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                            <FaEnvelope size={14} />
                        </span>
                        <TextInput
                            id="email"
                            type="email"
                            className={`mt-1 block w-full pl-9 pr-9 rounded-lg border transition-colors duration-200 ${
                                emailError
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300 bg-red-50'
                                    : emailIsValid
                                    ? 'border-green-400 focus:border-green-400 focus:ring-green-300 bg-green-50'
                                    : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-200'
                            }`}
                            value={data.email}
                            onChange={handleEmailChange}
                            required
                            autoComplete="username"
                            placeholder="usuario@ejemplo.com"
                        />
                        {data.email && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {emailIsValid
                                    ? <FaCheckCircle className="text-green-500" size={14} />
                                    : <FaTimesCircle className="text-red-400" size={14} />
                                }
                            </span>
                        )}
                    </div>
                    {emailError && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <FaTimesCircle size={11} /> {emailError}
                        </p>
                    )}
                    {emailIsValid && (
                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle size={11} /> Correo válido
                        </p>
                    )}
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                        <p className="text-sm text-amber-800">
                            Tu correo electrónico no está verificado.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-medium underline text-amber-700 hover:text-amber-900 transition-colors"
                            >
                                Reenviar verificación
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-700">
                                ✓ Se envió un nuevo enlace de verificación a tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <PrimaryButton
                        disabled={processing || !!nameError || !!emailError}
                        className="px-6 py-2.5 text-sm font-semibold"
                    >
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-200"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                            <FaCheckCircle size={14} /> Cambios guardados correctamente
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
