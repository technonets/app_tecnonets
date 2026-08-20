export type UserRole = 'admin' | 'staff' | 'partner' | 'customer';
export type LicenseStatus = 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled';
export type ProductDeliveryType = 'FILE_DOWNLOAD' | 'GOOGLE_SHEET_TEMPLATE' | 'WEB_PROJECT' | 'SERVICE';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface ProductRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  price: number;
  monthly_price?: number | null;
  category: string;
  images: string[];
  tags: string[];
  delivery_type: ProductDeliveryType;
  file_path?: string | null;
  demo_url?: string | null;
  template_url?: string | null;
  tutorial_url?: string | null;
  requires_license: boolean;
  has_trial: boolean;
  default_trial_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LicenseRecord {
  id: string;
  license_key: string;
  product_id: string;
  customer_id: string;
  seller_id?: string | null;
  status: LicenseStatus;
  is_trial: boolean;
  trial_days: number;
  trial_ends_at?: string | null;
  expires_at?: string | null;
  billing_cycle?: 'lifetime' | 'monthly' | 'yearly' | 'trial';
  grace_period_ends_at?: string | null;
  max_activations: number;
  current_activations: number;
  allowed_origins: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joins opcionales
  product?: ProductRecord;
  customer?: Profile;
  seller?: Profile;
}

export interface LicenseLogRecord {
  id: string;
  license_id: string;
  origin_identifier?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  is_valid: boolean;
  message?: string | null;
  checked_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_id: string;
  seller_id?: string | null;
  referral_code?: string | null;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_gateway: string;
  payment_id?: string | null;
  created_at: string;
  // Joins opcionales
  customer?: Profile;
  seller?: Profile;
  items?: OrderItemRecord[];
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  license_id?: string | null;
  price: number;
  created_at: string;
  product?: ProductRecord;
  license?: LicenseRecord;
}

export interface PartnerAgreementRecord {
  id: string;
  seller_id: string;
  product_id?: string | null;
  referral_code: string;
  commission_percentage: number;
  fixed_commission_amount: number;
  payout_method: string;
  payout_details: Record<string, any>;
  parent_seller_id?: string | null;
  tier_2_commission_percentage: number;
  minimum_payout_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seller?: Profile;
  parent_seller?: Profile;
  product?: ProductRecord;
}

export interface CommissionRecord {
  id: string;
  seller_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: CommissionStatus;
  tier_level: number;
  payout_method?: string | null;
  payout_receipt_url?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  created_at: string;
  seller?: Profile;
  order?: OrderRecord;
}

export interface PostRecord {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  category?: string | null;
  tags: string[];
  author_id?: string | null;
  locale: string;
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}
