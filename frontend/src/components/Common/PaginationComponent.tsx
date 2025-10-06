import { Pagination, Box } from '@mui/material';

interface PaginationComponentProps {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export function PaginationComponent({ count, page, onChange }: PaginationComponentProps) {
  if (count <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <Pagination count={count} page={page} onChange={onChange} color="primary" size="large" />
    </Box>
  );
}
