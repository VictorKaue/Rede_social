/**
 * TIPOS E INTERFACES DA REDE SOCIAL JPPROJECT
 * 
 * Este arquivo centraliza todas as definições de tipos TypeScript do frontend,
 * mantendo consistência com o modelo de dados do banco PostgreSQL/MySQL.
 * 
 * ESTRUTURA ORGANIZACIONAL:
 * 1. Entidades principais (User, Post, Comment, etc.)
 * 2. Tipos para views e estatísticas
 * 3. Formulários e interface de usuário
 * 4. Respostas da API e paginação
 * 5. Contextos e hooks customizados
 * 6. Filtros e parâmetros de busca
 * 
 * BACKEND INTEGRATION NOTES:
 * - Todos os tipos seguem exatamente as colunas do banco de dados
 * - Campos opcionais (?) indicam dados que podem vir de JOINs
 * - Timestamps seguem formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
 * - IDs são sempre números inteiros (auto increment no banco)
 */

// ============================================================================
// ENTIDADES PRINCIPAIS DO BANCO DE DADOS
// ============================================================================

/**
 * INTERFACE: User
 * 
 * Representa um usuário da rede social.
 * Corresponde à tabela 'users' no banco de dados.
 * 
 * CAMPOS OBRIGATÓRIOS:
 * - user_id: Chave primária, auto increment
 * - username: Único, mínimo 3 caracteres
 * - email: Único, validado com regex
 * - birth_date: Data de nascimento (idade mínima 13 anos)
 * - created_at/updated_at: Timestamps automáticos
 * 
 * CAMPOS OPCIONAIS:
 * - profile_photo: URL ou path para foto do perfil
 * - bio, location, website: Informações adicionais do perfil
 * - is_verified: Badge de verificação (default false)
 * 
 * BACKEND TODO:
 * - Implementar validação de username único
 * - Validar formato de email com regex
 * - Calcular idade mínima na criação
 * - Hash da senha com bcrypt (campo não exposto no frontend)
 */
