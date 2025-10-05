import React from "react";
import {ThemeProvider, createTheme, CssBaseline, Box} from "@mui/material";
import { MainContent } from "./components/MainContent";
import { SettingsProvider, P1DoksProvider, HymoProvider, ServiceProvider } from "./contexts";
import { useSettings } from "./contexts/SettingsContext";
import "./index.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "transparent",
      paper: "rgba(255, 255, 255, 0.1)",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.7)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "white",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
            "&.Mui-focused": {
              color: "white",
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.7)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "white",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
            "&.Mui-focused": {
              color: "white",
            },
          },
          "& .MuiSvgIcon-root": {
            color: "white",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "white",
            "& + .MuiSwitch-track": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
          },
          "& .MuiSwitch-track": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
  },
});

// Inner component that has access to all contexts
const AppContent: React.FC = () => {
  const { settings } = useSettings();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url('${settings.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))",
          zIndex: -1,
        }}
      />
      
      {/* Main Content - Shows service selection or app content */}
      <MainContent />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ServiceProvider>
      <SettingsProvider>
        <P1DoksProvider>
          <HymoProvider>
            <AppContent />
          </HymoProvider>
        </P1DoksProvider>
      </SettingsProvider>
    </ServiceProvider>
  );
};

export default App;
