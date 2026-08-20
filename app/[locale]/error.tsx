'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Home, AlertOctagon, ChevronDown, ChevronUp, Terminal, ShieldAlert } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Registrar error para monitoreo técnico
    console.error('Next.js Client-Side App Error:', error);
  }, [error]);

  const handleReset = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-radial from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Luces de fondo ambientales */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-center">
          
          {/* Badge & Icono con Brillo */}
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-lg animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg relative border border-red-400/30">
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Interrupción Inesperada</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Algo no salió como esperábamos
            </h1>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Ocurrió un inconveniente temporal al renderizar este recurso. Ya ha sido registrado para resolución.
            </p>
          </div>

          {/* Botones de Acción Estilizados */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleReset}
              disabled={isRetrying}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Reintentando...' : 'Reintentar Operación'}</span>
            </button>

            <Link
              href="/"
              className="px-5 py-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 border border-slate-700/70 hover:border-slate-600 hover:-translate-y-0.5 shadow-md"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Ir al Inicio</span>
            </Link>
          </div>

          {/* Acordeón de Detalles Técnicos para Desarrolladores */}
          <div className="pt-4 border-t border-slate-800/60 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-400 font-medium py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Detalles técnicos del sistema</span>
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1.5 break-all">
                {error.digest && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-slate-400 font-bold">Digest:</span>
                    <span className="text-blue-400">{error.digest}</span>
                  </div>
                )}
                {error.message && (
                  <div>
                    <span className="text-slate-400 font-bold">Mensaje:</span>
                    <p className="text-red-400 mt-0.5">{error.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
