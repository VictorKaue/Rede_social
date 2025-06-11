/**
 * COMPONENTE PRINCIPAL DA APLICAÇÃO REDE SOCIAL JPPROJECT
 * 
 * Este é o componente raiz que configura:
 * 1. Roteamento da aplicação (React Router)
 * 2. Tema global (Material UI)
 * 3. Layout principal (Navbar + Sidebar + Conteúdo)
 * 4. Acessibilidade e responsividade
 * 
 * ESTRUTURA DO LAYOUT:
 * - Navbar: Barra superior fixa (64px altura)
 * - Sidebar: Menu lateral esquerdo (280px largura no desktop)
 * - Main: Área de conteúdo principal (responsiva)
 * 
 * BACKEND INTEGRATION NOTES:
 * - AuthContext será integrado para gerenciar autenticação
 * - Rotas protegidas serão implementadas baseadas no estado do usuário
 * - WebSocket será integrado para notificações em tempo real
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// ============================================================================
// IMPORTAÇÃO DE COMPONENTES DA APLICAÇÃO
// ============================================================================

// Componentes de Layout (estrutura da página)
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Páginas principais da aplicação
import HomePage from './pages/HomePage';          // Feed principal de postagens
import ProfilePage from './pages/ProfilePage';   // Perfil do usuário (próprio ou de outros)
import GroupsPage from './pages/GroupsPage';     // Listagem e gerenciamento de grupos
import MessagesPage from './pages/MessagesPage'; // Sistema de mensagens privadas
import ExplorePage from './pages/ExplorePage';   // Descoberta de conteúdo e usuários
import SearchPage from './pages/SearchPage';     // Busca avançada
import SettingsPage from './pages/SettingsPage'; // Configurações do usuário
import NotificationsPage from './pages/NotificationsPage'; // Central de notificações

// ============================================================================
// CONFIGURAÇÃO DO TEMA MATERIAL UI
// ============================================================================

/**
 * TEMA CUSTOMIZADO SEGUINDO MATERIAL DESIGN 3.0
 * 
 * PRINCÍPIOS IMPLEMENTADOS:
 * - Acessibilidade: Contrastes adequados, foco visível, tamanhos mínimos
 * - Responsividade: Adaptação para mobile, tablet e desktop
 * - Consistência: Sistema de cores, tipografia e espaçamentos padronizados
 * - Performance: Componentes otimizados para re-renderização
 * 
 * PALETA DE CORES:
 * - Primary: Azul (#1976d2) - Ações principais, links, botões
 * - Secondary: Rosa (#dc004e) - Ações secundárias, destaques
 * - Background: Cinza claro (#f8fafc) - Fundo da aplicação
 * - Paper: Branco (#ffffff) - Fundo de cards e modais
 * 
 * BACKEND TODO:
 * - Endpoint para salvar preferências de tema do usuário
 * - Suporte a tema escuro (dark mode)
 * - Personalização de cores por usuário
 */
