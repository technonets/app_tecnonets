-- ==============================================================================
-- TECNONETS MASTER DATABASE SCHEMA (PostgreSQL / Supabase)
-- Arquitectura: Multi-Rol (Admin, Staff, Partner/Vendedor, Cliente),
-- Licenciamiento Dinámico (Trials/Vigencias), Comisiones de Afiliados,
-- Almacenamiento de Archivos, Control de Órdenes y CMS de Blogs.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMERACIONES Y TIPOS
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'staff', 'partner', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_status_type AS ENUM ('trial', 'active', 'expired', 'suspended', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_delivery_type AS ENUM ('FILE_DOWNLOAD', 'GOOGLE_SHEET_TEMPLATE', 'WEB_PROJECT', 'SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE commission_status_type AS ENUM ('pending', 'approved', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: PROFILES (Extensión de auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    company_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TABLA: USER_ROLES (Asignación de roles y permisos)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, role)
);

-- 5. TABLA: PRODUCTS (Catálogo de Productos y Servicios)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    monthly_price NUMERIC(12, 2),
    category TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    delivery_type product_delivery_type NOT NULL DEFAULT 'GOOGLE_SHEET_TEMPLATE',
    file_path TEXT, -- Ruta en Supabase Storage si es FILE_DOWNLOAD
    demo_url TEXT,
    template_url TEXT, -- URL de Google Sheets (/copy) o Web
    tutorial_url TEXT,
    requires_license BOOLEAN NOT NULL DEFAULT true,
    has_trial BOOLEAN NOT NULL DEFAULT true,
    default_trial_days INTEGER NOT NULL DEFAULT 14,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABLA: PARTNER_AGREEMENTS (Reglas de Comisión por Vendedor/Afiliado)
CREATE TABLE IF NOT EXISTS public.partner_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE, -- NULL significa aplica a todos los productos
    referral_code TEXT NOT NULL UNIQUE, -- Código de referido (ej: JUAN20)
    commission_percentage NUMERIC(5, 2) DEFAULT 20.00, -- Ej. 20.00%
    fixed_commission_amount NUMERIC(12, 2) DEFAULT 0.00, -- Monto fijo si aplica
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TABLA: LICENSES (Motor de Licencias)
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_key TEXT NOT NULL UNIQUE, -- Ej: TEC-ABCD-1234-EF56
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Vendedor que originó la venta
    status license_status_type NOT NULL DEFAULT 'trial',
    is_trial BOOLEAN NOT NULL DEFAULT true,
    trial_days INTEGER NOT NULL DEFAULT 14,
    trial_ends_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- NULL para licencias vitalicias (Lifetime)
    max_activations INTEGER NOT NULL DEFAULT 1,
    current_activations INTEGER NOT NULL DEFAULT 0,
    allowed_origins TEXT[] DEFAULT ARRAY[]::TEXT[], -- Dominios permitidos o Google Sheet IDs
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. TABLA: LICENSE_LOGS (Telemetría de validación y prevención de piratería)
CREATE TABLE IF NOT EXISTS public.license_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    origin_identifier TEXT, -- Dominio web o ID de Google Sheet
    ip_address TEXT,
    user_agent TEXT,
    is_valid BOOLEAN NOT NULL,
    message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. TABLA: ORDERS (Registro de Compras / Ventas)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    status order_status_type NOT NULL DEFAULT 'completed',
    payment_gateway TEXT DEFAULT 'manual', -- stripe, wompi, paypal, manual
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. TABLA: ORDER_ITEMS (Detalle de productos en una compra)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
    price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. TABLA: COMMISSIONS (Liquidación de Comisiones a Vendedores)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status commission_status_type NOT NULL DEFAULT 'pending',
    notes TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. TABLA: POSTS (CMS de Blogs Dinámicos)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL, -- Markdown o HTML
    cover_image TEXT,
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    locale TEXT NOT NULL DEFAULT 'es',
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 13. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ==============================================================================

-- Función para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar trigger a tablas con updated_at
CREATE TRIGGER trigger_update_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_licenses BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_agreements BEFORE UPDATE ON public.partner_agreements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_posts BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Rol por defecto: customer
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función auxiliar para verificar si un usuario tiene un rol específico (Útil en RLS)
CREATE OR REPLACE FUNCTION public.has_role(target_role user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = target_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 14. SEGURIDAD Y POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Politica: PROFILES
CREATE POLICY "Profiles son visibles por su dueño o admin/staff" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.has_role('admin') OR public.has_role('staff'));

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politica: USER_ROLES
CREATE POLICY "Roles visibles por su dueño o admin" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin'));

CREATE POLICY "Solo admin puede gestionar roles" ON public.user_roles
    FOR ALL USING (public.has_role('admin'));

-- Politica: PRODUCTS
CREATE POLICY "Productos activos son públicos" ON public.products
    FOR SELECT USING (is_active = true OR public.has_role('admin') OR public.has_role('staff'));

CREATE POLICY "Solo admin/staff puede modificar productos" ON public.products
    FOR ALL USING (public.has_role('admin') OR public.has_role('staff'));

-- Politica: LICENSES
CREATE POLICY "Clientes ven sus licencias" ON public.licenses
    FOR SELECT USING (
        auth.uid() = customer_id 
        OR (auth.uid() = seller_id AND public.has_role('partner')) 
        OR public.has_role('admin') 
        OR public.has_role('staff')
    );

CREATE POLICY "Solo admin/staff puede gestionar licencias" ON public.licenses
    FOR ALL USING (public.has_role('admin') OR public.has_role('staff'));

-- Politica: ORDERS & ORDER_ITEMS
CREATE POLICY "Usuarios ven sus órdenes" ON public.orders
    FOR SELECT USING (
        auth.uid() = customer_id 
        OR auth.uid() = seller_id 
        OR public.has_role('admin') 
        OR public.has_role('staff')
    );

CREATE POLICY "Items de orden visibles por los mismos autorizados" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.customer_id = auth.uid() OR orders.seller_id = auth.uid() OR public.has_role('admin') OR public.has_role('staff'))
        )
    );

