import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the settings interface
export interface GeneralSettings {
  teams: string[]; // Changed from Team[] to string[] - just store team names
  downloadPath: string;
  backgroundImage: string;
}

// Define the context interface
interface SettingsContextType {
  settings: GeneralSettings;
  addTeam: (name: string) => void;
  updateTeam: (oldName: string, newName: string) => void; // Changed to work with names
  removeTeam: (name: string) => void; // Changed to work with names
  updateDownloadPath: (downloadPath: string) => void;
  updateBackgroundImage: (backgroundImage: string) => void;
  updateSettings: (newSettings: Partial<GeneralSettings>) => void;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: GeneralSettings = {
  teams: [],
  downloadPath: '', // Will be set via IPC from main process
  backgroundImage: './racing-cars-background.png',
};

// Settings provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GeneralSettings>(() => {
    // Initialize state with localStorage value if available
    try {
      const savedSettings = localStorage.getItem('general-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage during initialization:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('general-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

      // Team management functions
      const addTeam = (name: string) => {
        setSettings(prev => ({
          ...prev,
          teams: [...prev.teams, name],
        }));
      };

      const updateTeam = (oldName: string, newName: string) => {
        setSettings(prev => ({
          ...prev,
          teams: prev.teams.map(team => team === oldName ? newName : team),
        }));
      };

      const removeTeam = (name: string) => {
        setSettings(prev => ({
          ...prev,
          teams: prev.teams.filter(team => team !== name),
        }));
      };

  const updateBackgroundImage = (backgroundImage: string) => {
    setSettings(prev => ({ ...prev, backgroundImage }));
  };

  const updateDownloadPath = (downloadPath: string) => {
    setSettings(prev => ({ ...prev, downloadPath }));
  };

  const updateSettings = (newSettings: Partial<GeneralSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

      const contextValue: SettingsContextType = {
        settings,
        addTeam,
        updateTeam,
        removeTeam,
        updateDownloadPath,
        updateBackgroundImage,
        updateSettings,
      };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
