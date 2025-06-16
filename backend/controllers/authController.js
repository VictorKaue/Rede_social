const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/connection');

function gerarToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}



async function register(req, res) {
  const { nome_usuario, email, senha, data_nascimento } = req.body;
  console.log("🔁 Iniciando cadastro");
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    await db.query(
      'INSERT INTO usuarios (nome_usuario, email, senha_hash, data_nascimento) VALUES (?, ?, ?, ?)',
      [nome_usuario, email, senhaHash, data_nascimento]
    );
    res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Usuário ou email já cadastrado' });
    }
    console.error("❌ Erro ao cadastrar:", erro);
    res.status(500).json({ erro: 'Erro ao registrar usuário', detalhe: erro.message });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;
  console.log("Login iniciado");
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    res.json({
      id: usuario.id,
      nome_usuario: usuario.nome_usuario,
      email: usuario.email,
      token: gerarToken(usuario.id),
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao realizar login', detalhe: erro.message });
  }
}

async function getMe(req, res) {
  try {
    const { id, nome_usuario, email } = req.user;
    res.json({ id, nome_usuario, email });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao obter informações do usuário' });
  }
}

module.exports = { register, login, getMe };