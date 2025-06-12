# Modelo Conceitual - Rede Social

## Visão Geral

O modelo conceitual da rede social foi desenvolvido seguindo os princípios de normalização e integridade referencial, garantindo uma estrutura robusta e escalável para suportar todas as funcionalidades requeridas.

## Entidades Principais

### 1. USUÁRIO (users)
**Descrição**: Representa os membros da rede social
**Atributos**:
- `user_id` (PK): Identificador único do usuário
- `username`: Nome de usuário único
- `email`: E-mail do usuário (único)
- `birth_date`: Data de nascimento
- `profile_photo`: URL/caminho da foto de perfil
- `created_at`: Data de criação da conta
- `updated_at`: Data da última atualização

**Regras de Negócio**:
- Username deve ser único
- E-mail deve ser único e válido
- Todos os perfis são públicos

### 2. POSTAGEM (posts)
**Descrição**: Conteúdo publicado pelos usuários
**Atributos**:
- `post_id` (PK): Identificador único da postagem
- `user_id` (FK): Referência ao usuário autor
- `content`: Conteúdo da postagem
- `post_type`: Tipo da postagem (texto, imagem)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

**Regras de Negócio**:
- Todas as postagens são públicas
- Conteúdo não pode ser vazio
- Tipos válidos: 'texto', 'imagem'

### 3. COMENTÁRIO (comments)
**Descrição**: Comentários em postagens ou respostas a outros comentários
**Atributos**:
- `comment_id` (PK): Identificador único do comentário
- `user_id` (FK): Referência ao usuário autor
- `post_id` (FK): Referência à postagem (pode ser NULL se for resposta)
- `parent_comment_id` (FK): Referência ao comentário pai (para respostas)
- `content`: Conteúdo do comentário
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

**Regras de Negócio**:
- Deve estar associado a uma postagem OU ser resposta a outro comentário
- Conteúdo não pode ser vazio
- Estrutura hierárquica para respostas

### 4. AVALIAÇÃO (ratings)
**Descrição**: Sistema de likes/dislikes para postagens e comentários
**Atributos**:
- `rating_id` (PK): Identificador único da avaliação
- `user_id` (FK): Referência ao usuário que avaliou
- `post_id` (FK): Referência à postagem (pode ser NULL)
- `comment_id` (FK): Referência ao comentário (pode ser NULL)
- `rating_type`: Tipo da avaliação (like, dislike)
- `created_at`: Data da avaliação

**Regras de Negócio**:
- Um usuário pode avaliar uma postagem OU um comentário apenas uma vez
- Tipos válidos: 'like', 'dislike'
- Deve estar associado a uma postagem OU a um comentário

### 5. GRUPO (groups)
**Descrição**: Comunidades temáticas da rede social
**Atributos**:
- `group_id` (PK): Identificador único do grupo
- `group_name`: Nome do grupo (único)
- `description`: Descrição do grupo
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

**Regras de Negócio**:
- Nome do grupo deve ser único
- Descrição é obrigatória

### 6. MEMBRO_GRUPO (group_members)
**Descrição**: Relacionamento entre usuários e grupos com papéis
**Atributos**:
- `membership_id` (PK): Identificador único da associação
- `user_id` (FK): Referência ao usuário
- `group_id` (FK): Referência ao grupo
- `role`: Papel do usuário no grupo (admin, member)
- `joined_at`: Data de entrada no grupo

**Regras de Negócio**:
- Um usuário pode ter apenas um papel por grupo
- Papéis válidos: 'admin', 'member'
- Pelo menos um administrador por grupo

### 7. MENSAGEM (messages)
**Descrição**: Sistema de mensagens privadas entre usuários
**Atributos**:
- `message_id` (PK): Identificador único da mensagem
- `sender_id` (FK): Referência ao usuário remetente
- `receiver_id` (FK): Referência ao usuário destinatário
- `content`: Conteúdo da mensagem
- `status`: Status da mensagem (sent, received, read)
- `sent_at`: Data de envio
- `received_at`: Data de recebimento
- `read_at`: Data de leitura