export interface User {
  user_id: number;
  username: string;
  email: string;
  birth_date: string;
  profile_photo?: string | null;
  bio?: string;
  location?: string;
  website?: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * INTERFACE: Post
 * 
 * Representa uma postagem na rede social.
 * Corresponde à tabela 'posts' no banco de dados.
 * 
 * TIPOS SUPORTADOS:
 * - 'texto': Postagem apenas com texto
 * - 'imagem': Postagem com imagem (e opcionalmente texto)
 * 
 * CAMPOS CALCULADOS (vêm de JOINs):
 * - username, profile_photo: Dados do autor da postagem
 * - like_count, dislike_count: Contadores de avaliações
 * - comment_count: Número de comentários
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/posts para criar postagens
 * - Endpoint GET /api/posts com paginação e filtros
 * - Upload de imagens com validação de tipo/tamanho
 * - Triggers para atualizar contadores automaticamente
 */
export interface Post {
  post_id: number; // ID único do post
  id?: number; // Alias opcional para compatibilidade
  user_id: number; // ID do usuário que criou o post
  content: string; // Conteúdo do post
  post_type: string; // Tipo do post (ex: "texto", "imagem")
  created_at: string; // Data de criação
  updated_at?: string; // Data de atualização
  username: string; // Nome do usuário
  profile_photo?: string | null; // Foto de perfil do usuário
  like_count: number; // Número de curtidas
  dislike_count: number; // Número de descurtidas
  comment_count: number; // Número de comentários
  comments?: Comment[]; // Lista de comentários associados ao post
}

/**
 * INTERFACE: Comment
 * 
 * Representa comentários em postagens com suporte a hierarquia.
 * Corresponde à tabela 'comments' no banco de dados.
 * 
 * HIERARQUIA DE COMENTÁRIOS:
 * - post_id: Comentário direto na postagem
 * - parent_comment_id: Resposta a outro comentário
 * - replies: Array de respostas (carregado recursivamente)
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/comments para criar comentários
 * - Endpoint GET /api/comments/:post_id com carregamento hierárquico
 * - Validação de profundidade máxima (ex: 3 níveis)
 * - Notificações automáticas para menções
 */
export interface Comment {
  id: number; // ID único do comentário
  comment_id?: number; // Alias opcional para compatibilidade com o backend
  post_id: number; // ID do post ao qual o comentário pertence
  parent_comment_id?: number; // ID do comentário pai (para respostas)
  content: string; // Conteúdo do comentário
  user_id: number; // ID do usuário que fez o comentário
  username: string; // Nome do usuário
  profile_photo?: string | null; // Foto de perfil do usuário
  likes: number; // Número de curtidas
  dislikes: number; // Número de descurtidas
  liked?: boolean; // Indica se o usuário curtiu o comentário
  disliked?: boolean; // Indica se o usuário descurtiu o comentário
  created_at: string; // Data de criação
  updated_at?: string; // Data de atualização
  replies?: Comment[]; // Respostas ao comentário
}

/**
 * INTERFACE: Rating
 * 
 * Representa avaliações (likes/dislikes) de postagens e comentários.
 * Corresponde à tabela 'ratings' no banco de dados.
 * 
 * REGRAS DE NEGÓCIO:
 * - Um usuário pode avaliar uma postagem/comentário apenas uma vez
 * - Pode alterar de like para dislike e vice-versa
 * - Constraint UNIQUE (user_id, post_id) e (user_id, comment_id)
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/ratings para avaliar
 * - Endpoint PUT /api/ratings/:id para alterar avaliação
 * - Endpoint DELETE /api/ratings/:id para remover avaliação
 * - Triggers para atualizar contadores em posts/comments
 */
export interface Rating {
  rating_id: number;
  user_id: number;
  post_id?: number;
  comment_id?: number;
  rating_type: 'like' | 'dislike';
  created_at: string;
}

/**
 * INTERFACE: Group
 * 
 * Representa grupos temáticos da rede social.
 * Corresponde à tabela 'groups' no banco de dados.
 * 
 * CARACTERÍSTICAS:
 * - Qualquer usuário pode criar um grupo
 * - Criador automaticamente vira admin
 * - Admins podem adicionar outros admins
 * - Membros podem sair livremente
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/groups para criar grupos
 * - Endpoint GET /api/groups com busca e filtros
 * - Endpoint POST /api/groups/:id/join para entrar
 * - Endpoint DELETE /api/groups/:id/leave para sair
 * - Sistema de permissões para admins
 */
export interface Group {
  group_id: number;
  group_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  // Contadores básicos
  member_count?: number;
  admin_count?: number;
  user_role?: 'admin' | 'member';
}

/**
 * INTERFACE: GroupMember
 * 
 * Representa a associação entre usuários e grupos.
 * Corresponde à tabela 'group_members' no banco de dados.
 * 
 * ROLES DISPONÍVEIS:
 * - 'admin': Pode gerenciar grupo e membros
 * - 'member': Participa do grupo normalmente
 * 
 * BACKEND TODO:
 * - Trigger para tornar criador do grupo admin automaticamente
 * - Validação para não permitir grupo sem pelo menos 1 admin
 * - Endpoint para promover/rebaixar membros (apenas admins)
 */
export interface GroupMember {
  membership_id: number;
  user_id: number;
  group_id: number;
  role: 'admin' | 'member';
  joined_at: string;
  // Dados do usuário (join)
  username?: string;
  profile_photo?: string | null;
}

/**
 * INTERFACE: Message
 * 
 * Representa mensagens privadas entre usuários.
 * Corresponde à tabela 'messages' no banco de dados.
 * 
 * STATUS DE ENTREGA:
 * - 'sent': Mensagem enviada
 * - 'received': Mensagem entregue ao destinatário
 * - 'read': Mensagem lida pelo destinatário
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/messages para enviar mensagens
 * - Endpoint GET /api/messages/conversations para listar conversas
 * - Endpoint PUT /api/messages/:id/read para marcar como lida
 * - WebSocket para mensagens em tempo real
 * - Triggers para atualizar status automaticamente
 */
export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  status: 'sent' | 'received' | 'read';
  sent_at: string;
  received_at?: string;
  read_at?: string;
  // Dados do usuário (join)
  sender_username?: string;
  receiver_username?: string;
  sender_photo?: string | null;
  receiver_photo?: string | null;
}

/**
 * INTERFACE: Tag
 * 
 * Representa tags de interesse dos usuários.
 * Corresponde à tabela 'tags' no banco de dados.
 * 
 * CARACTERÍSTICAS:
 * - Tags são únicas no sistema
 * - Criadas automaticamente quando atribuídas
 * - Usuários podem ter até 5 tags
 * 
 * BACKEND TODO:
 * - Endpoint GET /api/tags para buscar tags existentes
 * - Endpoint POST /api/tags para criar nova tag
 * - Autocomplete com busca parcial
 * - Estatísticas de popularidade das tags
 */
