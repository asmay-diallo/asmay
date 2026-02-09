

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { userAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface StreamVideoContextType {
  streamClient: StreamVideoClient | null;
  isInitializing: boolean;
  createCall: (callType?: string, callId?: string) => Promise<any>;
  initializeStreamClient: () => Promise<void>;
}

const StreamVideoContext = createContext<StreamVideoContextType | undefined>(undefined);

interface StreamVideoProviderProps {
  children: ReactNode;
}

export const StreamVideoProvider: React.FC<StreamVideoProviderProps> = ({ children }) => {
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false); 
   const { user,  token, isAuthenticated } = useAuth();

  useEffect(() => {
  console.log('🔍  StreamVideoProvider useEffect:', {
    isAuthenticated,
    hasUser: !!user,
    hasUserId: user?._id, // ← Vérifiez l'ID !
    hasToken: !!token,
    hasStreamClient: !!streamClient
  });
  
  if (isAuthenticated && user?._id && token && !streamClient) {
    console.log(' Conditions remplies, init Stream pour user:', user._id);
    initializeStreamClient();
  } else if (!user?._id) {
    console.log('⏸️ User ID manquant, attente...');
  }
}, [isAuthenticated, user, token]); 

  const initializeStreamClient = async () => {
     if (!isAuthenticated || !user || !token) {
    console.log('🚫 initializeStreamClient BLOCKED - Not authenticated', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      userId: user?._id
    });
    return; 
  }
  if (isInitializing) return;
  
  try {
    setIsInitializing(true);
    console.log(' [INIT] Début initialisation Stream Video');
    
    // 1. Récupérer un token depuis VOTRE backend
    const response = await userAPI.getStreamToken();
    console.log(' [INIT] Réponse API:', {
      success: response.data.success,
      status: response.status
    });
    
    if (response.data.success && response.data.data) {
      //  Renommez la variable pour éviter le conflit
      const { token: streamToken, streamUser } = response.data.data;
      
      // 2. Vérifiez que la clé API est définie
      const apiKey = process.env.STREAM_API_KEY;
      if (!apiKey) {
        console.error('❌ EXPO_PUBLIC_STREAM_API_KEY non définie');
        return;
      }
      
      console.log('🔐 [INIT] Création client avec:', {
        apiKeyLength: apiKey.length,
        streamUser: streamUser.username,
        streamTokenPreview: streamToken ? `${streamToken.substring(0, 20)}...` : 'NULL'
      });
      
      // 3. Créer le client Stream
      const client = new StreamVideoClient({
        apiKey: apiKey,
        user: streamUser,
        token: streamToken, 
        options: {
          logLevel: 'warn',
        },
      });
      
      setStreamClient(client);
      console.log('✅ Stream Video client initialisé');
    } else {
      console.error('❌ API returned error:', response.data.message);
    }
  } catch (error: any) {
    // console.error('❌ Erreur initialisation Stream Video:', {
    //   message: error.message,
    //   status: error.response?.status,
    //   data: error.response?.data,
    //   url: error.config?.url
    // });
  } finally {
    setIsInitializing(false);
  }
};

  const createCall = useCallback(async (callType = 'default', callId?: string) => {
    if (!streamClient) {
      throw new Error('Stream client non initialisé');
    }
    
    const finalCallId = callId || `call_${Date.now()}`;
    const call = streamClient.call(callType, finalCallId);
      await call.getOrCreate({
        ring:true,
      })
    return call;
  }, [streamClient]);


  return (
    <StreamVideoContext.Provider value={{ 
      streamClient, 
      isInitializing,
      createCall,
      initializeStreamClient 
    }}>
      {children}
    </StreamVideoContext.Provider>
  );
};


export const useStreamVideo = () => {
  const context = useContext(StreamVideoContext);
  if (!context) {
    throw new Error('useStreamVideo doit être utilisé dans StreamVideoProvider');
  }
  return context;
};