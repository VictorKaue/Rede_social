# Modelo Lógico - Rede Social

## Visão Geral

O modelo lógico traduz o modelo conceitual em especificações técnicas precisas, definindo tipos de dados, constraints, índices e relacionamentos que serão implementados no SGBD.

## Especificações das Tabelas

### 1. users
```sql
users (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    birth_date      DATE NOT NULL,
    profile_photo   VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_users`: PRIMARY KEY (user_id)
- `UK_users_username`: UNIQUE (username)
- `UK_users_email`: UNIQUE (email)
- `CK_users_birth_date`: CHECK (birth_date <= CURRENT_DATE - INTERVAL '13 years')

**Índices**:
- `IDX_users_username`: INDEX (username)
- `IDX_users_email`: INDEX (email)
- `IDX_users_created_at`: INDEX (created_at)

### 2. posts
```sql
posts (
    post_id         SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    content         TEXT NOT NULL,
    post_type       VARCHAR(20) NOT NULL DEFAULT 'texto',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_posts`: PRIMARY KEY (post_id)
- `FK_posts_user_id`: FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `CK_posts_type`: CHECK (post_type IN ('texto', 'imagem'))
- `CK_posts_content`: CHECK (LENGTH(TRIM(content)) > 0)

**Índices**:
- `IDX_posts_user_id`: INDEX (user_id)
- `IDX_posts_created_at`: INDEX (created_at)
- `IDX_posts_user_created`: INDEX (user_id, created_at DESC)

### 3. comments
```sql
comments (
    comment_id          SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL,
    post_id             INTEGER,
    parent_comment_id   INTEGER,
    content             TEXT NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_comments`: PRIMARY KEY (comment_id)
- `FK_comments_user_id`: FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `FK_comments_post_id`: FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
- `FK_comments_parent`: FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
- `CK_comments_reference`: CHECK ((post_id IS NOT NULL AND parent_comment_id IS NULL) OR (post_id IS NULL AND parent_comment_id IS NOT NULL))
- `CK_comments_content`: CHECK (LENGTH(TRIM(content)) > 0)

**Índices**:
- `IDX_comments_post_id`: INDEX (post_id)
- `IDX_comments_parent_id`: INDEX (parent_comment_id)
- `IDX_comments_user_id`: INDEX (user_id)
- `IDX_comments_created_at`: INDEX (created_at)

### 4. ratings
```sql
ratings (
    rating_id       SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    post_id         INTEGER,
    comment_id      INTEGER,
    rating_type     VARCHAR(10) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_ratings`: PRIMARY KEY (rating_id)
- `FK_ratings_user_id`: FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `FK_ratings_post_id`: FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
- `FK_ratings_comment_id`: FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
- `CK_ratings_reference`: CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
- `CK_ratings_type`: CHECK (rating_type IN ('like', 'dislike'))
- `UK_ratings_user_post`: UNIQUE (user_id, post_id)
- `UK_ratings_user_comment`: UNIQUE (user_id, comment_id)

**Índices**:
- `IDX_ratings_post_id`: INDEX (post_id)
- `IDX_ratings_comment_id`: INDEX (comment_id)
- `IDX_ratings_user_id`: INDEX (user_id)

### 5. groups
```sql
groups (
    group_id        SERIAL PRIMARY KEY,
    group_name      VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_groups`: PRIMARY KEY (group_id)
- `UK_groups_name`: UNIQUE (group_name)
- `CK_groups_description`: CHECK (LENGTH(TRIM(description)) > 0)

**Índices**:
- `IDX_groups_name`: INDEX (group_name)
- `IDX_groups_created_at`: INDEX (created_at)

### 6. group_members
```sql
group_members (
    membership_id   SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    group_id        INTEGER NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_group_members`: PRIMARY KEY (membership_id)
- `FK_group_members_user_id`: FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `FK_group_members_group_id`: FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
- `UK_group_members_user_group`: UNIQUE (user_id, group_id)
- `CK_group_members_role`: CHECK (role IN ('admin', 'member'))

**Índices**:
- `IDX_group_members_user_id`: INDEX (user_id)
- `IDX_group_members_group_id`: INDEX (group_id)
- `IDX_group_members_role`: INDEX (role)

### 7. messages
```sql
messages (
    message_id      SERIAL PRIMARY KEY,
    sender_id       INTEGER NOT NULL,
    receiver_id     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at     TIMESTAMP,
    read_at         TIMESTAMP
)
```

**Constraints**:
- `PK_messages`: PRIMARY KEY (message_id)
- `FK_messages_sender_id`: FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
- `FK_messages_receiver_id`: FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
- `CK_messages_different_users`: CHECK (sender_id != receiver_id)
- `CK_messages_status`: CHECK (status IN ('sent', 'received', 'read'))
- `CK_messages_content`: CHECK (LENGTH(TRIM(content)) > 0)

**Índices**:
- `IDX_messages_sender_id`: INDEX (sender_id)
- `IDX_messages_receiver_id`: INDEX (receiver_id)
- `IDX_messages_sent_at`: INDEX (sent_at)
- `IDX_messages_conversation`: INDEX (sender_id, receiver_id, sent_at)

