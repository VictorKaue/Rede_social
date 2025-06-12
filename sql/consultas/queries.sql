-- =====================================================
-- PROJETO REDE SOCIAL - CONSULTAS SQL
-- Versão: 1.0
-- Data: 2024
-- Descrição: Consultas SQL realistas baseadas nas
--           funcionalidades da rede social
-- =====================================================

-- Configurações iniciais
SET client_encoding = 'UTF8';

-- =====================================================
-- CONSULTAS BÁSICAS DE USUÁRIOS
-- =====================================================

-- 1. Listar todos os usuários com suas informações básicas
SELECT 
    user_id,
    username,
    email,
    birth_date,
    EXTRACT(YEAR FROM AGE(birth_date)) as idade,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Usuários mais ativos (com mais postagens)
SELECT 
    u.username,
    u.email,
    COUNT(p.post_id) as total_postagens,
    MAX(p.created_at) as ultima_postagem
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
GROUP BY u.user_id, u.username, u.email
ORDER BY total_postagens DESC, ultima_postagem DESC;

-- =====================================================
-- CONSULTAS DE POSTAGENS E ENGAJAMENTO
-- =====================================================

-- 3. Postagens mais populares (com mais likes)
SELECT 
    p.post_id,
    u.username as autor,
    LEFT(p.content, 100) as preview_conteudo,
    p.post_type,
    COUNT(CASE WHEN r.rating_type = 'like' THEN 1 END) as likes,
    COUNT(CASE WHEN r.rating_type = 'dislike' THEN 1 END) as dislikes,
    COUNT(DISTINCT c.comment_id) as comentarios,
    p.created_at
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN ratings r ON p.post_id = r.post_id
LEFT JOIN comments c ON p.post_id = c.post_id
GROUP BY p.post_id, u.username, p.content, p.post_type, p.created_at
ORDER BY likes DESC, comentarios DESC
LIMIT 10;

-- 4. Timeline de um usuário específico (João Silva)
SELECT 
    p.post_id,
    p.content,
    p.post_type,
    p.created_at,
    COUNT(CASE WHEN r.rating_type = 'like' THEN 1 END) as likes,
    COUNT(DISTINCT c.comment_id) as comentarios
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN ratings r ON p.post_id = r.post_id
LEFT JOIN comments c ON p.post_id = c.post_id
WHERE u.username = 'joao_silva'
GROUP BY p.post_id, p.content, p.post_type, p.created_at
ORDER BY p.created_at DESC;

-- 5. Postagens com mais comentários (discussões mais ativas)
SELECT 
    p.post_id,
    u.username as autor,
    LEFT(p.content, 80) as preview,
    COUNT(c.comment_id) as total_comentarios,
    COUNT(DISTINCT c.user_id) as usuarios_participantes,
    p.created_at
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN comments c ON p.post_id = c.post_id
GROUP BY p.post_id, u.username, p.content, p.created_at
HAVING COUNT(c.comment_id) > 0
ORDER BY total_comentarios DESC, usuarios_participantes DESC
LIMIT 10;

-- =====================================================
-- CONSULTAS DE RELACIONAMENTOS E CONEXÕES
-- =====================================================

-- 6. Usuários com mais conexões aceitas
SELECT 
    u.username,
    COUNT(CASE WHEN c.status = 'accepted' THEN 1 END) as conexoes_aceitas,
    COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as solicitacoes_pendentes
FROM users u
LEFT JOIN connections c ON u.user_id = c.user_id OR u.user_id = c.connected_user_id
GROUP BY u.user_id, u.username
ORDER BY conexoes_aceitas DESC;

-- 7. Rede de conexões de um usuário específico
WITH user_connections AS (
    SELECT 
        CASE 
            WHEN c.user_id = 1 THEN c.connected_user_id
            ELSE c.user_id
        END as connected_user_id,
        c.status,
        c.created_at
    FROM connections c
    WHERE (c.user_id = 1 OR c.connected_user_id = 1)
    AND c.status = 'accepted'
)
SELECT 
    u.username as conexao,
    u.email,
    uc.created_at as conectado_em,
    COUNT(p.post_id) as postagens_recentes
FROM user_connections uc
JOIN users u ON uc.connected_user_id = u.user_id
LEFT JOIN posts p ON u.user_id = p.user_id 
    AND p.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.user_id, u.username, u.email, uc.created_at
ORDER BY uc.created_at DESC;

-- =====================================================
-- CONSULTAS DE GRUPOS E COMUNIDADES
-- =====================================================

-- 8. Grupos mais ativos (com mais membros)
SELECT 
    g.group_name,
    g.description,
    COUNT(gm.user_id) as total_membros,
    COUNT(CASE WHEN gm.role = 'admin' THEN 1 END) as administradores,
    g.created_at
