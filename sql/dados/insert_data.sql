-- =====================================================
-- PROJETO REDE SOCIAL - INSERÇÃO DE DADOS DE TESTE
-- Versão: 1.0
-- Data: 2024
-- Descrição: Script para inserção de dados de teste
--           realistas para todas as tabelas
-- =====================================================

-- Configurações iniciais
SET client_encoding = 'UTF8';

-- =====================================================
-- INSERÇÃO DE DADOS DE TESTE
-- =====================================================

-- Inserção de usuários (15 registros)
INSERT INTO users (username, email, birth_date, profile_photo) VALUES
('joao_silva', 'joao.silva@email.com', '1995-03-15', 'https://example.com/photos/joao.jpg'),
('maria_santos', 'maria.santos@email.com', '1992-07-22', 'https://example.com/photos/maria.jpg'),
('pedro_oliveira', 'pedro.oliveira@email.com', '1988-11-08', 'https://example.com/photos/pedro.jpg'),
('ana_costa', 'ana.costa@email.com', '1996-01-30', 'https://example.com/photos/ana.jpg'),
('carlos_ferreira', 'carlos.ferreira@email.com', '1990-05-12', 'https://example.com/photos/carlos.jpg'),
('lucia_almeida', 'lucia.almeida@email.com', '1993-09-18', 'https://example.com/photos/lucia.jpg'),
('rafael_souza', 'rafael.souza@email.com', '1987-12-03', 'https://example.com/photos/rafael.jpg'),
('camila_rodrigues', 'camila.rodrigues@email.com', '1994-04-25', 'https://example.com/photos/camila.jpg'),
('bruno_lima', 'bruno.lima@email.com', '1991-08-14', 'https://example.com/photos/bruno.jpg'),
('fernanda_martins', 'fernanda.martins@email.com', '1989-02-07', 'https://example.com/photos/fernanda.jpg'),
('gustavo_pereira', 'gustavo.pereira@email.com', '1997-06-20', 'https://example.com/photos/gustavo.jpg'),
('juliana_barbosa', 'juliana.barbosa@email.com', '1985-10-11', 'https://example.com/photos/juliana.jpg'),
('ricardo_gomes', 'ricardo.gomes@email.com', '1992-03-28', 'https://example.com/photos/ricardo.jpg'),
('patricia_silva', 'patricia.silva@email.com', '1986-07-16', 'https://example.com/photos/patricia.jpg'),
('thiago_santos', 'thiago.santos@email.com', '1998-11-02', 'https://example.com/photos/thiago.jpg');

-- Inserção de tags (12 registros)
INSERT INTO tags (tag_name) VALUES
('tecnologia'),
('programacao'),
('design'),
('fotografia'),
('viagem'),
('culinaria'),
('esportes'),
('musica'),
('cinema'),
('leitura'),
('games'),
('natureza');

-- Inserção de user_tags (respeitando limite de 5 por usuário)
INSERT INTO user_tags (user_id, tag_id) VALUES
-- João Silva (5 tags)
(1, 1), (1, 2), (1, 11), (1, 9), (1, 10),
-- Maria Santos (3 tags)
(2, 3), (2, 4), (2, 5),
-- Pedro Oliveira (4 tags)
(3, 7), (3, 8), (3, 12), (3, 1),
-- Ana Costa (5 tags)
(4, 3), (4, 4), (4, 6), (4, 8), (4, 10),
-- Carlos Ferreira (2 tags)
(5, 1), (5, 2),
-- Lucia Almeida (4 tags)
(6, 5), (6, 6), (6, 9), (6, 10),
-- Rafael Souza (5 tags)
(7, 7), (7, 11), (7, 1), (7, 2), (7, 12),
-- Camila Rodrigues (3 tags)
(8, 3), (8, 4), (8, 8),
-- Bruno Lima (5 tags)
(9, 1), (9, 2), (9, 7), (9, 11), (9, 12),
-- Fernanda Martins (4 tags)
(10, 5), (10, 6), (10, 9), (10, 10),
-- Gustavo Pereira (2 tags)
(11, 11), (11, 9),
-- Juliana Barbosa (5 tags)
(12, 3), (12, 4), (12, 5), (12, 8), (12, 10),
-- Ricardo Gomes (3 tags)
(13, 1), (13, 7), (13, 12),
-- Patricia Silva (4 tags)
(14, 6), (14, 8), (14, 9), (14, 10),
-- Thiago Santos (5 tags)
(15, 1), (15, 2), (15, 11), (15, 7), (15, 12);

