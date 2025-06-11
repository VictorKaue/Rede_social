import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { Post, User } from '../types';
import PostCard from '../components/Posts/PostCard';
import EditProfileDialog from '../components/Profile/EditProfileDialog';
import SendMessageDialog from '../components/Profile/SendMessageDialog';
import { userService } from '../services/userService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os diálogos
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  
  // Estados para ações sociais
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [followLoading, setFollowLoading] = useState(false);
  
  // Estados para notificações
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  // Carregar dados do perfil e relacionamentos
  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Buscar dados do usuário
      // Endpoint sugerido: GET /api/users/:userId/profile
      const mockUser: User = {
        user_id: 1,
        username: 'joao_silva',
        email: 'joao@exemplo.com',
        birth_date: '1990-05-15',
        profile_photo: null,
        bio: 'Desenvolvedor apaixonado por tecnologia e inovação. Sempre aberto para novas conexões e colaborações! 🚀',
        location: 'São Paulo, Brasil',
        website: 'https://joaosilva.dev',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
        is_verified: true,
      };

      // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Buscar posts do usuário
      const mockPosts: Post[] = [
        {
          post_id: 1,
          user_id: 1,
          content: 'Acabei de lançar meu novo projeto! Uma aplicação React com Material UI que demonstra os princípios de uma rede social aberta e transparente. 🎉',
          post_type: 'texto',
          created_at: '2024-12-19T10:30:00Z',
          updated_at: '2024-12-19T10:30:00Z',
          username: 'joao_silva',
          profile_photo: null,
          like_count: 25,
          dislike_count: 1,
          comment_count: 12,
        },
        {
          post_id: 2,
          user_id: 1,
          content: 'Reflexão do dia: A transparência nas redes sociais pode revolucionar como nos conectamos. Quando todos os perfis são públicos, criamos um ambiente mais autêntico e inclusivo.',
          post_type: 'texto',
          created_at: '2024-12-18T15:20:00Z',
          updated_at: '2024-12-18T15:20:00Z',
          username: 'joao_silva',
          profile_photo: null,
          like_count: 18,
          dislike_count: 3,
          comment_count: 8,
        },
      ];

      // Simular carregamento paralelo dos dados
      const [userData, postsData, followingStatus, statsData] = await Promise.all([
        Promise.resolve(mockUser),
        Promise.resolve(mockPosts),
        userService.isFollowing(1, mockUser.user_id), // Simula usuário logado com ID 1
        userService.getFollowStats(mockUser.user_id),
      ]);

      setUser(userData);
      setPosts(postsData);
      setIsFollowing(followingStatus);
      setFollowStats(statsData);
      
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      showSnackbar('Erro ao carregar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funções auxiliares para notificações
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Função para abas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Função para atualização de posts
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === updatedPost.post_id ? updatedPost : post
      )
    );
  };

  // Funções para ações dos botões do perfil
  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };

  const handleSendMessage = () => {
    setSendMessageOpen(true);
  };

  const handleShareProfile = async () => {
    if (!user) return;
    
    try {
      await userService.shareProfile(user.user_id);
      showSnackbar('Link do perfil copiado para a área de transferência!', 'success');
    } catch (error) {
      console.error('Erro ao compartilhar perfil:', error);
      showSnackbar('Erro ao compartilhar perfil', 'error');
    }
  };

  const handleFollowToggle = async () => {
    if (!user || followLoading) return;
    
    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await userService.unfollowUser(1, user.user_id); // Simula usuário logado com ID 1
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        showSnackbar(`Você parou de seguir @${user.username}`, 'info');
      } else {
        await userService.followUser(1, user.user_id); // Simula usuário logado com ID 1
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        showSnackbar(`Agora você segue @${user.username}!`, 'success');
      }
    } catch (error) {
      console.error('Erro ao seguir/parar de seguir usuário:', error);
      showSnackbar('Erro ao processar ação', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    showSnackbar('Perfil atualizado com sucesso!', 'success');
  };

  const handleMessageSent = () => {
    showSnackbar('Mensagem enviada com sucesso!', 'success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (loading || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card sx={{ mb: 3 }}>
          <Box sx={{ height: 200, backgroundColor: 'grey.200' }} />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: 'grey.300',
                  mt: -8,
                  mr: 3,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ height: 24, backgroundColor: 'grey.300', borderRadius: 1, mb: 1, width: '40%' }} />
                <Box sx={{ height: 16, backgroundColor: 'grey.200', borderRadius: 1, width: '60%' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header do perfil */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        {/* Cover photo placeholder */}
        <Box
          sx={{
            height: 200,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            position: 'relative',
          }}
        />
        
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
            {/* Avatar */}
            <Avatar
              src={user.profile_photo || undefined}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                mt: -8,
                mr: isMobile ? 0 : 3,
                mb: isMobile ? 2 : 0,
              }}
            >
              {!user.profile_photo && <PersonIcon sx={{ fontSize: 60 }} />}
            </Avatar>

            {/* Informações do usuário */}
            <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', mb: 1 }}>
                <Typography variant="h4" fontWeight={600} sx={{ mr: 1 }}>
                  @{user.username}
                </Typography>
                {user.is_verified && (
                  <VerifiedIcon color="primary" sx={{ fontSize: 28 }} />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600 }}>
                {user.bio}
              </Typography>

              {/* Informações adicionais */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                {user.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.location}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Membro desde {formatDate(user.created_at)}
                  </Typography>
                </Box>

                {user.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      component="a" 
                      href={user.website}
                      target="_blank"
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {user.website.replace('https://', '')}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Contadores básicos */}
              <Box sx={{ display: 'flex', gap: 3, mb: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    {posts.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Posts
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => showSnackbar('Funcionalidade em desenvolvimento', 'info')}>
                  <Typography variant="h6" fontWeight={600}>
                    {followStats.followers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Seguidores
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => showSnackbar('Funcionalidade em desenvolvimento', 'info')}>
                  <Typography variant="h6" fontWeight={600}>
                    {followStats.following}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Seguindo
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Botões de ação */}
            <Box sx={{ display: 'flex', gap: 1, mt: isMobile ? 2 : 0, flexWrap: 'wrap' }}>
              {/* Simulação: se for o próprio perfil, mostrar botão de editar */}
              {user.user_id === 1 ? ( // Simula usuário logado com ID 1
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={handleEditProfile}
                >
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    size="small"
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {followLoading ? 'Processando...' : (isFollowing ? 'Parar de Seguir' : 'Seguir')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    size="small"
                    onClick={handleSendMessage}
                  >
                    Mensagem
                  </Button>
                </>
              )}
              <Tooltip title="Compartilhar perfil">
                <IconButton size="small" onClick={handleShareProfile}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs de conteúdo */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? 'fullWidth' : 'standard'}
            aria-label="tabs do perfil"
          >
            <Tab label={`Posts (${posts.length})`} />
            <Tab label="Curtidas" />
            <Tab label="Grupos" />
            <Tab label="Atividade" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Posts do usuário */}
          <Box>
            {posts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum post ainda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Este usuário ainda não compartilhou nenhum conteúdo.
                </Typography>
              </Box>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  sx={{ mb: 2 }}
                />
              ))
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Posts Curtidos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aqui aparecerão os posts que este usuário curtiu.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Grupos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Grupos dos quais este usuário participa.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Atividade Recente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Histórico de atividades do usuário na rede.
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Diálogos */}
      {user && (
        <>
          <EditProfileDialog
            open={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            user={user}
            onUserUpdate={handleUserUpdate}
          />
          <SendMessageDialog
            open={sendMessageOpen}
            onClose={() => setSendMessageOpen(false)}
            recipient={user}
            onMessageSent={handleMessageSent}
          />
        </>
      )}

      {/* Notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage; 