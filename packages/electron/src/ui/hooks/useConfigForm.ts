import { useState, useCallback } from 'react';
import { useLocalStorage, useHistoryStorage } from './useLocalStorage';
import { Config as CoreConfig } from '@p1doks-downloader/p1doks-download';

// Extend the core Config with UI-specific fields
export interface Config extends CoreConfig {
  rememberCredentials?: boolean;
}

interface UseConfigFormProps {
  onDownload: (config: Config) => Promise<{ completed: boolean }>;
}

export function useConfigForm({ onDownload }: UseConfigFormProps) {
  // Default mappings for P1Doks to iRacing conversions
  const defaultMappings = {
    carP1DoksToIracing: {
      "Acura NSX GT3 EVO 22": "acuransxevo22gt3",
      "Audi R8 LMS GT3 EVO II": "audir8lmsevo2gt3",
      "BMW M4 GT3": "bmwm4gt3",
      "Chevrolet Corvette Z06 GT3.R": "chevyvettez06rgt3",
      "Ferrari 296 GT3": "ferrari296gt3",
      "Ford Mustang GT3": "fordmustanggt3",
      "Lamborghini Huracán GT3 EVO": "lamborghinievogt3",
      "McLaren 720S GT3 EVO": "mclaren720sgt3",
      "Mercedes-AMG GT3 2020": "mercedesamgevogt3",
      "Porsche 911 GT3 R (992)": "porsche992rgt3",
      "Aston Martin GT3": "amvantageevogt3",
    },
    trackP1DoksToWBR: {
      "Silverstone Circuit": "Silverstone Circuit - Grand Prix",
    },
    seasonP1DoksToWBR: {
      "Season 3": "2025 Season 3",
    },
  };

  // Load config from localStorage with default values
  const [config, setConfig] = useLocalStorage<Config>('p1doks-config', {
    email: '',
    password: '',
    series: '',
    season: '',
    year: '',
    week: '',
    teamName: '',
    downloadPath: '',
    runHeadless: true,
    rememberCredentials: true,
    mappings: defaultMappings,
  });

  // Ensure mappings are always present (migration for existing configs)
  const configWithMappings = {
    ...config,
    mappings: config.mappings || defaultMappings,
  };

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // History management
  const seriesHistory = useHistoryStorage('p1doks-series-history');
  const teamNameHistory = useHistoryStorage('p1doks-team-history');

  // Generate valid values for dropdowns
  const seasonOptions = ['1', '2', '3', '4'];
  const weekOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof Config) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'runHeadless' || field === 'rememberCredentials' 
        ? event.target.checked 
        : event.target.value;
      setConfig((prev) => ({ ...prev, [field]: value }));
    },
    [setConfig]
  );

  // Handle folder picker
  const handleFolderPicker = useCallback(async () => {
    if (window.electronAPI?.selectFolder) {
      try {
        const result = await window.electronAPI.selectFolder();
        if (result.success) {
          setConfig((prev) => ({ ...prev, downloadPath: result.path }));
        }
      } catch (error) {
        console.error('Error selecting folder:', error);
      }
    }
  }, [setConfig]);

  // Handle series change with history
  const handleSeriesChange = useCallback(
    (value: string | null) => {
      const series = value || '';
      setConfig((prev) => ({ ...prev, series }));
      seriesHistory.addToHistory(series);
    },
    [setConfig, seriesHistory]
  );

  // Handle team name change with history
  const handleTeamNameChange = useCallback(
    (value: string | null) => {
      const teamName = value || '';
      setConfig((prev) => ({ ...prev, teamName }));
      teamNameHistory.addToHistory(teamName);
    },
    [setConfig, teamNameHistory]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);
      setMessage(null);

      try {
        const requiredFields = ['email', 'password', 'series', 'season', 'week', 'teamName', 'year'];
        const missingFields = requiredFields.filter((field) => !configWithMappings[field as keyof Config]);

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Add to history on successful download
        if (configWithMappings.series) {
          seriesHistory.addToHistory(configWithMappings.series);
        }
        if (configWithMappings.teamName) {
          teamNameHistory.addToHistory(configWithMappings.teamName);
        }

        console.log('UI sending config to download:', JSON.stringify(configWithMappings, null, 2));
        await onDownload(configWithMappings);
      } catch (error) {
        // Error handling is done in parent component with toasters
      } finally {
        setIsLoading(false);
      }
    },
    [configWithMappings, onDownload, seriesHistory, teamNameHistory]
  );

  return {
    // State
    config: configWithMappings,
    isLoading,
    message,
    setMessage,
    
    // Options
    seasonOptions,
    weekOptions,
    yearOptions,
    
    // History
    seriesHistory: seriesHistory.history,
    teamNameHistory: teamNameHistory.history,
    
    // Handlers
    handleInputChange,
    handleFolderPicker,
    handleSeriesChange,
    handleTeamNameChange,
    handleSubmit,
    removeFromSeriesHistory: seriesHistory.removeFromHistory,
    removeFromTeamNameHistory: teamNameHistory.removeFromHistory,
  };
}
