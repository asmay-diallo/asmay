import {
  PaymentMethod,
} from '../types/payment';

export const PAYMENT_METHODS = [
  {
    id: 'orange_money' as PaymentMethod,
    label: 'Orange Money',
    icon: 'phone-portrait-outline',
    color: '#FF6600',
    description: 'Paiement mobile Orange Mali',
    phonePrefix: '+223',
    enabled: true,
    fee: 0,
  },
  {
    id: 'wave' as PaymentMethod,
    label: 'Wave',
    icon: 'phone-portrait-outline',
    color: '#00B4D8',
    description: 'Paiement mobile Wave Mali',
    phonePrefix: '+223',
    enabled: true,
    fee: 0,
  },
  {
    id: 'moov_money' as PaymentMethod,
    label: 'Moov Money',
    icon: 'phone-portrait-outline',
    color: '#E60000',
    description: 'Paiement mobile Moov Africa Mali',
    phonePrefix: '+223',
    enabled: true,
    fee: 0,
  },
];


// ==================== UTILITAIRES TÉLÉPHONE MALI ====================

/**
 * Formater un numéro malien pour l'API
 * Input:  "76 12 34 56" ou "+223 76 12 34 56" ou "76123456"
 * Output: "22376123456"
 */
export const formatMalienPhone = (phone: string): string => {
  let cleaned = phone.replace(/[\s\.\-\(\)]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  if (!cleaned.startsWith('223') && cleaned.length === 8) cleaned = '223' + cleaned;
  return cleaned;
};

/**
 * Détecter l'opérateur à partir du numéro
 * Orange Mali : 223 7X XX XX XX ou 223 8X XX XX XX
 * Moov Africa : 223 6X XX XX XX ou 223 9X XX XX XX
 */
export const detectOperator = (phone: string): PaymentMethod | null => {
  const cleaned = formatMalienPhone(phone);
  if (cleaned.startsWith('2237') || cleaned.startsWith('2238')) return 'orange_money';
  if (cleaned.startsWith('2236') || cleaned.startsWith('2239')) return 'moov_money';
  return null;
};

/**
 * Vérifier si un numéro malien est valide
 */
export const isValidMalienPhone = (phone: string): boolean => {
  const cleaned = formatMalienPhone(phone);
  return /^223[6789]\d{7}$/.test(cleaned);
};

/**
 * Formater un numéro pour l'affichage
 * Input:  "22376123456"
 * Output: "+223 76 12 34 56"
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/[\s\.\-\(\)\+]/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('223')) {
    return `+223 ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9, 11)}`;
  }
  return phone;
};