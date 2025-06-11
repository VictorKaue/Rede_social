import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { User, UpdateProfileForm } from '../../types';
import { userService } from '../../services/userService';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  user,
  onUserUpdate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<UpdateProfileForm>({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Inicializar formulário com dados do usuário
  useEffect(() => {
    if (user && open) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
      setProfilePhoto(user.profile_photo || null);
      setError(null);
      setSuccess(false);
    }
  }, [user, open]);

  const handleInputChange = (field: keyof UpdateProfileForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.username?.trim()) {
      setError('Nome de usuário é obrigatório');
      return false;
    }

    if (!formData.email?.trim()) {
      setError('E-mail é obrigatório');
      return false;
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um e-mail válido');
      return false;
    }

    // Validar nome de usuário (sem espaços, caracteres especiais)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Nome de usuário deve conter apenas letras, números e underscore');
      return false;
    }

    // Validar website se fornecido
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        setError('Por favor, insira uma URL válida para o website');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar dados para envio
      const updateData: UpdateProfileForm = {
        ...formData,
        profile_photo: profilePhoto,
      };

      // Chamar serviço para atualizar perfil
      const updatedUser = await userService.updateProfile(user.user_id, updateData);

      setSuccess(true);
      onUserUpdate?.(updatedUser);

      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : 'auto',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" component="div">
          Editar Perfil
        </Typography>
        <IconButton
          aria-label="fechar"
          onClick={handleClose}
          disabled={loading}
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

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Foto de perfil */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profilePhoto || undefined}
                sx={{ width: 100, height: 100 }}
              >
                {!profilePhoto && <PersonIcon sx={{ fontSize: 50 }} />}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                <PhotoCameraIcon />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Clique no ícone da câmera para alterar sua foto de perfil
            </Typography>
          </Box>

          {/* Alertas */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              Perfil atualizado com sucesso!
            </Alert>
          )}

          {/* Campos do formulário */}
          <TextField
            label="Nome de usuário"
            value={formData.username}
            onChange={handleInputChange('username')}
            fullWidth
            required
            disabled={loading}
            helperText="Apenas letras, números e underscore"
          />

          <TextField
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            fullWidth
            required
            disabled={loading}
          />

          <TextField
            label="Bio"
            value={formData.bio}
            onChange={handleInputChange('bio')}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            helperText="Conte um pouco sobre você"
            inputProps={{ maxLength: 200 }}
          />

          <TextField
            label="Localização"
            value={formData.location}
            onChange={handleInputChange('location')}
            fullWidth
            disabled={loading}
            helperText="Cidade, Estado, País"
          />

          <TextField
            label="Website"
            value={formData.website}
            onChange={handleInputChange('website')}
            fullWidth
            disabled={loading}
            helperText="https://seusite.com"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog; 