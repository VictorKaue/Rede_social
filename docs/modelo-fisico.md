# Modelo Físico - Rede Social

## Visão Geral

O modelo físico representa a implementação concreta do banco de dados da rede social, incluindo especificações de hardware, configurações de SGBD, estratégias de backup, monitoramento e otimizações específicas para ambiente de produção.

## Especificações de Hardware Recomendadas

### Ambiente de Desenvolvimento
- **CPU**: 4 cores, 2.5GHz
- **RAM**: 8GB
- **Storage**: SSD 256GB
- **SGBD**: PostgreSQL 14+ ou MySQL 8.0+

### Ambiente de Produção
- **CPU**: 8+ cores, 3.0GHz
- **RAM**: 32GB+
- **Storage**: SSD NVMe 1TB+ (RAID 10)
- **Network**: Gigabit Ethernet
- **SGBD**: PostgreSQL 15+ (recomendado)

## Configurações do PostgreSQL

### postgresql.conf
```ini
# Configurações de Memória
shared_buffers = 8GB                    # 25% da RAM total
effective_cache_size = 24GB             # 75% da RAM total
work_mem = 256MB                        # Para operações complexas
maintenance_work_mem = 2GB              # Para VACUUM, CREATE INDEX

# Configurações de WAL
wal_buffers = 64MB
checkpoint_completion_target = 0.9
max_wal_size = 4GB
min_wal_size = 1GB

# Configurações de Conexão
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# Configurações de Log
log_statement = 'mod'                   # Log de modificações
log_min_duration_statement = 1000       # Log queries > 1s
log_checkpoints = on
log_connections = on
log_disconnections = on

# Configurações de Performance
random_page_cost = 1.1                  # Para SSD
effective_io_concurrency = 200          # Para SSD
```

### pg_hba.conf
```ini
# Configurações de Autenticação
local   all             postgres                                peer
local   all             rede_social_user                        md5
host    rede_social_db  rede_social_user    127.0.0.1/32       md5
host    rede_social_db  rede_social_user    ::1/128            md5
```

## Estrutura de Tablespaces

### Tablespaces Personalizados
```sql
-- Tablespace para dados principais
CREATE TABLESPACE ts_rede_social_data
LOCATION '/var/lib/postgresql/tablespaces/data';

-- Tablespace para índices
CREATE TABLESPACE ts_rede_social_indexes
LOCATION '/var/lib/postgresql/tablespaces/indexes';

-- Tablespace para dados temporários
CREATE TABLESPACE ts_rede_social_temp
LOCATION '/var/lib/postgresql/tablespaces/temp';

-- Configurar tablespace padrão
SET default_tablespace = 'ts_rede_social_data';
```

### Distribuição de Tabelas
```sql
-- Tabelas principais no tablespace de dados
ALTER TABLE users SET TABLESPACE ts_rede_social_data;
ALTER TABLE posts SET TABLESPACE ts_rede_social_data;
ALTER TABLE messages SET TABLESPACE ts_rede_social_data;

-- Índices no tablespace específico
ALTER INDEX IDX_posts_user_created SET TABLESPACE ts_rede_social_indexes;
ALTER INDEX IDX_messages_conversation SET TABLESPACE ts_rede_social_indexes;
```

## Particionamento de Tabelas