FROM groups g
LEFT JOIN group_members gm ON g.group_id = gm.group_id
GROUP BY g.group_id, g.group_name, g.description, g.created_at
ORDER BY total_membros DESC;

-- 9. Usuários e seus grupos
SELECT 
    u.username,
    STRING_AGG(g.group_name, ', ' ORDER BY g.group_name) as grupos,
    COUNT(g.group_id) as total_grupos,
    COUNT(CASE WHEN gm.role = 'admin' THEN 1 END) as grupos_admin
FROM users u
LEFT JOIN group_members gm ON u.user_id = gm.user_id
LEFT JOIN groups g ON gm.group_id = g.group_id
GROUP BY u.user_id, u.username
ORDER BY total_grupos DESC;

-- =====================================================
-- CONSULTAS DE MENSAGENS E COMUNICAÇÃO
-- =====================================================

-- 10. Conversas mais ativas (com mais mensagens)
SELECT 
    u1.username as usuario1,
    u2.username as usuario2,
    COUNT(m.message_id) as total_mensagens,
    MAX(m.sent_at) as ultima_mensagem,
    COUNT(CASE WHEN m.status = 'read' THEN 1 END) as mensagens_lidas,
    COUNT(CASE WHEN m.status = 'sent' THEN 1 END) as mensagens_nao_lidas
FROM messages m
JOIN users u1 ON m.sender_id = u1.user_id
JOIN users u2 ON m.receiver_id = u2.user_id
GROUP BY 
    LEAST(m.sender_id, m.receiver_id),
    GREATEST(m.sender_id, m.receiver_id),
    u1.username, u2.username
ORDER BY total_mensagens DESC
LIMIT 10;

-- 11. Mensagens não lidas por usuário
SELECT 
    u.username as destinatario,
    COUNT(m.message_id) as mensagens_nao_lidas,
    MIN(m.sent_at) as mensagem_mais_antiga,
    MAX(m.sent_at) as mensagem_mais_recente
FROM messages m
JOIN users u ON m.receiver_id = u.user_id
WHERE m.status IN ('sent', 'received')
GROUP BY u.user_id, u.username
HAVING COUNT(m.message_id) > 0
ORDER BY mensagens_nao_lidas DESC;

-- =====================================================
-- CONSULTAS DE TAGS E INTERESSES
-- =====================================================

-- 12. Tags mais populares
SELECT 
    t.tag_name,
    COUNT(ut.user_id) as usuarios_com_tag,
    ROUND(COUNT(ut.user_id) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentual_usuarios
FROM tags t
LEFT JOIN user_tags ut ON t.tag_id = ut.tag_id
GROUP BY t.tag_id, t.tag_name
ORDER BY usuarios_com_tag DESC;

-- 13. Usuários com interesses similares (mesmas tags)
SELECT 
    u1.username as usuario1,
    u2.username as usuario2,
    COUNT(DISTINCT ut1.tag_id) as tags_em_comum,
    STRING_AGG(DISTINCT t.tag_name, ', ' ORDER BY t.tag_name) as tags_compartilhadas
FROM user_tags ut1
JOIN user_tags ut2 ON ut1.tag_id = ut2.tag_id AND ut1.user_id != ut2.user_id
JOIN users u1 ON ut1.user_id = u1.user_id
JOIN users u2 ON ut2.user_id = u2.user_id
JOIN tags t ON ut1.tag_id = t.tag_id
WHERE ut1.user_id < ut2.user_id  -- Evita duplicatas
GROUP BY u1.user_id, u1.username, u2.user_id, u2.username
HAVING COUNT(DISTINCT ut1.tag_id) >= 2  -- Pelo menos 2 tags em comum
ORDER BY tags_em_comum DESC;

-- =====================================================
-- CONSULTAS ANALÍTICAS E ESTATÍSTICAS
-- =====================================================

-- 14. Estatísticas gerais da rede social
SELECT 
    'Usuários' as metrica,
    COUNT(*) as valor
FROM users
UNION ALL
SELECT 
    'Postagens' as metrica,
    COUNT(*) as valor
FROM posts
UNION ALL
SELECT 
    'Comentários' as metrica,
    COUNT(*) as valor
FROM comments
UNION ALL
SELECT 
    'Grupos' as metrica,
    COUNT(*) as valor
FROM groups
UNION ALL
SELECT 
    'Conexões Aceitas' as metrica,
    COUNT(*) as valor
FROM connections
WHERE status = 'accepted'
UNION ALL
SELECT 
    'Mensagens Enviadas' as metrica,
    COUNT(*) as valor
FROM messages;

-- 15. Usuários mais engajados (postam, comentam e avaliam)
SELECT 
    u.username,
    COUNT(DISTINCT p.post_id) as postagens,
    COUNT(DISTINCT c.comment_id) as comentarios,
    COUNT(DISTINCT r.rating_id) as avaliacoes,
    (COUNT(DISTINCT p.post_id) + COUNT(DISTINCT c.comment_id) + COUNT(DISTINCT r.rating_id)) as total_atividades
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id
LEFT JOIN comments c ON u.user_id = c.user_id
LEFT JOIN ratings r ON u.user_id = r.user_id
GROUP BY u.user_id, u.username
ORDER BY total_atividades DESC
LIMIT 10;

-- =====================================================
-- CONSULTAS COMPLEXAS COM SUBCONSULTAS
-- =====================================================

-- 16. Postagens que receberam mais engajamento que a média
WITH post_engagement AS (
    SELECT 
        p.post_id,
        u.username,
        p.content,
        COUNT(DISTINCT r.rating_id) + COUNT(DISTINCT c.comment_id) as engagement_score
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN ratings r ON p.post_id = r.post_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    GROUP BY p.post_id, u.username, p.content
),
avg_engagement AS (
    SELECT AVG(engagement_score) as media_engagement
    FROM post_engagement
)
SELECT 
    pe.username,
    LEFT(pe.content, 100) as preview,
    pe.engagement_score,
    ROUND(ae.media_engagement, 2) as media_geral
FROM post_engagement pe
CROSS JOIN avg_engagement ae
WHERE pe.engagement_score > ae.media_engagement
ORDER BY pe.engagement_score DESC;

-- 17. Usuários que nunca interagiram (não postaram, comentaram ou avaliaram)
SELECT 
    u.username,
    u.email,
    u.created_at,
    EXTRACT(DAY FROM AGE(CURRENT_TIMESTAMP, u.created_at)) as dias_sem_atividade
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE user_id = u.user_id)
  AND NOT EXISTS (SELECT 1 FROM comments WHERE user_id = u.user_id)
  AND NOT EXISTS (SELECT 1 FROM ratings WHERE user_id = u.user_id)
