const Post = require('../models/Post');

// Criar uma postagem
async function createPost(req, res) {
  try {
    const { content, type } = req.body;
    const post = await Post.create({
      user: req.user.id,
      content,
      type,
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Erro ao criar postagem:', error);
    res.status(500).json({ error: 'Erro ao criar postagem' });
  }
}

// Listar postagens
async function getPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate('user', 'nome_usuario email')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Erro ao listar postagens:', error);
    res.status(500).json({ error: 'Erro ao listar postagens' });
  }
}

// Adicionar curtida
async function likePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Postagem não encontrada' });

    post.likes += 1;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error('Erro ao curtir postagem:', error);
    res.status(500).json({ error: 'Erro ao curtir postagem' });
  }
}

// Adicionar descurtida
async function dislikePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Postagem não encontrada' });

    post.dislikes += 1;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error('Erro ao descurtir postagem:', error);
    res.status(500).json({ error: 'Erro ao descurtir postagem' });
  }
}

module.exports = { createPost, getPosts, likePost, dislikePost };