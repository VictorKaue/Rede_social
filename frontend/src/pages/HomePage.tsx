import React, { useEffect, useState } from 'react';
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

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      const mappedPosts = response.data.map((post: any) => ({
        post_id: post.id,
        user_id: post.usuario_id,
        content: post.conteudo,
        type: post.tipo,
        created_at: post.data_criacao,
        username: post.nome_usuario,
        profile_photo: post.foto_perfil,
        comments: post.comentarios || [], // Certifique-se de que os comentários estão incluídos
      }));
      setPosts(mappedPosts);
    } catch (error) {
      console.error('Erro ao carregar postagens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleLike = async (postId: number) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts(prev =>
        prev.map(post =>
          post.post_id === postId ? { ...post, liked: true } : post
        )
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      await api.post(`/posts/${postId}/dislike`);
      setPosts(prev =>
        prev.map(post =>
          post.post_id === postId ? { ...post, disliked: true } : post
        )
      );
    } catch (error) {
      console.error('Erro ao descurtir post:', error);
    }
  };

  // New functions to handle likes/dislikes on comments
  const handleLikeComment = async (commentId: number) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      console.log(`Comentário ${commentId} curtido!`);
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  const handleDislikeComment = async (commentId: number) => {
    try {
      await api.post(`/comments/${commentId}/dislike`);
      console.log(`Comentário ${commentId} descurtido!`);
    } catch (error) {
      console.error('Erro ao descurtir comentário:', error);
    }
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
                  setPosts={setPosts}
                  onUpdate={handlePostUpdate}
                  onLike={() => handleLike(post.post_id)}
                  onDislike={() => handleDislike(post.post_id)}
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