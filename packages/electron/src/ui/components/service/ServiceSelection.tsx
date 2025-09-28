import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
} from '@mui/material';
import ServiceCard from './ServiceCard';
import { SettingsIcon, SettingsDrawer } from '../settings';
// Use relative path for public assets
const p1doksLogo = './p1doks.png';

interface ServiceSelectionProps {
  onServiceSelect: (service: string) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onServiceSelect }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const services = [
    {
      id: 'p1doks',
      name: 'P1Doks',
      description: 'Download iRacing setups from P1Doks',
      logoUrl: p1doksLogo,
      isAvailable: true,
    },
    // Future services can be added here
    // {
    //   id: 'vrs',
    //   name: 'VRS',
    //   description: 'Virtual Racing School setups and data',
    //   logoUrl: '/vrs.png',
    //   isAvailable: false,
    // },
  ];

  return (
    <>
      {/* Settings Icon - Top Right (TitleBar Position) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 3,
          zIndex: 1000,
        }}
      >
        <SettingsIcon onClick={handleSettingsOpen} />
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>

        {/* Service Selection Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 2,
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '3rem', md: '4rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Choose Setup Provider
        </Typography>
      </Box>

      <Grid
        container
        spacing={6}
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: '40vh' }}
      >
        {services.map((service) => (
          <Grid item key={service.id}>
            <ServiceCard
              name={service.name}
              description={service.description}
              logoUrl={service.logoUrl}
              onClick={() => onServiceSelect(service.id)}
              isAvailable={service.isAvailable}
            />
          </Grid>
        ))}
      </Grid>

      </Container>

      {/* Settings Drawer */}
      <SettingsDrawer 
        open={settingsOpen} 
        onClose={handleSettingsClose}
      />
    </>
  );
};

export default ServiceSelection;
