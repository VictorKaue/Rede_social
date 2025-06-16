/**
 * =============================================================================
 * POST CARD COMPONENT - COMPONENTE DE CARD DE POSTAGEM
 * =============================================================================
 * 
 * Componente principal para exibição de postagens na timeline da rede social.
 * Gerencia todas as interações com posts: curtidas, comentários, compartilhamentos.
 * 
 * CARACTERÍSTICAS:
 * - Sistema completo de reações (like/dislike) com feedback visual
 * - Integração com sistema de comentários (seção inline e modal expandido)
 * - Menu de ações contextuais (salvar, reportar, copiar link)
 * - Design responsivo e acessível
 * - Animações suaves para melhor UX
 * 
 * INTEGRAÇÕES BACKEND NECESSÁRIAS:
 * - Sistema de reações: POST/DELETE /api/posts/:id/like
 * - Sistema de comentários: GET/POST /api/posts/:id/comments
 * - Compartilhamento interno/externo
 * - Relatórios e moderação
 * - Sistema de salvos/favoritos
 * 
 * TODO: Implementar integração com APIs de reação
 * TODO: Adicionar sistema de compartilhamento completo
 * TODO: Implementar cache local de interações
 * TODO: Adicionar suporte a posts com imagens/mídias
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Button,
  SxProps,
  Theme,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '../../types';
import CommentSection from './CommentSection';
import CommentsModal from './CommentsModal';
import CommentItem from '../Comments/CommentItem';

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

/**
 * Props do componente PostCard
 * 
 * @interface PostCardProps
 * @param {Post} post - Dados completos da postagem
 * @param {function} onUpdate - Callback para atualizar dados do post no componente pai
 * @param {SxProps<Theme>} sx - Estilos customizados opcionais
 */


export interface PostCardProps {
  post: Post;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  onUpdate: (updatedPost: Post) => void;
  onLike: () => void;
  onDislike: () => void;
  onLikeComment?: (commentId: number) => void;
  onDislikeComment?: (commentId: number) => void;
  sx?: SxProps<Theme>; // Adicione esta propriedade
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

/**
 * Componente PostCard - Card de exibição postagem
 * 
 * Renderiza uma postagem completa com todas as funcionalidades de interação.
 * Gerencia estado local das reações e sincroniza com o backend.
 * 
 * @param {PostCardProps} props - Props do componente
 * @returns {JSX.Element} Card da postagem com todas as interações
 */
const PostCard: React.FC<PostCardProps> = ({ post, setPosts, onUpdate, sx, onLikeComment, onDislikeComment }) => {
  // =============================================================================
  // ESTADO LOCAL
  // =============================================================================
  
  /**
   * Estado para controle do menu de opções
   */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  /**
   * Reação atual do usuário (like, dislike ou null)
   * TODO: Carregar do backend baseado no usuário logado
   */
  const [userReaction, setUserReaction] = useState<string | null>(null);
  
  /**
   * Contadores locais das interações
   * Sincronizados com o backend mas mantidos localmente para responsividade
   */
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [dislikeCount, setDislikeCount] = useState(post.dislike_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  
  /**
   * Estado de exibição dos comentários
   */
  const [showComments, setShowComments] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // =============================================================================
  // HANDLERS DE EVENTOS
  // =============================================================================

  /**
   * Abre o menu de opções do post
   * 
   * @param {React.MouseEvent<HTMLElement>} event - Evento do clique
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Fecha o menu de opções do post
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Gerencia ação de curtir/descurtir post
   * 
   * LÓGICA:
   * - Se já curtiu: remove a curtida
   * - Se já deu dislike: remove dislike e adiciona curtida
   * - Se neutro: adiciona curtida
   * 
   * TODO: Integrar com endpoint POST/DELETE /api/posts/:postId/reactions
   * TODO: Adicionar tratamento de erro e fallback
   * TODO: Implementar debounce para evitar spam de cliques
   */
  const handleLike = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Curtir/descurtir post
    // Endpoint sugerido: POST /api/posts/:postId/like ou DELETE /api/posts/:postId/like
    if (userReaction === 'like') {
      // Remove curtida existente
      setUserReaction(null);
      setLikeCount(prev => prev - 1);
    } else {
      // Remove dislike se existir
      if (userReaction === 'dislike') {
        setDislikeCount(prev => prev - 1);
      }
      // Adiciona curtida
      setUserReaction('like');
      setLikeCount(prev => prev + 1);
    }
    
    // TODO: Sincronizar com backend
    // TODO: Atualizar cache local
    // TODO: Emitir evento para analytics
  };

  /**
   * Gerencia ação de dar dislike/remover dislike do post
   * 
   * LÓGICA SIMILAR AO handleLike mas para dislikes
   * 
   * TODO: Integrar com endpoint POST/DELETE /api/posts/:postId/reactions
   * TODO: Considerar se dislike deve ser público ou privado
   */
  const handleDislike = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Dar dislike/remover dislike do post
    // Endpoint sugerido: POST /api/posts/:postId/dislike ou DELETE /api/posts/:postId/dislike
    if (userReaction === 'dislike') {
      // Remove dislike existente
      setUserReaction(null);
      setDislikeCount(prev => prev - 1);
    } else {
      // Remove curtida se existir
      if (userReaction === 'like') {
        setLikeCount(prev => prev - 1);
      }
      // Adiciona dislike
      setUserReaction('dislike');
      setDislikeCount(prev => prev + 1);
    }
    
    // TODO: Sincronizar com backend
    // TODO: Implementar feedback visual suave
  };

