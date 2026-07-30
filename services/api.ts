
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Message,User,Chat,NearbyUser } from '@/types';
import {
  PaymentRequest,
  PaymentResponse,
  WalletBalance,
  Transaction,
} from '../types/payment';

const API_BASE_URL =`${Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL}/api`
// const API_BASE_URL ="http://192.168.81.123:5000/api"
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor pour le token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      // const token = await AsyncStorage.getItem('auth_token');
      if (token && !config.url?.includes('/auth/register')&& !config.url?.includes('/auth/login')){
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
 
    return Promise.reject(error);
  }
);

// Interfaces
export interface ApiResponse<T=any> {
  user?:User;
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}

// Types pour les récompenses
export interface RewardRequest {
  rewardType: 'WATCH_REWARDED_AD' | 'SIGNUP_BONUS' | 'REFERRAL_BONUS';
  rewardId: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  coins: number;
  bio?: string;
  interests?: string[];
  privacySettings?: {
    isVisible: boolean;
    showCommonInterestsOnly: boolean;
  };
}

export interface ChatsResponse {
  success: boolean;
  data: Chat[];
  message?: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  message?: string;
}

export interface SingleMessageResponse {
  success: boolean;
  data: Message;
  message?: string;
}

export interface NearbyUsersResponse {
  success: boolean;
  data: {
    users: NearbyUser[];
    currentSessionId: string;
  };
  message?: string;
}
export interface SignalResponse {
  success: boolean;
  data: {
    signalId: string;
    chatId?: string;
    notificationSent: boolean;
  };
  message?: string;
}
// ==================== TYPES eSIM ====================

export interface ESIMProduct {
  id: string;
  name: string;
  data: { value: number; unit: string };
  duration: { value: number; unit: string };
  footprint: string;
  price: { value: number; currency: string };
}

export interface ESIMProductsResponse {
  success: boolean;
  count: number;
  products: ESIMProduct[];
}

export interface ESIMOrderResult {
  success: boolean;
  message: string;
  order: {
    id: string;
    status: string;
  };
  esim: {
    id: string;
    iccid: string;
    lpaString: string;
    qrCodeUrl: string;
  };
}

