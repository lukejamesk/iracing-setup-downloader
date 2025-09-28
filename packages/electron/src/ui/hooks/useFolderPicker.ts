import { useCallback } from 'react';

export const useFolderPicker = () => {
  const selectFolder = useCallback(async (): Promise<string | null> => {
    try {
      if (window.electronAPI?.selectFolder) {
        const result = await window.electronAPI.selectFolder();
        if (result.success) {
          console.log('Selected folder:', result.path);
          return result.path;
        }
      } else {
        console.error('Electron API not available');
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
    return null;
  }, []);

  return { selectFolder };
};
