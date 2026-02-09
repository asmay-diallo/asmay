
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api} from './api';
import { User } from '../types/index';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// utilisez ces fonctions partout

export const saveUserData = async (user: User, token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_KEY, token);
    // Configurez le header axios global
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<{ user: any; token: string } | null> => {
  try {
    const [userData, token] = await Promise.all([
      AsyncStorage.getItem(USER_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
    ]);

    if (!token || !userData) {
      return null;
    }

    return {
      user: JSON.parse(userData),
      token: token
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.removeItem(TOKEN_KEY)
    ]);
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

export const storeToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const storeUserData = async (userData: any): Promise<void> => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
};
