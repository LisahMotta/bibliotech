const express = require("express");
const router = express.Router();

// Modelo Aluno (Ajuste conforme necessário)
const Aluno = require("../models/Aluno");

// 🔍 Listar todos os alunos
router.get("/", async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar alunos." });
  }
});

// ➕ Criar um novo aluno
router.post("/", async (req, res) => {
  const { nome, RA, serie } = req.body;
  try {
    const novoAluno = new Aluno({ nome, RA, serie });
    await novoAluno.save();
    res.status(201).json(novoAluno);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar aluno." });
  }
});

module.exports = router;
