import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Comment, CreateCommentForm, Post } from '../../types';
import { commentService } from '../../services/commentService';

interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
  onCommentCountChange?: (count: number) => void;
}

interface CommentItemProps {
  comment: Comment;
  onReply?: (parentId: number) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, depth = 0 }) => {
  const [showReplies, setShowReplies] = useState(true);

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

  const maxDepth = 3;

  return (
    <Box
      sx={{
        ml: depth > 0 ? 3 : 0,
        borderLeft: depth > 0 ? '2px solid' : 'none',
        borderColor: depth > 0 ? 'grey.300' : 'transparent',
        pl: depth > 0 ? 2 : 0,
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          src={comment.profile_photo || undefined}
          sx={{ width: 40, height: 40 }}
        >
          {!comment.profile_photo && <PersonIcon />}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              @{comment.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.created_at)}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              mb: 1.5,
            }}
          >
            {comment.content}
          </Typography>
          
          {onReply && depth < maxDepth && (
            <Button
              size="small"
              variant="text"
              onClick={() => comment.comment_id && onReply(comment.comment_id)} // Verifica se `comment_id` existe
              sx={{ 
                minWidth: 'auto',
                textTransform: 'none',
                fontSize: '0.8rem',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Responder
            </Button>
          )}
          
          {/* Respostas */}
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowReplies(!showReplies)}
                sx={{ 
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                {showReplies ? '▼' : '▶'} {comment.replies.length} resposta{comment.replies.length !== 1 ? 's' : ''}
              </Button>
              
              {showReplies && (
                <Box>
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.comment_id}
                      comment={reply}
                      onReply={onReply}
                      depth={depth + 1}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const CommentsModal: React.FC<CommentsModalProps> = ({ 
  open, 
  onClose, 
  post,
  onCommentCountChange 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar comentários quando o modal é aberto
  useEffect(() => {
    if (open) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post.post_id]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await commentService.getPostComments(post.post_id);
      setComments(fetchedComments);
      
      // Contar total de comentários
      const totalCount = countAllComments(fetchedComments);
      onCommentCountChange?.(totalCount);
    } catch (err) {
      setError('Erro ao carregar comentários. Tente novamente.');
      console.error('Erro ao carregar comentários:', err);
    } finally {
      setLoading(false);
    }
  };

  const countAllComments = (commentList: Comment[]): number => {
    return commentList.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countAllComments(comment.replies) : 0);
    }, 0);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const commentData: CreateCommentForm = {
        content: newComment.trim(),
        post_id: post.post_id,
        parent_comment_id: replyingTo || undefined,
      };

      const newCommentResult = await commentService.createComment(commentData);
      
      if (replyingTo) {
        // Adicionar resposta na hierarquia correta
        setComments(prev => insertReplyInHierarchy(prev, replyingTo, newCommentResult));
      } else {
        // Adicionar comentário raiz
        setComments(prev => [...prev, { ...newCommentResult, replies: [] }]);
      }

      // Limpar formulário
      setNewComment('');
      setReplyingTo(null);
      
      // Atualizar contagem
      const totalCount = countAllComments([...comments, newCommentResult]);
      onCommentCountChange?.(totalCount);
      
    } catch (err) {
      setError('Erro ao enviar comentário. Tente novamente.');
      console.error('Erro ao criar comentário:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const insertReplyInHierarchy = (
    commentList: Comment[], 
    parentId: number, 
    newReply: Comment
  ): Comment[] => {
    return commentList.map(comment => {
      if (comment.comment_id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), { ...newReply, replies: [] }]
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: insertReplyInHierarchy(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
    // Foco no campo de texto seria ideal aqui
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleClose = () => {
    setNewComment('');
    setReplyingTo(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          height: isMobile ? '100vh' : '80vh',
          maxHeight: isMobile ? '100vh' : '80vh',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CommentIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              Comentários
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Post de @{post.username}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="fechar"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Post original */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Avatar
              src={post.profile_photo || undefined}
              sx={{ width: 48, height: 48 }}
            >
              {!post.profile_photo && <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                @{post.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {post.content}
          </Typography>
        </Box>

        {/* Lista de comentários */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : comments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CommentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Seja o primeiro a comentar!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compartilhe seus pensamentos sobre este post.
              </Typography>
            </Box>
          ) : (
            <Box>
              {comments.map((comment, index) => (
                <Box key={comment.comment_id}>
                  <CommentItem
                    comment={comment}
                    onReply={handleReply}
                  />
                  {index < comments.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Formulário de novo comentário */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {replyingTo && (
            <Box sx={{ mb: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Respondendo a comentário
              </Typography>
              <Button
                size="small"
                onClick={cancelReply}
                sx={{ ml: 1, minWidth: 'auto', textTransform: 'none' }}
              >
                Cancelar
              </Button>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <Avatar
              sx={{ width: 32, height: 32 }}
            >
              <PersonIcon />
            </Avatar>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder={replyingTo ? "Escreva sua resposta..." : "Adicione um comentário..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {submitting ? '' : 'Enviar'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsModal;