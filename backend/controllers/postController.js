const db = require('../config/connection');

async function getTodosPosts(req, res) {
    try {
        const [linhas] = await db.query('SELECT * FROM postagens');
        res.json(linhas);
    } catch (erro){
        res.status(500).json({ erro: 'Erro ao buscar posts' });
    }
}

async function getPostPeloId(req, res) {
    const id = req.params.id;
    try {
        const [linhas] = await db.query('SELECT * FROM postagens WHERE id = ?', [id]);
        if (linhas.length === 0) {
            return res.status(404).json({ mensagem: 'Post não encontrado' });
        }
        res.json(linhas[0]);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar post' });
    }
}

async function cadastrarPost(req, res) {
    const { usuario_id, tipo, conteudo, url_midia } = req.body;
    try {
        const [resultado] = await db.query(
            'INSERT INTO postagens (usuario_id, tipo, conteudo, url_midia) VALUES (?, ?, ?, ?)',
            [usuario_id, tipo, conteudo, url_midia]
        );
        res.status(201).json({ id: resultado.insertId, mensagem: 'Post criado com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao criar post' });
    }
}

async function atualizarPost(req, res) {
    const id = req.params.id;
    const { tipo, conteudo, url_midia } = req.body;
    try {
        const [resultado] = await db.query(
            'UPDATE postagens SET tipo = ?, conteudo = ?, url_midia = ? WHERE id = ?',
            [tipo, conteudo, url_midia, id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Post não encontrado' });
        }
        res.json({ mensagem: 'Post atualizado com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao atualizar post' });
    }
}

async function deletarPost(req, res) {
    const id = req.params.id;
    try {
        const [resultado] = await db.query('DELETE FROM postagens WHERE id = ?', [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Post não encontrado' });
        }
        res.json({ mensagem: 'Post deletado com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao deletar post' });
    }
}

module.exports = {
    getTodosPosts,
    getPostPeloId,
    cadastrarPost,
    atualizarPost,
    deletarPost
};