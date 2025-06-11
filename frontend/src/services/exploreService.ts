/**
 * =============================================================================
 * EXPLORE SERVICE - SERVIÇO DE EXPLORAÇÃO E DESCOBERTA
 * =============================================================================
 * 
 * Serviço responsável por funcionalidades de descoberta de conteúdo na rede social.
 * Gerencia posts em alta, usuários sugeridos, tags populares, grupos ativos e busca.
 * 
 * CARACTERÍSTICAS:
 * - Sistema de trending posts baseado em engajamento
 * - Algoritmo de sugestão de usuários personalizados
 * - Descoberta de tags populares e grupos ativos
 * - Busca unificada em todos os tipos de conteúdo
 * - Sistema de follow/unfollow para usuários e tags
 * - Integração com grupos sociais
 * 
 * INTEGRAÇÕES BACKEND NECESSÁRIAS:
 * - API de trending: GET /api/posts/trending
 * - API de sugestões: GET /api/users/suggested (baseado em algoritmo ML)
 * - API de tags populares: GET /api/tags/popular
 * - API de grupos ativos: GET /api/groups/active
 * - API de busca unificada: GET /api/search
 * - APIs de interação social: follow/unfollow usuários, tags, grupos
 * 
 * TODO: Implementar cache inteligente para performance
 * TODO: Adicionar filtros avançados de busca
 * TODO: Implementar sistema de recomendação baseado em ML
 * TODO: Adicionar analytics de descoberta de conteúdo
 */

import { User, Post, Tag, Group } from '../types';

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

/**
 * Interface para dados da página de exploração
 * Agrupa todos os dados necessários para a tela de descoberta
 * 
 * @interface ExploreData
 * @param {Post[]} trendingPosts - Posts em alta baseados em engajamento
 * @param {User[]} suggestedUsers - Usuários sugeridos pelo algoritmo
 * @param {Tag[]} popularTags - Tags mais utilizadas recentemente
 * @param {Group[]} activeGroups - Grupos com maior atividade
 */
interface ExploreData {
  trendingPosts: Post[];
  suggestedUsers: User[];
  popularTags: Tag[];
  activeGroups: Group[];
}

/**
 * Interface para resultados de busca unificada
 * Permite buscar em diferentes tipos de entidades simultaneamente
 * 
 * @interface SearchResults
 * @param {User[]} users - Usuários encontrados na busca
 * @param {Post[]} posts - Posts que correspondem à busca
 * @param {Tag[]} tags - Tags relacionadas ao termo buscado
 * @param {Group[]} groups - Grupos que correspondem à busca
 * @param {number} total - Total de resultados encontrados
 */
interface SearchResults {
  users: User[];
  posts: Post[];
  tags: Tag[];
  groups: Group[];
  total: number;
}

// =============================================================================
// CLASSE PRINCIPAL DO SERVIÇO
// =============================================================================

/**
 * Serviço de Exploração e Descoberta
 * 
 * Centraliza todas as funcionalidades relacionadas à descoberta de conteúdo,
 * busca e interações sociais básicas (follow/unfollow).
 */
class ExploreService {
  /**
   * URL base da API backend
   * TODO: Mover para configuração de ambiente mais robusta
   */
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  // =============================================================================
  // MÉTODOS DE DESCOBERTA DE CONTEÚDO
  // =============================================================================

