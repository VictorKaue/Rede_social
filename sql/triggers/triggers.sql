-- =====================================================
-- PROJETO REDE SOCIAL - TRIGGERS E FUNÇÕES
-- Versão: 2.0 - Sistema Avançado de Regras de Negócio
-- Data: 2024
-- Descrição: Sistema completo de triggers que implementam
--           regras de negócio, validações de segurança,
--           otimizações de performance e auditoria
-- =====================================================

-- Configurações iniciais
SET client_encoding = 'UTF8';

-- =====================================================
-- FUNÇÕES AUXILIARES OTIMIZADAS
-- =====================================================

-- Função para atualizar campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar limite de tags por usuário (máximo 5)
CREATE OR REPLACE FUNCTION check_user_tags_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_count 
    FROM user_tags 
    WHERE user_id = NEW.user_id;
    
    IF current_count >= 5 THEN
        RAISE EXCEPTION 'Usuário não pode ter mais de 5 tags. Limite atingido (atual: %).', current_count;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status de mensagens automaticamente
CREATE OR REPLACE FUNCTION update_message_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se status mudou para 'received', atualiza received_at
    IF NEW.status = 'received' AND OLD.status = 'sent' THEN
        NEW.received_at = CURRENT_TIMESTAMP;
    -- Se status mudou para 'read', atualiza read_at e received_at se necessário
    ELSIF NEW.status = 'read' AND OLD.status IN ('sent', 'received') THEN
        NEW.read_at = CURRENT_TIMESTAMP;
        -- Se não foi marcado como recebido antes, marca agora
        IF NEW.received_at IS NULL THEN
            NEW.received_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para garantir que grupos tenham pelo menos um administrador
CREATE OR REPLACE FUNCTION ensure_group_has_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
    group_id_check INTEGER;
BEGIN
    -- Determina o group_id baseado na operação
    group_id_check := COALESCE(OLD.group_id, NEW.group_id);
    
    -- Se está removendo um membro ou mudando role de admin
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role != 'admin') THEN
        -- Conta quantos admins restam no grupo
        SELECT COUNT(*) INTO admin_count 
        FROM group_members 
        WHERE group_id = group_id_check 
        AND role = 'admin'
        AND (TG_OP = 'DELETE' OR membership_id != OLD.membership_id);
        
        -- Se não há mais admins, impede a operação
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Grupo % deve ter pelo menos um administrador.', group_id_check;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Função para log de atividades importantes com detalhes
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log quando usuário cria uma postagem
    IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
        RAISE NOTICE '[ATIVIDADE] Usuário % criou nova postagem (ID: %, Tipo: %)', 
            NEW.user_id, NEW.post_id, NEW.post_type;
    -- Log quando usuário entra em um grupo
    ELSIF TG_TABLE_NAME = 'group_members' AND TG_OP = 'INSERT' THEN
        RAISE NOTICE '[ATIVIDADE] Usuário % entrou no grupo % como %', 
            NEW.user_id, NEW.group_id, NEW.role;
    -- Log quando conexão é aceita
    ELSIF TG_TABLE_NAME = 'connections' AND TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        RAISE NOTICE '[ATIVIDADE] Conexão aceita entre usuários % e %', 
            NEW.user_id, NEW.connected_user_id;
    -- Log quando usuário é criado
    ELSIF TG_TABLE_NAME = 'users' AND TG_OP = 'INSERT' THEN
        RAISE NOTICE '[ATIVIDADE] Novo usuário registrado: % (ID: %)', 
            NEW.username, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para validar conexões bidirecionais
