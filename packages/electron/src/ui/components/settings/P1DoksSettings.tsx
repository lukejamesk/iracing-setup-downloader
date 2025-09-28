import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
} from '@mui/material';
import { useP1Doks } from '../../contexts';
import MappingSection from './MappingSection';

const P1DoksSettings: React.FC = () => {
  const { 
    settings, 
    updateEmail, 
    updatePassword, 
    addCarMapping, 
    removeCarMapping,
    editCarMapping,
    replaceCarMappings,
    addTrackMapping,
    removeTrackMapping,
    editTrackMapping,
    replaceTrackMappings
  } = useP1Doks();

  return (
    <Box>
      <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
        P1Doks Settings
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
          P1Doks Credentials
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mb: 3 }}>
          Your P1Doks login credentials for downloading setups
        </Typography>

        <Grid container spacing={3}>
          {/* Email */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) => updateEmail(e.target.value)}
              required
              variant="outlined"
              placeholder="Enter your P1Doks email"
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
              }}
            />
          </Grid>

          {/* Password */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={settings.password}
              onChange={(e) => updatePassword(e.target.value)}
              required
              variant="outlined"
              placeholder="Enter your P1Doks password"
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
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Car Mappings Section */}
      <MappingSection
        title="Car Mappings"
        description="Map P1Doks car names to iRacing car names"
        mappings={settings.carMappings}
        onAdd={addCarMapping}
        onEdit={editCarMapping}
        onRemove={removeCarMapping}
        onReplace={replaceCarMappings}
        p1doksLabel="P1Doks Car Name"
        iracingLabel="iRacing Car Name"
        p1doksPlaceholder="e.g., Mercedes-AMG GT3 2020"
        iracingPlaceholder="e.g., mercedesamgevogt3"
        allowDelete={false}
      />

      {/* Track Mappings Section */}
      <MappingSection
        title="Track Mappings"
        description="Map P1Doks track names to setup folder track names"
        mappings={settings.trackMappings}
        onAdd={addTrackMapping}
        onEdit={editTrackMapping}
        onRemove={removeTrackMapping}
        onReplace={replaceTrackMappings}
        p1doksLabel="P1Doks Track Name"
        iracingLabel="Setup Track Name"
        p1doksPlaceholder="e.g., Silverstone Circuit"
        iracingPlaceholder="e.g., Silverstone Circuit - Grand Prix"
      />

    </Box>
  );
};

export default P1DoksSettings;