require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — responde imediatamente, sem depender do banco
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  // Sobe o servidor primeiro para o healthcheck do Railway funcionar
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

  if (!process.env.DATABASE_URL) {
    console.error('ERRO: DATABASE_URL não está definida.');
  }
  if (!process.env.JWT_SECRET) {
    console.error('ERRO: JWT_SECRET não está definida. Autenticação não funcionará.');
  }

  // Registra rotas (dependem dos models/DB)
  try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/books', require('./routes/books'));
    app.use('/api/students', require('./routes/students'));
    app.use('/api/loans', require('./routes/loans'));
    app.use('/api/reports', require('./routes/reports'));
  } catch (err) {
    console.error('Erro ao carregar rotas:', err.message);
  }

  // Serve frontend em produção
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../../frontend/dist');
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    app.use(helmet());
  }

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  });

  // Conecta ao banco de dados
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
  }
};

startServer();