CREATE OR REPLACE FUNCTION validate_connection()
RETURNS TRIGGER AS $$
BEGIN
    -- Impede conexão duplicada (A->B quando já existe B->A)
    IF EXISTS (
        SELECT 1 FROM connections 
        WHERE user_id = NEW.connected_user_id 
        AND connected_user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Conexão já existe entre os usuários % e %.', 
            NEW.user_id, NEW.connected_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para impedir auto-avaliação (usuário avaliar próprio conteúdo)
CREATE OR REPLACE FUNCTION prevent_self_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se está tentando avaliar própria postagem
    IF NEW.post_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM posts 
            WHERE post_id = NEW.post_id 
            AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Usuário % não pode avaliar própria postagem (ID: %).', 
                NEW.user_id, NEW.post_id;
        END IF;
    END IF;
    
    -- Verifica se está tentando avaliar próprio comentário
    IF NEW.comment_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM comments 
            WHERE comment_id = NEW.comment_id 
            AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Usuário % não pode avaliar próprio comentário (ID: %).', 
                NEW.user_id, NEW.comment_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar conexão bidirecional automática quando aceita
CREATE OR REPLACE FUNCTION create_bidirectional_connection()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando uma conexão é aceita, cria a conexão reversa automaticamente
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO connections (user_id, connected_user_id, status, created_at, updated_at)
        VALUES (NEW.connected_user_id, NEW.user_id, 'accepted', NEW.updated_at, NEW.updated_at)
        ON CONFLICT (user_id, connected_user_id) DO UPDATE SET
            status = 'accepted',
            updated_at = NEW.updated_at;
            
        RAISE NOTICE '[CONEXÃO] Conexão bidirecional criada entre % e %', 
            NEW.user_id, NEW.connected_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para validar conteúdo de postagens e comentários
CREATE OR REPLACE FUNCTION validate_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Validações para postagens
    IF TG_TABLE_NAME = 'posts' THEN
        -- Verificar se conteúdo não é apenas espaços
        IF TRIM(NEW.content) = '' THEN
            RAISE EXCEPTION 'Conteúdo da postagem não pode estar vazio.';
        END IF;
        
        -- Verificar comprimento mínimo
        IF LENGTH(TRIM(NEW.content)) < 3 THEN
            RAISE EXCEPTION 'Conteúdo da postagem deve ter pelo menos 3 caracteres.';
        END IF;
    END IF;
    
    -- Validações para comentários
    IF TG_TABLE_NAME = 'comments' THEN
        -- Verificar se conteúdo não é apenas espaços
        IF TRIM(NEW.content) = '' THEN
            RAISE EXCEPTION 'Conteúdo do comentário não pode estar vazio.';
        END IF;
        
        -- Verificar comprimento mínimo
        IF LENGTH(TRIM(NEW.content)) < 2 THEN
            RAISE EXCEPTION 'Comentário deve ter pelo menos 2 caracteres.';
        END IF;
        
        -- Impedir comentário em postagem inexistente
        IF NEW.post_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM posts WHERE post_id = NEW.post_id) THEN
            RAISE EXCEPTION 'Postagem % não existe.', NEW.post_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para controle de spam (limite de postagens por período)
CREATE OR REPLACE FUNCTION prevent_spam()
RETURNS TRIGGER AS $$
DECLARE
    recent_posts INTEGER;
    recent_comments INTEGER;
BEGIN
    -- Controle de spam para postagens (máximo 10 por hora)
    IF TG_TABLE_NAME = 'posts' THEN
        SELECT COUNT(*) INTO recent_posts
        FROM posts 
        WHERE user_id = NEW.user_id 
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour';
        
        IF recent_posts >= 10 THEN
            RAISE EXCEPTION 'Limite de postagens por hora atingido (10). Aguarde antes de postar novamente.';
        END IF;
    END IF;
    
    -- Controle de spam para comentários (máximo 30 por hora)
    IF TG_TABLE_NAME = 'comments' THEN
        SELECT COUNT(*) INTO recent_comments
        FROM comments 
        WHERE user_id = NEW.user_id 
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour';
        
        IF recent_comments >= 30 THEN
            RAISE EXCEPTION 'Limite de comentários por hora atingido (30). Aguarde antes de comentar novamente.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES PARA CACHE DE CONTADORES BÁSICOS
-- =====================================================

