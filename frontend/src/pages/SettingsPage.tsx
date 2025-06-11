import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // TODO: SUBSTITUIR POR DADOS REAIS DO BACKEND - Dados do usuário atual
  // Endpoint sugerido: GET /api/auth/me
  const [userSettings, setUserSettings] = useState({
    username: 'joao_silva',
    email: 'joao@exemplo.com',
    bio: 'Desenvolvedor apaixonado por tecnologia e inovação.',
    location: 'São Paulo, Brasil',
    website: 'https://joaosilva.dev',
    profile_photo: null as string | null,
    notifications: {
      email_likes: true,
      email_comments: true,
      email_follows: false,
      push_likes: true,
      push_comments: true,
      push_follows: true,
    },
    privacy: {
      profile_public: true,
      show_email: false,
      show_location: true,
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const handleSaveProfile = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Salvar configurações do perfil
    // Endpoint sugerido: PUT /api/users/profile
    console.log('Salvando perfil:', userSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveNotifications = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Salvar configurações de notificações
    // Endpoint sugerido: PUT /api/users/notifications
    console.log('Salvando notificações:', userSettings.notifications);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePrivacy = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Salvar configurações de privacidade
    // Endpoint sugerido: PUT /api/users/privacy
    console.log('Salvando privacidade:', userSettings.privacy);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: IMPLEMENTAR UPLOAD DE FOTO
      // Endpoint sugerido: POST /api/users/photo
      console.log('Upload de foto:', file);
    }
  };

  const handleDeleteAccount = () => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Deletar conta
    // Endpoint sugerido: DELETE /api/users/account
    console.log('Deletar conta');
    setDeleteDialogOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Configurações
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas preferências e configurações da conta
        </Typography>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configurações salvas com sucesso!
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<PersonIcon />} label="Perfil" />
            <Tab icon={<NotificationsIcon />} label="Notificações" />
            <Tab icon={<SecurityIcon />} label="Privacidade" />
            <Tab icon={<PaletteIcon />} label="Aparência" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informações do Perfil
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={userSettings.profile_photo || undefined}
                sx={{ width: 80, height: 80, mr: 2 }}
              >
                {!userSettings.profile_photo && <PersonIcon sx={{ fontSize: 40 }} />}
              </Avatar>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <IconButton color="primary" component="span">
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Clique para alterar sua foto de perfil
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Nome de usuário"
                value={userSettings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                fullWidth
                helperText="Seu nome de usuário único na plataforma"
              />
              
              <TextField
                label="E-mail"
                type="email"
                value={userSettings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                helperText="Usado para login e notificações"
              />
              
              <TextField
                label="Bio"
                multiline
                rows={3}
                value={userSettings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                fullWidth
                helperText="Conte um pouco sobre você"
              />
              
              <TextField
                label="Localização"
                value={userSettings.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                fullWidth
                helperText="Sua cidade ou região"
              />
              
              <TextField
                label="Website"
                value={userSettings.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                fullWidth
                helperText="Seu site pessoal ou portfólio"
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
              >
                Salvar Perfil
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notificações por E-mail
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Curtidas em posts"
                  secondary="Receber e-mail quando alguém curtir seus posts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.notifications.email_likes}
                    onChange={(e) => handleNotificationChange('email_likes', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Comentários em posts"
                  secondary="Receber e-mail quando alguém comentar em seus posts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.notifications.email_comments}
                    onChange={(e) => handleNotificationChange('email_comments', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Novos seguidores"
                  secondary="Receber e-mail quando alguém começar a te seguir"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.notifications.email_follows}
                    onChange={(e) => handleNotificationChange('email_follows', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Notificações Push
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Curtidas em posts"
                  secondary="Receber notificação push quando alguém curtir seus posts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.notifications.push_likes}
                    onChange={(e) => handleNotificationChange('push_likes', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Comentários em posts"
                  secondary="Receber notificação push quando alguém comentar em seus posts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.notifications.push_comments}
                    onChange={(e) => handleNotificationChange('push_comments', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Novos seguidores"
                  secondary="Receber notificação push quando alguém começar a te seguir"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.notifications.push_follows}
                    onChange={(e) => handleNotificationChange('push_follows', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotifications}
              >
                Salvar Notificações
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configurações de Privacidade
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Perfil público"
                  secondary="Permitir que qualquer pessoa veja seu perfil e posts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.privacy.profile_public}
                    onChange={(e) => handlePrivacyChange('profile_public', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Mostrar e-mail"
                  secondary="Exibir seu e-mail no perfil público"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.privacy.show_email}
                    onChange={(e) => handlePrivacyChange('show_email', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Mostrar localização"
                  secondary="Exibir sua localização no perfil público"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={userSettings.privacy.show_location}
                    onChange={(e) => handlePrivacyChange('show_location', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="error">
              Zona de Perigo
            </Typography>
            
            <Card variant="outlined" sx={{ borderColor: 'error.main', bgcolor: 'rgba(244, 67, 54, 0.04)' }}>
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  Deletar conta permanentemente
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Esta ação não pode ser desfeita. Todos os seus dados, posts e conexões serão removidos permanentemente.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Deletar Conta
                </Button>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePrivacy}
              >
                Salvar Privacidade
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Aparência
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configurações de tema e aparência estarão disponíveis em breve.
            </Typography>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Dialog de confirmação para deletar conta */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar exclusão da conta</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja deletar sua conta permanentemente? 
            Esta ação não pode ser desfeita e todos os seus dados serão perdidos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Deletar Conta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage; 