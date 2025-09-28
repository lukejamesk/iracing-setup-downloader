import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface SettingsIconProps {
  onClick: () => void;
}

const SettingsIconComponent: React.FC<SettingsIconProps> = ({ onClick }) => {
  const [shouldBounce, setShouldBounce] = useState(false);

  useEffect(() => {
    // Check if this is the first time the app is loaded
    const hasOpenedSettings = localStorage.getItem('hasOpenedSettings');
    
    if (!hasOpenedSettings) {
      // First time - start bouncing animation and keep it going
      setShouldBounce(true);
    }
  }, []);

  const handleClick = () => {
    // Stop bouncing when clicked and mark that user has opened settings
    setShouldBounce(false);
    localStorage.setItem('hasOpenedSettings', 'true');
    onClick();
  };

  return (
    <Tooltip title="Settings" placement="bottom">
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'white',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          transition: 'all 0.2s ease-in-out',
          animation: shouldBounce ? 'bounce 1s infinite' : 'none',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': {
              transform: 'translateY(0)',
            },
            '40%': {
              transform: 'translateY(-10px)',
            },
            '60%': {
              transform: 'translateY(-5px)',
            },
          },
        }}
      >
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default SettingsIconComponent;
