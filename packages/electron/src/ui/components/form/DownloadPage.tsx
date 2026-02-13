import React, { useState, useEffect } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { SettingsDrawer } from "../settings";
import { useSettings, useTrackMapping } from "../../contexts";
import type { TrackMappingService } from "../../contexts/TrackMappingContext";
import DownloadStepper from "./DownloadStepper";

// Download progress interface for UI
interface DownloadProgress {
  type: "info" | "success" | "error" | "warning";
  message: string;
  timestamp: Date;
}

// Download completion info interface
interface DownloadCompletionInfo {
  unmappedCars: string[];
  unmappedTracks: string[];
}

interface DownloadPageProps {
  serviceName: string;
  serviceSettings: any; // The service settings object directly
  onDownload?: (_config: any) => Promise<{completed: boolean}>;
  onCancel?: () => Promise<void>;
  configFormComponent: React.ComponentType<{
    onDownload: (config: any) => Promise<{completed: boolean}>;
    onCancel?: () => void;
  }>;
  downloadFunction: string; // The electron API function name to call
  cancelFunction: string; // The electron API function name for cancellation
  checkSettingsValid: (generalSettings: any, serviceSettings: any) => boolean;
  getMappings: (serviceSettings: any) => {
    carMappings: any[];
    trackMappingsRecord?: Record<string, string>;
  };
  getServiceSettings: () => any;
}

