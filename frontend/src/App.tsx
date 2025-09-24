import React from 'react';
// --- REMOVE BrowserRouter as Router from this import ---
import { Routes, Route, Navigate } from 'react-router-dom';
// --------------------------------------------------------
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Registration from './components/Registration/Registration';
import HomePage from './components/Pages/HomePage';
import { Header } from './components/QuoteComponents/Header';

const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5' },
    error: { main: '#ef4444' },
  },
  typography: {
    h5: { fontWeight: 700 },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};
