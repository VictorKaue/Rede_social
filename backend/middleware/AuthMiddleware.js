const jwt = require('jsonwebtoken');
const db = require('../config/connection');

async function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ erro: 'Não autorizado, token ausente' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [usuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [decoded.id]);
    if (!usuario.length) {
      return res.status(401).json({ erro: 'Não autorizado, usuário não encontrado' });
    }
    req.user = usuario[0];
    next();
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

module.exports = { protect };