import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ 
  onSearchChange, 
  placeholder = "Search...", 
  fullWidth = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <TextField
      fullWidth={fullWidth}
      variant="outlined"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        sx: {
          height: 40,
          borderRadius: 2
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'grey.300',
          },
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          },
        },
      }}
    />
  );
};

export default SearchBar;