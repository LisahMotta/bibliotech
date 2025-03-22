const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getAllLoans,
  getLoanById,
  createLoan,
  returnBook,
  getActiveLoans,
  getOverdueLoans,
  getStudentLoans,
} = require('../controllers/loanController');

// Rotas públicas
router.get('/', getAllLoans);
router.get('/active', getActiveLoans);
router.get('/overdue', getOverdueLoans);
router.get('/student/:studentId', getStudentLoans);
router.get('/:id', getLoanById);

// Rotas protegidas (requerem autenticação)
router.post('/', auth, createLoan);
router.post('/:id/return', auth, returnBook);

module.exports = router; 