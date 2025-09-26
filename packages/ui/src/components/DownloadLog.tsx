import React, {useEffect, useRef} from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {CheckCircle, Info, Error} from "@mui/icons-material";

export interface LogEntry {
  type: "info" | "success" | "error";
  message: string;
  timestamp: Date;
}

interface DownloadLogProps {
  logs: LogEntry[];
  isDownloading?: boolean;
}

const DownloadLog: React.FC<DownloadLogProps> = ({
  logs,
  isDownloading = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle color="success" fontSize="small" />;
      case "error":
        return <Error color="error" fontSize="small" />;
      default:
        return <Info color="info" fontSize="small" />;
    }
  };

  const getChipColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        width: "100%",
        minHeight: "400px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{p: 2, borderBottom: 1, borderColor: "divider"}}>
        <Typography variant="h6" component="h3">
          Download Log
        </Typography>
      </Box>
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          minHeight: 0, // Important for flex child to be scrollable
        }}
      >
        {logs.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
              gap: 2,
            }}
          >
            {isDownloading ? (
              <>
                <CircularProgress size={40} />
                <Typography variant="body2">
                  Initializing download...
                </Typography>
              </>
            ) : (
              <Typography variant="body2">
                No download activity yet...
              </Typography>
            )}
          </Box>
        ) : (
          <List dense>
            {logs.map((log, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{py: 0.5}}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mr: 1,
                      mt: 1,
                    }}
                  >
                    {getIcon(log.type)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <Typography variant="body2" component="span">
                          {log.message}
                        </Typography>
                        <Chip
                          label={log.type}
                          size="small"
                          color={getChipColor(log.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(log.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < logs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default DownloadLog;
