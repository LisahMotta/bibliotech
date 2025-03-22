const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, adminAuth } = require('../middlewares/auth');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  importBooks,
} = require('../controllers/bookController');

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas públicas
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Rotas protegidas (requerem autenticação)
router.post('/', auth, adminAuth, createBook);
router.put('/:id', auth, adminAuth, updateBook);
router.delete('/:id', auth, adminAuth, deleteBook);
router.post('/import', auth, adminAuth, upload.single('file'), importBooks);

module.exports = router; 