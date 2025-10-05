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

// Generic mapping interface that works with any service
interface GenericMapping {
  p1doks: string; // Keep p1doks property for compatibility with existing Mapping interface
  iracing: string;
  isDefault?: boolean;
}

interface MappingModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  serviceName: string;
  serviceLabel: string;
  iracingLabel: string;
  servicePlaceholder: string;
  iracingPlaceholder: string;
  mappings: GenericMapping[];
  editingMapping?: GenericMapping | null; // If provided, we're editing; if null, we're adding
  editingIndex?: number;
  onSave: (serviceName: string, iracingName: string, index?: number) => void;
  disableServiceName?: boolean; // If true, disable the service name field
}

const MappingModal: React.FC<MappingModalProps> = ({
  open,
  onClose,
  title,
  serviceName,
  serviceLabel,
  iracingLabel,
  servicePlaceholder,
  iracingPlaceholder,
  mappings,
  editingMapping,
  editingIndex,
  onSave,
  disableServiceName = false,
}) => {
  const [serviceValue, setServiceValue] = useState('');
  const [iracingValue, setIracingValue] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [iracingError, setIracingError] = useState('');

  // Initialize form when modal opens or editing mapping changes
  useEffect(() => {
    if (open) {
      if (editingMapping) {
        setServiceValue(editingMapping.p1doks);
        setIracingValue(editingMapping.iracing);
      } else {
        setServiceValue('');
        setIracingValue('');
      }
      setServiceError('');
      setIracingError('');
    }
  }, [open, editingMapping]);

  // Check for duplicates (excluding the current mapping if editing)
  const checkForServiceDuplicate = (serviceValue: string): boolean => {
    return mappings.some((mapping, index) => 
      mapping.p1doks.toLowerCase() === serviceValue.toLowerCase() &&
      (editingIndex === undefined || index !== editingIndex)
    );
  };

  const checkForIracingDuplicate = (iracingValue: string): boolean => {
    return mappings.some((mapping, index) => 
      mapping.iracing.toLowerCase() === iracingValue.toLowerCase() &&
      (editingIndex === undefined || index !== editingIndex)
    );
  };

  // Validate both fields
  const validateFields = (serviceVal: string, iracingVal: string) => {
    let newServiceError = '';
    let newIracingError = '';
    
    if (serviceVal.trim()) {
      const isServiceDuplicate = checkForServiceDuplicate(serviceVal.trim());
      if (isServiceDuplicate) {
        newServiceError = `This ${serviceName} name already exists`;
      }
    }
    
    if (iracingVal.trim()) {
      const isIracingDuplicate = checkForIracingDuplicate(iracingVal.trim());
      if (isIracingDuplicate) {
        newIracingError = 'This iRacing name already exists';
      }
    }
    
    setServiceError(newServiceError);
    setIracingError(newIracingError);
  };

  // Handle service input change with duplicate checking
  const handleServiceInputChange = (value: string) => {
    setServiceValue(value);
    validateFields(value, iracingValue);
  };

  // Handle iRacing input change with duplicate checking
  const handleIracingInputChange = (value: string) => {
    setIracingValue(value);
    validateFields(serviceValue, value);
  };

  const handleSave = () => {
    if (serviceValue.trim() && iracingValue.trim() && !serviceError && !iracingError) {
      onSave(serviceValue.trim(), iracingValue.trim(), editingIndex);
      
      setServiceValue('');
      setIracingValue('');
      setServiceError('');
      setIracingError('');
      onClose();
    }
  };

  const handleCancel = () => {
    setServiceValue('');
    setIracingValue('');
    setServiceError('');
    setIracingError('');
    onClose();
  };

  const isEditing = editingMapping !== null;

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
        {isEditing ? 'Edit' : 'Add'} {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label={serviceLabel}
            value={serviceValue}
            onChange={(e) => handleServiceInputChange(e.target.value)}
            variant="outlined"
            placeholder={servicePlaceholder}
            autoFocus={!disableServiceName}
            disabled={disableServiceName}
            error={!!serviceError}
            helperText={serviceError}
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
          
          <TextField
            fullWidth
            label={iracingLabel}
            value={iracingValue}
            onChange={(e) => handleIracingInputChange(e.target.value)}
            variant="outlined"
            placeholder={iracingPlaceholder}
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
          disabled={!serviceValue.trim() || !iracingValue.trim() || !!serviceError || !!iracingError}
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
          {isEditing ? 'Save Changes' : 'Add Mapping'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MappingModal;
