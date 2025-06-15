CREATE DATABASE IF NOT EXISTS rede_social;
USE rede_social;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    foto_perfil VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE conexoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    status ENUM('pendente', 'aceita', 'rejeitada') NOT NULL DEFAULT 'pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT checar_auto_conexao CHECK (remetente_id <> destinatario_id)
) ENGINE=InnoDB;

CREATE TABLE postagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('texto', 'imagem', 'video') NOT NULL,
    conteudo TEXT NOT NULL,
    url_midia VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    comentario_pai_id INT,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_pai_id) REFERENCES comentarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    criado_por INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE membros_grupo (
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    funcao ENUM('membro', 'administrador') NOT NULL DEFAULT 'membro',
    data_ingresso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (grupo_id, usuario_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE postagens_grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('texto', 'imagem', 'video') NOT NULL,
    conteudo TEXT NOT NULL,
    url_midia VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    status ENUM('enviada', 'entregue', 'lida') NOT NULL DEFAULT 'enviada',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    criado_por INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tags_usuario (
    usuario_id INT NOT NULL,
    tag_id INT NOT NULL,
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, tag_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tags_postagem (
    postagem_id INT NOT NULL,
    tag_id INT NOT NULL,
    data_associacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (postagem_id, tag_id),
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reacoes_postagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    tipo ENUM('curtida', 'descurtida') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (usuario_id, postagem_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reacoes_comentario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    comentario_id INT NOT NULL,
    tipo ENUM('curtida', 'descurtida') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (usuario_id, comentario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_tags_usuario ON tags_usuario(usuario_id);
CREATE INDEX idx_tags_postagem ON tags_postagem(postagem_id);
CREATE INDEX idx_conexoes_remetente ON conexoes(remetente_id);
CREATE INDEX idx_conexoes_destinatario ON conexoes(destinatario_id);
CREATE INDEX idx_membros_grupo ON membros_grupo(grupo_id);

DELIMITER $$
CREATE TRIGGER limite_tags_usuario
BEFORE INSERT ON tags_usuario
FOR EACH ROW
BEGIN
    IF (SELECT COUNT(*) FROM tags_usuario WHERE usuario_id = NEW.usuario_id) >= 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite máximo de 5 tags por usuário';
    END IF;
END$$
DELIMITER ;