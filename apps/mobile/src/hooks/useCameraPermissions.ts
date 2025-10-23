import { useState, useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';

export interface CameraPermissionState {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  isLoading: boolean;
}

/**
 * Hook for managing camera permissions
 * Automatically checks permission status on mount
 */
export function useCameraPermissions(): CameraPermissionState {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    setIsLoading(true);
    try {
      const status = await Camera.getCameraPermissionStatus();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const permission = await Camera.requestCameraPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPermission,
    requestPermission,
    isLoading,
  };
}