  /**
   * Alterna exibição da seção de comentários inline
   */
  const handleComment = () => {
    setShowComments(!showComments);
  };

  /**
   * Abre modal expandido de comentários
   * Útil para visualização completa com muitos comentários
   */
  const handleOpenCommentsModal = () => {
    setShowCommentsModal(true);
  };

  /**
   * Callback para atualizar contador de comentários
   * Chamado pelos componentes filhos quando comentários são adicionados/removidos
   * 
   * @param {number} count - Novo número de comentários
   */
  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
    
    // TODO: Sincronizar com estado global se necessário
    // TODO: Atualizar cache de posts
  };

  /**
   * Gerencia funcionalidade de compartilhamento
   * 
   * TODO: Implementar compartilhamento interno (repost na timeline)
   * TODO: Implementar compartilhamento externo (redes sociais, link)
   * TODO: Adicionar analytics de compartilhamento
   */
  const handleShare = () => {
    // TODO: IMPLEMENTAR FUNCIONALIDADE DE COMPARTILHAMENTO
    // Opções:
    // 1. Compartilhamento interno (repost na própria timeline)
    // 2. Compartilhamento externo (copiar link, redes sociais)
    // 3. Compartilhamento privado (enviar por mensagem direta)
    
    console.log('Compartilhar post:', post.post_id);
    
    // TODO: Abrir modal com opções de compartilhamento
    // TODO: Implementar API endpoints para cada tipo de compartilhamento
  };

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  /**
   * Formata data de criação do post para exibição amigável
   * 
   * @param {string} dateString - Data em formato ISO string
   * @returns {string} Data formatada ("há X minutos", "há X horas", etc.)
   */
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'há alguns momentos';
    }
  };

  // =============================================================================
  // RENDERIZAÇÃO
  // =============================================================================

  return (
    <Card 
      sx={{ 
        width: '110%',
        position: 'relative',
        zIndex: 1,
        ...sx,
        mb: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 3,
        },
      }}
    >
      {/* =============================================================================
          HEADER DO POST - Avatar, nome, data e menu
          ============================================================================= */}
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          {/* Avatar do usuário */}
          <Avatar
            src={post.profile_photo || undefined}
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            aria-label={`Perfil de ${post.username}`}
            // TODO: Adicionar onClick para navegar ao perfil
          >
            {!post.profile_photo && <PersonIcon />}
          </Avatar>
          
          {/* Informações do usuário e post */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {/* Nome de usuário clicável */}
              <Typography 
                variant="subtitle1" 
                fontWeight={600}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
                // TODO: Adicionar onClick para navegar ao perfil
              >
                @{post.username}
              </Typography>
              
              {/* Badge do tipo de post (se for imagem) */}
              {post.post_type === 'imagem' && (
                <Chip 
                  label="Imagem" 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.75rem' }}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {/* TODO: Adicionar outros tipos de badge (vídeo, link, etc.) */}
            </Box>
            
            {/* Data de criação */}
            <Typography variant="body2" color="text.secondary">
              {formatDate(post.created_at)}
            </Typography>
          </Box>

          {/* Menu de opções */}
          <IconButton
            aria-label="mais opções"
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* =============================================================================
            CONTEÚDO DO POST
            ============================================================================= */}
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap', // Preserva quebras de linha
            wordBreak: 'break-word', // Quebra palavras longas
            fontSize: '1rem',
            color: 'text.primary',
          }}
        >
          {post.content}
          {/* TODO: Implementar processamento de hashtags e mentions */}
          {/* TODO: Adicionar suporte a links clicáveis */}
          {/* TODO: Implementar expansão/colapso para posts longos */}
        </Typography>
      </CardContent>

      {/* =============================================================================
          SEÇÃO DE CONTADORES
          ============================================================================= */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {/* Contador de curtidas */}
          <Typography variant="body2" color="text.secondary">
            <strong>{likeCount}</strong> curtidas
          </Typography>
          
          {/* Contador de descurtidas */}
          <Typography variant="body2" color="text.secondary">
            <strong>{dislikeCount}</strong> descurtidas
          </Typography>
          
          {/* Contador de comentários (clicável se houver comentários) */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              cursor: commentCount > 0 ? 'pointer' : 'default',
              '&:hover': commentCount > 0 ? { color: 'primary.main' } : {},
            }}
            onClick={commentCount > 0 ? handleOpenCommentsModal : undefined}
          >
            <strong>{commentCount}</strong> comentários
          </Typography>
          
          {/* TODO: Adicionar contador de compartilhamentos */}
          {/* TODO: Adicionar contador de visualizações */}
        </Box>
      </Box>

      <Divider />

      {/* =============================================================================
          AÇÕES PRINCIPAIS DO POST
          ============================================================================= */}
      <CardActions sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', width: '100%' }}>
          {/* Botão de curtir */}
          <Button
            startIcon={<ThumbUpIcon />}
            onClick={handleLike}
            variant={userReaction === 'like' ? 'contained' : 'text'}
            color="primary"
            size="small"
            sx={{ 
              minWidth: 'auto',
              px: 1.5,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Curtir
          </Button>
          
          {/* Botão de descurtir */}
          <Button
            startIcon={<ThumbDownIcon />}
            onClick={handleDislike}
            variant={userReaction === 'dislike' ? 'contained' : 'text'}
            color="error"
            size="small"
            sx={{ 
              minWidth: 'auto',
              px: 1.5,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Descurtir
          </Button>
          
          {/* Botão de comentar */}
          <Button
            startIcon={<CommentIcon />}
            onClick={handleComment}
            variant={showComments ? 'contained' : 'text'}
            color={showComments ? 'primary' : 'inherit'}
            size="small"
            sx={{ 
              minWidth: 'auto',
              px: 1.5,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {showComments ? 'Ocultar' : 'Comentar'}
          </Button>
          
          {/* Botão "Ver todos" comentários (apenas se houver comentários) */}
          {commentCount > 0 && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={handleOpenCommentsModal}
              sx={{ 
                minWidth: 'auto',
                px: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.875rem',
              }}
            >
              Ver todos ({commentCount})
            </Button>
          )}
          
          {/* Botão de compartilhar */}
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShare}
            variant="text"
            color="inherit"
            size="small"
            sx={{ 
              minWidth: 'auto',
              px: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              marginLeft: 'auto',
            }}
          >
            Compartilhar
          </Button>
        </Box>
      </CardActions>

      {/* =============================================================================
          SEÇÃO DE COMENTÁRIOS INLINE
          ============================================================================= */}
      <CommentSection
        postId={post.post_id}
        isOpen={showComments}
        onCommentCountChange={handleCommentCountChange}
      />

      {/* =============================================================================
          MODAL DE COMENTÁRIOS EXPANDIDO
          ============================================================================= */}
      <CommentsModal
        open={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        post={post}
        onCommentCountChange={handleCommentCountChange}
      />

      {/* =============================================================================
          MENU DE OPÇÕES CONTEXTUAIS
          ============================================================================= */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* TODO: Implementar funcionalidade de salvar posts */}
        <MenuItem onClick={handleMenuClose}>
          Salvar post
        </MenuItem>
        
        {/* TODO: Implementar cópia de link do post */}
        <MenuItem onClick={handleMenuClose}>
          Copiar link
        </MenuItem>
        
        {/* TODO: Implementar sistema de reportes */}
        <MenuItem onClick={handleMenuClose}>
          Reportar
        </MenuItem>
        
        {/* TODO: Adicionar opções condicionais baseadas na propriedade do post */}
        {/* Se for post do próprio usuário: Editar, Excluir */}
        {/* Se for post de outro usuário: Bloquear usuário, Silenciar */}
      </Menu>
    </Card>
  );
};

export default PostCard;

/**
 * =============================================================================
 * MELHORIAS FUTURAS E TODOs
 * =============================================================================
 * 
 * INTEGRAÇÃO BACKEND:
 * - [ ] Implementar sistema completo de reações com API
 * - [ ] Carregar estado inicial das reações do usuário
 * - [ ] Sincronização em tempo real de contadores
 * - [ ] Sistema de cache local para melhor performance
 * 
 * FUNCIONALIDADES DE COMPARTILHAMENTO:
 * - [ ] Compartilhamento interno (repost na timeline)
 * - [ ] Compartilhamento externo (redes sociais, email)
 * - [ ] Compartilhamento privado (mensagem direta)
 * - [ ] Analytics de compartilhamento
 * 
 * PROCESSAMENTO DE CONTEÚDO:
 * - [ ] Detecção e link de hashtags
 * - [ ] Detecção e link de mentions (@usuario)
 * - [ ] Detecção automática de URLs
 * - [ ] Expansão/colapso para posts longos
 * - [ ] Suporte a markdown básico
 * 
 * RECURSOS DE MÍDIA:
 * - [ ] Suporte completo a imagens (upload, preview, galeria)
 * - [ ] Suporte a vídeos
 * - [ ] Suporte a links com preview
 * - [ ] Suporte a polls/enquetes
 * 
 * UX/UI MELHORIAS:
 * - [ ] Animações suaves para todas as interações
 * - [ ] Feedback tátil no mobile
 * - [ ] Gestos de swipe para ações rápidas
 * - [ ] Modo escuro otimizado
 * - [ ] Acessibilidade completa (screen readers, keyboard navigation)
 * 
 * PERFORMANCE:
 * - [ ] Lazy loading de imagens
 * - [ ] Virtualização para listas longas de posts
 * - [ ] Debounce para ações de reação
 * - [ ] Cache inteligente de dados
 * 
 * MODERAÇÃO E SEGURANÇA:
 * - [ ] Sistema completo de reports
 * - [ ] Filtros de conteúdo sensível
 * - [ ] Bloqueio e silenciamento de usuários
 * - [ ] Prevenção de spam
 */