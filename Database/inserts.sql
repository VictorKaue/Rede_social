INSERT INTO usuarios (nome_usuario, email, senha_hash, data_nascimento, foto_perfil) VALUES
('alice', 'alice@example.com', 'hash1', '1998-04-12', 'alice.png'),
('bob', 'bob@example.com', 'hash2', '1995-09-22', 'bob.jpg'),
('carol', 'carol@example.com', 'hash3', '2000-01-30', 'carol.jpg'),
('david', 'david@example.com', 'hash4', '1988-11-10', 'david.png'),
('ellen', 'ellen@example.com', 'hash5', '1993-06-15', 'ellen.jpg'),
('felipe', 'felipe@example.com', 'hash6', '2001-03-20', 'felipe.jpg'),
('gabi', 'gabi@example.com', 'hash7', '1999-08-05', 'gabi.jpg'),
('heitor', 'heitor@example.com', 'hash8', '1997-12-09', 'heitor.jpg'),
('isabela', 'isabela@example.com', 'hash9', '1990-07-01', 'isabela.jpg'),
('joao', 'joao@example.com', 'hash10', '1995-02-17', 'joao.jpg');

INSERT INTO conexoes (remetente_id, destinatario_id, status) VALUES
(1, 2, 'aceita'),
(1, 3, 'pendente'),
(2, 4, 'aceita'),
(3, 5, 'pendente'),
(6, 1, 'rejeitada');

INSERT INTO postagens (usuario_id, tipo, conteudo, url_midia) VALUES
(1, 'texto', 'Olá mundo!', NULL),
(2, 'imagem', 'Minha nova foto de perfil', 'foto2.png'),
(3, 'video', 'Assista esse vídeo!', 'video1.mp4'),
(1, 'texto', 'Mais um dia produtivo!', NULL),
(4, 'texto', 'Bom dia a todos!', NULL),
(5, 'imagem', 'Look do dia!', 'foto5.jpg'),
(6, 'video', 'Vídeo engraçado', 'haha.mp4'),
(7, 'texto', 'Compartilhando ideias', NULL),
(8, 'texto', 'Estudando SQL', NULL),
(9, 'imagem', 'Viagem top', 'foto9.png');

INSERT INTO comentarios (usuario_id, postagem_id, conteudo) VALUES
(2, 1, 'Muito legal!'),
(3, 1, 'Concordo!'),
(4, 2, 'Foto top!'),
(5, 3, 'Gostei do vídeo'),
(1, 5, 'Bom dia!'),
(6, 6, 'Haha ri muito'),
(7, 7, 'Boa ideia'),
(8, 8, 'SQL é top'),
(9, 9, 'Curti a viagem'),
(10, 10, 'Show!');

INSERT INTO grupos (nome, descricao, criado_por) VALUES
('SQL Lovers', 'Grupo para discutir SQL e banco de dados', 1),
('Tech Talk', 'Grupo de tecnologia geral', 2),
('Gamers BR', 'Jogos e notícias', 3),
('Leitura e Café', 'Para amantes de livros', 4),
('Estudos', 'Grupo para trocar dicas de estudo', 5);

INSERT INTO membros_grupo (grupo_id, usuario_id, funcao) VALUES
(1, 1, 'administrador'),
(1, 2, 'membro'),
(1, 3, 'membro'),
(2, 2, 'administrador'),
(2, 4, 'membro'),
(3, 3, 'administrador'),
(3, 5, 'membro'),
(4, 4, 'administrador'),
(4, 6, 'membro'),
(5, 5, 'administrador');

INSERT INTO postagens_grupo (grupo_id, usuario_id, tipo, conteudo, url_midia) VALUES
(1, 1, 'texto', 'Postagem no grupo SQL', NULL),
(2, 2, 'texto', 'Tech news do dia', NULL),
(3, 3, 'imagem', 'Screenshot do jogo', 'screenshot.png'),
(4, 4, 'texto', 'Recomendo este livro', NULL),
(5, 5, 'texto', 'Resumo da aula de hoje', NULL);

INSERT INTO reacoes_postagem (usuario_id, postagem_id, tipo) VALUES
(2, 1, 'curtida'),
(3, 1, 'curtida'),
(4, 1, 'descurtida'),
(5, 2, 'curtida'),
(6, 3, 'curtida'),
(7, 3, 'curtida'),
(8, 3, 'descurtida'),
(9, 4, 'curtida'),
(10, 5, 'descurtida');