// import { useState, useCallback } from 'react';
// import { Alert } from 'react-native';
// import {  isValidMalienPhone, formatMalienPhone } from '../services/payment';
// import { paymentAPI } from '../services/api';
// import { PaymentMethod, PaymentResponse, WalletBalance } from '../types/payment';
// 
// interface UsePaymentReturn {
//   walletBalance: WalletBalance | null;
//   isLoading: boolean;
//   isProcessing: boolean;
//   paymentError: string | null;
//   lastTransaction: PaymentResponse | null;
// 
//   loadWalletBalance: () => Promise<void>;
//   initiatePayment: (
//     method: PaymentMethod,
//     phoneNumber: string,
//     productId: string,
//     productName: string,
//     amount: number,
//     currency: string,
//   ) => Promise<PaymentResponse | null>;
//   confirmPayment: (transactionId: string, otp: string) => Promise<PaymentResponse | null>;
//   clearError: () => void;
// }
// 
// export const usePayment = (): UsePaymentReturn => {
//   const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentError, setPaymentError] = useState<string | null>(null);
//   const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);
// 
//   const loadWalletBalance = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const balance = await paymentAPI.getWalletBalance();
//       setWalletBalance(balance);
//     } catch (err: any) {
//       console.error('Erreur chargement solde:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);
// 
//   const initiatePayment = useCallback(async (
//     method: PaymentMethod,
//     phoneNumber: string,
//     productId: string,
//     productName: string,
//     amount: number,
//     currency: string,
//   ): Promise<PaymentResponse | null> => {
//     setIsProcessing(true);
//     setPaymentError(null);
// 
//     // Valider le numéro
//     if (!isValidMalienPhone(phoneNumber)) {
//       const errorMsg = 'Numéro de téléphone invalide. Format attendu: +223 XX XX XX XX';
//       setPaymentError(errorMsg);
//       setIsProcessing(false);
//       Alert.alert('Numéro invalide', errorMsg);
//       return null;
//     }
// 
//     const formattedPhone = formatMalienPhone(phoneNumber);
// 
//     try {
//       const response = await paymentAPI.initiatePayment({
//         amount,
//         currency: currency as 'XOF' | 'EUR',
//         method,
//         phoneNumber: formattedPhone,
//         productId,
//         productName,
//       });
// 
//       setLastTransaction(response);
// 
//       if (!response.success) {
//         setPaymentError(response.error || 'Paiement échoué');
//       }
// 
//       return response;
//     } catch (err: any) {
//       const errorMsg = err.response?.data?.error || err.message || 'Erreur de paiement';
//       setPaymentError(errorMsg);
//       Alert.alert('Erreur', errorMsg);
//       return null;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, []);
// 
//   const confirmPayment = useCallback(async (
//     transactionId: string,
//     otp: string,
//   ): Promise<PaymentResponse | null> => {
//     setIsProcessing(true);
//     setPaymentError(null);
// 
//     try {
//       const response = await paymentAPI.confirmPayment(transactionId, otp);
//       setLastTransaction(response);
// 
//       if (!response.success) {
//         setPaymentError(response.error || 'Code OTP invalide');
//       }
// 
//       return response;
//     } catch (err: any) {
//       const errorMsg = err.response?.data?.error || err.message || 'Erreur de confirmation';
//       setPaymentError(errorMsg);
//       return null;
//     } finally {
//       setIsProcessing(false);
//     }
//   }, []);
// 
//   const clearError = useCallback(() => {
//     setPaymentError(null);
//   }, []);
// 
//   return {
//     walletBalance,
//     isLoading,
//     isProcessing,
//     paymentError,
//     lastTransaction,
//     loadWalletBalance,
//     initiatePayment,
//     confirmPayment,
//     clearError,
//   };
// };
import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import {  isValidMalienPhone, formatMalienPhone } from '../services/payment';
import { paymentAPI} from '../services/api';
import { PaymentMethod, PaymentResponse, WalletBalance, Transaction } from '../types/payment';
import { useSocket } from '../hooks/useSocket';

