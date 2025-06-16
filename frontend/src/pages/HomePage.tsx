/**
 * =============================================================================
 * HOME PAGE - PÁGINA PRINCIPAL DA TIMELINE
 * =============================================================================
 * 
 * Página principal da rede social onde os usuários visualizam sua timeline
 * com posts de usuários que seguem e conteúdo relevante.
 * 
 * CARACTERÍSTICAS:
 * - Layout responsivo com duas colunas (desktop) e uma coluna (mobile)
 * - Timeline infinita com posts ordenados cronologicamente
 * - Botão FAB para criação rápida de posts
 * - Sidebar com widgets informativos (apenas desktop)
 * - Estados de loading com skeletons elegantes
 * - Atualização otimista de posts
 * 
 * INTEGRAÇÕES BACKEND NECESSÁRIAS:
 * - GET /api/posts/timeline - Feed personalizado do usuário
 * - POST /api/posts - Criar nova postagem
 * - PUT /api/posts/:id - Atualizar postagem existente
 * - WebSocket para atualizações em tempo real
 * - Sistema de paginação infinita
 * 
 * TODO: Implementar infinite scrolling
 * TODO: Adicionar pull-to-refresh no mobile
 * TODO: Implementar cache local de posts
 * TODO: Adicionar filtros de timeline (todos, seguindo, grupos)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Fab,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Post } from '../types';
import api from '../services/api';
import PostCard from '../components/Posts/PostCard';
import CreatePostDialog from '../components/Posts/CreatePostDialog';
import TrendingSidebar from '../components/Widgets/TrendingSidebar';
import WelcomeCard from '../components/Widgets/WelcomeCard';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await api.get('/posts/timeline', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setCreatePostOpen(false);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.post_id === updatedPost.post_id ? updatedPost : post
      )
    );
  };

  const renderLoadingSkeleton = () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Box sx={{ flex: '1 1 66%' }}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} sx={{ mb: 3, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="25%" height={16} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
          </Card>
        ))}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 1 }}>
        {renderLoadingSkeleton()}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', gap: 0 }}>
        <Box sx={{ flex: '1 1 75%', minWidth: 0, paddingRight: '100px' }}>
          <WelcomeCard sx={{ mb: 3 }} />
          <Box>
            {posts.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma postagem ainda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seja o primeiro a compartilhar algo interessante!
                </Typography>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  onUpdate={handlePostUpdate}
                />
              ))
            )}
          </Box>
        </Box>
        {!isMobile && (
          <Box sx={{ flex: '1 1 33%', minWidth: 280 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <TrendingSidebar />
            </Box>
          </Box>
        )}
      </Box>
      <Fab
        color="primary"
        aria-label="criar post"
        onClick={() => setCreatePostOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          boxShadow: 3,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 6,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <AddIcon />
      </Fab>
      <CreatePostDialog
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onSubmit={handleCreatePost}
      />
    </Container>
  );
};

export default HomePage;

/**
 * =============================================================================
 * MELHORIAS FUTURAS E TODOs
 * =============================================================================
 * 
 * PERFORMANCE E UX:
 * - [ ] Implementar infinite scrolling com intersection observer
 * - [ ] Adicionar virtualização para listas muito grandes
 * - [ ] Cache inteligente de posts com TTL apropriado
 * - [ ] Pull-to-refresh no mobile
 * - [ ] Lazy loading de imagens em posts
 * 
 * FUNCIONALIDADES DE TIMELINE:
 * - [ ] Filtros de timeline (todos, seguindo, grupos, favoritos)
 * - [ ] Algoritmo de relevância para ordenação de posts
 * - [ ] Personalização baseada em interesses do usuário
 * - [ ] Timeline de posts salvos/favoritos
 * - [ ] Modo de visualização (cards, lista compacta)
 * 
 * TEMPO REAL E SINCRONIZAÇÃO:
 * - [ ] WebSocket para novos posts em tempo real
 * - [ ] Sincronização offline com service worker
 * - [ ] Indicadores de novos posts disponíveis
 * - [ ] Atualizações otimistas com rollback em erro
 * 
 * WIDGETS E SIDEBAR:
 * - [ ] Widget de usuários sugeridos
 * - [ ] Widget de grupos populares
 * - [ ] Widget de atividade recente
 * - [ ] Widget de estatísticas pessoais
 * - [ ] Customização de widgets pelo usuário
 * 
 * ACESSIBILIDADE E MOBILE:
 * - [ ] Suporte completo a screen readers
 * - [ ] Navegação por teclado otimizada
 * - [ ] Gestos de swipe para ações rápidas (mobile)
 * - [ ] Modo escuro otimizado
 * - [ ] Suporte a dispositivos com pouca RAM
 * 
 * ANALYTICS E INSIGHTS:
 * - [ ] Tracking de tempo gasto na timeline
 * - [ ] Métricas de engajamento por tipo de post
 * - [ ] A/B testing para algoritmos de feed
 * - [ ] Insights de uso para o próprio usuário
 */