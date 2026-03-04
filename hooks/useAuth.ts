
// hooks/useAuth.tsx 
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getUserData, removeUserData, saveUserData } from '../services/auth'; 
import { User } from "../types/index"
import { userAPI } from '@/services/api';
import { useRouter } from 'expo-router';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;

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
    router.navigate("/(auth)");
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
              // router.navigate("/(auth)");
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
