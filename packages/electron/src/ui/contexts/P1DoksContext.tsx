import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a mapping with metadata
export interface Mapping {
  p1doks: string;
  iracing: string;
  isDefault?: boolean; // Track if this is a default mapping
}

// Define the shape of the P1Doks settings
export interface P1DoksSettings {
  email: string;
  password: string;
  carMappings: Mapping[];
  trackMappings: Mapping[];
}

// Define the context interface
interface P1DoksContextType {
  settings: P1DoksSettings;
  updateEmail: (email: string) => void;
  updatePassword: (password: string) => void;
  addCarMapping: (p1doks: string, iracing: string) => void;
  removeCarMapping: (index: number) => void;
  editCarMapping: (index: number, p1doks: string, iracing: string) => void;
  replaceCarMappings: (mappings: Mapping[]) => void;
  addTrackMapping: (p1doks: string, iracing: string) => void;
  removeTrackMapping: (index: number) => void;
  editTrackMapping: (index: number, p1doks: string, iracing: string) => void;
  replaceTrackMappings: (mappings: Mapping[]) => void;
  updateSettings: (newSettings: Partial<P1DoksSettings>) => void;
  resetToDefaults: () => void;
}

// Create the context
const P1DoksContext = createContext<P1DoksContextType | undefined>(undefined);

// Default settings with original mappings (marked as defaults)
const defaultSettings: P1DoksSettings = {
  email: '',
  password: '',
  carMappings: [
    { p1doks: "Acura NSX GT3 EVO 22", iracing: "acuransxevo22gt3", isDefault: true },
    { p1doks: "Audi R8 LMS GT3 EVO II", iracing: "audir8lmsevo2gt3", isDefault: true },
    { p1doks: "BMW M4 GT3", iracing: "bmwm4gt3", isDefault: true },
    { p1doks: "Chevrolet Corvette Z06 GT3.R", iracing: "chevyvettez06rgt3", isDefault: true },
    { p1doks: "Ferrari 296 GT3", iracing: "ferrari296gt3", isDefault: true },
    { p1doks: "Ford Mustang GT3", iracing: "fordmustanggt3", isDefault: true },
    { p1doks: "Lamborghini Huracán GT3 EVO", iracing: "lamborghinievogt3", isDefault: true },
    { p1doks: "McLaren 720S GT3 EVO", iracing: "mclaren720sgt3", isDefault: true },
    { p1doks: "Mercedes-AMG GT3 2020", iracing: "mercedesamgevogt3", isDefault: true },
    { p1doks: "Porsche 911 GT3 R (992)", iracing: "porsche992rgt3", isDefault: true },
    { p1doks: "Aston Martin GT3", iracing: "amvantageevogt3", isDefault: true },
    { p1doks: "Super Formula Lights  Open Wheel", iracing: "superformulalights324", isDefault: true },
    { p1doks: "IR18 IndyCar  Open Wheel", iracing: "dallarair18", isDefault: true },
    { p1doks: "SF23", iracing: "superformulasf23 honda", isDefault: true },
    { p1doks: "Porsche 911 RSR GTE", iracing: "porsche991rsr", isDefault: true },
    { p1doks: "Chevrolet Corvette C8.R GTE", iracing: "c8rvettegte", isDefault: true },
    { p1doks: "BMW M8 GTE", iracing: "bmwm8gte", isDefault: true },
    { p1doks: "Ligier JS P320 LMP3", iracing: "ligierjsp320", isDefault: true },
    { p1doks: "Porsche 963 GTP", iracing: "porsche963gtp", isDefault: true },
    { p1doks: "Cadillac V-Series R GTP", iracing: "cadillacvseriesrgtp", isDefault: true },
    { p1doks: "Acura ARX-06 GTP", iracing: "acuraarx06gtp", isDefault: true },
    { p1doks: "Ferrari 499P GTP", iracing: "ferrari499p", isDefault: true },
    { p1doks: "Porsche 718 Cayman GT4 Clubsport MR", iracing: "porsche718gt4", isDefault: true },
    { p1doks: "McLaren 570S GT4", iracing: "mclaren570sgt4", isDefault: true },
    { p1doks: "Ford Mustang GT4", iracing: "fordmustanggt4", isDefault: true },
    { p1doks: "Aston Martin Vantage GT4", iracing: "amvantagegt4", isDefault: true },
    { p1doks: "Mercedes GT4", iracing: "mercedesamggt4", isDefault: true },
    { p1doks: "BMW M4 GT4", iracing: "bmwm4gt4", isDefault: true },
    { p1doks: "Dallara P217 (LMP2)", iracing: "dallarap217", isDefault: true },
    { p1doks: "Honda Civic Type R TCR", iracing: "hondacivictyper", isDefault: true },
    { p1doks: "Hyundai Elantra N TCR", iracing: "hyundaielantracn7", isDefault: true },
    { p1doks: "Global Mazda MX-5 Cup", iracing: "mx5 cup", isDefault: true },
    { p1doks: "BMW M2 CS", iracing: "bmwm2csr", isDefault: true },
    { p1doks: "Porsche Cup 992", iracing: "porsche992cup", isDefault: true },
    { p1doks: "BMW M Hybrid V8 GTP", iracing: "bmwlmdh", isDefault: true },
  ],
  trackMappings: [],
};

