import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  SxProps,
  Theme,
} from '@mui/material';

interface WelcomeCardProps {
  sx?: SxProps<Theme>;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ sx }) => {
  return (
    <Card 
      sx={{ 
        width: '110%',
        position: 'relative',
        zIndex: 1,
        ...sx,
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' 
      }}
    >
      <CardContent>
        <Box sx={{ color: 'white', textAlign: 'center', py: 2 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            🌟 Bem-vindo à Rede Social Aberta!
          </Typography>
          <Typography variant="body1">
            Uma plataforma transparente onde todos os perfis são públicos e as conexões são livres.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard; 