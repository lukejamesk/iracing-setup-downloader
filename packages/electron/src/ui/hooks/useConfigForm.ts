import { useState, useCallback } from 'react';
import { useLocalStorage, useHistoryStorage } from './useLocalStorage';

export interface Config {
  email: string;
  password: string;
  series: string;
  season: string;
  year: string;
  week: string;
  teamName: string;
  downloadPath: string;
  runHeadless?: boolean;
  rememberCredentials?: boolean;
}

interface UseConfigFormProps {
  onDownload: (config: Config) => Promise<{ completed: boolean }>;
}

export function useConfigForm({ onDownload }: UseConfigFormProps) {
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
  });

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
        const missingFields = requiredFields.filter((field) => !config[field as keyof Config]);

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Add to history on successful download
        if (config.series) {
          seriesHistory.addToHistory(config.series);
        }
        if (config.teamName) {
          teamNameHistory.addToHistory(config.teamName);
        }

        await onDownload(config);
      } catch (error) {
        // Error handling is done in parent component with toasters
      } finally {
        setIsLoading(false);
      }
    },
    [config, onDownload, seriesHistory, teamNameHistory]
  );

  return {
    // State
    config,
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
