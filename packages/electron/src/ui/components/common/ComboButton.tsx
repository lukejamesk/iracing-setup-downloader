import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';

export interface ComboButtonOption {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface ComboButtonProps {
  primaryLabel: string;
  primaryIcon?: React.ReactNode;
  primaryOnClick: () => void;
  options: ComboButtonOption[];
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'inherit';
  size?: 'small' | 'medium' | 'large';
  sx?: object;
}

const ComboButton: React.FC<ComboButtonProps> = ({
  primaryLabel,
  primaryIcon,
  primaryOnClick,
  options,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  sx = {},
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleOptionClick = (option: ComboButtonOption) => {
    option.onClick();
    handleMenuClose();
  };

  return (
    <>
      <ButtonGroup variant={variant} color={color} size={size} sx={sx}>
        <Button
          startIcon={primaryIcon}
          onClick={primaryOnClick}
        >
          {primaryLabel}
        </Button>
        <Button
          size="small"
          onClick={handleMenuOpen}
          sx={{
            minWidth: 'auto',
            px: 1,
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: 150,
          }
        }}
      >
        {options.map((option, index) => (
          <MenuItem 
            key={index}
            onClick={() => handleOptionClick(option)}
            sx={{ color: 'white' }}
          >
            {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ComboButton;
