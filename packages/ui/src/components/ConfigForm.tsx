import React, {useState} from "react";
import {Box, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DownloadLog, {LogEntry} from "./DownloadLog";
import ConfigFormFields from "./ConfigFormFields";
import {runDownloadSimulation} from "@p1doks-downloader/core-simulation";

// Declare the electronAPI interface for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      downloadSetups: (config: any) => Promise<{
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

const ConfigForm: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cancelController, setCancelController] =
    useState<AbortController | null>(null);

  const addLog = (type: LogEntry["type"], message: string) => {
    setLogs((prev) => [...prev, {type, message, timestamp: new Date()}]);
  };

  const handleDownload = async (
    config: Config
  ): Promise<{completed: boolean}> => {
    setLogs([]); // Clear previous logs
    setIsDownloading(true);

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
          return {completed: true};
        } else {
          return {completed: false};
        }
      } else {
        // Use core-simulation package for browser simulation
        await runDownloadSimulation(
          config,
          (progress: LogEntry) => {
            if (!controller.signal.aborted) {
              addLog(progress.type, progress.message);
            }
          },
          controller.signal
        );
        return {completed: true};
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Download cancelled") {
        addLog("info", "Download cancelled by user");
        return {completed: false};
      } else {
        addLog(
          "error",
          error instanceof Error ? error.message : "Download failed"
        );
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
        {isDownloading && (
          <Grid size={{xs: 12, md: 6}} sx={{display: "flex"}}>
            <DownloadLog logs={logs} isDownloading={isDownloading} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ConfigForm;