export interface MyESIM {
  id: string;
  iccid: string;
  productId: string;
  productName: string;
  lpaString?: string;
  qrCodeUrl?: string;
  smdpAddress?: string;
  status: 'PENDING' | 'RELEASED' | 'DOWNLOADED' | 'INSTALLED' | 'UNAVAILABLE' | 'EXPIRED' | 'FAILED';
  dataLimit: { value: number; unit: string };
  dataUsed: { value: number; unit: string };
  duration: { value: number; unit: string };
  footprint: string;
  country?: string;
  activatedAt?: string;
  expiresAt?: string;
  orderId?: string;
  deviceInfo?: {
    eid?: string;
    platform?: 'ios' | 'android';
    model?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MyESIMsResponse {
  success: boolean;
  count: number;
  esims: MyESIM[];
}

export interface ESIMStatusResponse {
  success: boolean;
  status: string;
  iccid: string;
  source?: 'live' | 'cache';
}

export interface ESIMTopUpResponse {
  success: boolean;
  message: string;
  topupOrderId: string;
}


export const authAPI = {
  
  register: (data: {
    username: string;
    email: string;
    password: string;
    interests?: string[];
    latitude?: number;    
    longitude?: number;   
  }) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  login: (data: {
    email: string;
    password: string;
    latitude?: number;
    longitude?: number;
  }) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  sendVerification: (email:string, username:string) => 
    api.post('/auth/send-verification', { email, username }),
    
  verifyCode: (email:string, code:any) => 
    api.post('/auth/verify-code', { email, code }),
    
  resendCode: (email:string, username:string) => 
    api.post('/auth/resend-code', { email, username }),

};
// User Api 
export const userAPI = {
  getAllUser :()=>
    api.get<ApiResponse<User>>("/users/"),
  getProfile: () => 
    api.get<ApiResponse<User>>('/users/profile'),
  // Aimer un user en ligne 
  likeOnlineUser:async(likedUserId:string)=>api.patch<ApiResponse<User>>(`/users/onlineLike/${likedUserId}`),
  // Créditer une récompense
  addReward: async (data: RewardRequest): Promise<ApiResponse<{ coins: number }>> => {
    const response = await api.post<ApiResponse<{ coins: number }>>(
      '/users/me/rewards',
      data
    );
    return response.data;
  },
    // Obtenir le taux de change
  getExchangeRate: async () => {
    const response = await api.get('/users/exchange'); // Adaptez l'URL à votre route
    return response.data; // Cela retournera { success: true, data: { rate: 0.001, ... } }
  },
  // Récupérer le profil avec les coins
  getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>(
      '/users/me'
    );
    return response.data;
  },

   updateProfile: (userData: {
    username?: string;
    interests?: string[];
    bio?: string;
    profilePicture?: string;
    privacySettings?: {
      isVisible: boolean;
      showCommonInterestsOnly: boolean;
    };
  }) => api.put<ApiResponse<User>>('/users/profile', userData),


  getUserById: (id: string) => 
    api.get<ApiResponse<User>>(`/users/${id}`),
  
  searchUsers: (query: string, page: number = 1, limit: number = 10) => 
    api.get<ApiResponse<{ data: User[]; pagination: any }>>(
      `/users/search?q=${query}&page=${page}&limit=${limit}`
    ),
      getStreamToken: () => 
    api.get<ApiResponse<{ token: string; streamUser: any }>>('/users/stream-token'),
  
  // Initier un appel vidéo
  initiateCall: (targetUserId: string) =>
    api.post<ApiResponse<{ callId: string }>>('/users/initiate-call', { targetUserId }),

};
// Radar API
export const radarAPI = {
  getNearbyUsers: (latitude: number, longitude: number, distance: number = 5000) => 
    api.get<NearbyUsersResponse>('/users/nearby-users', { 
      params: { latitude, longitude, distance } 
    }),

  updateLocation: (latitude: number, longitude: number) => 
    api.put<ApiResponse<any>>('/users/location', { latitude, longitude }),
};

export const signalAPI = {
  send: (toSessionId: string) => 
    api.post<SignalResponse>('/signals/send', { toSessionId }),
    
  respond: (signalId: string, response: string) => 
    api.post<SignalResponse>('/signals/respond', { signalId, response }),
 getReceivedSignals: () => 
  api.get<ApiResponse<any>>('/signals/received'),
 delete:(signalId:string) =>  api.delete<ApiResponse>(`/signals/delete/${signalId}`),

};

export const chatAPI = {
  getChats: () => 
    api.get<ChatsResponse>('/chats'),
  
    getMessages: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}/messages`);
   
    return response;
  },
  sendMessage: (chatId: string, content: string) => 
    api.post<SingleMessageResponse>(`/chats/${chatId}/messages`, { content }),

    sendVoiceMessage: async (chatId: string, audioUri: string, duration: number) => {
    try {
      console.log('🎤 Envoi message vocal simple...');
      
      const formData = new FormData();
      
      // Ajouter le fichier audio
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: `voice_${Date.now()}.m4a`,
      } as any);
      
      // Ajouter la durée et tempId
      formData.append('duration', duration as any);
      formData.append('tempId', `temp-voice-${Date.now()}`);
      
      // Envoyer directement à la route chat/voice
      const response = await api.post(`/chats/${chatId}/voice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 secondes timeout
      });
      
      console.log(' Message vocal envoyé:', response.data);
      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur envoi message vocal:', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
      });
      throw error;
    }
  },
  deleteOneChat:(chatId:string)=>api.delete(`/chats/delete/${chatId}`),
  deleteOneMessage:(messageId:string,chatId:string) =>api.delete(`/chats/${chatId}/messages/delete/${messageId}`)
}
// ==================== API eSIM ====================
export const esimAPI = {
  /**
   * GET /api/esim/products
   * Récupère le catalogue des forfaits eSIM disponibles
   * @param footprint - Filtre optionnel par région (EUROPE, GLOBAL, US, etc.)
   */
  getProducts: async (footprint?: string): Promise<ESIMProductsResponse> => {
    const params = footprint ? `?footprint=${footprint}` : '';
    const response = await api.get<ESIMProductsResponse>(`/esim/products${params}`);
    return response.data;
  },

  /**
   * POST /api/esim/order
   * Commande une nouvelle eSIM
   * @param productId - L'identifiant du forfait à acheter
   */
  createOrder: async (productId: string): Promise<ESIMOrderResult> => {
    const response = await api.post<ESIMOrderResult>('/esim/order', { productId });
    return response.data;
  },

  /**
   * GET /api/esim/mine
   * Récupère la liste des eSIM de l'utilisateur connecté
   */
  getMyESIMs: async (): Promise<MyESIMsResponse> => {
    const response = await api.get<MyESIMsResponse>('/esim/mine');
    return response.data;
  },

  /**
   * GET /api/esim/status/:iccid
   * Vérifie le statut en temps réel d'une eSIM
   * @param iccid - L'identifiant unique de l'eSIM
   */
  getESIMStatus: async (iccid: string): Promise<ESIMStatusResponse> => {
    const response = await api.get<ESIMStatusResponse>(`/esim/status/${iccid}`);
    return response.data;
  },

  /**
   * POST /api/esim/topup/:iccid
   * Recharge une eSIM existante avec un nouveau forfait
   * @param iccid - L'identifiant unique de l'eSIM
   * @param productId - L'identifiant du forfait de rechargement
   */
  topUpESIM: async (iccid: string, productId: string): Promise<ESIMTopUpResponse> => {
    const response = await api.post<ESIMTopUpResponse>(`/esim/topup/${iccid}`, { productId });
    return response.data;
  },
};

