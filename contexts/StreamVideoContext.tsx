// import React, { createContext, useContext, useState, useEffect ,ReactNode} from 'react';
// import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
// import { userAPI } from '../services/api';
// import { useAuth } from '../hooks/useAuth';
// interface AuthProviderProps {
//   children: ReactNode;
// }
// const StreamVideoContext = createContext(null);
// 
// export const StreamVideoProvider = ({ children }) => {
//   const [streamClient, setStreamClient] = useState(null);
//   const [isInitializing, setIsInitializing] = useState(false);
//   const { user, isAuthenticated } = useAuth();
// 
//   // Initialiser le client Stream lorsque l'utilisateur est connecté
//   useEffect(() => {
//     if (isAuthenticated && user && !streamClient) {
//       initializeStreamClient();
//     }
//     
//     // Nettoyage à la déconnexion
//     return () => {
//       if (streamClient) {
//         streamClient.disconnectUser();
//         setStreamClient(null);
//       }
//     };
//   }, [isAuthenticated, user]);
// 
//   const initializeStreamClient = async () => {
//     if (isInitializing) return;
//     
//     try {
//       setIsInitializing(true);
//       
//       // 1. Récupérer un token depuis VOTRE backend
//       const response = await userAPI.getStreamToken();
//       
//       if (response.data.success) {
//         const { token, streamUser } = response.data.data;
//         
//         // 2. Créer le client Stream
//         const client = new StreamVideoClient({
//           apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY, // À mettre dans .env frontend
//           user: streamUser,
//           token,
//           options: {
//             logLevel: 'warn',
//           },
//         });
//         
//         setStreamClient(client);
//         console.log('✅ Stream Video client initialisé pour:', streamUser.name);
//       }
//     } catch (error) {
//       console.error('❌ Erreur initialisation Stream Video:', error);
//     } finally {
//       setIsInitializing(false);
//     }
//   };
// 
//   // Fonction pour créer un appel
//   const createCall = async (callType = 'default', callId = null) => {
//     if (!streamClient) throw new Error('Stream client non initialisé');
//     
//     const call = streamClient.call(callType, callId || `call_${Date.now()}`);
//     return call;
//   };
// 
//   return (
//     <StreamVideoContext.Provider value={{ 
//       streamClient, 
//       isInitializing,
//       createCall,
//       initializeStreamClient 
//     }}>
//       {children}
//     </StreamVideoContext.Provider>
//   );
// };
// 
// export const useStreamVideo = () => {
//   const context = useContext(StreamVideoContext);
//   if (!context) {
//     throw new Error('useStreamVideo doit être utilisé dans StreamVideoProvider');
//   }
//   return context;
// };

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


    // Initialiser le client Stream lorsque l'utilisateur est connecté
  // useEffect(() => {
  //   if (isAuthenticated && user && !streamClient) {
  //     initializeStreamClient();
  //   }
  //   
  //   // Nettoyage à la déconnexion
  //   return () => {
  //     if (streamClient) {
  //       streamClient.disconnectUser();
  //       setStreamClient(null);
  //     }
  //   };
  // }, [isAuthenticated, user]);


export const StreamVideoProvider: React.FC<StreamVideoProviderProps> = ({ children }) => {
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { user, isAuthenticated, token } = useAuth(); // Prenez aussi le token

  // Initialiser le client Stream lorsque l'utilisateur est connecté
  useEffect(() => {
    console.log('🔍 [DEBUG] StreamVideoProvider useEffect:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      hasStreamClient: !!streamClient
    });
    
    // 🔥 CORRECTION : Vérifiez aussi le TOKEN, pas juste isAuthenticated
    if (isAuthenticated && user && token && !streamClient) {
      console.log('🚀 Conditions remplies, init Stream...');
      initializeStreamClient();
    } else {
      console.log('⏸️ Conditions NON remplies:', {
        isAuth: isAuthenticated,
        user: !!user,
        token: !!token,
        streamClient: !!streamClient
      });
    }
    
    // Nettoyage à la déconnexion
    return () => {
      if (streamClient) {
        streamClient.disconnectUser();
        setStreamClient(null);
      }
    };
  }, [isAuthenticated, user, token]);
  
  // const initializeStreamClient = async () => {
  //   if (isInitializing) return;
  //   
  //   try {
  //     setIsInitializing(true);
  //     
  //     // 1. Récupérer un token depuis VOTRE backend
  //     const response = await userAPI.getStreamToken();
  //     
  //     if (response.data.success) {
  //       const { token, streamUser } = response.data.data;
  //       
  //       // 2. Créer le client Stream
  //       const client = new StreamVideoClient({
  //         apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY, // À mettre dans .env frontend
  //         user: streamUser,
  //         token,
  //         options: {
  //           logLevel: 'warn',
  //         },
  //       });
  //       
  //       setStreamClient(client);
  //       console.log('✅ Stream Video client initialisé pour:', streamUser.name);
  //     }
  //   } catch (error) {
  //     console.error('❌ Erreur initialisation Stream Video:', error);
  //   } finally {
  //     setIsInitializing(false);
  //   }
  // };

  const initializeStreamClient = async () => {
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
    console.error('❌ Erreur initialisation Stream Video:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
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