  /**
   * Busca posts em alta/trending baseados em engajamento
   * 
   * ALGORITMO SUGERIDO (backend):
   * - Combinar curtidas, comentários, compartilhamentos
   * - Considerar recência (posts muito antigos têm peso menor)
   * - Calcular score de trending: (likes + comments*2 + shares*3) / age_factor
   * 
   * @param {number} limit - Número máximo de posts a retornar (padrão: 10)
   * @returns {Promise<Post[]>} Array de posts em alta
   * 
   * TODO: Implementar cache Redis no backend para performance
   * TODO: Adicionar filtros por categoria/tag
   * TODO: Personalizar trending baseado nos interesses do usuário
   */
  async getTrendingPosts(limit = 10): Promise<Post[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/trending?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar posts em alta');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar posts em alta:', error);
      // Fallback para dados mockados durante desenvolvimento
      return this.getMockTrendingPosts();
    }
  }

  /**
   * Busca usuários sugeridos baseados em algoritmo de recomendação
   * 
   * ALGORITMO SUGERIDO (backend):
   * - Usuários seguidos por pessoas que eu sigo (friends of friends)
   * - Usuários com interesses similares (baseado em tags seguidas)
   * - Usuários da mesma localização geográfica
   * - Usuários com perfis similares (profissão, interesses)
   * 
   * @param {number} limit - Número máximo de usuários a retornar (padrão: 6)
   * @returns {Promise<User[]>} Array de usuários sugeridos
   * 
   * TODO: Implementar machine learning para melhorar sugestões
   * TODO: Adicionar blacklist de usuários bloqueados/silenciados
   * TODO: Considerar atividade recente do usuário para relevância
   */
  async getSuggestedUsers(limit = 6): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/suggested?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários sugeridos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuários sugeridos:', error);
      return this.getMockSuggestedUsers();
    }
  }

  /**
   * Busca tags populares baseadas em uso recente
   * 
   * ALGORITMO SUGERIDO (backend):
   * - Contar uso de tags nos últimos 7 dias
   * - Dar peso maior para posts com mais engajamento
   * - Considerar crescimento da tag (trending tags)
   * - Filtrar tags spam ou inadequadas
   * 
   * @param {number} limit - Número máximo de tags a retornar (padrão: 6)
   * @returns {Promise<Tag[]>} Array de tags populares
   * 
   * TODO: Adicionar categorização de tags (tecnologia, arte, música, etc.)
   * TODO: Implementar trending tags em tempo real
   * TODO: Personalizar tags baseado nos interesses do usuário
   */
  async getPopularTags(limit = 6): Promise<Tag[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tags/popular?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar tags populares');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar tags populares:', error);
      return this.getMockPopularTags();
    }
  }

  /**
   * Busca grupos mais ativos recentemente
   * 
   * ALGORITMO SUGERIDO (backend):
   * - Considerar número de posts/mensagens nos últimos 7 dias
   * - Número de novos membros recentemente
   * - Frequência de interações (comentários, likes)
   * - Atividade dos administradores
   * 
   * @param {number} limit - Número máximo de grupos a retornar (padrão: 6)
   * @returns {Promise<Group[]>} Array de grupos ativos
   * 
   * TODO: Sugerir grupos baseado nos interesses do usuário
   * TODO: Adicionar categorização de grupos
   * TODO: Implementar sistema de qualidade de grupos
   */
  async getActiveGroups(limit = 6): Promise<Group[]> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/active?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar grupos ativos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar grupos ativos:', error);
      return this.getMockActiveGroups();
    }
  }

  // =============================================================================
  // MÉTODOS DE INTERAÇÃO SOCIAL
  // =============================================================================

  /**
   * Segue um usuário
   * 
   * REGRAS DE NEGÓCIO:
   * - Verificar se já não está seguindo
   * - Atualizar contadores de followers/following
   * - Enviar notificação para o usuário seguido
   * - Registrar evento para analytics
   * 
   * @param {number} userId - ID do usuário a ser seguido
   * @returns {Promise<void>}
   * 
   * TODO: Implementar verificação de usuário bloqueado
   * TODO: Adicionar limites de follow para prevenir spam
   * TODO: Implementar notificações push para novos followers
   */
  async followUser(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao seguir usuário');
      }
      
      // TODO: Atualizar cache local de relacionamentos
      // TODO: Emitir evento para atualizar UI em tempo real
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      // Em desenvolvimento, simula sucesso para não quebrar a UI
      // TODO: Implementar retry logic e fallback
    }
  }

  /**
   * Para de seguir um usuário
   * 
   * @param {number} userId - ID do usuário a parar de seguir
   * @returns {Promise<void>}
   * 
   * TODO: Implementar confirmação para unfollow (opcional)
   * TODO: Atualizar feeds após unfollow
   */
  async unfollowUser(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deixar de seguir usuário');
      }
      
      // TODO: Limpar cache de posts do usuário não seguido
      // TODO: Atualizar timeline do usuário
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  /**
   * Segue uma tag para receber conteúdo relacionado
   * 
   * FUNCIONALIDADE:
   * - Adicionar tag aos interesses do usuário
   * - Influenciar algoritmo de recomendação
   * - Mostrar posts com essa tag na timeline
   * 
   * @param {number} tagId - ID da tag a ser seguida
   * @returns {Promise<void>}
   * 
   * TODO: Implementar limite máximo de tags seguidas
   * TODO: Categorizar tags por tipo (tecnologia, esporte, etc.)
   */
  async followTag(tagId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tags/${tagId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao seguir tag');
      }
      
      // TODO: Atualizar algoritmo de feed em tempo real
      // TODO: Sugerir tags relacionadas
    } catch (error) {
      console.error('Erro ao seguir tag:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  /**
   * Para de seguir uma tag
   * 
   * @param {number} tagId - ID da tag a parar de seguir
   * @returns {Promise<void>}
   */
  async unfollowTag(tagId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tags/${tagId}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deixar de seguir tag');
      }
      
      // TODO: Filtrar posts dessa tag da timeline
    } catch (error) {
      console.error('Erro ao deixar de seguir tag:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  /**
   * Entra em um grupo
   * 
   * REGRAS DE NEGÓCIO:
   * - Verificar se o grupo permite entrada livre ou precisa aprovação
   * - Atualizar contador de membros
   * - Enviar notificação para admins (se necessário)
   * - Dar acesso ao conteúdo do grupo
   * 
   * @param {number} groupId - ID do grupo a participar
   * @returns {Promise<void>}
   * 
   * TODO: Implementar diferentes tipos de grupos (público, privado, secreto)
   * TODO: Sistema de aprovação de entrada em grupos privados
   */
  async joinGroup(groupId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao participar do grupo');
      }
      
      // TODO: Adicionar grupo à lista de grupos do usuário
      // TODO: Incluir posts do grupo na timeline
    } catch (error) {
      console.error('Erro ao participar do grupo:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  /**
   * Sai de um grupo
   * 
   * @param {number} groupId - ID do grupo a sair
   * @returns {Promise<void>}
   * 
   * TODO: Implementar confirmação para sair de grupos importantes
   * TODO: Preservar histórico de participação para analytics
   */
  async leaveGroup(groupId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}/leave`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao sair do grupo');
      }
      
      // TODO: Remover posts do grupo da timeline
      // TODO: Atualizar cache de grupos do usuário
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  // =============================================================================
  // FUNCIONALIDADE DE BUSCA
  // =============================================================================

  /**
   * Realiza busca unificada em todos os tipos de conteúdo
   * 
   * CARACTERÍSTICAS DA BUSCA:
   * - Busca em usuários (nome, bio, localização)
   * - Busca em posts (conteúdo, hashtags)
   * - Busca em tags (nome da tag)
   * - Busca em grupos (nome, descrição)
   * - Suporte a filtros por tipo
   * - Resultados ranqueados por relevância
   * 
   * @param {string} query - Termo de busca
   * @param {string} type - Tipo específico para filtrar ('users' | 'posts' | 'tags' | 'groups')
   * @returns {Promise<SearchResults>} Resultados organizados por tipo
   * 
   * TODO: Implementar busca fuzzy para typos
   * TODO: Adicionar sugestões de busca em tempo real
   * TODO: Implementar filtros avançados (data, localização, etc.)
   * TODO: Salvar histórico de buscas para melhorar sugestões
   * TODO: Implementar busca por imagem/conteúdo visual
   */
  async search(query: string, type?: 'users' | 'posts' | 'tags' | 'groups'): Promise<SearchResults> {
    try {
      const params = new URLSearchParams({ q: query });
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao realizar busca');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao realizar busca:', error);
      // Fallback para busca local nos dados mockados
      return this.getMockSearchResults(query);
    }
  }

  // =============================================================================
  // MÉTODOS AUXILIARES - DADOS MOCKADOS PARA DESENVOLVIMENTO
  // =============================================================================

  /**
   * Dados mockados de posts em alta para desenvolvimento
   * TODO: Remover quando backend estiver implementado
   */
  private getMockTrendingPosts(): Post[] {
    return [
      {
        post_id: 10,
        user_id: 5,
        content: '🚀 Acabei de descobrir uma técnica incrível para otimizar React apps! Quem mais está interessado em performance? #ReactJS #Performance',
        post_type: 'texto',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        username: 'dev_ana',
        profile_photo: null,
        like_count: 45,
        dislike_count: 2,
        comment_count: 18,
      },
      {
        post_id: 11,
        user_id: 6,
        content: 'Reflexão: As redes sociais abertas podem ser o futuro da comunicação digital. Transparência gera confiança! 🌟',
        post_type: 'texto',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        username: 'filosofo_tech',
        profile_photo: null,
        like_count: 38,
        dislike_count: 5,
        comment_count: 22,
      },
      // TODO: Adicionar mais posts mockados com diferentes tipos de conteúdo
    ];
  }

  /**
   * Dados mockados de usuários sugeridos para desenvolvimento
   * TODO: Remover quando algoritmo de recomendação estiver implementado
   */
  private getMockSuggestedUsers(): User[] {
    return [
      {
        user_id: 5,
        username: 'dev_ana',
        email: 'ana@exemplo.com',
        birth_date: '1995-03-15',
        profile_photo: null,
        bio: 'Frontend Developer | React Enthusiast | UI/UX Lover',
        location: 'Rio de Janeiro, Brasil',
        is_verified: true,
        created_at: '2024-02-10T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
      },
      {
        user_id: 6,
        username: 'filosofo_tech',
        email: 'filosofo@exemplo.com',
        birth_date: '1988-07-22',
        profile_photo: null,
        bio: 'Pensador digital | Tecnologia e sociedade | Futuro aberto',
        location: 'Belo Horizonte, Brasil',
        is_verified: false,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
      },
      {
        user_id: 7,
        username: 'designer_criativo',
        email: 'designer@exemplo.com',
        birth_date: '1992-11-08',
        profile_photo: null,
        bio: 'UI/UX Designer | Criatividade em pixels | Design thinking',
        location: 'São Paulo, Brasil',
        is_verified: true,
        created_at: '2024-03-05T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
      },
      // TODO: Adicionar mais usuários mockados com perfis diversos
    ];
  }

  /**
   * Dados mockados de tags populares para desenvolvimento
   * TODO: Substituir por dados reais do sistema de analytics de tags
   */
  private getMockPopularTags(): Tag[] {
    return [
      { tag_id: 1, tag_name: 'ReactJS', created_at: '2024-01-01T00:00:00Z', user_count: 245 },
      { tag_id: 2, tag_name: 'JavaScript', created_at: '2024-01-01T00:00:00Z', user_count: 189 },
      { tag_id: 3, tag_name: 'Design', created_at: '2024-01-01T00:00:00Z', user_count: 156 },
      { tag_id: 4, tag_name: 'TechTalk', created_at: '2024-01-01T00:00:00Z', user_count: 134 },
      { tag_id: 5, tag_name: 'OpenSource', created_at: '2024-01-01T00:00:00Z', user_count: 98 },
      { tag_id: 6, tag_name: 'Innovation', created_at: '2024-01-01T00:00:00Z', user_count: 87 },
      // TODO: Adicionar mais tags de diferentes categorias
    ];
  }

  /**
   * Dados mockados de grupos ativos para desenvolvimento
   * TODO: Substituir por dados reais baseados em atividade de grupos
   */
  private getMockActiveGroups(): Group[] {
    return [
      {
        group_id: 1,
        group_name: 'Desenvolvedores React',
        description: 'Comunidade para discussões sobre React, hooks, performance e boas práticas.',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
        member_count: 1247,
        admin_count: 5,
      },
      {
        group_id: 2,
        group_name: 'Design & UX',
        description: 'Espaço para designers compartilharem ideias, tendências e feedback.',
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
        member_count: 892,
        admin_count: 3,
      },
      {
        group_id: 3,
        group_name: 'Tecnologia & Sociedade',
        description: 'Discussões sobre o impacto da tecnologia na sociedade moderna.',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-12-19T10:00:00Z',
        member_count: 654,
        admin_count: 4,
      },
      // TODO: Adicionar mais grupos de categorias variadas
    ];
  }

  /**
   * Simulação de busca nos dados mockados para desenvolvimento
   * Implementa busca simples por substring em campos relevantes
   * 
   * @param {string} query - Termo de busca
   * @returns {SearchResults} Resultados filtrados dos dados mockados
   * 
   * TODO: Substituir por busca real com indexação e ranking
   */
  private getMockSearchResults(query: string): SearchResults {
    const users = this.getMockSuggestedUsers().filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.bio?.toLowerCase().includes(query.toLowerCase())
    );
    
    const posts = this.getMockTrendingPosts().filter(post => 
      post.content.toLowerCase().includes(query.toLowerCase())
    );
    
    const tags = this.getMockPopularTags().filter(tag => 
      tag.tag_name.toLowerCase().includes(query.toLowerCase())
    );
    
    const groups = this.getMockActiveGroups().filter(group => 
      group.group_name.toLowerCase().includes(query.toLowerCase()) ||
      group.description.toLowerCase().includes(query.toLowerCase())
    );

    return {
      users,
      posts,
      tags,
      groups,
      total: users.length + posts.length + tags.length + groups.length,
    };
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON E EXPORTS
// =============================================================================

/**
 * Instância singleton do serviço de exploração
 * Garante que o mesmo estado seja compartilhado em toda a aplicação
 */
const exploreServiceInstance = new ExploreService();

export default exploreServiceInstance;
export type { ExploreData, SearchResults };

/**
 * =============================================================================
 * MELHORIAS FUTURAS E TODOs
 * =============================================================================
 * 
 * ALGORITMOS DE RECOMENDAÇÃO:
 * - [ ] Implementar machine learning para sugestões personalizadas
 * - [ ] Sistema de collaborative filtering para usuários similares
 * - [ ] Content-based filtering baseado em interesses e atividade
 * - [ ] Algoritmo de trending posts mais sofisticado
 * 
 * PERFORMANCE E CACHE:
 * - [ ] Implementar cache Redis para dados de trending
 * - [ ] Cache local no frontend com TTL apropriado
 * - [ ] Lazy loading e paginação para grandes listas
 * - [ ] Otimização de queries com índices apropriados
 * 
 * FUNCIONALIDADES DE BUSCA:
 * - [ ] Busca fuzzy para tolerar erros de digitação
 * - [ ] Autocomplete com sugestões em tempo real
 * - [ ] Filtros avançados (data, localização, tipo de conteúdo)
 * - [ ] Histórico e sugestões baseadas em buscas anteriores
 * - [ ] Busca por imagem e conteúdo visual
 * 
 * SISTEMA SOCIAL:
 * - [ ] Listas de usuários personalizadas
 * - [ ] Sistema de grupos privados com aprovação
 * - [ ] Follow requests para perfis privados
 * - [ ] Sistema de bloqueio e silenciamento
 * - [ ] Notificações para todas as interações sociais
 * 
 * ANALYTICS E INSIGHTS:
 * - [ ] Tracking de engajamento com conteúdo sugerido
 * - [ ] Métricas de qualidade das recomendações
 * - [ ] A/B testing para algoritmos de descoberta
 * - [ ] Dashboard de analytics para criadores de conteúdo
 * 
 * SEGURANÇA E MODERAÇÃO:
 * - [ ] Filtros de conteúdo sensível ou inapropriado
 * - [ ] Sistema de reports para conteúdo/usuários problemáticos
 * - [ ] Rate limiting para prevenir abuse de APIs
 * - [ ] Detecção de comportamento automatizado/bots
 */