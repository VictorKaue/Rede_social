import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TrendingSidebar: React.FC = () => {
  const navigate = useNavigate();

  // TODO: SUBSTITUIR POR CHAMADAS AO BACKEND - Buscar dados reais da sidebar
  // Endpoints sugeridos:
  // - GET /api/tags/trending?limit=5 (tags em alta)
  // - GET /api/users/active?limit=3 (usuários ativos)
  
  const trendingTags = [
    { name: 'ReactJS', count: 1247 }, // TODO: BACKEND - Dados reais das tags em alta
    { name: 'JavaScript', count: 892 }, // TODO: BACKEND - Dados reais das tags em alta
    { name: 'OpenSource', count: 654 }, // TODO: BACKEND - Dados reais das tags em alta
    { name: 'WebDev', count: 543 }, // TODO: BACKEND - Dados reais das tags em alta
    { name: 'TechTalk', count: 432 }, // TODO: BACKEND - Dados reais das tags em alta
  ];

  const activeUsers = [
    { username: 'dev_ana', posts: 15 }, // TODO: BACKEND - Dados reais dos usuários ativos
    { username: 'tech_guru', posts: 12 }, // TODO: BACKEND - Dados reais dos usuários ativos
    { username: 'code_master', posts: 10 }, // TODO: BACKEND - Dados reais dos usuários ativos
  ];

  const handleTagClick = (tagName: string) => {
    // Navegar para a página de exploração com filtro de tags
    navigate(`/explore?tab=tags&search=${encodeURIComponent(tagName)}`);
  };

  const handleUserClick = (username: string) => {
    // Navegar para o perfil do usuário
    navigate(`/profile/${username}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 3 }}>
      {/* Tags em alta */}
      <Card>
        <CardContent sx={{ pl: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            🔥 Tags em Alta
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: 1 }}>
            {trendingTags.map((tag) => (
              <Chip
                key={tag.name}
                label={`#${tag.name} (${tag.count})`}
                size="small"
                clickable
                onClick={() => handleTagClick(tag.name)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Usuários ativos */}
      <Card>
        <CardContent sx={{ pl: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            👥 Usuários Ativos
          </Typography>
          <List dense sx={{ pl: 1 }}>
            {activeUsers.map((user, index) => (
              <React.Fragment key={user.username}>
                <ListItem 
                  sx={{ 
                    px: 0, 
                    pl: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                    },
                  }}
                  onClick={() => handleUserClick(user.username)}
                >
                  <ListItemText
                    primary={`@${user.username}`}
                    secondary={`${user.posts} postagens hoje`}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.9rem',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem',
                    }}
                  />
                </ListItem>
                {index < activeUsers.length - 1 && <Divider sx={{ ml: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>


    </Box>
  );
};

export default TrendingSidebar; 