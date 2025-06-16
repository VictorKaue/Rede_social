const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/AuthMiddleware');

// Postagens
router.post('/', protect, postController.createPost);
router.get('/', postController.getPosts);

// Reações em postagens
router.post('/:id/like', protect, postController.likePost);
router.post('/:id/dislike', protect, postController.dislikePost);
router.delete('/:id/reaction', protect, postController.removeReaction);

// Comentários
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', protect, postController.addComment);

// Reações em comentários
router.post('/comments/:id/like', protect, postController.likeComment);
router.post('/comments/:id/dislike', protect, postController.dislikeComment);
router.delete('/comments/:id/reaction', protect, postController.removeCommentReaction);

module.exports = router;