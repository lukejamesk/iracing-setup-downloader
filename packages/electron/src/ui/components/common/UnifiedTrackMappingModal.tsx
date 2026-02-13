import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  createFilterOptions,
} from '@mui/material';

const filter = createFilterOptions<string>();

interface UnifiedTrackMappingModalProps {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  serviceTrackName: string;
  canonicalNames: string[];
  onSave: (serviceTrackName: string, canonicalName: string) => void;
}

const UnifiedTrackMappingModal: React.FC<UnifiedTrackMappingModalProps> = ({
  open,
  onClose,
  serviceName,
  serviceTrackName,
  canonicalNames,
  onSave,
}) => {
  const [canonicalValue, setCanonicalValue] = useState<string>('');

  useEffect(() => {
    if (open) {
      setCanonicalValue('');
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = canonicalValue.trim();
    if (trimmed && serviceTrackName.trim()) {
      onSave(serviceTrackName.trim(), trimmed);
      setCanonicalValue('');
      onClose();
    }
  };

  const handleCancel = () => {
    setCanonicalValue('');
    onClose();
  };

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
        Add Track Mapping
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label={`${serviceName} Track Name`}
            value={serviceTrackName}
            disabled
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />

          <Autocomplete
            freeSolo
            options={canonicalNames}
            value={canonicalValue}
            onChange={(_event, newValue) => {
              setCanonicalValue(newValue || '');
            }}
            onInputChange={(_event, newInputValue) => {
              setCanonicalValue(newInputValue);
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                option => option.toLowerCase() === inputValue.toLowerCase()
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push(inputValue);
              }
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Canonical Track Name"
                placeholder="Search existing or type new name"
                variant="outlined"
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': { color: 'white' },
                  },
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-paper': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              '& .MuiAutocomplete-option': {
                color: 'white',
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
          disabled={!canonicalValue.trim()}
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

export default UnifiedTrackMappingModal;