export interface Tag {
  tag_id: number;
  tag_name: string;
  created_at: string;
  // Contadores básicos
  user_count?: number;
}

/**
 * INTERFACE: UserTag
 * 
 * Representa a associação entre usuários e tags.
 * Corresponde à tabela 'user_tags' no banco de dados.
 * 
 * REGRAS DE NEGÓCIO:
 * - Máximo 5 tags por usuário (validado no backend)
 * - Constraint UNIQUE (user_id, tag_id)
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/users/:id/tags para adicionar tag
 * - Endpoint DELETE /api/users/:id/tags/:tag_id para remover
 * - Validação do limite de 5 tags por usuário
 */
export interface UserTag {
  user_tag_id: number;
  user_id: number;
  tag_id: number;
  created_at: string;
  // Dados da tag (join)
  tag_name?: string;
}

/**
 * INTERFACE: Connection
 * 
 * Representa conexões/relacionamentos entre usuários.
 * Corresponde à tabela 'connections' no banco de dados.
 * 
 * STATUS DISPONÍVEIS:
 * - 'pending': Solicitação enviada, aguardando resposta
 * - 'accepted': Conexão aceita, usuários são "amigos"
 * - 'blocked': Usuário bloqueado
 * 
 * BACKEND TODO:
 * - Endpoint POST /api/connections/request para solicitar conexão
 * - Endpoint PUT /api/connections/:id/accept para aceitar
 * - Endpoint PUT /api/connections/:id/block para bloquear
 * - Endpoint DELETE /api/connections/:id para remover conexão
 * - Notificações automáticas para solicitações
 */
export interface Connection {
  connection_id: number;
  user_id: number;
  connected_user_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  // Dados do usuário conectado (join)
  connected_username?: string;
  connected_photo?: string | null;
}

// ============================================================================
// VIEWS E ESTATÍSTICAS DO BANCO DE DADOS
// ============================================================================

/**
 * INTERFACE: PostStats
 * 
 * Representa estatísticas agregadas de uma postagem.
 * Corresponde à view 'post_stats' no banco de dados.
 * 
 * BACKEND TODO:
 * - View SQL com contadores otimizados
 * - Cache Redis para estatísticas populares
 * - Atualização via triggers quando ratings/comments mudam
 */
export interface PostStats {
  post_id: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  last_updated: string;
}

/**
 * INTERFACE: UserProfile
 * 
 * Representa o perfil completo de um usuário com estatísticas.
 * Corresponde à view 'user_profile_stats' no banco de dados.
 * 
 * CAMPOS CALCULADOS:
 * - tags: String concatenada das tags do usuário
 * - tag_count: Número de tags associadas
 * - post_count: Número de postagens criadas
 * - comment_count: Número de comentários feitos
 * - rating_count: Número de avaliações dadas
 * 
 * BACKEND TODO:
 * - View SQL otimizada com JOINs e agregações
 * - Cache de perfis populares
 * - Endpoint GET /api/users/:id/profile
 */
export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  birth_date: string;
  profile_photo?: string | null;
  bio: string;
  location?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
  is_verified: boolean;
}

/**
 * INTERFACE: Conversation
 * 
 * Representa uma conversa entre dois usuários com estatísticas.
 * Corresponde à view 'conversation_summaries' no banco de dados.
 * 
 * CAMPOS CALCULADOS:
 * - message_count: Total de mensagens na conversa
 * - read_count: Mensagens lidas
 * - unread_count: Mensagens não lidas
 * - last_message_content: Prévia da última mensagem
 * 
 * BACKEND TODO:
 * - View SQL complexa com agregações
 * - Endpoint GET /api/messages/conversations
 * - Ordenação por última mensagem
 * - Contadores de mensagens não lidas
 */
export interface Conversation {
  user1_id: number;
  user2_id: number;
  last_message_at: string;
  message_count: number;
  read_count: number;
  unread_count: number;
  // Dados dos usuários (join)
  other_user_id?: number;
  other_username?: string;
  other_photo?: string | null;
  last_message_content?: string;
}

/**
 * INTERFACE: DashboardMetrics
 * 
 * Representa métricas gerais da aplicação para dashboard admin.
 * Dados calculados a partir de múltiplas tabelas.
 * 
 * BACKEND TODO:
 * - Endpoint GET /api/admin/dashboard (apenas admins)
 * - Queries agregadas otimizadas
 * - Cache Redis com TTL de 1 hora
 * - Gráficos e estatísticas em tempo real
 */
