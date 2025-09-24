import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Quote } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout, apiMode, toggleApiMode } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32 /* ... */ }}>
              <Quote size={16} color="white" />
            </Box>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 'medium' }}>
              QuoteWise
            </Typography>
          </Box>

          <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={apiMode === 'graphql'}
                      onChange={toggleApiMode}
                      name="apiSwitch"
                      color="primary"
                    />
                  }
                  label={apiMode === 'graphql' ? 'GraphQL' : 'REST'}
                  sx={{ color: 'text.secondary', mr: 2, display: { xs: 'none', sm: 'flex' } }}
                />

                <Typography sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary' }}>
                  Welcome, {user?.name}
                </Typography>
                <Button variant="outlined" size="small" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" variant="contained" size="small">
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
