/**
 * =============================================================================
 * SEARCH PAGE - PÁGINA DE BUSCA UNIFICADA
 * =============================================================================
 * 
 * Página dedicada à busca unificada em todos os tipos de conteúdo da rede social.
 * Permite pesquisar simultaneamente usuários, posts, grupos e tags com interface tabbed.
 * 
 * CARACTERÍSTICAS:
 * - Busca unificada em múltiplos tipos de entidades
 * - Interface com tabs para filtrar resultados por tipo
 * - Suporte a busca por URL parameters (deep linking)
 * - Renderização otimizada para diferentes tipos de resultado
 * - Interações rápidas (seguir usuários, entrar em grupos)
 * - Estados de loading e vazio bem definidos
 * 
 * INTEGRAÇÕES BACKEND NECESSÁRIAS:
 * - GET /api/search - Busca unificada global
 * - GET /api/search/users - Busca específica de usuários
 * - GET /api/search/posts - Busca específica de posts  
 * - GET /api/search/groups - Busca específica de grupos
 * - GET /api/search/tags - Busca específica de tags
 * - POST /api/users/:id/follow - Seguir usuário
 * - POST /api/groups/:id/join - Entrar em grupo
 * 
 * TODO: Implementar filtros avançados
 * TODO: Adicionar busca por voz
 * TODO: Implementar autocomplete e sugestões
 * TODO: Adicionar histórico de buscas
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Article as ArticleIcon,
  Tag as TagIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { Post, User, Group } from '../types';

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

/**
 * Interface para resultados de busca agrupados por tipo
 * 
 * Organiza os resultados de forma estruturada para facilitar
 * a renderização e contagem por categoria.
 * 
 * @interface SearchResults
 * @param {User[]} users - Usuários encontrados na busca
 * @param {Post[]} posts - Posts que correspondem à busca
 * @param {Group[]} groups - Grupos encontrados
 * @param {string[]} tags - Tags relacionadas ao termo buscado
 */
