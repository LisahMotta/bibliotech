const express = require("express");
const router = express.Router();

// Modelo Livro (ajuste conforme necessário)
const Livro = require("../models/Livro");

// 🔍 Listar todos os livros
router.get("/", async (req, res) => {
  try {
    const livros = await Livro.find();
    res.json(livros);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar livros." });
  }
});

// ➕ Criar um novo livro
router.post("/", async (req, res) => {
  const { titulo, autor, isbn } = req.body;
  try {
    const novoLivro = new Livro({ titulo, autor, isbn });
    await novoLivro.save();
    res.status(201).json(novoLivro);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar livro." });
  }
});

module.exports = router;
