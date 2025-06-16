const db = require('../config/connection');

// Criar uma postagem
async function createPost(req, res) {
  console.log('Requisição recebida para criar postagem:', req.body);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const { content, type } = req.body;
  const userId = req.user.id; // ID do usuário autenticado

  try {
    const [result] = await db.query(`
      INSERT INTO postagens (usuario_id, conteudo, tipo)
      VALUES (?, ?, ?)
    `, [userId, content, type]);
    res.status(201).json({ post_id: result.insertId, user_id: userId, content, type });
  } catch (error) {
    console.error('Erro ao criar postagem:', error);
    res.status(500).json({ error: 'Erro ao criar postagem' });
  }
}

// Listar postagens
async function getPosts(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.nome_usuario AS username, u.foto_perfil
      FROM postagens p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.data_criacao DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar postagens:', error);
    res.status(500).json({ error: 'Erro ao listar postagens' });
  }
}

// Adicionar curtida
async function likePost(req, res) {
  const usuarioId = req.user.id;
  const postagemId = req.params.id;
  try {
    await db.query(
      'REPLACE INTO reacoes_postagem (usuario_id, postagem_id, tipo) VALUES (?, ?, ?)',
      [usuarioId, postagemId, 'curtida']
    );
    res.status(200).json({ message: 'Postagem curtida com sucesso' });
  } catch (error) {
    console.error('Erro ao curtir postagem:', error);
    res.status(500).json({ error: 'Erro ao curtir postagem' });
  }
}

// Adicionar descurtida
async function dislikePost(req, res) {
  const usuarioId = req.user.id;
  const postagemId = req.params.id;
  try {
    await db.query(
      'REPLACE INTO reacoes_postagem (usuario_id, postagem_id, tipo) VALUES (?, ?, ?)',
      [usuarioId, postagemId, 'descurtida']
    );
    res.status(200).json({ message: 'Postagem descurtida com sucesso' });
  } catch (error) {
    console.error('Erro ao descurtir postagem:', error);
    res.status(500).json({ error: 'Erro ao descurtir postagem' });
  }
}

// Listar comentários de uma postagem
async function getComments(req, res) {
  const { id } = req.params; // ID da postagem
  try {
    const [rows] = await db.query(`
      SELECT c.*, u.nome_usuario AS username, u.foto_perfil
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.postagem_id = ?
      ORDER BY c.data_criacao ASC
    `, [id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ error: 'Erro ao listar comentários' });
  }
}

// Adicionar comentário a uma postagem
async function addComment(req, res) {
  const { id } = req.params; // ID da postagem
  const { content } = req.body;
  const userId = req.user.id; // ID do usuário autenticado
  try {
    const [result] = await db.query(`
      INSERT INTO comentarios (postagem_id, usuario_id, conteudo)
      VALUES (?, ?, ?)
    `, [id, userId, content]);
    res.status(201).json({ comment_id: result.insertId, post_id: id, user_id: userId, content });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
}

async function removeReaction(req, res) {
  const usuarioId = req.user.id;
  const postagemId = req.params.id;
  try {
    await db.query(
      'DELETE FROM reacoes_postagem WHERE usuario_id = ? AND postagem_id = ?',
      [usuarioId, postagemId]
    );
    res.status(200).json({ message: 'Reação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover reação:', error);
    res.status(500).json({ error: 'Erro ao remover reação' });
  }
}

async function likeComment(req, res) {
  const usuarioId = req.user.id;
  const comentarioId = req.params.id;
  try {
    await db.query(
      'REPLACE INTO reacoes_comentario (usuario_id, comentario_id, tipo) VALUES (?, ?, ?)',
      [usuarioId, comentarioId, 'curtida']
    );
    res.status(200).json({ message: 'Comentário curtido com sucesso' });
  } catch (error) {
    console.error('Erro ao curtir comentário:', error);
    res.status(500).json({ error: 'Erro ao curtir comentário' });
  }
}

async function dislikeComment(req, res) {
  const usuarioId = req.user.id;
  const comentarioId = req.params.id;
  try {
    await db.query(
      'REPLACE INTO reacoes_comentario (usuario_id, comentario_id, tipo) VALUES (?, ?, ?)',
      [usuarioId, comentarioId, 'descurtida']
    );
    res.status(200).json({ message: 'Comentário descurtido com sucesso' });
  } catch (error) {
    console.error('Erro ao descurtir comentário:', error);
    res.status(500).json({ error: 'Erro ao descurtir comentário' });
  }
}

async function removeCommentReaction(req, res) {
  const usuarioId = req.user.id;
  const comentarioId = req.params.id;
  try {
    await db.query(
      'DELETE FROM reacoes_comentario WHERE usuario_id = ? AND comentario_id = ?',
      [usuarioId, comentarioId]
    );
    res.status(200).json({ message: 'Reação ao comentário removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover reação do comentário:', error);
    res.status(500).json({ error: 'Erro ao remover reação do comentário' });
  }
}

module.exports = {
  createPost,
  getPosts,
  likePost,
  dislikePost,
  getComments,
  addComment,
  removeReaction,
  likeComment,
  dislikeComment,
  removeCommentReaction,
};