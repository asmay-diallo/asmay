// 
// // hooks/useAuth.tsx 
// import { useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import { getUserData, removeUserData, saveUserData } from '../services/auth'; 
// import { User } from "../types/index"
// import { userAPI } from '@/services/api';
// import { useRouter } from 'expo-router';
// 
// interface UseAuthReturn {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//   token: string | null;
// 
//   logout: () => Promise<void>;
//   updateUser: (userData: Partial<User>) => Promise<void>;
//   // AJOUTER ces fonctions
//   setAuth: (user: User, token: string) => Promise<void>;
//   clearAuth: () => Promise<void>;
// }
// 
// export const useAuth = (): UseAuthReturn => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [token, setToken] = useState<string | null>(null);
//   const router = useRouter();
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
//         setToken(authData.token);
//         setIsAuthenticated(true);
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
// 
//   // Fonction pour définir l'authentification (sans appel API)
//   const setAuth = async (user: User, token: string) => {
//     await saveUserData(user, token);
//     setUser(user);
//     setToken(token);
//     setIsAuthenticated(true);
//   };
// 
//   // Fonction pour effacer l'authentification
//   const clearAuth = async () => {
//     await removeUserData();
//     setUser(null);
//     setToken(null);
//     setIsAuthenticated(false);
//   };
// 
//   const logout = async () => {
//     await clearAuth();
//     // Rediriger vers login
//     router.navigate("/(auth)");
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
//       // Ici vous gardez l'appel API pour mettre à jour le profil
//       // mais avec l'instance api qui a déjà le token configuré
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
//       }
//     } catch (error: any) {
//       // Gérer les erreurs
//       if (error.response?.status === 401) {
//         Alert.alert('Session expirée', "Veuillez vous reconnecter", [
//           {
//             text: "OK",
//             onPress: async () => {
//               await clearAuth();
//               // router.navigate("/(auth)");
//             },
//           }
//         ]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
// 
//   return { 
//     user, 
//     loading, 
//     isAuthenticated,
//     token,
//     logout,
//     updateUser,
//     setAuth,
//     clearAuth
//   };
// };

// frontend/hooks/useAuth.tsx
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { 
  setCredentials, 
  logout as reduxLogout, 
  updateUser as reduxUpdateUser,
  loginStart,
  loginSuccess,
  loginFailure 
} from '../store/slices/authSlice';
import { getUserData, removeUserData, saveUserData } from '../services/auth';
import { userAPI, authAPI } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // ✅ État depuis Redux
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const reduxLoading = useSelector((state: any) => state.auth.isLoading);
  const error = useSelector((state: any) => state.auth.error);
  
  const [loading, setLoading] = useState(true);

  // Restaurer l'authentification au démarrage
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const authData = await getUserData();
        if (authData?.user && authData?.token) {
          dispatch(setCredentials({
            user: authData.user,
            token: authData.token
          }));
        }
      } catch (error) {
        console.error('Erreur restauration auth:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, [dispatch]);

  // Connexion
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(loginStart());
      
      const response = await authAPI.login(credentials);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // Sauvegarder dans AsyncStorage
        await saveUserData(user, token);
        
        // Mettre à jour Redux
        dispatch(loginSuccess({ user, token }));
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      dispatch(loginFailure(message));
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Inscription
  const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch(loginStart());
      
      const response = await authAPI.register(userData);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        await saveUserData(user, token);
        dispatch(loginSuccess({ user, token }));
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Erreur d\'inscription');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      dispatch(loginFailure(message));
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Déconnexion
  const logout = useCallback(async () => {
    try {
      await removeUserData();
      dispatch(reduxLogout());
      router.navigate("/(auth)");
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }, [dispatch, router]);

  // Mise à jour du profil
  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await userAPI.updateProfile(userData);
      
      if (response.data.success && response.data.data) {
        dispatch(reduxUpdateUser(response.data.data));
        
        // Mettre à jour AsyncStorage
        if (user && token) {
          const updatedUser = { ...user, ...response.data.data };
          await saveUserData(updatedUser, token);
        }
        
        return { success: true };
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert(
          'Session expirée',
          'Veuillez vous reconnecter',
          [{ text: 'OK', onPress: logout }]
        );
      }
      return { success: false, error: error.message };
    }
  }, [dispatch, user, token, logout]);

  return {
    user,
    token,
    isAuthenticated,
    loading: loading || reduxLoading,
    error,
    login,
    register,
    logout,
    updateUser,
  };
};