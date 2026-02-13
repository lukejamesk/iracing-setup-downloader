import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the Hymo settings
export interface HymoSettings {
  login: string;
  password: string;
}

// Define the context interface
interface HymoContextType {
  settings: HymoSettings;
  updateLogin: (login: string) => void;
  updatePassword: (password: string) => void;
}

// Create the context
const HymoContext = createContext<HymoContextType | undefined>(undefined);

// Default settings
const defaultSettings: HymoSettings = {
  login: '',
  password: '',
};

// Hymo provider component
interface HymoProviderProps {
  children: ReactNode;
}

export const HymoProvider: React.FC<HymoProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<HymoSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('hymo-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return {
          login: parsedSettings.login || '',
          password: parsedSettings.password || '',
        };
      }
    } catch (error) {
      console.error('Error loading Hymo settings:', error);
    }

    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('hymo-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving Hymo settings:', error);
    }
  }, [settings]);

  const updateLogin = (login: string) => {
    setSettings(prev => ({ ...prev, login }));
  };

  const updatePassword = (password: string) => {
    setSettings(prev => ({ ...prev, password }));
  };

  const value: HymoContextType = {
    settings,
    updateLogin,
    updatePassword,
  };

  return (
    <HymoContext.Provider value={value}>
      {children}
    </HymoContext.Provider>
  );
};

// Custom hook to use the Hymo context
export const useHymo = (): HymoContextType => {
  const context = useContext(HymoContext);
  if (context === undefined) {
    throw new Error('useHymo must be used within a HymoProvider');
  }
  return context;
};
