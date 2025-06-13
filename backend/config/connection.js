const mysql = require('mysql2/promise');

const pool = async function createConnection() {
    const connection = await mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '', //Colocar senha do banco de dados
        database: 'rede_social',
        port: 3006,
        waitForConnections: true, //Espera por conexões
        connectionLimit: 10,
        maxIdle: 10, // Máximo de conexões inativas; o valor padrão é o mesmo que "connectionLimit"
        idleTimeout: 60000, // Tempo limite das conexões inativas em milissegundos; o valor padrão é "60000"
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });
    return connection
}

module.exports = pool
