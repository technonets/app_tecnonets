'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Key, 
  Copy, 
  Clock, 
  FileSpreadsheet, 
  DownloadCloud, 
  ExternalLink, 
  LogOut, 
  Package, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Eye, 
  ArrowLeft,
  GraduationCap,
  PlayCircle,
  Video,
  FileText,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  ShoppingBag,
  User,
  Zap,
  HelpCircle,
  Monitor,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { executeWithSwr, invalidateCache } from '@/lib/cache';
import { customerRemoveOriginAction } from './actions';

// Cursos predeterminados de la plataforma (Gratis y Pro)
const DEFAULT_COURSES = [
  {
    id: 'course-sheets-free',
    title: 'Curso Gratuito: Fundamentos y Automatización en Google Sheets',
    description: 'Aprende desde cero a estructurar bases de datos, fórmulas profesionales y automatizar tareas repetitivas en tu negocio.',
    is_free: true,
    category: 'Google Sheets & Automatización',
    duration: '1h 45m • 6 Módulos',
    lessons: [
      { title: '1. Introducción y estructura de datos moderna', duration: '12 min', video_url: 'https://www.youtube.com' },
      { title: '2. Fórmulas esenciales: QUERY, FILTER e IMPORTRANGE', duration: '18 min', video_url: 'https://www.youtube.com' },
      { title: '3. Creación de paneles y dashboards visuales', duration: '22 min', video_url: 'https://www.youtube.com' },
      { title: '4. Introducción a Apps Script y macros automáticas', duration: '25 min', video_url: 'https://www.youtube.com' },
      { title: '5. Conexión con formularios y alertas automáticas', duration: '15 min', video_url: 'https://www.youtube.com' },
      { title: '6. Buenas prácticas de seguridad y control de accesos', duration: '13 min', video_url: 'https://www.youtube.com' }
    ]
  },
  {
    id: 'course-inventory-pro',
    title: 'Masterclass Pro: Gestión Integral de Inventarios y Facturación',
    description: 'Especialización avanzada para implementar control de stock multialmacén, generación de facturas PDF y alertas de reposición.',
    is_free: false,
    price: 39,
    category: 'Finanzas & Stock',
    duration: '3h 15m • 10 Módulos',
    lessons: [
      { title: '1. Arquitectura de inventarios en la nube', duration: '15 min', video_url: 'https://www.youtube.com' },
      { title: '2. Registro de entradas, salidas y mermas', duration: '20 min', video_url: 'https://www.youtube.com' },
      { title: '3. Automatización de facturación con generación de PDF', duration: '30 min', video_url: 'https://www.youtube.com' },
      { title: '4. Envío automático de facturas por WhatsApp y Email', duration: '25 min', video_url: 'https://www.youtube.com' },
      { title: '5. Informes contables y análisis de rentabilidad', duration: '20 min', video_url: 'https://www.youtube.com' }
    ]
  },
  {
    id: 'course-appsheet-crm',
    title: 'Crea tu propia App Móvil de Ventas con AppSheet',
    description: 'Transforma tu hoja de cálculo en una aplicación móvil instalable en Android y iPhone para tus vendedores en campo.',
    is_free: true,
    category: 'Apps Móviles',
    duration: '2h 10m • 8 Clases',
    lessons: [
      { title: '1. ¿Qué es AppSheet y cómo conectarlo a Google Sheets?', duration: '14 min', video_url: 'https://www.youtube.com' },
      { title: '2. Configuración de tablas, vistas y formularios móviles', duration: '22 min', video_url: 'https://www.youtube.com' },
      { title: '3. Firmas digitales y fotos en tiempo real', duration: '18 min', video_url: 'https://www.youtube.com' },
      { title: '4. Sincronización offline y despliegue a tu equipo', duration: '20 min', video_url: 'https://www.youtube.com' }
    ]
  }
];

