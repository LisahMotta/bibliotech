const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, adminAuth } = require('../middlewares/auth');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  importStudents,
} = require('../controllers/studentController');

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas públicas
router.get('/', getAllStudents);
router.get('/search', searchStudents);
router.get('/:id', getStudentById);

// Rotas protegidas (requerem autenticação)
router.post('/', auth, adminAuth, createStudent);
router.put('/:id', auth, adminAuth, updateStudent);
router.delete('/:id', auth, adminAuth, deleteStudent);
router.post('/import', auth, adminAuth, upload.single('file'), importStudents);

module.exports = router; 