-- Inserção de postagens (20 registros)
INSERT INTO posts (user_id, content, post_type) VALUES
(1, 'Acabei de terminar um projeto incrível em Python! A sensação de ver o código funcionando perfeitamente é indescritível. #programacao #python', 'texto'),
(2, 'Visitei um museu de arte contemporânea hoje. As obras eram simplesmente inspiradoras!', 'texto'),
(3, 'Treino de futebol foi intenso hoje. Preparação para o campeonato está a todo vapor! ⚽', 'texto'),
(4, 'Nova receita de bolo de chocolate que testei ficou perfeita! Quem quiser a receita, me chama no privado.', 'texto'),
(5, 'Implementando uma nova arquitetura de microserviços no trabalho. Os desafios são grandes, mas o aprendizado é imenso.', 'texto'),
(6, 'Viagem para a praia foi incrível! O pôr do sol estava espetacular. Já estou com saudades.', 'imagem'),
(7, 'Partida de CS:GO épica ontem à noite! Conseguimos virar o jogo no último round. #gaming', 'texto'),
(8, 'Novo projeto de design gráfico finalizado. Cliente ficou super satisfeito com o resultado!', 'imagem'),
(9, 'Configurando meu novo setup de desenvolvimento. Produtividade vai às alturas!', 'texto'),
(10, 'Filme que assisti ontem me deixou pensativo por horas. Cinema tem esse poder transformador.', 'texto'),
(11, 'Boss fight mais difícil que já enfrentei! Levei 3 horas para conseguir passar.', 'texto'),
(12, 'Workshop de fotografia foi esclarecedor. Aprendi técnicas que vão revolucionar meus trabalhos.', 'texto'),
(13, 'Corrida matinal de 10km concluída! Começando a semana com energia total.', 'texto'),
(14, 'Concerto de música clássica foi uma experiência transcendental. A orquestra estava impecável.', 'texto'),
(15, 'Hackathon foi intenso! 48 horas programando sem parar, mas o resultado valeu a pena.', 'texto'),
(1, 'Descobri uma biblioteca JavaScript incrível que vai facilitar muito meu trabalho. Open source é vida!', 'texto'),
(3, 'Trilha na montanha hoje foi desafiadora, mas a vista do topo compensou todo o esforço.', 'imagem'),
(5, 'Palestra sobre inteligência artificial foi mind-blowing. O futuro já chegou!', 'texto'),
(8, 'Identidade visual que criei para startup foi aprovada! Mais um projeto no portfólio.', 'imagem'),
(12, 'Sessão de fotos no parque rendeu imagens incríveis. A luz natural estava perfeita.', 'imagem');

-- Inserção de comentários (25 registros)
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Parabéns pelo projeto! Python é realmente uma linguagem incrível.'),
(3, 1, 'Qual biblioteca você usou? Estou sempre procurando novas ferramentas.'),
(4, 2, 'Adoro museus! Qual foi a obra que mais te impressionou?'),
(1, 3, 'Boa sorte no campeonato! Torço por vocês.'),
(5, 4, 'Essa receita parece deliciosa! Vou te chamar no privado sim.'),
(6, 5, 'Microserviços são o futuro! Qual stack você está usando?'),
(7, 6, 'Que foto linda! Praia é sempre uma boa pedida.'),
(8, 7, 'CS:GO é viciante! Qual seu rank atual?'),
(9, 8, 'Seu trabalho de design é sempre impecável! Parabéns.'),
(10, 9, 'Setup novo sempre motiva! Quais foram as principais mudanças?'),
(11, 10, 'Qual filme foi? Estou procurando algo para assistir.'),
(12, 11, 'Qual jogo era? Adoro um desafio difícil!'),
(13, 12, 'Fotografia é uma arte! Suas dicas sempre ajudam muito.'),
(14, 13, '10km é impressionante! Quanto tempo você levou?'),
(15, 14, 'Música clássica tem um poder único de nos transportar.'),
(2, 15, 'Hackathon é sempre uma experiência intensa! Qual foi o projeto?'),
(4, 16, 'Open source move o mundo da tecnologia! Qual biblioteca?'),
(6, 17, 'Trilhas na montanha são terapêuticas! Qual foi o local?'),
(8, 18, 'IA está revolucionando tudo mesmo! Qual foi o foco da palestra?'),
(10, 19, 'Seus designs são sempre inspiradores! Parabéns pelo trabalho.'),
(1, 20, 'Luz natural faz toda a diferença na fotografia!'),
-- Respostas a comentários
(1, NULL, 'Usei Django REST Framework. Super recomendo!'),
(2, NULL, 'A instalação sobre realidade virtual me impressionou mais.'),
(3, NULL, 'Estou no Gold Nova 3, subindo devagar mas consistente.'),
(7, NULL, 'Foi na Serra da Mantiqueira, lugar incrível!'),
(15, NULL, 'Desenvolvemos um app de sustentabilidade urbana.');

