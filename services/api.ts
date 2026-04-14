

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message,User,Chat,NearbyUser } from '@/types';

// const API_BASE_URL =`${process.env.EXPO_PUBLIC_API_URL}/api`
const API_BASE_URL =`http://10.83.109.123:5000/api`
console.log('🔧 API Base URL:', API_BASE_URL);
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
    console.log("🚨 AXIOS 401 DEBUG", {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      status: error.response?.status,
      data: error.response?.data,
    });
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