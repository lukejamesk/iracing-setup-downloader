import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ServiceSelection } from './service';
import { DownloadPage, P1DoksDownloadConfigForm, HymoDownloadConfigForm } from './form';
import { SettingsDrawer } from './settings';
import { TitleBar } from './common';
import { useService, useP1Doks, useHymo, useTrackMapping } from '../contexts';

const MainContent: React.FC = () => {
  const { selectedService, setSelectedService } = useService();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const p1doksContext = useP1Doks();
  const hymoContext = useHymo();
  const trackMappingContext = useTrackMapping();

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleBackToSelection = () => {
    setSelectedService(null);
  };

  // Get service-specific configuration
  const getServiceConfig = () => {
    switch (selectedService) {
      case 'p1doks':
        return {
          serviceName: 'P1Doks',
          serviceSettings: p1doksContext.settings,
          configFormComponent: P1DoksDownloadConfigForm,
          downloadFunction: 'downloadSetups',
          cancelFunction: 'cancelDownload',
          checkSettingsValid: (_generalSettings: any, serviceSettings: any) => {
            return serviceSettings.email && serviceSettings.password;
          },
          getMappings: (serviceSettings: any) => ({
            carMappings: serviceSettings.carMappings,
            trackMappingsRecord: trackMappingContext.getServiceTrackMappings('p1doks'),
          }),
          getServiceSettings: () => p1doksContext.settings,
        };
      case 'hymo':
        return {
          serviceName: 'Hymo',
          serviceSettings: hymoContext.settings,
          configFormComponent: HymoDownloadConfigForm,
          downloadFunction: 'downloadSetups',
          cancelFunction: 'cancelDownload',
          checkSettingsValid: (_generalSettings: any, serviceSettings: any) => {
            return serviceSettings.login && serviceSettings.password;
          },
          getMappings: (_serviceSettings: any) => ({
            carMappings: [],
            trackMappingsRecord: trackMappingContext.getServiceTrackMappings('hymo'),
          }),
          getServiceSettings: () => hymoContext.settings,
        };
      default:
        return null;
    }
  };

  // Get service display name
  const getServiceDisplayName = () => {
    switch (selectedService) {
      case 'p1doks':
        return 'P1Doks';
      case 'hymo':
        return 'Hymo';
      default:
        return 'Unknown Service';
    }
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
        title={`${getServiceDisplayName()} Setup Downloader`}
        showBackButton={true}
      />

      {/* Main Content - Add top padding to account for title bar */}
      <Box sx={{ pt: 8, width: '100%' }}>
        {(() => {
          const serviceConfig = getServiceConfig();
          if (!serviceConfig) {
            return <div>Unknown service selected</div>;
          }
          return <DownloadPage {...serviceConfig} />;
        })()}
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
