const mysql = require('mysql2/promise')

async function createConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', //Colocar senha do banco de dados
        database: 'rede_social',
        port: 3006
    });
    return connection
}

module.exports = createConnection
