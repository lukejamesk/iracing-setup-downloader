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
import { AddMappingModal } from './';
import { useP1Doks } from '../../contexts';

interface MappingWarningsAlertProps {
  mappingWarnings: {
    unmappedCars: string[];
    unmappedTracks: string[];
  };
  onRemoveFromMappingWarnings?: (type: 'car' | 'track', itemName: string) => void;
  onIgnoreMapping?: (type: 'car' | 'track', itemName: string) => void;
}

const MappingWarningsAlert: React.FC<MappingWarningsAlertProps> = ({
  mappingWarnings,
  onRemoveFromMappingWarnings,
  onIgnoreMapping,
}) => {
  const { addTrackMapping } = useP1Doks();
  // Modal state
  const [addMappingModalOpen, setAddMappingModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'car' | 'track'>('car');
  const [modalP1doksName, setModalP1doksName] = useState('');

  // Handle opening the add mapping modal
  const handleOpenAddMappingModal = (type: 'car' | 'track', p1doksName: string) => {
    setModalType(type);
    setModalP1doksName(p1doksName);
    setAddMappingModalOpen(true);
  };

  // Handle closing the add mapping modal
  const handleCloseAddMappingModal = () => {
    setAddMappingModalOpen(false);
    setModalP1doksName('');
  };

  // Handle mapping added callback
  const handleMappingAdded = (type: 'car' | 'track', p1doksName: string) => {
    onRemoveFromMappingWarnings?.(type, p1doksName);
  };

  // Handle ignoring a track (add mapping to itself)
  const handleIgnoreTrack = (trackName: string) => {
    // Add a mapping from the track name to itself (ignore mapping)
    addTrackMapping(trackName, trackName);
    // Use the ignore handler that doesn't trigger folder renaming
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
                          onClick={() => handleOpenAddMappingModal('car', car)}
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
                          onClick={() => handleOpenAddMappingModal('track', track)}
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

      {/* Add Mapping Modal */}
      <AddMappingModal
        open={addMappingModalOpen}
        onClose={handleCloseAddMappingModal}
        type={modalType}
        p1doksName={modalP1doksName}
        onMappingAdded={handleMappingAdded}
      />
    </>
  );
};

export default MappingWarningsAlert;
