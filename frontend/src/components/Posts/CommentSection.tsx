import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Comment, CreateCommentForm } from '../../types';
import { commentService } from '../../services/commentService';

interface CommentSectionProps {
  postId: number;
  isOpen: boolean;
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

  const maxDepth = 3; // Limitar aninhamento para evitar problemas de UI

  return (
    <Box
      sx={{
        ml: depth > 0 ? 3 : 0,
        borderLeft: depth > 0 ? '2px solid' : 'none',
        borderColor: depth > 0 ? 'grey.300' : 'transparent',
        pl: depth > 0 ? 2 : 0,
        py: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar
          src={comment.profile_photo || undefined}
          sx={{ width: 32, height: 32 }}
        >
          {!comment.profile_photo && <PersonIcon fontSize="small" />}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              mb: 1,
            }}
          >
            {comment.content}
          </Typography>
          
          {onReply && depth < maxDepth && (
            <Button
              size="small"
              startIcon={<ReplyIcon fontSize="small" />}
              onClick={() => comment.comment_id && onReply(comment.comment_id)} // Verifica se `comment_id` existe
            >
              Responder
            </Button>
          )}
          
          {/* Respostas */}
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowReplies(!showReplies)}
                sx={{ 
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                {showReplies ? 'Ocultar' : 'Mostrar'} {comment.replies.length} resposta{comment.replies.length !== 1 ? 's' : ''}
              </Button>
              
              <Collapse in={showReplies}>
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
              </Collapse>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  isOpen, 
  onCommentCountChange 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar comentários quando a seção é aberta
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await commentService.getPostComments(postId);
      setComments(fetchedComments);
      
      // Contar total de comentários (incluindo respostas)
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
        post_id: replyingTo ? undefined : postId,
        parent_comment_id: replyingTo || undefined,
      };

      const createdComment = await commentService.createComment(commentData);
      
      // Se é uma resposta, inserir na hierarquia apropriada
      if (replyingTo) {
        setComments(prevComments => 
          insertReplyInHierarchy(prevComments, replyingTo, createdComment)
        );
      } else {
        // Se é um comentário raiz, adicionar ao final
        setComments(prevComments => [...prevComments, createdComment]);
      }
      
      // Atualizar contador
      const totalCount = countAllComments(comments) + 1;
      onCommentCountChange?.(totalCount);
      
      // Limpar formulário
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      setError('Erro ao enviar comentário. Tente novamente.');
      console.error('Erro ao enviar comentário:', err);
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
          replies: [...(comment.replies || []), newReply],
        };
      } else if (comment.replies) {
        return {
          ...comment,
          replies: insertReplyInHierarchy(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
    setNewComment('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  if (!isOpen) return null;

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
        Comentários
      </Typography>

      {/* Formulário de comentário */}
      <Box sx={{ mb: 3 }}>
        {replyingTo && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Respondendo a um comentário
            </Typography>
            <Button size="small" onClick={cancelReply}>
              Cancelar resposta
            </Button>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={replyingTo ? 'Escreva sua resposta...' : 'Escreva um comentário...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            inputProps={{
              maxLength: 1000,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:focus-within': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              },
            }}
          />
          
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            sx={{ 
              minWidth: 'auto',
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Enviar'}
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {newComment.length}/1000 caracteres
        </Typography>
      </Box>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Lista de comentários */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Seja o primeiro a comentar nesta postagem!
          </Typography>
        </Box>
      ) : (
        <Box>
          {comments.map((comment) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              onReply={handleReply}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;