interface SearchResults {
  users: User[];
  posts: Post[];
  groups: Group[];
  tags: string[];
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

/**
 * SearchPage - Página de busca unificada
 * 
 * Componente principal que gerencia toda a funcionalidade de busca
 * da aplicação, incluindo múltiplos tipos de conteúdo e filtros.
 * 
 * FUNCIONALIDADES:
 * - Busca em tempo real com debounce
 * - Filtros por tipo de conteúdo (tabs)
 * - Deep linking via URL parameters
 * - Interações sociais diretas nos resultados
 * - Estados de loading e vazio bem definidos
 * 
 * TODO: Adicionar debounce na busca para melhor performance
 * TODO: Implementar cache de resultados recentes
 * TODO: Adicionar filtros avançados (data, localização, etc.)
 */
const SearchPage: React.FC = () => {
  // =============================================================================
  // HOOKS E ESTADO
  // =============================================================================

  /**
   * Hook para gerenciar URL search parameters
   * Permite deep linking e compartilhamento de buscas
   */
  const [searchParams, setSearchParams] = useSearchParams();
  
  /**
   * Estado da query de busca
   * Sincronizado com URL parameters para deep linking
   */
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  /**
   * Estado da tab ativa para filtros
   * 0: Todos, 1: Usuários, 2: Posts, 3: Grupos, 4: Tags
   */
  const [tabValue, setTabValue] = useState(0);
  
  /**
   * Estado dos resultados de busca organizados por tipo
   * Estrutura otimizada para renderização e contagem
   */
  const [results, setResults] = useState<SearchResults>({
    users: [],
    posts: [],
    groups: [],
    tags: [],
  });
  
  /**
   * Estado de carregamento para UX de busca
   * Diferenciado por tipo de operação se necessário
   */
  const [loading, setLoading] = useState(false);

  // =============================================================================
  // EFEITOS E SINCRONIZAÇÃO
  // =============================================================================

  /**
   * Efeito para sincronizar busca com URL parameters
   * 
   * Permite que usuários compartilhem links de busca e
   * mantenha consistência entre navegação e estado.
   * 
   * TODO: Implementar throttle para evitar buscas excessivas
   * TODO: Validar e sanitizar query parameters
   */
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  // =============================================================================
  // FUNÇÕES DE BUSCA
  // =============================================================================

  /**
   * Executa busca unificada no backend
   * 
   * Realiza busca simultânea em todos os tipos de conteúdo
   * e organiza resultados para renderização otimizada.
   * 
   * @param {string} query - Termo de busca
   * 
   * ALGORITMO DE BUSCA SUGERIDO (backend):
   * 1. Busca fuzzy em usuários (username, bio, nome real)
   * 2. Busca em posts (conteúdo, hashtags)
   * 3. Busca em grupos (nome, descrição)  
   * 4. Busca em tags (nome da tag)
   * 5. Ranking por relevância e popularidade
   * 
   * TODO: Implementar paginação para resultados numerosos
   * TODO: Adicionar filtros avançados (data, localização, etc.)
   * TODO: Implementar cache de resultados para performance
   * TODO: Adicionar analytics de busca para melhorar algoritmo
   */
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    
    // TODO: SUBSTITUIR POR CHAMADA AO BACKEND - Busca real
    // Endpoint principal: GET /api/search?q={query}&type=all&limit=20
    // Endpoints específicos:
    // - GET /api/search/users?q={query}&limit=10
    // - GET /api/search/posts?q={query}&limit=10  
    // - GET /api/search/groups?q={query}&limit=10
    // - GET /api/search/tags?q={query}&limit=20
    
    try {
      // Mock data - será substituído por chamadas reais
      const mockResults: SearchResults = {
        users: [
          {
            user_id: 1,
            username: 'joao_silva',
            email: 'joao@exemplo.com', // TODO: Backend não deve retornar email em buscas públicas
            birth_date: '1990-05-15', // TODO: Backend deve respeitar privacidade da data de nascimento
            profile_photo: null,
            bio: 'Desenvolvedor apaixonado por tecnologia',
            location: 'São Paulo, Brasil',
            website: 'https://joaosilva.dev',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-12-19T10:00:00Z',
            is_verified: true,
          },
          {
            user_id: 2,
            username: 'maria_tech',
            email: 'maria@exemplo.com', // TODO: Remover em implementação real
            birth_date: '1992-08-20', // TODO: Campo privado
            profile_photo: null,
            bio: 'UX Designer e desenvolvedora frontend',
            location: 'Rio de Janeiro, Brasil',
            website: undefined,
            created_at: '2024-02-01T10:00:00Z',
            updated_at: '2024-12-19T10:00:00Z',
            is_verified: false,
          },
        ],
        posts: [
          {
            post_id: 1,
            user_id: 1,
            content: 'Acabei de lançar meu novo projeto React! 🚀',
            post_type: 'texto',
            created_at: '2024-12-19T10:30:00Z',
            updated_at: '2024-12-19T10:30:00Z',
            username: 'joao_silva', // TODO: Vem do JOIN com tabela users
            profile_photo: null, // TODO: Vem do JOIN com tabela users
            like_count: 25, // TODO: Calculado em tempo real ou cached
            dislike_count: 1, // TODO: Calculado em tempo real ou cached
            comment_count: 12, // TODO: Calculado em tempo real ou cached
          },
        ],
        groups: [
          {
            group_id: 1,
            group_name: 'Desenvolvedores React',
            description: 'Comunidade para discussões sobre React e desenvolvimento frontend',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-12-19T10:00:00Z',
            member_count: 1247, // TODO: Contador em tempo real ou cached
            admin_count: 5, // TODO: Contador em tempo real ou cached
          },
        ],
        tags: ['ReactJS', 'JavaScript', 'WebDev', 'Frontend'], // TODO: Tags com contadores de uso
      };

      // Simula delay de rede para demonstração
      setTimeout(() => {
        setResults(mockResults);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Erro na busca:', error);
      setLoading(false);
      
      // TODO: Implementar tratamento de erro mais robusto
      // TODO: Mostrar notificação de erro para o usuário
      // TODO: Implementar retry automático em caso de erro de rede
    }
  };

  // =============================================================================
  // HANDLERS DE EVENTOS
  // =============================================================================

  /**
   * Handler para submissão do formulário de busca
   * 
   * Processa a busca e atualiza URL parameters para deep linking.
   * 
   * @param {React.FormEvent} event - Evento de submissão do form
   * 
   * TODO: Adicionar validação de input
   * TODO: Implementar debounce para busca em tempo real
   * TODO: Adicionar sugestões de busca
   */
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery);
      
      // TODO: Salvar busca no histórico do usuário
      // TODO: Emitir evento para analytics de busca
    }
  };

  /**
   * Handler para mudança de tab
   * 
   * Controla os filtros de tipo de conteúdo na interface.
   * 
   * @param {React.SyntheticEvent} event - Evento de mudança
   * @param {number} newValue - Novo valor da tab ativa
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // TODO: Atualizar URL para refletir filtro ativo
    // TODO: Implementar analytics de uso de filtros
  };

  /**
   * Handler para seguir usuário
   * 
   * Executa ação de follow diretamente dos resultados de busca.
   * 
   * @param {number} userId - ID do usuário a ser seguido
   * 
   * TODO: Implementar verificação se já está seguindo
   * TODO: Adicionar feedback visual (loading, sucesso, erro)
   * TODO: Atualizar estado local otimisticamente
   */
  const handleFollowUser = (userId: number) => {
    // TODO: IMPLEMENTAR SEGUIR USUÁRIO
    // Endpoint sugerido: POST /api/users/:userId/follow
    // Headers: Authorization: Bearer <token>
    // Response: { success: boolean, following: boolean }
    
    console.log('Seguir usuário:', userId);
    
    // TODO: Implementar lógica de follow
    // TODO: Atualizar UI para mostrar estado "seguindo"
    // TODO: Emitir notificação para o usuário seguido
  };

  /**
   * Handler para entrar em grupo
   * 
   * Executa ação de entrada em grupo diretamente dos resultados.
   * 
   * @param {number} groupId - ID do grupo a participar
   * 
   * TODO: Verificar se grupo é público ou privado
   * TODO: Implementar fluxo de aprovação para grupos privados
   * TODO: Adicionar confirmação se necessário
   */
  const handleJoinGroup = (groupId: number) => {
    // TODO: IMPLEMENTAR ENTRAR NO GRUPO
    // Endpoint sugerido: POST /api/groups/:groupId/join
    // Headers: Authorization: Bearer <token>
    // Response: { success: boolean, member: boolean, pending_approval?: boolean }
    
    console.log('Entrar no grupo:', groupId);
    
    // TODO: Implementar lógica de entrada em grupo
    // TODO: Tratar grupos privados com aprovação
    // TODO: Atualizar contadores de membros
  };

  // =============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // =============================================================================

  /**
   * Renderiza lista de usuários encontrados
   * 
   * Layout otimizado para exibir informações relevantes do usuário
   * com ação rápida de follow integrada.
   * 
   * TODO: Adicionar indicador de relacionamento (já segue, segue você, etc.)
   * TODO: Implementar preview do perfil on hover
   * TODO: Adicionar opção de enviar mensagem direta
   */
  const renderUsers = () => (
    <List>
      {results.users.map((user) => (
        <React.Fragment key={user.user_id}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar src={user.profile_photo || undefined} sx={{ width: 56, height: 56 }}>
                {!user.profile_photo && <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" component="span">
                    @{user.username}
                  </Typography>
                  {user.is_verified && (
                    <Chip label="Verificado" size="small" color="primary" />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {user.bio}
                  </Typography>
                  {user.location && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {user.location}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => handleFollowUser(user.user_id)}
                sx={{ minWidth: 100 }}
              >
                Seguir
              </Button>
              {/* TODO: Mostrar "Seguindo" se já está seguindo */}
              {/* TODO: Adicionar botão de mensagem se aplicável */}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );

  /**
   * Renderiza posts encontrados na busca
   * 
   * Layout de card compacto otimizado para visualização rápida
   * de posts nos resultados de busca.
   * 
   * TODO: Adicionar highlight do termo buscado no conteúdo
   * TODO: Implementar preview expandido on hover
   * TODO: Adicionar ações rápidas (like, comentar, compartilhar)
   */
  const renderPosts = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {results.posts.map((post) => (
        <Card key={post.post_id}>
          <CardContent>
            {/* Header do post com informações do autor */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={post.profile_photo || undefined} sx={{ mr: 2 }}>
                {!post.profile_photo && <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  @{post.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </Box>
            
            {/* Conteúdo do post */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              {post.content}
              {/* TODO: Implementar highlight do termo buscado */}
              {/* TODO: Adicionar suporte a markdown/links */}
            </Typography>
            
            {/* Estatísticas do post */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${post.like_count} curtidas`} size="small" />
              <Chip label={`${post.comment_count} comentários`} size="small" />
              {/* TODO: Adicionar mais métricas se relevantes */}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  /**
   * Renderiza grupos encontrados na busca
   * 
   * Layout em grid responsivo para melhor aproveitamento do espaço
   * com informações essenciais e ação de entrada direta.
   * 
   * TODO: Adicionar preview de membros do grupo
   * TODO: Mostrar atividade recente do grupo
   * TODO: Implementar indicadores de grupo privado/público
   */
  const renderGroups = () => (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { 
        xs: '1fr', 
        sm: 'repeat(2, 1fr)', 
        md: 'repeat(3, 1fr)' 
      }, 
      gap: 3 
    }}>
      {results.groups.map((group) => (
        <Card key={group.group_id}>
          <CardContent>
            {/* Header do grupo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <GroupIcon />
              </Avatar>
              <Typography variant="h6" component="h3">
                {group.group_name}
              </Typography>
            </Box>
            
            {/* Descrição do grupo */}
            <Typography variant="body2" color="text.secondary" paragraph>
              {group.description}
              {/* TODO: Truncar texto longo com "ver mais" */}
            </Typography>
            
            {/* Footer com estatísticas e ação */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {group.member_count} membros
                {/* TODO: Adicionar mais estatísticas (atividade, posts recentes) */}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<GroupAddIcon />}
                onClick={() => handleJoinGroup(group.group_id)}
              >
                Entrar
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  /**
   * Renderiza tags encontradas na busca
   * 
   * Layout de chips clicáveis para facilitar navegação
   * e descoberta de conteúdo relacionado.
   * 
   * TODO: Adicionar contadores de uso por tag
   * TODO: Implementar trending tags
   * TODO: Adicionar opção de seguir tags
   */
  const renderTags = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {results.tags.map((tag) => (
        <Chip
          key={tag}
          label={`#${tag}`}
          icon={<TagIcon />}
          variant="outlined"
          clickable
          onClick={() => {
            // Nova busca focada na tag específica
            setSearchQuery(`#${tag}`);
            setSearchParams({ q: `#${tag}` });
          }}
          sx={{ fontSize: '0.875rem', height: 40 }}
        />
        // TODO: Adicionar contador de posts por tag
        // TODO: Implementar hover com preview de posts da tag
      ))}
    </Box>
  );

  /**
   * Renderiza conteúdo baseado na tab ativa
   * 
   * Organiza a exibição de resultados de acordo com o filtro
   * selecionado pelo usuário.
   * 
   * TODO: Implementar lazy loading para tabs não ativas
   * TODO: Adicionar animações de transição entre tabs
   */
  const getTabContent = () => {
    switch (tabValue) {
      case 0:
        // Tab "Todos" - mostra todos os tipos de resultado
        return (
          <Box>
            {results.users.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Usuários
                </Typography>
                {renderUsers()}
              </Box>
            )}
            {results.posts.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ArticleIcon /> Posts
                </Typography>
                {renderPosts()}
              </Box>
            )}
            {results.groups.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon /> Grupos
                </Typography>
                {renderGroups()}
              </Box>
            )}
            {results.tags.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TagIcon /> Tags
                </Typography>
                {renderTags()}
              </Box>
            )}
          </Box>
        );
      case 1:
        return renderUsers();
      case 2:
        return renderPosts();
      case 3:
        return renderGroups();
      case 4:
        return renderTags();
      default:
        return null;
    }
  };

  // =============================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =============================================================================

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header da página com formulário de busca */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Buscar
        </Typography>
        
        {/* Formulário de busca principal */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar usuários, posts, grupos ou tags..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600 }}
          />
          {/* TODO: Adicionar botão de busca avançada */}
          {/* TODO: Implementar autocomplete com sugestões */}
        </Box>

        {/* Tabs de filtro (só aparecem após busca) */}
        {searchQuery && (
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Todos" />
            <Tab label={`Usuários (${results.users.length})`} />
            <Tab label={`Posts (${results.posts.length})`} />
            <Tab label={`Grupos (${results.groups.length})`} />
            <Tab label={`Tags (${results.tags.length})`} />
          </Tabs>
        )}
      </Box>

      {/* Área de conteúdo principal */}
      {loading ? (
        // Estado de loading
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : searchQuery ? (
        // Resultados da busca
        getTabContent()
      ) : (
        // Estado inicial vazio
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Digite algo para começar a buscar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Você pode buscar por usuários, posts, grupos ou tags
            </Typography>
            {/* TODO: Adicionar exemplos de busca */}
            {/* TODO: Mostrar buscas populares ou recentes */}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SearchPage;

/**
 * =============================================================================
 * MELHORIAS FUTURAS E TODOs
 * =============================================================================
 * 
 * FUNCIONALIDADES DE BUSCA:
 * - [ ] Implementar busca fuzzy para tolerar erros de digitação
 * - [ ] Adicionar autocomplete com sugestões em tempo real
 * - [ ] Implementar busca por voz (Speech Recognition API)
 * - [ ] Adicionar filtros avançados (data, localização, tipo de arquivo)
 * - [ ] Implementar operadores de busca (AND, OR, quotes, exclusão)
 * 
 * PERFORMANCE E UX:
 * - [ ] Debounce para busca em tempo real
 * - [ ] Cache de resultados recentes
 * - [ ] Paginação infinita para resultados numerosos
 * - [ ] Lazy loading de conteúdo pesado (imagens, videos)
 * - [ ] Skeleton loading para melhor feedback visual
 * 
 * FUNCIONALIDADES SOCIAIS:
 * - [ ] Histórico de buscas do usuário
 * - [ ] Buscas salvas/favoritas
 * - [ ] Compartilhamento de resultados de busca
 * - [ ] Notificações para novos resultados de buscas salvas
 * - [ ] Sugestões baseadas em buscas de amigos
 * 
 * ANALYTICS E INSIGHTS:
 * - [ ] Tracking de termos mais buscados
 * - [ ] Análise de eficácia dos resultados (cliques, interações)
 * - [ ] A/B testing para layouts de resultados
 * - [ ] Métricas de conversão (buscas que levaram a follows/joins)
 * 
 * ACESSIBILIDADE E MOBILE:
 * - [ ] Suporte completo a screen readers
 * - [ ] Navegação por teclado otimizada
 * - [ ] Gestos de swipe para filtros (mobile)
 * - [ ] Modo offline com cache de buscas recentes
 * - [ ] Otimização para conexões lentas
 */ 