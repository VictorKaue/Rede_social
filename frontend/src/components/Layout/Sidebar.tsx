/**
 * =============================================================================
 * SIDEBAR COMPONENT - COMPONENTE DE NAVEGAÇÃO LATERAL
 * =============================================================================
 * 
 * Componente responsável pela navegação lateral da aplicação.
 * Oferece acesso rápido às principais seções da rede social e seções de descoberta.
 * 
 * CARACTERÍSTICAS:
 * - Responsivo: Drawer permanente no desktop, temporário no mobile
 * - Navegação contextual com indicação visual da página ativa
 * - Duas seções: Navegação Principal e Descoberta
 * - Integração com React Router para navegação SPA
 * - Design consistente com Material UI Theme
 * 
 * INTEGRAÇÕES BACKEND NECESSÁRIAS:
 * - Dados do usuário logado (username, foto de perfil)
 * - Contadores de mensagens não lidas
 * - Status de participação em grupos
 * - Preferências de navegação do usuário
 * 
 * TODO: Implementar integração com AuthContext para dados do usuário
 * TODO: Adicionar contadores dinâmicos (mensagens, notificações)
 * TODO: Implementar personalização de menu baseada em preferências
 * TODO: Adicionar analytics de navegação
 */

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Explore as ExploreIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  TrendingUp as TrendingIcon,
  Tag as TagIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Certifique-se de que o AuthContext está implementado

// =============================================================================
// CONSTANTES E CONFIGURAÇÕES
// =============================================================================

/**
 * Largura padrão do drawer lateral
 * Otimizada para boa legibilidade sem comprometer o espaço do conteúdo principal
 */
const drawerWidth = 280;

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

/**
 * Props do componente Sidebar
 * 
 * @interface SidebarProps
 * @param {boolean} open - Controla se o sidebar está aberto (usado no mobile)
 * @param {function} onClose - Callback para fechar o sidebar (usado no mobile)
 */
interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

/**
 * Componente Sidebar - Navegação lateral da aplicação
 * 
 * Responsável por fornecer navegação rápida e intuitiva entre as principais
 * seções da rede social. Adapta-se automaticamente entre desktop e mobile.
 * 
 * @param {SidebarProps} props - Props do componente
 * @returns {JSX.Element} Componente de navegação lateral
 */
