const express = require('express');
const app = express();
const PORTA = 3000;
const rotasUsuario = require('./routes/userRoutes')


app.use(express.json());
app.use('/api/usuario', rotasUsuario);


app.listen(PORTA, () => {
    console.log(`Express rodando na porta ${PORTA}`);
});
