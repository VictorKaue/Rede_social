const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/AuthMiddleware');
const { createPost, getPosts, likePost, dislikePost } = require('../controllers/postController');

// Criar uma postagem
router.post('/', protect, createPost);

// Listar postagens
router.get('/', getPosts);

// Curtir uma postagem
router.post('/:id/like', protect, likePost);

// Descurtir uma postagem
router.post('/:id/dislike', protect, dislikePost);

module.exports = router;
