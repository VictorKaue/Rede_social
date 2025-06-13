const express = require('express');
const app = express();
const PORTA = 3000;

app.use(express.json())


app.listen(PORTA, () => {
    console.log(`Express rodando na porta ${PORTA}`);
});