const theme = createTheme({
  palette: {
    mode: 'light', // Modo claro padrão (TODO: implementar modo escuro)
    primary: {
      main: '#1976d2',    // Azul principal
      light: '#42a5f5',   // Azul claro para hover states
      dark: '#1565c0',    // Azul escuro para pressed states
    },
    secondary: {
      main: '#dc004e',    // Rosa para ações secundárias
      light: '#ff5983',   // Rosa claro para variações
      dark: '#9a0036',    // Rosa escuro para contraste
    },
    background: {
      default: '#f8fafc', // Fundo geral da aplicação
      paper: '#ffffff',   // Fundo de cards, modals, etc.
    },
    text: {
      primary: '#1a202c',   // Texto principal (preto suave)
      secondary: '#718096', // Texto secundário (cinza)
    },
  },
  
  /**
   * SISTEMA TIPOGRÁFICO PERSONALIZADO
   * 
   * Font Stack: Inter (moderna) → Roboto (fallback) → System fonts
   * Hierarquia clara com 6 níveis de headings
   * Line-height otimizado para legibilidade
   * Letter-spacing para melhor renderização
   */
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    
    // Títulos principais (h1-h6)
    h1: {
      fontSize: '2.5rem',      // 40px
      fontWeight: 700,         // Bold para máximo impacto
      lineHeight: 1.2,         // Tight para títulos grandes
      letterSpacing: '-0.025em', // Slight negative tracking
    },
    h2: {
      fontSize: '2rem',        // 32px
      fontWeight: 600,         // Semibold
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',      // 24px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',     // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',        // 16px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    
    // Texto do corpo
    body1: {
      fontSize: '1rem',        // 16px - tamanho padrão
      lineHeight: 1.6,         // Espaçamento confortável para leitura
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',    // 14px - texto menor
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
  },
  
  /**
   * CONFIGURAÇÕES DE FORMA E ESPAÇAMENTO
   */
  shape: {
    borderRadius: 12, // Border radius padrão para consistência
  },
  spacing: 8, // Base de 8px para sistema de espaçamento
  
  /**
   * CUSTOMIZAÇÕES DE COMPONENTES MATERIAL UI
   * 
   * Cada componente é customizado para:
   * - Melhor acessibilidade (foco, contraste, tamanhos)
   * - Consistência visual
   * - Performance otimizada
   * - Responsividade
   */
  components: {
    
    /**
     * CUSTOMIZAÇÃO DOS BOTÕES
     * 
     * Melhorias implementadas:
     * - Foco visível para navegação por teclado
     * - Tamanhos mínimos para touch targets (44px)
     * - Text transform removido para melhor legibilidade
     * - Border radius consistente
     */
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',    // Remove UPPERCASE automático
          fontWeight: 500,          // Medium weight para legibilidade
          borderRadius: 8,          // Bordas arredondadas
          padding: '10px 20px',     // Padding confortável
          minHeight: 40,            // Touch target mínimo
          
          // Foco visível para acessibilidade
          '&:focus': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
        
        // Variações de tamanho com touch targets apropriados
        sizeSmall: {
          padding: '6px 12px',
          minHeight: 32,
        },
        sizeLarge: {
          padding: '12px 24px',
          minHeight: 48,
        },
      },
    },
    
    /**
     * CUSTOMIZAÇÃO DOS CARDS
     * 
     * Cards são fundamentais na interface da rede social.
     * Implementações:
     * - Sombras sutis para profundidade
     * - Hover effects para interatividade
     * - Transições suaves
     * - Bordas discretas
     */
    MuiCard: {
      styleOverrides: {
        root: {
          // Sombra sutil por padrão
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
          
          // Hover effect para interatividade
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    
    /**
     * CUSTOMIZAÇÃO DO CONTEÚDO DOS CARDS
     * 
     * Padding consistente em todos os cards
     */
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px', // Remove padding extra do último child
          },
        },
      },
    },
    
    /**
     * CUSTOMIZAÇÃO DOS CAMPOS DE TEXTO
     * 
     * Melhorias para formulários:
     * - Border radius consistente
     * - Foco visível
     * - Validação visual
     */
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            
            // Foco visível para acessibilidade
            '&:focus-within': {
              outline: '2px solid #1976d2',
              outlineOffset: '2px',
            },
          },
        },
      },
    },
    
    /**
     * CUSTOMIZAÇÃO DOS ITENS DE LISTA
     * 
     * Usado no sidebar e menus:
     * - Estados hover e selected claros
     * - Border radius para suavidade
     * - Espaçamento adequado
     */
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          
          // Estado selecionado
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
            },
          },
        },
      },
    },
    
    /**
     * CUSTOMIZAÇÃO DOS CONTAINERS
     * 
     * Padding otimizado para diferentes breakpoints
     */
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '8px',
          paddingRight: '8px',
          
          // Mobile: padding mínimo para aproveitar espaço
          '@media (max-width: 600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
      },
    },
  },
});

// ============================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ============================================================================

