// import * as FileSystem from 'expo-file-system';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// 
// const CACHE_DIR = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}audio/` : null;
// const CACHE_INDEX_KEY = '@audio_cache_index';
// const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
// const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours
// 
// export const audioCache = {
//   /**
//    * Nettoyer le cache audio
//    */
//   cleanCache: async (): Promise<void> => {
//     try {
//       console.log('🧹 Nettoyage du cache audio...');
//       
//       const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
//       if (!dirInfo.exists) return;
// 
//       // Lire l'index
//       const cacheIndex = await AsyncStorage.getItem(CACHE_INDEX_KEY);
//       const index = cacheIndex ? JSON.parse(cacheIndex) : {};
// 
//       // Lire tous les fichiers
//       const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
//       
//       let totalSize = 0;
//       const now = Date.now();
//       const fileStats = [];
// 
//       for (const file of files) {
//         const filePath = `${CACHE_DIR}${file}`;
//         const stat = await FileSystem.getInfoAsync(filePath);
//         
//         if (stat.exists) {
//           const age = now - (stat.modificationTime || 0);
//           fileStats.push({
//             file,
//             path: filePath,
//             size: stat.size || 0,
//             age,
//           });
//           totalSize += stat.size || 0;
//         }
//       }
// 
//       // Trier par âge (plus vieux d'abord)
//       fileStats.sort((a, b) => b.age - a.age);
// 
//       // Supprimer les fichiers trop vieux
//       for (const stat of fileStats) {
//         if (stat.age > MAX_CACHE_AGE) {
//           await FileSystem.deleteAsync(stat.path);
//           totalSize -= stat.size;
//           
//           // Supprimer de l'index
//           const messageId = Object.keys(index).find(key => index[key] === stat.path);
//           if (messageId) {
//             delete index[messageId];
//           }
//           console.log(`🗑️ Supprimé (trop vieux): ${stat.file}`);
//         }
//       }
// 
//       // Si encore trop gros, supprimer les plus vieux
//       if (totalSize > MAX_CACHE_SIZE) {
//         const sorted = fileStats.filter(s => s.age <= MAX_CACHE_AGE).sort((a, b) => b.age - a.age);
//         
//         while (totalSize > MAX_CACHE_SIZE && sorted.length > 0) {
//           const oldest = sorted.shift();
//           if (oldest) {
//             await FileSystem.deleteAsync(oldest.path);
//             totalSize -= oldest.size;
//             
//             const messageId = Object.keys(index).find(key => index[key] === oldest.path);
//             if (messageId) {
//               delete index[messageId];
//             }
//             console.log(`🗑️ Supprimé (trop gros): ${oldest.file}`);
//           }
//         }
//       }
// 
//       // Sauvegarder l'index mis à jour
//       await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
//       
//       console.log(`✅ Cache audio nettoyé. Taille: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
// 
//     } catch (error) {
//       console.error('❌ Erreur nettoyage cache:', error);
//     }
//   },
// 
//   /**
//    * Obtenir la taille du cache
//    */
//   getCacheSize: async (): Promise<number> => {
//     try {
//       const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
//       if (!dirInfo.exists) return 0;
// 
//       const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
//       let totalSize = 0;
// 
//       for (const file of files) {
//         const stat = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
//         totalSize += stat.size || 0;
//       }
// 
//       return totalSize;
//     } catch (error) {
//       console.error('❌ Erreur lecture taille cache:', error);
//       return 0;
//     }
//   },
// 
//   /**
//    * Vider complètement le cache
//    */
//   clearCache: async (): Promise<void> => {
//     try {
//       await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
//       await AsyncStorage.removeItem(CACHE_INDEX_KEY);
//       console.log('✅ Cache audio vidé');
//     } catch (error) {
//       console.error('❌ Erreur vidage cache:', error);
//     }
//   },
// };

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== UTILITAIRE POUR CONTOURNER TYPESCRIPT ====================
const getFileSystem = () => {
  return FileSystem as any; // Contournement TypeScript
};

// ==================== OBTENIR LE RÉPERTOIRE DE STOCKAGE ====================
const getStorageDirectory = (): string | null => {
  try {
    const fs = getFileSystem();
    
    // Essayer cacheDirectory
    if (fs.cacheDirectory) {
      return fs.cacheDirectory;
    }
    
    // Essayer documentDirectory
    if (fs.documentDirectory) {
      return fs.documentDirectory;
    }

    console.warn('⚠️ Aucun répertoire de stockage disponible');
    return null;
  } catch (error) {
    console.error('❌ Erreur accès stockage:', error);
    return null;
  }
};

