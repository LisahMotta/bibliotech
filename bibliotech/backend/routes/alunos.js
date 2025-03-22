const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

// Listar todos os alunos
router.get('/', async (req, res) => {
    try {
        const alunos = await Aluno.find();
        res.json(alunos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Criar novo aluno
router.post('/', async (req, res) => {
    const aluno = new Aluno({
        nome: req.body.nome,
        matricula: req.body.matricula,
        curso: req.body.curso,
        email: req.body.email
    });

    try {
        const novoAluno = await aluno.save();
        res.status(201).json(novoAluno);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findById(req.params.id);
        if (aluno) {
            res.json(aluno);
        } else {
            res.status(404).json({ message: 'Aluno não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar aluno
router.put('/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findById(req.params.id);
        if (aluno) {
            aluno.nome = req.body.nome || aluno.nome;
            aluno.matricula = req.body.matricula || aluno.matricula;
            aluno.curso = req.body.curso || aluno.curso;
            aluno.email = req.body.email || aluno.email;
            
            const alunoAtualizado = await aluno.save();
            res.json(alunoAtualizado);
        } else {
            res.status(404).json({ message: 'Aluno não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Deletar aluno
router.delete('/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findById(req.params.id);
        if (aluno) {
            await aluno.deleteOne();
            res.json({ message: 'Aluno removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Aluno não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 