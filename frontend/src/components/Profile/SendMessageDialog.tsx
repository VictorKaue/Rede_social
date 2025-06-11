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
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { User, SendMessageForm } from '../../types';
import { userService } from '../../services/userService';

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  recipient: User;
  onMessageSent?: () => void;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  open,
  onClose,
  recipient,
  onMessageSent,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Por favor, digite uma mensagem');
      return;
    }

    if (message.length > 1000) {
      setError('A mensagem deve ter no máximo 1000 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const messageData: SendMessageForm = {
        receiver_id: recipient.user_id,
        content: message.trim(),
      };

      await userService.sendMessage(messageData);

      setSuccess(true);
      onMessageSent?.();

      // Limpar formulário e fechar modal após sucesso
      setTimeout(() => {
        setMessage('');
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const isMessageValid = message.trim().length > 0 && message.length <= 1000;

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={recipient.profile_photo || undefined}
            sx={{ width: 40, height: 40 }}
          >
            {!recipient.profile_photo && <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              Enviar mensagem
            </Typography>
            <Typography variant="body2" color="text.secondary">
              para @{recipient.username}
            </Typography>
          </Box>
        </Box>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Informações do destinatário */}
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar
                src={recipient.profile_photo || undefined}
                sx={{ width: 48, height: 48 }}
              >
                {!recipient.profile_photo && <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  @{recipient.username}
                </Typography>
                {recipient.bio && (
                  <Typography variant="body2" color="text.secondary">
                    {recipient.bio}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Alertas */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success">
              Mensagem enviada com sucesso!
            </Alert>
          )}

          {/* Campo de mensagem */}
          <TextField
            label="Sua mensagem"
            value={message}
            onChange={handleMessageChange}
            fullWidth
            multiline
            rows={4}
            disabled={loading}
            placeholder={`Escreva uma mensagem para @${recipient.username}...`}
            inputProps={{ maxLength: 1000 }}
            helperText={`${message.length}/1000 caracteres`}
            error={message.length > 1000}
          />

          {/* Dicas de etiqueta */}
          <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              💡 Dicas para uma boa conversa:
            </Typography>
            <Typography variant="caption" display="block">
              • Seja respeitoso e educado
            </Typography>
            <Typography variant="caption" display="block">
              • Evite spam ou mensagens repetitivas
            </Typography>
            <Typography variant="caption" display="block">
              • Mantenha o foco em conexões genuínas
            </Typography>
          </Box>
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
          disabled={loading || !isMessageValid}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendMessageDialog; 