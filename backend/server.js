const express = require('express');
const app = express();
const PORTA = 3000;
const rotasUsuario = require('./routes/userRoutes')
const rotasPost = require('./routes/postRoutes');
const db = require('./config/connection');

app.use(express.json());
app.use('/api/usuario', rotasUsuario);
app.use('/api/post', rotasPost);


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
