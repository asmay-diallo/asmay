// // services/StreamHolder.ts
// 
// import { MediaStream } from 'react-native-webrtc';
// 
// /**
//  * Simple holder qui garde une référence aux MediaStream
//  * pour éviter qu'ils soient garbage-collectés
//  */
// class StreamHolder {
//   private static instance: StreamHolder;
//   
//   localStream: MediaStream | null = null;
//   remoteStream: MediaStream | null = null;
// 
//   static getInstance(): StreamHolder {
//     if (!StreamHolder.instance) {
//       StreamHolder.instance = new StreamHolder();
//     }
//     return StreamHolder.instance;
//   }
// 
//   setLocal(stream: MediaStream | null) {
//     if (this.localStream) {
//       try { this.localStream.getTracks().forEach(t => t.stop()); } catch (e) {}
//     }
//     this.localStream = stream;
//   }
// 
//   setRemote(stream: MediaStream | null) {
//     if (this.remoteStream) {
//       try { this.remoteStream.getTracks().forEach(t => t.stop()); } catch (e) {}
//     }
//     this.remoteStream = stream;
//   }
// 
//   cleanup() {
//     this.setLocal(null);
//     this.setRemote(null);
//   }
// }
// 
// export default StreamHolder;

// services/StreamHolder.ts

import { MediaStream } from 'react-native-webrtc';

type Listener = () => void;

class StreamHolder {
  private static instance: StreamHolder;
  
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  
  // Liste des fonctions à appeler quand les streams changent
  private listeners: Set<Listener> = new Set();

  static getInstance(): StreamHolder {
    if (!StreamHolder.instance) {
      StreamHolder.instance = new StreamHolder();
    }
    return StreamHolder.instance;
  }

  setLocal(stream: MediaStream | null): void {
    if (this.localStream && this.localStream !== stream) {
      try {
        this.localStream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.warn('⚠️ Erreur arrêt tracks locaux:', e);
      }
    }
    this.localStream = stream;
    console.log('📹 StreamHolder: localStream', stream ? 'DÉFINI' : 'null');
    this.notifyListeners();
  }

  setRemote(stream: MediaStream | null): void {
    if (this.remoteStream && this.remoteStream !== stream) {
      try {
        this.remoteStream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.warn('⚠️ Erreur arrêt tracks distants:', e);
      }
    }
    this.remoteStream = stream;
    console.log('📥 StreamHolder: remoteStream', stream ? 'DÉFINI' : 'null');
    if (stream) {
      console.log('  tracks:', stream.getTracks().map(t => `${t.kind}:${t.readyState}`));
    }
    this.notifyListeners();
  }

  cleanup(): void {
    console.log('🧹 StreamHolder: nettoyage complet');
    
    if (this.localStream) {
      try {
        this.localStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.localStream = null;
    }
    
    if (this.remoteStream) {
      try {
        this.remoteStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.remoteStream = null;
    }
    
    this.notifyListeners();
  }

  /**
   * S'abonner aux changements de streams
   * @param listener Fonction appelée quand un stream change
   * @returns Fonction pour se désabonner
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    console.log('🔔 Nouvel abonné StreamHolder, total:', this.listeners.size);
    
    // Retourner la fonction de désabonnement
    return () => {
      this.listeners.delete(listener);
      console.log('🔕 Abonné retiré, restant:', this.listeners.size);
    };
  }

  /**
   * Notifie tous les abonnés que les streams ont changé
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.warn('⚠️ Erreur notification listener:', e);
      }
    });
  }

  // Vérifier l'état
  isLocalReady(): boolean {
    return this.localStream !== null && 
           this.localStream.getTracks().some(t => t.readyState === 'live');
  }

  isRemoteReady(): boolean {
    return this.remoteStream !== null && 
           this.remoteStream.getTracks().some(t => t.readyState === 'live');
  }

  isReady(): boolean {
    return this.isLocalReady() && this.isRemoteReady();
  }
}

export default StreamHolder;