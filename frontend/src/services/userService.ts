/**
 * SERVIÇO DE USUÁRIOS - USER SERVICE
 * 
 * Este módulo centraliza todas as operações relacionadas a usuários da rede social.
 * Atualmente usa dados mockados, mas está preparado para integração com API real.
 * 
 * FUNCIONALIDADES IMPLEMENTADAS:
 * 1. Gerenciamento de perfis de usuário
 * 2. Sistema de seguir/parar de seguir
 * 3. Estatísticas de seguidores/seguindo
 * 4. Envio de mensagens privadas
 * 5. Compartilhamento de perfis
 * 6. Busca de usuários
 * 
 * BACKEND INTEGRATION STATUS:
 * ❌ Não integrado - usando dados mockados
 * ✅ Interfaces TypeScript prontas
 * ✅ Estrutura de endpoints definida
 * ✅ Tratamento de erros implementado
 */

import { User, UpdateProfileForm, Message, SendMessageForm } from '../types';

// ============================================================================
// DADOS MOCKADOS PARA DESENVOLVIMENTO
// ============================================================================

/**
 * MOCK DE USUÁRIOS
 * 
 * Simula uma base de dados de usuários para desenvolvimento frontend.
 * Inclui diferentes tipos de perfis para testar cenários variados.
 * 
 * BACKEND TODO:
 * - Substituir por chamadas para GET /api/users
 * - Implementar cache Redis para usuários populares
 * - Adicionar paginação para grandes volumes
 */
let mockUsers: User[] = [
  {
    user_id: 1,
    username: 'joao_silva',
    email: 'joao@exemplo.com',
    birth_date: '1990-05-15',
    profile_photo: null,
    bio: 'Desenvolvedor apaixonado por tecnologia e inovação. Sempre aberto para novas conexões e colaborações! 🚀',
    location: 'São Paulo, Brasil',
    website: 'https://joaosilva.dev',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-19T10:00:00Z',
    is_verified: true,
  },
  {
    user_id: 2,
    username: 'maria_santos',
    email: 'maria@exemplo.com',
    birth_date: '1988-03-22',
    profile_photo: null,
    bio: 'UX Designer com paixão por criar experiências incríveis. Amo café e bons livros.',
    location: 'Rio de Janeiro, Brasil',
    website: 'https://mariasantos.design',
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-12-18T09:15:00Z',
    is_verified: false,
  },
];

/**
 * MOCK DE DADOS DE RELACIONAMENTOS (SEGUIR/SEGUIDORES)
 * 
 * Simula a tabela 'connections' do banco de dados.
 * Estrutura: Map<user_id, { followers: user_id[], following: user_id[] }>
 * 
 * BACKEND TODO:
 * - Substituir por tabela 'connections' no PostgreSQL/MySQL
 * - Implementar endpoints para gerenciar conexões
 * - Adicionar notificações quando alguém segue/para de seguir
 * - Cache Redis para contadores de seguidores
 */
let mockFollowingData = new Map<number, { followers: number[], following: number[] }>();
mockFollowingData.set(1, { followers: [2, 3, 4], following: [2, 5] });
mockFollowingData.set(2, { followers: [1], following: [1, 3] });

/**
 * MOCK DE MENSAGENS PRIVADAS
 * 
 * Simula a tabela 'messages' do banco de dados.
 * Armazena mensagens enviadas através do sistema.
 * 
 * BACKEND TODO:
 * - Substituir por tabela 'messages' no banco
 * - Implementar WebSocket para mensagens em tempo real
 * - Adicionar criptografia end-to-end para privacidade
 * - Sistema de status de entrega (enviada/recebida/lida)
 */
let mockMessages: Message[] = [];
let nextMessageId = 1;

// ============================================================================
// SERVIÇO PRINCIPAL DE USUÁRIOS
// ============================================================================

