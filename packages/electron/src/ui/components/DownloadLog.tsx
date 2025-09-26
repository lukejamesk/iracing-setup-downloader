import React from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {CheckCircle, Info, Error, Close} from "@mui/icons-material";
import { useAutoScroll } from "../hooks/useAutoScroll";

export interface LogEntry {
  type: "info" | "success" | "error";
  message: string;
  timestamp: Date;
}

interface DownloadLogProps {
  logs: LogEntry[];
  isDownloading?: boolean;
  onClose?: () => void;
}

const DownloadLog: React.FC<DownloadLogProps> = ({
  logs,
  isDownloading = false,
  onClose,
}) => {
  const { scrollContainerRef, handleScroll } = useAutoScroll([logs], { threshold: 5 });

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
      <Box sx={{p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Typography variant="h6" component="h3">
          Download Log
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{color: "white"}}>
            <Close />
          </IconButton>
        )}
      </Box>
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
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
                      <Box>
                        <Typography variant="body2" component="div">
                          {log.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {formatTime(log.timestamp)}
                        </Typography>
                      </Box>
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
