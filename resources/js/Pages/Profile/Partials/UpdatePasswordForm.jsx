import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';

function PasswordStrengthBar({ password }) {
    const getStrength = (pwd) => {
        let score = 0;
        if (!pwd) return { score: 0, label: '', color: '' };
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { score: 1, label: 'Débil', color: 'bg-red-500' };
        if (score === 2) return { score: 2, label: 'Regular', color: 'bg-amber-400' };
        if (score === 3) return { score: 3, label: 'Buena', color: 'bg-blue-400' };
        return { score: 4, label: 'Fuerte', color: 'bg-green-500' };
    };

    const { score, label, color } = getStrength(password);
    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= score ? color : 'bg-slate-200'
                        }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${
                score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : score === 3 ? 'text-blue-500' : 'text-green-600'
            }`}>
                Seguridad: {label}
            </p>
        </div>
    );
}

function PasswordInput({ id, label, value, onChange, error, refProp, autoComplete, placeholder }) {
    const [show, setShow] = useState(false);

    return (
        <div>
            <InputLabel htmlFor={id} value={label} className="text-slate-700 font-semibold text-sm mb-1" />
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <FaLock size={13} />
                </span>
                <TextInput
                    id={id}
                    ref={refProp}
                    value={value}
                    onChange={onChange}
                    type={show ? 'text' : 'password'}
                    className="mt-1 block w-full pl-9 pr-10 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 transition-colors duration-200"
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
            </div>
            <InputError message={error} className="mt-1.5" />
        </div>
    );
}

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const validateNewPassword = (value) => {
        if (!value) { setPasswordError('La nueva contraseña es obligatoria.'); return false; }
        if (value.length < 8) { setPasswordError('Debe tener al menos 8 caracteres.'); return false; }
        setPasswordError('');
        return true;
    };

    const validateConfirm = (value, pwd) => {
        if (!value) { setConfirmError('Confirma tu nueva contraseña.'); return false; }
        if (value !== pwd) { setConfirmError('Las contraseñas no coinciden.'); return false; }
        setConfirmError('');
        return true;
    };

    const updatePassword = (e) => {
        e.preventDefault();
        const pwdOk = validateNewPassword(data.password);
        const confOk = validateConfirm(data.password_confirmation, data.password);
        if (!pwdOk || !confOk) return;

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const confirmMatches = data.password_confirmation && data.password === data.password_confirmation;

    return (
        <section className={className}>
            <header className="mb-6">
                <p className="text-sm text-slate-500 mt-1">
                    Usa una contraseña larga y segura para proteger tu cuenta.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-5">
                {/* Contraseña actual */}
                <PasswordInput
                    id="current_password"
                    label="Contraseña actual"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                    refProp={currentPasswordInput}
                    autoComplete="current-password"
                    placeholder="Tu contraseña actual"
                />

                {/* Nueva contraseña */}
                <div>
                    <InputLabel htmlFor="password" value="Nueva contraseña" className="text-slate-700 font-semibold text-sm mb-1" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                            <FaShieldAlt size={13} />
                        </span>
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => {
                                setData('password', e.target.value);
                                validateNewPassword(e.target.value);
                                if (data.password_confirmation) validateConfirm(data.password_confirmation, e.target.value);
                            }}
                            type="password"
                            className={`mt-1 block w-full pl-9 rounded-lg border transition-colors duration-200 ${
                                passwordError ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-200'
                            }`}
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>
                    {passwordError && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <FaTimesCircle size={11} /> {passwordError}
                        </p>
                    )}
                    <PasswordStrengthBar password={data.password} />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Confirmar contraseña */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar nueva contraseña" className="text-slate-700 font-semibold text-sm mb-1" />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                            <FaLock size={13} />
                        </span>
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => {
                                setData('password_confirmation', e.target.value);
                                validateConfirm(e.target.value, data.password);
                            }}
                            type="password"
                            className={`mt-1 block w-full pl-9 pr-9 rounded-lg border transition-colors duration-200 ${
                                confirmError
                                    ? 'border-red-400 bg-red-50'
                                    : confirmMatches
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-200'
                            }`}
                            autoComplete="new-password"
                            placeholder="Repite la nueva contraseña"
                        />
                        {data.password_confirmation && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                {confirmMatches
                                    ? <FaCheckCircle className="text-green-500" size={14} />
                                    : <FaTimesCircle className="text-red-400" size={14} />
                                }
                            </span>
                        )}
                    </div>
                    {confirmError && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <FaTimesCircle size={11} /> {confirmError}
                        </p>
                    )}
                    {confirmMatches && (
                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle size={11} /> Las contraseñas coinciden
                        </p>
                    )}
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <PrimaryButton disabled={processing} className="px-6 py-2.5 text-sm font-semibold">
                        {processing ? 'Guardando...' : 'Actualizar contraseña'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-200"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                            <FaCheckCircle size={14} /> Contraseña actualizada
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
