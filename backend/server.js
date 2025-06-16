require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORTA = 3001;
const cors = require('cors');
const rotasUsuario = require('./routes/userRoutes');
const rotasPost = require('./routes/postRoutes');
const rotasAuth = require('./routes/authRoutes');
const db = require('./config/connection'); // Pool de conexões

app.use(express.json());
app.use(cors());
app.use('/api/usuario', rotasUsuario);
app.use('/api/posts', rotasPost);
app.use('/api/auth', rotasAuth);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Testar conexão com o banco de dados
(async () => {
    try {
        await db.query('SELECT 1'); // Testa uma consulta simples
        console.log('Conexão com o banco de dados estabelecida com sucesso');
    } catch (erro) {
        console.error('Erro ao conec-tar ao banco de dados:', erro);
        process.exit(1); // Encerra o processo em caso de erro
    }
})();

// Porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});