const db = require('../config/connection');
const bcrypt = require('bcrypt');

async function getTodosUsuarios(req, res) {
    try {
        const [linhas] = await db.query('SELECT * FROM usuarios');
        res.json(linhas);
    } catch (erro) {
        console.error('Erro ao buscar usuários:', erro.message);
        res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: erro.message });
    }
}

async function getUsuarioPeloId(req, res) {
    const id = req.params.id;
    try {
        const [linhas] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (linhas.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        res.json(linhas[0]);
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro.message);
        res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: erro.message });
    }
}

async function atualizarUsuario(req, res) {
    const id = req.params.id;
    const { nome_usuario, email, data_nascimento, foto_perfil } = req.body;
    // Validação básica
    if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ erro: 'O campo email é obrigatório e não pode estar vazio.' });
    }
    try {
        const [resultado] = await db.query(
            'UPDATE usuarios SET nome_usuario = ?, email = ?, data_nascimento = ?, foto_perfil = ? WHERE id = ?',
            [nome_usuario, email, data_nascimento, foto_perfil, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        res.json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (erro) {
        console.error('Erro ao atualizar usuário:', erro.message);
        res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: erro.message });
    }
}

async function cadastrarUsuario(req, res) {
    const { nome_usuario, email, senha, data_nascimento, foto_perfil } = req.body;
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        await db.query('INSERT INTO usuarios (nome_usuario, email, senha_hash, data_nascimento, foto_perfil) VALUES (?, ?, ?, ?, ?)', 
            [nome_usuario, email, senhaHash, data_nascimento, foto_perfil]);
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro.message);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
}

// DELETE /usuarios/:id
async function deletarUsuario(req, res) {
    const id = req.params.id;
    try {
        const [resultado] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (erro) {
        console.error('Erro ao deletar usuário:', erro.message);
        res.status(500).json({ erro: 'Erro ao deletar usuário', detalhes: erro.message });
    }
}

// Buscar perfil do usuário
async function getPerfilUsuario(req, res) {
    const id = req.params.id;
    try {
        const [usuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (usuario.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        res.json(usuario[0]);
    } catch (erro) {
        console.error('Erro ao buscar perfil do usuário:', erro.message);
        res.status(500).json({ erro: 'Erro ao buscar perfil do usuário' });
    }
}

// Contar seguidores
async function getContagemSeguidores(req, res) {
    const id = req.params.id;
    try {
        const [resultado] = await db.query('SELECT COUNT(*) AS seguidores FROM conexoes WHERE destinatario_id = ? AND status = "aceita"', [id]);
        res.json({ seguidores: resultado[0].seguidores });
    } catch (erro) {
        console.error('Erro ao contar seguidores:', erro.message);
        res.status(500).json({ erro: 'Erro ao contar seguidores' });
    }
}

// Contar quem o usuário está seguindo
async function getContagemSeguindo(req, res) {
    const id = req.params.id;
    try {
        const [resultado] = await db.query('SELECT COUNT(*) AS seguindo FROM conexoes WHERE remetente_id = ? AND status = "aceita"', [id]);
        res.json({ seguindo: resultado[0].seguindo });
    } catch (erro) {
        console.error('Erro ao contar quem o usuário está seguindo:', erro.message);
        res.status(500).json({ erro: 'Erro ao contar quem o usuário está seguindo' });
    }
}

// Contar posts do usuário
async function getContagemPosts(req, res) {
    const id = req.params.id;
    try {
        const [resultado] = await db.query('SELECT COUNT(*) AS posts FROM postagens WHERE usuario_id = ?', [id]);
        res.json({ posts: resultado[0].posts });
    } catch (erro) {
        console.error('Erro ao contar posts do usuário:', erro.message);
        res.status(500).json({ erro: 'Erro ao contar posts do usuário' });
    }
}

module.exports = {
    getTodosUsuarios,
    getUsuarioPeloId,
    atualizarUsuario,
    cadastrarUsuario,
    deletarUsuario,
    getPerfilUsuario,
    getContagemSeguidores,
    getContagemSeguindo,
    getContagemPosts
};