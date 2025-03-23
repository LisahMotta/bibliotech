const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: ['https://bibliotech-1.onrender.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Importar rotas
const authRoutes = require('./routes/auth');
const livroRoutes = require('./routes/livros');
const alunoRoutes = require('./routes/alunos');
const emprestimoRoutes = require('./routes/emprestimos');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/livros', livroRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/emprestimos', emprestimoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
