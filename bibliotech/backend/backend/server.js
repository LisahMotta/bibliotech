const express = require('express'); const cors = require('cors'); const morgan = require('morgan'); const helmet = require('helmet'); const compression = require('compression'); const { sequelize } = require('./models'); require('dotenv').config(); const app = express(); app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], exposedHeaders: ['Content-Range', 'X-Content-Range'], credentials: true, maxAge: 86400 })); app.use(compression()); app.use(morgan('dev')); app.use(express.json()); app.use(express.urlencoded({ extended: true })); app.use('/api/auth', require('./routes/auth')); app.use('/api/books', require('./routes/books')); app.use('/api/students', require('./routes/students')); app.use('/api/loans', require('./routes/loans')); app.use('/api/reports', require('./routes/reports')); app.get('/', (req, res) => { res.json({ message: 'API do BiblioTech está funcionando!' }); }); app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ message: 'Erro interno do servidor.' }); }); const PORT = process.env.PORT || 3001; const startServer = async () => { try { await sequelize.authenticate(); console.log('Conexão com o banco de dados estabelecida com sucesso.'); await sequelize.sync(); console.log('Modelos sincronizados com o banco de dados.'); app.listen(PORT, () => { console.log(`Servidor rodando na porta ${PORT}`); }); } catch (error) { console.error('Erro ao iniciar o servidor:', error); process.exit(1); } }; startServer();
