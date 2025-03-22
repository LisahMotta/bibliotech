const express = require('express');
const router = express.Router();
const Emprestimo = require('../models/Emprestimo');

// Criar um empréstimo
router.post('/', async (req, res) => {
    try {
        const novoEmprestimo = new Emprestimo(req.body);
        await novoEmprestimo.save();
        res.status(201).json(novoEmprestimo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos os empréstimos
router.get('/', async (req, res) => {
    const emprestimos = await Emprestimo.find().populate('aluno_id livro_id');
    res.json(emprestimos);
});

module.exports = router;