const DownloadPage: React.FC<DownloadPageProps> = ({
  serviceName,
  serviceSettings,
  configFormComponent: ConfigFormComponent,
  downloadFunction,
  cancelFunction,
  checkSettingsValid,
  getMappings,
  getServiceSettings,
}) => {
  const { settings: generalSettings } = useSettings();
  const { getServiceTrackMappings } = useTrackMapping();
  
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  const [logs, setLogs] = useState<DownloadProgress[]>([]);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Track mapping warnings
  const [mappingWarnings, setMappingWarnings] = useState<{
    unmappedCars: string[];
    unmappedTracks: string[];
  } | null>(null);

  // Store last download configuration for folder renaming
  const [lastDownloadConfig, setLastDownloadConfig] = useState<{
    teams: Array<{name: string}>;
    year: string;
    season: string;
    downloadPath: string;
  } | null>(null);

  // Track pending folder renames
  const [pendingRenames, setPendingRenames] = useState<Array<{type: 'car' | 'track', itemName: string}>>([]);

  // Check if required settings are missing
  useEffect(() => {
    const hasMissingSettings = !checkSettingsValid(generalSettings, serviceSettings);
    setShowSetupAlert(hasMissingSettings);
  }, [generalSettings, serviceSettings, checkSettingsValid]);

  // Effect to handle folder renaming when mappings are updated
  useEffect(() => {
    if (pendingRenames.length > 0 && lastDownloadConfig) {
      const { carMappings } = getMappings(serviceSettings);
      const service = serviceName.toLowerCase() as TrackMappingService;
      const trackRecord = getServiceTrackMappings(service);

      pendingRenames.forEach(async ({ type, itemName }) => {
        try {
          let newName: string | undefined;

          if (type === 'car') {
            const mapping = carMappings.find(m => m.p1doks === itemName);
            newName = mapping?.iracing;
          } else {
            newName = trackRecord[itemName];
          }

          if (newName) {
            const renameParams = {
              downloadPath: lastDownloadConfig.downloadPath,
              type: type,
              oldName: itemName,
              newName: newName,
              teams: lastDownloadConfig.teams,
              year: lastDownloadConfig.year,
              season: lastDownloadConfig.season,
              service: serviceName,
            };

            await window.electronAPI.renameFoldersForMapping(renameParams);
          }
        } catch (error) {
          console.error(`Error during folder rename:`, error);
        }
      });

      setPendingRenames([]);
    }
  }, [serviceSettings, pendingRenames, lastDownloadConfig, getMappings, getServiceTrackMappings, serviceName]);

  // Function to remove an item from mapping warnings and rename folders
  const removeFromMappingWarnings = async (type: 'car' | 'track', itemName: string) => {
    // First, update the UI state
    setMappingWarnings(prev => {
      if (!prev) return null;
      
      if (type === 'car') {
        const updatedCars = prev.unmappedCars.filter(car => car !== itemName);
        const hasUnmappedItems = updatedCars.length > 0 || prev.unmappedTracks.length > 0;
        return hasUnmappedItems ? { ...prev, unmappedCars: updatedCars } : null;
      } else {
        const updatedTracks = prev.unmappedTracks.filter(track => track !== itemName);
        const hasUnmappedItems = prev.unmappedCars.length > 0 || updatedTracks.length > 0;
        return hasUnmappedItems ? { ...prev, unmappedTracks: updatedTracks } : null;
      }
    });

    // Add to pending renames to be processed when mappings update
    if (lastDownloadConfig && lastDownloadConfig.teams.length > 0) {
      setPendingRenames(prev => [...prev, { type, itemName }]);
    }
  };

  // Handle ignoring mappings (no folder renaming needed)
  const ignoreMapping = (type: 'car' | 'track', itemName: string) => {
    // Just update the UI state - no folder renaming since we're mapping to the same name
    setMappingWarnings(prev => {
      if (!prev) return null;
      
      if (type === 'car') {
        const updatedCars = prev.unmappedCars.filter(car => car !== itemName);
        const hasUnmappedItems = updatedCars.length > 0 || prev.unmappedTracks.length > 0;
        return hasUnmappedItems ? { ...prev, unmappedCars: updatedCars } : null;
      } else {
        const updatedTracks = prev.unmappedTracks.filter(track => track !== itemName);
        const hasUnmappedItems = prev.unmappedCars.length > 0 || updatedTracks.length > 0;
        return hasUnmappedItems ? { ...prev, unmappedTracks: updatedTracks } : null;
      }
    });
  };

  // Set up progress and completion listeners
  useEffect(() => {
    if (window.electronAPI?.onDownloadProgress) {
      window.electronAPI.onDownloadProgress((progress: DownloadProgress) => {
        setLogs(prev => [...prev, progress]);
      });
    }

    if (window.electronAPI?.onDownloadCompleted) {
      window.electronAPI.onDownloadCompleted((completionInfo: DownloadCompletionInfo) => {
        // Set mapping warnings from completion info
        setMappingWarnings(completionInfo);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI?.removeDownloadProgressListener) {
        window.electronAPI.removeDownloadProgressListener();
      }
      if (window.electronAPI?.removeDownloadCompletedListener) {
        window.electronAPI.removeDownloadCompletedListener();
      }
    };
  }, []);


  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleReset = () => {
    setIsDownloading(false);
    setLogs([]);
    setMessage(null);
    setMappingWarnings(null);
  };

  const handleDownload = async (config: any): Promise<{completed: boolean}> => {
    console.log("Download started with config:", config);
    
    setIsDownloading(true);
    setLogs([]); // Clear previous logs
    setMappingWarnings(null); // Clear previous mapping warnings
    
    // Store the download configuration for potential folder renaming
    setLastDownloadConfig({
      teams: config.selectedTeams || [],
      year: config.year || '',
      season: config.season || '',
      downloadPath: config.downloadPath || generalSettings.downloadPath,
    });
    
    try {
      // Add initial log
      setLogs(prev => [...prev, {
        type: "info",
        message: "Starting download...",
        timestamp: new Date()
      }]);

      // Use Electron IPC to communicate with main process
      // Convert service name to service ID for the download function
      const serviceId = serviceName.toLowerCase();
      const result = await (window.electronAPI as any)[downloadFunction](serviceId, config);
      
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
      const result = await (window.electronAPI as any)[cancelFunction]();
      
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
      {/* Download Stepper */}
      <DownloadStepper
        serviceName={serviceName}
        onDownload={handleDownload}
        onCancel={handleCancel}
        logs={logs}
        isDownloading={isDownloading}
        showSetupAlert={showSetupAlert}
        onReset={handleReset}
        downloadPath={generalSettings.downloadPath}
        mappingWarnings={mappingWarnings}
        onRemoveFromMappingWarnings={removeFromMappingWarnings}
        onIgnoreMapping={ignoreMapping}
        configFormComponent={ConfigFormComponent}
        getServiceSettings={getServiceSettings}
        getMappings={getMappings}
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

export default DownloadPage;
