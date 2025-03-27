const express = require('express');
const cors = require('cors');
const app = express();

// Configuração do CORS
app.use(cors({
  origin: '*', // Permite todas as origens durante o desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 horas
}));

// ... existing code ... 