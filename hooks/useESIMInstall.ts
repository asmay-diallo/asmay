import { useState, useCallback } from 'react';
import * as ESIM from '../expo-esim/src/index';
import {useSocket } from './useSocket'

type InstallStep = 'checking' | 'installing' | 'activating' | 'completed' | 'error';

interface UseESIMInstallReturn {
  currentStep: InstallStep;
  progress: number;
  error: string | null;
  isCompatible: boolean | null;

  checkCompatibility: () => Promise<boolean>;
  installESIM: (lpaString: string, iccid: string, productName: string) => Promise<boolean>;
  resetInstallation: () => void;
}

export const useESIMInstall = (): UseESIMInstallReturn => {
  const [currentStep, setCurrentStep] = useState<InstallStep>('checking');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const {socket,isConnected } = useSocket()

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const checkCompatibility = useCallback(async (): Promise<boolean> => {
    try {
      const result = await ESIM.checkESIMCompatibility();
      setIsCompatible(result.isCompatible);
      console.log("Est ce que c'est compatible : ",result.eid,result.isCompatible, result.model, result.platform);
      
      return result.isCompatible;
    } catch (err: any) {
      setError(err.message);
      setIsCompatible(false);
      return false;
    }
  }, []);

  const installESIM = useCallback(async (
    lpaString: string,
    iccid: string,
    productName: string,
  ): Promise<boolean> => {
    setError(null);
    setProgress(0);
    setCurrentStep('checking');

    try {
      // Étape 1 : Vérification
      setCurrentStep('checking');
      setProgress(5);
      await delay(1000);

      const compatible = await checkCompatibility();
      if (!compatible) {
        setCurrentStep('error');
        setError('Votre téléphone n\'est pas compatible eSIM');
        return false;
      }
      setProgress(20);

      // Étape 2 : Installation
      setCurrentStep('installing');
      if(socket && isConnected) {
          socket.emit('esim:install-started', { iccid, productName });
      }

      setProgress(30);
      await delay(1000);
      setProgress(50);

      const result = await ESIM.installESIM(lpaString, iccid);
      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'installation');
      }

      setProgress(70);

      // Étape 3 : Activation
      setCurrentStep('activating');
      setProgress(75);
      await delay(1500);
      setProgress(90);
      await delay(1000);
      setProgress(100);

      // Terminé
      setCurrentStep('completed');
        if(socket && isConnected) {
          socket.emit('esim:install-completed', { iccid, productName });
      }

      return true;
    } catch (err: any) {
      setCurrentStep('error');
      setError(err.message || 'Erreur lors de l\'installation');
      if (socket && isConnected) {
        
          socket.emit('esim:install-error', { iccid, error: err.message });
      }
      return false;
    }
  }, [checkCompatibility]);

  const resetInstallation = useCallback(() => {
    setCurrentStep('checking');
    setProgress(0);
    setError(null);
  }, []);

  return {
    currentStep,
    progress,
    error,
    isCompatible,
    checkCompatibility,
    installESIM,
    resetInstallation,
  };
};