export interface DashboardMetrics {
  total_users: number;
  total_posts: number;
  total_comments: number;
  total_groups: number;
  total_messages: number;
  total_connections: number;
  posts_today: number;
  new_users_week: number;
  avg_comments_per_post: number;
  avg_likes_per_post: number;
}

// ============================================================================
// FORMULÁRIOS E INTERFACE DE USUÁRIO
// ============================================================================

/**
 * INTERFACE: CreatePostForm
 * 
 * Dados para criação de nova postagem.
 * Validações no frontend e backend.
 * 
 * VALIDAÇÕES NECESSÁRIAS:
 * - content: Não vazio, máximo 500 caracteres
 * - post_type: Enum válido
 * - image_file: Tipos permitidos (jpg, png, gif), max 5MB
 * 
 * BACKEND TODO:
 * - Validação de conteúdo com sanitização
 * - Upload de imagem para storage (AWS S3, Cloudinary)
 * - Redimensionamento automático de imagens
 */
export interface CreatePostForm {
  content: string;
  post_type: 'texto' | 'imagem';
  image_file?: File;
}

/**
 * INTERFACE: CreateCommentForm
 * 
 * Dados para criação de comentário ou resposta.
 * 
 * REGRAS:
 * - post_id OU parent_comment_id (nunca ambos)
 * - content obrigatório, máximo 300 caracteres
 * 
 * BACKEND TODO:
 * - Validação de existência do post/comment pai
 * - Limite de profundidade de respostas (ex: 3 níveis)
 * - Notificações automáticas para menções (@username)
 */
export interface CreateCommentForm {
  content: string;
  post_id?: number;
  parent_comment_id?: number;
}

/**
 * INTERFACE: CreateGroupForm
 * 
 * Dados para criação de novo grupo.
 * 
 * VALIDAÇÕES:
 * - group_name: Único, 3-50 caracteres
 * - description: Máximo 200 caracteres
 * 
 * BACKEND TODO:
 * - Validação de nome único
 * - Criador automaticamente vira admin
 * - Trigger para adicionar na tabela group_members
 */
export interface CreateGroupForm {
  group_name: string;
  description: string;
}

/**
 * INTERFACE: SendMessageForm
 * 
 * Dados para envio de mensagem privada.
 * 
 * VALIDAÇÕES:
 * - receiver_id: Usuário válido e não bloqueado
 * - content: Não vazio, máximo 1000 caracteres
 * 
 * BACKEND TODO:
 * - Verificar se usuários não estão bloqueados
 * - WebSocket para entrega em tempo real
 * - Criptografia de mensagens (opcional)
 */
export interface SendMessageForm {
  receiver_id: number;
  content: string;
}

/**
 * INTERFACE: UpdateProfileForm
 * 
 * Dados para atualização do perfil do usuário.
 * Todos os campos são opcionais (atualização parcial).
 * 
 * VALIDAÇÕES:
 * - username: Único se fornecido
 * - email: Formato válido e único se fornecido
 * - birth_date: Idade mínima 13 anos se fornecido
 * 
 * BACKEND TODO:
 * - Validação de unicidade apenas se campos mudaram
 * - Upload de nova foto de perfil
 * - Histórico de alterações para auditoria
 */
export interface UpdateProfileForm {
  username?: string;
  email?: string;
  birth_date?: string;
  profile_photo?: string | null;
  bio?: string;
  location?: string;
  website?: string;
}

// ============================================================================
// RESPOSTAS DA API E PAGINAÇÃO
// ============================================================================

