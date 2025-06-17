SELECT p.*
FROM postagens p
JOIN usuarios u ON p.usuario_id = u.id
WHERE u.nome_usuario = 'alice';

SELECT u.nome_usuario, mg.funcao
FROM membros_grupo mg
JOIN usuarios u ON mg.usuario_id = u.id
JOIN grupos g ON mg.grupo_id = g.id
WHERE g.nome = 'SQL Lovers';

SELECT c.conteudo, u.nome_usuario, c.data_criacao
FROM comentarios c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.postagem_id = 1;

SELECT u2.nome_usuario
FROM conexoes c
JOIN usuarios u1 ON c.remetente_id = u1.id
JOIN usuarios u2 ON c.destinatario_id = u2.id
WHERE u1.nome_usuario = 'alice' AND c.status = 'aceita';

SELECT p.id AS postagem_id, rp.tipo, COUNT(*) AS total
FROM reacoes_postagem rp
JOIN postagens p ON rp.postagem_id = p.id
GROUP BY p.id, rp.tipo;