// 
// import { useState, useEffect } from 'react';
// import {Alert} from 'react-native';
// import { authAPI, userAPI, saveUserData, getUserData, removeUserData } from '../services/api';
// import {User} from "../types/index"
// import { useRouter } from 'expo-router';
// 
// interface UseAuthReturn {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//    token: string | null
//   login: (email: string, password: string, location?: { latitude: number; longitude: number }) => Promise<boolean>;
//   register: (data: {
//     username: string;
//     email: string;
//     password: string;
//     interests?: string[];
//     location?: { lat: number; lon: number };
//   }) => Promise<void>;
//   logout: () => Promise<void>;
//   updateUser: (userData: Partial<User>) => Promise<void>;
// }
// 
// export const useAuth = (): UseAuthReturn => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//  const [token, setToken] = useState<string | null>(null);
//    const router = useRouter();
//  
// 
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);
// 
//   const checkAuthStatus = async () => {
//     try {
//       const authData = await getUserData();
//       if (authData && authData.user && authData.token) {
//         setUser(authData.user);
//           setToken(authData.token);
//         setIsAuthenticated(true);
//       }
//     } catch (error) {
//       // console.error('Auth check error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
// 
//   const updateUser = async (userData: Partial<User>): Promise<void> => {
//     try {
//       setLoading(true);
//       
//       // Vérifiez l'authentification
//       const authData = await getUserData();
//       if (!authData || !authData.token) {
//         throw new Error('Utilisateur non authentifié');
//       }
// 
//       // Appel à l'API pour mettre à jour le profil
//       const response = await userAPI.updateProfile(userData);
//       
//       if (response.data.success && response.data.data) {
//         const updatedUser = { ...user, ...response.data.data };
//         
//         // Mettre à jour le state local
//         setUser(updatedUser);
//         
//         // Sauvegarder dans le stockage local AVEC LE TOKEN
//         await saveUserData(updatedUser, authData.token);
//       } else {
//         // throw new Error(response.data.message || 'Échec de la mise à jour');
//       }
//     } catch (error: any) {
//       
//       // Si c'est une erreur 401, déconnecter l'utilisateur
//       if (error.response?.status === 401) {
//         Alert.alert('Session expirée',"Veuillez vous reconnectez ou ajoutez un compte !",[
//           {text:"ok",
//              onPress: async () => {
//           await logout;
//           router.navigate("/login");
//         },
//           }
//         ])
//       }
//       
//     } finally {
//       setLoading(false);
//     }
//   };
// 
//   const login = async (email: string, password: string, location?: { latitude: number; longitude: number }): Promise<boolean> => {
//     try {
//       setLoading(true);
//       
//       const response = await authAPI.login({
//         email,
//         password,
//         latitude: location?.latitude,
//         longitude: location?.longitude
//       });
// 
//       if (response.data.success && response.data.token && response.data.user) {
//         // Utilisez saveUserData qui sauvegarde user ET token
//         await saveUserData(response.data.user, response.data.token);
//         setUser(response.data.user);
//          setToken(response.data.token);
//         setIsAuthenticated(true);
//         return true;
//       } else {
//         throw new Error(response.data.message || 'Login failed');
//       }
//     } catch (error: any) {
//       // console.error('Login error:', error);
//       await removeUserData();
//       setToken(null);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
// 
//   const register = async (data: {
//     username: string;
//     email: string;
//     password: string;
//     interests?: string[];
//     location?: { lat: number; lon: number };
//   }) => {
//     try {
//       setLoading(true);
//       const response = await authAPI.register({
//         username: data.username,
//         email: data.email,
//         password: data.password,
//         interests: data.interests || ['Musique', 'Voyage'],
//         latitude: data.location?.lat,
//         longitude: data.location?.lon
//       });
// 
//       if (response.data.success && response.data.token && response.data.user) {
//         // Utilisez saveUserData qui sauvegarde user ET token
//         await saveUserData(response.data.user, response.data.token);
//         setUser(response.data.user);
//          setToken(response.data.token);
//         setIsAuthenticated(true);
//       } else {
//         throw new Error(response.data.message || 'Registration failed');
//       }
//     } catch (error: any) {
//       console.error('Register error:', error);
//       await removeUserData();
//       setToken(null);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
// 
//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       await removeUserData();
//       setUser(null);
//       setToken(null);
//       setIsAuthenticated(false);
//     }
//   };
// 
//   return { 
//     user, 
//     loading, 
//     isAuthenticated,
//     token,
//     login, 
//     register, 
//     logout,
//     updateUser
//   };
// };

// hooks/useAuth.tsx - Version corrigée
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getUserData, removeUserData, saveUserData } from '../services/auth'; // Importez depuis auth.ts
import { User } from "../types/index"
import { userAPI } from '@/services/api';
import { useRouter } from 'expo-router';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  // RETIRER les fonctions API
  // login: (email: string, password: string, location?: { latitude: number; longitude: number }) => Promise<boolean>;
  // register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  // AJOUTER ces fonctions
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authData = await getUserData();
      if (authData && authData.user && authData.token) {
        setUser(authData.user);
        setToken(authData.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour définir l'authentification (sans appel API)
  const setAuth = async (user: User, token: string) => {
    await saveUserData(user, token);
    setUser(user);
    setToken(token);
    setIsAuthenticated(true);
  };

  // Fonction pour effacer l'authentification
  const clearAuth = async () => {
    await removeUserData();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const logout = async () => {
    await clearAuth();
    // Rediriger vers login
    router.navigate("/(auth)/login");
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      
      // Vérifiez l'authentification
      const authData = await getUserData();
      if (!authData || !authData.token) {
        throw new Error('Utilisateur non authentifié');
      }

      // Ici vous gardez l'appel API pour mettre à jour le profil
      // mais avec l'instance api qui a déjà le token configuré
      const response = await userAPI.updateProfile(userData);
      
      if (response.data.success && response.data.data) {
        const updatedUser = { ...user, ...response.data.data };
        
        // Mettre à jour le state local
        setUser(updatedUser);
        
        // Sauvegarder dans le stockage local AVEC LE TOKEN
        await saveUserData(updatedUser, authData.token);
      }
    } catch (error: any) {
      // Gérer les erreurs
      if (error.response?.status === 401) {
        Alert.alert('Session expirée', "Veuillez vous reconnecter", [
          {
            text: "OK",
            onPress: async () => {
              await clearAuth();
              router.navigate("/(auth)/login");
            },
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    isAuthenticated,
    token,
    logout,
    updateUser,
    setAuth,
    clearAuth
  };
};