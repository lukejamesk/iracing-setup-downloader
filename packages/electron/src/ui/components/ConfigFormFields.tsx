import React from "react";
import {
  Box,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Autocomplete,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Cancel as CancelIcon,
  FolderOpen as FolderIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import HistoryAutocomplete from "./HistoryAutocomplete";
import { useConfigForm, Config } from "../hooks/useConfigForm";

interface ConfigFormFieldsProps {
  onDownload: (config: Config) => Promise<{completed: boolean}>;
  onCancel?: () => void;
}

const ConfigFormFields: React.FC<ConfigFormFieldsProps> = ({
  onDownload,
  onCancel,
}) => {
  const {
    // State
    config,
    isLoading,
    
    // Options
    seasonOptions,
    weekOptions,
    yearOptions,
    
    // History
    seriesHistory,
    teamNameHistory,
    
    // Handlers
    handleInputChange,
    handleFolderPicker,
    handleSeriesChange,
    handleTeamNameChange,
    handleSubmit,
    removeFromSeriesHistory,
    removeFromTeamNameHistory,
  } = useConfigForm({ onDownload });

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

            {/* Remember Credentials */}
            <Grid size={{xs: 12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.rememberCredentials ?? true}
                    onChange={handleInputChange("rememberCredentials")}
                    color="primary"
                  />
                }
                label="Remember email and password"
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
            <Grid size={{xs: 12}}>
              <HistoryAutocomplete
                label="Series"
                placeholder="e.g., GT Sprint"
                value={config.series}
                history={seriesHistory}
                onChange={handleSeriesChange}
                onInputChange={(newInputValue) => {
                  handleSeriesChange(newInputValue);
                }}
                onBlur={() => {}}
                onRemoveFromHistory={removeFromSeriesHistory}
                required
              />
            </Grid>

            {/* Team Name */}
            <Grid size={{xs: 12}}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mr: 1, 
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: 'fit-content',
                    lineHeight: 1.5
                  }}
                >
                  Garage 61 - 
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <HistoryAutocomplete
                    label="Team Name"
                    placeholder="e.g., LK Racing"
                    value={config.teamName}
                    history={teamNameHistory}
                    onChange={handleTeamNameChange}
                    onInputChange={(newInputValue) => {
                      handleTeamNameChange(newInputValue);
                    }}
                    onBlur={() => {}}
                    onRemoveFromHistory={removeFromTeamNameHistory}
                    required
                  />
                </Box>
              </Box>
            </Grid>

            {/* Season */}
            <Grid size={{xs: 12, sm: 4}}>
              <Autocomplete
                options={seasonOptions}
                value={config.season}
                onChange={(_, newValue) => {
                  handleInputChange("season")({ target: { value: newValue || "" } } as React.ChangeEvent<HTMLInputElement>);
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
                  handleInputChange("week")({ target: { value: newValue || "" } } as React.ChangeEvent<HTMLInputElement>);
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
                  handleInputChange("year")({ target: { value: newValue || "" } } as React.ChangeEvent<HTMLInputElement>);
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
                startIcon={<FlagIcon />}
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
