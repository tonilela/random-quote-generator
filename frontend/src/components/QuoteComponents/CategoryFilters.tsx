import { Button, Box } from '@mui/material';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const commonButtonStyles = {
    borderRadius: '9999px',
    textTransform: 'capitalize',
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      <Button
        variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onCategoryChange('all')}
        sx={commonButtonStyles}
      >
        All
      </Button>

      {categories.slice(0, 6).map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onCategoryChange(category)}
          sx={commonButtonStyles}
        >
          {category}
        </Button>
      ))}
    </Box>
  );
}
