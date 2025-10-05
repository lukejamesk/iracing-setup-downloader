import React from "react";
import {
  Box,
  FormControlLabel,
  Switch,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Cancel as CancelIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { HistoryAutocomplete } from "../common";


// Form data interface - only what the form configures
interface FormData {
  series: string;
  season: string;
  year: string;
  week: string;
  runHeadless: boolean;
}

interface GenericDownloadConfigFormProps {
  onDownload: (formData: FormData) => Promise<{completed: boolean}>;
  onCancel?: () => void;
  
  // Service-specific configuration
  seriesOptions: string[];
  localStorageKey: string;
  
  // Settings validation function
  isSettingsValid: () => boolean;
}

const GenericDownloadConfigForm: React.FC<GenericDownloadConfigFormProps> = ({
  onDownload,
  onCancel,
  seriesOptions,
  localStorageKey,
  isSettingsValid,
}) => {
  
  // Form state
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          series: parsed.series || '',
          season: parsed.season || '',
          week: parsed.week || '',
          year: parsed.year || new Date().getFullYear().toString(),
          headless: parsed.headless !== undefined ? parsed.headless : true,
        };
      }
    } catch {
      // If parsing fails, use defaults
    }
    return {
      series: '',
      season: '',
      week: '',
      year: new Date().getFullYear().toString(),
      headless: true,
    };
  });

  // Series history state
  const [seriesHistory, setSeriesHistory] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${localStorageKey}_seriesHistory`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // If parsing fails, use defaults
    }
    return seriesOptions; // Start with the provided options
  });

  // Form validation
  const isFormValid = () => {
    return formData.series && formData.season && formData.week && formData.year;
  };

  // Input change handler
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Save to localStorage
    const newFormData = { ...formData, [field]: value };
    localStorage.setItem(localStorageKey, JSON.stringify(newFormData));
  };

  // Series handlers
  const handleSeriesChange = (value: string | null) => {
    const seriesValue = value || '';
    handleInputChange('series', seriesValue);
    
    // Add to history if it's a new series
    if (seriesValue && !seriesHistory.includes(seriesValue)) {
      const newHistory = [seriesValue, ...seriesHistory.filter(h => h !== seriesValue)].slice(0, 20); // Keep last 20
      setSeriesHistory(newHistory);
      localStorage.setItem(`${localStorageKey}_seriesHistory`, JSON.stringify(newHistory));
    }
  };

  const handleSeriesInputChange = (inputValue: string) => {
    // This is called when the user types in the input field
    // We need to update the form data so validation works correctly
    handleInputChange('series', inputValue);
  };

  const handleSeriesBlur = () => {
    // This is called when the input loses focus
    // We don't need to do anything special here
  };

  const handleRemoveFromSeriesHistory = (seriesToRemove: string) => {
    const newHistory = seriesHistory.filter(h => h !== seriesToRemove);
    setSeriesHistory(newHistory);
    localStorage.setItem(`${localStorageKey}_seriesHistory`, JSON.stringify(newHistory));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isSettingsValid() || !isFormValid()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Only pass the form data - parent will handle settings and mappings
      const formDataOnly: FormData = {
        series: formData.series,
        season: formData.season,
        week: formData.week,
        year: formData.year,
        runHeadless: formData.headless,
      };

      const result = await onDownload(formDataOnly);
      
      if (result.completed) {
        console.log('Download completed successfully');
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", }}>
        <Grid container spacing={2}>
          {/* Series */}
          <Grid size={{xs: 12}}>
            <HistoryAutocomplete
              label="Series"
              placeholder="Select or type series name"
              value={formData.series}
              history={seriesHistory}
              onChange={handleSeriesChange}
              onInputChange={handleSeriesInputChange}
              onBlur={handleSeriesBlur}
              onRemoveFromHistory={handleRemoveFromSeriesHistory}
              required={true}
              helperText="Type your own series name or select from history"
            />
          </Grid>

          {/* Season */}
          <Grid size={{xs: 12, sm: 4}}>
            <FormControl fullWidth required>
              <InputLabel>Season</InputLabel>
              <Select
                value={formData.season}
                onChange={(e) => handleInputChange('season', e.target.value)}
                label="Season"
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Week */}
          <Grid size={{xs: 12, sm: 4}}>
            <FormControl fullWidth required>
              <InputLabel>Week</InputLabel>
              <Select
                value={formData.week}
                onChange={(e) => handleInputChange('week', e.target.value)}
                label="Week"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Year */}
          <Grid size={{xs: 12, sm: 4}}>
            <FormControl fullWidth required>
              <InputLabel>Year</InputLabel>
              <Select
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                label="Year"
              >
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const years = [];
                  // Previous 3 years
                  for (let i = 3; i >= 1; i--) {
                    years.push(currentYear - i);
                  }
                  // Current year
                  years.push(currentYear);
                  // Next year
                  years.push(currentYear + 1);
                  
                  return years.map(year => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ));
                })()}
              </Select>
            </FormControl>
          </Grid>

          {/* Headless Mode */}
          <Grid size={{xs: 12}}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.headless}
                  onChange={(e) => handleInputChange('headless', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4caf50',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#4caf50',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4caf50',
                    },
                  }}
                />
              }
              label="Run in headless browser mode"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mt: 4,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          {isLoading ? (
            <Button
              variant="outlined"
              size="large"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={!onCancel}
              sx={{
                minWidth: 200,
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Cancel Download
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<FlagIcon />}
              disabled={!isSettingsValid() || !isFormValid()}
              sx={{
                minWidth: 200,
                opacity: (!isSettingsValid() || !isFormValid()) ? 0.5 : 1,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Download Setups
            </Button>
          )}
        </Box>
    </Box>
  );
};

export default GenericDownloadConfigForm;