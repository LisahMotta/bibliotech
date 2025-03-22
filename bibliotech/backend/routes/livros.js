const express = require('express');
const router = express.Router();
const Livro = require('../models/Livro');

// Criar um livro
router.post('/', async (req, res) => {
    try {
        const novoLivro = new Livro(req.body);
        await novoLivro.save();
        res.status(201).json(novoLivro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos os livros
router.get('/', async (req, res) => {
    const livros = await Livro.find();
    res.json(livros);
});

module.exports = router;