-- Atualizar parent_comment_id para as respostas
UPDATE comments SET parent_comment_id = 2, post_id = NULL WHERE comment_id = 22;
UPDATE comments SET parent_comment_id = 4, post_id = NULL WHERE comment_id = 23;
UPDATE comments SET parent_comment_id = 8, post_id = NULL WHERE comment_id = 24;
UPDATE comments SET parent_comment_id = 18, post_id = NULL WHERE comment_id = 25;
UPDATE comments SET parent_comment_id = 16, post_id = NULL WHERE comment_id = 26;

-- Inserção de avaliações (40 registros)
INSERT INTO ratings (user_id, post_id, rating_type) VALUES
-- Likes em postagens
(2, 1, 'like'), (3, 1, 'like'), (4, 1, 'like'), (5, 1, 'like'),
(1, 2, 'like'), (3, 2, 'like'), (5, 2, 'like'),
(1, 3, 'like'), (2, 3, 'like'), (4, 3, 'like'), (6, 3, 'like'),
(1, 4, 'like'), (3, 4, 'like'), (6, 4, 'like'),
(2, 5, 'like'), (4, 5, 'like'), (7, 5, 'like'),
(1, 6, 'like'), (3, 6, 'like'), (8, 6, 'like'), (9, 6, 'like'),
(2, 7, 'like'), (5, 7, 'like'), (9, 7, 'like'),
(1, 8, 'like'), (4, 8, 'like'), (7, 8, 'like'),
(2, 9, 'like'), (6, 9, 'like'), (8, 9, 'like'),
(3, 10, 'like'), (7, 10, 'like'), (9, 10, 'like'),
-- Alguns dislikes
(8, 1, 'dislike'), (10, 3, 'dislike'),
-- Likes em comentários
(1, NULL, 'like'), (3, NULL, 'like'), (5, NULL, 'like'),
(2, NULL, 'like'), (4, NULL, 'like'), (6, NULL, 'like');

-- Atualizar comment_id para avaliações de comentários
UPDATE ratings SET comment_id = 1, post_id = NULL WHERE rating_id = 36;
UPDATE ratings SET comment_id = 2, post_id = NULL WHERE rating_id = 37;
UPDATE ratings SET comment_id = 3, post_id = NULL WHERE rating_id = 38;
UPDATE ratings SET comment_id = 5, post_id = NULL WHERE rating_id = 39;
UPDATE ratings SET comment_id = 8, post_id = NULL WHERE rating_id = 40;
UPDATE ratings SET comment_id = 12, post_id = NULL WHERE rating_id = 41;

-- Inserção de grupos (10 registros)
INSERT INTO groups (group_name, description) VALUES
('Desenvolvedores Python', 'Grupo para discussão sobre Python, frameworks e melhores práticas de desenvolvimento.'),
('Fotógrafos Amadores', 'Comunidade para compartilhar fotos, técnicas e experiências fotográficas.'),
('Gamers Unidos', 'Espaço para gamers discutirem jogos, estratégias e organizarem partidas.'),
('Viajantes do Mundo', 'Grupo para compartilhar experiências de viagem, dicas e roteiros.'),
('Chefs Caseiros', 'Comunidade culinária para trocar receitas e técnicas de cozinha.'),
('Esportistas Ativos', 'Grupo para atletas e entusiastas do esporte organizarem atividades.'),
('Cinéfilos', 'Discussões sobre filmes, séries e indústria cinematográfica.'),
('Leitores Vorazes', 'Clube do livro para discussões literárias e recomendações.'),
('Designers Criativos', 'Comunidade de design para compartilhar trabalhos e inspirações.'),
('Músicos e Melômanos', 'Espaço para discussões musicais, compartilhamento e colaborações.');

