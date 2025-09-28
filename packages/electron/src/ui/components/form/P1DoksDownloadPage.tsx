import React, { useState, useEffect } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import P1DoksDownloadStepper from "./P1DoksDownloadStepper";
import { SettingsDrawer } from "../settings";
import { useSettings, useP1Doks } from "../../contexts";

// Download progress interface for UI
interface DownloadProgress {
  type: "info" | "success" | "error";
  message: string;
  timestamp: Date;
}


const P1DoksDownloadPage: React.FC = () => {
  const { settings: generalSettings, activeTeam } = useSettings();
  const { settings: p1doksSettings } = useP1Doks();
  
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  const [logs, setLogs] = useState<DownloadProgress[]>([]);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check if required settings are missing
  useEffect(() => {
    const isTeamsMissing = !generalSettings.teams || generalSettings.teams.length === 0;
    const isDownloadPathMissing = !generalSettings.downloadPath || generalSettings.downloadPath.trim() === '';
    const isEmailMissing = !p1doksSettings.email || p1doksSettings.email.trim() === '';
    const isPasswordMissing = !p1doksSettings.password || p1doksSettings.password.trim() === '';

    const hasMissingSettings = isTeamsMissing || isDownloadPathMissing || isEmailMissing || isPasswordMissing;
    setShowSetupAlert(hasMissingSettings);
  }, [generalSettings, p1doksSettings]);

  // Set up progress listener
  useEffect(() => {
    if (window.electronAPI?.onDownloadProgress) {
      window.electronAPI.onDownloadProgress((progress: DownloadProgress) => {
        setLogs(prev => [...prev, progress]);
      });
    }

    // Cleanup listener on unmount
    return () => {
      if (window.electronAPI?.removeDownloadProgressListener) {
        window.electronAPI.removeDownloadProgressListener();
      }
    };
  }, []);

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleReset = () => {
    setIsDownloading(false);
    setLogs([]);
    setMessage(null);
  };

  const handleDownload = async (config: any): Promise<{completed: boolean}> => {
    console.log("Download started with config:", config);
    
    setIsDownloading(true);
    setLogs([]); // Clear previous logs
    
    try {
      // Add initial log
      setLogs(prev => [...prev, {
        type: "info",
        message: "Starting download...",
        timestamp: new Date()
      }]);

      // Use Electron IPC to communicate with main process
      const result = await window.electronAPI.downloadSetups(config);
      
      if (result.success) {
        // Add completion log
        setLogs(prev => [...prev, {
          type: "success",
          message: "Download completed successfully!",
          timestamp: new Date()
        }]);


        setMessage({
          type: "success",
          text: "Download completed successfully!"
        });

        return { completed: true };
      } else if (result.cancelled) {
        // Cancellation is handled by the cancel handler, just return without additional processing
        return { completed: false };
      } else {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      console.error("Download failed:", error);
      
      // Add error log
      setLogs(prev => [...prev, {
        type: "error",
        message: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);

      setMessage({
        type: "error",
        text: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      return { completed: false };
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancel = async () => {
    console.log("Cancelling download...");
    
    try {
      const result = await window.electronAPI.cancelDownload();
      
      if (result.success) {
        setLogs(prev => [...prev, {
          type: "info",
          message: "Download cancelled by user",
          timestamp: new Date()
        }]);
        
        setMessage({
          type: "success",
          text: "Download cancelled"
        });
      } else {
        console.error("Failed to cancel download:", result.error);
        setMessage({
          type: "error",
          text: `Failed to cancel download: ${result.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error("Error cancelling download:", error);
      setMessage({
        type: "error",
        text: `Error cancelling download: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        minHeight: "100vh",
        maxWidth: "650px",
        margin: "0 auto",
        padding: 2,
        gap: 2,
        width: "100%",
      }}
    >
      {/* P1Doks Download Stepper */}
      <P1DoksDownloadStepper
        onDownload={handleDownload}
        onCancel={handleCancel}
        logs={logs}
        isDownloading={isDownloading}
        showSetupAlert={showSetupAlert}
        onOpenSettings={handleOpenSettings}
        onReset={handleReset}
        downloadPath={generalSettings.downloadPath}
      />
      
      {/* Success/Error Messages */}
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.type}
          sx={{ width: "100%" }}
        >
          {message?.text}
        </Alert>
      </Snackbar>

      {/* Settings Drawer */}
      <SettingsDrawer 
        open={settingsOpen} 
        onClose={handleCloseSettings}
      />
    </Box>
  );
};

export default P1DoksDownloadPage;
