import React, {useState, useEffect} from "react";
import {
  Box,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Download as DownloadIcon,
  Cancel as CancelIcon,
  FolderOpen as FolderIcon,
} from "@mui/icons-material";
import HistoryAutocomplete from "./HistoryAutocomplete";

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
}

interface ConfigFormFieldsProps {
  onDownload: (config: Config) => Promise<{completed: boolean}>;
  onCancel?: () => void;
}

const ConfigFormFields: React.FC<ConfigFormFieldsProps> = ({
  onDownload,
  onCancel,
}) => {
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem("p1doks-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        return {...parsed};
      } catch (error) {
        console.error("Error loading config from localStorage:", error);
      }
    }
    return {
      email: "",
      password: "",
      series: "",
      season: "",
      year: "",
      week: "",
      teamName: "",
      downloadPath: "",
      runHeadless: true,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [seriesHistory, setSeriesHistory] = useState<string[]>([]);
  const [teamNameHistory, setTeamNameHistory] = useState<string[]>([]);

  // Generate valid values for dropdowns
  const seasonOptions = ["1", "2", "3", "4"];
  const weekOptions = Array.from({length: 12}, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 3}, (_, i) =>
    (currentYear - i).toString()
  );

  // Load history from localStorage on component mount
  useEffect(() => {
    // Load series history
    const savedSeriesHistory = localStorage.getItem("p1doks-series-history");
    if (savedSeriesHistory) {
      try {
        const parsedHistory = JSON.parse(savedSeriesHistory);
        setSeriesHistory(parsedHistory);
      } catch (error) {
        console.error("Error loading series history:", error);
      }
    }

    // Load team name history
    const savedTeamHistory = localStorage.getItem("p1doks-team-history");
    if (savedTeamHistory) {
      try {
        const parsedHistory = JSON.parse(savedTeamHistory);
        setTeamNameHistory(parsedHistory);
      } catch (error) {
        console.error("Error loading team name history:", error);
      }
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("p1doks-config", JSON.stringify(config));
  }, [config]);

  const handleInputChange =
    (field: keyof Config) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "runHeadless" ? event.target.checked : event.target.value;
      setConfig((prev) => ({...prev, [field]: value}));
    };

  const handleFolderPicker = async () => {
    if (window.electronAPI?.selectFolder) {
      try {
        const result = await window.electronAPI.selectFolder();
        if (result.success) {
          setConfig((prev) => ({...prev, downloadPath: result.path}));
        }
      } catch (error) {
        console.error("Error selecting folder:", error);
      }
    }
  };

  const addToSeriesHistory = (series: string) => {
    if (series && !seriesHistory.includes(series)) {
      const newHistory = [series, ...seriesHistory].slice(0, 10); // Keep last 10
      setSeriesHistory(newHistory);
      localStorage.setItem("p1doks-series-history", JSON.stringify(newHistory));
    }
  };

  const addToTeamNameHistory = (teamName: string) => {
    if (teamName && !teamNameHistory.includes(teamName)) {
      const newHistory = [teamName, ...teamNameHistory].slice(0, 10); // Keep last 10
      setTeamNameHistory(newHistory);
      localStorage.setItem("p1doks-team-history", JSON.stringify(newHistory));
    }
  };

  const handleSeriesChange = (value: string | null) => {
    const series = value || "";
    setConfig((prev) => ({...prev, series}));
    addToSeriesHistory(series);
  };

  const handleTeamNameChange = (value: string | null) => {
    const teamName = value || "";
    setConfig((prev) => ({...prev, teamName}));
    addToTeamNameHistory(teamName);
  };

  const removeFromSeriesHistory = (seriesToRemove: string) => {
    const newHistory = seriesHistory.filter(
      (series) => series !== seriesToRemove
    );
    setSeriesHistory(newHistory);
    localStorage.setItem("p1doks-series-history", JSON.stringify(newHistory));
  };

  const removeFromTeamNameHistory = (teamNameToRemove: string) => {
    const newHistory = teamNameHistory.filter(
      (teamName) => teamName !== teamNameToRemove
    );
    setTeamNameHistory(newHistory);
    localStorage.setItem("p1doks-team-history", JSON.stringify(newHistory));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const requiredFields = [
        "email",
        "password",
        "series",
        "season",
        "week",
        "teamName",
        "year",
      ];
      const missingFields = requiredFields.filter(
        (field) => !config[field as keyof Config]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Add to history on successful download
      if (config.series) {
        addToSeriesHistory(config.series);
      }
      if (config.teamName) {
        addToTeamNameHistory(config.teamName);
      }

      const result = await onDownload(config);
      // Only show success message if download actually completed (not cancelled)
      if (result.completed) {
        setMessage({type: "success", text: "Download completed successfully!"});
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Download failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Box sx={{p: 2, borderBottom: 1, borderColor: "divider"}}>
        <Typography variant="h6" component="h3">
          Configure your download settings
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: 4,
        }}
      >
        {message && (
          <Alert severity={message.type} sx={{mb: 3}}>
            {message.text}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Grid container spacing={3} sx={{width: "100%"}}>
            {/* Email */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={config.email}
                onChange={handleInputChange("email")}
                required
                variant="outlined"
              />
            </Grid>

            {/* Password */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={config.password}
                onChange={handleInputChange("password")}
                required
                variant="outlined"
              />
            </Grid>

            {/* Download Path */}
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="Download Path"
                value={config.downloadPath}
                onChange={handleInputChange("downloadPath")}
                required
                variant="outlined"
                placeholder="Enter the folder path where files will be saved"
                helperText="Full path to the directory where downloaded files will be saved"
                InputLabelProps={{
                  shrink: !!config.downloadPath,
                }}
                InputProps={{
                  endAdornment: window.electronAPI?.selectFolder ? (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleFolderPicker}
                        edge="end"
                        sx={{color: "white"}}
                      >
                        <FolderIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
              />
            </Grid>

            {/* Series */}
            <Grid size={{xs: 12, sm: 6}}>
              <HistoryAutocomplete
                label="Series"
                placeholder="e.g., GT Sprint"
                value={config.series}
                history={seriesHistory}
                onChange={handleSeriesChange}
                onInputChange={(newInputValue) => {
                  setConfig((prev) => ({
                    ...prev,
                    series: newInputValue,
                  }));
                }}
                onBlur={() => {
                  if (config.series) {
                    addToSeriesHistory(config.series);
                  }
                }}
                onRemoveFromHistory={removeFromSeriesHistory}
                required
              />
            </Grid>

            {/* Team Name */}
            <Grid size={{xs: 12, sm: 6}}>
              <HistoryAutocomplete
                label="Team Name"
                placeholder="e.g., Garage 61 - LK Racing"
                value={config.teamName}
                history={teamNameHistory}
                onChange={handleTeamNameChange}
                onInputChange={(newInputValue) => {
                  setConfig((prev) => ({
                    ...prev,
                    teamName: newInputValue,
                  }));
                }}
                onBlur={() => {
                  if (config.teamName) {
                    addToTeamNameHistory(config.teamName);
                  }
                }}
                onRemoveFromHistory={removeFromTeamNameHistory}
                required
              />
            </Grid>

            {/* Season */}
            <Grid size={{xs: 12, sm: 4}}>
              <Autocomplete
                options={seasonOptions}
                value={config.season}
                onChange={(_, newValue) => {
                  setConfig((prev) => ({
                    ...prev,
                    season: newValue || "",
                  }));
                }}
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
                options={weekOptions}
                value={config.week}
                onChange={(_, newValue) => {
                  setConfig((prev) => ({
                    ...prev,
                    week: newValue || "",
                  }));
                }}
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
                options={yearOptions}
                value={config.year}
                onChange={(_, newValue) => {
                  setConfig((prev) => ({
                    ...prev,
                    year: newValue || "",
                  }));
                }}
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
                    checked={config.runHeadless}
                    onChange={handleInputChange("runHeadless")}
                    color="primary"
                  />
                }
                label="Run in headless mode (no browser window)"
              />
            </Grid>
          </Grid>

          {/* Download/Cancel Button - Aligned to bottom */}
          <Box sx={{display: "flex", justifyContent: "center", mt: 3}}>
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
                startIcon={<DownloadIcon />}
                sx={{minWidth: 200}}
              >
                Download Setups
              </Button>
            )}
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default ConfigFormFields;
