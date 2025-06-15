const jwt = require('jsonwebtoken');
const db = require('../config/connection');

module.exports = async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token ausente ou mal formado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.query('SELECT id, nome_usuario, email, foto_perfil FROM usuarios WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    req.usuario = rows[0];
    next();
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido' });
  }
};