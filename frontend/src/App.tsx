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
import GroupsPage from './pages/GroupsPage';
import theme from './theme';

const drawerWidth = 280; // Largura da sidebar

function App() {
  const location = useLocation();

  // Define as rotas onde a Sidebar não será exibida
  const hideSidebarRoutes = ['/login', '/'];

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div
          style={{
            display: 'flex',
          }}
        >
          {/* Renderiza a Sidebar apenas se a rota atual não estiver em `hideSidebarRoutes` */}
          {!hideSidebarRoutes.includes(location.pathname) && (
            <Sidebar />
          )}
          <main
            style={{
              flexGrow: 1,
              marginLeft: !hideSidebarRoutes.includes(location.pathname)
                ? `${drawerWidth}px`
                : '0px', // Adiciona margem apenas quando a sidebar está visível
              padding: '16px', // Padding interno para o conteúdo principal
            }}
          >
            <Routes>
              <Route path="/" element={<RegisterPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/groups" element={<GroupsPage />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;