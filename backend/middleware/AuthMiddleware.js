const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Extrai o token do cabeçalho Authorization

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    console.log('Token recebido:', token);
    console.log('Segredo usado para verificar:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodifica o token
    req.user = decoded; // Adiciona os dados do usuário ao objeto req
    console.log('Token decodificado:', decoded);
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { protect };