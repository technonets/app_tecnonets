'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Copy, 
  CheckCircle, 
  Link as LinkIcon, 
  CreditCard, 
  LogOut, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Smartphone, 
  Send,
  UserCheck,
  Award
} from 'lucide-react';
import { getPartnerPortalData, updatePartnerPayoutDetails } from './actions';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PartnerPortalPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form de datos de cobro
  const [payoutMethod, setPayoutMethod] = useState('nequi');
  const [payoutForm, setPayoutForm] = useState({
    accountNumber: '',
    bankName: 'Bancolombia',
    accountType: 'Ahorros',
    documentId: '',
    documentType: 'CC',
    paypalEmail: '',
    accountHolder: ''
  });

  const router = useRouter();
  const supabase = createClient();

  const loadData = React.useCallback(async () => {
    try {
      const res = await getPartnerPortalData();
      setData(res);

      if (res.agreement) {
        setPayoutMethod(res.agreement.payout_method || 'nequi');
        if (res.agreement.payout_details) {
          setPayoutForm({
            accountNumber: res.agreement.payout_details.accountNumber || '',
            bankName: res.agreement.payout_details.bankName || 'Bancolombia',
            accountType: res.agreement.payout_details.accountType || 'Ahorros',
            documentId: res.agreement.payout_details.documentId || '',
            documentType: res.agreement.payout_details.documentType || 'CC',
            paypalEmail: res.agreement.payout_details.paypalEmail || '',
            accountHolder: res.agreement.payout_details.accountHolder || ''
          });
        }
      }
    } catch (err) {
      console.error('Error loading partner data:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();

    // ⚡ Suscripción en Tiempo Real para el Vendedor / Afiliado
    const channel = supabase
      .channel('partner-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_agreements' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, supabase]);

  const referralCode = data?.agreement?.referral_code || 'SOCIO';
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/tienda?ref=${referralCode}`
    : `https://tecnonets.com/tienda?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePartnerPayoutDetails({
        payoutMethod,
        payoutDetails: payoutForm
      });
      setFeedbackMsg('Datos de cobro guardados correctamente.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      loadData();
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message || 'No se pudieron guardar los datos'}`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <p className="text-xs text-slate-400 font-medium">Cargando panel de afiliado...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Portal del Vendedor / Afiliado
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              {data?.agreement?.commission_percentage}% Comisión Directa
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bienvenido, <strong className="text-slate-700 dark:text-slate-300">{data?.user?.profile?.full_name || data?.user?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="max-w-6xl mx-auto mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="max-w-6xl mx-auto mt-6 space-y-6">
        
        {/* Tarjeta de Enlace de Referido */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tu Enlace Exclusivo de Ventas</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Comparte este enlace para ganar comisiones automáticamente</h3>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1 break-all bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
              {referralLink}
            </p>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Mi Enlace'}</span>
          </button>
        </div>

        {/* KPIs Financieros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Saldo pendiente por cobrar</span>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ${data?.stats?.pendingBalance || 0} <span className="text-xs font-normal text-slate-400">USD</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Listo para liquidación</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Total cobrado (Pagado)</span>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${data?.stats?.paidBalance || 0} <span className="text-xs font-normal text-slate-400">USD</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Transferido a tu cuenta</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Total histórico generado</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${data?.stats?.totalEarned || 0} <span className="text-xs font-normal text-slate-400">USD</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Todas tus comisiones acumuladas</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Ventas referidas</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.stats?.totalSalesCount || 0}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Clientes que compraron con tu link</p>
          </div>
        </div>

        {/* Sección: Mi Equipo de Vendedores (Si aplica Multi-Nivel Tier 2) */}
        {data?.teamMembers && data?.teamMembers.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Mi Red de Vendedores (Equipo Nivel 2 - 5% de Comisión Indirecta)
                </h3>
                <p className="text-xs text-slate-500">Ganas el 5% de cada venta que realicen los miembros de tu grupo.</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 rounded">
                {data.teamMembers.length} Miembro(s) en tu equipo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {data.teamMembers.map((member: any) => (
                <div key={member.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{member.seller?.full_name || 'Vendedor'}</p>
                  <p className="text-slate-400 text-[11px]">{member.seller?.email}</p>
                  <p className="font-mono font-semibold text-blue-600 mt-1.5">Código: {member.referral_code}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Historial de Comisiones y Ventas (2 columnas) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historial de Ventas y Comisiones
            </h3>

            {(!data?.commissions || data.commissions.length === 0) ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Aún no has registrado ventas con tu enlace. ¡Comparte tu link para empezar a ganar!
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.commissions.map((comm: any) => (
                  <div key={comm.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          +${comm.amount} {comm.currency}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          comm.tier_level === 2 ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {comm.tier_level === 2 ? 'Comisión de Equipo (Tier 2)' : 'Venta Directa'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Orden: {comm.order?.order_number} • {new Date(comm.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      comm.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {comm.status === 'paid' ? 'Liquidado' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario de Configuración de Cobro (1 columna) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ¿Dónde te pagamos tus comisiones?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa tu cuenta bancaria o Nequi para recibir tus transferencias.
              </p>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Método de Pago</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium"
                >
                  <option value="nequi">Nequi / Daviplata</option>
                  <option value="bancolombia">Cuenta Bancaria (Colombia)</option>
                  <option value="paypal">PayPal (Internacional)</option>
                  <option value="usdt">USDT / Cripto (Binance Pay)</option>
                </select>
              </div>

              {payoutMethod === 'nequi' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Número de Celular Nequi / Daviplata</label>
                    <input
                      type="tel"
                      required
                      placeholder="300 1234567"
                      value={payoutForm.accountNumber}
                      onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Cédula del Titular</label>
                    <input
                      type="text"
                      required
                      placeholder="1.098.765.432"
                      value={payoutForm.documentId}
                      onChange={(e) => setPayoutForm({ ...payoutForm, documentId: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                </>
              )}

              {payoutMethod === 'bancolombia' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Banco</label>
                    <input
                      type="text"
                      required
                      placeholder="Bancolombia, Davivienda, etc."
                      value={payoutForm.bankName}
                      onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Número de Cuenta</label>
                    <input
                      type="text"
                      required
                      placeholder="000-000000-00"
                      value={payoutForm.accountNumber}
                      onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Tipo de Cuenta</label>
                    <select
                      value={payoutForm.accountType}
                      onChange={(e) => setPayoutForm({ ...payoutForm, accountType: e.target.value })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    >
                      <option value="Ahorros">Ahorros</option>
                      <option value="Corriente">Corriente</option>
                    </select>
                  </div>
                </>
              )}

              {payoutMethod === 'paypal' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Correo de PayPal</label>
                  <input
                    type="email"
                    required
                    placeholder="micorreo@paypal.com"
                    value={payoutForm.paypalEmail}
                    onChange={(e) => setPayoutForm({ ...payoutForm, paypalEmail: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs mt-2"
              >
                Guardar Datos de Pago
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
