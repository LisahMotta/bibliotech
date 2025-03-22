const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');

// Listar todos os alunos
router.get('/', async (req, res) => {
    try {
        const alunos = await Aluno.find().sort({ nome: 1 });
        res.json(alunos);
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ message: 'Erro ao listar alunos', error: error.message });
    }
});

// Criar novo aluno
router.post('/', async (req, res) => {
    try {
        // Verifica se a matrícula já existe
        const matriculaExiste = await Aluno.findOne({ matricula: req.body.matricula });
        if (matriculaExiste) {
            return res.status(400).json({ message: 'Esta matrícula já está cadastrada' });
        }

        // Verifica se o email já existe
        const emailExiste = await Aluno.findOne({ email: req.body.email });
        if (emailExiste) {
            return res.status(400).json({ message: 'Este email já está cadastrado' });
        }

        const aluno = new Aluno({
            nome: req.body.nome,
            matricula: req.body.matricula,
            curso: req.body.curso,
            email: req.body.email
        });

        const novoAluno = await aluno.save();
        res.status(201).json(novoAluno);
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(400).json({ message: 'Erro ao criar aluno', error: error.message });
    }
});

// Importar múltiplos alunos
router.post('/importar', async (req, res) => {
    try {
        const alunos = req.body;
        if (!Array.isArray(alunos)) {
            return res.status(400).json({ message: 'Dados inválidos. Envie um array de alunos.' });
        }

        const resultado = {
            sucesso: [],
            falhas: []
        };

        for (const alunoData of alunos) {
            try {
                // Verifica se a matrícula já existe
                const matriculaExiste = await Aluno.findOne({ matricula: alunoData.matricula });
                if (matriculaExiste) {
                    resultado.falhas.push({
                        aluno: alunoData,
                        erro: 'Matrícula já cadastrada'
                    });
                    continue;
                }

                // Verifica se o email já existe
                const emailExiste = await Aluno.findOne({ email: alunoData.email });
                if (emailExiste) {
                    resultado.falhas.push({
                        aluno: alunoData,
                        erro: 'Email já cadastrado'
                    });
                    continue;
                }

                const aluno = new Aluno(alunoData);
                const novoAluno = await aluno.save();
                resultado.sucesso.push(novoAluno);
            } catch (error) {
                resultado.falhas.push({
                    aluno: alunoData,
                    erro: error.message
                });
            }
        }

        res.status(201).json({
            message: `Importação concluída. ${resultado.sucesso.length} alunos importados com sucesso e ${resultado.falhas.length} falhas.`,
            resultado
        });
    } catch (error) {
        console.error('Erro na importação de alunos:', error);
        res.status(400).json({ message: 'Erro na importação', error: error.message });
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
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ message: 'Erro ao buscar aluno', error: error.message });
    }
});

// Atualizar aluno
router.put('/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findById(req.params.id);
        if (!aluno) {
            return res.status(404).json({ message: 'Aluno não encontrado' });
        }

        // Se estiver alterando a matrícula, verifica se já existe
        if (req.body.matricula && req.body.matricula !== aluno.matricula) {
            const matriculaExiste = await Aluno.findOne({ matricula: req.body.matricula });
            if (matriculaExiste) {
                return res.status(400).json({ message: 'Esta matrícula já está cadastrada' });
            }
        }

        // Se estiver alterando o email, verifica se já existe
        if (req.body.email && req.body.email !== aluno.email) {
            const emailExiste = await Aluno.findOne({ email: req.body.email });
            if (emailExiste) {
                return res.status(400).json({ message: 'Este email já está cadastrado' });
            }
        }

        aluno.nome = req.body.nome || aluno.nome;
        aluno.matricula = req.body.matricula || aluno.matricula;
        aluno.curso = req.body.curso || aluno.curso;
        aluno.email = req.body.email || aluno.email;
        
        const alunoAtualizado = await aluno.save();
        res.json(alunoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(400).json({ message: 'Erro ao atualizar aluno', error: error.message });
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
        console.error('Erro ao deletar aluno:', error);
        res.status(500).json({ message: 'Erro ao deletar aluno', error: error.message });
    }
});

module.exports = router; 