-- Inserção de membros dos grupos (30 registros)
INSERT INTO group_members (user_id, group_id, role) VALUES
-- Desenvolvedores Python
(1, 1, 'admin'), (5, 1, 'member'), (9, 1, 'member'), (15, 1, 'member'),
-- Fotógrafos Amadores
(2, 2, 'admin'), (4, 2, 'member'), (12, 2, 'member'),
-- Gamers Unidos
(7, 3, 'admin'), (9, 3, 'member'), (11, 3, 'member'), (15, 3, 'member'),
-- Viajantes do Mundo
(6, 4, 'admin'), (2, 4, 'member'), (10, 4, 'member'), (12, 4, 'member'),
-- Chefs Caseiros
(4, 5, 'admin'), (6, 5, 'member'), (10, 5, 'member'), (14, 5, 'member'),
-- Esportistas Ativos
(3, 6, 'admin'), (7, 6, 'member'), (13, 6, 'member'),
-- Cinéfilos
(10, 7, 'admin'), (11, 7, 'member'), (14, 7, 'member'),
-- Leitores Vorazes
(12, 8, 'admin'), (1, 8, 'member'), (4, 8, 'member'), (10, 8, 'member'),
-- Designers Criativos
(8, 9, 'admin'), (2, 9, 'member'), (4, 9, 'member'),
-- Músicos e Melômanos
(14, 10, 'admin'), (8, 10, 'member'), (10, 10, 'member'), (12, 10, 'member');

-- Inserção de conexões (25 registros)
INSERT INTO connections (user_id, connected_user_id, status) VALUES
-- Conexões aceitas
(1, 2, 'accepted'), (1, 5, 'accepted'), (1, 9, 'accepted'),
(2, 4, 'accepted'), (2, 8, 'accepted'), (2, 12, 'accepted'),
(3, 7, 'accepted'), (3, 13, 'accepted'),
(4, 6, 'accepted'), (4, 10, 'accepted'), (4, 12, 'accepted'),
(5, 9, 'accepted'), (5, 15, 'accepted'),
(6, 10, 'accepted'), (6, 14, 'accepted'),
(7, 9, 'accepted'), (7, 11, 'accepted'), (7, 15, 'accepted'),
(8, 12, 'accepted'), (8, 14, 'accepted'),
(10, 12, 'accepted'), (10, 14, 'accepted'),
-- Conexões pendentes
(11, 13, 'pending'), (13, 15, 'pending'),
-- Conexão bloqueada
(3, 11, 'blocked');

-- Inserção de mensagens (35 registros)
INSERT INTO messages (sender_id, receiver_id, content, status) VALUES
-- Conversas entre usuários conectados
(1, 2, 'Oi Maria! Vi seu post sobre o museu. Que legal!', 'read'),
(2, 1, 'Oi João! Foi uma experiência incrível mesmo. Você gosta de arte?', 'read'),
(1, 2, 'Gosto sim! Principalmente arte digital. Trabalho com programação e sempre me inspiro.', 'read'),
(2, 1, 'Que interessante! Podemos trocar ideias sobre isso.', 'received'),

(5, 9, 'Bruno, vi que você está montando um novo setup. Precisa de dicas?', 'read'),
(9, 5, 'Carlos! Claro, aceito todas as dicas. Principalmente sobre monitores.', 'read'),
(5, 9, 'Recomendo monitores 4K para programação. A diferença é notável.', 'sent'),

(4, 6, 'Lucia, adorei sua foto da praia! Onde foi?', 'read'),
(6, 4, 'Ana! Foi em Florianópolis. Lugar incrível para relaxar.', 'read'),
(4, 6, 'Tenho que conhecer! Você tem mais dicas da cidade?', 'received'),