function PortalContent() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('customer');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pestaña activa del portal
  const [activeTab, setActiveTab] = useState<'tools' | 'courses' | 'resources'>('tools');
  const [courses, setCourses] = useState<any[]>(DEFAULT_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  // Configuración de Visibilidad Global del Espacio
  const [workspaceSettings, setWorkspaceSettings] = useState({
    show_tools_tab: true,
    show_courses_tab: true,
    show_resources_tab: true,
    show_store_button: true,
    custom_workspace_name: 'Mi Espacio Tecnonets'
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const asUserId = searchParams.get('asUser');
  const supabase = createClient();

  const applyPortalData = React.useCallback((payload: any, isAdmin: boolean) => {
    if (payload.settingsData?.value) {
      setWorkspaceSettings(payload.settingsData.value);
      if (!isAdmin) {
        if (!payload.settingsData.value.show_tools_tab && activeTab === 'tools') {
          if (payload.settingsData.value.show_courses_tab) setActiveTab('courses');
          else if (payload.settingsData.value.show_resources_tab) setActiveTab('resources');
        }
      }
    }

    const formattedDbCourses = (payload.dbCoursesData || []).map((prod: any) => {
      const hasCurriculum = Array.isArray(prod.curriculum) && prod.curriculum.length > 0;
      const totalLessonsCount = hasCurriculum 
        ? prod.curriculum.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
        : 1;

      return {
        id: prod.id,
        title: prod.title,
        description: prod.description,
        is_free: prod.delivery_type === 'COURSE_FREE' || prod.price === 0,
        price: prod.price,
        category: prod.category || 'Cursos & Masterclasses',
        duration: hasCurriculum 
          ? `${prod.curriculum.length} Módulos • ${totalLessonsCount} Clases` 
          : 'Clases Prácticas',
        curriculum: prod.curriculum || [],
        lessons: hasCurriculum 
          ? prod.curriculum.flatMap((m: any) => m.lessons || [])
          : (prod.template_url ? [{ title: '1. Clase Completa / Tutorial', duration: 'Clase en video', video_url: prod.template_url }] : [])
      };
    });

    if (payload.profileData) setProfile(payload.profileData);
    if (payload.licensesData) setLicenses(payload.licensesData);
    setCourses(formattedDbCourses.length > 0 ? formattedDbCourses : DEFAULT_COURSES);
    setLoading(false);
  }, [activeTab]);

  const loadCustomerData = React.useCallback(async (forceRefresh = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Cargar rol del usuario autenticado
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const currentRole = roleData?.role || 'customer';
      setUserRole(currentRole);

      // Determinar si es un Admin viendo el portal de otro cliente
      const isAdmin = currentRole === 'admin' || currentRole === 'staff';
      const targetUserId = (isAdmin && asUserId) ? asUserId : user.id;
      setIsImpersonating(Boolean(isAdmin && asUserId && asUserId !== user.id));

      const cacheKey = `portal_user_${targetUserId}`;

      await executeWithSwr(cacheKey, async () => {
        const [{ data: profileData }, { data: licensesData }, { data: dbCoursesData }, { data: settingsData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', targetUserId).single(),
          supabase.from('licenses').select(`
            id,
            license_key,
            status,
            is_trial,
            trial_ends_at,
            expires_at,
            created_at,
            product:products (
              id,
              title,
              description,
              category,
              delivery_type,
              template_url,
              demo_url,
              tutorial_url,
              file_path,
              curriculum
            )
          `).eq('customer_id', targetUserId).order('created_at', { ascending: false }),
          supabase.from('products')
            .select('*')
            .or('delivery_type.eq.COURSE_FREE,delivery_type.eq.COURSE_PAID,category.eq.Cursos & Masterclasses')
            .eq('is_active', true)
            .order('price', { ascending: true }),
          supabase.from('app_settings')
            .select('value')
            .eq('key', 'workspace_visibility')
            .single()
        ]);

        return { profileData, licensesData, dbCoursesData, settingsData };
      }, {
        forceRefresh,
        onCached: (cached) => applyPortalData(cached, isAdmin),
        onFresh: (fresh) => applyPortalData(fresh, isAdmin)
      });

    } catch (err) {
      console.error('Error loading customer portal:', err);
      setLoading(false);
    }
  }, [applyPortalData, asUserId, router, supabase]);

  useEffect(() => {
    loadCustomerData();

    // ⚡ Suscripción en Tiempo Real para el Cliente
    const channel = supabase
      .channel('customer-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, () => {
        loadCustomerData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadCustomerData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCustomerData, supabase]);

  const [deactivatingOrigin, setDeactivatingOrigin] = useState<string | null>(null);

  const handleCustomerRemoveOrigin = async (licenseId: string, originToRemove: string) => {
    if (!confirm(`¿Estás seguro de desvincular este dispositivo/hoja ("${originToRemove}")? Se liberará 1 cupo para que puedas activarlo en otro equipo.`)) {
      return;
    }

    try {
      setDeactivatingOrigin(originToRemove);
      await customerRemoveOriginAction(licenseId, originToRemove);

      // Actualizar estado local
      setLicenses(prev => prev.map(lic => {
        if (lic.id === licenseId) {
          const updated = (lic.allowed_origins || []).filter((o: string) => o !== originToRemove);
          return { ...lic, allowed_origins: updated, current_activations: updated.length };
        }
        return lic;
      }));

      invalidateCache('portal_user_');
    } catch (err: any) {
      alert(err.message || 'Error al desvincular el dispositivo.');
    } finally {
      setDeactivatingOrigin(null);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Obtener iniciales para el avatar
  const userName = profile?.full_name || profile?.email || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      
      {/* Barra de Modo Soporte / Impersonación para Administradores */}
      {isImpersonating && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md sticky top-0 z-50 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-950 shrink-0" />
            <span>
              MODO SOPORTE: Estás visualizando el espacio exactamente como lo ve el cliente <strong>{profile?.full_name || profile?.email}</strong> ({profile?.email})
            </span>
          </div>
          <Link
            href="/admin"
            className="px-3 py-1 bg-slate-950 text-white hover:bg-slate-900 rounded-md text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 shadow-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Volver al Panel Super Admin</span>
          </Link>
        </div>
      )}

      {/* Hero Header Ejecutivo */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Perfil y Marca */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {workspaceSettings.custom_workspace_name || 'Mi Espacio Tecnonets'}
                </h1>
                {(userRole === 'admin' || userRole === 'staff') && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{profile?.email}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Espacio Activo
                </span>
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {(userRole === 'admin' || userRole === 'staff') && (
              <Link
                href="/admin"
                className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Panel Super Admin</span>
              </Link>
            )}

            {(workspaceSettings.show_store_button !== false || userRole === 'admin' || userRole === 'staff') && (
              <Link
                href="/tienda"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Explorar Tienda</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-800"
              title="Cerrar sesión de forma segura"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Barra Segmentada de Pestañas (Pill Switcher) */}
        <div className="bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl flex flex-wrap items-center gap-1 border border-slate-200 dark:border-slate-800/80">
          
          {(workspaceSettings.show_tools_tab !== false || userRole === 'admin' || userRole === 'staff') && (
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'tools'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Mis Herramientas & Licencias</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'tools'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-slate-300/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {licenses.length}
              </span>
              {!workspaceSettings.show_tools_tab && (userRole === 'admin' || userRole === 'staff') && (
                <span className="text-[9px] text-amber-500 font-extrabold">(Oculto)</span>
              )}
            </button>
          )}

          {(workspaceSettings.show_courses_tab !== false || userRole === 'admin' || userRole === 'staff') && (
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'courses'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academia & Cursos</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
                {courses.length}
              </span>
              {!workspaceSettings.show_courses_tab && (userRole === 'admin' || userRole === 'staff') && (
                <span className="text-[9px] text-amber-500 font-extrabold">(Oculto)</span>
              )}
            </button>
          )}

          {(workspaceSettings.show_resources_tab !== false || userRole === 'admin' || userRole === 'staff') && (
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'resources'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guías & Recursos</span>
              {!workspaceSettings.show_resources_tab && (userRole === 'admin' || userRole === 'staff') && (
                <span className="text-[9px] text-amber-500 font-extrabold">(Oculto)</span>
              )}
            </button>
          )}

        </div>

        {/* ======================================================== */}
        {/* PESTAÑA 1: HERRAMIENTAS & LICENCIAS                      */}
        {/* ======================================================== */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3 shadow-xs">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : licenses.length === 0 ? (
              
              /* Hub de Bienvenida e Inicio Rápido (Onboarding Elegante) */
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Banner de Bienvenida */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Espacio Listo para Crecer
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      ¡Bienvenido a tu Espacio Digital, {userName}!
                    </h2>
                    <p className="text-xs text-slate-500 max-w-lg">
                      Aún no tienes licencias de software vinculadas a esta cuenta. Explora nuestras soluciones para comenzar a optimizar tu negocio:
                    </p>
                  </div>

                  <Link
                    href="/tienda"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ver Catálogo de Plantillas</span>
                  </Link>
                </div>

                {/* 3 Tarjetas de Inicio Rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Tarjeta 1: Explorar Plantillas */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        Plantillas Google Sheets
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Sistemas automatizados de facturación, inventario multialmacén y control financiero.
                      </p>
                    </div>
                    <Link
                      href="/tienda"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                    >
                      <span>Explorar Plantillas</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Tarjeta 2: Academia de Cursos */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        Cursos y Clases Gratuitas
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Aprende paso a paso con nuestras lecciones en video de automatización empresarial.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 text-left"
                    >
                      <span>Ir a las Clases</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Tarjeta 3: Guías y Documentación */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        Guías & Atajos
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Manuales de fórmulas, preguntas frecuentes y guías de configuración rápida.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1 text-left"
                    >
                      <span>Ver Recursos</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>

              </div>

            ) : (
              
              /* Lista de Licencias y Productos Activos */
              <div className="space-y-4">
                {licenses.map((lic) => {
                  const prod = lic.product;
                  const isTrial = lic.is_trial || lic.status === 'trial';
                  const isExpired = lic.status === 'expired';

                  return (
                    <div 
                      key={lic.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        
                        {/* Información del Producto */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">
                              {prod?.title || 'Producto de Software'}
                            </h3>
                            
                            {/* Badge de Estado */}
                            {lic.status === 'active' && (
                              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 rounded-full text-[10px] font-extrabold tracking-wide">
                                LICENCIA VITALICIA ACTIVA
                              </span>
                            )}

                            {isTrial && (
                              <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 rounded-full text-[10px] font-extrabold flex items-center gap-1 tracking-wide">
                                <Clock className="w-3 h-3" />
                                PRUEBA ACTIVA
                              </span>
                            )}

                            {isExpired && (
                              <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 rounded-full text-[10px] font-extrabold tracking-wide">
                                EXPIRADA
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {prod?.description || 'Plantilla automatizada lista para conectar con tu cuenta de Google.'}
                          </p>

                          {/* Clave de Licencia */}
                          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-slate-400 font-semibold text-[11px]">Clave de Activación:</span>
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                              <Key className="w-3.5 h-3.5 text-blue-500" />
                              <span>{lic.license_key}</span>
                              <button
                                onClick={() => handleCopy(lic.license_key)}
                                className="ml-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Copiar Clave"
                              >
                                {copiedKey === lic.license_key ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Dispositivos y Hojas Vinculadas (Autogestión de Slots por el Cliente) */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                              <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <Monitor className="w-3.5 h-3.5 text-blue-500" />
                                <span>Dispositivos / Hojas ({lic.allowed_origins?.length || 0} de {lic.max_activations || 1} activos):</span>
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {Math.max(0, (lic.max_activations || 1) - (lic.allowed_origins?.length || 0))} cupos libres
                              </span>
                            </div>

                            {lic.allowed_origins && lic.allowed_origins.length > 0 ? (
                              <div className="space-y-1.5">
                                {lic.allowed_origins.map((origin: string) => (
                                  <div 
                                    key={origin} 
                                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs"
                                  >
                                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs" title={origin}>
                                      {origin}
                                    </span>
                                    <button
                                      onClick={() => handleCustomerRemoveOrigin(lic.id, origin)}
                                      disabled={deactivatingOrigin === origin}
                                      className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline flex items-center gap-1 transition-colors disabled:opacity-50 shrink-0 ml-2"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>{deactivatingOrigin === origin ? 'Desvinculando...' : 'Desvincular'}</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">
                                Clave lista para usar. Se vinculará automáticamente al abrir tu hoja o software por primera vez.
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Botones de Acción / Entrega */}
                        <div className="flex flex-wrap md:flex-col items-stretch justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                          
                          {/* Botón: Abrir Plantilla Google Sheets */}
                          {prod?.template_url && (
                            <a
                              href={prod.template_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Abrir Plantilla Sheets</span>
                              <ExternalLink className="w-3 h-3 opacity-80" />
                            </a>
                          )}

                          {/* Botón: Descargar Archivo / Software */}
                          {prod?.file_path && (
                            <a
                              href={prod.file_path}
                              download
                              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                            >
                              <DownloadCloud className="w-4 h-4" />
                              <span>Descargar Archivo</span>
                            </a>
                          )}

                          {/* Botón: Ver Tutorial */}
                          {prod?.tutorial_url && (
                            <a
                              href={prod.tutorial_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ver Tutorial en Video</span>
                            </a>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: ACADEMIA & CURSOS                             */}
        {/* ======================================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>Academia Digital & Clases Prácticas</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Aprende a automatizar y optimizar tus hojas de cálculo y procesos de negocio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <div 
                  key={course.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 group"
                >
                  <div>
                    {/* Portada del Curso */}
                    <div className={`p-5 ${course.is_free ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30' : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30'} border-b border-slate-100 dark:border-slate-800`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {course.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          course.is_free 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {course.is_free ? 'GRATUITO' : `PRO • $${course.price} USD`}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    {/* Contenido */}
                    <div className="p-5 space-y-3">
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Acción */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                        course.is_free
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                      }`}
                    >
                      {course.is_free ? (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>Ver Temario & Clases</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Ver Temario de Masterclass</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: GUÍAS & RECURSOS DIGITALES                    */}
        {/* ======================================================== */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Documentación y Recursos Descargables</span>
              </h2>
              <p className="text-xs text-slate-500">
                Material complementario para dominar tus herramientas digitales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-xs">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Cheat Sheet: Fórmulas QUERY y FILTER</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Guía rápida de sintaxis y ejemplos prácticos para bases de datos complejas en Google Sheets.</p>
                  <a href="/tienda" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1">
                    <span>Consultar Guía</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-xs">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Manual de Activación de Licencias</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Instrucciones detalladas para vincular tus hojas y registrar tus equipos en minutos.</p>
                  <a href="/tienda" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1">
                    <span>Ver Tutorial de Soporte</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL: VISUALIZADOR DE CURSO / TEMARIO COMPLETO           */}
      {/* ======================================================== */}
      {selectedCourse && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                selectedCourse.is_free 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {selectedCourse.is_free ? 'CURSO GRATUITO' : `ACCESO PRO • $${selectedCourse.price} USD`}
              </span>
              <span className="text-xs text-slate-400">• {selectedCourse.duration}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {selectedCourse.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {selectedCourse.description}
            </p>

            {/* Contenido del Temario (Soporta Secciones y Lecciones Jerárquicas) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex-1 overflow-y-auto space-y-4 pr-1">
              
              {selectedCourse.curriculum && selectedCourse.curriculum.length > 0 ? (
                // Estructura por Módulos / Secciones
                selectedCourse.curriculum.map((module: any, mIdx: number) => (
                  <div key={module.id || mIdx} className="space-y-2">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-extrabold">
                        SECCIÓN {mIdx + 1}
                      </span>
                      <span>{module.title}</span>
                    </div>

                    <div className="space-y-2 pl-2 sm:pl-3">
                      {module.lessons.map((lesson: any, lIdx: number) => (
                        <div 
                          key={lesson.id || lIdx}
                          className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {lIdx + 1}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {lesson.title}
                              </span>
                              {lesson.duration && (
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {lesson.resource_url && (
                              <a
                                href={lesson.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                title="Descargar material de práctica"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Plantilla / Recurso</span>
                              </a>
                            )}

                            {lesson.video_url ? (
                              <a
                                href={lesson.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Ver Clase</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Próximamente</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Estructura Plana de Clases
                selectedCourse.lessons.map((lesson: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">{lesson.duration}</span>
                      {lesson.video_url && (
                        <a
                          href={lesson.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Ver Clase</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}

            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CustomerPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-12 text-center text-xs text-slate-400">
        Cargando espacio digital...
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}
