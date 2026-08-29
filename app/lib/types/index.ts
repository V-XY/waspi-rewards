export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject { [key: string]: JsonValue; }

export type MemberRole = 'superadmin' | 'tenant_admin' | 'agent';
export type MemberStatus = 'invited' | 'active' | 'suspended' | 'disabled';
export type OrderStatus =
  | 'draft'
  | 'awaiting_kyc'
  | 'kyc_review'
  | 'awaiting_payment'
  | 'payment_review'
  | 'ready_for_activation'
  | 'activation_in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';
export type KycStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'validating'
  | 'approved'
  | 'manual_review'
  | 'correction_required'
  | 'rejected';
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'refunded';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export type PaymentAttemptStatus =
  | 'created'
  | 'pending'
  | 'processing'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  description: string;
  price: number;
  commission: number;
  commission_type: 'fixed' | 'percentage';
  billing_cycle: 'monthly' | 'one-time';
  features: JsonObject;
  industry_tags: string[];
  kyc_requirements: JsonObject;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  phone_normalized: string;
  email?: string | null;
  address?: string | null;
  landmark?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  tenant_id: string;
  customer_id: string;
  agent_id?: string | null;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  currency_code: string;
  source: string;
  delivery_address?: string | null;
  delivery_landmark?: string | null;
  delivery_status?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer | null;
  customers?: Customer | null;
  order_items?: OrderItem[];
  payment_intents?: PaymentIntent[];
  kyc_submissions?: KycSubmission[];
  activations?: Array<{ id: string; status: string; completed_at?: string | null }>;
}

export interface KycDocument {
  id?: string;
  kyc_submission_id?: string;
  document_type: string;
  storage_path?: string;
  signed_url?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
}

export interface KycSubmission {
  id: string;
  tenant_id: string;
  order_id: string;
  customer_id: string;
  status: KycStatus;
  id_type?: string | null;
  rejection_step?: string | null;
  rejection_reason?: string | null;
  correction_count: number;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  approved_at?: string | null;
  kyc_documents?: KycDocument[];
}

export interface PaymentIntent {
  id: string;
  tenant_id: string;
  order_id: string;
  amount: number;
  currency_code: string;
  status: PaymentStatus;
  expires_at: string;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentInstruction =
  | {
      type: 'ussd';
      code: string;
      display: string;
      provider: string;
      canOpenDialer: boolean;
    }
  | {
      type: 'account';
      accountNumber: string;
      accountName: string;
      provider: string;
      display: string;
    };

export type PaymentInstructions = PaymentInstruction;

export interface PaymentAttempt {
  id: string;
  payment_intent_id: string;
  provider: string;
  merchant_account_id?: string | null;
  status: PaymentAttemptStatus;
  external_transaction_id?: string | null;
  external_reference?: string | null;
  requested_amount: number;
  received_amount?: number | null;
  currency_code: string;
  evidence_path?: string | null;
}

export interface DashboardStats {
  today_activations: number;
  daily_goal: number;
  weekly_activations: number;
  monthly_commissions: number;
  pending_kyc: number;
  pending_payments: number;
  active_leads: number;
  conversion_rate: number;
  recent_orders: Order[];
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  legal_name?: string | null;
  country_code: string;
  currency_code: string;
  timezone: string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  settings: JsonObject;
  is_active: boolean;
}

export interface PublicSolution {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  productCount: number;
}

export interface PublicCatalog {
  tenant: Pick<Tenant, 'id' | 'slug' | 'name' | 'logo_url' | 'primary_color' | 'secondary_color' | 'currency_code'>;
  solutions: PublicSolution[];
  featuredProducts: Product[];
}
