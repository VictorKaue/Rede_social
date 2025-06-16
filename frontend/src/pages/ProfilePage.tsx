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
  Verified as VerifiedIcon,
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

  // Carregar dados do perfil e relacionamentos (dados de exemplo estáticos)
  useEffect(() => {
    const exampleUser: User = {
      user_id: 1,
      username: 'usuario_demo',
      email: 'demo@exemplo.com',
      birth_date: '1995-01-01',
      profile_photo: null,
      bio: 'Esta é uma bio de demonstração para o perfil genérico.',
      location: 'Localização Desconhecida',
      website: 'https://exemplo.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-12-01T00:00:00Z',
      is_verified: false,
    };

    const examplePosts: Post[] = [
      {
        post_id: 1,
        user_id: 1,
        username: 'usuario_demo',
        content: 'Este é um post de demonstração!',
        post_type: 'texto',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
        profile_photo: null,
        like_count: 10,
        dislike_count: 2,
        comment_count: 3,
      },
    ];

    setUser(exampleUser);
    setPosts(examplePosts);
    setIsFollowing(false);
    setFollowStats({ followers: 0, following: 0 });
    setLoading(false);
  }, []);

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

  // Função para atualização do usuário
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

  if (loading) {
    console.log('Carregando dados...');
  }

  if (loading || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Carregando perfil...
        </Typography>
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
              src={user?.profile_photo || undefined}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                mt: -8,
                mr: isMobile ? 0 : 3,
                mb: isMobile ? 2 : 0,
              }}
            >
              {!user?.profile_photo && <PersonIcon sx={{ fontSize: 60 }} />}
            </Avatar>

            {/* Informações do usuário */}
            <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', mb: 1 }}>
                <Typography variant="h4" fontWeight={600} sx={{ mr: 1 }}>
                  @{user?.username || 'Usuário Anônimo'}
                </Typography>
                {user?.is_verified && (
                  <VerifiedIcon color="primary" sx={{ fontSize: 28 }} />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600 }}>
                {user?.bio || 'Este usuário ainda não adicionou uma biografia.'}
              </Typography>

              {/* Informações adicionais */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                {user?.location && (
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
                    Membro desde {user ? formatDate(user.created_at) : 'N/A'}
                  </Typography>
                </Box>

                {user?.website && (
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
                  setPosts={setPosts} // Adicione esta propriedade
                  onLike={() => {}} // Adicione esta propriedade
                  onDislike={() => {}} // Adicione esta propriedade
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