/**
 * COMPONENTE APP
 * 
 * Responsabilidades:
 * 1. Configurar tema global
 * 2. Configurar roteamento
 * 3. Definir layout principal
 * 4. Gerenciar responsividade
 * 
 * LAYOUT STRUCTURE:
 * ┌─────────────────────────────────────┐
 * │ Navbar (altura: 64px, fixa)         │
 * ├─────────────┬───────────────────────┤
 * │ Sidebar     │ Main Content Area     │
 * │ (280px)     │ (flex-grow: 1)        │
 * │ (hidden     │                       │
 * │ on mobile)  │                       │
 * └─────────────┴───────────────────────┘
 * 
 * RESPONSIVIDADE:
 * - Desktop (>= 900px): Navbar + Sidebar + Content
 * - Tablet (600-899px): Navbar + Content (sidebar colapsada)
 * - Mobile (< 600px): Navbar + Content (sidebar em modal)
 * 
 * BACKEND TODO:
 * - Implementar AuthProvider para gerenciar estado de autenticação
 * - Adicionar ProtectedRoute para rotas que requerem login
 * - Integrar NotificationProvider para notificações em tempo real
 * - Adicionar ErrorBoundary para tratamento de erros
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Reset de CSS global + baseline do Material UI */}
      <CssBaseline />
      
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* 
            NAVBAR SUPERIOR
            - Posição fixa no topo
            - Altura de 64px (padrão Material UI)
            - Contém logo, busca, notificações e perfil
            - Z-index alto para ficar sobre outros elementos
            
            BACKEND TODO:
            - Integrar contadores de notificações não lidas
            - Implementar busca em tempo real
            - Adicionar dropdown de perfil com logout
          */}
          <Navbar />
          
          {/* 
            SIDEBAR LATERAL
            - Menu de navegação principal
            - Largura de 280px no desktop
            - Responsiva (colapsada/modal em telas menores)
            - Links para todas as seções da aplicação
            
            BACKEND TODO:
            - Destacar página atual baseada na rota
            - Adicionar contadores dinâmicos (mensagens não lidas, etc.)
            - Implementar favoritos/atalhos personalizados
          */}
          <Sidebar />
          
          {/* 
            ÁREA DE CONTEÚDO PRINCIPAL
            - Ocupa espaço restante (flex-grow: 1)
            - Margem superior para compensar navbar fixa
            - Margem lateral para compensar sidebar
            - Padding responsivo baseado no tamanho da tela
            - Background cinza claro para contraste com cards
          */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,                              // Ocupa espaço restante
              marginTop: '64px',                        // Compensa altura da navbar
              marginLeft: { xs: 0, md: '280px' },       // Compensa largura da sidebar (apenas desktop)
              padding: { 
                xs: '8px',    // Mobile: padding mínimo
                sm: '12px',   // Tablet: padding médio
                md: '16px'    // Desktop: padding confortável
              },
              backgroundColor: 'background.default',    // Fundo cinza claro
              minHeight: 'calc(100vh - 64px)',         // Altura mínima (tela completa - navbar)
              maxWidth: '100%',                        // Previne overflow horizontal
              overflow: 'hidden',                      // Previne scroll indesejado
            }}
          >
            {/* 
              SISTEMA DE ROTEAMENTO
              
              Cada rota corresponde a uma página principal da aplicação.
              Todas as páginas são carregadas dentro da área de conteúdo principal.
              
              ROTAS IMPLEMENTADAS:
              - / : Feed principal (HomePage)
              - /profile/:username? : Perfil (próprio ou de outro usuário)
              - /groups : Grupos (listagem e gerenciamento)
              - /messages : Mensagens privadas
              - /explore : Descoberta de conteúdo
              - /search : Busca avançada
              - /settings : Configurações do usuário
              - /notifications : Central de notificações
              
              BACKEND TODO:
              - Implementar rota /login e /register
              - Adicionar ProtectedRoute para rotas autenticadas
              - Implementar rota 404 para páginas não encontradas
              - Adicionar loading states para navegação
            */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:username?" element={<ProfilePage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
