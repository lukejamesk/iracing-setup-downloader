import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define team interface
export interface Team {
  id: string;
  name: string;
}

// Define the settings interface
export interface GeneralSettings {
  teams: Team[];
  activeTeamId: string | null;
  downloadPath: string;
  backgroundImage: string;
}

// Define the context interface
interface SettingsContextType {
  settings: GeneralSettings;
  activeTeam: Team | null;
  addTeam: (name: string) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  setActiveTeam: (id: string) => void;
  updateDownloadPath: (downloadPath: string) => void;
  updateBackgroundImage: (backgroundImage: string) => void;
  updateSettings: (newSettings: Partial<GeneralSettings>) => void;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: GeneralSettings = {
  teams: [],
  activeTeamId: null,
  downloadPath: '',
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
        // Migrate old settings format if needed
        if (parsedSettings.teamName && !parsedSettings.teams) {
          const team: Team = {
            id: 'default-team',
            name: parsedSettings.teamName,
          };
          return {
            ...defaultSettings,
            ...parsedSettings,
            teams: [team],
            activeTeamId: 'default-team',
          };
        }
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

  // Get active team
  const activeTeam = settings.activeTeamId 
    ? settings.teams.find(team => team.id === settings.activeTeamId) || null
    : null;

  // Team management functions
  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
    };
    setSettings(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
      activeTeamId: newTeam.id,
    }));
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setSettings(prev => ({
      ...prev,
      teams: prev.teams.map(team => 
        team.id === id ? { ...team, ...updates } : team
      ),
    }));
  };

  const removeTeam = (id: string) => {
    setSettings(prev => {
      const newTeams = prev.teams.filter(team => team.id !== id);
      const newActiveTeamId = prev.activeTeamId === id 
        ? (newTeams.length > 0 ? newTeams[0].id : null)
        : prev.activeTeamId;
      return {
        ...prev,
        teams: newTeams,
        activeTeamId: newActiveTeamId,
      };
    });
  };

  const setActiveTeam = (id: string) => {
    setSettings(prev => ({ ...prev, activeTeamId: id }));
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
    activeTeam,
    addTeam,
    updateTeam,
    removeTeam,
    setActiveTeam,
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
