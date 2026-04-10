// hooks/queries/useSignalsQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalAPI } from '../../services/api';
import { useAuth } from '../useAuth';
import { useSocket } from '../useSocket';

interface Signal {
  _id: string;
  fromUserId: { _id: string; username: string; profilePicture?: string };
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'ignored' | 'expired';
  createdAt: string;
  expiresAt: string;
  chatId?: string;
  viewed?: boolean;
  commonInterests?: string[];
}

//  Récupérer les signaux reçus
export const useReceivedSignalsQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['signals', 'received'],
    queryFn: async () => {
      const response = await signalAPI.getReceivedSignals();
      return response.data.data as Signal[];
    },
    enabled: !!user,
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000, // Recharge toutes les 30 secondes
  });
};

//  Accepter un signal
export const useAcceptSignal = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  
  return useMutation({
    mutationFn: (signalId: string) => signalAPI.respond(signalId, 'accepted'),
    onSuccess: (response, signalId) => {
      const chatId = response.data.data?.chatId;
      
      // Mettre à jour le cache
      queryClient.setQueryData(['signals', 'received'], (old: Signal[] = []) => {
        return old.map(signal => 
          signal._id === signalId 
            ? { ...signal, status: 'accepted', chatId, viewed: true }
            : signal
        );
      });
      
      // Invalider les chats pour afficher la nouvelle conversation
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      // Notifier via socket
      if (socket) {
        socket.emit('signal_responded', { signalId, response: 'accepted' });
      }
    },
  });
};

//  Refuser un signal
export const useDeclineSignal = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  
  return useMutation({
    mutationFn: (signalId: string) => signalAPI.respond(signalId, 'ignored'),
    onSuccess: (_, signalId) => {
      queryClient.setQueryData(['signals', 'received'], (old: Signal[] = []) => {
        return old.map(signal => 
          signal._id === signalId 
            ? { ...signal, status: 'ignored', viewed: true }
            : signal
        );
      });
      
      if (socket) {
        socket.emit('signal_responded', { signalId, response: 'ignored' });
      }
    },
  });
};

// Supprimer un signal
export const useDeleteSignal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (signalId: string) => signalAPI.delete(signalId),
    onSuccess: (_, signalId) => {
      queryClient.setQueryData(['signals', 'received'], (old: Signal[] = []) => {
        return old.filter(signal => signal._id !== signalId);
      });
    },
  });
};