/**
 * INTERFACE: ApiResponse<T>
 * 
 * Formato padrão de resposta da API.
 * Usado em todos os endpoints para consistência.
 * 
 * BACKEND TODO:
 * - Middleware para padronizar respostas
 * - Códigos HTTP apropriados (200, 201, 400, 401, 404, 500)
 * - Logs estruturados para debugging
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * INTERFACE: PaginatedResponse<T>
 * 
 * Resposta paginada para listas grandes de dados.
 * 
 * CAMPOS:
 * - data: Array dos itens da página atual
 * - total: Total de itens disponíveis
 * - page: Página atual (1-indexed)
 * - limit: Itens por página
 * - has_next/has_prev: Facilitam navegação no frontend
 * 
 * BACKEND TODO:
 * - Implementar em todos endpoints de listagem
 * - Limite máximo de itens por página (ex: 50)
 * - Otimização com OFFSET/LIMIT ou cursor-based
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// ============================================================================
// CONTEXTOS E HOOKS CUSTOMIZADOS
// ============================================================================

/**
 * INTERFACE: AuthContextType
 * 
 * Contexto de autenticação do React.
 * Gerencia estado global do usuário logado.
 * 
 * MÉTODOS:
 * - login: Autentica com email/senha
 * - logout: Remove tokens e limpa estado
 * - register: Cria nova conta
 * - updateProfile: Atualiza dados do usuário logado
 * 
 * BACKEND TODO:
 * - JWT tokens com refresh token
 * - Endpoint POST /api/auth/login
 * - Endpoint POST /api/auth/register  
 * - Endpoint POST /api/auth/refresh
 * - Endpoint POST /api/auth/logout
 * - Middleware de autenticação em rotas protegidas
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterForm) => Promise<boolean>;
  updateProfile: (data: UpdateProfileForm) => Promise<boolean>;
}

/**
 * INTERFACE: RegisterForm
 * 
 * Dados para registro de novo usuário.
 * 
 * VALIDAÇÕES FRONTEND:
 * - username: 3-20 caracteres, alfanumérico
 * - email: Formato válido
 * - password: Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 número
 * - birth_date: Idade mínima 13 anos
 * 
 * BACKEND TODO:
 * - Hash da senha com bcrypt (salt rounds: 12)
 * - Validação de unicidade (username, email)
 * - Email de confirmação (opcional)
 * - Rate limiting para prevenir spam
 */
export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  birth_date: string;
}

// ============================================================================
// NOTIFICAÇÕES E FEEDBACK DO SISTEMA
// ============================================================================

/**
 * INTERFACE: Notification
 * 
 * Notificações do sistema para feedback ao usuário.
 * Gerenciadas pelo hook useNotifications.
 * 
 * TIPOS:
 * - success: Operação bem-sucedida (verde)
 * - error: Erro ou falha (vermelho)
 * - warning: Aviso importante (amarelo)
 * - info: Informação geral (azul)
 * 
 * BACKEND TODO (FUTURO):
 * - Sistema de notificações push
 * - Persistência de notificações no banco
 * - WebSocket para notificações em tempo real
 * - Configurações de preferência do usuário
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ============================================================================
// FILTROS E PARÂMETROS DE BUSCA
// ============================================================================

/**
 * INTERFACE: PostFilters
 * 
 * Filtros para busca e listagem de postagens.
 * Usado em endpoints GET /api/posts.
 * 
 * BACKEND TODO:
 * - Query builder dinâmico baseado nos filtros
 * - Índices no banco para campos de filtro/ordenação
 * - Full-text search no campo content
 * - Cache de consultas populares
 */
export interface PostFilters {
  user_id?: number;
  post_type?: 'texto' | 'imagem';
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: 'created_at' | 'like_count' | 'comment_count';
  sort_order?: 'asc' | 'desc';
}

/**
 * INTERFACE: UserFilters
 * 
 * Filtros para busca de usuários.
 * Usado em endpoints GET /api/users.
 * 
 * BACKEND TODO:
 * - Busca parcial no username (ILIKE '%search%')
 * - Filtro por tags com JOIN na user_tags
 * - Ordenação por popularidade (post_count, etc.)
 */
export interface UserFilters {
  search?: string;
  has_tags?: string[];
  joined_after?: string;
  sort_by?: 'username' | 'created_at' | 'post_count';
  sort_order?: 'asc' | 'desc';
}

/**
 * INTERFACE: GroupFilters
 * 
 * Filtros para busca de grupos.
 * Usado em endpoints GET /api/groups.
 * 
 * BACKEND TODO:
 * - Busca em group_name e description
 * - Filtro por tamanho mínimo de membros
 * - Ordenação por popularidade e atividade
 */
export interface GroupFilters {
  search?: string;
  member_count_min?: number;
  created_after?: string;
  sort_by?: 'group_name' | 'created_at' | 'member_count';
  sort_order?: 'asc' | 'desc';
}

// Mock data para desenvolvimento
const mockUser: User = {
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
};

const mockPosts: Post[] = [
  {
    post_id: 1,
    user_id: 1,
    content: 'Acabei de lançar meu novo projeto! Uma aplicação React com Material UI que demonstra os princípios de uma rede social aberta e transparente. 🎉',
    post_type: 'texto',
    created_at: '2024-12-19T10:30:00Z',
    updated_at: '2024-12-19T10:30:00Z',
    username: 'joao_silva',
    profile_photo: null,
    like_count: 25,
    dislike_count: 1,
    comment_count: 12,
  },
];
