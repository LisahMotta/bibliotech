const express = require("express");
const router = express.Router();

// 🔍 Listar todos os empréstimos (Exemplo básico)
router.get("/", (req, res) => {
  res.json({ mensagem: "Lista de empréstimos" });
});

// ➕ Criar um novo empréstimo
router.post("/", (req, res) => {
  res.json({ mensagem: "Empréstimo registrado com sucesso!" });
});

module.exports = router;