### Particionamento por Data (messages)
```sql
-- Recriar tabela messages com particionamento
CREATE TABLE messages_partitioned (
    message_id      SERIAL,
    sender_id       INTEGER NOT NULL,
    receiver_id     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at     TIMESTAMP,
    read_at         TIMESTAMP
) PARTITION BY RANGE (sent_at);

-- Partições mensais
CREATE TABLE messages_2024_01 PARTITION OF messages_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE messages_2024_02 PARTITION OF messages_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Script para criar partições automaticamente
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    table_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE);
    end_date := start_date + interval '1 month';
    table_name := 'messages_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF messages_partitioned
                    FOR VALUES FROM (%L) TO (%L)',
                   table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### Particionamento por Hash (ratings)
```sql
-- Particionamento por hash para distribuir carga
CREATE TABLE ratings_partitioned (
    rating_id       SERIAL,
    user_id         INTEGER NOT NULL,
    post_id         INTEGER,
    comment_id      INTEGER,
    rating_type     VARCHAR(10) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY HASH (user_id);

-- 4 partições hash
CREATE TABLE ratings_part_0 PARTITION OF ratings_partitioned
FOR VALUES WITH (modulus 4, remainder 0);

CREATE TABLE ratings_part_1 PARTITION OF ratings_partitioned
FOR VALUES WITH (modulus 4, remainder 1);

CREATE TABLE ratings_part_2 PARTITION OF ratings_partitioned
FOR VALUES WITH (modulus 4, remainder 2);

CREATE TABLE ratings_part_3 PARTITION OF ratings_partitioned
FOR VALUES WITH (modulus 4, remainder 3);
```

## Índices Avançados

### Índices Compostos Otimizados
```sql
-- Índice para timeline de usuários
CREATE INDEX CONCURRENTLY IDX_posts_timeline 
ON posts (user_id, created_at DESC, post_type)
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Índice para busca de mensagens
CREATE INDEX CONCURRENTLY IDX_messages_search
ON messages (sender_id, receiver_id, sent_at DESC)
WHERE status != 'deleted';

-- Índice para estatísticas de postagens
CREATE INDEX CONCURRENTLY IDX_ratings_stats
ON ratings (post_id, rating_type, created_at)
WHERE post_id IS NOT NULL;
```

### Índices Parciais
```sql
-- Índice apenas para conexões ativas
CREATE INDEX CONCURRENTLY IDX_connections_active
ON connections (user_id, connected_user_id)
WHERE status = 'accepted';

-- Índice apenas para mensagens não lidas
CREATE INDEX CONCURRENTLY IDX_messages_unread
ON messages (receiver_id, sent_at)
WHERE status IN ('sent', 'received');
```

### Índices de Texto Completo
```sql
-- Índice para busca em postagens
CREATE INDEX CONCURRENTLY IDX_posts_fulltext
ON posts USING gin(to_tsvector('portuguese', content));

-- Índice para busca em comentários
CREATE INDEX CONCURRENTLY IDX_comments_fulltext
ON comments USING gin(to_tsvector('portuguese', content));

-- Função de busca otimizada
CREATE OR REPLACE FUNCTION search_content(search_term text)
RETURNS TABLE(
    content_type text,
    content_id integer,
    username text,
    content text,
    created_at timestamp,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'post'::text,
        p.post_id,
        u.username,
        p.content,
        p.created_at,
        ts_rank(to_tsvector('portuguese', p.content), plainto_tsquery('portuguese', search_term))
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    WHERE to_tsvector('portuguese', p.content) @@ plainto_tsquery('portuguese', search_term)
    
    UNION ALL
    
    SELECT 
        'comment'::text,
        c.comment_id,
        u.username,
        c.content,
        c.created_at,
        ts_rank(to_tsvector('portuguese', c.content), plainto_tsquery('portuguese', search_term))
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE to_tsvector('portuguese', c.content) @@ plainto_tsquery('portuguese', search_term)
    
    ORDER BY rank DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

## Estratégias de Backup

### Backup Físico (pg_basebackup)
```bash
#!/bin/bash
# Script de backup completo
BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$DATE"

# Backup base
pg_basebackup -D "$BACKUP_PATH" -Ft -z -P -U postgres

# Compressão adicional
tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_PATH"

# Limpeza de backups antigos (manter 7 dias)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete
```

### Backup Lógico (pg_dump)
```bash
#!/bin/bash
# Script de backup lógico
BACKUP_DIR="/backup/logical"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="rede_social_db"

# Backup completo
pg_dump -U postgres -h localhost -d "$DB_NAME" \
        -f "$BACKUP_DIR/dump_$DATE.sql" \
        --verbose --no-owner --no-privileges

# Backup apenas da estrutura
pg_dump -U postgres -h localhost -d "$DB_NAME" \
        -f "$BACKUP_DIR/schema_$DATE.sql" \
        --schema-only --verbose

# Backup apenas dos dados
pg_dump -U postgres -h localhost -d "$DB_NAME" \
        -f "$BACKUP_DIR/data_$DATE.sql" \
        --data-only --verbose
```

### Configuração de WAL Archiving
```ini
# postgresql.conf
archive_mode = on
archive_command = 'cp %p /backup/wal_archive/%f'
archive_timeout = 300  # 5 minutos
```

## Monitoramento e Alertas

### Queries de Monitoramento
```sql
-- Monitoramento de performance
CREATE VIEW v_performance_monitor AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Monitoramento de índices
CREATE VIEW v_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Queries mais lentas
CREATE VIEW v_slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY mean_time DESC;
```

### Script de Monitoramento
```bash
#!/bin/bash
# Script de monitoramento automático

# Verificar conexões ativas
CONNECTIONS=$(psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
if [ "$CONNECTIONS" -gt 150 ]; then
    echo "ALERTA: Muitas conexões ativas ($CONNECTIONS)"
fi

# Verificar tamanho do banco
DB_SIZE=$(psql -U postgres -t -c "SELECT pg_size_pretty(pg_database_size('rede_social_db'));")
echo "Tamanho do banco: $DB_SIZE"

# Verificar queries lentas
SLOW_QUERIES=$(psql -U postgres -t -c "SELECT count(*) FROM pg_stat_statements WHERE mean_time > 1000;")
if [ "$SLOW_QUERIES" -gt 10 ]; then
    echo "ALERTA: $SLOW_QUERIES queries com tempo médio > 1s"
fi

# Verificar espaço em disco
DISK_USAGE=$(df -h /var/lib/postgresql | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "ALERTA: Uso de disco em $DISK_USAGE%"
fi
```

## Otimizações de Performance

### Configuração de Connection Pooling (PgBouncer)
```ini
# pgbouncer.ini
[databases]
rede_social_db = host=localhost port=5432 dbname=rede_social_db

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
server_lifetime = 3600
server_idle_timeout = 600
```

### Configuração de Cache (Redis)
```redis
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Estratégias de Cache da Aplicação
```sql
-- Cache de estatísticas de usuários
CREATE MATERIALIZED VIEW mv_user_stats AS
SELECT 
    u.user_id,
    u.username,
    COUNT(DISTINCT p.post_id) as post_count,
    COUNT(DISTINCT c.comment_id) as comment_count,
    COUNT(DISTINCT r.rating_id) as rating_count,
    COUNT(DISTINCT conn.connection_id) as connection_count
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
LEFT JOIN comments c ON u.user_id = c.user_id
LEFT JOIN ratings r ON u.user_id = r.user_id
LEFT JOIN connections conn ON u.user_id = conn.user_id AND conn.status = 'accepted'
GROUP BY u.user_id, u.username;

-- Refresh automático da view materializada
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
END;
$$ LANGUAGE plpgsql;

-- Agendar refresh a cada hora
SELECT cron.schedule('refresh-user-stats', '0 * * * *', 'SELECT refresh_user_stats();');
```

## Segurança e Controle de Acesso

### Usuários e Roles
```sql
-- Role para aplicação
CREATE ROLE rede_social_app;
GRANT CONNECT ON DATABASE rede_social_db TO rede_social_app;
GRANT USAGE ON SCHEMA public TO rede_social_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rede_social_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rede_social_app;

-- Role para leitura apenas (relatórios)
CREATE ROLE rede_social_readonly;
GRANT CONNECT ON DATABASE rede_social_db TO rede_social_readonly;
GRANT USAGE ON SCHEMA public TO rede_social_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rede_social_readonly;

-- Usuário da aplicação
CREATE USER app_user WITH PASSWORD 'senha_segura_123!';
GRANT rede_social_app TO app_user;

-- Usuário para relatórios
CREATE USER report_user WITH PASSWORD 'senha_relatorio_456!';
GRANT rede_social_readonly TO report_user;
```

### Row Level Security (RLS)
```sql
-- Habilitar RLS para mensagens
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas mensagens
CREATE POLICY messages_user_policy ON messages
FOR ALL TO rede_social_app
USING (sender_id = current_setting('app.current_user_id')::integer 
       OR receiver_id = current_setting('app.current_user_id')::integer);
```

## Deployment e Migração

### Script de Deploy
```bash
#!/bin/bash
# Script de deploy da rede social

set -e

DB_NAME="rede_social_db"
DB_USER="postgres"
BACKUP_DIR="/backup/deploy"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Iniciando deploy da rede social..."

# Backup antes do deploy
echo "Criando backup..."
pg_dump -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_DIR/pre_deploy_$DATE.sql"

# Executar scripts na ordem
echo "Executando estrutura..."
psql -U "$DB_USER" -d "$DB_NAME" -f sql/estrutura/create_tables.sql

echo "Executando triggers..."
psql -U "$DB_USER" -d "$DB_NAME" -f sql/triggers/triggers.sql

echo "Inserindo dados de teste (se necessário)..."
if [ "$1" = "--with-test-data" ]; then
    psql -U "$DB_USER" -d "$DB_NAME" -f sql/dados/insert_data.sql
fi

echo "Deploy concluído com sucesso!"
```

### Versionamento de Schema
```sql
-- Tabela de controle de versão
CREATE TABLE schema_version (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100) DEFAULT CURRENT_USER
);

-- Inserir versão inicial
INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Versão inicial da rede social');
```

## Considerações de Escalabilidade

### Replicação Master-Slave
```ini
# postgresql.conf (Master)
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64
synchronous_standby_names = 'standby1'

# recovery.conf (Slave)
standby_mode = 'on'
primary_conninfo = 'host=master_ip port=5432 user=replicator'
trigger_file = '/tmp/postgresql.trigger'
```

### Sharding Horizontal
```sql
-- Estratégia de sharding por user_id
-- Shard 1: user_id % 3 = 0
-- Shard 2: user_id % 3 = 1  
-- Shard 3: user_id % 3 = 2

CREATE OR REPLACE FUNCTION get_shard_for_user(user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN user_id % 3;
END;
$$ LANGUAGE plpgsql;
```

## Métricas e KPIs

### Dashboard de Métricas
```sql
-- View para dashboard principal
CREATE VIEW v_dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM posts WHERE created_at >= CURRENT_DATE) as posts_today,
    (SELECT COUNT(*) FROM messages WHERE sent_at >= CURRENT_DATE) as messages_today,
    (SELECT COUNT(*) FROM connections WHERE status = 'accepted') as total_connections,
    (SELECT COUNT(*) FROM groups) as total_groups,
    (SELECT AVG(engagement_score) FROM (
        SELECT COUNT(DISTINCT r.rating_id) + COUNT(DISTINCT c.comment_id) as engagement_score
        FROM posts p
        LEFT JOIN ratings r ON p.post_id = r.post_id
        LEFT JOIN comments c ON p.post_id = c.post_id
        WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY p.post_id
    ) sub) as avg_engagement_week;
```

Este modelo físico fornece uma base sólida para implementação, deployment e manutenção da rede social em ambiente de produção, considerando aspectos de performance, segurança, backup e escalabilidade. 