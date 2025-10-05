import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
// Generic mapping interface that works with any service
interface GenericMapping {
  p1doks: string; // Keep p1doks property for compatibility with existing Mapping interface
  iracing: string;
  isDefault?: boolean;
}
import { ComboButton } from '../common';
import MappingModal from '../common/MappingModal';

interface MappingSectionProps {
  title: string;
  description: string;
  serviceName: string; // The name of the service (e.g., "P1Doks", "Hymo")
  mappings: GenericMapping[];
  onAdd: (serviceName: string, iracing: string) => void;
  onEdit: (index: number, serviceName: string, iracing: string) => void;
  onRemove: (index: number) => void;
  onReplace: (mappings: GenericMapping[]) => void;
  serviceLabel: string;
  iracingLabel: string;
  servicePlaceholder: string;
  iracingPlaceholder: string;
  allowDelete?: boolean; // Whether to allow deletion of custom mappings
}

const MappingSection: React.FC<MappingSectionProps> = ({
  title,
  description,
  serviceName: _serviceName,
  mappings,
  onAdd: _onAdd,
  onEdit,
  onRemove,
  onReplace,
  serviceLabel,
  iracingLabel,
  servicePlaceholder,
  iracingPlaceholder,
  allowDelete = true, // Default to allowing deletion
}) => {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<GenericMapping | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  

  // Handle opening the add mapping modal
  const handleOpenAddModal = () => {
    setEditingMapping(null);
    setEditingIndex(-1);
    setModalOpen(true);
  };

  // Handle mapping saved from modal
  const handleMappingSaved = (serviceName: string, iracingName: string, index?: number) => {
    if (index !== undefined && index >= 0) {
      // Editing existing mapping
      onEdit(index, serviceName, iracingName);
    } else {
      // Adding new mapping
      _onAdd(serviceName, iracingName);
    }
  };

  const handleEdit = (index: number) => {
    const mapping = mappings[index];
    setEditingMapping(mapping);
    setEditingIndex(index);
    setModalOpen(true);
  };


  const handleModalClose = () => {
    setEditingMapping(null);
    setEditingIndex(-1);
    setModalOpen(false);
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
                p1doks: mapping.p1doks, // Keep p1doks property for compatibility
                iracing: mapping.iracing,
                isDefault: mapping.isDefault || false // Preserve isDefault flag from import
              }));
              
              // Merge: start with current defaults, then add/override with imported mappings
              const mergedMappings = [...currentDefaults];
              
              importedMappings.forEach((importedMapping: any) => {
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
            primaryOnClick={handleOpenAddModal}
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

      {/* Mapping Modal (Add/Edit) */}
      <MappingModal
        open={modalOpen}
        onClose={handleModalClose}
        title={title.slice(0, -1)} // Remove "s" from "Track Mappings" -> "Track Mapping"
        serviceName={_serviceName}
        serviceLabel={serviceLabel}
        iracingLabel={iracingLabel}
        servicePlaceholder={servicePlaceholder}
        iracingPlaceholder={iracingPlaceholder}
        mappings={mappings}
        editingMapping={editingMapping}
        editingIndex={editingIndex}
        onSave={handleMappingSaved}
      />

    </>
  );
};

export default MappingSection;
