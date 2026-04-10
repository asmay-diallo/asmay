// hooks/queries/useRadarQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { radarAPI, signalAPI } from '../../services/api';
import { useAuth } from '../useAuth';
import { useSocket } from '../useSocket';

interface NearbyUser {
  _id: string;
  username: string;
  interests: { common: string[]; count: number };
  distance: number;
  bearing: number;
  profilePicture?: string;
  toSessionId: string;
  privacySettings: { isVisible: boolean; showCommonInterestsOnly: boolean; showOnRadar: boolean };
  precision?: { level: number; text: string; icon: string; type: string; shortName: string; fullName: string };
  lastActive?: Date;
  isOnline?: boolean;
}

//  Récupérer les utilisateurs proches
export const useNearbyUsersQuery = (latitude: number, longitude: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['nearbyUsers', latitude, longitude],
    queryFn: async () => {
      const response = await radarAPI.getNearbyUsers(latitude, longitude);
      return response.data.data.users as NearbyUser[];
    },
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2*60 * 1000, // 2 minutes
    refetchInterval: 60*60 * 1000, // Recharge toutes les minutes
  });
};

//  Mettre à jour la position 
export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      radarAPI.updateLocation(latitude, longitude),
    onSuccess: (_, { latitude, longitude }) => {
      // Rafraîchir la liste des utilisateurs proches
      queryClient.invalidateQueries({ queryKey: ['nearbyUsers', latitude, longitude] });
    },
  });
};