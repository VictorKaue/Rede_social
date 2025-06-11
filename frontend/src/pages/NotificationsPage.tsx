import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Badge,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(true, 30000); // Auto-refresh a cada 30 segundos

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      showSnackbar('Notificação marcada como lida', 'success');
    } catch (error) {
      showSnackbar('Erro ao marcar notificação como lida', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showSnackbar('Todas as notificações foram marcadas como lidas', 'success');
    } catch (error) {
      showSnackbar('Erro ao marcar todas as notificações como lidas', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      showSnackbar('Notificação removida', 'success');
    } catch (error) {
      showSnackbar('Erro ao remover notificação', 'error');
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      showSnackbar('Notificações atualizadas', 'success');
    } catch (error) {
      showSnackbar('Erro ao atualizar notificações', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <ThumbUpIcon color="primary" />;
      case 'comment':
        return <CommentIcon color="secondary" />;
      case 'follow':
        return <PersonAddIcon color="success" />;
      case 'group_invite':
        return <GroupIcon color="info" />;
      case 'message':
        return <MessageIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

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

  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 0:
        return notifications;
      case 1:
        return notifications.filter(n => !n.is_read);
      case 2:
        return notifications.filter(n => n.is_read);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
            </Badge>
            Notificações
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              title="Atualizar notificações"
            >
              <RefreshIcon sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }} />
            </IconButton>
            
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
                size="small"
              >
                Marcar todas como lidas
              </Button>
            )}
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Acompanhe todas as suas interações e atividades
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Todas (${notifications.length})`} />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Não lidas
                  {unreadCount > 0 && (
                    <Chip size="small" label={unreadCount} color="error" />
                  )}
                </Box>
              } 
            />
            <Tab label={`Lidas (${notifications.length - unreadCount})`} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <NotificationsOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tabValue === 1 ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 1 
                  ? 'Você está em dia com suas notificações!'
                  : 'Quando houver atividade em sua conta, você verá aqui.'
                }
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.notification_id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.notification_id)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={notification.related_user?.profile_photo || undefined}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        {notification.related_user?.profile_photo 
                          ? undefined 
                          : getNotificationIcon(notification.type)
                        }
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={notification.is_read ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          {!notification.is_read && (
                            <Chip size="small" label="Nova" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          {notification.related_post && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: 'block',
                                mt: 0.5,
                                fontStyle: 'italic',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              "{notification.related_post.content}"
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatDate(notification.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {!notification.is_read && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.notification_id);
                          }}
                          title="Marcar como lida"
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.notification_id);
                        }}
                        title="Deletar notificação"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  
                  {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationsPage; 