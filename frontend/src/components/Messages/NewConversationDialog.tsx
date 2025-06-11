import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { User } from '../../types';

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  open,
  onClose,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Resetar estado quando o diálogo é fechado
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setUsers([]);
      setSearchPerformed(false);
    }
  }, [open]);

  // Buscar usuários quando o searchQuery muda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery.trim());
      } else {
        setUsers([]);
        setSearchPerformed(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Buscar usuários
      // Endpoint sugerido: GET /api/users/search?q={query}
      
      // Mock de usuários para demonstração
      const mockUsers: User[] = [
        {
          user_id: 2,
          username: 'maria_tech',
          email: 'maria@example.com',
          birth_date: '1995-03-15',
          profile_photo: null,
          bio: 'Desenvolvedora Full Stack especializada em React e Node.js',
          location: 'São Paulo, SP',
          website: 'https://maria-tech.dev',
          is_verified: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-12-19T15:30:00Z',
        },
        {
          user_id: 3,
          username: 'dev_carlos',
          email: 'carlos@example.com',
          birth_date: '1992-08-22',
          profile_photo: null,
          bio: 'Backend Developer • Node.js • Python • AWS',
          location: 'Rio de Janeiro, RJ',
          website: undefined,
          is_verified: false,
          created_at: '2024-02-10T14:20:00Z',
          updated_at: '2024-12-19T14:15:00Z',
        },
        {
          user_id: 4,
          username: 'ana_designer',
          email: 'ana@example.com',
          birth_date: '1998-11-30',
          profile_photo: null,
          bio: 'UI/UX Designer • Figma • Adobe XD • Design Systems',
          location: 'Belo Horizonte, MG',
          website: 'https://ana-designer.portfolio.com',
          is_verified: false,
          created_at: '2024-03-05T09:45:00Z',
          updated_at: '2024-12-19T13:45:00Z',
        },
        {
          user_id: 5,
          username: 'joao_frontend',
          email: 'joao@example.com',
          birth_date: '1994-06-12',
          profile_photo: null,
          bio: 'Frontend Engineer • React • TypeScript • Next.js',
          location: 'Brasília, DF',
          website: undefined,
          is_verified: true,
          created_at: '2024-01-28T16:15:00Z',
          updated_at: '2024-12-19T12:30:00Z',
        },
      ];

      // Filtrar usuários baseado na busca
      const filteredUsers = mockUsers.filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.bio?.toLowerCase().includes(query.toLowerCase()) ||
        user.location?.toLowerCase().includes(query.toLowerCase())
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 400,
        },
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Typography variant="h6" fontWeight={600}>
          💬 Nova Conversa
        </Typography>
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Buscar usuários pelo nome, bio ou localização..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        <Box sx={{ minHeight: 250 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {!loading && searchQuery.length > 0 && searchQuery.length < 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Digite pelo menos 2 caracteres para buscar usuários
              </Typography>
            </Box>
          )}

          {!loading && searchPerformed && users.length === 0 && searchQuery.length >= 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Nenhum usuário encontrado para "{searchQuery}"
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Tente buscar por outro termo ou verifique a ortografia
              </Typography>
            </Box>
          )}

          {!loading && users.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {users.length} usuário{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
              </Typography>
              <List sx={{ p: 0 }}>
                {users.map((user) => (
                  <ListItemButton
                    key={user.user_id}
                    onClick={() => handleUserSelect(user)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.light',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={user.profile_photo || undefined}
                        sx={{ bgcolor: 'primary.light' }}
                      >
                        {user.profile_photo ? null : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            @{user.username}
                          </Typography>
                          {user.is_verified && (
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                              ✓ Verificado
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {user.bio && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                              }}
                            >
                              {user.bio}
                            </Typography>
                          )}
                          {user.location && (
                            <Typography variant="caption" color="text.secondary">
                              📍 {user.location}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          {!loading && !searchPerformed && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Encontre alguém para conversar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Digite o nome, bio ou localização de um usuário para começar uma nova conversa
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" fullWidth>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConversationDialog; 