import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  FolderOpen as FolderIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useSettings } from '../../contexts';
import { useFolderPicker } from '../../hooks';
import { HistoryAutocomplete } from '../common';

const GeneralSettings: React.FC = () => {
  const { settings, activeTeam, addTeam, updateTeam, removeTeam, setActiveTeam, updateDownloadPath, updateBackgroundImage } = useSettings();
  const { selectFolder } = useFolderPicker();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog state
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');

  // Team management handlers
  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName('');
      setAddTeamDialogOpen(false);
    }
  };

  const handleEditTeam = (teamId: string) => {
    const team = settings.teams.find(t => t.id === teamId);
    if (team) {
      setEditingTeamId(teamId);
      setNewTeamName(team.name);
      setEditTeamDialogOpen(true);
    }
  };

  const handleUpdateTeam = () => {
    if (editingTeamId && newTeamName.trim()) {
      updateTeam(editingTeamId, {
        name: newTeamName.trim(),
      });
      setEditingTeamId(null);
      setNewTeamName('');
      setEditTeamDialogOpen(false);
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    removeTeam(teamId);
  };

  const handleSelectDownloadPath = async () => {
    const selectedPath = await selectFolder();
    if (selectedPath) {
      updateDownloadPath(selectedPath);
    }
  };

  // Background image handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateBackgroundImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackgroundImage = () => {
    updateBackgroundImage('./racing-cars-background.png'); // Reset to default
  };
  return (
    <Box>
      <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
        General Settings
      </Typography>

      {/* Teams Management Panel */}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Teams
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddTeamDialogOpen(true)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Add Team
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mb: 2 }}>
          Manage your teams and their download folders
        </Typography>

        {settings.teams.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.5, fontStyle: 'italic' }}>
            No teams configured. Click "Add Team" to get started.
          </Typography>
        ) : (
          <List>
            {settings.teams.map((team, index) => (
              <React.Fragment key={team.id}>
                <ListItem
                  sx={{
                    backgroundColor: activeTeam?.id === team.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                  onClick={() => setActiveTeam(team.id)}
                >
                  <ListItemText
                    primary={team.name}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: activeTeam?.id === team.id ? 'bold' : 'normal',
                      },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTeam(team.id);
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTeam(team.id);
                      }}
                      sx={{ color: 'rgba(255, 100, 100, 0.8)' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < settings.teams.length - 1 && <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Download Path Panel */}
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
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Download Path
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mb: 2 }}>
          Base folder where setups will be downloaded for all teams
        </Typography>

        <TextField
          fullWidth
          label="Download Path"
          value={settings.downloadPath}
          onChange={(e) => updateDownloadPath(e.target.value)}
          variant="outlined"
          placeholder="Select download folder"
          helperText="Team-specific folders will be created automatically within this path"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSelectDownloadPath} 
                  edge="end"
                >
                  <FolderIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'white',
              },
            },
            '& .MuiFormHelperText-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />
      </Paper>

      {/* Background Image Panel */}
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
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Background Image
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mb: 2 }}>
          Upload a custom background image for the application
        </Typography>

        {/* Current Background Preview */}
        {settings.backgroundImage && settings.backgroundImage !== './racing-cars-background.png' && (
          <Card sx={{ mb: 2, maxWidth: 300, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <CardMedia
              component="img"
              height="150"
              image={settings.backgroundImage}
              alt="Background preview"
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        )}

        {/* Upload Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Upload Image
          </Button>

          {settings.backgroundImage !== './racing-cars-background.png' && (
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveBackgroundImage}
              sx={{
                color: 'rgba(255, 100, 100, 0.8)',
                borderColor: 'rgba(255, 100, 100, 0.5)',
                '&:hover': {
                  borderColor: 'rgba(255, 100, 100, 0.8)',
                  backgroundColor: 'rgba(255, 100, 100, 0.1)',
                },
              }}
            >
              Reset to Default
            </Button>
          )}
        </Box>
      </Paper>

      {/* Add Team Dialog */}
      <Dialog
        open={addTeamDialogOpen}
        onClose={() => setAddTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Add New Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            variant="outlined"
            placeholder="e.g. Garage 61 - LK Racing"
            helperText="Your team name. If you are using Garage 61, add 'Garage 61 - '"
            sx={{ mt: 2, mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeamDialogOpen(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddTeam} 
            variant="contained"
            disabled={!newTeamName.trim()}
          >
            Add Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        open={editTeamDialogOpen}
        onClose={() => setEditTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Edit Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            variant="outlined"
            placeholder="e.g. Garage 61 - LK Racing"
            helperText="Your team name. If you are using Garage 61, add 'Garage 61 - '"
            sx={{ mt: 2, mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTeamDialogOpen(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateTeam} 
            variant="contained"
            disabled={!newTeamName.trim()}
          >
            Update Team
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneralSettings;
