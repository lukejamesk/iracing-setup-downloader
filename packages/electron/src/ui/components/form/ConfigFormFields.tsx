import React from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Cancel as CancelIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useSettings, useP1Doks } from "../../contexts";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Config interface for UI
interface Config {
  email: string;
  password: string;
  series: string;
  season: string;
  year: string;
  week: string;
  teamName: string;
  downloadPath: string;
  runHeadless?: boolean;
  mappings?: {
    carP1DoksToIracing?: Record<string, string>;
    trackP1DoksToWBR?: Record<string, string>;
  };
}

interface ConfigFormFieldsProps {
  onDownload: (config: Config) => Promise<{completed: boolean}>;
  onCancel?: () => void;
}

const ConfigFormFields: React.FC<ConfigFormFieldsProps> = ({
  onDownload,
  onCancel,
}) => {
  const { settings: generalSettings } = useSettings();
  const { settings: p1doksSettings } = useP1Doks();
  
  // Form state
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(() => {
    try {
      const saved = localStorage.getItem('p1doks-form-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          series: parsed.series || '',
          season: parsed.season || '',
          week: parsed.week || '',
          year: parsed.year || new Date().getFullYear().toString(),
          headless: parsed.headless !== undefined ? parsed.headless : true,
          selectedTeamIds: parsed.selectedTeamIds || generalSettings.teams.map(t => t.id),
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
      selectedTeamIds: generalSettings.teams.map(t => t.id),
    };
  });

  // Default series options from the image (alphabetically ordered)
  const defaultSeriesOptions = [
    "All Setups",
    "Algarve 1000",
    "Creventic",
    "F3",
    "F4",
    "Falken Sports Car",
    "Ferrari Challenge",
    "Global Mazda Mx5",
    "GTE Sprint",
    "GT3 Fixed",
    "GT Sprint",
    "IMSA",
    "Indy 6 Hour",
    "Indycar",
    "Majors24",
    "NASCAR Open A NextGen",
    "NASCAR Open B Xfinity",
    "NASCAR Open C Trucks",
    "Nurburgring Endurance Challenge",
    "Nürburgring 24h",
    "Petit Le Mans",
    "Porsche Cup",
    "Production Car Challenge",
    "Prototype Challenge",
    "Spa 24h",
    "Super Formula",
    "Super Formula Lights",
    "TCR Virtual Challenge",
    "Watkins Glen 6 Hour"
  ];

  // Series options (only predefined, no user additions)
  const seriesOptions = defaultSeriesOptions;

  // Save form data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('p1doks-form-data', JSON.stringify(formData));
  }, [formData]);

  // Check if all required settings are valid
  const isSettingsValid = () => {
    const selectedTeams = generalSettings.teams.filter(team => formData.selectedTeamIds.includes(team.id));
    const isTeamsValid = selectedTeams.length > 0 && 
      selectedTeams.every(team => team && team.name && team.name.trim() !== '');
    const isDownloadPathValid = generalSettings.downloadPath && generalSettings.downloadPath.trim() !== '';
    const isEmailValid = p1doksSettings.email && p1doksSettings.email.trim() !== '';
    const isPasswordValid = p1doksSettings.password && p1doksSettings.password.trim() !== '';
    
    return isTeamsValid && isDownloadPathValid && isEmailValid && isPasswordValid;
  };

  // Check if form is valid
  const isFormValid = () => {
    return formData.series.trim() !== '' && 
           formData.season !== '' && 
           formData.week !== '' && 
           formData.year !== '';
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Series handlers (no history management needed)
  const handleSeriesChange = (value: string | null) => {
    handleInputChange('series', value || '');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isSettingsValid() || !isFormValid()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create config object with all required data
      const selectedTeams = generalSettings.teams.filter(team => formData.selectedTeamIds.includes(team.id));
      
      const config = {
        // From form data
        series: formData.series,
        season: formData.season,
        week: formData.week,
        year: formData.year,
        runHeadless: formData.headless,
        
        // From settings contexts
        email: p1doksSettings.email,
        password: p1doksSettings.password,
        selectedTeams: selectedTeams,
        downloadPath: generalSettings.downloadPath,
        
        // Mappings
        mappings: {
          carP1DoksToIracing: p1doksSettings.carMappings.reduce((acc, mapping) => {
            acc[mapping.p1doks] = mapping.iracing;
            return acc;
          }, {} as Record<string, string>),
          trackP1DoksToWBR: p1doksSettings.trackMappings.reduce((acc, mapping) => {
            acc[mapping.p1doks] = mapping.iracing;
            return acc;
          }, {} as Record<string, string>),
        },
      };

      const result = await onDownload(config);
      
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
            <Autocomplete
              options={seriesOptions}
              value={formData.series}
              onChange={(_, newValue) => handleSeriesChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Series"
                  required
                  variant="outlined"
                  placeholder="Select series"
                />
              )}
            />
          </Grid>

          {/* Teams Selection */}
          <Grid size={{xs: 12}}>
            <FormControl fullWidth>
              <InputLabel id="teams-select-label">Teams</InputLabel>
              <Select
                labelId="teams-select-label"
                id="teams-select"
                multiple
                value={formData.selectedTeamIds}
                onChange={(event: SelectChangeEvent<string[]>) => {
                  const value = event.target.value;
                  const newSelectedIds = typeof value === 'string' ? value.split(',') : value;
                  handleInputChange('selectedTeamIds', newSelectedIds);
                }}
                input={<OutlinedInput label="Teams" />}
                renderValue={(selected) => `${selected.length} team(s) selected`}
                MenuProps={MenuProps}
                sx={{
                  '& .MuiSelect-select': {
                    padding: '16.5px 14px',
                  },
                }}
              >
                {generalSettings.teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    <Checkbox checked={formData.selectedTeamIds.includes(team.id)} />
                    <ListItemText primary={team.name} />
                  </MenuItem>
                ))}
              </Select>
              <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                {`Setups will be downloaded for ${formData.selectedTeamIds.length} selected team(s). Configure teams in Settings.`}
              </Box>
            </FormControl>
          </Grid>

          {/* Season */}
          <Grid size={{xs: 12, sm: 4}}>
            <Autocomplete
              options={["1", "2", "3", "4"]}
              value={formData.season}
              onChange={(_, newValue) => handleInputChange('season', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Season"
                  required
                  variant="outlined"
                  placeholder="Select season"
                />
              )}
            />
          </Grid>

          {/* Week */}
          <Grid size={{xs: 12, sm: 4}}>
            <Autocomplete
              options={Array.from({length: 12}, (_, i) => (i + 1).toString())}
              value={formData.week}
              onChange={(_, newValue) => handleInputChange('week', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Week"
                  required
                  variant="outlined"
                  placeholder="Select week"
                />
              )}
            />
          </Grid>

          {/* Year */}
          <Grid size={{xs: 12, sm: 4}}>
            <Autocomplete
              options={Array.from({length: 3}, (_, i) => 
                (new Date().getFullYear() - i).toString()
              )}
              value={formData.year}
              onChange={(_, newValue) => handleInputChange('year', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Year"
                  required
                  variant="outlined"
                  placeholder="Select year"
                />
              )}
            />
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
                      color: '#4caf50', // Green when ON
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#4caf50', // Green track when ON
                      },
                    },
                    '& .MuiSwitch-switchBase': {
                      color: '#f44336', // Red when OFF
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#f44336', // Red track when OFF
                      },
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: 'white', // White thumb for better contrast
                    },
                  }}
                />
              }
              label="Run in headless mode (no browser window)"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: 'white',
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Download/Cancel Button - Aligned to left */}
        <Box sx={{display: "flex", justifyContent: "flex-start", mt: 3}}>
          {isLoading ? (
            <Button
              variant="outlined"
              size="large"
              onClick={onCancel}
              startIcon={<CancelIcon />}
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
              }}
            >
              Download Setups
            </Button>
          )}
        </Box>
    </Box>
  );
};

export default ConfigFormFields;
