import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import theme from './theme';

function App() {
  const location = useLocation();

  // Define as rotas onde a Sidebar não será exibida
  const hideSidebarRoutes = ['/login', '/'];

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Renderiza a Sidebar apenas se a rota atual não estiver em `hideSidebarRoutes` */}
        {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;