-- Tabela para cache de contadores de postagens
CREATE TABLE IF NOT EXISTS post_stats_cache (
    post_id INTEGER PRIMARY KEY REFERENCES posts(post_id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar cache de contadores de postagens
CREATE OR REPLACE FUNCTION update_post_stats_cache()
RETURNS TRIGGER AS $$
DECLARE
    target_post_id INTEGER;
    like_cnt INTEGER;
    dislike_cnt INTEGER;
    comment_cnt INTEGER;
BEGIN
    -- Determina qual postagem foi afetada
    IF TG_TABLE_NAME = 'ratings' THEN
        target_post_id = COALESCE(NEW.post_id, OLD.post_id);
    ELSIF TG_TABLE_NAME = 'comments' THEN
        target_post_id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;
    
    -- Se há uma postagem afetada, atualiza o cache
    IF target_post_id IS NOT NULL THEN
        -- Calcular contadores
        SELECT 
            COUNT(CASE WHEN r.rating_type = 'like' THEN 1 END),
            COUNT(CASE WHEN r.rating_type = 'dislike' THEN 1 END),
            COUNT(DISTINCT c.comment_id)
        INTO like_cnt, dislike_cnt, comment_cnt
        FROM posts p
        LEFT JOIN ratings r ON p.post_id = r.post_id
        LEFT JOIN comments c ON p.post_id = c.post_id
        WHERE p.post_id = target_post_id;
        
        -- Inserir ou atualizar cache
        INSERT INTO post_stats_cache (post_id, like_count, dislike_count, comment_count)
        VALUES (target_post_id, like_cnt, dislike_cnt, comment_cnt)
        ON CONFLICT (post_id) DO UPDATE SET
            like_count = EXCLUDED.like_count,
            dislike_count = EXCLUDED.dislike_count,
            comment_count = EXCLUDED.comment_count,
            last_updated = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza automática de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpar mensagens muito antigas (mais de 2 anos)
    DELETE FROM messages 
    WHERE sent_at < CURRENT_DATE - INTERVAL '2 years';
    
    -- Limpar cache de contadores órfão
    DELETE FROM post_stats_cache 
    WHERE post_id NOT IN (SELECT post_id FROM posts);
    
    RAISE NOTICE '[LIMPEZA] Dados antigos removidos em %', NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CRIAÇÃO DOS TRIGGERS ORGANIZADOS POR CATEGORIA
-- =====================================================

-- CATEGORIA 1: Triggers de Atualização Automática
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

-- CATEGORIA 2: Triggers de Validação de Negócio
CREATE TRIGGER tr_user_tags_limit
    BEFORE INSERT ON user_tags
    FOR EACH ROW
    EXECUTE FUNCTION check_user_tags_limit();

CREATE TRIGGER tr_message_status_update
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_status();

CREATE TRIGGER tr_group_admin_delete
    BEFORE DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION ensure_group_has_admin();

CREATE TRIGGER tr_group_admin_update
    BEFORE UPDATE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION ensure_group_has_admin();

CREATE TRIGGER tr_validate_connection
    BEFORE INSERT ON connections
    FOR EACH ROW
    EXECUTE FUNCTION validate_connection();

-- CATEGORIA 3: Triggers de Segurança e Integridade
CREATE TRIGGER tr_prevent_self_rating
    BEFORE INSERT ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION prevent_self_rating();

CREATE TRIGGER tr_validate_post_content
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION validate_content();

CREATE TRIGGER tr_validate_comment_content
    BEFORE INSERT OR UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION validate_content();

CREATE TRIGGER tr_prevent_post_spam
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION prevent_spam();

CREATE TRIGGER tr_prevent_comment_spam
    BEFORE INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION prevent_spam();

-- CATEGORIA 4: Triggers de Log e Auditoria
CREATE TRIGGER tr_log_new_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER tr_log_new_post
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER tr_log_group_join
    AFTER INSERT ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER tr_log_connection_accepted
    AFTER UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

-- CATEGORIA 5: Triggers de Automação
CREATE TRIGGER tr_bidirectional_connection
    AFTER UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION create_bidirectional_connection();

-- CATEGORIA 6: Triggers de Cache e Performance
CREATE TRIGGER tr_update_post_stats_ratings
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_post_stats_cache();

CREATE TRIGGER tr_update_post_stats_comments
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_stats_cache();

-- =====================================================
-- INICIALIZAÇÃO DO CACHE DE CONTADORES
-- =====================================================

-- Popular cache inicial para postagens existentes
INSERT INTO post_stats_cache (post_id, like_count, dislike_count, comment_count)
SELECT 
    p.post_id,
    COUNT(CASE WHEN r.rating_type = 'like' THEN 1 END) as like_count,
    COUNT(CASE WHEN r.rating_type = 'dislike' THEN 1 END) as dislike_count,
    COUNT(DISTINCT c.comment_id) as comment_count
FROM posts p
LEFT JOIN ratings r ON p.post_id = r.post_id
LEFT JOIN comments c ON p.post_id = c.post_id
GROUP BY p.post_id
ON CONFLICT (post_id) DO NOTHING;

-- =====================================================
-- FUNÇÕES DE MANUTENÇÃO E MONITORAMENTO
-- =====================================================

-- Função para verificar integridade do sistema
CREATE OR REPLACE FUNCTION check_system_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar grupos sem administrador
    RETURN QUERY
    SELECT 
        'Grupos sem Admin'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERRO' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'Todos os grupos têm administrador' 
             ELSE COUNT(*)::TEXT || ' grupos sem administrador' END::TEXT
    FROM groups g
    WHERE NOT EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = g.group_id AND gm.role = 'admin'
    );
    
    -- Verificar usuários com mais de 5 tags
    RETURN QUERY
    SELECT 
        'Limite de Tags'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERRO' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'Todos os usuários respeitam o limite' 
             ELSE COUNT(*)::TEXT || ' usuários com mais de 5 tags' END::TEXT
    FROM (
        SELECT user_id, COUNT(*) as tag_count
        FROM user_tags
        GROUP BY user_id
        HAVING COUNT(*) > 5
    ) violations;
    
    -- Verificar cache desatualizado
    RETURN QUERY
    SELECT 
        'Cache Atualizado'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'AVISO' END::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'Cache está atualizado' 
             ELSE COUNT(*)::TEXT || ' entradas de cache desatualizadas' END::TEXT
    FROM post_stats_cache
    WHERE last_updated < CURRENT_TIMESTAMP - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS E LOGS FINAIS
-- =====================================================

-- Log de criação dos triggers
DO $$
DECLARE
    trigger_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Contar triggers criados
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    -- Contar funções criadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name LIKE '%user%' OR routine_name LIKE '%post%' OR routine_name LIKE '%message%';
    
    RAISE NOTICE '=== SISTEMA DE TRIGGERS IMPLEMENTADO ===';
    RAISE NOTICE 'Versão: 2.0 - Sistema Avançado';
    RAISE NOTICE 'Data: %', NOW();
    RAISE NOTICE 'Triggers ativos: %', trigger_count;
    RAISE NOTICE 'Funções criadas: %', function_count;
    RAISE NOTICE '';
    RAISE NOTICE 'CATEGORIAS IMPLEMENTADAS:';
    RAISE NOTICE '- Atualização Automática: 5 triggers';
    RAISE NOTICE '- Validação de Negócio: 5 triggers';
    RAISE NOTICE '- Segurança e Integridade: 5 triggers';
    RAISE NOTICE '- Log e Auditoria: 4 triggers';
    RAISE NOTICE '- Automação: 1 trigger';
    RAISE NOTICE '- Cache e Performance: 2 triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'FUNCIONALIDADES ESPECIAIS:';
    RAISE NOTICE '- Controle de spam automático';
    RAISE NOTICE '- Cache de contadores em tempo real';
    RAISE NOTICE '- Conexões bidirecionais automáticas';
    RAISE NOTICE '- Validação de conteúdo avançada';
    RAISE NOTICE '- Sistema de auditoria completo';
    RAISE NOTICE '- Verificação de integridade';
    RAISE NOTICE '';
    RAISE NOTICE '=== SISTEMA PRONTO PARA PRODUÇÃO ===';
END $$;

-- Comentários nas funções principais
COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at em modificações';
COMMENT ON FUNCTION check_user_tags_limit() IS 'Impede que usuário tenha mais de 5 tags de interesse';
COMMENT ON FUNCTION update_message_status() IS 'Atualiza timestamps de mensagens baseado no status';
COMMENT ON FUNCTION ensure_group_has_admin() IS 'Garante que grupos sempre tenham pelo menos um administrador';
COMMENT ON FUNCTION log_user_activity() IS 'Registra atividades importantes dos usuários para auditoria';
COMMENT ON FUNCTION validate_connection() IS 'Valida conexões entre usuários evitando duplicatas';
COMMENT ON FUNCTION prevent_self_rating() IS 'Impede usuários de avaliarem próprio conteúdo';
COMMENT ON FUNCTION create_bidirectional_connection() IS 'Cria conexões bidirecionais automaticamente quando aceitas';
COMMENT ON FUNCTION validate_content() IS 'Valida conteúdo de postagens e comentários';
COMMENT ON FUNCTION prevent_spam() IS 'Sistema anti-spam com limites por período';
COMMENT ON FUNCTION update_post_stats_cache() IS 'Mantém cache de contadores de postagens atualizado';
COMMENT ON FUNCTION check_system_integrity() IS 'Verifica integridade geral do sistema';
COMMENT ON FUNCTION cleanup_old_data() IS 'Limpeza automática de dados antigos';

-- Comentário na tabela de cache
COMMENT ON TABLE post_stats_cache IS 'Cache otimizado de contadores de postagens para alta performance'; 