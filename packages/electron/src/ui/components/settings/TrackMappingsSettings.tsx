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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import { ComboButton } from '../common';
import { useTrackMapping } from '../../contexts';
import type { UnifiedTrackMapping } from '../../contexts/TrackMappingContext';

const TrackMappingsSettings: React.FC = () => {
  const { trackMappings, addMapping, removeMapping, editMapping, replaceMappings } = useTrackMapping();

  // Edit/Add dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [canonicalName, setCanonicalName] = useState('');
  const [p1doksSource, setP1doksSource] = useState('');
  const [hymoSource, setHymoSource] = useState('');

  const handleOpenAdd = () => {
    setEditingIndex(-1);
    setCanonicalName('');
    setP1doksSource('');
    setHymoSource('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const mapping = trackMappings[index];
    setEditingIndex(index);
    setCanonicalName(mapping.canonicalName);
    setP1doksSource((mapping.sources.p1doks || []).join('\n'));
    setHymoSource((mapping.sources.hymo || []).join('\n'));
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingIndex(-1);
    setCanonicalName('');
    setP1doksSource('');
    setHymoSource('');
  };

  const parseSourceLines = (text: string): string[] => {
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  };

  const handleDialogSave = () => {
    const trimmedCanonical = canonicalName.trim();
    const p1doksLines = parseSourceLines(p1doksSource);
    const hymoLines = parseSourceLines(hymoSource);

    if (!trimmedCanonical) return;
    if (p1doksLines.length === 0 && hymoLines.length === 0) return;

    if (editingIndex >= 0) {
      editMapping(editingIndex, {
        ...trackMappings[editingIndex],
        canonicalName: trimmedCanonical,
        sources: {
          ...(p1doksLines.length > 0 ? { p1doks: p1doksLines } : {}),
          ...(hymoLines.length > 0 ? { hymo: hymoLines } : {}),
        },
      });
    } else {
      // Add new: add each p1doks source, then each hymo source
      for (const name of p1doksLines) {
        addMapping(trimmedCanonical, 'p1doks', name);
      }
      for (const name of hymoLines) {
        addMapping(trimmedCanonical, 'hymo', name);
      }
    }

    handleDialogClose();
  };

  const handleExport = () => {
    const exportData = {
      mappings: trackMappings,
      exportedAt: new Date().toISOString(),
      type: 'track',
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'track-mappings.json';
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
              // Handle both unified format and old format
              const imported: UnifiedTrackMapping[] = importData.mappings.map((m: any) => {
                if (m.canonicalName !== undefined) {
                  // Unified format
                  return m as UnifiedTrackMapping;
                }
                // Old format: { p1doks, iracing }
                return {
                  canonicalName: m.iracing,
                  sources: { p1doks: m.p1doks },
                  isDefault: m.isDefault,
                } as UnifiedTrackMapping;
              });

              // Merge: preserve defaults, add/override with imported
              const currentDefaults = trackMappings.filter(m => m.isDefault);
              const merged = [...currentDefaults];

              imported.forEach(importedMapping => {
                const existingIndex = merged.findIndex(
                  m => m.canonicalName.toLowerCase() === importedMapping.canonicalName.toLowerCase()
                );
                if (existingIndex >= 0) {
                  merged[existingIndex] = {
                    ...merged[existingIndex],
                    sources: {
                      ...merged[existingIndex].sources,
                      ...importedMapping.sources,
                    },
                  };
                } else {
                  merged.push(importedMapping);
                }
              });

              replaceMappings(merged);
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

  const isEditing = editingIndex >= 0;

  return (
    <>
      <Box>
        <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
          Track Mappings
        </Typography>

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
              Unified Track Mappings
            </Typography>
            <ComboButton
              primaryLabel="Add"
              primaryIcon={<AddIcon />}
              primaryOnClick={handleOpenAdd}
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
            Map service-specific track names to canonical folder names. Both P1Doks and Hymo downloads
            will use the canonical name for consistent folder organization.
          </Typography>

          {trackMappings.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.5, textAlign: 'center', py: 4 }}>
              No track mappings configured. Add a mapping to get started.
            </Typography>
          ) : (
            <List>
              {trackMappings.map((mapping, index) => (
                <ListItem
                  key={index}
                  sx={{
                    backgroundColor: mapping.isDefault
                      ? 'rgba(25, 118, 210, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    mb: 1,
                    border: mapping.isDefault
                      ? '1px solid rgba(25, 118, 210, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    paddingRight: '120px',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mapping.canonicalName}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                            P1Doks: {mapping.sources.p1doks?.length ? mapping.sources.p1doks.join(', ') : (
                              <span style={{ opacity: 0.4 }}>---</span>
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                            Hymo: {mapping.sources.hymo?.length ? mapping.sources.hymo.join(', ') : (
                              <span style={{ opacity: 0.4 }}>---</span>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ minWidth: 0, flex: 1 }}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenEdit(index)}
                        sx={{
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      {!mapping.isDefault && (
                        <IconButton
                          edge="end"
                          onClick={() => removeMapping(index)}
                          sx={{
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
          )}
        </Paper>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
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
          {isEditing ? 'Edit' : 'Add'} Track Mapping
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Canonical Track Name"
              value={canonicalName}
              onChange={(e) => setCanonicalName(e.target.value)}
              variant="outlined"
              placeholder="e.g., Long Beach Street Circuit"
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
            <TextField
              fullWidth
              label="P1Doks Track Names (optional)"
              value={p1doksSource}
              onChange={(e) => setP1doksSource(e.target.value)}
              variant="outlined"
              multiline
              minRows={1}
              maxRows={4}
              placeholder="One name per line"
              helperText="One track name per line"
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
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />
            <TextField
              fullWidth
              label="Hymo Track Names (optional)"
              value={hymoSource}
              onChange={(e) => setHymoSource(e.target.value)}
              variant="outlined"
              multiline
              minRows={1}
              maxRows={4}
              placeholder="One name per line"
              helperText="One track name per line"
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
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleDialogClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDialogSave}
            variant="contained"
            disabled={!canonicalName.trim() || (parseSourceLines(p1doksSource).length === 0 && parseSourceLines(hymoSource).length === 0)}
            sx={{
              backgroundColor: 'rgba(33, 150, 243, 0.8)',
              '&:hover': { backgroundColor: 'rgba(33, 150, 243, 1)' },
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
    </>
  );
};

export default TrackMappingsSettings;