**Regras de Negócio**:
- Remetente e destinatário devem ser diferentes
- Status válidos: 'sent', 'received', 'read'
- Histórico completo mantido

### 8. TAG (tags)
**Descrição**: Etiquetas de interesse que podem ser associadas aos usuários
**Atributos**:
- `tag_id` (PK): Identificador único da tag
- `tag_name`: Nome da tag (único)
- `created_at`: Data de criação

**Regras de Negócio**:
- Nome da tag deve ser único
- Tags podem ser criadas livremente

### 9. USUÁRIO_TAG (user_tags)
**Descrição**: Relacionamento entre usuários e suas tags de interesse
**Atributos**:
- `user_tag_id` (PK): Identificador único da associação
- `user_id` (FK): Referência ao usuário
- `tag_id` (FK): Referência à tag
- `created_at`: Data da associação

**Regras de Negócio**:
- Um usuário pode ter no máximo 5 tags
- Não pode haver duplicatas para o mesmo usuário

### 10. CONEXÃO (connections)
**Descrição**: Relacionamentos entre usuários (amizades/seguimento)
**Atributos**:
- `connection_id` (PK): Identificador único da conexão
- `user_id` (FK): Referência ao usuário que iniciou a conexão
- `connected_user_id` (FK): Referência ao usuário conectado
- `status`: Status da conexão (pending, accepted, blocked)
- `created_at`: Data da solicitação
- `updated_at`: Data da última atualização

**Regras de Negócio**:
- Um usuário não pode se conectar consigo mesmo
- Status válidos: 'pending', 'accepted', 'blocked'
- Relacionamento bidirecional quando aceito

## Relacionamentos

### Relacionamentos 1:N
- USUÁRIO → POSTAGEM (1:N)
- USUÁRIO → COMENTÁRIO (1:N)
- USUÁRIO → AVALIAÇÃO (1:N)
- USUÁRIO → MENSAGEM (como remetente) (1:N)
- USUÁRIO → MENSAGEM (como destinatário) (1:N)
- POSTAGEM → COMENTÁRIO (1:N)
- COMENTÁRIO → COMENTÁRIO (1:N) - para respostas

### Relacionamentos N:N
- USUÁRIO ↔ GRUPO (através de MEMBRO_GRUPO)
- USUÁRIO ↔ TAG (através de USUÁRIO_TAG)
- USUÁRIO ↔ USUÁRIO (através de CONEXÃO)

### Relacionamentos Especiais
- AVALIAÇÃO pode referenciar POSTAGEM OU COMENTÁRIO (exclusivo)
- COMENTÁRIO pode referenciar POSTAGEM OU COMENTÁRIO pai (hierárquico)

## Constraints e Validações

### Constraints de Integridade
- Todas as chaves primárias são NOT NULL e UNIQUE
- Todas as chaves estrangeiras mantêm integridade referencial
- Campos obrigatórios definidos como NOT NULL
- Campos únicos definidos com UNIQUE

### Validações de Negócio
- Limite de 5 tags por usuário
- Tipos de postagem válidos
- Status de mensagem válidos
- Papéis de grupo válidos
- Tipos de avaliação válidos

### Índices Sugeridos
- `users.username` (UNIQUE)
- `users.email` (UNIQUE)
- `posts.user_id, posts.created_at`
- `comments.post_id, comments.created_at`
- `messages.sender_id, messages.sent_at`
- `messages.receiver_id, messages.sent_at`
- `ratings.post_id`
- `ratings.comment_id`

## Considerações de Performance

1. **Índices Estratégicos**: Campos frequentemente consultados
2. **Particionamento**: Considerar para tabelas de alto volume
3. **Desnormalização Controlada**: Views materializadas para consultas complexas
4. **Arquivamento**: Estratégia para dados antigos

## Considerações de Segurança

1. **Dados Sensíveis**: E-mail e data de nascimento protegidos
2. **Mensagens Privadas**: Acesso restrito aos participantes
3. **Auditoria**: Campos de timestamp para rastreabilidade
4. **Validação**: Constraints para prevenir dados inválidos 