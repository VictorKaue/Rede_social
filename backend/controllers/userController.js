const db = require('../config/connection');

async function getAllUsuario(req, res){
    const [linhas] = await db.query('SELECT * FROM usuario');
    res.json(rows);
};

