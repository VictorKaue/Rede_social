import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Badge,
  IconButton,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { Message, Conversation, User } from '../types';
import NewConversationDialog from '../components/Messages/NewConversationDialog';

const MessagesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  
  // Armazenar mensagens por conversa
  const [conversationMessages, setConversationMessages] = useState<{ [key: number]: Message[] }>({});

  useEffect(() => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Buscar conversas do usuário
    // Endpoint sugerido: GET /api/users/:userId/conversations
    const mockConversations: Conversation[] = [
      {
        user1_id: 1, // TODO: BACKEND - ID real do usuário atual
        user2_id: 2, // TODO: BACKEND - ID real do outro usuário
        last_message_at: '2024-12-19T15:30:00Z', // TODO: BACKEND - Timestamp real da última mensagem
        message_count: 15, // TODO: BACKEND - Contagem real de mensagens
        read_count: 12, // TODO: BACKEND - Contagem real de mensagens lidas
        unread_count: 3, // TODO: BACKEND - Contagem real de mensagens não lidas
        other_user_id: 2, // TODO: BACKEND - ID do outro usuário (calculado)
        other_username: 'maria_tech', // TODO: BACKEND - Username do outro usuário (vem do JOIN)
        other_photo: null, // TODO: BACKEND - Foto do outro usuário (vem do JOIN)
        last_message_content: 'Ótima ideia! Vamos implementar isso no próximo sprint.', // TODO: BACKEND - Conteúdo da última mensagem
      },
      {
        user1_id: 1, // TODO: BACKEND - ID real do usuário atual
        user2_id: 3, // TODO: BACKEND - ID real do outro usuário
        last_message_at: '2024-12-19T14:15:00Z', // TODO: BACKEND - Timestamp real da última mensagem
        message_count: 8, // TODO: BACKEND - Contagem real de mensagens
        read_count: 8, // TODO: BACKEND - Contagem real de mensagens lidas
        unread_count: 0, // TODO: BACKEND - Contagem real de mensagens não lidas
        other_user_id: 3, // TODO: BACKEND - ID do outro usuário (calculado)
        other_username: 'dev_carlos', // TODO: BACKEND - Username do outro usuário (vem do JOIN)
        other_photo: null, // TODO: BACKEND - Foto do outro usuário (vem do JOIN)
        last_message_content: 'Perfeito! Obrigado pela ajuda com o código.', // TODO: BACKEND - Conteúdo da última mensagem
      },
      {
        user1_id: 1,
        user2_id: 4,
        last_message_at: '2024-12-19T13:45:00Z',
        message_count: 5,
        read_count: 3,
        unread_count: 2,
        other_user_id: 4,
        other_username: 'ana_designer',
        other_photo: null,
        last_message_content: 'Que tal discutirmos sobre o novo layout?',
      },
    ];

    // TODO: SUBSTITUIR POR CHAMADAS AO BACKEND - Buscar mensagens para cada conversa
    // Endpoint sugerido: GET /api/conversations/:conversationId/messages?limit=50
    const mockConversationMessages: { [key: number]: Message[] } = {
      // Conversa com maria_tech (user_id: 2)
      2: [
        {
          message_id: 1,
          sender_id: 2,
          receiver_id: 1,
          content: 'Oi! Vi seu post sobre React. Muito interessante!',
          status: 'read',
          sent_at: '2024-12-19T14:00:00Z',
          sender_username: 'maria_tech',
        },
        {
          message_id: 2,
          sender_id: 1,
          receiver_id: 2,
          content: 'Obrigado! Fico feliz que tenha gostado.',
          status: 'read',
          sent_at: '2024-12-19T14:10:00Z',
          sender_username: 'joao_silva',
        },
        {
          message_id: 3,
          sender_id: 2,
          receiver_id: 1,
          content: 'Podemos conversar sobre uma possível colaboração?',
          status: 'read',
          sent_at: '2024-12-19T14:20:00Z',
          sender_username: 'maria_tech',
        },
        {
          message_id: 4,
          sender_id: 1,
          receiver_id: 2,
          content: 'Claro! Seria ótimo trabalhar juntos.',
          status: 'read',
          sent_at: '2024-12-19T14:25:00Z',
          sender_username: 'joao_silva',
        },
        {
          message_id: 5,
          sender_id: 2,
          receiver_id: 1,
          content: 'Ótima ideia! Vamos implementar isso no próximo sprint.',
          status: 'sent',
          sent_at: '2024-12-19T15:30:00Z',
          sender_username: 'maria_tech',
        },
      ],
      // Conversa com dev_carlos (user_id: 3)
      3: [
        {
          message_id: 6,
          sender_id: 3,
          receiver_id: 1,
          content: 'Você tem alguma experiência com Node.js?',
          status: 'read',
          sent_at: '2024-12-19T13:30:00Z',
          sender_username: 'dev_carlos',
        },
        {
          message_id: 7,
          sender_id: 1,
          receiver_id: 3,
          content: 'Sim, trabalho com Node há uns 2 anos. Posso te ajudar!',
          status: 'read',
          sent_at: '2024-12-19T13:35:00Z',
          sender_username: 'joao_silva',
        },
        {
          message_id: 8,
          sender_id: 3,
          receiver_id: 1,
          content: 'Ótimo! Estou com uma dúvida sobre autenticação JWT.',
          status: 'read',
          sent_at: '2024-12-19T13:40:00Z',
          sender_username: 'dev_carlos',
        },
        {
          message_id: 9,
          sender_id: 1,
          receiver_id: 3,
          content: 'JWT é tranquilo. Você quer implementar refresh tokens também?',
          status: 'read',
          sent_at: '2024-12-19T14:00:00Z',
          sender_username: 'joao_silva',
        },
        {
          message_id: 10,
          sender_id: 3,
          receiver_id: 1,
          content: 'Perfeito! Obrigado pela ajuda com o código.',
          status: 'read',
          sent_at: '2024-12-19T14:15:00Z',
          sender_username: 'dev_carlos',
        },
      ],
      // Conversa com ana_designer (user_id: 4)
      4: [
        {
          message_id: 11,
          sender_id: 4,
          receiver_id: 1,
          content: 'Oi! Gostei muito do seu portfólio.',
          status: 'read',
          sent_at: '2024-12-19T13:00:00Z',
          sender_username: 'ana_designer',
        },
        {
          message_id: 12,
          sender_id: 1,
          receiver_id: 4,
          content: 'Obrigado! Vi que você é designer. Seu trabalho é incrível!',
          status: 'read',
          sent_at: '2024-12-19T13:15:00Z',
          sender_username: 'joao_silva',
        },
        {
          message_id: 13,
          sender_id: 4,
          receiver_id: 1,
          content: 'Que tal discutirmos sobre o novo layout?',
          status: 'sent',
          sent_at: '2024-12-19T13:45:00Z',
          sender_username: 'ana_designer',
        },
      ],
    };

    // TODO: REMOVER SIMULAÇÃO DE CARREGAMENTO - Substituir por loading real das chamadas API
    setTimeout(() => {
      setConversations(mockConversations);
      setConversationMessages(mockConversationMessages);
      setSelectedConversation(mockConversations[0]);
      setMessages(mockConversationMessages[mockConversations[0].other_user_id!] || []);
      setLoading(false);
    }, 1000);
  }, []);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Carregar mensagens da conversa selecionada
    const conversationMessagesData = conversationMessages[conversation.other_user_id!] || [];
    setMessages(conversationMessagesData);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Enviar nova mensagem
      // Endpoint sugerido: POST /api/messages
      // Body: { receiver_id: number, content: string }
      const message: Message = {
        message_id: Date.now(), // TODO: BACKEND - ID será gerado pelo backend
        sender_id: 1, // TODO: BACKEND - ID do usuário atual (vem da autenticação)
        receiver_id: selectedConversation.other_user_id!, // TODO: BACKEND - ID do destinatário
        content: newMessage, // TODO: BACKEND - Conteúdo da mensagem
        status: 'sent', // TODO: BACKEND - Status inicial será 'sent'
        sent_at: new Date().toISOString(), // TODO: BACKEND - Timestamp será gerado pelo backend
        sender_username: 'joao_silva', // TODO: BACKEND - Username do remetente (vem da autenticação)
      };

      // Atualizar mensagens da conversa atual
      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      
      // Atualizar o estado das mensagens por conversa
      setConversationMessages(prev => ({
        ...prev,
        [selectedConversation.other_user_id!]: updatedMessages
      }));

      // Atualizar a última mensagem na lista de conversas
      setConversations(prev => prev.map(conv => 
        conv.other_user_id === selectedConversation.other_user_id 
          ? { ...conv, last_message_content: newMessage, last_message_at: new Date().toISOString() }
          : conv
      ));

      setNewMessage('');
    }
  };

  const handleNewConversation = (user: User) => {
    // Verificar se já existe uma conversa com este usuário
    const existingConversation = conversations.find(conv => conv.other_user_id === user.user_id);
    
    if (existingConversation) {
      // Selecionar a conversa existente
      handleConversationSelect(existingConversation);
      showSnackbar(`Conversa com @${user.username} já existe`, 'info');
    } else {
      // Criar nova conversa
      const newConversation: Conversation = {
        user1_id: 1, // TODO: BACKEND - ID real do usuário logado
        user2_id: user.user_id,
        last_message_at: new Date().toISOString(),
        message_count: 0,
        read_count: 0,
        unread_count: 0,
        other_user_id: user.user_id,
        other_username: user.username,
        other_photo: user.profile_photo,
        last_message_content: undefined,
      };

      // Adicionar nova conversa à lista
      setConversations(prev => [newConversation, ...prev]);
      
      // Inicializar mensagens vazias para a nova conversa
      setConversationMessages(prev => ({
        ...prev,
        [user.user_id]: []
      }));

      // Selecionar a nova conversa
      setSelectedConversation(newConversation);
      setMessages([]);

      showSnackbar(`Nova conversa iniciada com @${user.username}`, 'success');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (dateString: string) => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'agora há pouco';
    } else if (diffInHours < 24) {
      return `há ${Math.floor(diffInHours)} hora${Math.floor(diffInHours) !== 1 ? 's' : ''}`;
    } else {
      return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Filtrar conversas baseado na busca
  const filteredConversations = conversations.filter(conversation =>
    conversation.other_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.last_message_content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, height: 600 }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ height: '100%', backgroundColor: 'grey.200', borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 500px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ height: '100%', backgroundColor: 'grey.200', borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          💬 Mensagens
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Conecte-se diretamente com outros membros da nossa comunidade aberta
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, height: 600 }}>
        {/* Lista de conversas */}
        <Box sx={{ flex: '1 1 350px', minWidth: 300 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                💬 Conversas ({conversations.length})
              </Typography>
              
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <List sx={{ p: 0, maxHeight: 450, overflow: 'auto' }}>
                {filteredConversations.map((conversation) => (
                  <ListItemButton
                    key={conversation.other_user_id}
                    selected={selectedConversation?.other_user_id === conversation.other_user_id}
                    onClick={() => handleConversationSelect(conversation)}
                    sx={{ 
                      borderRadius: 1, 
                      mb: 1,
                      border: selectedConversation?.other_user_id === conversation.other_user_id 
                        ? '2px solid' 
                        : '1px solid transparent',
                      borderColor: selectedConversation?.other_user_id === conversation.other_user_id 
                        ? 'primary.main' 
                        : 'transparent',
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unread_count}
                        color="primary"
                        invisible={conversation.unread_count === 0}
                      >
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            @{conversation.other_username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatLastMessageTime(conversation.last_message_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: conversation.unread_count > 0 ? 600 : 400,
                          }}
                        >
                          {conversation.last_message_content}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
                {filteredConversations.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma conversa encontrada
                    </Typography>
                  </Box>
                )}
              </List>

              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />} 
                sx={{ mt: 2 }}
                onClick={() => setNewConversationDialogOpen(true)}
              >
                Nova Conversa
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Área de chat */}
        <Box sx={{ flex: '1 1 500px' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Header da conversa */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          @{selectedConversation.other_username}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircleIcon sx={{ fontSize: 8, color: 'success.main', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            Online
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedConversation.message_count} mensagens
                      </Typography>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Mensagens */}
                <Box sx={{ flex: 1, p: 2, overflow: 'auto', bgcolor: 'background.default' }}>
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Início da conversa
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Seja o primeiro a enviar uma mensagem para @{selectedConversation.other_username}
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message) => (
                      <Box
                        key={message.message_id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender_id === 1 ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            maxWidth: '70%',
                            backgroundColor: message.sender_id === 1 ? 'primary.main' : 'white',
                            color: message.sender_id === 1 ? 'white' : 'text.primary',
                            borderRadius: 2,
                            boxShadow: message.sender_id === 1 
                              ? '0 2px 8px rgba(25, 118, 210, 0.2)' 
                              : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {message.content}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              mt: 0.5, 
                              opacity: 0.8,
                              textAlign: message.sender_id === 1 ? 'right' : 'left',
                            }}
                          >
                            {formatTime(message.sent_at)}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  )}
                </Box>

                {/* Campo de nova mensagem */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`Enviar mensagem para @${selectedConversation.other_username}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        },
                      }}
                    />
                    <IconButton 
                      color="primary" 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      sx={{
                        bgcolor: newMessage.trim() ? 'primary.main' : 'grey.300',
                        color: 'white',
                        '&:hover': {
                          bgcolor: newMessage.trim() ? 'primary.dark' : 'grey.400',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.300',
                          color: 'grey.500',
                        },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Selecione uma conversa
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Escolha uma conversa da lista para começar a trocar mensagens
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* Diálogo de Nova Conversa */}
      <NewConversationDialog
        open={newConversationDialogOpen}
        onClose={() => setNewConversationDialogOpen(false)}
        onSelectUser={handleNewConversation}
      />

      {/* Snackbar para feedbacks */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MessagesPage; 