import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Group as GroupIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { Group } from '../types';

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
      id={`groups-tabpanel-${index}`}
      aria-labelledby={`groups-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const GroupsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Mock data - será substituído por chamadas à API
  useEffect(() => {
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Buscar todos os grupos
    // Endpoint sugerido: GET /api/groups?limit=20&offset=0
    const mockAllGroups: Group[] = [
      {
        group_id: 1, // TODO: BACKEND - ID real do grupo
        group_name: 'Desenvolvedores React', // TODO: BACKEND - Nome real do grupo
        description: 'Comunidade para discussões sobre React, hooks, performance e boas práticas.', // TODO: BACKEND - Descrição real
        created_at: '2024-01-15T10:00:00Z', // TODO: BACKEND - Data real de criação
        updated_at: '2024-12-19T10:00:00Z', // TODO: BACKEND - Data real de atualização
        member_count: 1247, // TODO: BACKEND - Contagem real de membros
        admin_count: 5, // TODO: BACKEND - Contagem real de admins
        user_role: 'member', // TODO: BACKEND - Papel real do usuário no grupo (vem do JOIN)
      },
      {
        group_id: 2, // TODO: BACKEND - ID real do grupo
        group_name: 'Design & UX', // TODO: BACKEND - Nome real do grupo
        description: 'Espaço para designers compartilharem ideias, tendências e feedback.', // TODO: BACKEND - Descrição real
        created_at: '2024-02-01T10:00:00Z', // TODO: BACKEND - Data real de criação
        updated_at: '2024-12-19T10:00:00Z', // TODO: BACKEND - Data real de atualização
        member_count: 892, // TODO: BACKEND - Contagem real de membros
        admin_count: 3, // TODO: BACKEND - Contagem real de admins
      },
      {
        group_id: 3, // TODO: BACKEND - ID real do grupo
        group_name: 'Tecnologia & Sociedade', // TODO: BACKEND - Nome real do grupo
        description: 'Discussões sobre o impacto da tecnologia na sociedade moderna.', // TODO: BACKEND - Descrição real
        created_at: '2024-01-20T10:00:00Z', // TODO: BACKEND - Data real de criação
        updated_at: '2024-12-19T10:00:00Z', // TODO: BACKEND - Data real de atualização
        member_count: 654, // TODO: BACKEND - Contagem real de membros
        admin_count: 4, // TODO: BACKEND - Contagem real de admins
        user_role: 'admin', // TODO: BACKEND - Papel real do usuário no grupo (vem do JOIN)
      },
    ];

    // TODO: SUBSTITUIR POR LÓGICA DO BACKEND - Filtrar grupos do usuário
    // Endpoint sugerido: GET /api/users/:userId/groups
    const mockMyGroups = mockAllGroups.filter(group => group.user_role);
    
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Buscar grupos populares
    // Endpoint sugerido: GET /api/groups/popular?limit=10
    const mockPopularGroups = [...mockAllGroups].sort((a, b) => (b.member_count || 0) - (a.member_count || 0));

    // TODO: REMOVER SIMULAÇÃO DE CARREGAMENTO - Substituir por loading real das chamadas API
    setTimeout(() => {
      setAllGroups(mockAllGroups);
      setMyGroups(mockMyGroups);
      setPopularGroups(mockPopularGroups);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && newGroupDescription.trim()) {
      // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Criar novo grupo
      // Endpoint sugerido: POST /api/groups
      // Body: { group_name: string, description: string }
      const newGroup: Group = {
        group_id: Date.now(), // TODO: BACKEND - ID será gerado pelo backend
        group_name: newGroupName, // TODO: BACKEND - Nome vem do formulário
        description: newGroupDescription, // TODO: BACKEND - Descrição vem do formulário
        created_at: new Date().toISOString(), // TODO: BACKEND - Data será gerada pelo backend
        updated_at: new Date().toISOString(), // TODO: BACKEND - Data será gerada pelo backend
        member_count: 1, // TODO: BACKEND - Contagem inicial será 1 (criador)
        admin_count: 1, // TODO: BACKEND - Contagem inicial será 1 (criador)
        user_role: 'admin', // TODO: BACKEND - Criador sempre é admin
      };

      setAllGroups(prev => [newGroup, ...prev]);
      setMyGroups(prev => [newGroup, ...prev]);
      setNewGroupName('');
      setNewGroupDescription('');
      setCreateDialogOpen(false);
    }
  };

  // Filtrar grupos baseado na busca
  const filterGroups = (groups: Group[]) => {
    if (!searchQuery.trim()) return groups;
    
    return groups.filter(group =>
      group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Aplicar filtros aos grupos
  const filteredAllGroups = filterGroups(allGroups);
  const filteredMyGroups = filterGroups(myGroups);
  const filteredPopularGroups = filterGroups(popularGroups);

  const GroupCard = ({ group }: { group: Group }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {group.group_name}
          </Typography>
          {group.user_role === 'admin' && (
            <Chip icon={<AdminIcon />} label="Admin" size="small" color="primary" />
          )}
          {group.user_role === 'member' && (
            <Chip icon={<PeopleIcon />} label="Membro" size="small" color="secondary" />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
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
      </CardContent>
      
      <Box sx={{ p: 2, pt: 0 }}>
        <Button variant={group.user_role ? "outlined" : "contained"} fullWidth>
          {group.user_role ? 'Ver Grupo' : 'Participar'}
        </Button>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ flex: '1 1 350px', minWidth: 300 }}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 150, backgroundColor: 'grey.200', borderRadius: 1 }} />
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          👥 Grupos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Participe de comunidades abertas e conecte-se com pessoas que compartilham seus interesses
        </Typography>
        
        <TextField
          fullWidth
          placeholder="Buscar grupos..."
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

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? 'fullWidth' : 'standard'}>
            <Tab icon={<GroupIcon />} label={`Todos${searchQuery.trim() ? ` (${filteredAllGroups.length})` : ''}`} />
            <Tab icon={<PeopleIcon />} label={`Meus (${searchQuery.trim() ? filteredMyGroups.length : myGroups.length})`} />
            <Tab icon={<TrendingIcon />} label={`Populares${searchQuery.trim() ? ` (${filteredPopularGroups.length})` : ''}`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {filteredAllGroups.length === 0 && searchQuery.trim() ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum grupo encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Não encontramos grupos que correspondam a "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {filteredAllGroups.map((group) => (
                <Box key={group.group_id} sx={{ flex: '1 1 350px', minWidth: 300, maxWidth: 400 }}>
                  <GroupCard group={group} />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {myGroups.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Você ainda não participa de nenhum grupo
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
                Criar Grupo
              </Button>
            </Box>
          ) : filteredMyGroups.length === 0 && searchQuery.trim() ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum dos seus grupos corresponde à busca
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente uma busca diferente ou explore outros grupos
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {filteredMyGroups.map((group) => (
                <Box key={group.group_id} sx={{ flex: '1 1 350px', minWidth: 300, maxWidth: 400 }}>
                  <GroupCard group={group} />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {filteredPopularGroups.length === 0 && searchQuery.trim() ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum grupo popular encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Não encontramos grupos populares que correspondam a "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {filteredPopularGroups.map((group) => (
                <Box key={group.group_id} sx={{ flex: '1 1 350px', minWidth: 300, maxWidth: 400 }}>
                  <GroupCard group={group} />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>
      </Card>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Novo Grupo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Grupo"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateGroup} variant="contained" disabled={!newGroupName.trim() || !newGroupDescription.trim()}>
            Criar Grupo
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupsPage; 