const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/userController');

router.get('/', usuarioController.getTodosUsuarios);
router.get('/:id', usuarioController.getUsuarioPeloId);
router.patch('/:id', usuarioController.atualizarUsuario);
router.post('/:id', usuarioController.cadastrarUsuario)

module.exports = router;