// ==================== SERVICE PAIEMENT ====================
// 
// export const paymentAPI = {
//   /**
//    * Obtenir le solde wallet (coins)
//    */
//   getWalletBalance: async (): Promise<WalletBalance> => {
//     const response = await api.get('/users/me');
//     const user = response.data.data || response.data.user || response.data;
//     const exchangeRate = 0.001;
// 
//     return {
//       coins: user.coins || 0,
//       monetaryValue: (user.coins || 0) * exchangeRate,
//       exchangeRate,
//       currency: 'XOF',
//     };
//   },
// 
//   /**
//    * Initier un paiement (appel au backend qui contacte Orange/Wave/Moov)
//    */
//   initiatePayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
//     const response = await api.post('/payments/initiate', request);
//     return response.data;
//   },
// 
//   /**
//    * Confirmer un paiement avec OTP
//    */
//   confirmPayment: async (transactionId: string, otp: string): Promise<PaymentResponse> => {
//     const response = await api.post('/payments/confirm', { transactionId, otp });
//     return response.data;
//   },
// 
//   /**
//    * Vérifier le statut d'une transaction
//    */
//   checkPaymentStatus: async (transactionId: string): Promise<PaymentResponse> => {
//     const response = await api.get(`/payments/status/${transactionId}`);
//     return response.data;
//   },
// 
//   /**
//    * Obtenir l'historique des transactions
//    */
//   getTransactionHistory: async (): Promise<Transaction[]> => {
//     const response = await api.get('/payments/transactions');
//     return response.data.transactions || response.data;
//   },
// 
//   /**
//    * Convertir EUR → XOF
//    */
//   convertToXOF: (amountEUR: number): number => {
//     return Math.round(amountEUR * 655.96);
//   },
// 
//   /**
//    * Convertir XOF → EUR
//    */
//   convertToEUR: (amountXOF: number): number => {
//     return parseFloat((amountXOF / 655.96).toFixed(2));
//   },
// };

export const paymentAPI = {
  /**
   * Obtenir le solde wallet (coins)
   */
  getWalletBalance: async (): Promise<WalletBalance> => {
    const response = await api.get('/users/me');
    const user = response.data.data || response.data.user || response.data;
    const exchangeRate = 0.001;

    return {
      coins: user.coins || 0,
      monetaryValue: (user.coins || 0) * exchangeRate,
      exchangeRate,
      currency: 'XOF',
    };
  },

  /**
   * Initier un paiement
   * → Le backend appelle Orange/Wave/Moov
   * → Le client reçoit une demande de confirmation sur son téléphone
   */
  initiatePayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post('/payments/initiate', request);
    return response.data;
  },

  /**
   * Vérifier le statut d'une transaction (polling ou après webhook)
   */
  checkPaymentStatus: async (transactionId: string): Promise<PaymentResponse> => {
    const response = await api.get(`/payments/status/${transactionId}`);
    return response.data;
  },

  /**
   * Obtenir l'historique des transactions
   */
  getTransactionHistory: async (page = 1, limit = 20): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    transactions: Transaction[];
  }> => {
    const response = await api.get(`/payments/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Convertir EUR → XOF
   */
  convertToXOF: (amountEUR: number): number => {
    return Math.round(amountEUR * 655.96);
  },

  /**
   * Convertir XOF → EUR
   */
  convertToEUR: (amountXOF: number): number => {
    return parseFloat((amountXOF / 655.96).toFixed(2));
  },
};
