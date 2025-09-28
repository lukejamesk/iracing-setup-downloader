import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { SettingsIcon } from '../settings';

interface TitleBarProps {
  onBackClick: () => void;
  onSettingsClick: () => void;
  title: string;
  showBackButton?: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onBackClick,
  onSettingsClick,
  title,
  showBackButton = true,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: `
          linear-gradient(135deg, 
            rgba(0, 0, 0, 0.8) 0%, 
            rgba(0, 0, 0, 0.6) 50%, 
            rgba(0, 0, 0, 0.8) 100%
          ),
          linear-gradient(45deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.05) 100%
          )
        `,
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 4px 20px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        zIndex: 1000,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
          `,
          zIndex: -1,
        },
      }}
    >
      {/* Left side - Back button and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {showBackButton && (
          <Tooltip title="Back to service selection">
            <IconButton
              onClick={onBackClick}
              sx={{
                color: 'white',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right side - Settings icon */}
      <Box>
        <SettingsIcon onClick={onSettingsClick} />
      </Box>
    </Box>
  );
};

export default TitleBar;
