const jwt = require('jsonwebtoken');

// Use o mesmo segredo definido no .env
const JWT_SECRET = '1aA!@#Fsd782Jshs8sYzXkU93jhs7KaP09';

// Gere um token para um usuário de teste com ID 1
const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1d' });

console.log('Token gerado:', token);