// ==================== CONFIGURATION ====================
const BASE_DIR = getStorageDirectory();
const CACHE_DIR = BASE_DIR ? `${BASE_DIR}audio/` : null;
const CACHE_INDEX_KEY = '@audio_cache_index';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours

export const audioCache = {
  /**
   * Vérifier si le cache est disponible
   */
  isAvailable: (): boolean => {
    return CACHE_DIR !== null;
  },

  /**
   * Obtenir le chemin du cache (pour debug)
   */
  getCachePath: (): string | null => {
    return CACHE_DIR;
  },

  /**
   * Initialiser le cache
   */
  initCache: async (): Promise<boolean> => {
    try {
      if (!CACHE_DIR) {
        console.log('ℹ️ Cache non disponible - mode sans cache');
        return false;
      }

      // Vérifier si le dossier existe
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        console.log('📁 Dossier cache créé');
      }

      console.log('✅ Cache audio prêt');
      return true;
    } catch (error) {
      console.error('❌ Erreur init cache:', error);
      return false;
    }
  },

  /**
   * Sauvegarder un fichier dans le cache
   */
  saveToCache: async (messageId: string, uri: string): Promise<string | null> => {
    try {
      if (!CACHE_DIR) return null;

      const filename = `${messageId}.m4a`;
      const cachePath = `${CACHE_DIR}${filename}`;

      // Copier le fichier
      await FileSystem.copyAsync({
        from: uri,
        to: cachePath,
      });

      // Mettre à jour l'index
      const cacheIndex = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      const index = cacheIndex ? JSON.parse(cacheIndex) : {};
      index[messageId] = cachePath;
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));

      console.log(`✅ Audio en cache: ${messageId}`);
      return cachePath;

    } catch (error) {
      console.error('❌ Erreur sauvegarde cache:', error);
      return null;
    }
  },

  /**
   * Récupérer un fichier du cache
   */
  getFromCache: async (messageId: string): Promise<string | null> => {
    try {
      if (!CACHE_DIR) return null;

      const cacheIndex = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      const index = cacheIndex ? JSON.parse(cacheIndex) : {};
      
      const cachePath = index[messageId];
      if (!cachePath) return null;

      const fileInfo = await FileSystem.getInfoAsync(cachePath);
      if (!fileInfo.exists) return null;

      return cachePath;

    } catch (error) {
      console.error('❌ Erreur lecture cache:', error);
      return null;
    }
  },

  /**
   * Nettoyer le cache
   */
  cleanCache: async (): Promise<void> => {
    try {
      if (!CACHE_DIR) return;

      console.log('🧹 Nettoyage du cache...');
      
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      if (files.length === 0) return;

      const cacheIndex = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      const index = cacheIndex ? JSON.parse(cacheIndex) : {};
      
      let totalSize = 0;
      const now = Date.now();
      const fileStats = [];

      for (const file of files) {
        const filePath = `${CACHE_DIR}${file}`;
        const stat = await FileSystem.getInfoAsync(filePath);
        
        if (stat.exists) {
          const age = now - (stat.modificationTime || 0);
          fileStats.push({
            file,
            path: filePath,
            size: stat.size || 0,
            age,
          });
          totalSize += stat.size || 0;
        }
      }

      // Supprimer les fichiers trop vieux
      for (const stat of fileStats) {
        if (stat.age > MAX_CACHE_AGE) {
          await FileSystem.deleteAsync(stat.path);
          totalSize -= stat.size;
          
          const messageId = Object.keys(index).find(key => index[key] === stat.path);
          if (messageId) delete index[messageId];
          console.log(`🗑️ Supprimé (vieux): ${stat.file}`);
        }
      }

      // Si trop gros, supprimer les plus vieux
      if (totalSize > MAX_CACHE_SIZE) {
        const sorted = fileStats.sort((a, b) => b.age - a.age);
        
        while (totalSize > MAX_CACHE_SIZE && sorted.length > 0) {
          const oldest = sorted.shift();
          if (oldest) {
            await FileSystem.deleteAsync(oldest.path);
            totalSize -= oldest.size;
            
            const messageId = Object.keys(index).find(key => index[key] === oldest.path);
            if (messageId) delete index[messageId];
            console.log(`🗑️ Supprimé (gros): ${oldest.file}`);
          }
        }
      }

      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
      console.log(`✅ Cache nettoyé. Taille: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  },
};