import React, {useState} from "react";
import {Box, Typography, Snackbar, Alert} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DownloadLog, {LogEntry} from "./DownloadLog";
import ConfigFormFields from "./ConfigFormFields";

// Declare the electronAPI interface for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      downloadSetups: (config: Config) => Promise<{
        success: boolean;
        error?: string;
        cancelled?: boolean;
        completed?: boolean;
      }>;
      cancelDownload: () => Promise<{success: boolean; error?: string}>;
      selectFolder: () => Promise<{
        success: boolean;
        path?: string;
        error?: string;
      }>;
      onDownloadProgress?: (callback: (progress: LogEntry) => void) => void;
      removeDownloadProgressListener?: () => void;
    };
  }
}

import { Config } from '../hooks/useConfigForm';

const ConfigForm: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [cancelController, setCancelController] =
    useState<AbortController | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const addLog = (type: LogEntry["type"], message: string) => {
    setLogs((prev) => [...prev, {type, message, timestamp: new Date()}]);
  };

  const showToaster = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDownload = async (
    config: Config
  ): Promise<{completed: boolean}> => {
    setLogs([]); // Clear previous logs
    setIsDownloading(true);
    setShowLogPanel(true);

    const controller = new AbortController();
    setCancelController(controller);

    try {
      if (window.electronAPI) {
        if (window.electronAPI.onDownloadProgress) {
          window.electronAPI.onDownloadProgress((progress: LogEntry) => {
            if (!controller.signal.aborted) {
              addLog(progress.type, progress.message);
            }
          });
        }

        const result = await window.electronAPI.downloadSetups(config);

        if (window.electronAPI.removeDownloadProgressListener) {
          window.electronAPI.removeDownloadProgressListener();
        }

        if (!result.success) {
          // Check if it was cancelled
          if (result.cancelled) {
            addLog("info", "Download cancelled by user");
            return {completed: false}; // Don't throw error for cancellation
          }
          throw new Error(result.error || "Download failed");
        }

        // Only show success message if it actually completed (not cancelled)
        if (result.completed) {
          addLog("success", "Download completed successfully!");
          showToaster("Download completed successfully!", "success");
          return {completed: true};
        } else {
          return {completed: false};
        }
      } else {
        // Browser simulation not available - require Electron
        throw new Error("This application requires Electron to run. Please use the desktop version.");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Download cancelled") {
        addLog("info", "Download cancelled by user");
        return {completed: false};
      } else {
        const errorMessage = error instanceof Error ? error.message : "Download failed";
        addLog("error", errorMessage);
        showToaster(errorMessage, "error");
        return {completed: false};
      }
    } finally {
      setIsDownloading(false);
      setCancelController(null);
    }
  };

  const handleCancel = async () => {
    if (window.electronAPI) {
      // Use Electron's cancel functionality
      try {
        const result = await window.electronAPI.cancelDownload();
        if (result.success) {
          addLog("info", "Cancelling download...");
        } else {
          addLog("error", result.error || "Failed to cancel download");
        }
      } catch (error) {
        console.error("Cancel error:", error);
        addLog("error", "Failed to cancel download");
      }
    } else if (cancelController) {
      // Use local AbortController for browser simulation
      cancelController.abort();
      addLog("info", "Cancelling download...");
    } else {
      addLog("error", "No active download to cancel");
    }
    // Hide log panel when cancelled
    setShowLogPanel(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        height: "100%",
        maxHeight: "100vh",
        padding: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{
          mb: 4,
          color: "white",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          flexShrink: 0,
        }}
      >
        P1Doks Downloader
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{alignItems: "stretch", flex: 1, minHeight: 0}}
      >
        <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
          <ConfigFormFields
            onDownload={handleDownload}
            onCancel={handleCancel}
          />
        </Grid>
        {showLogPanel && (
          <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
            <DownloadLog 
              logs={logs} 
              isDownloading={isDownloading} 
              onClose={() => setShowLogPanel(false)}
            />
          </Grid>
        )}
      </Grid>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: 'auto',
            minWidth: '300px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConfigForm;
