'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Shield, 
  Key, 
  Users, 
  DollarSign, 
  Package, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  Copy, 
  Activity, 
  UserCheck, 
  X,
  FileSpreadsheet,
  Download,
  CreditCard,
  LogOut,
  Edit2,
  Trash2,
  Monitor,
  AlertTriangle,
  RotateCcw,
  UserPlus,
  Lock,
  Mail,
  Phone,
  Briefcase,
  ShoppingCart,
  BookOpen,
  FileText,
  Eye,
  Check,
  Ban,
  GraduationCap,
  PlayCircle,
  Settings,
  Sliders,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  RefreshCw,
  Code2,
  Terminal,
  ShieldAlert,
  ChevronDown,
  Bot,
  Sparkles,
  MessageCircle,
  Calendar,
  Minus,
  User,
  Hash,
  Layers,
  Globe,
  FileArchive,
  FolderPlus,
  KeyRound,
  ExternalLink,
  Tag,
  Percent,
  Timer,
  Flame,
  Gift,
  Ticket,
  CheckCircle2
} from 'lucide-react';
import { 
  LATAM_COUNTRY_CODES, 
  parsePhoneAndCountry, 
  formatFullInternationalPhone, 
  getCountryInfoFromPhone, 
  generateWhatsAppLicenseLink 
} from '@/lib/countries';
import { CountryPhoneInput } from '@/components/ui/CountryPhoneInput';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { PriceInput } from '@/components/ui/PriceInput';
import { 
  getAdminFullWorkspaceBundle,
  createManualLicense, 
  updateLicenseAction, 
  deleteLicenseAction,
  removeOriginAction, 
  getLicenseLogs, 
  createPartnerAgreement, 
  deletePartnerAgreementAction,
  settleCommission,
  saveProductAction,
  deleteProductAction,
  saveAdminUserAction,
  deleteAdminUserAction,
  createManualOrderAction,
  updateOrderStatusAction,
  savePostAction,
  deletePostAction,
  reissueLicenseKeyAction,
  transferLicenseAction,
  resendCustomerAccessAction,
  updateWorkspaceVisibilitySettings,
  toggleProductActiveAction,
  getAdminCouponsAction,
  saveCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction
} from './actions';
import { executeWithSwr, invalidateCache } from '@/lib/cache';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'orders' | 'users' | 'partners' | 'products' | 'coupons' | 'posts' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Cupones de Descuento
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    id: '',
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiresAt: '',
    maxUses: '',
    productId: '',
    isActive: true
  });

  // Configuración de Visibilidad del Espacio
  const [workspaceSettings, setWorkspaceSettings] = useState({
    show_tools_tab: true,
    show_courses_tab: true,
    show_resources_tab: true,
    show_store_button: true,
    custom_workspace_name: 'Mi Espacio Tecnonets'
  });

  // Datos de Base de Datos
  const [stats, setStats] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [partnersData, setPartnersData] = useState<any>({ agreements: [], commissions: [] });
  const [products, setProducts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  // Modales
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showSdkModal, setShowSdkModal] = useState(false);
  const [sdkLanguage, setSdkLanguage] = useState<'gas' | 'vba' | 'js' | 'python' | 'curl'>('gas');
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [copiedAiPrompt, setCopiedAiPrompt] = useState(false);

  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<{ licenseKey: string; logs: any[] } | null>(null);

  // Forms
  const [newLicForm, setNewLicForm] = useState({
    productId: '',
    customerEmail: '',
    customerName: '',
    customerCountryCode: '+57',
    customerLocalPhone: '',
    assignType: 'manual' as 'manual' | 'registered',
    selectedUserId: '',
    licenseType: 'lifetime' as 'trial' | 'subscription' | 'lifetime',
    trialDays: 14,
    durationMonths: 12,
    exactExpiryDate: '',
    sellerId: '',
    allowedOrigins: '',
    newManualOrigin: '',
    maxActivations: 1,
    internalNotes: '',
    sendEmailNotification: false
  });

  const [orderForm, setOrderForm] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    productId: '',
    amount: '49',
    paymentGateway: 'MANUAL_TRANSFER',
    referralCode: ''
  });

  const [partnerAgreementType, setPartnerAgreementType] = useState<'percentage' | 'wholesale'>('percentage');
  const [newPartnerForm, setNewPartnerForm] = useState({
    sellerEmail: '',
    sellerName: '',
    sellerPhone: '',
    referralCode: '',
    commissionPercentage: '20',
    fixedAmount: '20',
    parentSellerId: '',
    payoutMethod: 'nequi'
  });

  const [userForm, setUserForm] = useState({
    id: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'customer' as 'admin' | 'staff' | 'partner' | 'customer',
    password: ''
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [productForm, setProductForm] = useState({
    id: '',
    title: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    monthly_price: '',
    category: 'Google Sheets',
    delivery_type: 'GOOGLE_SHEET_TEMPLATE',
    template_url: '',
    file_url: '',
    demo_url: '',
    tutorial_url: '',
    custom_delivery_name: '',
    attachments: [] as Array<{ id: string; name: string; url: string }>,
    requires_license: true,
    has_trial: true,
    default_trial_days: 14,
    // Promociones & Fechas Límite
    offer_end_date: '',
    is_free_temporary: false,
    free_until_date: '',
    promotion_badge: '',
    curriculum: [] as Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        duration: string;
        video_url: string;
        resource_url?: string;
      }>;
    }>
  });

  const [postForm, setPostForm] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Tutoriales',
    is_published: true
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // 1. Carga Única Global de TODO el espacio administrativo (0 consultas al cambiar de pestaña)
  const loadFullWorkspace = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      await executeWithSwr('admin_full_workspace', getAdminFullWorkspaceBundle, {
        forceRefresh,
        onCached: (bundle) => {
          if (!bundle) return;
          if (bundle.stats) setStats(bundle.stats);
          if (bundle.licenses) setLicenses(bundle.licenses);
          if (bundle.orders) setOrders(bundle.orders);
          if (bundle.usersList) setUsersList(bundle.usersList);
          if (bundle.partners) setPartnersData(bundle.partners);
          if (bundle.products) setProducts(bundle.products);
          if (bundle.posts) setPosts(bundle.posts);
          if (bundle.settings) setWorkspaceSettings(bundle.settings);
          setLoading(false);
        },
        onFresh: (bundle) => {
          if (!bundle) return;
          if (bundle.stats) setStats(bundle.stats);
          if (bundle.licenses) setLicenses(bundle.licenses);
          if (bundle.orders) setOrders(bundle.orders);
          if (bundle.usersList) setUsersList(bundle.usersList);
          if (bundle.partners) setPartnersData(bundle.partners);
          if (bundle.products) setProducts(bundle.products);
          if (bundle.posts) setPosts(bundle.posts);
          if (bundle.settings) setWorkspaceSettings(bundle.settings);
          setLoading(false);
        }
      });
    } catch (err: any) {
      console.error('Error loading admin workspace:', err);
      setLoading(false);
    }
  }, [router, supabase]);

  // Carga inicial 1 sola vez al entrar
  useEffect(() => {
    loadFullWorkspace();
    loadCouponsData();
  }, [loadFullWorkspace]);

  // Recarga tras mutaciones
  const loadAllData = useCallback(async () => {
    invalidateCache('admin_full_workspace');
    await Promise.all([loadFullWorkspace(true), loadCouponsData()]);
  }, [loadFullWorkspace]);

  // Búsqueda y filtrado instantáneo en memoria para licencias (0 consultas a BD)
  const filteredLicenses = useMemo(() => {
    return licenses.filter(lic => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        lic.license_key?.toLowerCase().includes(query) ||
        lic.customer?.email?.toLowerCase().includes(query) ||
        lic.customer?.full_name?.toLowerCase().includes(query) ||
        lic.metadata?.client_name?.toLowerCase().includes(query) ||
        lic.metadata?.client_email?.toLowerCase().includes(query) ||
        lic.metadata?.client_phone?.toLowerCase().includes(query) ||
        lic.product?.title?.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'all' || lic.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchTerm, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSaveWorkspaceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkspaceVisibilitySettings(workspaceSettings);
      showToast('Configuración de visibilidad guardada exitosamente.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar configuración', true);
    }
  };

  const handleToggleProductActive = async (productId: string, currentStatus: boolean) => {
    try {
      // Optimistic update local
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: !currentStatus } : p));
      await toggleProductActiveAction(productId, !currentStatus);
      showToast(!currentStatus ? 'Producto / Curso visible para clientes.' : 'Producto / Curso oculto.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar visibilidad', true);
      loadAllData();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExtendTrial = async (licenseId: string, days: number) => {
    await updateLicenseAction(licenseId, { addTrialDays: days });
    setActionFeedback(`Se agregaron +${days} días de prueba.`);
    setTimeout(() => setActionFeedback(null), 3000);
    loadAllData();
  };

  const handleRequestStatusChange = (lic: any, targetStatus: 'active' | 'suspended') => {
    const isSuspending = targetStatus === 'suspended';
    const clientName = lic.metadata?.client_name || lic.customer?.full_name || 'Cliente';

    setConfirmDialog({
      isOpen: true,
      title: isSuspending ? '🔒 Suspender y Bloquear Licencia' : '⚡ Reactivar Licencia',
      message: isSuspending
        ? `¿Estás seguro de suspender la clave "${lic.license_key}" asignada a "${clientName}"? El software o planilla del cliente quedará inmediatamente bloqueado.`
        : `¿Deseas reactivar la clave "${lic.license_key}" para "${clientName}"? El cliente recuperará el acceso activo y las validaciones de inmediato.`,
      confirmText: isSuspending ? 'Sí, Suspender Licencia' : 'Sí, Reactivar Licencia',
      isDestructive: isSuspending,
      onConfirm: async () => {
        try {
          await updateLicenseAction(lic.id, { status: targetStatus });
          showToast(isSuspending ? 'Licencia suspendida y bloqueada.' : 'Licencia reactivada con éxito.');
          loadAllData();
        } catch (err: any) {
          showToast(err.message || 'Error al cambiar estado', true);
        }
      }
    });
  };

  const handleViewLogs = async (lic: any) => {
    const logs = await getLicenseLogs(lic.id);
    setSelectedLogs({ licenseKey: lic.license_key, logs });
  };

  const [isGeneratingLicense, setIsGeneratingLicense] = useState(false);

  const handleCreateLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicForm.productId) {
      alert('Debes seleccionar un producto.');
      return;
    }

    setIsGeneratingLicense(true);
    try {
      const origins = [
        ...(newLicForm.allowedOrigins ? newLicForm.allowedOrigins.split(',').map(o => o.trim()).filter(Boolean) : []),
        ...(newLicForm.newManualOrigin ? [newLicForm.newManualOrigin.trim()] : [])
      ];

      const fullPhone = formatFullInternationalPhone(newLicForm.customerCountryCode, newLicForm.customerLocalPhone);

      await createManualLicense({
        productId: newLicForm.productId,
        customerEmail: newLicForm.customerEmail.trim() || undefined,
        customerName: newLicForm.customerName.trim() || undefined,
        customerPhone: fullPhone || undefined,
        licenseType: newLicForm.licenseType,
        trialDays: newLicForm.trialDays,
        durationMonths: newLicForm.durationMonths,
        expiresAtCustom: newLicForm.exactExpiryDate || undefined,
        sellerId: newLicForm.sellerId || undefined,
        allowedOrigins: origins,
        maxActivations: newLicForm.maxActivations,
        internalNotes: newLicForm.internalNotes.trim() || undefined,
        sendEmailNotification: newLicForm.sendEmailNotification && !!newLicForm.customerEmail.trim()
      });

      setShowLicenseModal(false);
      setNewLicForm({
        productId: '',
        customerEmail: '',
        customerName: '',
        customerCountryCode: '+57',
        customerLocalPhone: '',
        assignType: 'manual',
        selectedUserId: '',
        licenseType: 'lifetime',
        trialDays: 14,
        durationMonths: 12,
        exactExpiryDate: '',
        sellerId: '',
        allowedOrigins: '',
        newManualOrigin: '',
        maxActivations: 1,
        internalNotes: '',
        sendEmailNotification: false
      });

      setActionFeedback('Licencia generada correctamente.');
      setTimeout(() => setActionFeedback(null), 3000);
      await loadFullWorkspace(true);
    } catch (err: any) {
      alert(err.message || 'Error al crear licencia');
    } finally {
      setIsGeneratingLicense(false);
    }
  };

  // Estados para Diálogos y Modales Profesionales (Cero popups nativos)
  const [magicLinkResult, setMagicLinkResult] = useState<{ email: string; link: string; pinCode?: string } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    inputLabel?: string;
    placeholder?: string;
    confirmText?: string;
    value: string;
    onConfirm: (val: string) => Promise<void> | void;
  } | null>(null);

  const showToast = (msg: string, isError = false) => {
    setActionFeedback(isError ? `❌ ${msg}` : msg);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleResendAccess = async (email: string) => {
    if (!email) return;
    try {
      const res = await resendCustomerAccessAction(email);
      setMagicLinkResult({ email, link: res.magicLink || '', pinCode: res.pinCode });
      showToast(`Acceso directo generado para ${email}.`);
    } catch (err: any) {
      showToast(err.message || 'Error al generar enlace de acceso', true);
    }
  };

  const handleSaveLicenseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;

    try {
      let trialEndsAt = null;
      let expiresAt = null;

      if (editingLicense.billingCycle === 'trial' || editingLicense.status === 'trial') {
        trialEndsAt = editingLicense.exactExpiryDate ? new Date(editingLicense.exactExpiryDate).toISOString() : null;
      } else if (editingLicense.billingCycle === 'monthly' || editingLicense.billingCycle === 'yearly') {
        expiresAt = editingLicense.exactExpiryDate ? new Date(editingLicense.exactExpiryDate).toISOString() : null;
      }

      const fullPhone = formatFullInternationalPhone(editingLicense.customerCountryCode, editingLicense.customerLocalPhone);

      await updateLicenseAction(editingLicense.id, {
        status: editingLicense.status,
        billingCycle: editingLicense.billingCycle,
        productId: editingLicense.productId,
        trialEndsAt,
        expiresAt,
        maxActivations: Number(editingLicense.max_activations) || 1,
        addOrigin: editingLicense.newManualOrigin,
        sellerId: editingLicense.sellerId !== undefined ? (editingLicense.sellerId || null) : undefined,
        customerName: editingLicense.customerName !== undefined ? editingLicense.customerName : undefined,
        customerPhone: fullPhone !== undefined ? fullPhone : undefined,
        customerEmail: editingLicense.customerEmail !== undefined ? editingLicense.customerEmail : undefined,
        internalNotes: editingLicense.internalNotes !== undefined ? editingLicense.internalNotes : undefined
      });

      setEditingLicense(null);
      showToast('Licencia actualizada correctamente.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar licencia', true);
    }
  };

  const handleResetAllActivations = (licenseId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Liberar Cupos de Activación',
      message: '¿Estás seguro de liberar todos los computadores/hojas vinculados a esta clave? El cliente podrá activarla en un nuevo equipo.',
      confirmText: 'Liberar Cupos',
      isDestructive: false,
      onConfirm: async () => {
        await updateLicenseAction(licenseId, { resetActivations: true });
        if (editingLicense && editingLicense.id === licenseId) {
          setEditingLicense({
            ...editingLicense,
            allowed_origins: [],
            current_activations: 0
          });
        }
        showToast('Todos los cupos de computadores han sido liberados.');
        loadAllData();
      }
    });
  };

  const handleReissueKey = (licenseId: string) => {
    setPromptDialog({
      isOpen: true,
      title: '🔄 Re-emitir Nueva Clave de Licencia',
      message: 'Se generará una clave criptográfica nueva para este cliente y producto. La clave anterior quedará invalidada de inmediato y se liberarán los cupos.',
      inputLabel: 'Motivo del Reemplazo (Soporte):',
      placeholder: 'Ej: Clave corrupta, error técnico o formateo',
      value: 'Fallo técnico / Reemplazo soporte',
      confirmText: 'Generar Nueva Clave',
      onConfirm: async (reason: string) => {
        try {
          const res = await reissueLicenseKeyAction(licenseId, reason);
          if (editingLicense && editingLicense.id === licenseId) {
            setEditingLicense({
              ...editingLicense,
              license_key: res.newKey,
              allowed_origins: [],
              current_activations: 0
            });
          }
          showToast(`Nueva clave generada: ${res.newKey} (La anterior fue invalidada).`);
          loadAllData();
        } catch (err: any) {
          showToast(err.message || 'Error al re-emitir clave', true);
        }
      }
    });
  };

  const handleTransferLicense = (licenseId: string) => {
    setPromptDialog({
      isOpen: true,
      title: '👤 Transferir Licencia a otro Cliente',
      message: 'Ingresa el correo electrónico del cliente destinatario. La licencia pasará inmediatamente a su cuenta y portal.',
      inputLabel: 'Correo del Nuevo Propietario:',
      placeholder: 'comprador@empresa.com',
      value: '',
      confirmText: 'Transferir Licencia',
      onConfirm: async (newEmail: string) => {
        if (!newEmail || newEmail.trim() === '') {
          showToast('Debes ingresar un correo válido.', true);
          return;
        }
        try {
          await transferLicenseAction(licenseId, newEmail);
          showToast(`Licencia transferida exitosamente a ${newEmail}.`);
          loadAllData();
        } catch (err: any) {
          showToast(err.message || 'Error al transferir licencia', true);
        }
      }
    });
  };

  const handleDeleteLicense = (licenseId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Licencia Permanentemente',
      message: 'Esta acción no se puede deshacer. Se borrará la clave de la base de datos.',
      confirmText: 'Eliminar Licencia',
      isDestructive: true,
      onConfirm: async () => {
        await deleteLicenseAction(licenseId);
        setEditingLicense(null);
        showToast('Licencia eliminada.');
        loadAllData();
      }
    });
  };

  const handleRemoveOrigin = (licenseId: string, originToRemove: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Desvincular Dispositivo',
      message: `¿Deseas desvincular el dispositivo "${originToRemove}" para liberar un cupo?`,
      confirmText: 'Desvincular',
      isDestructive: true,
      onConfirm: async () => {
        const res = await removeOriginAction(licenseId, originToRemove);
        if (editingLicense && editingLicense.id === licenseId) {
          setEditingLicense({
            ...editingLicense,
            allowed_origins: res.updatedOrigins,
            current_activations: res.updatedOrigins.length
          });
        }
        showToast('Dispositivo desvinculado.');
        loadAllData();
      }
    });
  };

  // Manejo de Órdenes
  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createManualOrderAction(orderForm);
      setShowOrderModal(false);
      showToast('Orden y Licencia generadas con éxito.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al registrar orden', true);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'completed' | 'refunded' | 'cancelled') => {
    const isRefund = nextStatus === 'refunded';
    setConfirmDialog({
      isOpen: true,
      title: isRefund ? 'Reembolsar Orden y Suspender Licencia' : `Actualizar Orden a ${nextStatus.toUpperCase()}`,
      message: isRefund 
        ? '¿Confirmas reembolsar esta orden? Las licencias asociadas al cliente serán suspendidas automáticamente en tiempo real.'
        : `¿Deseas cambiar el estado de la orden a ${nextStatus}?`,
      confirmText: isRefund ? 'Confirmar Reembolso' : 'Actualizar',
      isDestructive: isRefund,
      onConfirm: async () => {
        await updateOrderStatusAction(orderId, nextStatus);
        showToast(`Orden actualizada a ${nextStatus.toUpperCase()}.`);
        loadAllData();
      }
    });
  };

  // Manejo de Vendedores
  const handleCreatePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPartnerAgreement({
        ...newPartnerForm,
        commissionPercentage: partnerAgreementType === 'percentage' ? newPartnerForm.commissionPercentage : 0,
        fixedAmount: partnerAgreementType === 'wholesale' ? newPartnerForm.fixedAmount : 0
      });
      setShowPartnerModal(false);
      showToast('Vendedor registrado exitosamente.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al crear vendedor', true);
    }
  };

  const handleDeletePartner = (agreementId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Acuerdo de Vendedor',
      message: '¿Estás seguro de revocar el acuerdo de este afiliado/revendedor?',
      confirmText: 'Eliminar Vendedor',
      isDestructive: true,
      onConfirm: async () => {
        await deletePartnerAgreementAction(agreementId);
        showToast('Vendedor eliminado.');
        loadAllData();
      }
    });
  };

  const handleSettleCommission = (commId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Liquidar Comisión al Vendedor',
      message: '¿Confirmas que ya realizaste el desembolso a la cuenta del vendedor y deseas marcarla como pagada?',
      confirmText: 'Marcar como Pagada',
      isDestructive: false,
      onConfirm: async () => {
        await settleCommission(commId);
        showToast('Comisión marcada como pagada.');
        loadAllData();
      }
    });
  };

  // Manejo de Productos
  const openCreateProduct = () => {
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setProductForm({
      id: '',
      title: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      monthly_price: '',
      category: 'Google Sheets',
      delivery_type: 'GOOGLE_SHEET_TEMPLATE',
      template_url: '',
      file_url: '',
      demo_url: '',
      tutorial_url: '',
      custom_delivery_name: '',
      attachments: [],
      requires_license: true,
      has_trial: true,
      default_trial_days: 14,
      offer_end_date: '',
      is_free_temporary: false,
      free_until_date: '',
      promotion_badge: '',
      curriculum: []
    });
    setShowProductModal(true);
  };

  const openCreateCourse = () => {
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setProductForm({
      id: '',
      title: '',
      slug: '',
      description: '',
      price: '0',
      original_price: '',
      monthly_price: '',
      category: 'Cursos & Masterclasses',
      delivery_type: 'COURSE_FREE',
      template_url: '',
      file_url: '',
      demo_url: '',
      tutorial_url: '',
      custom_delivery_name: '',
      attachments: [],
      requires_license: false,
      has_trial: false,
      default_trial_days: 0,
      offer_end_date: '',
      is_free_temporary: false,
      free_until_date: '',
      promotion_badge: '',
      curriculum: [
        {
          id: `mod-${Date.now()}`,
          title: 'Módulo 1: Fundamentos y Configuración Inicial',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: '1. Introducción al Curso y Objetivos',
              duration: '10 min',
              video_url: '',
              resource_url: ''
            }
          ]
        }
      ]
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod: any) => {
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setProductForm({
      id: prod.id,
      title: prod.title,
      slug: prod.slug,
      description: prod.description || '',
      price: prod.price !== undefined && prod.price !== null ? String(prod.price) : '',
      original_price: prod.original_price !== undefined && prod.original_price !== null ? String(prod.original_price) : '',
      monthly_price: prod.monthly_price !== undefined && prod.monthly_price !== null ? String(prod.monthly_price) : '',
      category: prod.category || 'Google Sheets',
      delivery_type: prod.delivery_type || 'GOOGLE_SHEET_TEMPLATE',
      template_url: prod.template_url || '',
      file_url: prod.file_url || prod.template_url || '',
      demo_url: prod.demo_url || '',
      tutorial_url: prod.tutorial_url || '',
      custom_delivery_name: '',
      attachments: Array.isArray(prod.attachments) ? prod.attachments : [],
      requires_license: prod.requires_license !== false,
      has_trial: prod.has_trial !== false,
      default_trial_days: prod.default_trial_days || 14,
      offer_end_date: prod.offer_end_date ? String(prod.offer_end_date).split('T')[0] : '',
      is_free_temporary: Boolean(prod.is_free_temporary),
      free_until_date: prod.free_until_date ? String(prod.free_until_date).split('T')[0] : '',
      promotion_badge: prod.promotion_badge || '',
      curriculum: Array.isArray(prod.curriculum) ? prod.curriculum : []
    });
    setShowProductModal(true);
  };

  const handleAddModule = () => {
    const newModule = {
      id: `mod-${Date.now()}`,
      title: `Módulo ${productForm.curriculum.length + 1}: Nueva Sección`,
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          title: '1. Nueva Clase',
          duration: '15 min',
          video_url: '',
          resource_url: ''
        }
      ]
    };
    setProductForm({
      ...productForm,
      curriculum: [...productForm.curriculum, newModule]
    });
  };

  const handleRemoveModule = (indexOrId: number | string) => {
    setProductForm({
      ...productForm,
      curriculum: productForm.curriculum.filter((m, i) => typeof indexOrId === 'number' ? i !== indexOrId : m.id !== indexOrId)
    });
  };

  const handleUpdateModuleTitle = (indexOrId: number | string, title: string) => {
    setProductForm({
      ...productForm,
      curriculum: productForm.curriculum.map((m, i) => (typeof indexOrId === 'number' ? i === indexOrId : m.id === indexOrId) ? { ...m, title } : m)
    });
  };

  const handleAddLesson = (moduleIndexOrId: number | string) => {
    setProductForm({
      ...productForm,
      curriculum: productForm.curriculum.map((m, i) => {
        const isTarget = typeof moduleIndexOrId === 'number' ? i === moduleIndexOrId : m.id === moduleIndexOrId;
        if (isTarget) {
          const newLesson = {
            id: `les-${Date.now()}-${(m.lessons || []).length + 1}`,
            title: `Lección ${(m.lessons || []).length + 1}`,
            duration: '10 min',
            video_url: '',
            resource_url: ''
          };
          return { ...m, lessons: [...(m.lessons || []), newLesson] };
        }
        return m;
      })
    });
  };

  const handleRemoveLesson = (moduleIndexOrId: number | string, lessonIndexOrId: number | string) => {
    setProductForm({
      ...productForm,
      curriculum: productForm.curriculum.map((m, i) => {
        const isTarget = typeof moduleIndexOrId === 'number' ? i === moduleIndexOrId : m.id === moduleIndexOrId;
        if (isTarget) {
          return { 
            ...m, 
            lessons: (m.lessons || []).filter((l: any, li: number) => typeof lessonIndexOrId === 'number' ? li !== lessonIndexOrId : l.id !== lessonIndexOrId) 
          };
        }
        return m;
      })
    });
  };

  const handleUpdateLesson = (moduleIndexOrId: number | string, lessonIndexOrId: number | string, field: string, val: string) => {
    setProductForm({
      ...productForm,
      curriculum: productForm.curriculum.map((m, i) => {
        const isTarget = typeof moduleIndexOrId === 'number' ? i === moduleIndexOrId : m.id === moduleIndexOrId;
        if (isTarget) {
          return {
            ...m,
            lessons: (m.lessons || []).map((l: any, li: number) => {
              const isLesTarget = typeof lessonIndexOrId === 'number' ? li === lessonIndexOrId : l.id === lessonIndexOrId;
              return isLesTarget ? { ...l, [field]: val } : l;
            })
          };
        }
        return m;
      })
    });
  };

  const handleAddAttachment = () => {
    const newAttach = {
      id: `att-${Date.now()}`,
      name: `Recurso Adicional ${(productForm.attachments || []).length + 1}`,
      url: ''
    };
    setProductForm({
      ...productForm,
      attachments: [...(productForm.attachments || []), newAttach]
    });
  };

  const handleRemoveAttachment = (attachId: string) => {
    setProductForm({
      ...productForm,
      attachments: (productForm.attachments || []).filter(a => a.id !== attachId)
    });
  };

  const handleUpdateAttachment = (attachId: string, field: 'name' | 'url', value: string) => {
    setProductForm({
      ...productForm,
      attachments: (productForm.attachments || []).map(a => a.id === attachId ? { ...a, [field]: value } : a)
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = productForm.slug || productForm.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const parsedPrice = typeof productForm.price === 'string'
        ? (parseFloat(productForm.price.replace(',', '.')) || 0)
        : (Number(productForm.price) || 0);

      const parsedOriginalPrice = productForm.original_price
        ? (typeof productForm.original_price === 'string'
            ? (parseFloat(productForm.original_price.replace(',', '.')) || null)
            : Number(productForm.original_price))
        : null;

      const parsedMonthlyPrice = productForm.monthly_price
        ? (typeof productForm.monthly_price === 'string'
            ? (parseFloat(productForm.monthly_price.replace(',', '.')) || null)
            : Number(productForm.monthly_price))
        : null;

      const finalCategory = isCustomCategory && customCategoryInput.trim() 
        ? customCategoryInput.trim() 
        : (productForm.category || 'Google Sheets');

      const deliveryUrl = productForm.delivery_type === 'FILE_DOWNLOAD' 
        ? (productForm.file_url || productForm.template_url || null)
        : (productForm.template_url || null);

      const payload: any = {
        title: productForm.title,
        slug,
        description: productForm.description,
        price: parsedPrice,
        original_price: parsedOriginalPrice,
        monthly_price: parsedMonthlyPrice,
        category: finalCategory,
        delivery_type: productForm.delivery_type,
        template_url: deliveryUrl,
        demo_url: productForm.demo_url || null,
        tutorial_url: productForm.tutorial_url || null,
        requires_license: productForm.requires_license,
        has_trial: productForm.has_trial,
        default_trial_days: productForm.has_trial ? (Number(productForm.default_trial_days) || 14) : 0,
        // Promociones y límites
        offer_end_date: productForm.offer_end_date ? new Date(productForm.offer_end_date).toISOString() : null,
        is_free_temporary: productForm.is_free_temporary,
        free_until_date: productForm.free_until_date ? new Date(productForm.free_until_date).toISOString() : null,
        promotion_badge: productForm.promotion_badge || null,
        curriculum: productForm.curriculum || [],
        is_active: true
      };

      if (productForm.id) {
        payload.id = productForm.id;
      }

      await saveProductAction(payload);
      setShowProductModal(false);
      showToast(productForm.id ? 'Producto / Recurso actualizado.' : 'Producto / Recurso creado exitosamente.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar producto', true);
    }
  };

  const handleProductSubmit = handleSaveProduct;

  // Manejo de Cupones de Descuento
  const loadCouponsData = async () => {
    try {
      const data = await getAdminCouponsAction();
      setCoupons(data || []);
    } catch (err) {
      console.warn('Error loading coupons:', err);
    }
  };

  const handleOpenCreateCoupon = () => {
    setCouponForm({
      id: '',
      code: '',
      discountType: 'percentage',
      discountValue: '',
      expiresAt: '',
      maxUses: '',
      productId: '',
      isActive: true
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const val = parseFloat(String(couponForm.discountValue).replace(',', '.')) || 0;
      const maxU = couponForm.maxUses ? parseInt(String(couponForm.maxUses)) : undefined;

      await saveCouponAction({
        id: couponForm.id || undefined,
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: val,
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : undefined,
        maxUses: maxU,
        productId: couponForm.productId || undefined,
        isActive: couponForm.isActive
      });

      setShowCouponModal(false);
      showToast('Cupón de descuento guardado exitosamente.');
      await loadCouponsData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar cupón', true);
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Cupón de Descuento',
      message: '¿Estás seguro de que deseas eliminar este cupón? Los clientes ya no podrán canjearlo.',
      confirmText: 'Eliminar Cupón',
      isDestructive: true,
      onConfirm: async () => {
        await deleteCouponAction(couponId);
        showToast('Cupón eliminado.');
        await loadCouponsData();
      }
    });
  };

  const handleToggleCoupon = async (couponId: string, currentActive: boolean) => {
    try {
      await toggleCouponActiveAction(couponId, !currentActive);
      showToast(`Cupón ${!currentActive ? 'activado' : 'desactivado'}.`);
      await loadCouponsData();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Producto del Catálogo',
      message: '¿Estás seguro de eliminar este producto? No estará disponible para nuevas ventas.',
      confirmText: 'Eliminar Producto',
      isDestructive: true,
      onConfirm: async () => {
        await deleteProductAction(productId);
        setShowProductModal(false);
        showToast('Producto eliminado.');
        loadAllData();
      }
    });
  };

  // Manejo de Usuarios
  const openCreateUser = () => {
    setUserForm({
      id: '',
      email: '',
      fullName: '',
      phone: '',
      role: 'customer',
      password: ''
    });
    setShowUserModal(true);
  };

  const openEditUser = (user: any) => {
    setUserForm({
      id: user.id,
      email: user.email,
      fullName: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      password: ''
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAdminUserAction(userForm);
      setShowUserModal(false);
      showToast(userForm.id ? 'Perfil de usuario actualizado.' : 'Usuario registrado exitosamente.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar usuario', true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario del Sistema',
      message: '¿Estás seguro de eliminar esta cuenta? Se revocarán todos sus accesos.',
      confirmText: 'Eliminar Usuario',
      isDestructive: true,
      onConfirm: async () => {
        await deleteAdminUserAction(userId);
        setShowUserModal(false);
        showToast('Usuario eliminado.');
        loadAllData();
      }
    });
  };

  // Manejo de Blog / Posts
  const openCreatePost = () => {
    setPostForm({
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Tutoriales',
      is_published: true
    });
    setShowPostModal(true);
  };

  const openEditPost = (p: any) => {
    setPostForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      content: p.content || '',
      category: p.category || 'Tutoriales',
      is_published: p.is_published !== false
    });
    setShowPostModal(true);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = postForm.slug || postForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      await savePostAction({
        ...postForm,
        slug
      });
      setShowPostModal(false);
      showToast(postForm.id ? 'Artículo actualizado.' : 'Artículo publicado en el blog.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar artículo', true);
    }
  };

  const handleDeletePost = (postId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Artículo del Blog',
      message: '¿Estás seguro de eliminar este artículo? Se eliminará de la base de datos.',
      confirmText: 'Eliminar Post',
      isDestructive: true,
      onConfirm: async () => {
        await deletePostAction(postId);
        setShowPostModal(false);
        showToast('Artículo eliminado.');
        loadAllData();
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-7 xl:p-8">
      
      {/* Header Superior */}
      <div className="w-full max-w-7xl 2xl:max-w-[1720px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center border border-slate-800 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Panel de Administración</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control integral de base de datos PostgreSQL: licencias, órdenes, usuarios, afiliados, catálogo y blog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadFullWorkspace(true)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-2xs"
            title="Recargar datos desde la base de datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refrescar</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {actionFeedback && (
        <div className="w-full max-w-7xl 2xl:max-w-[1720px] mx-auto mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Navegación por Pestañas (Cobertura Total y Responsive sin Scrollbar horizontal molesto) */}
      <div className="w-full max-w-7xl 2xl:max-w-[1720px] mx-auto mt-5 sm:mt-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar sm:flex-wrap text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            Resumen General
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'licenses'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Licencias</span>
            {loading ? (
              <span className="w-5 h-3.5 bg-slate-300 dark:bg-slate-800 animate-pulse rounded-full inline-block" />
            ) : (
              <span className="opacity-80">({stats?.activeLicenses !== undefined ? (stats.activeLicenses + (stats.trialLicenses || 0)) : licenses.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Órdenes & Ventas</span>
            {loading ? (
              <span className="w-5 h-3.5 bg-slate-300 dark:bg-slate-800 animate-pulse rounded-full inline-block" />
            ) : (
              <span className="opacity-80">({stats?.totalOrders !== undefined ? stats.totalOrders : orders.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Usuarios & Clientes</span>
            {loading ? (
              <span className="w-5 h-3.5 bg-slate-300 dark:bg-slate-800 animate-pulse rounded-full inline-block" />
            ) : (
              <span className="opacity-80">({stats?.totalCustomers !== undefined ? stats.totalCustomers : usersList.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'partners'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            Vendedores & Revendedores
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Catálogo & Cursos</span>
            {loading ? (
              <span className="w-5 h-3.5 bg-slate-300 dark:bg-slate-800 animate-pulse rounded-full inline-block" />
            ) : (
              <span className="opacity-80">({stats?.totalProducts !== undefined ? stats.totalProducts : products.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-pink-500" />
            <span>Cupones & Promos</span>
            <span className="opacity-80">({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Blog & SEO</span>
            {loading ? (
              <span className="w-5 h-3.5 bg-slate-300 dark:bg-slate-800 animate-pulse rounded-full inline-block" />
            ) : (
              <span className="opacity-80">({stats?.totalPosts !== undefined ? stats.totalPosts : posts.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Visibilidad & Espacio</span>
          </button>
        </div>
      </div>

      {/* Contenido de Pestañas */}
      <div className="w-full max-w-7xl 2xl:max-w-[1720px] mx-auto mt-5 sm:mt-6">

        {/* ---------------- PESTAÑA 1: RESUMEN / KPIS ---------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-xs font-medium text-slate-500">Facturación total</span>
                {loading ? (
                  <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">USD</span>
                  </h3>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {loading ? 'Cargando órdenes...' : `${orders.length} órdenes registradas`}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-xs font-medium text-slate-500">Comisiones por liquidar</span>
                {loading ? (
                  <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ${stats?.pendingCommissions ? stats.pendingCommissions.toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">USD</span>
                  </h3>
                )}
                <p className="text-xs text-slate-400 mt-1">Pendiente a vendedores</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-xs font-medium text-slate-500">Licencias activas</span>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats?.activeLicenses ?? 0}
                  </h3>
                )}
                <p className="text-xs text-slate-400 mt-1">Acceso de pago vigente</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-xs font-medium text-slate-500">Usuarios registrados</span>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {usersList.length}
                  </h3>
                )}
                <p className="text-xs text-slate-400 mt-1">Clientes, afiliados y staff</p>
              </div>
            </div>

            {/* Accesos Directos Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              <button
                onClick={() => { setActiveTab('orders'); setShowOrderModal(true); }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-left transition-all shadow-2xs hover:shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">Registrar Venta</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Genera orden y licencia.</p>
              </button>

              <button
                onClick={() => { setActiveTab('licenses'); setShowLicenseModal(true); }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-left transition-all shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">Generar Licencia</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Emite clave manual o trial.</p>
              </button>

              <button
                onClick={openCreateCourse}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-left transition-all shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-purple-600">Crear Curso</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Publica clases gratis o Pro.</p>
              </button>

              <button
                onClick={() => { setActiveTab('users'); openCreateUser(); }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-left transition-all shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">Crear Usuario</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Registra cliente o staff.</p>
              </button>

              <button
                onClick={() => { setActiveTab('posts'); openCreatePost(); }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-left transition-all shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">Publicar Artículo</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Nuevo post con SEO.</p>
              </button>
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 2: GESTIÓN DE LICENCIAS ---------------- */}
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por clave, cliente, email o producto..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                />
              </form>

              {/* Pestañas Rápidas de Filtro de Estado con Contadores */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shrink-0">
                  {[
                    { id: 'all', label: 'Todas', count: licenses.length },
                    { id: 'active', label: 'Activas', count: licenses.filter(l => l.status === 'active').length, dot: 'bg-emerald-500' },
                    { id: 'trial', label: 'Trials', count: licenses.filter(l => l.status === 'trial').length, dot: 'bg-amber-500' },
                    { id: 'expired', label: 'Expiradas', count: licenses.filter(l => l.status === 'expired').length, dot: 'bg-red-500' },
                    { id: 'suspended', label: 'Suspendidas', count: licenses.filter(l => l.status === 'suspended').length, dot: 'bg-slate-400' },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === f.id
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />}
                      <span>{f.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        statusFilter === f.id 
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                          : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowSdkModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 border border-slate-200/80 dark:border-slate-700 cursor-pointer shadow-2xs"
                  title="Obtener código de protección para Google Sheets, JS o Python"
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>SDK</span>
                </button>

                <button
                  onClick={() => setShowLicenseModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Licencia</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <Key className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold">No hay licencias que coincidan</h4>
                <p className="text-xs text-slate-500 mt-1">Intenta con otro término de búsqueda o genera una nueva licencia.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredLicenses.map((lic) => {
                  const isTrial = lic.status === 'trial';
                  const isExpired = lic.status === 'expired';
                  const isActive = lic.status === 'active';
                  const maxAct = lic.max_activations || 1;
                  const curAct = lic.allowed_origins?.length || lic.current_activations || 0;

                  return (
                    <div 
                      key={lic.id}
                      className="group bg-white dark:bg-slate-900/90 hover:bg-slate-50/50 dark:hover:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                    >
                      {/* Información Principal de la Licencia */}
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Fila Superior: Clave, Estado, Producto, Slots */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleCopy(lic.license_key)}
                            title="Copiar Clave de Licencia"
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 transition-all cursor-pointer shadow-2xs"
                          >
                            <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>{lic.license_key}</span>
                            <Copy className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
                          </button>
                          {copiedKey === lic.license_key && (
                            <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs animate-in fade-in zoom-in-90">Copiado</span>
                          )}

                          {/* Badge de Estado Profesional y Ultra Claro */}
                          {lic.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>ACTIVA</span>
                            </span>
                          ) : isTrial ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>PRUEBA TRIAL</span>
                            </span>
                          ) : lic.status === 'suspended' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800 shadow-2xs">
                              <Ban className="w-3 h-3 text-red-600 dark:text-red-400" />
                              <span>SUSPENDIDA</span>
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>EXPIRADA</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300">
                              <span>{lic.status}</span>
                            </span>
                          )}

                          {/* Título del Producto */}
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 truncate max-w-[220px]">
                            {lic.product?.title || 'Producto Sin Nombre'}
                          </span>

                          {/* Cupos / Slots */}
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                            <Monitor className="w-3 h-3 text-slate-500" />
                            <span>{curAct} / {maxAct} PC(s)</span>
                          </span>
                        </div>

                        {/* Fila del Cliente y Contacto */}
                        {(() => {
                          const clientName = lic.metadata?.client_name || (lic.customer?.full_name && lic.customer.full_name !== 'Admin / Tecnonets' ? lic.customer.full_name : 'Cliente Directo');
                          const hasCustomName = Boolean(lic.metadata?.client_name && lic.customer?.full_name !== lic.metadata?.client_name);
                          const clientEmail = lic.metadata?.client_email !== undefined 
                            ? (lic.metadata.client_email || null) 
                            : (lic.customer?.email && lic.customer?.email !== 'technonetsoluciones@gmail.com' ? lic.customer.email : null);
                          const clientPhone = lic.metadata?.client_phone || lic.customer?.phone;
                          const countryInfo = getCountryInfoFromPhone(clientPhone);

                          return (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                              {/* Nombre del Cliente */}
                              <div className="inline-flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>Cliente:</span>
                                <strong className="text-slate-900 dark:text-white font-semibold">{clientName}</strong>
                                {clientEmail && (
                                  <span className="text-slate-400 font-normal">({clientEmail})</span>
                                )}
                                {hasCustomName && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                                    Manual
                                  </span>
                                )}
                              </div>

                              {/* Teléfono / WhatsApp con Bandera */}
                              {clientPhone && (
                                <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                  <span>WhatsApp:</span>
                                  <strong className="text-slate-800 dark:text-slate-200 font-mono inline-flex items-center gap-1">
                                    {countryInfo?.flag && <span className="text-sm leading-none" title={countryInfo.name}>{countryInfo.flag}</span>}
                                    <span>{clientPhone}</span>
                                  </strong>
                                </div>
                              )}

                              {lic.seller && (
                                <span className="text-[11px]">Vendedor: <strong>{lic.seller.full_name || lic.seller.email}</strong></span>
                              )}
                            </div>
                          );
                        })()}

                        {/* Vigencia / Notas */}
                        <div className="flex flex-wrap items-center gap-3">
                          {lic.expires_at && !isTrial && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
                              <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span>Vence: {new Date(lic.expires_at).toLocaleDateString()} ({Math.max(0, Math.ceil((new Date(lic.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días restantes)</span>
                            </span>
                          )}

                          {lic.trial_ends_at && isTrial && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Trial vence: {new Date(lic.trial_ends_at).toLocaleDateString()} ({Math.max(0, Math.ceil((new Date(lic.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días)</span>
                            </span>
                          )}

                          {lic.metadata?.notes && (
                            <span className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded border border-slate-200/40 dark:border-slate-700/40">
                              Nota: {lic.metadata.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Barra de Acciones Moderna y Organizada */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                        {(() => {
                          const clientPhone = lic.metadata?.client_phone || lic.customer?.phone;
                          const clientName = lic.metadata?.client_name || lic.customer?.full_name || 'Cliente';
                          const waLink = clientPhone ? generateWhatsAppLicenseLink({
                            phone: clientPhone,
                            clientName: clientName,
                            licenseKey: lic.license_key,
                            productTitle: lic.product?.title || 'Software',
                            status: lic.status,
                            expiresAt: lic.expires_at,
                            trialEndsAt: lic.trial_ends_at
                          }) : null;

                          if (!waLink) return null;

                          return (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow hover:-translate-y-0.5 cursor-pointer"
                              title="Enviar clave y datos de activación por WhatsApp al cliente"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          );
                        })()}

                        <button
                          onClick={() => {
                            const trialDate = lic.trial_ends_at ? new Date(lic.trial_ends_at).toISOString().split('T')[0] : '';
                            const expDate = lic.expires_at ? new Date(lic.expires_at).toISOString().split('T')[0] : '';
                            const rawPhone = lic.metadata?.client_phone || lic.customer?.phone || '';
                            const { countryDialCode, localPhone } = parsePhoneAndCountry(rawPhone);
                            const rawName = lic.metadata?.client_name || (lic.customer?.full_name !== 'Admin / Tecnonets' ? lic.customer?.full_name : '') || '';
                            const rawEmail = lic.metadata?.client_email !== undefined 
                              ? (lic.metadata.client_email || '')
                              : (lic.customer?.email && lic.customer?.email !== 'technonetsoluciones@gmail.com' ? lic.customer.email : '');

                            setEditingLicense({
                              ...lic,
                              productId: lic.product?.id || lic.product_id,
                              billingCycle: lic.billing_cycle || (lic.is_trial ? 'trial' : 'lifetime'),
                              exactExpiryDate: trialDate || expDate || '',
                              sellerId: lic.seller_id || lic.seller?.id || '',
                              newManualOrigin: '',
                              assignType: (lic.customer?.id && !lic.metadata?.client_name) ? 'registered' : 'manual',
                              selectedCustomerId: lic.customer?.id || '',
                              customerName: rawName,
                              customerEmail: rawEmail,
                              customerCountryCode: countryDialCode,
                              customerLocalPhone: localPhone,
                              internalNotes: lic.metadata?.notes || ''
                            });
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar</span>
                        </button>

                        {lic.status === 'suspended' ? (
                          <button
                            onClick={() => handleRequestStatusChange(lic, 'active')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow cursor-pointer"
                            title="Reactivar licencia suspendida"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reactivar</span>
                          </button>
                        ) : lic.status === 'active' ? (
                          <button
                            onClick={() => handleRequestStatusChange(lic, 'suspended')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Suspender y bloquear acceso al software"
                          >
                            <Ban className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                            <span>Suspender</span>
                          </button>
                        ) : isTrial ? (
                          <button
                            onClick={() => handleRequestStatusChange(lic, 'active')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Convertir prueba trial en licencia activa oficial"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Activar Pro</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRequestStatusChange(lic, 'active')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Activar</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleViewLogs(lic)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                          title="Ver telemetría y logs de activación"
                        >
                          <Activity className="w-3.5 h-3.5 text-slate-500" />
                          <span>Logs</span>
                        </button>

                        {lic.customer?.id && (
                          <a
                            href={`/portal?asUser=${lic.customer.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-800/60"
                            title="Ver portal en vivo exactamente como este cliente"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Portal</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PESTAÑA 3: ÓRDENES & VENTAS (orders, order_items) ---------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registro de Órdenes y Facturación</h3>
                <p className="text-xs text-slate-500">Historial completo de ventas web, transferencias y generación de facturas.</p>
              </div>
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Registrar Venta / Orden</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold">No hay órdenes registradas aún</h4>
                <p className="text-xs text-slate-500 mt-1">Registra una venta manual o espera compras desde la tienda web.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {orders.map((ord) => {
                  const isCompleted = ord.status === 'completed';
                  const isRefunded = ord.status === 'refunded';

                  return (
                    <div 
                      key={ord.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {ord.order_number}
                          </span>

                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                            isRefunded ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {ord.status}
                          </span>

                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            ${ord.total_amount} {ord.currency}
                          </span>

                          <span className="text-slate-400">
                            Pasarela: <strong>{ord.payment_gateway}</strong>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-slate-500">
                          <span>Cliente: <strong className="text-slate-700 dark:text-slate-300">{ord.customer?.full_name || ord.customer?.email}</strong></span>
                          {ord.seller && <span>Vendedor: <strong>{ord.seller.full_name || ord.seller.email}</strong> ({ord.referral_code})</span>}
                          <span>Fecha: {new Date(ord.created_at).toLocaleString()}</span>
                        </div>

                        {/* Productos en la Orden */}
                        {ord.items && ord.items.length > 0 && (
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            {ord.items.map((it: any) => (
                              <span key={it.id} className="text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                📦 {it.product?.title} (Clave: {it.license?.license_key || 'N/A'})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Acciones de Orden */}
                      <div className="flex items-center gap-1.5 self-end lg:self-center">
                        {isCompleted && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'refunded')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold rounded transition-colors"
                          >
                            Reembolsar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PESTAÑA 4: USUARIOS & CLIENTES (profiles, user_roles) ---------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Usuarios y Perfiles Registrados</h3>
                <p className="text-xs text-slate-500">Administra cuentas de clientes, vendedores, staff y administradores.</p>
              </div>
              <button
                onClick={openCreateUser}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Usuario</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="p-4 animate-pulse space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ))
                ) : usersList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No hay usuarios registrados aún.
                  </div>
                ) : (
                  usersList.map((usr) => (
                  <div key={usr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {usr.full_name || 'Sin nombre'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          usr.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' :
                          usr.role === 'partner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                          usr.role === 'staff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {usr.role}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-slate-500">
                        <span>Email: <strong className="text-slate-700 dark:text-slate-300">{usr.email}</strong></span>
                        {usr.phone && <span>Tel: {usr.phone}</span>}
                        <span>Licencias: <strong>{usr.licensesCount}</strong></span>
                        <span>Total Comprado: <strong>${usr.totalSpent} USD</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`/portal?asUser=${usr.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded flex items-center gap-1 transition-colors"
                        title="Ver portal en vivo de este cliente"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Ver Portal</span>
                      </a>

                      <button
                        onClick={() => handleResendAccess(usr.email)}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold rounded flex items-center gap-1 transition-colors"
                        title="Reenviar enlace de acceso directo al cliente"
                      >
                        <Mail className="w-3 h-3 text-blue-500" />
                        <span>Reenviar Acceso</span>
                      </button>

                      <button
                        onClick={() => openEditUser(usr)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* ---------------- PESTAÑA 5: VENDEDORES & REVENDEDORES B2B (partner_agreements, commissions) ---------------- */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vendedores & Revendedores Mayoristas</h3>
                <p className="text-xs text-slate-500">Administra acuerdos a comisión %, precios fijos B2B y redes de líderes.</p>
              </div>
              <button
                onClick={() => setShowPartnerModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Vendedor</span>
              </button>
            </div>

            {/* Acuerdos Activos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {partnersData.agreements.map((agr: any) => {
                const isWholesale = Number(agr.fixed_commission_amount || 0) > 0;

                return (
                  <div key={agr.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded">
                          {agr.referral_code}
                        </span>
                        <span className={`text-xs font-semibold ${isWholesale ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isWholesale ? `$${agr.fixed_commission_amount} USD Precio Fijo B2B` : `${agr.commission_percentage}% Comisión`}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{agr.seller?.full_name || 'Sin nombre'}</h4>
                        <p className="text-xs text-slate-400">{agr.seller?.email}</p>
                        {agr.seller?.phone && <p className="text-[11px] text-slate-500">Tel: {agr.seller.phone}</p>}
                      </div>

                      {agr.parent_seller && (
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded text-[11px] text-purple-700 dark:text-purple-300">
                          Líder de Red: <strong>{agr.parent_seller.full_name || agr.parent_seller.email}</strong> (5% Tier 2)
                        </div>
                      )}

                      {/* Datos de Cobro */}
                      <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Cuenta para Pagos:</span>
                        {agr.payout_method === 'nequi' && agr.payout_details?.accountNumber ? (
                          <p className="text-slate-600 dark:text-slate-400">
                            Nequi: <strong>{agr.payout_details.accountNumber}</strong> (CC: {agr.payout_details.documentId || 'N/A'})
                          </p>
                        ) : agr.payout_method === 'bancolombia' && agr.payout_details?.accountNumber ? (
                          <p className="text-slate-600 dark:text-slate-400">
                            {agr.payout_details.bankName || 'Banco'}: <strong>{agr.payout_details.accountNumber}</strong> ({agr.payout_details.accountType})
                          </p>
                        ) : agr.payout_method === 'paypal' && agr.payout_details?.paypalEmail ? (
                          <p className="text-slate-600 dark:text-slate-400">
                            PayPal: <strong>{agr.payout_details.paypalEmail}</strong>
                          </p>
                        ) : (
                          <p className="text-slate-400 italic">No ha registrado cuenta aún.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleDeletePartner(agr.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historial de Comisiones */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-3">Registro de Liquidaciones</h4>
              {partnersData.commissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No hay comisiones registradas aún.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {partnersData.commissions.map((comm: any) => (
                    <div key={comm.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          ${comm.amount} {comm.currency}
                        </p>
                        <p className="text-slate-400">
                          Vendedor: {comm.seller?.full_name || comm.seller?.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          comm.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {comm.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                        {comm.status === 'pending' && (
                          <button
                            onClick={() => handleSettleCommission(comm.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded"
                          >
                            Marcar Pagada
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 6: CATÁLOGO DE PRODUCTOS (products) ---------------- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catálogo de Productos</h3>
                <p className="text-xs text-slate-500">Gestión de plantillas, archivos y servicios en PostgreSQL.</p>
              </div>
              <button
                onClick={openCreateProduct}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Producto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse h-36 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  No hay productos registrados aún.
                </div>
              ) : (
                products.map((prod) => (
                <div key={prod.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prod.category}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        ${prod.price} <span className="text-[10px] font-normal text-slate-400">USD</span>
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{prod.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleProductActive(prod.id, prod.is_active !== false)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          prod.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                        title="Haz clic para alternar visibilidad de este producto en el catálogo y portal"
                      >
                        {prod.is_active !== false ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                        <span>{prod.is_active !== false ? 'Visible' : 'Oculto'}</span>
                      </button>
                      <span className="text-[10px] text-slate-400">
                        {prod.delivery_type?.startsWith('COURSE') ? '🎓 Curso' : '📦 Plantilla'}
                      </span>
                    </div>

                    <button
                      onClick={() => openEditProduct(prod)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

        {/* ---------------- PESTAÑA: CUPONES & PROMOCIONES (coupons) ---------------- */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-pink-500" />
                  <span>Motor de Cupones de Descuento & Promociones</span>
                </h3>
                <p className="text-xs text-slate-500">Crea códigos de descuento en porcentaje (%) o monto fijo ($ USD) con límites de uso y fechas de expiración.</p>
              </div>
              <button
                onClick={handleOpenCreateCoupon}
                className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Cupón</span>
              </button>
            </div>

            {/* Listado de Cupones */}
            {coupons.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <Ticket className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2.5" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay cupones creados aún</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Crea tu primer código promocional para incentivar compras en lanzamientos o campañas de marketing.
                </p>
                <button
                  onClick={handleOpenCreateCoupon}
                  className="mt-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Primer Cupón</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {coupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                  const isExhausted = c.maxUses && c.usedCount >= c.maxUses;
                  const isCopied = copiedKey === c.code;

                  return (
                    <div 
                      key={c.id}
                      className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        !c.isActive || isExpired || isExhausted
                          ? 'border-slate-200 dark:border-slate-800 opacity-70'
                          : 'border-pink-200/70 dark:border-pink-900/40 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold font-mono px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              <span>{c.code}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(c.code);
                                setCopiedKey(c.code);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                              title="Copiar código"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            !c.isActive 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              : isExpired
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : isExhausted
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {!c.isActive ? 'Inactivo' : isExpired ? 'Expirado' : isExhausted ? 'Agotado' : 'Activo'}
                          </span>
                        </div>

                        {/* Valor del Descuento */}
                        <div className="space-y-1 my-2">
                          <p className="text-xl font-black text-slate-900 dark:text-white">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} USD OFF`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {c.productId ? `Aplica a: ${products.find(p => p.id === c.productId)?.title || 'Producto específico'}` : 'Aplica a: Todos los productos'}
                          </p>
                        </div>

                        {/* Metadatos de uso y vencimiento */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="block text-[10px] text-slate-400">Usos:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : '(Ilimitado)'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Vence:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Sin caducidad'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones del Cupón */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c.id, c.isActive)}
                          className={`text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            c.isActive ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700 font-bold'
                          }`}
                        >
                          {c.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          <span>{c.isActive ? 'Desactivar' : 'Activar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PESTAÑA 7: BLOG & ARTÍCULOS SEO (posts) ---------------- */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gestión de Blog y Artículos SEO</h3>
                <p className="text-xs text-slate-500">Crea y publica artículos para posicionamiento orgánico en Google.</p>
              </div>
              <button
                onClick={openCreatePost}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Artículo</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold">No hay artículos publicados aún</h4>
                <p className="text-xs text-slate-500 mt-1">Crea tu primer post con el botón superior.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {posts.map((p) => (
                  <div 
                    key={p.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.is_published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {p.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-slate-400 font-mono text-[11px]">/blog/{p.slug}</p>
                      {p.excerpt && <p className="text-slate-500 line-clamp-1">{p.excerpt}</p>}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => openEditPost(p)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PESTAÑA 8: CONFIGURACIÓN DE VISIBILIDAD DEL PORTAL ---------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Control de Visibilidad del Espacio & Pestañas</span>
              </h3>
              <p className="text-xs text-slate-500">
                Administra en tiempo real qué pestañas, cursos y recursos ven tus clientes al iniciar sesión.
              </p>
            </div>

            <form onSubmit={handleSaveWorkspaceSettings} className="space-y-4">
              {/* Tarjeta de Control de Pestañas */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Pestañas del Espacio de Usuario (/portal)
                </h4>

                {/* Switch 1: Herramientas & Licencias */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Pestaña "Mis Herramientas & Licencias"</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Muestra las plantillas de Google Sheets (/copy), claves de licencia y archivos descargables del cliente.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={workspaceSettings.show_tools_tab}
                      onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, show_tools_tab: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Switch 2: Academia & Cursos */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>Pestaña "Academia & Cursos"</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Muestra el catálogo de cursos interactivos, masterclasses, temarios y clases en video a los usuarios.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={workspaceSettings.show_courses_tab}
                      onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, show_courses_tab: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Switch 3: Guías & Recursos */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Pestaña "Guías & Recursos"</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Muestra guías rápidas, cheat sheets de fórmulas y documentación descargable.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={workspaceSettings.show_resources_tab}
                      onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, show_resources_tab: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Switch 4: Botón Tienda */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                      <span>Botón "Explorar Tienda" en Cabecera</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Muestra el botón de acceso directo a la tienda pública desde el espacio de usuario.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={workspaceSettings.show_store_button}
                      onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, show_store_button: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

              </div>

              {/* Personalización de Texto */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Nombre Oficial del Espacio
                </h4>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Título en Cabecera del Portal
                  </label>
                  <input
                    type="text"
                    required
                    value={workspaceSettings.custom_workspace_name}
                    onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, custom_workspace_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                    placeholder="Mi Espacio Tecnonets"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Configuración de Visibilidad</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ---------------- MODAL: REGISTRAR VENTA / ORDEN MANUAL ---------------- */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              Registrar Venta / Orden Manual
            </h3>
            <p className="text-xs text-slate-500 mb-4">Crea una orden, genera la clave de licencia y asigna comisiones.</p>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Producto</label>
                <select
                  required
                  value={orderForm.productId}
                  onChange={(e) => {
                    const sel = products.find(p => p.id === e.target.value);
                    setOrderForm({
                      ...orderForm,
                      productId: e.target.value,
                      amount: sel ? Number(sel.price) : orderForm.amount
                    });
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (${p.price} USD)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Monto Pagado ($ USD)</label>
                  <PriceInput
                    value={orderForm.amount}
                    onChange={(val) => setOrderForm({ ...orderForm, amount: val })}
                    placeholder="49.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Método de Pago</label>
                  <select
                    value={orderForm.paymentGateway}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentGateway: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="MANUAL_TRANSFER">Transferencia / Bancolombia</option>
                    <option value="NEQUI_DAVIPLATA">Nequi / Daviplata</option>
                    <option value="STRIPE">Stripe / Tarjeta</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="WOMPI">Wompi / PSE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Correo del Cliente</label>
                <input
                  type="email"
                  required
                  placeholder="comprador@empresa.com"
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Mario Gómez"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Código de Referido (Opcional)</label>
                  <input
                    type="text"
                    placeholder="CARLOS20"
                    value={orderForm.referralCode}
                    onChange={(e) => setOrderForm({ ...orderForm, referralCode: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
              >
                Completar Venta y Generar Licencia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREAR LICENCIA MANUAL PROFESIONAL ---------------- */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in-0 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-4 sm:p-5 shadow-2xl relative my-auto max-h-[96vh] overflow-y-auto">
            <button
              onClick={() => setShowLicenseModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Compacto del Modal */}
            <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Generar Licencia de Software</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/60 dark:border-blue-900/60">
                    Admin
                  </span>
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateLicenseSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Columna Izquierda: Parámetros del Producto y Licencia */}
                <div className="space-y-2.5">
                  {/* Fila: Producto Asignado y Cupos */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Producto Asignado <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={newLicForm.productId}
                        onChange={(val) => setNewLicForm({ ...newLicForm, productId: val })}
                        placeholder="Seleccionar..."
                        options={products.map(p => ({
                          value: p.id,
                          label: p.title,
                          badge: `$${p.price}`,
                          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                          icon: <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        }))}
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                        <span>Cupos (PCs)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Máx 100</span>
                      </label>
                      <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs h-[38px] justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Number(newLicForm.maxActivations) || 1;
                            if (cur > 1) setNewLicForm({ ...newLicForm, maxActivations: cur - 1 });
                          }}
                          disabled={(newLicForm.maxActivations || 1) <= 1}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={newLicForm.maxActivations}
                          onChange={(e) => setNewLicForm({ ...newLicForm, maxActivations: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                          className="w-10 text-center font-mono font-bold text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Number(newLicForm.maxActivations) || 1;
                            if (cur < 100) setNewLicForm({ ...newLicForm, maxActivations: cur + 1 });
                          }}
                          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. MODALIDAD DE VIGENCIA */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Modalidad de Vigencia
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setNewLicForm({ ...newLicForm, licenseType: 'lifetime', exactExpiryDate: '' })}
                        className={`py-1.5 px-1 text-center font-bold rounded-lg text-[11px] transition-all cursor-pointer ${
                          newLicForm.licenseType === 'lifetime'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Vitalicia
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          setNewLicForm({ ...newLicForm, licenseType: 'subscription', exactExpiryDate: d.toISOString().split('T')[0] });
                        }}
                        className={`py-1.5 px-1 text-center font-bold rounded-lg text-[11px] transition-all cursor-pointer ${
                          newLicForm.licenseType === 'subscription'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Temporal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 14);
                          setNewLicForm({ ...newLicForm, licenseType: 'trial', exactExpiryDate: d.toISOString().split('T')[0] });
                        }}
                        className={`py-1.5 px-1 text-center font-bold rounded-lg text-[11px] transition-all cursor-pointer ${
                          newLicForm.licenseType === 'trial'
                            ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Prueba (Trial)
                      </button>
                    </div>
                  </div>

                  {/* Selector de Fecha Estilizado para Licencias Temporales / Trial */}
                  {newLicForm.licenseType !== 'lifetime' && (
                    <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/70 dark:border-blue-900/40 space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 dark:text-blue-300">
                        Fecha de Vencimiento:
                      </label>
                      <DatePicker
                        value={newLicForm.exactExpiryDate}
                        onChange={(val) => {
                          if (!val) {
                            setNewLicForm({ ...newLicForm, exactExpiryDate: '', licenseType: 'lifetime' });
                          } else {
                            setNewLicForm({ ...newLicForm, exactExpiryDate: val });
                          }
                        }}
                        placeholder="Seleccionar fecha..."
                      />
                    </div>
                  )}

                  {/* Vendedor / Partner */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Vendedor / Partner Asociado (Opcional)
                    </label>
                    <CustomSelect
                      value={newLicForm.sellerId}
                      onChange={(val) => setNewLicForm({ ...newLicForm, sellerId: val })}
                      placeholder="Ninguno (Venta Directa / Tecnonets)"
                      options={[
                        { value: '', label: 'Ninguno (Venta Directa / Tecnonets)' },
                        ...partnersData.agreements.map((agr: any) => ({
                          value: agr.seller_id || agr.id,
                          label: `${agr.seller?.full_name || agr.seller?.email} (${agr.referral_code})`,
                          badge: `${agr.commission_percentage}%`,
                          badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }))
                      ]}
                    />
                  </div>

                  {/* Pre-vincular PC / Sheet ID inicial (Opcional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Vincular ID de PC, Dominio o Sheet Inicial (Opcional)
                    </label>
                    <div className="relative flex items-center">
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Ej. PC-UUID-8491 o ID_GOOGLE_SHEET"
                        value={newLicForm.newManualOrigin}
                        onChange={(e) => setNewLicForm({ ...newLicForm, newManualOrigin: e.target.value })}
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Datos del Cliente */}
                <div className="space-y-2.5 bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Datos del Cliente</span>
                      </span>
                      <div className="inline-flex p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setNewLicForm({ ...newLicForm, assignType: 'manual', selectedUserId: '' })}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            newLicForm.assignType === 'manual'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Directo
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewLicForm({ ...newLicForm, assignType: 'registered' })}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            newLicForm.assignType === 'registered'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Registrado
                        </button>
                      </div>
                    </div>

                    {newLicForm.assignType === 'registered' && (
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Cliente Registrado
                        </label>
                        <CustomSelect
                          value={newLicForm.selectedUserId}
                          onChange={(uid) => {
                            const userObj = usersList.find(u => u.id === uid);
                            const parsed = parsePhoneAndCountry(userObj?.phone || '');
                            setNewLicForm({
                              ...newLicForm,
                              selectedUserId: uid,
                              customerEmail: userObj?.email || '',
                              customerName: userObj?.full_name || '',
                              customerCountryCode: parsed.countryDialCode,
                              customerLocalPhone: parsed.localPhone
                            });
                          }}
                          placeholder="Seleccionar cliente..."
                          options={[
                            { value: '', label: 'Seleccionar cliente...' },
                            ...usersList.map(u => ({
                              value: u.id,
                              label: u.full_name || u.email,
                              sublabel: u.email,
                              badge: u.role || 'cliente',
                              badgeColor: u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700',
                              icon: <Users className="w-3.5 h-3.5 text-blue-600" />
                            }))
                          ]}
                        />
                      </div>
                    )}

                    {/* Fila: Nombre y Correo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Nombre Completo
                        </label>
                        <div className="relative flex items-center">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Ej: Carlos Sanchez"
                            value={newLicForm.customerName}
                            onChange={(e) => setNewLicForm({ ...newLicForm, customerName: e.target.value })}
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Correo Electrónico
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                          <input
                            type="email"
                            placeholder="cliente@empresa.com"
                            value={newLicForm.customerEmail}
                            onChange={(e) => setNewLicForm({ ...newLicForm, customerEmail: e.target.value })}
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        WhatsApp / Teléfono
                      </label>
                      <CountryPhoneInput
                        countryCode={newLicForm.customerCountryCode}
                        localPhone={newLicForm.customerLocalPhone}
                        onCountryChange={(code) => setNewLicForm({ ...newLicForm, customerCountryCode: code })}
                        onPhoneChange={(phone) => setNewLicForm({ ...newLicForm, customerLocalPhone: phone })}
                        placeholder="321 588 2400"
                      />
                    </div>

                    {/* Nota Interna */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Nota Interna / Ref. Pago
                      </label>
                      <div className="relative flex items-center">
                        <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Ej: Pago WhatsApp Nequi #8491..."
                          value={newLicForm.internalNotes}
                          onChange={(e) => setNewLicForm({ ...newLicForm, internalNotes: e.target.value })}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {newLicForm.customerEmail.trim() && (
                    <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={newLicForm.sendEmailNotification}
                        onChange={(e) => setNewLicForm({ ...newLicForm, sendEmailNotification: e.target.checked })}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Enviar clave por correo al cliente
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Footer con Botones Compactos */}
              <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLicenseModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingLicense}
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingLicense ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generando clave...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Generar Clave</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREAR / EDITAR USUARIO ---------------- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              {userForm.id ? 'Editar Perfil de Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Administra credenciales y roles en PostgreSQL.</p>

            <form onSubmit={handleUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Correo Electrónico (Login)</label>
                <input
                  type="email"
                  required
                  disabled={!!userForm.id}
                  placeholder="usuario@dominio.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Andrés López"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+57 310..."
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Rol en la Plataforma</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                >
                  <option value="customer">Cliente (Acceso a /portal)</option>
                  <option value="partner">Vendedor / Afiliado (Acceso a /partner)</option>
                  <option value="staff">Staff / Soporte Técnico</option>
                  <option value="admin">Super Administrador (Control total)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  {userForm.id ? 'Cambiar Contraseña (Dejar vacío para no cambiarla)' : 'Contraseña Inicial'}
                </label>
                <input
                  type="password"
                  placeholder={userForm.id ? 'Nueva contraseña...' : 'Mínimo 6 caracteres'}
                  required={!userForm.id}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                {userForm.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(userForm.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Usuario</span>
                  </button>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  {userForm.id ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: NUEVO VENDEDOR & REVENDEDOR B2B ---------------- */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowPartnerModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Nuevo Vendedor o Revendedor Mayorista
            </h3>
            <p className="text-xs text-slate-500 mb-4">Configura si es afiliado a comisión % o distribuidor con precio fijo B2B.</p>

            <form onSubmit={handleCreatePartnerSubmit} className="space-y-3">
              {/* Selector de Modalidad */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPartnerAgreementType('percentage')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    partnerAgreementType === 'percentage'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Comisión Porcentual (%)
                </button>
                <button
                  type="button"
                  onClick={() => setPartnerAgreementType('wholesale')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    partnerAgreementType === 'wholesale'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Precio Fijo Mayorista (B2B)
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="vendedor@socio.com"
                  value={newPartnerForm.sellerEmail}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, sellerEmail: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Carlos"
                    value={newPartnerForm.sellerName}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, sellerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Código Referido</label>
                  <input
                    type="text"
                    required
                    placeholder="CARLOS20"
                    value={newPartnerForm.referralCode}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, referralCode: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {partnerAgreementType === 'percentage' ? (
                <div>
                  <label className="block text-xs font-medium mb-1">% de Comisión Directa</label>
                  <PriceInput
                    value={newPartnerForm.commissionPercentage}
                    onChange={(val) => setNewPartnerForm({ ...newPartnerForm, commissionPercentage: val })}
                    icon="percent"
                    currency="%"
                    placeholder="20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-1">Precio Fijo Mayorista por Licencia ($ USD)</label>
                  <PriceInput
                    value={newPartnerForm.fixedAmount}
                    onChange={(val) => setNewPartnerForm({ ...newPartnerForm, fixedAmount: val })}
                    placeholder="20.00"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">Líder de Red (Opcional - Tier 2)</label>
                <select
                  value={newPartnerForm.parentSellerId}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, parentSellerId: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  <option value="">Ninguno (Vendedor Independiente)</option>
                  {partnersData.agreements.map((agr: any) => (
                    <option key={agr.seller_id || agr.id} value={agr.seller_id || agr.seller?.id}>
                      {agr.seller?.full_name || agr.seller?.email} ({agr.referral_code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Crear Acuerdo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: EDITAR LICENCIA COMPLETO (SOPORTE TÉCNICO) ---------------- */}
      {editingLicense && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in-0 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-4 sm:p-5.5 shadow-2xl relative my-auto max-h-[96vh] overflow-y-auto">
            <button 
              onClick={() => setEditingLicense(null)} 
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Compacto del Modal */}
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Soporte y Configuración de Licencia
                </h3>
                <span className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                  {editingLicense.license_key}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveLicenseEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                
                {/* Columna Izquierda: Parámetros Técnicos y Dispositivos (6 cols) */}
                <div className="lg:col-span-6 space-y-2.5">
                  {/* Fila: Producto Asignado y Cupos */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Producto Asignado
                      </label>
                      <CustomSelect
                        value={editingLicense.productId}
                        onChange={(val) => setEditingLicense({ ...editingLicense, productId: val })}
                        placeholder="Seleccionar..."
                        options={products.map(p => ({
                          value: p.id,
                          label: p.title,
                          badge: `$${p.price}`,
                          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                          icon: <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        }))}
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                        <span>Cupos (PCs)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Máx 500</span>
                      </label>
                      <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs h-[38px] justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Number(editingLicense.max_activations) || 1;
                            if (cur > 1) setEditingLicense({ ...editingLicense, max_activations: cur - 1 });
                          }}
                          disabled={(editingLicense.max_activations || 1) <= 1}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={editingLicense.max_activations || 1}
                          onChange={(e) => setEditingLicense({ ...editingLicense, max_activations: Math.max(1, Math.min(500, Number(e.target.value) || 1)) })}
                          className="w-10 text-center font-mono font-bold text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Number(editingLicense.max_activations) || 1;
                            if (cur < 500) setEditingLicense({ ...editingLicense, max_activations: cur + 1 });
                          }}
                          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estado Operativo - Selector Visual por Píldoras */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Estado Operativo
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      {[
                        { id: 'active', label: 'Activa', icon: '🟢', color: 'text-emerald-700 dark:text-emerald-300' },
                        { id: 'trial', label: 'Trial', icon: '🟡', color: 'text-amber-700 dark:text-amber-300' },
                        { id: 'suspended', label: 'Bloqueada', icon: '🔴', color: 'text-red-700 dark:text-red-300' },
                        { id: 'expired', label: 'Expirada', icon: '⚪', color: 'text-slate-600 dark:text-slate-400' },
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            const nextStatus = st.id;
                            setEditingLicense({
                              ...editingLicense,
                              status: nextStatus,
                              billingCycle: nextStatus === 'trial' ? 'trial' : (nextStatus === 'active' ? 'lifetime' : editingLicense.billingCycle)
                            });
                          }}
                          className={`py-1.5 px-0.5 text-center font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            editingLicense.status === st.id
                              ? 'bg-white dark:bg-slate-800 shadow-xs ' + st.color
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span className="text-[10px]">{st.icon}</span>
                          <span>{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ciclo de Facturación - Selector Visual por Píldoras */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Ciclo de Facturación
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      {[
                        { id: 'lifetime', label: 'Vitalicia' },
                        { id: 'trial', label: 'Prueba' },
                        { id: 'monthly', label: 'Mensual' },
                        { id: 'yearly', label: 'Anual' },
                      ].map(cycle => (
                        <button
                          key={cycle.id}
                          type="button"
                          onClick={() => setEditingLicense({ ...editingLicense, billingCycle: cycle.id })}
                          className={`py-1.5 px-0.5 text-center font-bold rounded-lg text-[11px] transition-all cursor-pointer ${
                            (editingLicense.billingCycle || 'lifetime') === cycle.id
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {cycle.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector de Fecha de Vencimiento Estilizado */}
                  {(editingLicense.status === 'trial' || editingLicense.billingCycle === 'monthly' || editingLicense.billingCycle === 'yearly' || editingLicense.status === 'expired') && (
                    <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/70 dark:border-blue-900/40 space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 dark:text-blue-300">
                        Fecha de Vencimiento:
                      </label>
                      <DatePicker
                        value={editingLicense.exactExpiryDate || ''}
                        onChange={(val) => {
                          if (!val) {
                            setEditingLicense({
                              ...editingLicense,
                              exactExpiryDate: '',
                              billingCycle: 'lifetime',
                              status: 'active'
                            });
                          } else {
                            setEditingLicense({
                              ...editingLicense,
                              exactExpiryDate: val
                            });
                          }
                        }}
                        placeholder="Seleccionar fecha..."
                      />
                    </div>
                  )}

                  {/* Vendedor / Partner Asociado */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Vendedor / Partner Asociado
                    </label>
                    <CustomSelect
                      value={editingLicense.sellerId || ''}
                      onChange={(val) => setEditingLicense({ ...editingLicense, sellerId: val })}
                      placeholder="Ninguno (Venta Directa / Tecnonets)"
                      options={[
                        { value: '', label: 'Ninguno (Venta Directa / Tecnonets)' },
                        ...partnersData.agreements.map((agr: any) => ({
                          value: agr.seller_id || agr.id,
                          label: `${agr.seller?.full_name || agr.seller?.email} (${agr.referral_code})`,
                          badge: `${agr.commission_percentage}%`,
                          badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }))
                      ]}
                    />
                  </div>

                  {/* Lista de Dispositivos / Hojas Vinculadas Compacta */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-slate-500" />
                        <span>PCs Vinculados ({editingLicense.allowed_origins?.length || 0} de {editingLicense.max_activations || 1})</span>
                      </span>

                      {editingLicense.allowed_origins && editingLicense.allowed_origins.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleResetAllActivations(editingLicense.id)}
                          className="text-[10px] text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                        >
                          Liberar Cupos
                        </button>
                      )}
                    </div>

                    {(!editingLicense.allowed_origins || editingLicense.allowed_origins.length === 0) ? (
                      <p className="text-[11px] text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center">
                        La clave está disponible para activar en {editingLicense.max_activations || 1} computador(es).
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {editingLicense.allowed_origins.map((origin: string, idx: number) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-[11px] bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                            <span className="font-mono text-[10px] truncate">{origin}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOrigin(editingLicense.id, origin)}
                              className="text-[10px] text-red-600 hover:text-red-700 font-semibold cursor-pointer shrink-0"
                            >
                              Desvincular
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vincular Manualmente */}
                    <div className="relative flex items-center">
                      <Hash className="w-3 h-3 text-slate-400 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Vincular PC-UUID o Sheet ID..."
                        value={editingLicense.newManualOrigin || ''}
                        onChange={(e) => setEditingLicense({ ...editingLicense, newManualOrigin: e.target.value })}
                        className="w-full pl-7 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Datos del Cliente y Soporte (6 cols) */}
                <div className="lg:col-span-6 space-y-2.5 flex flex-col justify-between">
                  {/* 👤 ASIGNACIÓN Y DATOS DEL CLIENTE */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-slate-800">
                      <label className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Datos del Cliente</span>
                      </label>
                      
                      <div className="inline-flex p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setEditingLicense({ ...editingLicense, assignType: 'manual' })}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            editingLicense.assignType === 'manual'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Directo
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLicense({ ...editingLicense, assignType: 'registered' })}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            editingLicense.assignType === 'registered'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Registrado
                        </button>
                      </div>
                    </div>

                    {editingLicense.assignType === 'registered' && (
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Reasignar a Usuario Registrado:
                        </label>
                        <CustomSelect
                          value={editingLicense.selectedCustomerId || ''}
                          onChange={(uid) => {
                            const userObj = usersList.find(u => u.id === uid);
                            const parsed = parsePhoneAndCountry(userObj?.phone || '');
                            setEditingLicense({
                              ...editingLicense,
                              selectedCustomerId: uid,
                              customerEmail: userObj?.email || '',
                              customerName: userObj?.full_name || '',
                              customerCountryCode: parsed.countryDialCode,
                              customerLocalPhone: parsed.localPhone
                            });
                          }}
                          placeholder="-- Cuenta Admin / Sin cuenta asociada --"
                          options={[
                            { value: '', label: 'Sin cuenta asociada (Cuenta Admin)' },
                            ...usersList.map(u => ({
                              value: u.id,
                              label: u.full_name || u.email,
                              sublabel: u.email,
                              badge: u.role || 'cliente',
                              badgeColor: u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
                              icon: <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            }))
                          ]}
                        />
                      </div>
                    )}

                    {/* Fila: Nombre y Correo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Nombre Completo
                        </label>
                        <div className="relative flex items-center">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Ej: Carlos Sanchez"
                            value={editingLicense.customerName || ''}
                            onChange={(e) => setEditingLicense({ ...editingLicense, customerName: e.target.value })}
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                            Correo Electrónico
                          </label>
                          {editingLicense.customerEmail && (
                            <button
                              type="button"
                              onClick={() => setEditingLicense({ ...editingLicense, customerEmail: '', selectedCustomerId: '' })}
                              className="text-[9px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                            >
                              ✕ Quitar correo
                            </button>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                          <input
                            type="email"
                            placeholder="Opcional (cliente@empresa.com)"
                            value={editingLicense.customerEmail || ''}
                            onChange={(e) => setEditingLicense({ ...editingLicense, customerEmail: e.target.value })}
                            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {editingLicense.customerEmail && (
                            <button
                              type="button"
                              onClick={() => setEditingLicense({ ...editingLicense, customerEmail: '', selectedCustomerId: '' })}
                              className="absolute right-2 text-slate-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                              title="Borrar correo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        WhatsApp / Teléfono
                      </label>
                      <CountryPhoneInput
                        countryCode={editingLicense.customerCountryCode || '+57'}
                        localPhone={editingLicense.customerLocalPhone || ''}
                        onCountryChange={(code) => setEditingLicense({ ...editingLicense, customerCountryCode: code })}
                        onPhoneChange={(phone) => setEditingLicense({ ...editingLicense, customerLocalPhone: phone })}
                        placeholder="321 588 2400"
                      />
                    </div>

                    {/* Nota Interna */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Nota Interna / Ref. Pago
                      </label>
                      <div className="relative flex items-center">
                        <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Ej: Pago WhatsApp Nequi #8491..."
                          value={editingLicense.internalNotes || ''}
                          onChange={(e) => setEditingLicense({ ...editingLicense, internalNotes: e.target.value })}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Soporte Compactas */}
                  <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/50 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Soporte:</span>
                    </span>

                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      <button
                        type="button"
                        onClick={() => handleReissueKey(editingLicense.id)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-lg text-[11px] font-semibold hover:bg-amber-100 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Re-emitir Clave</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResendAccess(editingLicense.customer?.email || '')}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-300/80 dark:border-blue-800 text-blue-900 dark:text-blue-200 rounded-lg text-[11px] font-semibold hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Reenviar Acceso</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del Modal Compacto */}
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteLicense(editingLicense.id)}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLicense(null)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREAR / EDITAR PRODUCTO ---------------- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in-0 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl relative my-auto max-h-[96vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Compacto del Modal */}
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className={`w-8 h-8 rounded-xl ${productForm.delivery_type?.startsWith('COURSE') ? 'bg-gradient-to-tr from-purple-600 to-indigo-500' : 'bg-gradient-to-tr from-emerald-600 to-teal-500'} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                {productForm.delivery_type?.startsWith('COURSE') ? (
                  <GraduationCap className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>
                    {productForm.id 
                      ? (productForm.delivery_type?.startsWith('COURSE') ? 'Editar Curso / Masterclass' : 'Editar Producto') 
                      : (productForm.delivery_type?.startsWith('COURSE') ? 'Crear Nuevo Curso o Masterclass' : 'Nuevo Producto en Catálogo')}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {productForm.delivery_type?.startsWith('COURSE')
                    ? 'Estructura clases en video, recursos descargables y precio.'
                    : 'Administra plantillas, archivos digitales, software y servicios.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3">
              {/* Título del Producto */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Título del Producto / Recurso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sistema de Inventario y Facturación PRO"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Bloque: Estrategia de Precio, Lanzamiento y Ofertas */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Estrategia de Precio & Promoción</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const isFree = productForm.price === '0' || productForm.price === '0.00';
                      setProductForm({
                        ...productForm,
                        price: isFree ? '' : '0',
                        monthly_price: isFree ? productForm.monthly_price : '',
                        has_trial: isFree ? productForm.has_trial : false
                      });
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      productForm.price === '0' || productForm.price === '0.00'
                        ? 'bg-emerald-500 text-white font-extrabold shadow-2xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                  >
                    {productForm.price === '0' || productForm.price === '0.00' ? '🎁 Es Gratuito ($0)' : '🎁 Marcar Gratis ($0)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Precio de Venta / Oferta */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Precio de Venta / Oferta ($ USD) <span className="text-red-500">*</span>
                    </label>
                    <PriceInput
                      value={productForm.price}
                      onChange={(val) => setProductForm({ ...productForm, price: val })}
                      placeholder="19.90 o 0 para Gratis"
                    />
                  </div>

                  {/* Precio Original / Base Tachado */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Precio Regular (Tachado - Opcional)
                      </label>
                      {productForm.original_price && Number(productForm.original_price) > Number(productForm.price) && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          -{Math.round((1 - (Number(productForm.price) || 0) / Number(productForm.original_price)) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <PriceInput
                      value={productForm.original_price}
                      onChange={(val) => setProductForm({ ...productForm, original_price: val })}
                      placeholder="Ej: 49.00 (antes)"
                    />
                  </div>
                </div>

                {/* Opciones de Oferta por Tiempo Limitado o Gratis Temporal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  {/* Fecha Límite de Oferta de Lanzamiento */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Timer className="w-3 h-3 text-amber-500" />
                      <span>Oferta Vence el (Fecha Límite):</span>
                    </label>
                    <DatePicker
                      value={productForm.offer_end_date}
                      onChange={(date) => setProductForm({ ...productForm, offer_end_date: date })}
                      placeholder="Sin fecha límite..."
                    />
                  </div>

                  {/* Fecha hasta cuando es Gratis */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Gift className="w-3 h-3 text-emerald-500" />
                      <span>Gratis Hasta el (Vuelve a Pago):</span>
                    </label>
                    <DatePicker
                      value={productForm.free_until_date}
                      onChange={(date) => setProductForm({ 
                        ...productForm, 
                        free_until_date: date,
                        is_free_temporary: Boolean(date)
                      })}
                      placeholder="Permanente o fecha..."
                    />
                  </div>
                </div>

                {/* Badge Promocional / Etiqueta de Impacto */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span>Insignia Promocional Destacada:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Presets:</span>
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['🔥 LANZAMIENTO', '⚡ OFERTA FLASH', '🎁 GRATIS HOY', '⭐ TOP VENTAS'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, promotion_badge: productForm.promotion_badge === preset ? '' : preset })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          productForm.promotion_badge === preset
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: 🔥 50% OFF LANZAMIENTO (o texto personalizado)"
                    value={productForm.promotion_badge}
                    onChange={(e) => setProductForm({ ...productForm, promotion_badge: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

                {/* Categoría Dinámica con opción de agregar nueva */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory) setCustomCategoryInput('');
                      }}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {isCustomCategory ? 'Seleccionar existente' : '+ Nueva categoría'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Escribe el nombre de la nueva categoría..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-blue-400 dark:border-blue-600 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <CustomSelect
                      value={productForm.category || 'Google Sheets'}
                      onChange={(val) => {
                        if (val === '__NEW_CATEGORY__') {
                          setIsCustomCategory(true);
                          setCustomCategoryInput('');
                        } else {
                          setProductForm({ ...productForm, category: val });
                        }
                      }}
                      options={[
                        ...Array.from(new Set([
                          'Google Sheets',
                          'Páginas Web',
                          'Automatización',
                          'Landing Pages',
                          'Cursos & Masterclasses',
                          'Software & Apps',
                          'Sistemas POS',
                          'Plantillas Excel',
                          ...(Array.isArray(products) ? products.map(p => p?.category).filter(Boolean) : [])
                        ])).map(cat => ({
                          value: cat,
                          label: cat,
                          icon: <Layers className="w-3.5 h-3.5 text-slate-500" />
                        })),
                        {
                          value: '__NEW_CATEGORY__',
                          label: '+ Crear Nueva Categoría...',
                          badge: 'Nueva',
                          icon: <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
                        }
                      ]}
                    />
                  )}
                </div>

              {/* Descripción */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  placeholder="Resumen de las características y beneficios para el cliente..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Fila: Tipo de Entrega / Formato & Precio Mensual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Tipo de Entrega / Formato <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={productForm.delivery_type || 'GOOGLE_SHEET_TEMPLATE'}
                    onChange={(val) => setProductForm({ ...productForm, delivery_type: val })}
                    options={[
                      { value: 'GOOGLE_SHEET_TEMPLATE', label: 'Plantilla Google Sheets', badge: '/copy', icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> },
                      { value: 'FILE_DOWNLOAD', label: 'Descarga Archivo / Software', badge: 'ZIP / EXE / PDF', icon: <Download className="w-3.5 h-3.5 text-blue-600" /> },
                      { value: 'COURSE_PAID', label: 'Masterclass / Curso Pro (Pago)', badge: 'Clases', icon: <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> },
                      { value: 'COURSE_FREE', label: 'Curso Gratuito (Abierto)', badge: 'Gratis', icon: <PlayCircle className="w-3.5 h-3.5 text-amber-600" /> },
                      { value: 'WEB_PROJECT', label: 'Proyecto Web / SaaS / Código', badge: 'Next.js', icon: <Globe className="w-3.5 h-3.5 text-cyan-600" /> },
                      { value: 'SERVICE', label: 'Servicio / Consultoría 1a1', badge: 'Asesoría', icon: <Briefcase className="w-3.5 h-3.5 text-orange-600" /> },
                      { value: 'CUSTOM', label: 'Formato Personalizado / Otro', badge: 'Manual', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Precio Mensual ($ USD / mes - Opcional)
                  </label>
                  <PriceInput
                    value={productForm.monthly_price}
                    onChange={(val) => setProductForm({ ...productForm, monthly_price: val })}
                    placeholder="Ej: 9.90 / mes"
                  />
                </div>
              </div>

              {/* Sección de Recursos y Entregables: Enlaces y Archivos */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Enlaces y Archivos Entregables al Cliente</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Adjuntar otro archivo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {productForm.delivery_type === 'GOOGLE_SHEET_TEMPLATE' ? 'URL Copia Google Sheets (/copy)' :
                       productForm.delivery_type === 'FILE_DOWNLOAD' ? 'URL Descarga Archivo Principal (ZIP/EXE)' :
                       productForm.delivery_type === 'WEB_PROJECT' ? 'URL Repositorio / Código Fuente' :
                       'URL de Entrega o Acceso Principal'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://docs.google.com/.../copy o https://drive.google.com/..."
                      value={productForm.template_url}
                      onChange={(e) => setProductForm({ ...productForm, template_url: e.target.value, file_url: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      URL Demo / Vista Previa en Vivo (Opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://demo.mi-sitio.com o vista previa"
                      value={productForm.demo_url}
                      onChange={(e) => setProductForm({ ...productForm, demo_url: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      URL Video Tutorial / Guía de Inicio (Opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=... o enlace de Loom"
                      value={productForm.tutorial_url}
                      onChange={(e) => setProductForm({ ...productForm, tutorial_url: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Lista de Archivos Adjuntos Adicionales (ZIP, PDF, Software, Manuales) */}
                {(productForm.attachments || []).length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase text-slate-400">Archivos y Descargas Adicionales:</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {(productForm.attachments || []).map((att, attIdx) => (
                        <div key={att.id || attIdx} className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                          <FileArchive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <input
                            type="text"
                            required
                            placeholder="Nombre del recurso (ej: Manual PDF, Scripts)"
                            value={att.name}
                            onChange={(e) => handleUpdateAttachment(att.id, 'name', e.target.value)}
                            className="w-1/3 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold outline-none"
                          />
                          <input
                            type="url"
                            required
                            placeholder="URL de Descarga Directa (Drive, S3, Dropbox, etc.)"
                            value={att.url}
                            onChange={(e) => handleUpdateAttachment(att.id, 'url', e.target.value)}
                            className="flex-1 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                            title="Quitar archivo adjunto"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Constructor de Temario para Cursos */}
              {(productForm.delivery_type === 'COURSE_FREE' || productForm.delivery_type === 'COURSE_PAID') && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                          <span>Temario del Curso (Módulos & Lecciones)</span>
                        </h4>
                        <p className="text-[10px] text-slate-500">Agrega secciones, videos y recursos para el estudiante.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddModule}
                        className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Nueva Sección</span>
                      </button>
                    </div>

                    {/* Lista de Módulos */}
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {productForm.curriculum.map((mod: any, mIdx: number) => (
                        <div key={mod.id || mIdx} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shrink-0">
                              Sección {mIdx + 1}
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="Nombre de la Sección..."
                              value={mod.title}
                              onChange={(e) => handleUpdateModuleTitle(mIdx, e.target.value)}
                              className="flex-1 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(mIdx)}
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                              title="Eliminar esta sección"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Lecciones */}
                          <div className="pl-2.5 border-l-2 border-purple-200 dark:border-purple-900/60 space-y-1.5">
                            {mod.lessons.map((les: any, lIdx: number) => (
                              <div key={les.id || lIdx} className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{lIdx + 1}.</span>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Título de la clase..."
                                    value={les.title}
                                    onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'title', e.target.value)}
                                    className="flex-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="15 min"
                                    value={les.duration}
                                    onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'duration', e.target.value)}
                                    className="w-16 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] text-center outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLesson(mIdx, lIdx)}
                                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                    title="Eliminar clase"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  <input
                                    type="url"
                                    placeholder="URL Video (YouTube, Loom, MP4)..."
                                    value={les.video_url}
                                    onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'video_url', e.target.value)}
                                    className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] outline-none"
                                  />
                                  <input
                                    type="url"
                                    placeholder="Material descargable (URL)..."
                                    value={les.resource_url || ''}
                                    onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'resource_url', e.target.value)}
                                    className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] outline-none"
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddLesson(mIdx)}
                              className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Agregar Clase</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {productForm.curriculum.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic text-center py-2">
                          No hay secciones creadas aún. Pulsa "+ Nueva Sección".
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Opciones de Licenciamiento y Trial */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => setProductForm({ ...productForm, requires_license: !productForm.requires_license })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      productForm.requires_license
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${productForm.requires_license ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-none">Requiere Licencia</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Control de activaciones y dominios</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={productForm.requires_license}
                      onChange={(e) => setProductForm({ ...productForm, requires_license: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div
                    onClick={() => setProductForm({ ...productForm, has_trial: !productForm.has_trial })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      productForm.has_trial
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${productForm.has_trial ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-none">Prueba Gratuita (Trial)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Permite probar antes de pagar</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={productForm.has_trial}
                      onChange={(e) => setProductForm({ ...productForm, has_trial: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {productForm.has_trial && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Días de prueba por defecto:</label>
                      <p className="text-[10px] text-slate-500">Duración inicial al activar una prueba</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, default_trial_days: Math.max(1, (Number(productForm.default_trial_days) || 14) - 1) })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-slate-900 dark:text-white">
                          {productForm.default_trial_days || 14}
                        </span>
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, default_trial_days: Math.min(365, (Number(productForm.default_trial_days) || 14) + 1) })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Chips rápidos */}
                      <div className="flex items-center gap-1">
                        {[7, 14, 30].map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, default_trial_days: days })}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              productForm.default_trial_days === days
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con Botones */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                {productForm.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(productForm.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{productForm.id ? 'Guardar Cambios' : 'Crear Producto'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREAR / EDITAR POST DEL BLOG ---------------- */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              {postForm.id ? 'Editar Artículo' : 'Publicar Nuevo Artículo'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Administra contenido y posicionamiento SEO.</p>

            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Título del Artículo</label>
                <input
                  type="text"
                  required
                  placeholder="Guía Completa de Automatización en Google Sheets"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    placeholder="guia-completa-automatizacion"
                    value={postForm.slug}
                    onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Categoría</label>
                  <input
                    type="text"
                    placeholder="Tutoriales, Finanzas, etc."
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Extracto / Resumen (SEO Meta Description)</label>
                <textarea
                  rows={2}
                  placeholder="Breve descripción que aparecerá en los resultados de Google..."
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Contenido (Markdown / HTML)</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Escribe el contenido de tu artículo aquí..."
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                {postForm.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(postForm.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Post</span>
                  </button>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  {postForm.id ? 'Guardar Cambios' : 'Publicar Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREAR / EDITAR CUPÓN DE DESCUENTO ---------------- */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {couponForm.id ? 'Editar Cupón de Descuento' : 'Crear Nuevo Cupón de Descuento'}
                </h3>
                <p className="text-[11px] text-slate-500">Configura descuentos en % o $ para campañas y ventas.</p>
              </div>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5">
              {/* Código del Cupón */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Código del Cupón (MAYÚSCULAS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: LANZAMIENTO50, BLACKFRIDAY"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold tracking-wider outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* Tipo de Descuento & Valor */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Tipo de Descuento <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={couponForm.discountType}
                    onChange={(val: any) => setCouponForm({ ...couponForm, discountType: val })}
                    options={[
                      { value: 'percentage', label: 'Porcentaje (%)', badge: '% OFF', icon: <Percent className="w-3.5 h-3.5 text-pink-500" /> },
                      { value: 'fixed', label: 'Monto Fijo ($ USD)', badge: '$ USD', icon: <Tag className="w-3.5 h-3.5 text-emerald-500" /> }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {couponForm.discountType === 'percentage' ? 'Porcentaje (%)' : 'Monto ($ USD)'} <span className="text-red-500">*</span>
                  </label>
                  <PriceInput
                    value={couponForm.discountValue}
                    onChange={(val) => setCouponForm({ ...couponForm, discountValue: val })}
                    placeholder={couponForm.discountType === 'percentage' ? '50' : '10.00'}
                  />
                </div>
              </div>

              {/* Límite de Usos & Fecha de Expiración */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Máximo de Usos (Opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ilimitado o ej: 50"
                    value={couponForm.maxUses}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <DatePicker
                    value={couponForm.expiresAt}
                    onChange={(date) => setCouponForm({ ...couponForm, expiresAt: date })}
                    placeholder="Sin caducidad..."
                  />
                </div>
              </div>

              {/* Aplicar a Producto Específico */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Aplica a:
                </label>
                <CustomSelect
                  value={couponForm.productId || ''}
                  onChange={(val) => setCouponForm({ ...couponForm, productId: val })}
                  options={[
                    { value: '', label: '🌐 Todos los Productos del Catálogo', badge: 'Global' },
                    ...products.map(p => ({
                      value: p.id,
                      label: p.title,
                      badge: `$${p.price}`
                    }))
                  ]}
                />
              </div>

              {/* Botones del Modal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{couponForm.id ? 'Guardar Cambios' : 'Crear Cupón'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: TELEMETRÍA DE LICENCIA ---------------- */}
      {selectedLogs && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-lg relative max-h-[80vh] flex flex-col">
            <button onClick={() => setSelectedLogs(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold mb-0.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Telemetría de Licencia
            </h3>
            <p className="text-xs text-slate-500 mb-3 font-mono">Clave: {selectedLogs.licenseKey}</p>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {selectedLogs.logs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Sin registros de consulta todavía.</p>
              ) : (
                selectedLogs.logs.map((log: any) => (
                  <div key={log.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {log.origin_identifier || 'Consulta API directa'}
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        IP: {log.ip_address || 'N/A'} • {new Date(log.checked_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.is_valid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {log.is_valid ? 'VÁLIDA' : 'RECHAZADA'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DIÁLOGO PROFESIONAL: CONFIRMACIÓN ---------------- */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                confirmDialog.isDestructive 
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400' 
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
              }`}>
                {confirmDialog.isDestructive ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-5 leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await action();
                }}
                className={`px-4 py-1.5 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                  confirmDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DIÁLOGO PROFESIONAL: PROMPT / INGRESO DE TEXTO ---------------- */}
      {promptDialog && promptDialog.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {promptDialog.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              {promptDialog.message}
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const action = promptDialog.onConfirm;
                const val = promptDialog.value;
                setPromptDialog(null);
                await action(val);
              }}
              className="space-y-3"
            >
              {promptDialog.inputLabel && (
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {promptDialog.inputLabel}
                </label>
              )}

              <input
                type="text"
                autoFocus
                required
                placeholder={promptDialog.placeholder || 'Escribe aquí...'}
                value={promptDialog.value}
                onChange={(e) => setPromptDialog({ ...promptDialog, value: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 font-medium"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPromptDialog(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  {promptDialog.confirmText || 'Aceptar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DIÁLOGO: ACCESO DIRECTO (PIN 6 DÍGITOS + MAGIC LINK) ---------------- */}
      {magicLinkResult && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button onClick={() => setMagicLinkResult(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Acceso de Soporte para el Cliente
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">{magicLinkResult.email}</p>
              </div>
            </div>

            {/* OPCIÓN 1: CÓDIGO PIN DE 6 DÍGITOS */}
            {magicLinkResult.pinCode && (
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/60 mb-3 text-center">
                <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 block mb-1">
                  Opción 1: Código PIN de 6 Dígitos (Para dictar por WhatsApp o llamada)
                </span>
                
                <div className="my-2 py-1.5 px-3 bg-white dark:bg-slate-900 rounded-lg border border-blue-300 dark:border-blue-800 inline-block font-mono text-2xl font-black tracking-widest text-blue-700 dark:text-blue-300 shadow-xs">
                  {magicLinkResult.pinCode}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  El cliente va a <strong className="text-slate-700 dark:text-slate-300">/login</strong> e ingresa estos 6 números. Válido por 1 hora.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(magicLinkResult.pinCode || '');
                    showToast(`¡Código PIN ${magicLinkResult.pinCode} copiado!`);
                  }}
                  className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar PIN {magicLinkResult.pinCode}</span>
                </button>
              </div>
            )}

            {/* OPCIÓN 2: ENLACE DIRECTO */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Opción 2: Enlace Mágico de 1-Clic
              </span>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={magicLinkResult.link}
                  className="w-full bg-transparent text-[11px] font-mono text-slate-700 dark:text-slate-300 outline-none truncate select-all"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(magicLinkResult.link);
                  showToast('¡Enlace de 1-clic copiado!');
                  setMagicLinkResult(null);
                }}
                className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace de 1-Clic</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GENERADOR DE CÓDIGO Y SDK DE PROTECCIÓN (RESPONSIVE WIDE) */}
      {/* ======================================================== */}
      {showSdkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl xl:max-w-6xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col h-[92vh] max-h-[880px]">
            
            {/* Cabecera Principal */}
            <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Generador de Código de Protección (SDK)</span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                      Multiplataforma
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecciona tu plataforma para obtener el código de validación y protección automática contra piratería.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSdkModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra Segmentada de Plataformas (Pill Switcher) */}
            <div className="px-5 py-3 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSdkLanguage('gas')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  sdkLanguage === 'gas'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sheets (Apps Script)</span>
              </button>

              <button
                onClick={() => setSdkLanguage('vba')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  sdkLanguage === 'vba'
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Microsoft Excel (.xlsm VBA)</span>
              </button>

              <button
                onClick={() => setSdkLanguage('js')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  sdkLanguage === 'js'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>JavaScript / Node.js</span>
              </button>

              <button
                onClick={() => setSdkLanguage('python')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  sdkLanguage === 'python'
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Python (Desktop)</span>
              </button>

              <button
                onClick={() => setSdkLanguage('curl')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  sdkLanguage === 'curl'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>cURL / HTTP REST</span>
              </button>
            </div>

            {/* Contenido Principal con Scroll Interno */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* GOOGLE SHEETS */}
              {sdkLanguage === 'gas' && (
                <div className="space-y-3.5 flex flex-col h-full">
                  {/* Banner de Prompt para IA */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Prompt listo para pasarle a otra IA (ChatGPT, Claude, Cursor)</span>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">1 Clic</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Incluye el código Apps Script y las directivas de seguridad para que la IA proteja tu Google Sheets automáticamente.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const promptText = `Actúa como un desarrollador experto en Google Apps Script para Google Sheets.
Necesito proteger mi plantilla de Google Sheets conectándola a mi sistema de licencias de Tecnonets.

A continuación te entrego el código oficial del módulo (TecnonetsProtection.gs):

\`\`\`javascript
// Modulo de licencias Tecnonets para Google Sheets
const TECNONETS_CONFIG = {
  API_ACTIVATE: 'https://tecnonets.com/api/v1/licenses/activate',
  API_VALIDATE: 'https://tecnonets.com/api/v1/licenses/validate'
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Licencia Tecnonets')
    .addItem('Activar Clave de Licencia', 'promptActivateLicense')
    .addItem('Consultar Estado de Licencia', 'checkLicenseStatus')
    .addToUi();
    
  validateSilentlyOnOpen();
}

function promptActivateLicense() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Activación de Licencia', 'Ingresa tu clave Tecnonets (ej. TEC-XXXX-XXXX-XXXX):', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() == ui.Button.OK) {
    const key = res.getResponseText().trim();
    if (!key) return;
    activateLicenseOnline(key);
  }
}

function activateLicenseOnline(licenseKey) {
  const ui = SpreadsheetApp.getUi();
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const docName = SpreadsheetApp.getActiveSpreadsheet().getName();
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_ACTIVATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        license_key: licenseKey,
        origin_identifier: docId,
        device_name: docName
      })
    });
    
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      PropertiesService.getDocumentProperties().setProperty('TECNONETS_KEY', licenseKey);
      if (result.leaseToken) {
        PropertiesService.getDocumentProperties().setProperty('TECNONETS_LEASE', result.leaseToken);
      }
      desbloquearPlantillaGoogleSheets();
      ui.alert('Activación Exitosa', result.message, ui.ButtonSet.OK);
    } else {
      bloquearPlantillaGoogleSheets(result.message || 'Clave no válida o límite de activaciones alcanzado.');
    }
  } catch (err) {
    ui.alert('Error de Conexión', 'No se pudo contactar al servidor: ' + err.message, ui.ButtonSet.OK);
  }
}

function checkLicenseStatus() {
  const ui = SpreadsheetApp.getUi();
  const key = PropertiesService.getDocumentProperties().getProperty('TECNONETS_KEY');
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (!key) {
    ui.alert('Estado', 'Esta plantilla aún no tiene una clave activada.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_VALIDATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ license_key: key, origin_identifier: docId })
    });
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      desbloquearPlantillaGoogleSheets();
      ui.alert('Estado de Licencia', result.message, ui.ButtonSet.OK);
    } else {
      bloquearPlantillaGoogleSheets(result.message);
    }
  } catch(e) {
    ui.alert('Aviso', 'Trabajando con validación local.', ui.ButtonSet.OK);
  }
}

function validateSilentlyOnOpen() {
  const key = PropertiesService.getDocumentProperties().getProperty('TECNONETS_KEY');
  const lease = PropertiesService.getDocumentProperties().getProperty('TECNONETS_LEASE');
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (!key) {
    bloquearPlantillaGoogleSheets('Esta plantilla requiere una clave de licencia activa de Tecnonets.');
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_VALIDATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ license_key: key, origin_identifier: docId, lease_token: lease })
    });
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      desbloquearPlantillaGoogleSheets();
    } else {
      bloquearPlantillaGoogleSheets('Tu licencia ha expirado o fue cancelada: ' + (result.message || ''));
    }
  } catch(e) {
    if (!lease) {
      bloquearPlantillaGoogleSheets('Sin conexión a internet. Conéctate para validar tu licencia.');
    }
  }
}

function bloquearPlantillaGoogleSheets(motivo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let avisoSheet = ss.getSheetByName('Aviso_Licencia');
  
  if (!avisoSheet) {
    avisoSheet = ss.insertSheet('Aviso_Licencia', 0);
    avisoSheet.getRange('A1').setValue('ACCESO RESTRINGIDO - LICENCIA TECNONETS').setFontSize(16).setFontWeight('bold').setFontColor('#dc2626');
    avisoSheet.getRange('A3').setValue('Para desbloquear tus hojas y fórmulas, ve al menú superior:').setFontSize(12);
    avisoSheet.getRange('A4').setValue('Licencia Tecnonets > Activar Clave de Licencia').setFontSize(12).setFontWeight('bold');
    avisoSheet.setTabColor('#dc2626');
  }
  
  avisoSheet.showSheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== 'Aviso_Licencia') {
      sheets[i].hideSheet();
    }
  }
  
  if (motivo) {
    SpreadsheetApp.getUi().alert('Acceso Denegado', motivo, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function desbloquearPlantillaGoogleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    sheets[i].showSheet();
  }
  const avisoSheet = ss.getSheetByName('Aviso_Licencia');
  if (avisoSheet && sheets.length > 1) {
    avisoSheet.hideSheet();
  }
}
\`\`\`

INSTRUCCIONES PARA TI:
1. Explícame paso a paso cómo integrar este código en el editor de Apps Script (Extensiones > Apps Script) de mi plantilla.
2. Asegúrate de que el disparador onOpen() ejecute la validación silenciosa al abrir el documento.
3. Si el usuario no tiene licencia o vence su prueba, confirma que las hojas queden ocultadas con hideSheet() mostrando solo 'Aviso_Licencia'.
4. Ayúdame a estructurar la llamada a través de una Biblioteca Maestra de Apps Script para que el código quede 100% oculto al cliente.`;
                        navigator.clipboard.writeText(promptText);
                        setCopiedAiPrompt(true);
                        setTimeout(() => setCopiedAiPrompt(false), 2000);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      {copiedAiPrompt ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                          <span>¡Prompt Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Copiar Prompt para IA</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5 shrink-0">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instrucciones de Instalación en Google Sheets:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      <li>Abre tu plantilla maestra en Google Sheets.</li>
                      <li>Ve al menú superior <strong>Extensiones &gt; Apps Script</strong>.</li>
                      <li>Borra el código existente, pega el script que está abajo y guarda con <code>Ctrl + S</code>.</li>
                      <li>Al abrir la hoja, se creará automáticamente el menú <strong>🔐 Licencia Tecnonets</strong>.</li>
                    </ol>
                  </div>

                  {/* Tarjeta de Seguridad Google Sheets Colapsable */}
                  <details className="group border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-xl overflow-hidden text-xs shrink-0 transition-all">
                    <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Buenas Prácticas de Blindaje para Google Sheets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-600/80 font-normal hidden sm:inline">Clic para expandir / ocultar</span>
                        <ChevronDown className="w-4 h-4 text-emerald-600 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="p-4 pt-1 border-t border-emerald-500/20 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] leading-relaxed">
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🏛️ 1. Librería Privada Central
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Para plantillas de alto valor, aloja la lógica en una Librería privada en Google Cloud. La hoja del cliente solo contendrá 1 línea de llamada, ocultando tu código al 100%.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🔢 2. Fórmulas Cloud Dependientes
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Si el cliente intenta borrar el Apps Script, las fórmulas principales fallan con error al no tener el servidor de cálculo de Tecnonets.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          ☁️ 3. Ejecución 100% en la Nube
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          A diferencia de Excel, el archivo nunca baja al disco duro del cliente, impidiendo ataques de ingeniería inversa o cracking local.
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* Terminal IDE Container */}
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex-1 flex flex-col min-h-[360px]">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <span className="font-mono text-slate-300 font-semibold ml-2">TecnonetsProtection.gs</span>
                      </div>
                      <button
                        onClick={() => {
                          const code = `// Modulo de licencias Tecnonets para Google Sheets
const TECNONETS_CONFIG = {
  API_ACTIVATE: 'https://tecnonets.com/api/v1/licenses/activate',
  API_VALIDATE: 'https://tecnonets.com/api/v1/licenses/validate'
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Licencia Tecnonets')
    .addItem('Activar Clave de Licencia', 'promptActivateLicense')
    .addItem('Consultar Estado de Licencia', 'checkLicenseStatus')
    .addToUi();
    
  validateSilentlyOnOpen();
}

function promptActivateLicense() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Activación de Licencia', 'Ingresa tu clave Tecnonets (ej. TEC-XXXX-XXXX-XXXX):', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() == ui.Button.OK) {
    const key = res.getResponseText().trim();
    if (!key) return;
    activateLicenseOnline(key);
  }
}

function activateLicenseOnline(licenseKey) {
  const ui = SpreadsheetApp.getUi();
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const docName = SpreadsheetApp.getActiveSpreadsheet().getName();
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_ACTIVATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        license_key: licenseKey,
        origin_identifier: docId,
        device_name: docName
      })
    });
    
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      PropertiesService.getDocumentProperties().setProperty('TECNONETS_KEY', licenseKey);
      if (result.leaseToken) {
        PropertiesService.getDocumentProperties().setProperty('TECNONETS_LEASE', result.leaseToken);
      }
      desbloquearPlantillaGoogleSheets();
      ui.alert('Activación Exitosa', result.message, ui.ButtonSet.OK);
    } else {
      bloquearPlantillaGoogleSheets(result.message || 'Clave no válida o límite de activaciones alcanzado.');
    }
  } catch (err) {
    ui.alert('Error de Conexión', 'No se pudo contactar al servidor: ' + err.message, ui.ButtonSet.OK);
  }
}

function checkLicenseStatus() {
  const ui = SpreadsheetApp.getUi();
  const key = PropertiesService.getDocumentProperties().getProperty('TECNONETS_KEY');
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (!key) {
    ui.alert('Estado', 'Esta plantilla aún no tiene una clave activada.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_VALIDATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ license_key: key, origin_identifier: docId })
    });
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      desbloquearPlantillaGoogleSheets();
      ui.alert('Estado de Licencia', result.message, ui.ButtonSet.OK);
    } else {
      bloquearPlantillaGoogleSheets(result.message);
    }
  } catch(e) {
    ui.alert('Aviso', 'Trabajando con validación local.', ui.ButtonSet.OK);
  }
}

function validateSilentlyOnOpen() {
  const key = PropertiesService.getDocumentProperties().getProperty('TECNONETS_KEY');
  const lease = PropertiesService.getDocumentProperties().getProperty('TECNONETS_LEASE');
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (!key) {
    bloquearPlantillaGoogleSheets('Esta plantilla requiere una clave de licencia activa de Tecnonets.');
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_VALIDATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ license_key: key, origin_identifier: docId, lease_token: lease })
    });
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      desbloquearPlantillaGoogleSheets();
    } else {
      bloquearPlantillaGoogleSheets('Tu licencia ha expirado o fue cancelada: ' + (result.message || ''));
    }
  } catch(e) {
    if (!lease) {
      bloquearPlantillaGoogleSheets('Sin conexión a internet. Conéctate para validar tu licencia.');
    }
  }
}

function bloquearPlantillaGoogleSheets(motivo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let avisoSheet = ss.getSheetByName('Aviso_Licencia');
  
  if (!avisoSheet) {
    avisoSheet = ss.insertSheet('Aviso_Licencia', 0);
    avisoSheet.getRange('A1').setValue('ACCESO RESTRINGIDO - LICENCIA TECNONETS').setFontSize(16).setFontWeight('bold').setFontColor('#dc2626');
    avisoSheet.getRange('A3').setValue('Para desbloquear tus hojas y fórmulas, ve al menú superior:').setFontSize(12);
    avisoSheet.getRange('A4').setValue('Licencia Tecnonets > Activar Clave de Licencia').setFontSize(12).setFontWeight('bold');
    avisoSheet.setTabColor('#dc2626');
  }
  
  avisoSheet.showSheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== 'Aviso_Licencia') {
      sheets[i].hideSheet();
    }
  }
  
  if (motivo) {
    SpreadsheetApp.getUi().alert('Acceso Denegado', motivo, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function desbloquearPlantillaGoogleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    sheets[i].showSheet();
  }
  const avisoSheet = ss.getSheetByName('Aviso_Licencia');
  if (avisoSheet && sheets.length > 1) {
    avisoSheet.hideSheet();
  }
}`;
                          navigator.clipboard.writeText(code);
                          setCopiedSdk(true);
                          setTimeout(() => setCopiedSdk(false), 2000);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedSdk ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 sm:p-5 text-slate-100 text-xs sm:text-[13px] font-mono overflow-auto flex-1 leading-relaxed select-all">
{`// Modulo de licencias Tecnonets para Google Sheets
const TECNONETS_CONFIG = {
  API_ACTIVATE: 'https://tecnonets.com/api/v1/licenses/activate',
  API_VALIDATE: 'https://tecnonets.com/api/v1/licenses/validate'
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Licencia Tecnonets')
    .addItem('Activar Clave de Licencia', 'promptActivateLicense')
    .addItem('Consultar Estado de Licencia', 'checkLicenseStatus')
    .addToUi();
    
  validateSilentlyOnOpen();
}

function promptActivateLicense() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Activación de Licencia', 'Ingresa tu clave Tecnonets (ej. TEC-XXXX-XXXX-XXXX):', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() == ui.Button.OK) {
    const key = res.getResponseText().trim();
    if (!key) return;
    activateLicenseOnline(key);
  }
}

function activateLicenseOnline(licenseKey) {
  const ui = SpreadsheetApp.getUi();
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const docName = SpreadsheetApp.getActiveSpreadsheet().getName();
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_ACTIVATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        license_key: licenseKey,
        origin_identifier: docId,
        device_name: docName
      })
    });
    
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      PropertiesService.getDocumentProperties().setProperty('TECNONETS_KEY', licenseKey);
      if (result.leaseToken) {
        PropertiesService.getDocumentProperties().setProperty('TECNONETS_LEASE', result.leaseToken);
      }
      desbloquearPlantillaGoogleSheets();
      ui.alert('Activación Exitosa', result.message, ui.ButtonSet.OK);
    } else {
      bloquearPlantillaGoogleSheets(result.message || 'Clave no válida o límite de activaciones alcanzado.');
    }
  } catch (err) {
    ui.alert('Error de Conexión', 'No se pudo contactar al servidor: ' + err.message, ui.ButtonSet.OK);
  }
}

function checkLicenseStatus() {
  const ui = SpreadsheetApp.getUi();
  const key = PropertiesService.getDocumentProperties().getProperty('TECNONETS_KEY');
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (!key) {
    ui.alert('Estado', 'Esta plantilla aún no tiene una clave activada.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_VALIDATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ license_key: key, origin_identifier: docId })
    });
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      desbloquearPlantillaGoogleSheets();
      ui.alert('Estado de Licencia', result.message, ui.ButtonSet.OK);
    } else {
      bloquearPlantillaGoogleSheets(result.message);
    }
  } catch(e) {
    ui.alert('Aviso', 'Trabajando con validación local.', ui.ButtonSet.OK);
  }
}

function validateSilentlyOnOpen() {
  const key = PropertiesService.getDocumentProperties().getProperty('TECNONETS_KEY');
  const lease = PropertiesService.getDocumentProperties().getProperty('TECNONETS_LEASE');
  const docId = SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (!key) {
    bloquearPlantillaGoogleSheets('Esta plantilla requiere una clave de licencia activa de Tecnonets.');
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(TECNONETS_CONFIG.API_VALIDATE, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ license_key: key, origin_identifier: docId, lease_token: lease })
    });
    const result = JSON.parse(response.getContentText());
    if (result.valid) {
      desbloquearPlantillaGoogleSheets();
    } else {
      bloquearPlantillaGoogleSheets('Tu licencia ha expirado o fue cancelada: ' + (result.message || ''));
    }
  } catch(e) {
    if (!lease) {
      bloquearPlantillaGoogleSheets('Sin conexión a internet. Conéctate para validar tu licencia.');
    }
  }
}

function bloquearPlantillaGoogleSheets(motivo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let avisoSheet = ss.getSheetByName('Aviso_Licencia');
  
  if (!avisoSheet) {
    avisoSheet = ss.insertSheet('Aviso_Licencia', 0);
    avisoSheet.getRange('A1').setValue('ACCESO RESTRINGIDO - LICENCIA TECNONETS').setFontSize(16).setFontWeight('bold').setFontColor('#dc2626');
    avisoSheet.getRange('A3').setValue('Para desbloquear tus hojas y fórmulas, ve al menú superior:').setFontSize(12);
    avisoSheet.getRange('A4').setValue('Licencia Tecnonets > Activar Clave de Licencia').setFontSize(12).setFontWeight('bold');
    avisoSheet.setTabColor('#dc2626');
  }
  
  avisoSheet.showSheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== 'Aviso_Licencia') {
      sheets[i].hideSheet();
    }
  }
  
  if (motivo) {
    SpreadsheetApp.getUi().alert('Acceso Denegado', motivo, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function desbloquearPlantillaGoogleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    sheets[i].showSheet();
  }
  const avisoSheet = ss.getSheetByName('Aviso_Licencia');
  if (avisoSheet && sheets.length > 1) {
    avisoSheet.hideSheet();
  }
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* MICROSOFT EXCEL VBA */}
              {sdkLanguage === 'vba' && (
                <div className="space-y-3.5 flex flex-col h-full">
                  {/* Banner de Prompt para IA */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-emerald-600/10 to-blue-500/10 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Prompt listo para pasarle a otra IA (ChatGPT, Claude, Cursor)</span>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">1 Clic</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Incluye el código VBA y directivas completas para que la IA proteja tu libro Excel (.xlsm).
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const promptText = `Actúa como un desarrollador Senior en Visual Basic for Applications (VBA) para Microsoft Excel.
Necesito proteger mi archivo de Excel (.xlsm) conectándolo a la API de licencias de Tecnonets con blindaje por Hardware ID.

A continuación te entrego el código oficial del módulo VBA (LicenciaTecnonets.bas):

\`\`\`vba
Attribute VB_Name = "LicenciaTecnonets"
Option Explicit

' =========================================================================================
' MODULO DE SEGURIDAD Y LICENCIAMIENTO TECNONETS
' Sistema de validacion en la nube y proteccion anti-clonacion por Hardware ID
' Web: https://tecnonets.com | Soporte y Documentacion
' =========================================================================================

' Nombre identificador de tu aplicacion para guardar la clave en el registro de Windows
Public Const TECNONETS_APP_NAME As String = "WhatsAppMasivo2026"

' Endpoints oficiales de la API de Tecnonets
Public Const TECNONETS_ACTIVATE_URL As String = "https://tecnonets.com/api/v1/licenses/activate"
Public Const TECNONETS_VALIDATE_URL As String = "https://tecnonets.com/api/v1/licenses/validate"

' -----------------------------------------------------------------------------------------
' 1. EVENTO AUTOMATICO AL ABRIR EL ARCHIVO
' -----------------------------------------------------------------------------------------
Public Sub Auto_Open()
    Dim savedKey As String
    ' Leemos la clave previamente guardada en el registro de Windows
    savedKey = Trim(GetSetting(TECNONETS_APP_NAME, "License", "Key", ""))
    
    If savedKey = "" Then
        ' Si nunca ha ingresado clave, ocultamos las hojas de trabajo y solicitamos la licencia
        BloquearLibroSilencioso
        SolicitarLicenciaExcel
    Else
        ' Si ya tiene clave registrada, verificamos en segundo plano que siga activa y con cupo
        ValidarLicenciaSilenciosa savedKey
    End If
End Sub

' -----------------------------------------------------------------------------------------
' 2. SOLICITUD DE CLAVE AL USUARIO
' -----------------------------------------------------------------------------------------
Public Sub SolicitarLicenciaExcel()
    Dim userKey As String
    userKey = InputBox("Por favor ingresa tu clave de licencia de Tecnonets (ej: TEC-XXXX-XXXX-XXXX):" & vbCrLf & vbCrLf & _
                       "Si aun no tienes una licencia activa o necesitas cupos adicionales, visita tecnonets.com", _
                       "Activacion de Licencia - Tecnonets")
    
    userKey = Trim(userKey)
    If userKey = "" Then
        BloquearLibro "Es necesario ingresar una licencia valida para desbloquear las funciones de este libro."
        Exit Sub
    End If
    
    ActivarLicenciaExcel userKey
End Sub

' -----------------------------------------------------------------------------------------
' 3. PROCESO DE ACTIVACION (REGISTRA HARDWARE ID Y CONSUME 1 CUPO)
' -----------------------------------------------------------------------------------------
Public Function ActivarLicenciaExcel(ByVal licenseKey As String) As Boolean
    Dim http As Object
    Dim hwId As String
    Dim devName As String
    Dim jsonPayload As String
    Dim responseText As String
    
    licenseKey = Trim(licenseKey)
    hwId = ObtenerHardwareID()
    devName = Environ("COMPUTERNAME")
    If devName = "" Then devName = "PC-Usuario"
    
    ' Armamos el JSON con la clave y la huella digital unica de este PC
    jsonPayload = "{""license_key"":""" & licenseKey & """,""origin_identifier"":""" & hwId & """,""device_name"":""" & devName & """}"
    
    On Error GoTo ErrorConexion
    #If VBA7 Then
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    #Else
        Set http = CreateObject("MSXML2.ServerXMLHTTP")
    #End If
    
    http.Open "POST", TECNONETS_ACTIVATE_URL, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.send jsonPayload
    
    responseText = http.responseText
    
    ' Si el servidor confirma la activacion con exito
    If InStr(1, responseText, """valid"":true", vbTextCompare) > 0 Or InStr(1, responseText, """valid"": true", vbTextCompare) > 0 Then
        SaveSetting TECNONETS_APP_NAME, "License", "Key", licenseKey
        DesbloquearLibro
        MsgBox "Excelente! Tu licencia ha sido activada y vinculada a este equipo con exito.", vbInformation, "Activacion Exitosa - Tecnonets"
        ActivarLicenciaExcel = True
    Else
        Dim motivoError As String
        If InStr(1, responseText, "limit", vbTextCompare) > 0 Or InStr(1, responseText, "cupo", vbTextCompare) > 0 Or InStr(1, responseText, "device", vbTextCompare) > 0 Then
            motivoError = "Has alcanzado el limite maximo de computadores permitidos para esta licencia. Contacta a soporte para ampliar tus cupos."
        Else
            motivoError = "La clave de licencia ingresada no es valida, ha expirado o se encuentra suspendida."
        End If
        BloquearLibro motivoError
        ActivarLicenciaExcel = False
    End If
    Exit Function

ErrorConexion:
    MsgBox "No fue posible conectar con el servidor de licencias de Tecnonets." & vbCrLf & _
           "Por favor revisa tu conexion a internet e intenta nuevamente.", vbExclamation, "Error de Conexion"
    BloquearLibro "Se requiere acceso a internet para validar y activar la licencia."
    ActivarLicenciaExcel = False
End Function

' -----------------------------------------------------------------------------------------
' 4. VALIDACION SILENCIOSA EN SEGUNDO PLANO
' -----------------------------------------------------------------------------------------
Public Function ValidarLicenciaSilenciosa(ByVal licenseKey As String, Optional ByVal MostrarAlerta As Boolean = True) As Boolean
    Dim http As Object
    Dim hwId As String
    Dim jsonPayload As String
    Dim responseText As String
    
    licenseKey = Trim(licenseKey)
    If licenseKey = "" Then
        BloquearLibro "No se encontro ninguna licencia registrada en este equipo."
        ValidarLicenciaSilenciosa = False
        Exit Function
    End If
    
    hwId = ObtenerHardwareID()
    jsonPayload = "{""license_key"":""" & licenseKey & """,""origin_identifier"":""" & hwId & """}"
    
    On Error GoTo ErrorValidacion
    #If VBA7 Then
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    #Else
        Set http = CreateObject("MSXML2.ServerXMLHTTP")
    #End If
    
    http.Open "POST", TECNONETS_VALIDATE_URL, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.send jsonPayload
    
    responseText = http.responseText
    
    If InStr(1, responseText, """valid"":true", vbTextCompare) > 0 Or InStr(1, responseText, """valid"": true", vbTextCompare) > 0 Then
        DesbloquearLibro
        ValidarLicenciaSilenciosa = True
    Else
        If MostrarAlerta Then
            BloquearLibro "Tu licencia ha expirado, esta suspendida o este computador no esta autorizado."
        Else
            BloquearLibroSilencioso
        End If
        ValidarLicenciaSilenciosa = False
    End If
    Exit Function

ErrorValidacion:
    ' En caso de micro-caida de red, permitimos continuar sin interrumpir el trabajo local
    ValidarLicenciaSilenciosa = True
End Function

' -----------------------------------------------------------------------------------------
' 5. VALIDACION PREVIA PARA BOTONES CRITICOS (EJ: BOTON ENVIAR MENSAJES)
' -----------------------------------------------------------------------------------------
Public Function VerificarLicenciaAntesDeEnvio() As Boolean
    Dim savedKey As String
    savedKey = Trim(GetSetting(TECNONETS_APP_NAME, "License", "Key", ""))
    
    If savedKey = "" Then
        MsgBox "Se requiere una licencia activa para ejecutar esta accion.", vbCritical, "Licencia Requerida"
        SolicitarLicenciaExcel
        VerificarLicenciaAntesDeEnvio = False
        Exit Function
    End If
    
    VerificarLicenciaAntesDeEnvio = ValidarLicenciaSilenciosa(savedKey, True)
End Function

' -----------------------------------------------------------------------------------------
' 6. OBTENCION DE HUELLA DIGITAL UNICA DEL PC (PLACA MADRE + PROCESADOR)
' -----------------------------------------------------------------------------------------
Public Function ObtenerHardwareID() As String
    On Error Resume Next
    Dim wmi As Object
    Dim colItems As Object
    Dim item As Object
    Dim cpuId As String, mbUuid As String, fallbackId As String
    
    cpuId = ""
    mbUuid = ""
    fallbackId = Environ("COMPUTERNAME") & "_" & Environ("USERNAME")
    
    ' Conectamos con el servicio WMI de Windows
    Set wmi = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2")
    
    If Not wmi Is Nothing Then
        ' 1. UUID de la Placa Madre
        Set colItems = wmi.ExecQuery("SELECT UUID FROM Win32_ComputerSystemProduct")
        For Each item In colItems
            If Not IsNull(item.UUID) Then
                mbUuid = Trim(CStr(item.UUID))
                If mbUuid <> "" And mbUuid <> "None" Then Exit For
            End If
        Next
        
        ' 2. Serial del Procesador
        Set colItems = wmi.ExecQuery("SELECT ProcessorId FROM Win32_Processor")
        For Each item In colItems
            If Not IsNull(item.ProcessorId) Then
                cpuId = Trim(CStr(item.ProcessorId))
                If cpuId <> "" Then Exit For
            End If
        Next
    End If
    
    ' Combinamos los seriales fisicos para crear un ID imposible de clonar
    If mbUuid <> "" And cpuId <> "" Then
        ObtenerHardwareID = "HW-" & mbUuid & "-" & cpuId
    ElseIf mbUuid <> "" Then
        ObtenerHardwareID = "HW-" & mbUuid
    ElseIf cpuId <> "" Then
        ObtenerHardwareID = "HW-" & cpuId & "-" & fallbackId
    Else
        ObtenerHardwareID = "HW-" & fallbackId
    End If
    On Error GoTo 0
End Function

' -----------------------------------------------------------------------------------------
' 7. BLOQUEO DEL LIBRO (OCULTA HOJAS CON xlSheetVeryHidden)
' -----------------------------------------------------------------------------------------
Public Sub BloquearLibro(ByVal motivo As String)
    BloquearLibroSilencioso
    If Trim(motivo) <> "" Then
        MsgBox motivo, vbCritical, "Acceso Restringido - Tecnonets"
    End If
End Sub

Public Sub BloquearLibroSilencioso()
    Dim ws As Worksheet
    Dim wsAviso As Worksheet
    
    On Error Resume Next
    ' Verificamos si existe la hoja de advertencia; si no, la creamos al inicio
    Set wsAviso = ThisWorkbook.Sheets("Aviso_Licencia")
    If wsAviso Is Nothing Then
        Set wsAviso = ThisWorkbook.Sheets.Add(Before:=ThisWorkbook.Sheets(1))
        wsAviso.Name = "Aviso_Licencia"
    End If
    
    wsAviso.Visible = xlSheetVisible
    wsAviso.Activate
    
    ' Ocultamos todas las demas hojas de trabajo de forma invisible para el usuario
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> "Aviso_Licencia" Then
            ws.Visible = xlSheetVeryHidden
        End If
    Next ws
    On Error GoTo 0
End Sub

' -----------------------------------------------------------------------------------------
' 8. DESBLOQUEO DE TODAS LAS HOJAS
' -----------------------------------------------------------------------------------------
Public Sub DesbloquearLibro()
    Dim ws As Worksheet
    Dim wsDash As Worksheet
    
    On Error Resume Next
    ' Mostramos todas las hojas del libro
    For Each ws In ThisWorkbook.Worksheets
        ws.Visible = xlSheetVisible
    Next ws
    
    ' Ocultamos la hoja de aviso si hay mas hojas disponibles
    If ThisWorkbook.Worksheets.Count > 1 Then
        Sheets("Aviso_Licencia").Visible = xlSheetVeryHidden
    End If
    
    ' Llevamos al usuario a la hoja principal
    Set wsDash = ThisWorkbook.Sheets("DASHBOARD")
    If Not wsDash Is Nothing Then
        wsDash.Activate
    Else
        ThisWorkbook.Sheets(1).Activate
    End If
    On Error GoTo 0
End Sub

' -----------------------------------------------------------------------------------------
' 9. CERRAR SESION / DESVINCULAR LICENCIA DE ESTE EQUIPO
' -----------------------------------------------------------------------------------------
Public Sub CerrarSesionLicencia()
    Dim resp As VbMsgBoxResult
    resp = MsgBox("Deseas desvincular tu licencia de este computador?", vbYesNo + vbQuestion, "Cerrar Sesion - Tecnonets")
    If resp = vbYes Then
        SaveSetting TECNONETS_APP_NAME, "License", "Key", ""
        BloquearLibro "La licencia ha sido desvinculada de este equipo correctamente."
    End If
End Sub
\`\`\`

INSTRUCCIONES PARA TI:
1. Explícame cómo insertar este módulo en un libro de Excel habilitado para macros (.xlsm) usando el editor de VBA (ALT + F11).
2. Asegúrate de que el libro tenga una hoja 'Aviso_Licencia' y que todas las demás hojas se oculten con xlSheetVeryHidden si el usuario no tiene una clave activa.
3. Al abrirse el archivo (Auto_Open), debe validar silenciosamente la clave contra el servidor Tecnonets usando el ID de máquina (Placa Madre + CPU) para no superar los cupos comprados.
4. Explícame cómo proteger los botones de acción llamando a VerificarLicenciaAntesDeEnvio().
5. Explícame cómo bloquear el proyecto de VBA con contraseña en Herramientas > Propiedades de VBAProject > Protección para evitar que los usuarios desactiven la macro.`;
                        navigator.clipboard.writeText(promptText);
                        setCopiedAiPrompt(true);
                        setTimeout(() => setCopiedAiPrompt(false), 2000);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                    >
                      {copiedAiPrompt ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                          <span>¡Prompt Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Copiar Prompt para IA</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5 shrink-0">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instrucciones de Protección para Microsoft Excel (.xlsm):</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      <li>Abre tu archivo Excel y presiona <code>ALT + F11</code> para abrir el editor de VBA.</li>
                      <li>Haz clic en <strong>Insertar &gt; Módulo</strong> y pega el código que aparece abajo.</li>
                      <li>Para evitar que borren el código: ve a <strong>Herramientas &gt; Propiedades de VBAProject &gt; Protección</strong>, marca <em>Bloquear proyecto para visualización</em> y asigna una contraseña.</li>
                      <li>Guarda el archivo como <strong>Libro de Excel habilitado para macros (*.xlsm)</strong>.</li>
                    </ol>
                  </div>

                  {/* Tarjeta de Recomendaciones Profesionales de Seguridad Colapsable */}
                  <details className="group border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 rounded-xl overflow-hidden text-xs shrink-0 transition-all">
                    <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition-colors">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Guía Profesional de Seguridad: ¿Cómo blindar Excel al 100% contra cracking?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-600/80 font-normal hidden sm:inline">Clic para expandir / ocultar</span>
                        <ChevronDown className="w-4 h-4 text-amber-500 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>

                    <div className="p-4 pt-1 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] leading-relaxed">
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          ⚠️ Nivel 1: Contraseña VBA (Básico)
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          La contraseña nativa de Excel es útil para el 90% de usuarios comunes, pero puede ser removida con editores hexadecimales por usuarios avanzados.
                        </p>
                      </div>

                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🛡️ Nivel 2: Compilador a .EXE (Máximo)
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Para software de alto valor, compila el libro con <strong>XLS Padlock</strong> o <strong>DoneEx XCell</strong> a binario C++ (.exe) cifrado con AES-256 conectado a Tecnonets.
                        </p>
                      </div>

                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          ☁️ Nivel 3: Google Sheets (Nube)
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          En Google Sheets el código corre 100% en los servidores de Google. Es imposible que el cliente lo descargue o lo crackee en su disco local.
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* Terminal IDE Container */}
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex-1 flex flex-col min-h-[360px]">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <span className="font-mono text-slate-300 font-semibold ml-2">LicenciaTecnonets.bas</span>
                      </div>
                      <button
                        onClick={() => {
                          const code = `Attribute VB_Name = "LicenciaTecnonets"
Option Explicit

' =========================================================================================
' MODULO DE SEGURIDAD Y LICENCIAMIENTO TECNONETS
' Sistema de validacion en la nube y proteccion anti-clonacion por Hardware ID
' Web: https://tecnonets.com | Soporte y Documentacion
' =========================================================================================

' Nombre identificador de tu aplicacion para guardar la clave en el registro de Windows
Public Const TECNONETS_APP_NAME As String = "WhatsAppMasivo2026"

' Endpoints oficiales de la API de Tecnonets
Public Const TECNONETS_ACTIVATE_URL As String = "https://tecnonets.com/api/v1/licenses/activate"
Public Const TECNONETS_VALIDATE_URL As String = "https://tecnonets.com/api/v1/licenses/validate"

' -----------------------------------------------------------------------------------------
' 1. EVENTO AUTOMATICO AL ABRIR EL ARCHIVO
' -----------------------------------------------------------------------------------------
Public Sub Auto_Open()
    Dim savedKey As String
    ' Leemos la clave previamente guardada en el registro de Windows
    savedKey = Trim(GetSetting(TECNONETS_APP_NAME, "License", "Key", ""))
    
    If savedKey = "" Then
        ' Si nunca ha ingresado clave, ocultamos las hojas de trabajo y solicitamos la licencia
        BloquearLibroSilencioso
        SolicitarLicenciaExcel
    Else
        ' Si ya tiene clave registrada, verificamos en segundo plano que siga activa y con cupo
        ValidarLicenciaSilenciosa savedKey
    End If
End Sub

' -----------------------------------------------------------------------------------------
' 2. SOLICITUD DE CLAVE AL USUARIO
' -----------------------------------------------------------------------------------------
Public Sub SolicitarLicenciaExcel()
    Dim userKey As String
    userKey = InputBox("Por favor ingresa tu clave de licencia de Tecnonets (ej: TEC-XXXX-XXXX-XXXX):" & vbCrLf & vbCrLf & _
                       "Si aun no tienes una licencia activa o necesitas cupos adicionales, visita tecnonets.com", _
                       "Activacion de Licencia - Tecnonets")
    
    userKey = Trim(userKey)
    If userKey = "" Then
        BloquearLibro "Es necesario ingresar una licencia valida para desbloquear las funciones de este libro."
        Exit Sub
    End If
    
    ActivarLicenciaExcel userKey
End Sub

' -----------------------------------------------------------------------------------------
' 3. PROCESO DE ACTIVACION (REGISTRA HARDWARE ID Y CONSUME 1 CUPO)
' -----------------------------------------------------------------------------------------
Public Function ActivarLicenciaExcel(ByVal licenseKey As String) As Boolean
    Dim http As Object
    Dim hwId As String
    Dim devName As String
    Dim jsonPayload As String
    Dim responseText As String
    
    licenseKey = Trim(licenseKey)
    hwId = ObtenerHardwareID()
    devName = Environ("COMPUTERNAME")
    If devName = "" Then devName = "PC-Usuario"
    
    ' Armamos el JSON con la clave y la huella digital unica de este PC
    jsonPayload = "{""license_key"":""" & licenseKey & """,""origin_identifier"":""" & hwId & """,""device_name"":""" & devName & """}"
    
    On Error GoTo ErrorConexion
    #If VBA7 Then
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    #Else
        Set http = CreateObject("MSXML2.ServerXMLHTTP")
    #End If
    
    http.Open "POST", TECNONETS_ACTIVATE_URL, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.send jsonPayload
    
    responseText = http.responseText
    
    ' Si el servidor confirma la activacion con exito
    If InStr(1, responseText, """valid"":true", vbTextCompare) > 0 Or InStr(1, responseText, """valid"": true", vbTextCompare) > 0 Then
        SaveSetting TECNONETS_APP_NAME, "License", "Key", licenseKey
        DesbloquearLibro
        MsgBox "Excelente! Tu licencia ha sido activada y vinculada a este equipo con exito.", vbInformation, "Activacion Exitosa - Tecnonets"
        ActivarLicenciaExcel = True
    Else
        Dim motivoError As String
        If InStr(1, responseText, "limit", vbTextCompare) > 0 Or InStr(1, responseText, "cupo", vbTextCompare) > 0 Or InStr(1, responseText, "device", vbTextCompare) > 0 Then
            motivoError = "Has alcanzado el limite maximo de computadores permitidos para esta licencia. Contacta a soporte para ampliar tus cupos."
        Else
            motivoError = "La clave de licencia ingresada no es valida, ha expirado o se encuentra suspendida."
        End If
        BloquearLibro motivoError
        ActivarLicenciaExcel = False
    End If
    Exit Function

ErrorConexion:
    MsgBox "No fue posible conectar con el servidor de licencias de Tecnonets." & vbCrLf & _
           "Por favor revisa tu conexion a internet e intenta nuevamente.", vbExclamation, "Error de Conexion"
    BloquearLibro "Se requiere acceso a internet para validar y activar la licencia."
    ActivarLicenciaExcel = False
End Function

' -----------------------------------------------------------------------------------------
' 4. VALIDACION SILENCIOSA EN SEGUNDO PLANO
' -----------------------------------------------------------------------------------------
Public Function ValidarLicenciaSilenciosa(ByVal licenseKey As String, Optional ByVal MostrarAlerta As Boolean = True) As Boolean
    Dim http As Object
    Dim hwId As String
    Dim jsonPayload As String
    Dim responseText As String
    
    licenseKey = Trim(licenseKey)
    If licenseKey = "" Then
        BloquearLibro "No se encontro ninguna licencia registrada en este equipo."
        ValidarLicenciaSilenciosa = False
        Exit Function
    End If
    
    hwId = ObtenerHardwareID()
    jsonPayload = "{""license_key"":""" & licenseKey & """,""origin_identifier"":""" & hwId & """}"
    
    On Error GoTo ErrorValidacion
    #If VBA7 Then
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    #Else
        Set http = CreateObject("MSXML2.ServerXMLHTTP")
    #End If
    
    http.Open "POST", TECNONETS_VALIDATE_URL, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.send jsonPayload
    
    responseText = http.responseText
    
    If InStr(1, responseText, """valid"":true", vbTextCompare) > 0 Or InStr(1, responseText, """valid"": true", vbTextCompare) > 0 Then
        DesbloquearLibro
        ValidarLicenciaSilenciosa = True
    Else
        If MostrarAlerta Then
            BloquearLibro "Tu licencia ha expirado, esta suspendida o este computador no esta autorizado."
        Else
            BloquearLibroSilencioso
        End If
        ValidarLicenciaSilenciosa = False
    End If
    Exit Function

ErrorValidacion:
    ' En caso de micro-caida de red, permitimos continuar sin interrumpir el trabajo local
    ValidarLicenciaSilenciosa = True
End Function

' -----------------------------------------------------------------------------------------
' 5. VALIDACION PREVIA PARA BOTONES CRITICOS (EJ: BOTON ENVIAR MENSAJES)
' -----------------------------------------------------------------------------------------
Public Function VerificarLicenciaAntesDeEnvio() As Boolean
    Dim savedKey As String
    savedKey = Trim(GetSetting(TECNONETS_APP_NAME, "License", "Key", ""))
    
    If savedKey = "" Then
        MsgBox "Se requiere una licencia activa para ejecutar esta accion.", vbCritical, "Licencia Requerida"
        SolicitarLicenciaExcel
        VerificarLicenciaAntesDeEnvio = False
        Exit Function
    End If
    
    VerificarLicenciaAntesDeEnvio = ValidarLicenciaSilenciosa(savedKey, True)
End Function

' -----------------------------------------------------------------------------------------
' 6. OBTENCION DE HUELLA DIGITAL UNICA DEL PC (PLACA MADRE + PROCESADOR)
' -----------------------------------------------------------------------------------------
Public Function ObtenerHardwareID() As String
    On Error Resume Next
    Dim wmi As Object
    Dim colItems As Object
    Dim item As Object
    Dim cpuId As String, mbUuid As String, fallbackId As String
    
    cpuId = ""
    mbUuid = ""
    fallbackId = Environ("COMPUTERNAME") & "_" & Environ("USERNAME")
    
    ' Conectamos con el servicio WMI de Windows
    Set wmi = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2")
    
    If Not wmi Is Nothing Then
        ' 1. UUID de la Placa Madre
        Set colItems = wmi.ExecQuery("SELECT UUID FROM Win32_ComputerSystemProduct")
        For Each item In colItems
            If Not IsNull(item.UUID) Then
                mbUuid = Trim(CStr(item.UUID))
                If mbUuid <> "" And mbUuid <> "None" Then Exit For
            End If
        Next
        
        ' 2. Serial del Procesador
        Set colItems = wmi.ExecQuery("SELECT ProcessorId FROM Win32_Processor")
        For Each item In colItems
            If Not IsNull(item.ProcessorId) Then
                cpuId = Trim(CStr(item.ProcessorId))
                If cpuId <> "" Then Exit For
            End If
        Next
    End If
    
    ' Combinamos los seriales fisicos para crear un ID imposible de clonar
    If mbUuid <> "" And cpuId <> "" Then
        ObtenerHardwareID = "HW-" & mbUuid & "-" & cpuId
    ElseIf mbUuid <> "" Then
        ObtenerHardwareID = "HW-" & mbUuid
    ElseIf cpuId <> "" Then
        ObtenerHardwareID = "HW-" & cpuId & "-" & fallbackId
    Else
        ObtenerHardwareID = "HW-" & fallbackId
    End If
    On Error GoTo 0
End Function

' -----------------------------------------------------------------------------------------
' 7. BLOQUEO DEL LIBRO (OCULTA HOJAS CON xlSheetVeryHidden)
' -----------------------------------------------------------------------------------------
Public Sub BloquearLibro(ByVal motivo As String)
    BloquearLibroSilencioso
    If Trim(motivo) <> "" Then
        MsgBox motivo, vbCritical, "Acceso Restringido - Tecnonets"
    End If
End Sub

Public Sub BloquearLibroSilencioso()
    Dim ws As Worksheet
    Dim wsAviso As Worksheet
    
    On Error Resume Next
    ' Verificamos si existe la hoja de advertencia; si no, la creamos al inicio
    Set wsAviso = ThisWorkbook.Sheets("Aviso_Licencia")
    If wsAviso Is Nothing Then
        Set wsAviso = ThisWorkbook.Sheets.Add(Before:=ThisWorkbook.Sheets(1))
        wsAviso.Name = "Aviso_Licencia"
    End If
    
    wsAviso.Visible = xlSheetVisible
    wsAviso.Activate
    
    ' Ocultamos todas las demas hojas de trabajo de forma invisible para el usuario
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> "Aviso_Licencia" Then
            ws.Visible = xlSheetVeryHidden
        End If
    Next ws
    On Error GoTo 0
End Sub

' -----------------------------------------------------------------------------------------
' 8. DESBLOQUEO DE TODAS LAS HOJAS
' -----------------------------------------------------------------------------------------
Public Sub DesbloquearLibro()
    Dim ws As Worksheet
    Dim wsDash As Worksheet
    
    On Error Resume Next
    ' Mostramos todas las hojas del libro
    For Each ws In ThisWorkbook.Worksheets
        ws.Visible = xlSheetVisible
    Next ws
    
    ' Ocultamos la hoja de aviso si hay mas hojas disponibles
    If ThisWorkbook.Worksheets.Count > 1 Then
        Sheets("Aviso_Licencia").Visible = xlSheetVeryHidden
    End If
    
    ' Llevamos al usuario a la hoja principal
    Set wsDash = ThisWorkbook.Sheets("DASHBOARD")
    If Not wsDash Is Nothing Then
        wsDash.Activate
    Else
        ThisWorkbook.Sheets(1).Activate
    End If
    On Error GoTo 0
End Sub

' -----------------------------------------------------------------------------------------
' 9. CERRAR SESION / DESVINCULAR LICENCIA DE ESTE EQUIPO
' -----------------------------------------------------------------------------------------
Public Sub CerrarSesionLicencia()
    Dim resp As VbMsgBoxResult
    resp = MsgBox("Deseas desvincular tu licencia de este computador?", vbYesNo + vbQuestion, "Cerrar Sesion - Tecnonets")
    If resp = vbYes Then
        SaveSetting TECNONETS_APP_NAME, "License", "Key", ""
        BloquearLibro "La licencia ha sido desvinculada de este equipo correctamente."
    End If
End Sub`;
                          navigator.clipboard.writeText(code);
                          setCopiedSdk(true);
                          setTimeout(() => setCopiedSdk(false), 2000);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedSdk ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 sm:p-5 text-slate-100 text-xs sm:text-[13px] font-mono overflow-auto flex-1 leading-relaxed select-all">
{`Attribute VB_Name = "LicenciaTecnonets"
Option Explicit

' =========================================================================================
' MODULO DE SEGURIDAD Y LICENCIAMIENTO TECNONETS
' Sistema de validacion en la nube y proteccion anti-clonacion por Hardware ID
' Web: https://tecnonets.com | Soporte y Documentacion
' =========================================================================================

' Nombre identificador de tu aplicacion para guardar la clave en el registro de Windows
Public Const TECNONETS_APP_NAME As String = "WhatsAppMasivo2026"

' Endpoints oficiales de la API de Tecnonets
Public Const TECNONETS_ACTIVATE_URL As String = "https://tecnonets.com/api/v1/licenses/activate"
Public Const TECNONETS_VALIDATE_URL As String = "https://tecnonets.com/api/v1/licenses/validate"

' -----------------------------------------------------------------------------------------
' 1. EVENTO AUTOMATICO AL ABRIR EL ARCHIVO
' -----------------------------------------------------------------------------------------
Public Sub Auto_Open()
    Dim savedKey As String
    ' Leemos la clave previamente guardada en el registro de Windows
    savedKey = Trim(GetSetting(TECNONETS_APP_NAME, "License", "Key", ""))
    
    If savedKey = "" Then
        ' Si nunca ha ingresado clave, ocultamos las hojas de trabajo y solicitamos la licencia
        BloquearLibroSilencioso
        SolicitarLicenciaExcel
    Else
        ' Si ya tiene clave registrada, verificamos en segundo plano que siga activa y con cupo
        ValidarLicenciaSilenciosa savedKey
    End If
End Sub

' -----------------------------------------------------------------------------------------
' 2. SOLICITUD DE CLAVE AL USUARIO
' -----------------------------------------------------------------------------------------
Public Sub SolicitarLicenciaExcel()
    Dim userKey As String
    userKey = InputBox("Por favor ingresa tu clave de licencia de Tecnonets (ej: TEC-XXXX-XXXX-XXXX):" & vbCrLf & vbCrLf & _
                       "Si aun no tienes una licencia activa o necesitas cupos adicionales, visita tecnonets.com", _
                       "Activacion de Licencia - Tecnonets")
    
    userKey = Trim(userKey)
    If userKey = "" Then
        BloquearLibro "Es necesario ingresar una licencia valida para desbloquear las funciones de este libro."
        Exit Sub
    End If
    
    ActivarLicenciaExcel userKey
End Sub

' -----------------------------------------------------------------------------------------
' 3. PROCESO DE ACTIVACION (REGISTRA HARDWARE ID Y CONSUME 1 CUPO)
' -----------------------------------------------------------------------------------------
Public Function ActivarLicenciaExcel(ByVal licenseKey As String) As Boolean
    Dim http As Object
    Dim hwId As String
    Dim devName As String
    Dim jsonPayload As String
    Dim responseText As String
    
    licenseKey = Trim(licenseKey)
    hwId = ObtenerHardwareID()
    devName = Environ("COMPUTERNAME")
    If devName = "" Then devName = "PC-Usuario"
    
    ' Armamos el JSON con la clave y la huella digital unica de este PC
    jsonPayload = "{""license_key"":""" & licenseKey & """,""origin_identifier"":""" & hwId & """,""device_name"":""" & devName & """}"
    
    On Error GoTo ErrorConexion
    #If VBA7 Then
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    #Else
        Set http = CreateObject("MSXML2.ServerXMLHTTP")
    #End If
    
    http.Open "POST", TECNONETS_ACTIVATE_URL, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.send jsonPayload
    
    responseText = http.responseText
    
    ' Si el servidor confirma la activacion con exito
    If InStr(1, responseText, """valid"":true", vbTextCompare) > 0 Or InStr(1, responseText, """valid"": true", vbTextCompare) > 0 Then
        SaveSetting TECNONETS_APP_NAME, "License", "Key", licenseKey
        DesbloquearLibro
        MsgBox "Excelente! Tu licencia ha sido activada y vinculada a este equipo con exito.", vbInformation, "Activacion Exitosa - Tecnonets"
        ActivarLicenciaExcel = True
    Else
        Dim motivoError As String
        If InStr(1, responseText, "limit", vbTextCompare) > 0 Or InStr(1, responseText, "cupo", vbTextCompare) > 0 Or InStr(1, responseText, "device", vbTextCompare) > 0 Then
            motivoError = "Has alcanzado el limite maximo de computadores permitidos para esta licencia. Contacta a soporte para ampliar tus cupos."
        Else
            motivoError = "La clave de licencia ingresada no es valida, ha expirado o se encuentra suspendida."
        End If
        BloquearLibro motivoError
        ActivarLicenciaExcel = False
    End If
    Exit Function

ErrorConexion:
    MsgBox "No fue posible conectar con el servidor de licencias de Tecnonets." & vbCrLf & _
           "Por favor revisa tu conexion a internet e intenta nuevamente.", vbExclamation, "Error de Conexion"
    BloquearLibro "Se requiere acceso a internet para validar y activar la licencia."
    ActivarLicenciaExcel = False
End Function

' -----------------------------------------------------------------------------------------
' 4. VALIDACION SILENCIOSA EN SEGUNDO PLANO
' -----------------------------------------------------------------------------------------
Public Function ValidarLicenciaSilenciosa(ByVal licenseKey As String, Optional ByVal MostrarAlerta As Boolean = True) As Boolean
    Dim http As Object
    Dim hwId As String
    Dim jsonPayload As String
    Dim responseText As String
    
    licenseKey = Trim(licenseKey)
    If licenseKey = "" Then
        BloquearLibro "No se encontro ninguna licencia registrada en este equipo."
        ValidarLicenciaSilenciosa = False
        Exit Function
    End If
    
    hwId = ObtenerHardwareID()
    jsonPayload = "{""license_key"":""" & licenseKey & """,""origin_identifier"":""" & hwId & """}"
    
    On Error GoTo ErrorValidacion
    #If VBA7 Then
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    #Else
        Set http = CreateObject("MSXML2.ServerXMLHTTP")
    #End If
    
    http.Open "POST", TECNONETS_VALIDATE_URL, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Accept", "application/json"
    http.send jsonPayload
    
    responseText = http.responseText
    
    If InStr(1, responseText, """valid"":true", vbTextCompare) > 0 Or InStr(1, responseText, """valid"": true", vbTextCompare) > 0 Then
        DesbloquearLibro
        ValidarLicenciaSilenciosa = True
    Else
        If MostrarAlerta Then
            BloquearLibro "Tu licencia ha expirado, esta suspendida o este computador no esta autorizado."
        Else
            BloquearLibroSilencioso
        End If
        ValidarLicenciaSilenciosa = False
    End If
    Exit Function

ErrorValidacion:
    ' En caso de micro-caida de red, permitimos continuar sin interrumpir el trabajo local
    ValidarLicenciaSilenciosa = True
End Function

' -----------------------------------------------------------------------------------------
' 5. VALIDACION PREVIA PARA BOTONES CRITICOS (EJ: BOTON ENVIAR MENSAJES)
' -----------------------------------------------------------------------------------------
Public Function VerificarLicenciaAntesDeEnvio() As Boolean
    Dim savedKey As String
    savedKey = Trim(GetSetting(TECNONETS_APP_NAME, "License", "Key", ""))
    
    If savedKey = "" Then
        MsgBox "Se requiere una licencia activa para ejecutar esta accion.", vbCritical, "Licencia Requerida"
        SolicitarLicenciaExcel
        VerificarLicenciaAntesDeEnvio = False
        Exit Function
    End If
    
    VerificarLicenciaAntesDeEnvio = ValidarLicenciaSilenciosa(savedKey, True)
End Function

' -----------------------------------------------------------------------------------------
' 6. OBTENCION DE HUELLA DIGITAL UNICA DEL PC (PLACA MADRE + PROCESADOR)
' -----------------------------------------------------------------------------------------
Public Function ObtenerHardwareID() As String
    On Error Resume Next
    Dim wmi As Object
    Dim colItems As Object
    Dim item As Object
    Dim cpuId As String, mbUuid As String, fallbackId As String
    
    cpuId = ""
    mbUuid = ""
    fallbackId = Environ("COMPUTERNAME") & "_" & Environ("USERNAME")
    
    ' Conectamos con el servicio WMI de Windows
    Set wmi = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2")
    
    If Not wmi Is Nothing Then
        ' 1. UUID de la Placa Madre
        Set colItems = wmi.ExecQuery("SELECT UUID FROM Win32_ComputerSystemProduct")
        For Each item In colItems
            If Not IsNull(item.UUID) Then
                mbUuid = Trim(CStr(item.UUID))
                If mbUuid <> "" And mbUuid <> "None" Then Exit For
            End If
        Next
        
        ' 2. Serial del Procesador
        Set colItems = wmi.ExecQuery("SELECT ProcessorId FROM Win32_Processor")
        For Each item In colItems
            If Not IsNull(item.ProcessorId) Then
                cpuId = Trim(CStr(item.ProcessorId))
                If cpuId <> "" Then Exit For
            End If
        Next
    End If
    
    ' Combinamos los seriales fisicos para crear un ID imposible de clonar
    If mbUuid <> "" And cpuId <> "" Then
        ObtenerHardwareID = "HW-" & mbUuid & "-" & cpuId
    ElseIf mbUuid <> "" Then
        ObtenerHardwareID = "HW-" & mbUuid
    ElseIf cpuId <> "" Then
        ObtenerHardwareID = "HW-" & cpuId & "-" & fallbackId
    Else
        ObtenerHardwareID = "HW-" & fallbackId
    End If
    On Error GoTo 0
End Function

' -----------------------------------------------------------------------------------------
' 7. BLOQUEO DEL LIBRO (OCULTA HOJAS CON xlSheetVeryHidden)
' -----------------------------------------------------------------------------------------
Public Sub BloquearLibro(ByVal motivo As String)
    BloquearLibroSilencioso
    If Trim(motivo) <> "" Then
        MsgBox motivo, vbCritical, "Acceso Restringido - Tecnonets"
    End If
End Sub

Public Sub BloquearLibroSilencioso()
    Dim ws As Worksheet
    Dim wsAviso As Worksheet
    
    On Error Resume Next
    ' Verificamos si existe la hoja de advertencia; si no, la creamos al inicio
    Set wsAviso = ThisWorkbook.Sheets("Aviso_Licencia")
    If wsAviso Is Nothing Then
        Set wsAviso = ThisWorkbook.Sheets.Add(Before:=ThisWorkbook.Sheets(1))
        wsAviso.Name = "Aviso_Licencia"
    End If
    
    wsAviso.Visible = xlSheetVisible
    wsAviso.Activate
    
    ' Ocultamos todas las demas hojas de trabajo de forma invisible para el usuario
    For Each ws In ThisWorkbook.Worksheets
        If ws.Name <> "Aviso_Licencia" Then
            ws.Visible = xlSheetVeryHidden
        End If
    Next ws
    On Error GoTo 0
End Sub

' -----------------------------------------------------------------------------------------
' 8. DESBLOQUEO DE TODAS LAS HOJAS
' -----------------------------------------------------------------------------------------
Public Sub DesbloquearLibro()
    Dim ws As Worksheet
    Dim wsDash As Worksheet
    
    On Error Resume Next
    ' Mostramos todas las hojas del libro
    For Each ws In ThisWorkbook.Worksheets
        ws.Visible = xlSheetVisible
    Next ws
    
    ' Ocultamos la hoja de aviso si hay mas hojas disponibles
    If ThisWorkbook.Worksheets.Count > 1 Then
        Sheets("Aviso_Licencia").Visible = xlSheetVeryHidden
    End If
    
    ' Llevamos al usuario a la hoja principal
    Set wsDash = ThisWorkbook.Sheets("DASHBOARD")
    If Not wsDash Is Nothing Then
        wsDash.Activate
    Else
        ThisWorkbook.Sheets(1).Activate
    End If
    On Error GoTo 0
End Sub

' -----------------------------------------------------------------------------------------
' 9. CERRAR SESION / DESVINCULAR LICENCIA DE ESTE EQUIPO
' -----------------------------------------------------------------------------------------
Public Sub CerrarSesionLicencia()
    Dim resp As VbMsgBoxResult
    resp = MsgBox("Deseas desvincular tu licencia de este computador?", vbYesNo + vbQuestion, "Cerrar Sesion - Tecnonets")
    If resp = vbYes Then
        SaveSetting TECNONETS_APP_NAME, "License", "Key", ""
        BloquearLibro "La licencia ha sido desvinculada de este equipo correctamente."
    End If
End Sub`}
                    </pre>
                  </div>
                </div>
              )}

              {/* JAVASCRIPT / NODE.JS */}
              {sdkLanguage === 'js' && (
                <div className="space-y-3.5 flex flex-col h-full">
                  {/* Banner de Prompt para IA */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Prompt listo para pasarle a otra IA (ChatGPT, Claude, Cursor)</span>
                          <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">1 Clic</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Incluye el código JavaScript y las directivas para proteger tu App Web, Node.js, React o Electron.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const promptText = `Actúa como un desarrollador Senior en JavaScript / TypeScript.
Necesito proteger mi aplicación (Web, API Node.js, Electron o React) conectándola al sistema de licenciamiento de Tecnonets.

A continuación te entrego el módulo de validación (tecnonetsLicense.js):

\`\`\`javascript
async function enforceLicenseGuard(licenseKey, machineOrDomainId) {
  try {
    const response = await fetch('https://tecnonets.com/api/v1/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        origin_identifier: machineOrDomainId,
        device_name: typeof window !== 'undefined' ? window.location.hostname : 'Node.js Backend'
      })
    });

    const data = await response.json();

    if (data.valid) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('TECNONETS_KEY', licenseKey);
        localStorage.setItem('TECNONETS_LEASE', data.leaseToken || '');
      }
      return data;
    } else {
      handleLicenseLockout(data.message || 'Licencia inválida o expirada.');
      throw new Error(data.message);
    }
  } catch (err) {
    handleLicenseLockout(err.message);
    throw err;
  }
}

function handleLicenseLockout(reason) {
  if (typeof window !== 'undefined') {
    alert('Acceso restringido: ' + reason);
    window.location.href = 'https://tecnonets.com/tienda';
  } else if (typeof process !== 'undefined') {
    console.error('Proceso detenido por licencia no valida:', reason);
    process.exit(1);
  }
}
\`\`\`

INSTRUCCIONES PARA TI:
1. Integra enforceLicenseGuard en el flujo de arranque de mi aplicación o en el Middleware / Server Action antes de renderizar la interfaz o procesar datos.
2. Asegúrate de enviar un identificador persistente único (machineOrDomainId) para que el servidor controle el límite de dispositivos/cupos.
3. Si el servidor responde que la licencia no es válida, bloquea el acceso mediante handleLicenseLockout.`;
                        navigator.clipboard.writeText(promptText);
                        setCopiedAiPrompt(true);
                        setTimeout(() => setCopiedAiPrompt(false), 2000);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      {copiedAiPrompt ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                          <span>¡Prompt Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Copiar Prompt para IA</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 shrink-0">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Integración para JavaScript / Node.js / React:</span>
                    </p>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                      Función asíncrona compatible con Web Apps, scripts de Node.js, aplicaciones Electron o React.
                    </p>
                  </div>

                  {/* Tarjeta de Seguridad JavaScript Colapsable */}
                  <details className="group border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 rounded-xl overflow-hidden text-xs shrink-0 transition-all">
                    <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-500/10 transition-colors">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Guía Anti-Manipulación para JavaScript / Web</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-blue-600/80 font-normal hidden sm:inline">Clic para expandir / ocultar</span>
                        <ChevronDown className="w-4 h-4 text-blue-600 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="p-4 pt-1 border-t border-blue-500/20 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] leading-relaxed">
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-blue-200/70 dark:border-blue-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🛡️ 1. Validación en Servidor
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Nunca valides solo en el navegador (DevTools / F12). Ejecuta la verificación en tus API Routes o Server Actions antes de liberar datos sensibles.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-blue-200/70 dark:border-blue-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🔀 2. Ofuscación de Código
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          En apps de escritorio Electron o scripts frontend, ofusca el código con <strong>JavaScript-Obfuscator</strong> o <strong>Terser</strong> para impedir la lectura del código fuente.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-blue-200/70 dark:border-blue-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🔑 3. Lease Tokens Criptográficos
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Utiliza el token firmado con HMAC entregado por Tecnonets para validar la vigencia offline hasta por 7 días de forma segura.
                        </p>
                      </div>
                    </div>
                  </details>

                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex-1 flex flex-col min-h-[360px]">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <span className="font-mono text-slate-300 font-semibold ml-2">tecnonetsLicense.js</span>
                      </div>
                      <button
                        onClick={() => {
                          const code = `async function enforceLicenseGuard(licenseKey, machineOrDomainId) {
  try {
    const response = await fetch('https://tecnonets.com/api/v1/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        origin_identifier: machineOrDomainId,
        device_name: typeof window !== 'undefined' ? window.location.hostname : 'Node.js Backend'
      })
    });

    const data = await response.json();

    if (data.valid) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('TECNONETS_KEY', licenseKey);
        localStorage.setItem('TECNONETS_LEASE', data.leaseToken || '');
      }
      return data;
    } else {
      handleLicenseLockout(data.message || 'Licencia inválida o expirada.');
      throw new Error(data.message);
    }
  } catch (err) {
    handleLicenseLockout(err.message);
    throw err;
  }
}

function handleLicenseLockout(reason) {
  if (typeof window !== 'undefined') {
    alert('Acceso restringido: ' + reason);
    window.location.href = 'https://tecnonets.com/tienda';
  } else if (typeof process !== 'undefined') {
    console.error('Proceso detenido por licencia no valida:', reason);
    process.exit(1);
  }
}`;
                          navigator.clipboard.writeText(code);
                          setCopiedSdk(true);
                          setTimeout(() => setCopiedSdk(false), 2000);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedSdk ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 sm:p-5 text-slate-100 text-xs sm:text-[13px] font-mono overflow-auto flex-1 leading-relaxed select-all">
{`async function enforceLicenseGuard(licenseKey, machineOrDomainId) {
  try {
    const response = await fetch('https://tecnonets.com/api/v1/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        origin_identifier: machineOrDomainId,
        device_name: typeof window !== 'undefined' ? window.location.hostname : 'Node.js Backend'
      })
    });

    const data = await response.json();

    if (data.valid) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('TECNONETS_KEY', licenseKey);
        localStorage.setItem('TECNONETS_LEASE', data.leaseToken || '');
      }
      return data;
    } else {
      handleLicenseLockout(data.message || 'Licencia inválida o expirada.');
      throw new Error(data.message);
    }
  } catch (err) {
    handleLicenseLockout(err.message);
    throw err;
  }
}

function handleLicenseLockout(reason) {
  if (typeof window !== 'undefined') {
    alert('Acceso restringido: ' + reason);
    window.location.href = 'https://tecnonets.com/tienda';
  } else if (typeof process !== 'undefined') {
    console.error('Proceso detenido por licencia no valida:', reason);
    process.exit(1);
  }
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* PYTHON */}
              {sdkLanguage === 'python' && (
                <div className="space-y-3.5 flex flex-col h-full">
                  {/* Banner de Prompt para IA */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Prompt listo para pasarle a otra IA (ChatGPT, Claude, Cursor)</span>
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">1 Clic</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Incluye el script de Python y las instrucciones de compilación / seguridad para apps de escritorio.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const promptText = `Actúa como un desarrollador Senior en Python para software de escritorio y CLI.
Necesito proteger mi software en Python conectándolo a la API de licencias de Tecnonets.

A continuación te entrego el módulo oficial de validación (license_validator.py):

\`\`\`python
import sys
import platform
import requests

TECNONETS_ACTIVATE_URL = "https://tecnonets.com/api/v1/licenses/activate"
TECNONETS_VALIDATE_URL = "https://tecnonets.com/api/v1/licenses/validate"

def enforce_license_or_exit(license_key: str, machine_id: str = None):
    """Valida la licencia y finaliza la aplicacion si no es valida."""
    if not machine_id:
        machine_id = f"{platform.node()}_{platform.system()}"
        
    payload = {
        "license_key": license_key,
        "origin_identifier": machine_id,
        "device_name": platform.node()
    }
    
    try:
        response = requests.post(TECNONETS_ACTIVATE_URL, json=payload, timeout=10)
        data = response.json()
        
        if data.get("valid"):
            return data
        else:
            motivo = data.get("message", "Licencia inválida o expirada.")
            print(f"Acceso denegado: {motivo}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con el servidor de licencias: {e}")
        sys.exit(1)

# Ejemplo de uso al arrancar:
# enforce_license_or_exit("TEC-XXXX-XXXX-XXXX")
\`\`\`

INSTRUCCIONES PARA TI:
1. Explícame cómo invocar enforce_license_or_exit al iniciar el archivo principal (main.py) antes de abrir la interfaz gráfica (PyQt, Tkinter) o ejecutar la lógica.
2. Si la clave es inválida o superó el límite de activaciones en hardware, confirma que la aplicación se cierre con sys.exit(1).
3. Recomiéndame cómo compilar el script con Nuitka, PyArmor o Cython para convertirlo en un binario ejecutable protegido contra ingeniería inversa.`;
                        navigator.clipboard.writeText(promptText);
                        setCopiedAiPrompt(true);
                        setTimeout(() => setCopiedAiPrompt(false), 2000);
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      {copiedAiPrompt ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                          <span>¡Prompt Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Copiar Prompt para IA</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 shrink-0">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Integración para Python / Apps de Escritorio:</span>
                    </p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      Snippet listo para integrar en interfaces PyQt, Tkinter, scripts de consola o APIs backend con sistema de bloqueo automático.
                    </p>
                  </div>

                  {/* Tarjeta de Seguridad Python Colapsable */}
                  <details className="group border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 rounded-xl overflow-hidden text-xs shrink-0 transition-all">
                    <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition-colors">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Guía Anti-Descompilación para Python Desktop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-600/80 font-normal hidden sm:inline">Clic para expandir / ocultar</span>
                        <ChevronDown className="w-4 h-4 text-amber-600 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="p-4 pt-1 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] leading-relaxed">
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          ⚠️ 1. Riesgo de archivos .pyc
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Los archivos estándar (.py y .pyc) pueden descompilarse fácilmente con herramientas como <code className="font-bold text-amber-700">uncompyle6</code>.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🛡️ 2. Compilar con Cython / Nuitka
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Convierte el código crítico a binarios nativos C (<code className="font-bold">.pyd / .so</code>) con <strong>Cython</strong> o compila a ejecutable directo con <strong>Nuitka / PyArmor</strong>.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/70 dark:border-amber-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          ☁️ 3. Lógica Clave en Servidor
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Mantén las operaciones propietarias en la API de Tecnonets y utiliza la aplicación de escritorio como un cliente autenticado.
                        </p>
                      </div>
                    </div>
                  </details>

                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex-1 flex flex-col min-h-[360px]">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <span className="font-mono text-slate-300 font-semibold ml-2">license_validator.py</span>
                      </div>
                      <button
                        onClick={() => {
                          const code = `import sys
import platform
import requests

TECNONETS_ACTIVATE_URL = "https://tecnonets.com/api/v1/licenses/activate"
TECNONETS_VALIDATE_URL = "https://tecnonets.com/api/v1/licenses/validate"

def enforce_license_or_exit(license_key: str, machine_id: str = None):
    """Valida la licencia y finaliza la aplicacion si no es valida."""
    if not machine_id:
        machine_id = f"{platform.node()}_{platform.system()}"
        
    payload = {
        "license_key": license_key,
        "origin_identifier": machine_id,
        "device_name": platform.node()
    }
    
    try:
        response = requests.post(TECNONETS_ACTIVATE_URL, json=payload, timeout=10)
        data = response.json()
        
        if data.get("valid"):
            return data
        else:
            motivo = data.get("message", "Licencia inválida o expirada.")
            print(f"Acceso denegado: {motivo}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con el servidor de licencias: {e}")
        sys.exit(1)

# enforce_license_or_exit("TEC-XXXX-XXXX-XXXX")`;
                          navigator.clipboard.writeText(code);
                          setCopiedSdk(true);
                          setTimeout(() => setCopiedSdk(false), 2000);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedSdk ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 sm:p-5 text-slate-100 text-xs sm:text-[13px] font-mono overflow-auto flex-1 leading-relaxed select-all">
{`import sys
import platform
import requests

TECNONETS_ACTIVATE_URL = "https://tecnonets.com/api/v1/licenses/activate"
TECNONETS_VALIDATE_URL = "https://tecnonets.com/api/v1/licenses/validate"

def enforce_license_or_exit(license_key: str, machine_id: str = None):
    """Valida la licencia y finaliza la aplicacion si no es valida."""
    if not machine_id:
        machine_id = f"{platform.node()}_{platform.system()}"
        
    payload = {
        "license_key": license_key,
        "origin_identifier": machine_id,
        "device_name": platform.node()
    }
    
    try:
        response = requests.post(TECNONETS_ACTIVATE_URL, json=payload, timeout=10)
        data = response.json()
        
        if data.get("valid"):
            return data
        else:
            motivo = data.get("message", "Licencia inválida o expirada.")
            print(f"Acceso denegado: {motivo}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con el servidor de licencias: {e}")
        sys.exit(1)

# enforce_license_or_exit("TEC-XXXX-XXXX-XXXX")`}
                    </pre>
                  </div>
                </div>
              )}

              {/* CURL / HTTP REST */}
              {sdkLanguage === 'curl' && (
                <div className="space-y-3.5 flex flex-col h-full">
                  {/* Banner de Prompt para IA */}
                  <div className="p-3.5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Prompt listo para pasarle a otra IA (ChatGPT, Claude, Cursor)</span>
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded">1 Clic</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Especificación completa de endpoints y contratos JSON para integrar en cualquier backend.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const promptText = `Actúa como un arquitecto de software backend.
Necesito integrar el sistema de validación de licencias de Tecnonets en mi API o servicio usando peticiones HTTP REST.

Endpoints Oficiales de Tecnonets:
- Activación (Vincular dispositivo / consumir cupo): POST https://tecnonets.com/api/v1/licenses/activate
- Validación periódica (Heartbeat): POST https://tecnonets.com/api/v1/licenses/validate
- Desvinculación (Liberar cupo / desinstalar): POST https://tecnonets.com/api/v1/licenses/deactivate

Payload JSON estándar:
\`\`\`json
{
  "license_key": "TEC-XXXX-XXXX-XXXX",
  "origin_identifier": "ID_UNICO_DE_DISPOSITIVO_O_HOJA",
  "device_name": "Nombre opcional del equipo"
}
\`\`\`

Respuesta JSON del Servidor:
\`\`\`json
{
  "valid": true,
  "status": "active",
  "leaseToken": "TOKEN_HMAC_FIRMA_CRIPTO",
  "message": "Licencia activada correctamente."
}
\`\`\`

INSTRUCCIONES PARA TI:
1. Crea un módulo o cliente HTTP que realice la llamada a /activate al registrar la aplicación y a /validate periódicamente.
2. Si "valid" es true, permite la ejecución y guarda el leaseToken.
3. Si "valid" es false, deniega el acceso con el mensaje retornado.`;
                        navigator.clipboard.writeText(promptText);
                        setCopiedAiPrompt(true);
                        setTimeout(() => setCopiedAiPrompt(false), 2000);
                      }}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      {copiedAiPrompt ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                          <span>¡Prompt Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Copiar Prompt para IA</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-xl text-xs text-purple-800 dark:text-purple-300 shrink-0">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Comandos REST para Terminal / Postman:</span>
                    </p>
                    <p className="mt-1 text-xs text-purple-700 dark:text-purple-400">
                      Endpoints oficiales para probar la activación, validación y liberación de cupos en cualquier cliente HTTP.
                    </p>
                  </div>

                  {/* Tarjeta de Seguridad cURL / APIs Colapsable */}
                  <details className="group border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 rounded-xl overflow-hidden text-xs shrink-0 transition-all">
                    <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none font-bold text-purple-800 dark:text-purple-300 hover:bg-purple-500/10 transition-colors">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Guía de Seguridad en Integraciones API / REST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-purple-600/80 font-normal hidden sm:inline">Clic para expandir / ocultar</span>
                        <ChevronDown className="w-4 h-4 text-purple-600 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="p-4 pt-1 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] leading-relaxed">
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-purple-200/70 dark:border-purple-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🔒 1. HTTPS Obligatorio (TLS 1.3)
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Toda comunicación viaja 100% cifrada. Evita ataques Man-in-the-Middle y sniffing de claves en redes públicas.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-purple-200/70 dark:border-purple-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          ⏱️ 2. Rate Limiting Automático
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          La API de Tecnonets limita intentos de fuerza bruta por IP y detecta automáticamente peticiones fraudulentas concurrentes.
                        </p>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-purple-200/70 dark:border-purple-900/50 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          🛡️ 3. Machine Fingerprinting
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Envía siempre un <code className="font-bold">origin_identifier</code> único (UUID o ID de hardware) para vincular y controlar los slots autorizados.
                        </p>
                      </div>
                    </div>
                  </details>

                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex-1 flex flex-col min-h-[360px]">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <span className="font-mono text-slate-300 font-semibold ml-2">curl-commands.sh</span>
                      </div>
                      <button
                        onClick={() => {
                          const code = `# Activar dispositivo u hoja
curl -X POST https://tecnonets.com/api/v1/licenses/activate \\
  -H "Content-Type: application/json" \\
  -d '{"license_key": "TEC-XXXX-XXXX-XXXX", "origin_identifier": "ID_HOJA_O_EQUIPO", "device_name": "Laptop Oficina"}'

# Validar estado (heartbeat)
curl -X POST https://tecnonets.com/api/v1/licenses/validate \\
  -H "Content-Type: application/json" \\
  -d '{"license_key": "TEC-XXXX-XXXX-XXXX", "origin_identifier": "ID_HOJA_O_EQUIPO"}'

# 3. DESVINCULAR DISPOSITIVO (LIBERAR CUPO)
curl -X POST https://tecnonets.com/api/v1/licenses/deactivate \\
  -H "Content-Type: application/json" \\
  -d '{"license_key": "TEC-XXXX-XXXX-XXXX", "origin_identifier": "ID_HOJA_O_EQUIPO"}'`;
                          navigator.clipboard.writeText(code);
                          setCopiedSdk(true);
                          setTimeout(() => setCopiedSdk(false), 2000);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedSdk ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 sm:p-5 text-slate-100 text-xs sm:text-[13px] font-mono overflow-auto flex-1 leading-relaxed select-all">
{`# 1. ACTIVAR DISPOSITIVO / HOJA
curl -X POST https://tecnonets.com/api/v1/licenses/activate \\
  -H "Content-Type: application/json" \\
  -d '{"license_key": "TEC-XXXX-XXXX-XXXX", "origin_identifier": "ID_HOJA_O_EQUIPO", "device_name": "Laptop Oficina"}'

# 2. VALIDAR ESTADO (HEARTBEAT)
curl -X POST https://tecnonets.com/api/v1/licenses/validate \\
  -H "Content-Type: application/json" \\
  -d '{"license_key": "TEC-XXXX-XXXX-XXXX", "origin_identifier": "ID_HOJA_O_EQUIPO"}'

# 3. DESVINCULAR DISPOSITIVO (LIBERAR CUPO)
curl -X POST https://tecnonets.com/api/v1/licenses/deactivate \\
  -H "Content-Type: application/json" \\
  -d '{"license_key": "TEC-XXXX-XXXX-XXXX", "origin_identifier": "ID_HOJA_O_EQUIPO"}'`}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                🔒 API oficial de licenciamiento y telemetría de Tecnonets.
              </span>
              <button
                onClick={() => setShowSdkModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-xs ml-auto"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
