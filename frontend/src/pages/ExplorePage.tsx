import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
  Tag as TagIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { User, Post, Tag, Group } from '../types';
import PostCard from '../components/Posts/PostCard';
import exploreService from '../services/exploreService';
import { useLocation, useNavigate } from 'react-router-dom';

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
      id={`explore-tabpanel-${index}`}
      aria-labelledby={`explore-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3, px: 3 }}>{children}</Box>}
    </div>
  );
}

const ExplorePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [activeGroups, setActiveGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
  const [followingTags, setFollowingTags] = useState<Set<number>>(new Set());
  const [joinedGroups, setJoinedGroups] = useState<Set<number>>(new Set());
  const [tagSearchFilter, setTagSearchFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadExploreData = useCallback(async () => {
    setLoading(true);
    try {
      const [posts, users, tags, groups] = await Promise.all([
        exploreService.getTrendingPosts(),
        exploreService.getSuggestedUsers(),
        exploreService.getPopularTags(),
        exploreService.getActiveGroups(),
      ]);

      setTrendingPosts(posts);
      setSuggestedUsers(users);
      setPopularTags(tags);
      setActiveGroups(groups);
    } catch (error) {
      showSnackbar('Erro ao carregar dados de exploração', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExploreData();
  }, [loadExploreData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadExploreData();
      showSnackbar('Dados atualizados com sucesso', 'success');
    } catch (error) {
      showSnackbar('Erro ao atualizar dados', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Atualizar URL com o parâmetro da tab
    const tabNames = ['trending', 'users', 'tags', 'groups'];
    const tabName = tabNames[newValue];
    navigate(`/explore?tab=${tabName}`, { replace: true });
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setTrendingPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === updatedPost.post_id ? updatedPost : post
      )
    );
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await exploreService.search(searchQuery);
      // Aqui você pode implementar uma página de resultados ou modal
      console.log('Resultados da busca:', results);
      showSnackbar(`Encontrados ${results.total} resultados para "${searchQuery}"`, 'info');
    } catch (error) {
      showSnackbar('Erro ao realizar busca', 'error');
    }
  };

  const handleFollowUser = async (userId: number) => {
    try {
      if (followingUsers.has(userId)) {
        await exploreService.unfollowUser(userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        showSnackbar('Usuário removido dos seguidos', 'success');
      } else {
        await exploreService.followUser(userId);
        setFollowingUsers(prev => new Set(prev).add(userId));
        showSnackbar('Usuário seguido com sucesso', 'success');
      }
    } catch (error) {
      showSnackbar('Erro ao seguir/deixar de seguir usuário', 'error');
    }
  };

  const handleFollowTag = async (tagId: number) => {
    try {
      if (followingTags.has(tagId)) {
        await exploreService.unfollowTag(tagId);
        setFollowingTags(prev => {
          const newSet = new Set(prev);
          newSet.delete(tagId);
          return newSet;
        });
        showSnackbar('Tag removida dos seguidos', 'success');
      } else {
        await exploreService.followTag(tagId);
        setFollowingTags(prev => new Set(prev).add(tagId));
        showSnackbar('Tag seguida com sucesso', 'success');
      }
    } catch (error) {
      showSnackbar('Erro ao seguir/deixar de seguir tag', 'error');
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      if (joinedGroups.has(groupId)) {
        await exploreService.leaveGroup(groupId);
        setJoinedGroups(prev => {
          const newSet = new Set(prev);
          newSet.delete(groupId);
          return newSet;
        });
        showSnackbar('Você saiu do grupo', 'success');
      } else {
        await exploreService.joinGroup(groupId);
        setJoinedGroups(prev => new Set(prev).add(groupId));
        showSnackbar('Você entrou no grupo', 'success');
      }
    } catch (error) {
      showSnackbar('Erro ao entrar/sair do grupo', 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Função para obter o valor da tab a partir da URL
  const getTabFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const searchFilter = searchParams.get('search');
    
    // Definir filtro de busca se existir
    if (searchFilter) {
      setTagSearchFilter(searchFilter);
    }
    
    switch (tab) {
      case 'trending':
        return 0;
      case 'users':
        return 1;
      case 'tags':
        return 2;
      case 'groups':
        return 3;
      default:
        return 0;
    }
  }, [location.search]);

  // Atualizar tab quando a URL mudar
  useEffect(() => {
    const newTabValue = getTabFromUrl();
    setTabValue(newTabValue);
  }, [getTabFromUrl]);

  // Filtrar tags baseado na busca
  const getFilteredTags = () => {
    if (!tagSearchFilter) return popularTags;
    
    return popularTags.filter(tag => 
      tag.tag_name.toLowerCase().includes(tagSearchFilter.toLowerCase())
    );
  };

  const handleTagClick = (tagName: string) => {
    // Navegar para busca específica da tag
    navigate(`/search?q=${encodeURIComponent('#' + tagName)}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ height: 56, backgroundColor: 'grey.200', borderRadius: 1, mb: 2 }} />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 120, backgroundColor: 'grey.200', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header com busca */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={600}>
            🔍 Explorar
          </Typography>
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            title="Atualizar dados"
          >
            <RefreshIcon sx={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }} />
          </IconButton>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Descubra novos usuários, conteúdos e comunidades em nossa rede aberta
        </Typography>
        
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder="Buscar usuários, posts, tags ou grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600 }}
          />
        </Box>
      </Box>

      {/* Tabs de conteúdo */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? 'fullWidth' : 'standard'}
            aria-label="tabs de exploração"
          >
            <Tab icon={<TrendingIcon />} label="Em Alta" />
            <Tab icon={<PersonIcon />} label="Usuários" />
            <Tab icon={<TagIcon />} label="Tags" />
            <Tab icon={<GroupIcon />} label="Grupos" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Posts em alta */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
              Posts em Destaque
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Conteúdos com maior engajamento da comunidade
            </Typography>
            
            {trendingPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Nenhum post em destaque no momento
                </Typography>
              </Box>
            ) : (
              trendingPosts.map((post) => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  setPosts={() => {}} // Função vazia, se não for necessário
                  onLike={() => console.log('Like acionado')} // Substitua por lógica real, se necessário
                  onDislike={() => console.log('Dislike acionado')} // Substitua por lógica real, se necessário
                  sx={{ mb: 2 }}
                />
              ))
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Usuários sugeridos */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              👥 Usuários Sugeridos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Conecte-se com pessoas interessantes da nossa comunidade
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {suggestedUsers.map((user) => (
                <Box key={user.user_id} sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 350 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar
                          src={user.profile_photo || undefined}
                          sx={{ width: 64, height: 64, mb: 2 }}
                        >
                          {!user.profile_photo && <PersonIcon />}
                        </Avatar>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            @{user.username}
                          </Typography>
                          {user.is_verified && (
                            <VerifiedIcon color="primary" sx={{ fontSize: 20, ml: 0.5 }} />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                          {user.bio}
                        </Typography>
                        
                        {user.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {user.location}
                            </Typography>
                          </Box>
                        )}
                        
                        <Button 
                          variant={followingUsers.has(user.user_id) ? "outlined" : "contained"} 
                          size="small" 
                          fullWidth
                          onClick={() => handleFollowUser(user.user_id)}
                        >
                          {followingUsers.has(user.user_id) ? 'Seguindo' : 'Seguir'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Tags populares */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              🏷️ Tags Populares
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tópicos mais discutidos na comunidade
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {getFilteredTags().map((tag) => (
                <Box key={tag.tag_id} sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 350 }}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { elevation: 4 },
                      border: tagSearchFilter && tag.tag_name.toLowerCase().includes(tagSearchFilter.toLowerCase()) 
                        ? '2px solid' 
                        : 'none',
                      borderColor: 'primary.main',
                    }}
                    onClick={() => handleTagClick(tag.tag_name)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{
                              color: tagSearchFilter && tag.tag_name.toLowerCase().includes(tagSearchFilter.toLowerCase())
                                ? 'primary.main'
                                : 'inherit'
                            }}
                          >
                            #{tag.tag_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tag.user_count} usuários
                          </Typography>
                        </Box>
                        <Chip 
                          label={followingTags.has(tag.tag_id) ? "Seguindo" : "Seguir"} 
                          size="small" 
                          clickable 
                          variant={followingTags.has(tag.tag_id) ? "filled" : "outlined"}
                          color={followingTags.has(tag.tag_id) ? "primary" : "default"}
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que o clique no chip acione o clique do card
                            handleFollowTag(tag.tag_id);
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Mostrar mensagem se não houver tags filtradas */}
            {tagSearchFilter && getFilteredTags().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Nenhuma tag encontrada para "{tagSearchFilter}"
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setTagSearchFilter('');
                    navigate('/explore?tab=tags');
                  }}
                >
                  Ver todas as tags
                </Button>
              </Box>
            )}

            {/* Mostrar indicador de filtro ativo */}
            {tagSearchFilter && getFilteredTags().length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'primary.contrastText' }}>
                  Mostrando tags relacionadas a "{tagSearchFilter}" 
                  <Button 
                    size="small" 
                    sx={{ ml: 1, color: 'primary.contrastText' }}
                    onClick={() => {
                      setTagSearchFilter('');
                      navigate('/explore?tab=tags');
                    }}
                  >
                    Limpar filtro
                  </Button>
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Grupos ativos */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              👥 Grupos Ativos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comunidades com discussões ativas e engajadas
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {activeGroups.map((group) => (
                <Box key={group.group_id} sx={{ flex: '1 1 400px', minWidth: 350 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {group.group_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {group.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {group.member_count} membros
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {group.admin_count} admins
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant={joinedGroups.has(group.group_id) ? "outlined" : "outlined"} 
                        size="small" 
                        fullWidth
                        color={joinedGroups.has(group.group_id) ? "error" : "primary"}
                        onClick={() => handleJoinGroup(group.group_id)}
                      >
                        {joinedGroups.has(group.group_id) ? 'Sair' : 'Participar'}
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </TabPanel>
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

export default ExplorePage;