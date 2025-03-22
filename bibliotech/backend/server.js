const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

// Middlewares
app.use(express.json());
app.use(cors());

// Importação das rotas
const alunoRoutes = require('./routes/alunos');
const livroRoutes = require('./routes/livros');
const emprestimoRoutes = require('./routes/emprestimos');

// Uso das rotas
app.use('/alunos', alunoRoutes);
app.use('/livros', livroRoutes);
app.use('/emprestimos', emprestimoRoutes);

// Conexão com o banco (substitua com sua URI se necessário)
mongoose.connect('mongodb://localhost:27017/bibliotech', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectado com sucesso!"))
.catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Início do servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
