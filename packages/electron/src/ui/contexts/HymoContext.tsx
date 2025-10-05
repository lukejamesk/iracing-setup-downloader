import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a mapping with metadata
export interface HymoMapping {
  p1doks: string; // Use p1doks for compatibility with existing Mapping interface
  iracing: string;
  isDefault?: boolean; // Track if this is a default mapping
}

// Define the shape of the Hymo settings
export interface HymoSettings {
  login: string;
  password: string;
  trackMappings: HymoMapping[];
}

// Define the context interface
interface HymoContextType {
  settings: HymoSettings;
  updateLogin: (login: string) => void;
  updatePassword: (password: string) => void;
  addTrackMapping: (p1doks: string, iracing: string) => void;
  removeTrackMapping: (index: number) => void;
  editTrackMapping: (index: number, p1doks: string, iracing: string) => void;
  replaceTrackMappings: (mappings: HymoMapping[]) => void;
}

// Create the context
const HymoContext = createContext<HymoContextType | undefined>(undefined);

// Default settings with empty track mappings (can be populated later)
const defaultSettings: HymoSettings = {
  login: '',
  password: '',
  trackMappings: [
    // Default track mappings can be added here when available
  ],
};

// Hymo provider component
interface HymoProviderProps {
  children: ReactNode;
}

export const HymoProvider: React.FC<HymoProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<HymoSettings>(() => {
    // Initialize state with localStorage value if available
    try {
      const savedSettings = localStorage.getItem('hymo-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Merge user settings with defaults, combining both arrays
        const mergeMappings = (userMappings: any[], defaultMappings: HymoMapping[]) => {
          if (!userMappings || userMappings.length === 0) {
            return defaultMappings;
          }
          
          // Start with defaults, then override/add user mappings
          const merged = [...defaultMappings];
          
          userMappings.forEach(userMapping => {
            const existingIndex = merged.findIndex(m => m.p1doks === userMapping.p1doks);
            if (existingIndex >= 0) {
              // Override existing default with user mapping, preserve isDefault flag
              merged[existingIndex] = { ...userMapping, isDefault: merged[existingIndex].isDefault };
            } else {
              // Add new user mapping
              merged.push({ ...userMapping, isDefault: false });
            }
          });
          
          return merged;
        };

        return {
          login: parsedSettings.login || '',
          password: parsedSettings.password || '',
          trackMappings: mergeMappings(parsedSettings.trackMappings, defaultSettings.trackMappings),
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

  const addTrackMapping = (p1doks: string, iracing: string) => {
    setSettings(prev => ({
      ...prev,
      trackMappings: [...prev.trackMappings, { p1doks, iracing, isDefault: false }],
    }));
  };

  const removeTrackMapping = (index: number) => {
    setSettings(prev => ({
      ...prev,
      trackMappings: prev.trackMappings.filter((_, i) => i !== index),
    }));
  };

  const editTrackMapping = (index: number, p1doks: string, iracing: string) => {
    setSettings(prev => ({
      ...prev,
      trackMappings: prev.trackMappings.map((mapping, i) =>
        i === index ? { ...mapping, p1doks, iracing } : mapping
      ),
    }));
  };

  const replaceTrackMappings = (mappings: HymoMapping[]) => {
    setSettings(prev => ({
      ...prev,
      trackMappings: mappings,
    }));
  };

  const value: HymoContextType = {
    settings,
    updateLogin,
    updatePassword,
    addTrackMapping,
    removeTrackMapping,
    editTrackMapping,
    replaceTrackMappings,
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
