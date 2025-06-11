/**
 * COMPONENTE DE NAVEGAÇÃO PRINCIPAL - NAVBAR
 * 
 * Barra de navegação superior fixa que contém:
 * 1. Logo e título da aplicação
 * 2. Campo de busca global
 * 3. Ícones de notificações e mensagens com badges
 * 4. Avatar e menu do usuário
 * 5. Menu hambúrguer para mobile
 * 
 * RESPONSIVIDADE:
 * - Desktop: Logo + Busca + Ações + Avatar
 * - Tablet: Logo + Busca + Ações + Avatar
 * - Mobile: Menu + Busca + Ações + Avatar (logo escondido)
 * 
 * BACKEND INTEGRATION NOTES:
 * - Precisa de contexto de autenticação para dados do usuário
 * - Contadores de notificações em tempo real
 * - Busca com autocomplete e sugestões
 * - WebSocket para atualizações de badges
 */

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  InputBase,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// COMPONENTES ESTILIZADOS PARA BUSCA
// ============================================================================

/**
 * CAMPO DE BUSCA CUSTOMIZADO
 * 
 * Implementa design Material UI com:
 * - Background translúcido sobre a navbar
 * - Hover states para melhor UX
 * - Responsividade (largura adaptativa)
 * - Transições suaves
 * 
 * BACKEND TODO:
 * - Autocomplete com sugestões em tempo real
 * - Histórico de buscas do usuário
 * - Busca com debounce para performance
 */
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

/**
 * WRAPPER DO ÍCONE DE BUSCA
 * 
 * Posicionamento absoluto do ícone dentro do campo de busca.
 * Seguindo padrões Material UI para consistent spacing.
 */
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