export const userService = {
  
  /**
   * BUSCAR PERFIL DE USUÁRIO
   * 
   * Obtém dados completos de um usuário específico.
   * Usado para exibir perfis, tanto próprio quanto de outros usuários.
   * 
   * @param userId - ID único do usuário
   * @returns Promise<User | null> - Dados do usuário ou null se não encontrado
   * 
   * BACKEND TODO:
   * - Endpoint: GET /api/users/:userId/profile
   * - Validar permissões de visualização
   * - Incluir estatísticas do perfil (posts, seguidores, etc.)
   * - Cache Redis para perfis populares (TTL: 5 minutos)
   * - Rate limiting para prevenir spam de consultas
   */
  async getUserProfile(userId: number): Promise<User | null> {
    // Simula delay de rede (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.user_id === userId);
    return user || null;
  },

  /**
   * ATUALIZAR PERFIL DO USUÁRIO
   * 
   * Permite ao usuário atualizar suas informações pessoais.
   * Suporta atualização parcial (apenas campos fornecidos são alterados).
   * 
   * @param userId - ID do usuário que está atualizando
   * @param profileData - Dados a serem atualizados
   * @returns Promise<User> - Dados atualizados do usuário
   * 
   * REGRAS DE NEGÓCIO:
   * - Usuário só pode atualizar próprio perfil
   * - Username deve ser único no sistema
   * - Email deve ser válido e único
   * - Bio limitada a 500 caracteres
   * - Website deve ser URL válida
   * 
   * BACKEND TODO:
   * - Endpoint: PUT /api/users/:userId/profile
   * - Middleware de autenticação (verificar se userId = usuário logado)
   * - Validação de unicidade de username/email
   * - Upload de imagem de perfil para cloud storage
   * - Histórico de alterações para auditoria
   * - Trigger para atualizar updated_at automaticamente
   */
  async updateProfile(userId: number, profileData: UpdateProfileForm): Promise<User> {
    // Simula delay de rede (500ms para operação de escrita)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(u => u.user_id === userId);
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  /**
   * SEGUIR USUÁRIO
   * 
   * Cria uma conexão de "seguir" entre o usuário atual e um usuário alvo.
   * Implementa o sistema de rede social da aplicação.
   * 
   * @param currentUserId - ID do usuário que quer seguir
   * @param targetUserId - ID do usuário a ser seguido
   * @returns Promise<boolean> - true se seguiu com sucesso, false se já estava seguindo
   * 
   * REGRAS DE NEGÓCIO:
   * - Usuário não pode seguir a si mesmo
   * - Não pode seguir o mesmo usuário mais de uma vez
   * - Ação deve gerar notificação para o usuário seguido
   * - Contadores devem ser atualizados automaticamente
   * 
   * BACKEND TODO:
   * - Endpoint: POST /api/connections/follow
   * - Body: { target_user_id: number }
   * - Inserir registro na tabela 'connections' com status 'accepted'
   * - Trigger para atualizar contadores em cache
   * - Notificação push/email para usuário seguido
   * - Validação: current_user_id != target_user_id
   * - Constraint UNIQUE (user_id, connected_user_id)
   */
  async followUser(currentUserId: number, targetUserId: number): Promise<boolean> {
    // Simula delay de rede (400ms)
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (currentUserId === targetUserId) {
      throw new Error('Você não pode seguir a si mesmo');
    }

    const currentUserData = mockFollowingData.get(currentUserId) || { followers: [], following: [] };
    const targetUserData = mockFollowingData.get(targetUserId) || { followers: [], following: [] };

    // Verificar se já está seguindo
    if (currentUserData.following.includes(targetUserId)) {
      return false; // Já está seguindo
    }

    // Adicionar aos seguindo do usuário atual
    currentUserData.following.push(targetUserId);
    mockFollowingData.set(currentUserId, currentUserData);

    // Adicionar aos seguidores do usuário alvo
    targetUserData.followers.push(currentUserId);
    mockFollowingData.set(targetUserId, targetUserData);

    return true;
  },

  /**
   * PARAR DE SEGUIR USUÁRIO
   * 
   * Remove a conexão de "seguir" entre o usuário atual e um usuário alvo.
   * 
   * @param currentUserId - ID do usuário que quer parar de seguir
   * @param targetUserId - ID do usuário a ser "desfollowado"
   * @returns Promise<boolean> - true se parou de seguir, false se não estava seguindo
   * 
   * BACKEND TODO:
   * - Endpoint: DELETE /api/connections/follow/:targetUserId
   * - Remover registro da tabela 'connections'
   * - Trigger para atualizar contadores em cache
   * - Não gerar notificação (ação silenciosa)
   * - Validar se conexão existe antes de tentar remover
   */
  async unfollowUser(currentUserId: number, targetUserId: number): Promise<boolean> {
    // Simula delay de rede (400ms)
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const currentUserData = mockFollowingData.get(currentUserId) || { followers: [], following: [] };
    const targetUserData = mockFollowingData.get(targetUserId) || { followers: [], following: [] };

    // Verificar se está seguindo
    if (!currentUserData.following.includes(targetUserId)) {
      return false; // Não está seguindo
    }

    // Remover dos seguindo do usuário atual
    currentUserData.following = currentUserData.following.filter(id => id !== targetUserId);
    mockFollowingData.set(currentUserId, currentUserData);

    // Remover dos seguidores do usuário alvo
    targetUserData.followers = targetUserData.followers.filter(id => id !== currentUserId);
    mockFollowingData.set(targetUserId, targetUserData);

    return true;
  },

  /**
   * VERIFICAR SE ESTÁ SEGUINDO USUÁRIO
   * 
   * Consulta rápida para verificar status de conexão entre dois usuários.
   * Usado para mostrar botão "Seguir" ou "Seguindo" na interface.
   * 
   * @param currentUserId - ID do usuário que fez a consulta
   * @param targetUserId - ID do usuário que está sendo verificado
   * @returns Promise<boolean> - true se está seguindo, false caso contrário
   * 
   * BACKEND TODO:
   * - Endpoint: GET /api/connections/is-following/:targetUserId
   * - Query otimizada: SELECT EXISTS(SELECT 1 FROM connections WHERE ...)
   * - Cache Redis para consultas frequentes
   * - Rate limiting para prevenir abuse
   */
  async isFollowing(currentUserId: number, targetUserId: number): Promise<boolean> {
    // Simula delay de rede (200ms - consulta rápida)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const currentUserData = mockFollowingData.get(currentUserId) || { followers: [], following: [] };
    return currentUserData.following.includes(targetUserId);
  },

  /**
   * OBTER ESTATÍSTICAS DE SEGUIDOR/SEGUINDO
   * 
   * Retorna contadores de seguidores e seguindo para um usuário.
   * Usado para exibir estatísticas no perfil.
   * 
   * @param userId - ID do usuário para obter estatísticas
   * @returns Promise<{followers: number, following: number}> - Contadores
   * 
   * BACKEND TODO:
   * - Endpoint: GET /api/users/:userId/follow-stats
   * - View SQL otimizada: SELECT COUNT(*) FROM connections WHERE ...
   * - Cache Redis para contadores (TTL: 5 minutos)
   * - Atualização automática via triggers
   * - Incluir em resposta do perfil para reduzir requests
   */
  async getFollowStats(userId: number): Promise<{ followers: number; following: number }> {
    // Simula delay de rede (200ms - consulta rápida)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userData = mockFollowingData.get(userId) || { followers: [], following: [] };
    return {
      followers: userData.followers.length,
      following: userData.following.length,
    };
  },

  /**
   * ENVIAR MENSAGEM PARA USUÁRIO
   * 
   * Envia uma mensagem privada para outro usuário da rede social.
   * Base do sistema de chat/mensagens da aplicação.
   * 
   * @param messageData - Dados da mensagem (receiver_id, content)
   * @returns Promise<Message> - Mensagem criada com metadados
   * 
   * REGRAS DE NEGÓCIO:
   * - Usuários bloqueados não podem trocar mensagens
   * - Conteúdo limitado a 1000 caracteres
   * - Status inicial sempre 'sent'
   * - Destinatário deve receber notificação
   * 
   * BACKEND TODO:
   * - Endpoint: POST /api/messages
   * - Body: { receiver_id: number, content: string }
   * - Verificar se usuários não estão bloqueados
   * - WebSocket para entrega em tempo real
   * - Trigger para atualizar status para 'received'
   * - Notificação push para destinatário
   * - Rate limiting para prevenir spam
   * - Filtro de conteúdo impróprio (opcional)
   */
  async sendMessage(messageData: SendMessageForm): Promise<Message> {
    // Simula delay de rede (600ms - operação de escrita + notificação)
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Buscar dados dos usuários
    const sender = mockUsers.find(u => u.user_id === 1); // FIXME: Simula usuário logado (deveria vir do contexto de auth)
    const receiver = mockUsers.find(u => u.user_id === messageData.receiver_id);
    
    if (!sender || !receiver) {
      throw new Error('Usuário não encontrado');
    }

    const newMessage: Message = {
      message_id: nextMessageId++,
      sender_id: sender.user_id,
      receiver_id: messageData.receiver_id,
      content: messageData.content,
      status: 'sent',
      sent_at: new Date().toISOString(),
      sender_username: sender.username,
      receiver_username: receiver.username,
      sender_photo: sender.profile_photo,
      receiver_photo: receiver.profile_photo,
    };

    mockMessages.push(newMessage);
    return newMessage;
  },

  /**
   * COMPARTILHAR PERFIL
   * 
   * Gera URL de compartilhamento para o perfil de um usuário.
   * Automaticamente copia para clipboard se disponível.
   * 
   * @param userId - ID do usuário cujo perfil será compartilhado
   * @returns Promise<string> - URL de compartilhamento
   * 
   * FUNCIONALIDADES:
   * - Gera URL amigável (/profile/username)
   * - Copia automaticamente para clipboard
   * - Funciona em todos os browsers modernos
   * 
   * BACKEND TODO:
   * - Endpoint: GET /api/users/:userId/share-link
   * - Gerar URLs com parâmetros de tracking (utm_source, etc.)
   * - Logging de compartilhamentos para analytics
   * - URLs encurtadas para redes sociais (opcional)
   * - Preview cards para WhatsApp/Telegram (meta tags)
   */
  async shareProfile(userId: number): Promise<string> {
    // Simula delay de rede (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.user_id === userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar URL de compartilhamento amigável
    const shareUrl = `${window.location.origin}/profile/${user.username}`;
    
    // Copiar para clipboard se API disponível (browsers modernos)
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) {
        console.warn('Não foi possível copiar para o clipboard:', err);
      }
    }

    return shareUrl;
  },

  /**
   * BUSCAR USUÁRIOS POR TERMO
   * 
   * Implementa busca textual de usuários por username ou bio.
   * Base do sistema de descoberta de pessoas na rede social.
   * 
   * @param searchTerm - Termo de busca
   * @returns Promise<User[]> - Lista de usuários encontrados
   * 
   * CARACTERÍSTICAS:
   * - Busca case-insensitive
   * - Pesquisa em username e bio
   * - Limitado a 10 resultados para performance
   * - Retorna array vazio para termos vazios
   * 
   * BACKEND TODO:
   * - Endpoint: GET /api/users/search?q=:searchTerm
   * - Full-text search no PostgreSQL (tsvector) ou Elasticsearch
   * - Busca em múltiplos campos: username, bio, nome completo
   * - Paginação para grandes resultados
   * - Ordenação por relevância e popularidade
   * - Cache Redis para termos populares
   * - Rate limiting para prevenir abuse
   * - Autocomplete para sugestões em tempo real
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    // Simula delay de rede (400ms)
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!searchTerm.trim()) {
      return [];
    }

    const filtered = mockUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.slice(0, 10); // Limitar resultados para performance
  },
};

// ============================================================================
// ROADMAP DE INTEGRAÇÃO COM BACKEND
// ============================================================================

/**
 * ENDPOINTS A SEREM IMPLEMENTADOS NO BACKEND NODE.JS
 * 
 * ESTRUTURA DE ROTAS SUGERIDA:
 * 
 * /api/users/
 * ├── GET    /:userId/profile              # Buscar perfil
 * ├── PUT    /:userId/profile              # Atualizar perfil  
 * ├── GET    /:userId/follow-stats         # Estatísticas de seguidores
 * ├── GET    /:userId/share-link           # Gerar link de compartilhamento
 * └── GET    /search?q=:term               # Buscar usuários
 * 
 * /api/connections/
 * ├── POST   /follow                       # Seguir usuário
 * ├── DELETE /follow/:targetUserId         # Parar de seguir
 * └── GET    /is-following/:targetUserId   # Verificar se está seguindo
 * 
 * /api/messages/
 * ├── POST   /                            # Enviar mensagem
 * ├── GET    /conversations               # Listar conversas
 * └── PUT    /:messageId/read             # Marcar como lida
 * 
 * MIDDLEWARE NECESSÁRIOS:
 * - authMiddleware: Verificar JWT token em todas as rotas
 * - validationMiddleware: Validar dados de entrada
 * - rateLimitMiddleware: Limitar requests por IP/usuário
 * - errorHandlerMiddleware: Tratamento centralizado de erros
 * 
 * BANCO DE DADOS:
 * - Tabelas: users, connections, messages
 * - Índices: username, email, (user_id, connected_user_id)
 * - Triggers: Atualizar contadores automaticamente
 * - Views: Estatísticas agregadas para performance
 * 
 * CACHE REDIS:
 * - user_profile:{userId} (TTL: 5min)
 * - follow_stats:{userId} (TTL: 5min)  
 * - search_results:{term} (TTL: 1min)
 * - is_following:{userId}:{targetId} (TTL: 1min)
 * 
 * NOTIFICAÇÕES:
 * - WebSocket para mensagens em tempo real
 * - Push notifications para novas conexões
 * - Email notifications para marcos (novos seguidores)
 * 
 * SEGURANÇA:
 * - Validação de permissões (só pode editar próprio perfil)
 * - Sanitização de entrada (prevenir XSS)
 * - Rate limiting rigoroso para busca e mensagens
 * - Logs de auditoria para ações sensíveis
 */ 