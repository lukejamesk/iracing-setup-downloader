import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import { Mapping } from '../../contexts';
import { ComboButton } from '../common';

interface MappingSectionProps {
  title: string;
  description: string;
  mappings: Mapping[];
  onAdd: (p1doks: string, iracing: string) => void;
  onEdit: (index: number, p1doks: string, iracing: string) => void;
  onRemove: (index: number) => void;
  onReplace: (mappings: Mapping[]) => void;
  p1doksLabel: string;
  iracingLabel: string;
  p1doksPlaceholder: string;
  iracingPlaceholder: string;
  allowDelete?: boolean; // Whether to allow deletion of custom mappings
}

const MappingSection: React.FC<MappingSectionProps> = ({
  title,
  description,
  mappings,
  onAdd,
  onEdit,
  onRemove,
  onReplace,
  p1doksLabel,
  iracingLabel,
  p1doksPlaceholder,
  iracingPlaceholder,
  allowDelete = true, // Default to allowing deletion
}) => {
  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  
  // Form state
  const [p1doksValue, setP1doksValue] = useState('');
  const [iracingValue, setIracingValue] = useState('');

  const handleAdd = () => {
    onAdd(p1doksValue, iracingValue);
    setP1doksValue('');
    setIracingValue('');
    setAddDialogOpen(false);
  };

  const handleEdit = (index: number) => {
    const mapping = mappings[index];
    setP1doksValue(mapping.p1doks);
    setIracingValue(mapping.iracing);
    setEditingIndex(index);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex >= 0) {
      onEdit(editingIndex, p1doksValue, iracingValue);
    }
    setP1doksValue('');
    setIracingValue('');
    setEditingIndex(-1);
    setEditDialogOpen(false);
  };

  const handleCancel = () => {
    setP1doksValue('');
    setIracingValue('');
    setEditingIndex(-1);
    setAddDialogOpen(false);
    setEditDialogOpen(false);
  };

  const handleExport = () => {
    const exportData = {
      mappings: mappings,
      exportedAt: new Date().toISOString(),
      type: title.toLowerCase().replace(' mappings', '')
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(' mappings', '')}-mappings.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importData = JSON.parse(content);
            
            if (importData.mappings && Array.isArray(importData.mappings)) {
              // Get current default mappings to ensure they're preserved
              const currentDefaults = mappings.filter(m => m.isDefault);
              
              // Process imported mappings
              const importedMappings = importData.mappings.map((mapping: any) => ({
                p1doks: mapping.p1doks,
                iracing: mapping.iracing,
                isDefault: mapping.isDefault || false // Preserve isDefault flag from import
              }));
              
              // Merge: start with current defaults, then add/override with imported mappings
              const mergedMappings = [...currentDefaults];
              
              importedMappings.forEach(importedMapping => {
                const existingIndex = mergedMappings.findIndex(m => m.p1doks === importedMapping.p1doks);
                if (existingIndex >= 0) {
                  // Override existing mapping (could be default or custom)
                  mergedMappings[existingIndex] = importedMapping;
                } else {
                  // Add new mapping
                  mergedMappings.push(importedMapping);
                }
              });
              
              onReplace(mergedMappings);
            } else {
              alert('Invalid file format. Please select a valid mappings export file.');
            }
          } catch (error) {
            alert('Error reading file. Please make sure it\'s a valid JSON file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };


  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {title}
          </Typography>
          <ComboButton
            primaryLabel="Add"
            primaryIcon={<AddIcon />}
            primaryOnClick={() => setAddDialogOpen(true)}
            options={[
              {
                label: 'Export',
                icon: <ExportIcon />,
                onClick: handleExport,
              },
              {
                label: 'Import',
                icon: <ImportIcon />,
                onClick: handleImport,
              },
            ]}
            sx={{
              '& .MuiButton-root': {
                backgroundColor: 'rgba(25, 118, 210, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 1)',
                },
              },
            }}
          />
        </Box>
        
        <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mb: 2 }}>
          {description}
        </Typography>

        <List>
          {mappings.map((mapping, index) => (
            <ListItem
              key={index}
              sx={{
                backgroundColor: mapping.isDefault 
                  ? 'rgba(25, 118, 210, 0.1)' // Subtle blue tint for defaults
                  : 'rgba(255, 255, 255, 0.05)', // Standard background for custom
                borderRadius: 1,
                mb: 1,
                border: mapping.isDefault
                  ? '1px solid rgba(25, 118, 210, 0.3)' // Slightly blue border for defaults
                  : '1px solid rgba(255, 255, 255, 0.1)', // Standard border for custom
                paddingRight: '120px', // Ensure space for action buttons
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    minWidth: 0, // Allow flex items to shrink
                    flex: 1, // Take available space
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0, // Allow text to shrink
                        flex: 1, // Take available space
                      }}
                    >
                      {mapping.p1doks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, flexShrink: 0 }}>
                      →
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'white',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0, // Allow text to shrink
                        flex: 1, // Take available space
                      }}
                    >
                      {mapping.iracing}
                    </Typography>
                  </Box>
                }
                sx={{
                  minWidth: 0, // Allow text to shrink
                  flex: 1, // Take available space
                }}
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Edit button for all mappings */}
                  <IconButton
                    edge="end"
                    onClick={() => handleEdit(index)}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  {/* Delete button for custom mappings, or when deletion is allowed for all mappings */}
                  {(!mapping.isDefault || allowDelete) && (
                    <IconButton
                      edge="end"
                      onClick={() => onRemove(index)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Add Mapping Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={handleCancel} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Add {title.slice(0, -1)} Mapping
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label={p1doksLabel}
              value={p1doksValue}
              onChange={(e) => setP1doksValue(e.target.value)}
              variant="outlined"
              placeholder={p1doksPlaceholder}
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
            <TextField
              fullWidth
              label={iracingLabel}
              value={iracingValue}
              onChange={(e) => setIracingValue(e.target.value)}
              variant="outlined"
              placeholder={iracingPlaceholder}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            variant="contained"
            disabled={!p1doksValue || !iracingValue}
            sx={{
              backgroundColor: 'rgba(25, 118, 210, 0.8)',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 1)' },
            }}
          >
            Add Mapping
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Mapping Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCancel} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Edit {title.slice(0, -1)} Mapping
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label={p1doksLabel}
              value={p1doksValue}
              onChange={(e) => setP1doksValue(e.target.value)}
              variant="outlined"
              placeholder={p1doksPlaceholder}
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
            <TextField
              fullWidth
              label={iracingLabel}
              value={iracingValue}
              onChange={(e) => setIracingValue(e.target.value)}
              variant="outlined"
              placeholder={iracingPlaceholder}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={!p1doksValue || !iracingValue}
            sx={{
              backgroundColor: 'rgba(25, 118, 210, 0.8)',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 1)' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MappingSection;
