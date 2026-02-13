import React, { useState } from 'react';
import {
  Alert,
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { MappingModal, UnifiedTrackMappingModal } from './';
import { useP1Doks, useTrackMapping } from '../../contexts';
import type { TrackMappingService } from '../../contexts/TrackMappingContext';

interface MappingWarningsAlertProps {
  serviceName: string;
  mappingWarnings: {
    unmappedCars: string[];
    unmappedTracks: string[];
  };
  onRemoveFromMappingWarnings?: (type: 'car' | 'track', itemName: string) => void;
  onIgnoreMapping?: (type: 'car' | 'track', itemName: string) => void;
}

const MappingWarningsAlert: React.FC<MappingWarningsAlertProps> = ({
  serviceName,
  mappingWarnings,
  onRemoveFromMappingWarnings,
  onIgnoreMapping,
}) => {
  const p1doksContext = useP1Doks();
  const { addMapping, getCanonicalNames } = useTrackMapping();

  // Car mapping modal state (uses existing MappingModal)
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [carModalName, setCarModalName] = useState('');

  // Track mapping modal state (uses UnifiedTrackMappingModal)
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackModalName, setTrackModalName] = useState('');

  // Handle opening car mapping modal
  const handleOpenCarModal = (carName: string) => {
    setCarModalName(carName);
    setCarModalOpen(true);
  };

  const handleCloseCarModal = () => {
    setCarModalOpen(false);
    setCarModalName('');
  };

  // Handle car mapping saved
  const handleCarMappingSaved = (serviceNameVal: string, iracingName: string) => {
    p1doksContext.addCarMapping(serviceNameVal, iracingName);
    onRemoveFromMappingWarnings?.('car', serviceNameVal);
  };

  // Handle opening track mapping modal
  const handleOpenTrackModal = (trackName: string) => {
    setTrackModalName(trackName);
    setTrackModalOpen(true);
  };

  const handleCloseTrackModal = () => {
    setTrackModalOpen(false);
    setTrackModalName('');
  };

  // Handle track mapping saved
  const handleTrackMappingSaved = (serviceTrackName: string, canonicalName: string) => {
    const service = serviceName.toLowerCase() as TrackMappingService;
    addMapping(canonicalName, service, serviceTrackName);
    onRemoveFromMappingWarnings?.('track', serviceTrackName);
  };

  // Handle ignoring a track (add mapping to itself)
  const handleIgnoreTrack = (trackName: string) => {
    const service = serviceName.toLowerCase() as TrackMappingService;
    addMapping(trackName, service, trackName);
    onIgnoreMapping?.('track', trackName);
  };

  return (
    <>
      <Alert
        severity="warning"
        sx={{
          mb: 2,
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          '& .MuiAlert-message': {
            color: 'white',
          },
          '& .MuiAlert-icon': {
            color: '#ff9800',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Mapping Configuration Needed
        </Typography>

        {mappingWarnings.unmappedCars.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Unmapped Cars ({mappingWarnings.unmappedCars.length}):
            </Typography>
            <List dense sx={{ py: 0 }}>
              {mappingWarnings.unmappedCars.map((car, index) => (
                <ListItem key={index} sx={{ py: 0, px: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mr: 1 }}>
                          "{car}"
                        </Typography>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleOpenCarModal(car)}
                          sx={{
                            color: '#2196f3',
                            textDecoration: 'underline',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#1976d2',
                            },
                          }}
                        >
                          (add)
                        </Link>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {mappingWarnings.unmappedTracks.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Unmapped Tracks ({mappingWarnings.unmappedTracks.length}):
            </Typography>
            <List dense sx={{ py: 0 }}>
              {mappingWarnings.unmappedTracks.map((track, index) => (
                <ListItem key={index} sx={{ py: 0, px: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', mr: 1 }}>
                          "{track}"
                        </Typography>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleOpenTrackModal(track)}
                          sx={{
                            color: '#2196f3',
                            textDecoration: 'underline',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            mr: 1,
                            '&:hover': {
                              color: '#1976d2',
                            },
                          }}
                        >
                          (add)
                        </Link>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleIgnoreTrack(track)}
                          sx={{
                            color: '#2196f3',
                            textDecoration: 'underline',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#1976d2',
                            },
                          }}
                        >
                          (ignore)
                        </Link>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 1, fontStyle: 'italic' }}>
          Add these mappings in Settings to improve folder organization.
        </Typography>
      </Alert>

      {/* Car Mapping Modal (existing MappingModal for car mappings) */}
      <MappingModal
        open={carModalOpen}
        onClose={handleCloseCarModal}
        title="Car Mapping"
        serviceName={serviceName}
        serviceLabel={`${serviceName} Car Name`}
        iracingLabel="iRacing Car Name"
        servicePlaceholder="e.g., Mercedes-AMG GT3 2020"
        iracingPlaceholder="e.g., mercedesamgevogt3"
        mappings={[]}
        editingMapping={carModalName ? { p1doks: carModalName, iracing: '' } : null}
        editingIndex={undefined}
        onSave={handleCarMappingSaved}
        disableServiceName={!!carModalName}
      />

      {/* Track Mapping Modal (unified modal with Autocomplete) */}
      <UnifiedTrackMappingModal
        open={trackModalOpen}
        onClose={handleCloseTrackModal}
        serviceName={serviceName}
        serviceTrackName={trackModalName}
        canonicalNames={getCanonicalNames()}
        onSave={handleTrackMappingSaved}
      />
    </>
  );
};

export default MappingWarningsAlert;