const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  // =============================================================================
  // HOOKS E ESTADO
  // =============================================================================
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();

  // =============================================================================
  // CONFIGURAÇÕES DE NAVEGAÇÃO
  // =============================================================================

  /**
   * Itens do menu principal de navegação
   * Cada item representa uma seção principal da aplicação
   * 
   * TODO: Adicionar contadores dinâmicos (ex: mensagens não lidas)
   * TODO: Implementar badges de notificação
   * TODO: Adicionar permissões baseadas no tipo de usuário
   */
  const menuItems = [
    {
      text: 'Meu Perfil',
      icon: <PersonIcon />,
      path: currentUser ? `/profile/${currentUser.username}` : '/login',
      description: 'Visualizar e editar seu perfil',
    },
  ];

  /**
   * Itens da seção de descoberta
   * Funcionalidades para explorar conteúdo e usuários
   * 
   * TODO: Tornar dinâmico baseado em tendências reais do sistema
   * TODO: Personalizar baseado no histórico do usuário
   */
  const discoverItems = [
    {
      text: 'Tendências',
      icon: <TrendingIcon />,
      path: '/explore?tab=trending',
      description: 'Postagens mais populares',
      // TODO: Integrar com sistema de trending em tempo real
    },
    {
      text: 'Tags Populares',
      icon: <TagIcon />,
      path: '/explore?tab=tags',
      description: 'Tags mais utilizadas',
      // TODO: Mostrar tags trending baseadas em algoritmo
    },
    {
      text: 'Novos Usuários',
      icon: <PeopleIcon />,
      path: '/explore?tab=users',
      description: 'Usuários recém-cadastrados',
      // TODO: Sugerir usuários baseado em interesses similares
    },
  ];

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  /**
   * Gerencia navegação entre páginas
   * Inclui lógica especial para fechar o sidebar no mobile após navegação
   * 
   * @param {string} path - Caminho de destino para navegação
   * 
   * TODO: Adicionar analytics de navegação
   * TODO: Implementar cache de última página visitada
   * TODO: Adicionar animações de transição suaves
   */
  const handleNavigation = (path: string) => {
    navigate(path);
    
    // Fecha o sidebar no mobile após navegação para melhor UX
    if (isMobile && onClose) {
      onClose();
    }
    
    // TODO: Registrar evento de navegação para analytics
    // TODO: Salvar última página visitada no localStorage
  };

  /**
   * Verifica se uma rota está ativa para destacar no menu
   * Usa lógica especial para a página inicial (exact match)
   * 
   * @param {string} path - Caminho a ser verificado
   * @returns {boolean} True se a rota está ativa
   * 
   * TODO: Melhorar lógica para sub-rotas complexas
   * TODO: Adicionar suporte a rotas com parâmetros dinâmicos
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // =============================================================================
  // CONTEÚDO DO DRAWER
  // =============================================================================

  /**
   * Conteúdo principal do drawer sidebar
   * Estrutura organizada em seções com separadores visuais
   */
  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* 
        Espaçamento para compensar a altura da navbar fixa
        Evita que o conteúdo fique atrás da navbar
      */}
      <Box sx={{ height: 64 }} />
      
      {/* =============================================================================
          SEÇÃO: NAVEGAÇÃO PRINCIPAL
          ============================================================================= */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            mb: 1,
          }}
        >
          Navegação
        </Typography>
        
        <List disablePadding>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  // Estilo para item selecionado/ativo
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                  // Estilo para hover em itens não selecionados
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                aria-label={item.description}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive(item.path) ? 'inherit' : 'action.active',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {/* TODO: Adicionar badges de notificação aqui */}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Separador visual entre seções */}
      <Divider sx={{ mx: 2, my: 2 }} />

      {/* =============================================================================
          SEÇÃO: DESCOBERTA E EXPLORAÇÃO
          ============================================================================= */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.secondary',
            mb: 1,
          }}
        >
          Descobrir
        </Typography>
        
        <List disablePadding>
          {discoverItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  // Tema secundário para seção de descoberta
                  '&.Mui-selected': {
                    backgroundColor: 'secondary.light',
                    color: 'secondary.contrastText',
                    '&:hover': {
                      backgroundColor: 'secondary.main',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                aria-label={item.description}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive(item.path) ? 'inherit' : 'action.active',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Separador antes da seção de informações */}
      <Divider sx={{ mx: 2, my: 2 }} />

      {/* =============================================================================
          SEÇÃO: INFORMAÇÕES DA REDE
          ============================================================================= */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Rede Social Aberta
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            display: 'block',
            lineHeight: 1.4,
          }}
        >
          Uma plataforma transparente onde todos os perfis são públicos e as conexões são livres. 
          Compartilhe, conecte-se e descubra sem barreiras.
        </Typography>
        {/* TODO: Adicionar versão da aplicação e links úteis */}
      </Box>
    </Box>
  );

  // =============================================================================
  // RENDERIZAÇÃO RESPONSIVA
  // =============================================================================

  /**
   * Renderização para dispositivos móveis
   * Usa Drawer temporário que pode ser aberto/fechado
   */
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Melhor performance no mobile - mantém o DOM
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  /**
   * Renderização para desktop
   * Usa Drawer permanente sempre visível
   */
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;

/**
 * =============================================================================
 * MELHORIAS FUTURAS E TODOs
 * =============================================================================
 * 
 * INTEGRAÇÃO BACKEND:
 * - [ ] Integrar com AuthContext para dados do usuário logado
 * - [ ] Implementar contadores de mensagens não lidas (WebSocket)
 * - [ ] Adicionar badges de notificação em tempo real
 * - [ ] Carregar preferências de navegação do usuário
 * 
 * UX/UI MELHORIAS:
 * - [ ] Adicionar animações de transição suaves entre páginas
 * - [ ] Implementar modo compacto para sidebar (apenas ícones)
 * - [ ] Adicionar tooltips informativos nos ícones
 * - [ ] Suporte a temas personalizáveis
 * 
 * FUNCIONALIDADES:
 * - [ ] Sistema de favoritos para acesso rápido
 * - [ ] Histórico de páginas visitadas recentemente
 * - [ ] Busca rápida integrada no sidebar
 * - [ ] Atalhos de teclado para navegação
 * 
 * ANALYTICS E MONITORAMENTO:
 * - [ ] Tracking de navegação e padrões de uso
 * - [ ] Métricas de engajamento por seção
 * - [ ] A/B testing para otimização de layout
 * 
 * PERFORMANCE:
 * - [ ] Lazy loading de componentes não críticos
 * - [ ] Memoização de itens de menu pesados
 * - [ ] Otimização para SSR (Server-Side Rendering)
 */