const express = require('express');
const router = express.Router();
const Livro = require('../models/Livro');
const { auth } = require('../middlewares/auth');

// Listar todos os livros
router.get('/', auth, async (req, res) => {
    try {
        const livros = await Livro.find().sort({ titulo: 1 });
        res.json(livros);
    } catch (error) {
        console.error('Erro ao listar livros:', error);
        res.status(500).json({ message: 'Erro ao listar livros', error: error.message });
    }
});

// Criar novo livro
router.post('/', auth, async (req, res) => {
    try {
        const livro = new Livro({
            titulo: req.body.titulo,
            autor: req.body.autor,
            genero: req.body.genero,
            ano: req.body.ano,
            disponivel: true
        });

        const novoLivro = await livro.save();
        res.status(201).json(novoLivro);
    } catch (error) {
        console.error('Erro ao criar livro:', error);
        res.status(400).json({ message: 'Erro ao criar livro', error: error.message });
    }
});

// Importar múltiplos livros
router.post('/importar', auth, async (req, res) => {
    try {
        const livros = req.body;
        if (!Array.isArray(livros)) {
            return res.status(400).json({ message: 'Dados inválidos. Envie um array de livros.' });
        }

        const resultado = {
            sucesso: [],
            falhas: []
        };

        for (const livroData of livros) {
            try {
                // Adiciona o campo disponível como true por padrão
                livroData.disponivel = true;
                
                const livro = new Livro(livroData);
                const novoLivro = await livro.save();
                resultado.sucesso.push(novoLivro);
            } catch (error) {
                resultado.falhas.push({
                    livro: livroData,
                    erro: error.message
                });
            }
        }

        res.status(201).json({
            message: `Importação concluída. ${resultado.sucesso.length} livros importados com sucesso e ${resultado.falhas.length} falhas.`,
            resultado
        });
    } catch (error) {
        console.error('Erro na importação de livros:', error);
        res.status(400).json({ message: 'Erro na importação', error: error.message });
    }
});

// Buscar livro por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id);
        if (livro) {
            res.json(livro);
        } else {
            res.status(404).json({ message: 'Livro não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ message: 'Erro ao buscar livro', error: error.message });
    }
});

// Atualizar livro
router.put('/:id', auth, async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id);
        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        livro.titulo = req.body.titulo || livro.titulo;
        livro.autor = req.body.autor || livro.autor;
        livro.genero = req.body.genero || livro.genero;
        livro.ano = req.body.ano || livro.ano;
        if (req.body.disponivel !== undefined) {
            livro.disponivel = req.body.disponivel;
        }
        
        const livroAtualizado = await livro.save();
        res.json(livroAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(400).json({ message: 'Erro ao atualizar livro', error: error.message });
    }
});

// Deletar livro
router.delete('/:id', auth, async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id);
        if (livro) {
            await livro.deleteOne();
            res.json({ message: 'Livro removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Livro não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(500).json({ message: 'Erro ao deletar livro', error: error.message });
    }
});

module.exports = router;
