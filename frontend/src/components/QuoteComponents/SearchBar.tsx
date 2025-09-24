import { TextField, InputAdornment, Box } from '@mui/material';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  disabled?: boolean;
}

export function SearchBar({ searchTerm, onSearchChange, disabled = false }: SearchBarProps) {
  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto', width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search quotes and authors..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} color={disabled ? '#bdbdbd' : '#757575'} />
            </InputAdornment>
          ),
          sx: { borderRadius: '9999px' },
        }}
      />
    </Box>
  );
}
