const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController.js');

router.get('/', postController.getTodosPosts);
router.get('/:id', postController.getPostPeloId);
router.patch('/:id', postController.atualizarPost);
router.post('/', postController.cadastrarPost);
router.delete('/:id', postController.deletarPost);

module.exports = router;
