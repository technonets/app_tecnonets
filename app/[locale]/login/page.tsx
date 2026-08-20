'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowLeft,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { verifyCustomerPinAction, requestCustomerOtpAction } from './actions';

type FlowStep = 'password' | 'otp-request' | 'otp' | 'register';

export default function LoginPage() {
  const [step, setStep] = useState<FlowStep>('password');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  // 6-digit OTP boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  // Timer para reenvío de código
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Enfocar primera casilla cuando entra al paso OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // 1. INICIO DE SESIÓN CON EMAIL Y CONTRASEÑA
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Correo o contraseña incorrectos. Si no recuerdas tu clave, solicita un código de acceso por correo.');
        }
        throw error;
      }

      if (!data.user) throw new Error('No se pudo autenticar el usuario.');

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const role = roleData?.role || 'customer';
      setSuccessMsg('Acceso concedido. Redirigiendo...');

      if (role === 'admin' || role === 'staff') {
        router.push('/admin');
      } else if (role === 'partner') {
        router.push('/partner');
      } else {
        router.push('/portal');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SOLICITAR CÓDIGO TEMPORAL (CONTINGENCIA)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email.trim() === '') {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await requestCustomerOtpAction(email.trim());
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setResendCountdown(120);
      setSuccessMsg(`Código de 6 dígitos enviado a ${email}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo generar el código.');
    } finally {
      setLoading(false);
    }
  };

  // 3. MANEJO DE CASILLAS OTP
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpDigits];
      cleanDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtpDigits(newOtp);
      
      const lastIndex = Math.min(cleanDigits.length, 5);
      inputRefs.current[lastIndex]?.focus();

      if (cleanDigits.length === 6) {
        submitOtpCode(cleanDigits.join(''));
      }
      return;
    }

    const singleDigit = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    newOtp[index] = singleDigit;
    setOtpDigits(newOtp);

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (singleDigit && index === 5) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        submitOtpCode(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtpCode = async (code: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await verifyCustomerPinAction(email.trim(), code);
      if (res.success && res.hashedToken) {
        setSuccessMsg('¡Código verificado! Redirigiendo...');
        router.push(`/auth/callback?token_hash=${res.hashedToken}&type=magiclink&next=${res.targetPath}`);
      } else {
        setSuccessMsg('Verificación exitosa.');
        router.push(res.targetPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Código incorrecto o caducado.');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await requestCustomerOtpAction(email.trim());
      setResendCountdown(120);
      setSuccessMsg('Se ha enviado un nuevo código de acceso.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  // 4. REGISTRO DE CUENTA
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            company_name: companyName
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        setSuccessMsg('Cuenta creada exitosamente. Redirigiendo...');
        setTimeout(() => {
          router.push('/portal');
          router.refresh();
        }, 1000);
      } else {
        setSuccessMsg('Registro completado. Por favor revisa tu correo electrónico para confirmar tu cuenta.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Resplandor Ambiental de Fondo (Mesh Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Logo & Marca */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md p-1.5 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Tecnonets Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Tecnonets
            </span>
          </Link>

          {step === 'password' ? (
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Accede a tus herramientas, licencias y academia
              </p>
            </div>
          ) : step === 'otp-request' ? (
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Acceso sin Contraseña
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Recibe un código temporal de acceso en tu correo
              </p>
            </div>
          ) : step === 'otp' ? (
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Verifica tu Identidad
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa el código de 6 dígitos enviado a:
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-full text-xs font-semibold">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{email}</span>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Crear una Cuenta
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Regístrate para gestionar tus herramientas y cursos
              </p>
            </div>
          )}
        </div>

        {/* Tarjeta Principal Dark Glassmorphism */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/50">
          
          {/* Mensajes de Alerta */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-900/70 text-red-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-900/70 text-emerald-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASO 1: LOGIN PRINCIPAL (EMAIL + PASSWORD)               */}
          {/* ======================================================== */}
          {step === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium [color-scheme:dark]"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => { setStep('otp-request'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium [color-scheme:dark]"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Opciones Sutiles de Contingencia y Registro */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-center">
                <div>
                  <button
                    type="button"
                    onClick={() => { setStep('otp-request'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>¿Sin contraseña? <strong>Acceder con código por correo</strong></span>
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setStep('register'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    Regístrate gratis
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* PASO 2: SOLICITAR CÓDIGO TEMPORAL                        */}
          {/* ======================================================== */}
          {step === 'otp-request' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium [color-scheme:dark]"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Te enviaremos un código de seguridad de 6 dígitos válido por 15 minutos.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando código...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Código de Acceso</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={() => { setStep('password'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Iniciar con Contraseña</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* PASO 3: INGRESAR CÓDIGO DE 6 CASILLAS                    */}
          {/* ======================================================== */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div className="flex justify-center items-center gap-2 sm:gap-2.5 my-2">
                {otpDigits.map((digit, index) => (
                  <React.Fragment key={index}>
                    {index === 3 && (
                      <span className="text-slate-600 font-bold text-lg select-none">
                        –
                      </span>
                    )}
                    <input
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasteData = e.clipboardData.getData('text');
                        handleOtpChange(index, pasteData);
                      }}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all outline-none ${
                        digit
                          ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                          : 'border-slate-800 bg-slate-950/90 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                  </React.Fragment>
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-xs text-blue-400 font-semibold py-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando código...</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={resendCountdown > 0 || loading}
                    onClick={handleResendOtp}
                    className={`font-semibold transition-colors flex items-center gap-1.5 ${
                      resendCountdown > 0
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-blue-400 hover:underline'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>
                      {resendCountdown > 0
                        ? `Reenviar en ${Math.floor(resendCountdown / 60)}:${(resendCountdown % 60).toString().padStart(2, '0')}`
                        : '¿No recibiste el código? Reenviar'}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setStep('password'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Volver a Iniciar con Contraseña</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASO 4: FORMULARIO DE REGISTRO                           */}
          {/* ======================================================== */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp / Tel
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300..."
                    className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Empresa <span className="text-slate-500 font-normal">(Opc.)</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mi Empresa S.A.S"
                    className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-3 pr-9 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Crear mi Cuenta</span>}
              </button>

              <div className="pt-2 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setStep('password'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-xs text-blue-400 hover:underline font-semibold"
                >
                  ¿Ya tienes cuenta? Iniciar sesión
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Minimalista y Limpio */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Tecnonets © {new Date().getFullYear()} • Plataforma Segura
          </p>
        </div>

      </div>
    </div>
  );
}
