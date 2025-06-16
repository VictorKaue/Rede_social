const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/userController.js');

router.get('/', usuarioController.getTodosUsuarios);
router.get('/:id', usuarioController.getUsuarioPeloId);
router.patch('/:id', usuarioController.atualizarUsuario);
router.post('/register', usuarioController.cadastrarUsuario);
router.delete('/:id', usuarioController.deletarUsuario);
router.get('/:id/profile', usuarioController.getPerfilUsuario);
router.get('/:id/followers/count', usuarioController.getContagemSeguidores);
router.get('/:id/following/count', usuarioController.getContagemSeguindo);
router.get('/:id/posts/count', usuarioController.getContagemPosts);

module.exports = router;