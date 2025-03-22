const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getDashboardStats,
  generateReport,
} = require('../controllers/reportController');

// Rotas protegidas (requerem autenticação)
router.get('/dashboard', auth, getDashboardStats);
router.post('/generate', auth, generateReport);

module.exports = router; 