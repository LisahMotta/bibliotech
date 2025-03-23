const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');
const { auth } = require('../middlewares/auth');

// Listar todos os alunos
router.get('/', auth, async (req, res) => {
    try {
        const alunos = await Aluno.find().sort({ nome: 1 });
        res.json(alunos);
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ message: 'Erro ao listar alunos', error: error.message });
    }
});

// Criar novo aluno
router.post('/', auth, async (req, res) => {
    try {
        // Verifica se a matrícula já existe
        const matriculaExiste = await Aluno.findOne({ matricula: req.body.matricula });
        if (matriculaExiste) {
            return res.status(400).json({ message: 'Esta matrícula já está cadastrada' });
        }

        const aluno = new Aluno({
            nome: req.body.nome,
            matricula: req.body.matricula,
            curso: req.body.curso
        });

        const novoAluno = await aluno.save();
        res.status(201).json(novoAluno);
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(400).json({ message: 'Erro ao criar aluno', error: error.message });
    }
});

// Importar múltiplos alunos
router.post('/importar', auth, async (req, res) => {
    try {
        const alunos = req.body;
        
        if (!Array.isArray(alunos)) {
            return res.status(400).json({ 
                message: 'Dados inválidos. Envie um array de alunos.',
                resultado: {
                    sucesso: [],
                    falha: []
                }
            });
        }

        const resultados = {
            sucesso: [],
            falha: []
        };

        for (const aluno of alunos) {
            try {
                // Verificar se já existe um aluno com a mesma matrícula
                const alunoExistente = await Aluno.findOne({ 
                    $or: [
                        { numeroRegistro: aluno.matricula },
                        { email: aluno.email }
                    ]
                });

                if (alunoExistente) {
                    resultados.falha.push({
                        aluno,
                        erro: alunoExistente.numeroRegistro === aluno.matricula 
                            ? 'Matrícula já cadastrada' 
                            : 'Email já cadastrado'
                    });
                    continue;
                }

                // Criar novo aluno
                const novoAluno = new Aluno({
                    nome: aluno.nome,
                    numeroRegistro: aluno.matricula,
                    curso: aluno.curso,
                    email: aluno.email || `${aluno.matricula}@escola.com`
                });

                await novoAluno.save();
                resultados.sucesso.push(novoAluno);
            } catch (erro) {
                console.error('Erro ao importar aluno:', erro);
                resultados.falha.push({
                    aluno,
                    erro: erro.message
                });
            }
        }

        res.json({
            message: `${resultados.sucesso.length} alunos importados com sucesso${resultados.falha.length > 0 ? `, ${resultados.falha.length} falharam` : ''}.`,
            resultado: resultados
        });
    } catch (erro) {
        console.error('Erro ao importar alunos:', erro);
        res.status(500).json({ 
            message: 'Erro ao importar alunos',
            erro: erro.message,
            resultado: {
                sucesso: [],
                falha: []
            }
        });
    }
});

// Buscar aluno por ID
router.get('/:id', auth, async (req, res) => {
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
router.put('/:id', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {
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