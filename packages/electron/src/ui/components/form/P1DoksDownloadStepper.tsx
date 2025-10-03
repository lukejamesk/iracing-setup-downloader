import React from "react";
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material";
import ConfigFormFields from "./ConfigFormFields";
import { DownloadLog, MappingWarningsAlert } from "../common";

// Download progress interface
interface DownloadProgress {
  type: "info" | "success" | "error" | "warning";
  message: string;
  timestamp: Date;
  mappingInfo?: {
    unmappedCars: string[];
    unmappedTracks: string[];
  };
}

interface P1DoksDownloadStepperProps {
  onDownload: (config: any) => Promise<{completed: boolean}>;
  onCancel: () => Promise<void>;
  logs: DownloadProgress[];
  isDownloading: boolean;
  showSetupAlert: boolean;
  onOpenSettings: () => void;
  onReset?: () => void;
  downloadPath?: string;
  mappingWarnings?: {
    unmappedCars: string[];
    unmappedTracks: string[];
  } | null;
  onRemoveFromMappingWarnings?: (type: 'car' | 'track', itemName: string) => void;
  onIgnoreMapping?: (type: 'car' | 'track', itemName: string) => void;
}

const P1DoksDownloadStepper: React.FC<P1DoksDownloadStepperProps> = ({
  onDownload,
  onCancel,
  logs,
  isDownloading,
  showSetupAlert,
  onOpenSettings,
  onReset,
  downloadPath,
  mappingWarnings,
  onRemoveFromMappingWarnings,
  onIgnoreMapping,
}) => {

  // Determine current step based on state
  const getCurrentStep = () => {
    if (showSetupAlert) return 0; // Configuration step
    if (isDownloading) return 1; // Download step
    
    // Check if there are any errors in the logs
    const hasErrors = logs.some(log => log.type === "error");
    const hasCompleted = logs.some(log => log.type === "success" && log.message.includes("completed"));
    
    // Only go to complete step if there are no errors and download completed successfully
    if (hasCompleted && !hasErrors) return 2; // Completed step
    
    // If there are errors, stay on download step (step 1) to show the error
    if (hasErrors && !isDownloading) return 1; // Error step (but still step 1)
    
    return 0; // Default to configuration
  };

  const currentStep = getCurrentStep();

  const steps = [
    {
      label: "Configuration",
      description: "Configure download settings",
      content: (
        <Box sx={{ width: "100%" }}>
          {showSetupAlert && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                '& .MuiAlert-message': {
                  color: 'white',
                },
                '& .MuiAlert-icon': {
                  color: '#ff9800',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Setup Required
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Please configure your settings in the Settings panel before downloading.
              </Typography>
            </Alert>
          )}
          <ConfigFormFields onDownload={onDownload} onCancel={onCancel} />
        </Box>
      ),
    },
    {
      label: "Downloading",
      description: "Downloading setups from P1Doks",
      content: (
        <Box sx={{ width: "100%" }}>
          <DownloadLog logs={logs} isDownloading={isDownloading} />
          <Box sx={{ mt: 2 }}>
            {/* Show cancel button only when downloading */}
            {isDownloading && (
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
                startIcon={<CancelIcon />}
                fullWidth
                sx={{
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
            )}
            
            {/* Show back to configuration button when there are errors and not downloading */}
            {!isDownloading && logs.some(log => log.type === "error") && onReset && (
              <Button
                variant="contained"
                size="large"
                onClick={onReset}
                startIcon={<SettingsIcon />}
                fullWidth
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 152, 0, 1)",
                  },
                }}
              >
                Back to Configuration
              </Button>
            )}
          </Box>
        </Box>
      ),
    },
    {
      label: "Complete",
      description: "Download process finished",
      content: (
        <Box>
          {/* Mapping Warnings */}
          {mappingWarnings && (mappingWarnings.unmappedCars.length > 0 || mappingWarnings.unmappedTracks.length > 0) && (
            <MappingWarningsAlert
              mappingWarnings={mappingWarnings}
              onRemoveFromMappingWarnings={onRemoveFromMappingWarnings}
              onIgnoreMapping={onIgnoreMapping}
            />
          )}
          
          {downloadPath && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.electronAPI.openFolder(downloadPath)}
              startIcon={<FolderOpenIcon />}
              fullWidth
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                mb: 2,
              }}
            >
              Open Download Folder
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={onReset}
            startIcon={<PlayIcon />}
            fullWidth
            sx={{
              backgroundColor: 'rgba(33, 150, 243, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 1)',
              },
              color: 'white',
            }}
          >
            Run Another Download
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        maxHeight: 'calc(100vh - 120px)', // Account for title bar and margins
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
          P1Doks Setup Downloader
        </Typography>
        
        <Stepper 
          activeStep={currentStep} 
          orientation="vertical"
          sx={{
            '& .MuiStepIcon-root': {
              transition: 'none', // Disable any default animations
            },
            '& .MuiStepLabel-root': {
              transition: 'none', // Disable any default animations
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={({ active, completed, error }) => {
                  if (completed) {
                    return <CheckIcon sx={{ color: '#4caf50' }} />;
                  }
                  if (error) {
                    return <ErrorIcon sx={{ color: '#f44336' }} />;
                  }
                  if (active) {
                    // Show error icon if this is the download step and there are errors
                    if (index === 1 && logs.some(log => log.type === "error")) {
                      return <ErrorIcon sx={{ color: '#f44336' }} />;
                    }
                    return <PlayIcon sx={{ color: '#2196f3' }} />;
                  }
                  return <SettingsIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />;
                }}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: 'white',
                    '&.Mui-active': {
                      color: '#2196f3',
                    },
                    '&.Mui-completed': {
                      color: '#4caf50',
                    },
                  },
                }}
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2 }}>
                  {step.content}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
      
    </Paper>
  );
};

export default P1DoksDownloadStepper;