-- Politica: COMMISSIONS
CREATE POLICY "Vendedores ven sus comisiones" ON public.commissions
    FOR SELECT USING (auth.uid() = seller_id OR public.has_role('admin'));

CREATE POLICY "Solo admin puede crear o modificar comisiones" ON public.commissions
    FOR ALL USING (public.has_role('admin'));

-- Politica: PARTNER_AGREEMENTS
CREATE POLICY "Vendedores ven sus acuerdos" ON public.partner_agreements
    FOR SELECT USING (auth.uid() = seller_id OR public.has_role('admin'));

CREATE POLICY "Solo admin puede gestionar acuerdos de vendedor" ON public.partner_agreements
    FOR ALL USING (public.has_role('admin'));

-- Politica: POSTS (Blogs)
CREATE POLICY "Blogs publicados son públicos" ON public.posts
    FOR SELECT USING (is_published = true OR public.has_role('admin') OR public.has_role('staff'));

CREATE POLICY "Solo admin/staff puede escribir blogs" ON public.posts
    FOR ALL USING (public.has_role('admin') OR public.has_role('staff'));

-- Politica: LICENSE_LOGS
CREATE POLICY "Solo admin y staff ven logs de telemetría" ON public.license_logs
    FOR SELECT USING (public.has_role('admin') OR public.has_role('staff'));

-- ==============================================================================
-- 8. EXTENSIÓN: CUPONES DE DESCUENTO Y PROMOCIONES
-- ==============================================================================

-- Modificaciones a Products para soportar Precios de Lanzamiento y Ofertas Temporales
ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS promotional_price NUMERIC(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS promo_ends_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_free_launch BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS free_until TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS max_promo_units INTEGER DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS promo_units_sold INTEGER DEFAULT 0;

-- Tabla de Cupones de Descuento
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_purchase_amount NUMERIC(10,2) DEFAULT 0,
    max_discount_amount NUMERIC(10,2) DEFAULT NULL,
    usage_limit INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_product_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar RLS en Cupones
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de cupones activos para validación" ON public.coupons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Solo admin puede crear y editar cupones" ON public.coupons
    FOR ALL USING (public.has_role('admin') OR public.has_role('staff'));
