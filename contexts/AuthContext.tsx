
import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  getToken,
  storeToken,
  removeToken,
  storeUserData,
  getUserData,
  removeUserData,
} from "../services/auth";
import { userAPI,authAPI } from "../services/api";

interface AuthContextType {
  user: any | null;
  userToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    interests: string[];
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      const savedUser = await getUserData(); // Les données sont toujours là

      if (token && savedUser) {
        setUserToken(token);
        setUser(savedUser);

        // Validez le token avec le backend
        try {
          const response = await userAPI.getUserById("");
          if (response.data.success) {
            // Mettez à jour avec les données fraîches du serveur
            const freshUserData = response.data.data;
            setUser(freshUserData);
            await storeUserData(freshUserData); // Mettez à jour le stockage local
          }
        } catch (error) {
          // console.error("Token validation failed:", error);
          // Le token est invalide, déconnectez vraiment
          await removeToken();
          await removeUserData(); // Ici, supprimez tout
          setUserToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });

      if (response.data.success && response.data.data) {
        const { token, user: userData } = response.data.data;

        await storeToken(token);
        await storeUserData(userData);

        setUserToken(token);
        setUser(userData);

        return true;
      } else {
        console.error("Login failed:", response.data.message);
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Erreur de connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    interests: string[];
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);

      if (response.data.success && response.data.data) {
        const { token, user: newUser } = response.data.data;

        await storeToken(token);
        await storeUserData(newUser);

        setUserToken(token);
        setUser(newUser);

        return true;
      } else {
        console.error("Registration failed:", response.data.message);
        return false;
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Erreur lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await removeToken(); // Supprimez seulement le token
      // NE supprimez PAS les données utilisateur : await removeUserData();

      setUserToken(null);
      setUser(null); // Mais réinitialisez l'état
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: any) => {
    setUser((prevUser: any) => {
      const updatedUser = { ...prevUser, ...userData };
      // Sauvegarder aussi dans le stockage local
      storeUserData(updatedUser);
      return updatedUser;
    });
  };

  const value: AuthContextType = {
    user,
    userToken,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