ORDER BY u.created_at;

-- =====================================================
-- CONSULTAS DE PERFORMANCE E MONITORAMENTO
-- =====================================================

-- 18. Análise de crescimento mensal de usuários
SELECT 
    EXTRACT(YEAR FROM created_at) as ano,
    EXTRACT(MONTH FROM created_at) as mes,
    COUNT(*) as novos_usuarios,
    SUM(COUNT(*)) OVER (ORDER BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)) as usuarios_acumulados
FROM users
GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
ORDER BY ano, mes;

-- 19. Horários de maior atividade (postagens por hora do dia)
SELECT 
    EXTRACT(HOUR FROM created_at) as hora_do_dia,
    COUNT(*) as total_postagens,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM posts
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora_do_dia;

-- 20. Relatório de uso das funcionalidades
SELECT 
    'Postagens de Texto' as funcionalidade,
    COUNT(*) as uso_total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM posts), 2) as percentual
FROM posts 
WHERE post_type = 'texto'
UNION ALL
SELECT 
    'Postagens de Imagem' as funcionalidade,
    COUNT(*) as uso_total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM posts), 2) as percentual
FROM posts 
WHERE post_type = 'imagem'
UNION ALL
SELECT 
    'Likes' as funcionalidade,
    COUNT(*) as uso_total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ratings), 2) as percentual
FROM ratings 
WHERE rating_type = 'like'
UNION ALL
SELECT 
    'Dislikes' as funcionalidade,
    COUNT(*) as uso_total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ratings), 2) as percentual
FROM ratings 
WHERE rating_type = 'dislike';

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Log de execução das consultas
DO $$
BEGIN
    RAISE NOTICE '=== CONSULTAS SQL EXECUTADAS ===';
    RAISE NOTICE 'Total de consultas: 20';
    RAISE NOTICE 'Categorias:';
    RAISE NOTICE '- Usuários: 2 consultas';
    RAISE NOTICE '- Postagens: 3 consultas';
    RAISE NOTICE '- Conexões: 2 consultas';
    RAISE NOTICE '- Grupos: 2 consultas';
    RAISE NOTICE '- Mensagens: 2 consultas';
    RAISE NOTICE '- Tags: 2 consultas';
    RAISE NOTICE '- Estatísticas: 2 consultas';
    RAISE NOTICE '- Complexas: 2 consultas';
    RAISE NOTICE '- Performance: 3 consultas';
    RAISE NOTICE 'Consultas executadas em %', NOW();
END $$; 