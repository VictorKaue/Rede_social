import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Post, CreatePostForm } from '../../types';

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreatePostForm>({
    content: '',
    post_type: 'texto',
  });
  const [loading, setLoading] = useState(false);

  // Mock user data
  const currentUser = {
    user_id: 1,
    username: 'joao_silva',
    profile_photo: null,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.content.trim()) {
      return;
    }

    setLoading(true);

    // Simular criação de postagem
    setTimeout(() => {
      const newPost: Post = {
        post_id: Date.now(), // Mock ID
        user_id: currentUser.user_id,
        content: formData.content.trim(),
        post_type: formData.post_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        username: currentUser.username,
        profile_photo: currentUser.profile_photo,
        like_count: 0,
        dislike_count: 0,
        comment_count: 0,

      };

      onSubmit(newPost);
      setFormData({ content: '', post_type: 'texto' });
      setLoading(false);
    }, 500);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ content: '', post_type: 'texto' });
      onClose();
    }
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      content: event.target.value,
    }));
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      post_type: event.target.value as 'texto' | 'imagem',
    }));
  };

  const isValid = formData.content.trim().length > 0;
  const characterCount = formData.content.length;
  const maxCharacters = 10000;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            Criar Nova Postagem
          </Typography>
          <IconButton
            aria-label="fechar"
            onClick={handleClose}
            disabled={loading}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {/* Header com avatar do usuário */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={currentUser.profile_photo || undefined}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {!currentUser.profile_photo && <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                @{currentUser.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Compartilhando publicamente
              </Typography>
            </Box>
          </Box>

          {/* Tipo de postagem */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Tipo de Postagem</FormLabel>
            <RadioGroup
              row
              value={formData.post_type}
              onChange={handleTypeChange}
              aria-label="tipo de postagem"
            >
              <FormControlLabel
                value="texto"
                control={<Radio />}
                label="Texto"
              />
              <FormControlLabel
                value="imagem"
                control={<Radio />}
                label="Imagem"
                disabled // Temporariamente desabilitado
              />
            </RadioGroup>
          </FormControl>

          {/* Campo de conteúdo */}
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="O que você está pensando?"
            value={formData.content}
            onChange={handleContentChange}
            disabled={loading}
            inputProps={{
              maxLength: maxCharacters,
              'aria-label': 'conteúdo da postagem',
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

          {/* Contador de caracteres */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Sua postagem será pública e visível para todos os usuários
            </Typography>
            <Typography 
              variant="caption" 
              color={characterCount > maxCharacters * 0.9 ? 'warning.main' : 'text.secondary'}
            >
              {characterCount}/{maxCharacters}
            </Typography>
          </Box>

          {/* Aviso sobre imagens */}
          {formData.post_type === 'imagem' && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'info.light', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'info.main',
              }}
            >
              <Typography variant="body2" color="info.dark">
                📷 Upload de imagens será implementado em breve!
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || loading}
            sx={{
              minWidth: 120,
              fontWeight: 600,
            }}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreatePostDialog; 