/**
 * INPUT DE BUSCA CUSTOMIZADO
 * 
 * Campo de entrada com:
 * - Padding apropriado para o ícone
 * - Transição suave ao focar
 * - Responsividade em diferentes breakpoints
 * - Acessibilidade com aria-label
 */
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`, // Espaço para o ícone
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',      // Largura inicial no desktop
      '&:focus': {
        width: '30ch',    // Expande ao focar
      },
    },
  },
}));

// ============================================================================
// INTERFACE E PROPRIEDADES DO COMPONENTE
// ============================================================================

/**
 * PROPS DO NAVBAR
 * 
 * @param onMenuClick - Callback para abrir/fechar sidebar em mobile
 */
interface NavbarProps {
  onMenuClick?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL NAVBAR
// ============================================================================

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Estados para controle dos menus dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');

  // ============================================================================
  // DADOS MOCKADOS - SUBSTITUIR POR INTEGRAÇÃO BACKEND
  // ============================================================================

  /**
   * DADOS DO USUÁRIO LOGADO
   * 
   * Atualmente usando dados estáticos, deve ser substituído por:
   * 
   * BACKEND TODO:
   * - AuthContext com dados do usuário autenticado
   * - Endpoint: GET /api/auth/me
   * - Resposta: { user_id, username, email, profile_photo, is_verified }
   * - Token JWT validado automaticamente
   * - Refresh automático em caso de token expirado
   */
  const currentUser = {
    username: 'joao_silva',     // TODO: BACKEND - Username real do usuário logado
    profile_photo: null,        // TODO: BACKEND - Foto real do usuário logado
  };

  /**
   * CONTADORES DE NOTIFICAÇÕES
   * 
   * Badges dos ícones de notificação e mensagem.
   * Devem ser atualizados em tempo real.
   * 
   * BACKEND TODO:
   * - Endpoint: GET /api/notifications/unread/count
   * - Endpoint: GET /api/messages/unread/count  
   * - WebSocket para atualizações em tempo real
   * - Cache Redis para performance
   * - Atualização automática quando usuário abre as páginas
   */
  const notificationCount = 3; // TODO: BACKEND - Contagem real de notificações não lidas
  const messageCount = 2;      // TODO: BACKEND - Contagem real de mensagens não lidas

  // ============================================================================
  // HANDLERS E FUNÇÕES DE INTERAÇÃO
  // ============================================================================

  /**
   * ABRIR MENU DO PERFIL
   * 
   * Controla o dropdown que aparece ao clicar no avatar.
   * Contém opções: Meu Perfil, Configurações, Sair.
   */
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * ABRIR NOTIFICAÇÕES
   * 
   * Navega para a página de notificações em vez de mostrar dropdown.
   * Escolha de UX para ter mais espaço para exibir notificações completas.
   * 
   * BACKEND TODO:
   * - Marcar notificações como visualizadas ao abrir página
   * - Endpoint: PUT /api/notifications/mark-viewed
   */
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Navegar para a página de notificações
    navigate('/notifications');
  };

  /**
   * FECHAR MENUS
   * 
   * Utility function para fechar todos os menus dropdown abertos.
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  /**
   * EXECUTAR BUSCA
   * 
   * Processa o formulário de busca e navega para página de resultados.
   * Limpa o campo após buscar para melhor UX.
   * 
   * BACKEND TODO:
   * - Validação e sanitização do termo de busca
   * - Rate limiting para prevenir abuse
   * - Logging de buscas para analytics
   * - Sugestões baseadas em histórico
   */
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      // Navegar para página de resultados com query parameter
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      setSearchValue(''); // Limpar campo após busca
    }
  };

  /**
   * ATUALIZAR VALOR DA BUSCA
   * 
   * Controlled input para o campo de busca.
   * 
   * TODO: IMPLEMENTAR AUTOCOMPLETE
   * - Debounce de 300ms para não sobrecarregar API
   * - Sugestões de usuários, grupos e hashtags
   * - Dropdown com resultados em tempo real
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  /**
   * NAVEGAR PARA PERFIL
   * 
   * Abre o perfil do usuário logado.
   * Fecha o menu após navegação.
   */
  const handleProfileClick = () => {
    navigate(`/profile/${currentUser.username}`);
    handleMenuClose();
  };

  /**
   * NAVEGAR PARA CONFIGURAÇÕES
   * 
   * Abre a página de configurações do usuário.
   * Fecha o menu após navegação.
   */
  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  /**
   * FAZER LOGOUT
   * 
   * Desloga o usuário e redireciona para página de login.
   * 
   * BACKEND TODO:
   * - Endpoint: POST /api/auth/logout
   * - Invalidar JWT token no servidor
   * - Limpar localStorage/sessionStorage
   * - Limpar cache do usuário
   * - Redirecionar para /login
   * - Mostrar feedback de logout bem-sucedido
   */
  const handleLogout = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Fazer logout
    // Endpoint sugerido: POST /api/auth/logout
    // Limpar tokens de autenticação e redirecionar para login
    console.log('Fazer logout');
    handleMenuClose();
  };

  // ============================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ============================================================================

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,  // Ficar acima do sidebar
        backgroundColor: 'primary.main',   // Cor primária do tema
      }}
    >
      <Toolbar>
        
        {/* 
          MENU HAMBÚRGUER (APENAS MOBILE)
          
          Visible apenas em telas pequenas para controlar sidebar.
          Em desktop, a sidebar é sempre visível.
          
          FUNCIONALIDADE:
          - Chama callback onMenuClick passado pelo componente pai
          - Usado para abrir/fechar sidebar responsiva
        */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* 
          LOGO E TÍTULO DA APLICAÇÃO
          
          Clickable para navegar de volta ao feed principal.
          Escondido em mobile para economizar espaço.
          
          TODO: CUSTOMIZAÇÃO
          - Substituir por logo real da aplicação
          - Adicionar imagem SVG otimizada
          - Nome dinâmico baseado em configuração
        */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },  // Esconder em mobile
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          Rede Social
        </Typography>

        {/* 
          CAMPO DE BUSCA GLOBAL
          
          Permite buscar usuários, posts, grupos, etc.
          Responsivo com expansão ao focar.
          
          FUNCIONALIDADES ATUAIS:
          - Submit ao pressionar Enter
          - Navegação para página de resultados
          - Limpeza automática após busca
          
          BACKEND TODO:
          - Autocomplete com debounce
          - Histórico de buscas
          - Sugestões populares
          - Filtros avançados
        */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <form onSubmit={handleSearch}>
            <StyledInputBase
              placeholder="Buscar usuários, posts, grupos..."
              value={searchValue}
              onChange={handleSearchChange}
              inputProps={{ 
                'aria-label': 'buscar',  // Acessibilidade
              }}
            />
          </form>
        </Search>

        {/* Spacer para empurrar ações para a direita */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 
          AÇÕES DO USUÁRIO
          
          Ícones de ação rápida sempre visíveis:
          - Mensagens com badge de não lidas
          - Notificações com badge de não lidas  
          - Avatar com menu dropdown
        */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* 
            ÍCONE DE MENSAGENS
            
            Badge mostra número de mensagens não lidas.
            Clique navega para página de mensagens.
            
            BACKEND TODO:
            - Contador real de mensagens não lidas
            - WebSocket para atualização em tempo real
            - Marcar como visualizadas ao clicar
          */}
          <IconButton
            size="large"
            aria-label={`${messageCount} mensagens não lidas`}
            color="inherit"
            onClick={() => navigate('/messages')}
          >
            <Badge badgeContent={messageCount} color="secondary">
              <MessageIcon />
            </Badge>
          </IconButton>

          {/* 
            ÍCONE DE NOTIFICAÇÕES
            
            Badge mostra número de notificações não lidas.
            Clique navega para página de notificações.
            
            BACKEND TODO:
            - Contador real de notificações não lidas
            - WebSocket para atualizações em tempo real
            - Diferentes tipos de notificação (like, comment, follow)
          */}
          <IconButton
            size="large"
            aria-label={`${notificationCount} notificações não lidas`}
            color="inherit"
            onClick={handleNotificationsOpen}
          >
            <Badge badgeContent={notificationCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* 
            AVATAR DO USUÁRIO
            
            Mostra foto do perfil ou ícone padrão.
            Clique abre menu com opções do usuário.
            
            FUNCIONALIDADES:
            - Foto real se disponível
            - Fallback para ícone genérico
            - Menu com Perfil, Configurações, Logout
          */}
          <IconButton
            size="large"
            edge="end"
            aria-label="menu do usuário"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {currentUser.profile_photo ? (
              <Avatar 
                src={currentUser.profile_photo} 
                alt={currentUser.username}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>

        {/* 
          MENU DROPDOWN DO PERFIL
          
          Aparece ao clicar no avatar.
          Contém ações principais do usuário.
          
          OPÇÕES:
          - Meu Perfil: Navegar para perfil próprio
          - Configurações: Abrir página de settings
          - Sair: Fazer logout da aplicação
        */}
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircle sx={{ mr: 2 }} />
            Meu Perfil
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <Settings sx={{ mr: 2 }} />
            Configurações
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2 }} />
            Sair
          </MenuItem>
        </Menu>

        {/* 
          MENU DE NOTIFICAÇÕES (ATUALMENTE NÃO USADO)
          
          Preview das notificações em dropdown.
          Atualmente preferimos navegar direto para página.
          
          TODO: FUTURAS MELHORIAS
          - Mostrar preview das últimas 3-5 notificações
          - Botão "Ver todas" no final
          - Marcar como lida ao visualizar
          - Diferentes ícones por tipo de notificação
        */}
        <Menu
          id="notifications-menu"
          anchorEl={notificationsAnchor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(notificationsAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          {/* Exemplos de notificações (dados mockados) */}
          <MenuItem>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                João curtiu sua postagem
              </Typography>
              <Typography variant="caption" color="text.secondary">
                há 2 minutos
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Maria comentou em sua postagem
              </Typography>
              <Typography variant="caption" color="text.secondary">
                há 5 minutos
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Novo membro no grupo "Tecnologia"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                há 10 minutos
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 