### 8. tags
```sql
tags (
    tag_id          SERIAL PRIMARY KEY,
    tag_name        VARCHAR(50) NOT NULL UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_tags`: PRIMARY KEY (tag_id)
- `UK_tags_name`: UNIQUE (tag_name)
- `CK_tags_name`: CHECK (LENGTH(TRIM(tag_name)) > 0)

**Índices**:
- `IDX_tags_name`: INDEX (tag_name)

### 9. user_tags
```sql
user_tags (
    user_tag_id     SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    tag_id          INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_user_tags`: PRIMARY KEY (user_tag_id)
- `FK_user_tags_user_id`: FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `FK_user_tags_tag_id`: FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
- `UK_user_tags_user_tag`: UNIQUE (user_id, tag_id)

**Índices**:
- `IDX_user_tags_user_id`: INDEX (user_id)
- `IDX_user_tags_tag_id`: INDEX (tag_id)

### 10. connections
```sql
connections (
    connection_id       SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL,
    connected_user_id   INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Constraints**:
- `PK_connections`: PRIMARY KEY (connection_id)
- `FK_connections_user_id`: FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `FK_connections_connected_user_id`: FOREIGN KEY (connected_user_id) REFERENCES users(user_id) ON DELETE CASCADE
- `CK_connections_different_users`: CHECK (user_id != connected_user_id)
- `CK_connections_status`: CHECK (status IN ('pending', 'accepted', 'blocked'))
- `UK_connections_users`: UNIQUE (user_id, connected_user_id)

**Índices**:
- `IDX_connections_user_id`: INDEX (user_id)
- `IDX_connections_connected_user_id`: INDEX (connected_user_id)
- `IDX_connections_status`: INDEX (status)

## Triggers e Funções

### 1. Trigger para Limite de Tags por Usuário
```sql
-- Função para verificar limite de tags
CREATE OR REPLACE FUNCTION check_user_tags_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM user_tags WHERE user_id = NEW.user_id) >= 5 THEN
        RAISE EXCEPTION 'Usuário não pode ter mais de 5 tags';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER tr_user_tags_limit
    BEFORE INSERT ON user_tags
    FOR EACH ROW
    EXECUTE FUNCTION check_user_tags_limit();
```

### 2. Trigger para Atualização Automática de updated_at
```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para tabelas relevantes
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. Trigger para Status de Mensagens
```sql
-- Função para atualizar status de mensagens
CREATE OR REPLACE FUNCTION update_message_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'received' AND OLD.status = 'sent' THEN
        NEW.received_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status = 'read' AND OLD.status IN ('sent', 'received') THEN
        NEW.read_at = CURRENT_TIMESTAMP;
        IF NEW.received_at IS NULL THEN
            NEW.received_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER tr_message_status_update
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_status();
```

## Views Úteis

### 1. View de Postagens com Estatísticas
```sql
CREATE VIEW v_posts_stats AS
SELECT 
    p.post_id,
    p.user_id,
    u.username,
    p.content,
    p.post_type,
    p.created_at,
    COUNT(DISTINCT c.comment_id) as comment_count,
    COUNT(DISTINCT CASE WHEN r.rating_type = 'like' THEN r.rating_id END) as like_count,
    COUNT(DISTINCT CASE WHEN r.rating_type = 'dislike' THEN r.rating_id END) as dislike_count
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN comments c ON p.post_id = c.post_id
LEFT JOIN ratings r ON p.post_id = r.post_id
GROUP BY p.post_id, p.user_id, u.username, p.content, p.post_type, p.created_at;
```

### 2. View de Conversas de Mensagens
```sql
CREATE VIEW v_conversations AS
SELECT DISTINCT
    LEAST(sender_id, receiver_id) as user1_id,
    GREATEST(sender_id, receiver_id) as user2_id,
    MAX(sent_at) as last_message_at,
    COUNT(*) as message_count
FROM messages
GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id);
```

## Considerações de Normalização

### Primeira Forma Normal (1FN)
- ✅ Todos os atributos são atômicos
- ✅ Não há grupos repetitivos
- ✅ Cada célula contém um único valor

### Segunda Forma Normal (2FN)
- ✅ Está em 1FN
- ✅ Todos os atributos não-chave dependem completamente da chave primária
- ✅ Não há dependências parciais

### Terceira Forma Normal (3FN)
- ✅ Está em 2FN
- ✅ Não há dependências transitivas
- ✅ Atributos não-chave dependem apenas da chave primária

## Estratégias de Performance

### Índices Compostos
- `posts(user_id, created_at DESC)`: Para timeline de usuários
- `messages(sender_id, receiver_id, sent_at)`: Para conversas
- `ratings(post_id, rating_type)`: Para contagem de likes/dislikes

### Particionamento (Futuro)
- `messages`: Por data (mensal)
- `posts`: Por data (anual)
- `ratings`: Por data (semestral)

### Caching
- Contadores de likes/dislikes
- Estatísticas de postagens
- Lista de conexões ativas 