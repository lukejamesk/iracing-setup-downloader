import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ServiceSelection } from './service';
import { P1DoksDownloadPage } from './form';
import { SettingsDrawer } from './settings';
import { TitleBar } from './common';
import { useService } from '../contexts';

const MainContent: React.FC = () => {
  const { selectedService, setSelectedService } = useService();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleBackToSelection = () => {
    setSelectedService(null);
  };

  // Show service selection if no service is selected
  if (!selectedService) {
    return (
      <>
        <ServiceSelection onServiceSelect={setSelectedService} />
      </>
    );
  }

  // Show the main app content for the selected service
  return (
    <>
      {/* Title Bar */}
      <TitleBar
        onBackClick={handleBackToSelection}
        onSettingsClick={handleSettingsOpen}
        title="P1Doks Setup Downloader"
        showBackButton={true}
      />

      {/* Main Content - Add top padding to account for title bar */}
      <Box sx={{ pt: 8, width: '100%' }}>
        <P1DoksDownloadPage  />
      </Box>

      {/* Settings Drawer */}
      <SettingsDrawer 
        open={settingsOpen} 
        onClose={handleSettingsClose}
      />
    </>
  );
};

export { MainContent };
export default MainContent;
