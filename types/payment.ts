// ==================== TYPES PAIEMENT MALI ====================

export type PaymentMethod = 'orange_money' | 'wave' | 'moov_money';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  icon: string;
  color: string;
  description: string;
  phonePrefix: string;
  enabled: boolean;
  fee: number;
  minAmount: number;
  maxAmount: number;
}

export interface PaymentRequest {
  amount: number;
  currency: 'XOF' | 'EUR';
  method: PaymentMethod;
  phoneNumber: string;
  productId: string;
  productName: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  phoneNumber: string;
  productId?: string;
  productName?: string;
  esimOrderId?: string;
  esimIccid?: string;
  lpaString?: string;
  qrCodeUrl?: string;
  message?: string;
  error?: string;
  paymentProof?: string;
  paidAt?: string;
}

export interface WalletBalance {
  coins: number;
  monetaryValue: number;
  exchangeRate: number;
  currency: string;
}

export interface Transaction {
  _id: string;
  user: string;
  type: 'purchase_esim' | 'topup' | 'refund';
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  phoneNumber: string;
  productId?: string;
  productName?: string;
  esimIccid: string;
  lpaString:string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}