interface UsePaymentReturn {
  walletBalance: WalletBalance | null;
  isLoading: boolean;
  isProcessing: boolean;
  isWaitingConfirmation: boolean;
  paymentError: string | null;
  lastTransaction: PaymentResponse | null;
  transactions: Transaction[];

  loadWalletBalance: () => Promise<void>;
  initiatePayment: (
    method: PaymentMethod,
    phoneNumber: string,
    productId: string,
    productName: string,
    amount: number,
    currency: string,
  ) => Promise<PaymentResponse | null>;
  checkStatus: (transactionId: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  clearError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingConfirmation, setIsWaitingConfirmation] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const pendingTransactionRef = useRef<string | null>(null);

  const { isConnected, socket }= useSocket()

  // Écouter les webhooks via Socket.io
  useEffect(() => {
    if (!socket) {
      return 
    }
    socket.on('payment:completed', (data: PaymentResponse) => {
      console.log('📩 Socket: payment:completed', data);
      if (data.transactionId === pendingTransactionRef.current) {
        setLastTransaction(data);
        setIsWaitingConfirmation(false);
        pendingTransactionRef.current = null;
        loadTransactions();
      }
    });

    socket.on('payment:failed', (data: { transactionId: string; error: string }) => {
      console.log('📩 Socket: payment:failed', data);
      if (data.transactionId === pendingTransactionRef.current) {
        setPaymentError(data.error || 'Paiement refusé');
        setIsWaitingConfirmation(false);
        pendingTransactionRef.current = null;
        loadTransactions();
      }
    });

    return () => {
      socket.off('payment:completed');
      socket.off('payment:failed');
    };
  }, []);

  const loadWalletBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      const balance = await paymentAPI.getWalletBalance();
      setWalletBalance(balance);
    } catch (err: any) {
      console.error('Erreur chargement solde:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiatePayment = useCallback(async (
    method: PaymentMethod,
    phoneNumber: string,
    productId: string,
    productName: string,
    amount: number,
    currency: string,
  ): Promise<PaymentResponse | null> => {
    setIsProcessing(true);
    setPaymentError(null);

    if (!isValidMalienPhone(phoneNumber)) {
      setPaymentError('Numéro de téléphone invalide');
      setIsProcessing(false);
      return null;
    }

    try {
      const response = await paymentAPI.initiatePayment({
        amount,
        currency: currency as 'XOF' | 'EUR',
        method,
        phoneNumber: formatMalienPhone(phoneNumber),
        productId,
        productName,
      });

      setLastTransaction(response);

      if (response.success && response.status === 'pending') {
        // ✅ Le client doit confirmer sur son téléphone
        // On attend le webhook via Socket.io
        pendingTransactionRef.current = response.transactionId;
        setIsWaitingConfirmation(true);
        setPaymentError(null);
      } else if (!response.success) {
        setPaymentError(response.error || 'Paiement échoué');
        setIsWaitingConfirmation(false);
      }

      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Erreur de paiement';
      setPaymentError(errorMsg);
      setIsWaitingConfirmation(false);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const checkStatus = useCallback(async (transactionId: string) => {
    try {
      const response = await paymentAPI.checkPaymentStatus(transactionId);
      setLastTransaction(response);
      if (response.status === 'completed' || response.status === 'failed') {
        setIsWaitingConfirmation(false);
        pendingTransactionRef.current = null;
      }
    } catch (err: any) {
      console.error('Erreur vérification statut:', err);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await paymentAPI.getTransactionHistory();
      setTransactions(data.transactions);
    } catch (err: any) {
      console.error('Erreur chargement transactions:', err);
    }
  }, []);

  const clearError = useCallback(() => setPaymentError(null), []);

  return {
    walletBalance,
    isLoading,
    isProcessing,
    isWaitingConfirmation,
    paymentError,
    lastTransaction,
    transactions,
    loadWalletBalance,
    initiatePayment,
    checkStatus,
    loadTransactions,
    clearError,
  };
};