import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import P1DoksSettings from './P1DoksSettings';
import GeneralSettings from './GeneralSettings';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

type SettingsSection = 'general' | 'p1doks';

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ 
  open, 
  onClose,
}) => {
  const [selectedSection, setSelectedSection] = useState<SettingsSection>('general');

  const menuItems = [
    { id: 'general' as SettingsSection, label: 'General' },
    { id: 'p1doks' as SettingsSection, label: 'P1Doks' },
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case 'general':
               return <GeneralSettings />;
             case 'p1doks':
               return <P1DoksSettings />;
      default:
        return (
          <Typography variant="body1" sx={{ color: 'white', opacity: 0.7 }}>
            Select a settings category from the menu.
          </Typography>
        );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '75%',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: 'none',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
            Settings
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Main Content - Split Layout */}
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          {/* Left Menu Panel */}
          <Box sx={{ 
            width: 200, 
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}>
            <List sx={{ p: 1 }}>
              {menuItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={selectedSection === item.id}
                    onClick={() => setSelectedSection(item.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'white',
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right Content Panel */}
          <Box sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflow: 'auto',
            height: 'calc(100vh - 60px)'
          }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer;
