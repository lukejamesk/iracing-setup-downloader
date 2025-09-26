import React from "react";
import {Autocomplete, TextField, Box, IconButton} from "@mui/material";
import {Clear as ClearIcon} from "@mui/icons-material";

interface HistoryAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  history: string[];
  onChange: (value: string | null) => void;
  onInputChange: (value: string) => void;
  onBlur: () => void;
  onRemoveFromHistory: (value: string) => void;
  required?: boolean;
}

const HistoryAutocomplete: React.FC<HistoryAutocompleteProps> = ({
  label,
  placeholder,
  value,
  history,
  onChange,
  onInputChange,
  onBlur,
  onRemoveFromHistory,
  required = false,
}) => {
  return (
    <Autocomplete
      freeSolo
      options={history}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        onInputChange(newInputValue);
      }}
      onBlur={onBlur}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>{option}</span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromHistory(option);
                }}
                sx={{ml: 1}}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label={label}
          required={required}
          variant="outlined"
          placeholder={placeholder}
        />
      )}
    />
  );
};

export default HistoryAutocomplete;
