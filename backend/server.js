require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORTA = 3001;
const rotasUsuario = require('./routes/userRoutes')
const rotasPost = require('./routes/postRoutes');
const rotasAuth = require('./routes/authRoutes');
const db = require('./config/connection');

app.use(express.json());
app.use('/api/usuario', rotasUsuario);
app.use('/api/post', rotasPost);
app.use('/api/auth', rotasAuth);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


db.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados:', erro);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso');
});


app.listen(PORTA, () => {
    console.log(`Express rodando na porta ${PORTA}`);
});

router.get('/:id/profile', usuarioController.getPerfilUsuario);
router.get('/:id/followers/count', usuarioController.getContagemSeguidores);
router.get('/:id/following/count', usuarioController.getContagemSeguindo);
router.get('/:id/posts/count', usuarioController.getContagemPosts);
