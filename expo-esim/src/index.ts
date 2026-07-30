import { NativeModules, Platform } from 'react-native';

const ExpoEsim = NativeModules.ExpoEsim;

// ==================== TYPES ====================

export interface ESIMInstallResult {
  success: boolean;
  iccid?: string;
  error?: string;
  errorCode?: string;
}

export interface DeviceCompatibility {
  isCompatible: boolean;
  eid?: string;
  platform: 'ios' | 'android';
  model?: string;
  reason?: string;
}

// ==================== API ====================

/**
 * Vérifier si le téléphone supporte l'eSIM
 */
export async function checkESIMCompatibility(): Promise<DeviceCompatibility> {
  if (!ExpoEsim) {
    return {
      isCompatible: false,
      platform: Platform.OS as 'ios' | 'android',
      reason: 'Module eSIM non disponible',
    };
  }

  try {
    return await ExpoEsim.checkCompatibility();
  } catch (error: any) {
    return {
      isCompatible: false,
      platform: Platform.OS as 'ios' | 'android',
      reason: error.message,
    };
  }
}

/**
 * Récupérer l'EID de la puce eSIM
 */
export async function getEID(): Promise<string> {
  if (!ExpoEsim) throw new Error('Module eSIM non disponible');
  return await ExpoEsim.getEID();
}

/**
 * Installer une eSIM à partir d'une LPA string
 * @param lpaString - Chaîne d'activation LPA
 * @param iccid - Identifiant unique de l'eSIM
 */
export async function installESIM(
  lpaString: string,
  iccid: string
): Promise<ESIMInstallResult> {
  if (!ExpoEsim) {
    console.log('🔧 [DEV] Module non disponible, simulation installation:', iccid);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return { success: true, iccid };
  }

  try {
    return await ExpoEsim.installESIM(lpaString, iccid);
  } catch (error: any) {
    return {
      success: false,
      iccid,
      error: error.message,
      errorCode: error.code || 'UNKNOWN',
    };
  }
}

/**
 * Installer une eSIM à partir d'un QR Code
 */
export async function installESIMFromQR(qrCodeUrl: string): Promise<ESIMInstallResult> {
  if (!ExpoEsim) {
    console.log('🔧 [DEV] Simulation installation QR:', qrCodeUrl);
    return { success: true };
  }
  return await ExpoEsim.installFromQR(qrCodeUrl);
}

/**
 * Récupérer la liste des eSIM installées
 */
export async function getInstalledESIMs(): Promise<string[]> {
  if (!ExpoEsim) return [];
  return await ExpoEsim.getInstalledESIMs();
}

/**
 * Supprimer une eSIM
 */
export async function deleteESIM(iccid: string): Promise<boolean> {
  if (!ExpoEsim) return true;
  return await ExpoEsim.deleteESIM(iccid);
}