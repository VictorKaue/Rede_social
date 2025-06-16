import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';

interface Comment {
  comment_id: number;
  content: string;
  username: string;
  created_at: string;
}

interface CommentItemProps {
  comment: Comment;
  onLikeComment?: (commentId: number) => void;
  onDislikeComment?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLikeComment, onDislikeComment }) => {
  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="subtitle2" color="text.primary">
        {comment.username}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {comment.content}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => onLikeComment && onLikeComment(comment.comment_id)}>
          <ThumbUp fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDislikeComment && onDislikeComment(comment.comment_id)}>
          <ThumbDown fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.created_at).toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default CommentItem;