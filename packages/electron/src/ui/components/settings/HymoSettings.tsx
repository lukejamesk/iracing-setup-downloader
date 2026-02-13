import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
} from '@mui/material';
import { useHymo } from '../../contexts';

const HymoSettings: React.FC = () => {
  const {
    settings,
    updateLogin,
    updatePassword,
  } = useHymo();

  return (
    <Box>
      <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
        Hymo Settings
      </Typography>

      {/* Credentials Section */}
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
          Hymo Credentials
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mb: 3 }}>
          Your Hymo login credentials for downloading setups
        </Typography>

        <Grid container spacing={3}>
          {/* Login */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Login"
              type="text"
              value={settings.login}
              onChange={(e) => updateLogin(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
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
              }}
            />
          </Grid>

          {/* Password */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={settings.password}
              onChange={(e) => updatePassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
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
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default HymoSettings;
