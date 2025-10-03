import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useP1Doks } from '../../contexts';

interface AddMappingModalProps {
  open: boolean;
  onClose: () => void;
  type: 'car' | 'track';
  p1doksName?: string; // Optional - if provided, only iRacing field is editable
  onMappingAdded?: (type: 'car' | 'track', p1doksName: string) => void;
}

const AddMappingModal: React.FC<AddMappingModalProps> = ({
  open,
  onClose,
  type,
  p1doksName,
  onMappingAdded,
}) => {
  const { addCarMapping, addTrackMapping, settings } = useP1Doks();
  const [iracingName, setIracingName] = useState('');
  const [p1doksInputName, setP1doksInputName] = useState(''); // For free-form mode
  const [p1doksError, setP1doksError] = useState('');
  const [iracingError, setIracingError] = useState('');
  
  // Determine if this is free-form mode (no pre-filled P1Doks name)
  const isFreeForm = !p1doksName;
  const effectiveP1doksName = isFreeForm ? p1doksInputName : p1doksName;

  // Clear state when modal opens
  useEffect(() => {
    if (open) {
      setIracingName('');
      setP1doksInputName('');
      setP1doksError('');
      setIracingError('');
    }
  }, [open]);

  // Check for specific duplicate mappings
  const checkForP1doksDuplicate = (p1doks: string, mappingType: 'car' | 'track'): boolean => {
    const mappings = mappingType === 'car' ? settings.carMappings : settings.trackMappings;
    return mappings.some(mapping => 
      mapping.p1doks.toLowerCase() === p1doks.toLowerCase()
    );
  };

  const checkForIracingDuplicate = (iracing: string, mappingType: 'car' | 'track'): boolean => {
    const mappings = mappingType === 'car' ? settings.carMappings : settings.trackMappings;
    return mappings.some(mapping => 
      mapping.iracing.toLowerCase() === iracing.toLowerCase()
    );
  };

  // Validate both fields
  const validateBothFields = (p1doksValue: string, iracingValue: string) => {
    let p1doksError = '';
    let iracingError = '';
    
    if (p1doksValue.trim()) {
      const isP1doksDuplicate = checkForP1doksDuplicate(p1doksValue.trim(), type);
      if (isP1doksDuplicate) {
        p1doksError = 'This P1Doks name already exists';
      }
    }
    
    if (iracingValue.trim()) {
      const isIracingDuplicate = checkForIracingDuplicate(iracingValue.trim(), type);
      if (isIracingDuplicate) {
        iracingError = 'This iRacing name already exists';
      }
    }
    
    setP1doksError(p1doksError);
    setIracingError(iracingError);
  };

  // Handle P1Doks input change with duplicate checking
  const handleP1doksInputChange = (value: string) => {
    setP1doksInputName(value);
    validateBothFields(value, iracingName);
  };

  // Handle iRacing input change with duplicate checking
  const handleIracingInputChange = (value: string) => {
    setIracingName(value);
    validateBothFields(effectiveP1doksName, value);
  };

  const handleSave = () => {
    
    if (effectiveP1doksName.trim() && iracingName.trim() && !p1doksError && !iracingError) {
      if (type === 'car') {
        addCarMapping(effectiveP1doksName.trim(), iracingName.trim());
      } else {
        addTrackMapping(effectiveP1doksName.trim(), iracingName.trim());
      }
      
      // Notify parent that mapping was added
      onMappingAdded?.(type, effectiveP1doksName.trim());
      
      setIracingName('');
      setP1doksInputName('');
      setP1doksError('');
      setIracingError('');
      onClose();
    } else {
    }
  };

  const handleCancel = () => {
    setIracingName('');
    setP1doksInputName('');
    setP1doksError('');
    setIracingError('');
    onClose();
  };

  const typeLabel = type === 'car' ? 'Car' : 'Track';
  const placeholder = type === 'car' 
    ? 'e.g., ferrari296gt3' 
    : 'e.g., Silverstone Circuit - Grand Prix';

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>
        Add {typeLabel} Mapping
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {!isFreeForm && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              P1Doks {typeLabel}: <strong style={{ color: 'white' }}>"{p1doksName}"</strong>
            </Typography>
          )}
          
          {isFreeForm && (
            <TextField
              fullWidth
              label={`P1Doks ${typeLabel} Name`}
              value={p1doksInputName}
              onChange={(e) => handleP1doksInputChange(e.target.value)}
              variant="outlined"
              placeholder={type === 'car' ? 'e.g., Mercedes-AMG GT3 2020' : 'e.g., Silverstone Circuit'}
              autoFocus
              error={!!p1doksError}
              helperText={p1doksError}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                  '&.Mui-focused fieldset': { borderColor: 'white' },
                  '&.Mui-error fieldset': { borderColor: '#f44336' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': { color: 'white' },
                  '&.Mui-error': { color: '#f44336' },
                },
                '& .MuiFormHelperText-root': {
                  color: '#f44336',
                },
              }}
            />
          )}
          
          <TextField
            fullWidth
            label={`iRacing ${typeLabel} Name`}
            value={iracingName}
            onChange={(e) => handleIracingInputChange(e.target.value)}
            variant="outlined"
            placeholder={placeholder}
            autoFocus={!isFreeForm}
            error={!!iracingError}
            helperText={iracingError}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
                '&.Mui-error fieldset': { borderColor: '#f44336' },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': { color: 'white' },
                '&.Mui-error': { color: '#f44336' },
              },
              '& .MuiFormHelperText-root': {
                color: '#f44336',
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleCancel}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!effectiveP1doksName.trim() || !iracingName.trim() || !!p1doksError || !!iracingError}
          sx={{
            backgroundColor: 'rgba(33, 150, 243, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 1)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.3)',
            },
            color: 'white',
          }}
        >
          Add Mapping
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMappingModal;
