const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Middlewares
app.use(express.json());
app.use(cors());

// Importação das rotas
const alunoRoutes = require('./routes/alunos');
const livroRoutes = require('./routes/livros');
const emprestimoRoutes = require('./routes/emprestimos');
const authRoutes = require('./routes/auth');

// Uso das rotas
app.use('/api/alunos', alunoRoutes);
app.use('/api/livros', livroRoutes);
app.use('/api/emprestimos', emprestimoRoutes);
app.use('/api/auth', authRoutes);

// Conexão com o banco
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectado com sucesso!"))
.catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API BiblioTech funcionando!' });
});

// Início do servidor
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
