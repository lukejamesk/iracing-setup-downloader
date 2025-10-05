import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';

interface ServiceCardProps {
  name: string;
  description: string;
  logoUrl?: string;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  description,
  logoUrl,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: 300,
        height: 200,
        cursor: 'pointer',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            style={{
              maxHeight: '60px',
              maxWidth: '200px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {name.charAt(0)}
            </Typography>
          </Box>
        )}
      </CardMedia>
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 1,
            textAlign: 'center',
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            opacity: 0.8,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