// P1Doks provider component
interface P1DoksProviderProps {
  children: ReactNode;
}

export const P1DoksProvider: React.FC<P1DoksProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<P1DoksSettings>(() => {
    // Initialize state with localStorage value if available
    try {
      const savedSettings = localStorage.getItem('p1doks-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Merge user settings with defaults, combining both arrays
        const mergeMappings = (userMappings: any[], defaultMappings: Mapping[]) => {
          if (!userMappings || userMappings.length === 0) {
            return defaultMappings;
          }
          
          // Start with defaults, then override/add user mappings
          const merged = [...defaultMappings];
          
          userMappings.forEach(userMapping => {
            const existingIndex = merged.findIndex(m => m.p1doks === userMapping.p1doks);
            if (existingIndex >= 0) {
              // Override existing default with user mapping, preserve isDefault flag
              merged[existingIndex] = {
                ...userMapping,
                isDefault: merged[existingIndex].isDefault
              };
            } else {
              // Add new user mapping (not a default)
              merged.push({
                ...userMapping,
                isDefault: false
              });
            }
          });
          
          return merged;
        };
        
               const mergedSettings: P1DoksSettings = {
                 email: parsedSettings.email || defaultSettings.email,
                 password: parsedSettings.password || defaultSettings.password,
                 carMappings: mergeMappings(parsedSettings.carMappings, defaultSettings.carMappings),
                 trackMappings: mergeMappings(parsedSettings.trackMappings, defaultSettings.trackMappings),
               };
        
        console.log('P1Doks Context - Loaded settings:', {
          hasSavedSettings: !!savedSettings,
          savedCarMappings: parsedSettings.carMappings?.length || 0,
          defaultCarMappings: defaultSettings.carMappings.length,
          finalCarMappings: mergedSettings.carMappings.length
        });
        
        return mergedSettings;
      }
    } catch (error) {
      console.error('Error loading P1Doks settings from localStorage during initialization:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('p1doks-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving P1Doks settings to localStorage:', error);
    }
  }, [settings]);

  // Update functions
  const updateEmail = (email: string) => {
    setSettings(prev => ({ ...prev, email }));
  };

  const updatePassword = (password: string) => {
    setSettings(prev => ({ ...prev, password }));
  };

  const addCarMapping = (p1doks: string, iracing: string) => {
    if (p1doks && iracing) {
      setSettings(prev => {
        const newMappings = [...prev.carMappings, { p1doks, iracing }];
        return {
          ...prev,
          carMappings: newMappings
        };
      });
    } else {
    }
  };

  const removeCarMapping = (index: number) => {
    setSettings(prev => {
      const mapping = prev.carMappings[index];
      // Don't allow deletion of default mappings
      if (mapping?.isDefault) {
        return prev;
      }
      return {
        ...prev,
        carMappings: prev.carMappings.filter((_, i) => i !== index)
      };
    });
  };

  const editCarMapping = (index: number, p1doks: string, iracing: string) => {
    setSettings(prev => ({
      ...prev,
      carMappings: prev.carMappings.map((mapping, i) => 
        i === index ? { ...mapping, p1doks, iracing } : mapping
      )
    }));
  };

  const replaceCarMappings = (mappings: Mapping[]) => {
    setSettings(prev => ({
      ...prev,
      carMappings: mappings
    }));
  };

  const addTrackMapping = (p1doks: string, iracing: string) => {
    if (p1doks && iracing) {
      setSettings(prev => ({
        ...prev,
        trackMappings: [...prev.trackMappings, { p1doks, iracing }]
      }));
    }
  };

  const removeTrackMapping = (index: number) => {
    setSettings(prev => {
      const mapping = prev.trackMappings[index];
      // Don't allow deletion of default mappings
      if (mapping?.isDefault) {
        return prev;
      }
      return {
        ...prev,
        trackMappings: prev.trackMappings.filter((_, i) => i !== index)
      };
    });
  };

  const editTrackMapping = (index: number, p1doks: string, iracing: string) => {
    setSettings(prev => ({
      ...prev,
      trackMappings: prev.trackMappings.map((mapping, i) => 
        i === index ? { ...mapping, p1doks, iracing } : mapping
      )
    }));
  };

  const replaceTrackMappings = (mappings: Mapping[]) => {
    setSettings(prev => ({
      ...prev,
      trackMappings: mappings
    }));
  };


  const updateSettings = (newSettings: Partial<P1DoksSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const contextValue: P1DoksContextType = {
    settings,
    updateEmail,
    updatePassword,
    addCarMapping,
    removeCarMapping,
    editCarMapping,
    replaceCarMappings,
    addTrackMapping,
    removeTrackMapping,
    editTrackMapping,
    replaceTrackMappings,
    updateSettings,
    resetToDefaults,
  };

  return (
    <P1DoksContext.Provider value={contextValue}>
      {children}
    </P1DoksContext.Provider>
  );
};

// Custom hook to use the P1Doks context
export const useP1Doks = () => {
  const context = useContext(P1DoksContext);
  if (!context) {
    throw new Error('useP1Doks must be used within a P1DoksProvider');
  }
  return context;
};
