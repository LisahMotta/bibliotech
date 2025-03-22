const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  login,
  register,
  getProfile,
  updateProfile,
} = require('../controllers/authController');

// Rotas públicas
router.post('/login', login);
router.post('/register', register);

// Rotas protegidas
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router; 