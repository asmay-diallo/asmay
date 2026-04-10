import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import { uploadAPI } from '@/services/upload';
import { useAuth } from '../useAuth';

//  Récupérer le profil utilisateur
export const useProfileQuery = () => {
  const { user, token } = useAuth();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
    enabled: !!user && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000,
  });
};

//  Mettre à jour le profil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: (userData: {
      username?: string;
      interests?: string[];
      bio?: string;
      profilePicture?: string;
      privacySettings?: {
        isVisible: boolean;
        showCommonInterestsOnly: boolean;
        showOnRadar: boolean;
      };
    }) => userAPI.updateProfile(userData),
    
    onSuccess: (response, variables) => {
      // Mettre à jour le cache
      queryClient.setQueryData(['profile'], response.data.data);
      
      // Mettre à jour l'utilisateur dans Redux (auth)
      updateUser(variables);
    },
  });
};

// Upload de photo de profil
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: (uri: string) => uploadAPI.uploadProfilePicture(uri),
    onSuccess: (response) => {
      if (response.success) {
        // Mettre à jour le cache
        queryClient.setQueryData(['profile'], (old: any) => ({
          ...old,
          profilePicture: response.data.fullUrl,
        }));
        
        // Mettre à jour Redux
        updateUser({ profilePicture: response.data.fullUrl });
      }
    },
  });
};

//  Récupérer le taux de change
export const useExchangeRateQuery = () => {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: async () => {
      const response = await userAPI.getExchangeRate();
      return response.data.data?.rate || 0.0001;
    },
    staleTime: 60 * 60 * 1000, // 1 heure
    gcTime: 2 * 60 * 60 * 1000,
  });
};

//  Rafraîchir les coins
export const useRefreshCoins = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: () => userAPI.getProfile(),
    onSuccess: (response) => {
      const newCoins = response.data.data?.coins;
      if (newCoins !== undefined) {
        // Mettre à jour le cache
        queryClient.setQueryData(['profile'], (old: any) => ({
          ...old,
          coins: newCoins,
        }));
        
        // Mettre à jour Redux
        updateUser({ coins: newCoins });
      }
    },
  });
};

//  Supprimer la photo de profil
export const useRemoveProfilePicture = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: () => userAPI.updateProfile({ profilePicture: "" }),
    onSuccess: () => {
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        profilePicture: "",
      }));
      updateUser({ profilePicture: "" });
    },
  });
};