(7, 11, 'Gustavo, bora uma partida de CS hoje à noite?', 'read'),
(11, 7, 'Rafael! Bora sim. Que horas você fica online?', 'read'),
(7, 11, 'Umas 20h. Te chamo no Discord.', 'sent'),

(8, 12, 'Juliana, seus trabalhos de fotografia são inspiradores!', 'read'),
(12, 8, 'Camila! Obrigada! Seus designs também são incríveis.', 'read'),
(8, 12, 'Que tal uma colaboração? Tenho um projeto que precisa de fotos.', 'received'),

(10, 14, 'Patricia, qual foi o concerto que você foi?', 'read'),
(14, 10, 'Fernanda! Foi da Orquestra Sinfônica. Tocaram Beethoven.', 'read'),
(10, 14, 'Adoro música clássica! Próximo concerto me avisa.', 'sent'),

(3, 7, 'Rafael, treino de futebol amanhã. Você vem?', 'read'),
(7, 3, 'Pedro! Não posso amanhã, mas na próxima semana estou dentro.', 'received'),

(1, 5, 'Carlos, como está o projeto de microserviços?', 'read'),
(5, 1, 'João! Está evoluindo bem. Muitos desafios, mas aprendendo muito.', 'sent'),

(9, 15, 'Thiago, como foi o hackathon?', 'read'),
(15, 9, 'Bruno! Foi intenso, mas conseguimos desenvolver algo legal.', 'read'),
(9, 15, 'Que tipo de projeto vocês fizeram?', 'received'),

(2, 8, 'Camila, preciso de um designer para um projeto. Você tem tempo?', 'read'),
(8, 2, 'Maria! Depende do projeto. Me conta mais detalhes.', 'sent'),

(4, 10, 'Fernanda, vamos marcar de cozinhar juntas?', 'read'),
(10, 4, 'Ana! Adoraria! Que tal no fim de semana?', 'read'),
(4, 10, 'Perfeito! Sábado à tarde te serve?', 'sent'),

(6, 14, 'Patricia, conhece algum bom restaurante na cidade?', 'read'),
(14, 6, 'Lucia! Conheço vários. Que tipo de culinária você prefere?', 'received'),

(12, 8, 'Camila, vi seu novo projeto de identidade visual. Ficou lindo!', 'read'),
(8, 12, 'Juliana! Obrigada! Foi um desafio, mas gostei do resultado.', 'sent'),

(10, 12, 'Juliana, suas fotos do parque ficaram incríveis!', 'read'),
(12, 10, 'Fernanda! Obrigada! A luz estava perfeita naquele dia.', 'received');

-- =====================================================
-- ATUALIZAÇÃO DE TIMESTAMPS PARA REALISMO
-- =====================================================

-- Atualizar algumas datas para criar um histórico mais realista
UPDATE posts SET created_at = created_at - INTERVAL '7 days' WHERE post_id IN (1, 2, 3);
UPDATE posts SET created_at = created_at - INTERVAL '3 days' WHERE post_id IN (4, 5, 6, 7);
UPDATE posts SET created_at = created_at - INTERVAL '1 day' WHERE post_id IN (8, 9, 10);

UPDATE comments SET created_at = created_at - INTERVAL '6 days' WHERE comment_id IN (1, 2, 3);
UPDATE comments SET created_at = created_at - INTERVAL '2 days' WHERE comment_id IN (4, 5, 6, 7);

UPDATE messages SET sent_at = sent_at - INTERVAL '5 days' WHERE message_id IN (1, 2, 3, 4);
UPDATE messages SET sent_at = sent_at - INTERVAL '2 days' WHERE message_id IN (5, 6, 7);
UPDATE messages SET sent_at = sent_at - INTERVAL '1 day' WHERE message_id IN (8, 9, 10);

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Contagem de registros por tabela
DO $$
DECLARE
    rec RECORD;
    total_records INTEGER := 0;
BEGIN
    RAISE NOTICE '=== RESUMO DOS DADOS INSERIDOS ===';
    
    FOR rec IN 
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as records
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Tabela %: % registros', rec.tablename, rec.records;
        total_records := total_records + rec.records;
    END LOOP;
    
    RAISE NOTICE '=== TOTAL: % registros inseridos ===', total_records;
    RAISE NOTICE 'Dados de teste inseridos com sucesso em %', NOW();
END $$; 