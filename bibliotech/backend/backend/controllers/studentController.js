const { Student } = require('../models');
const xlsx = require('xlsx');

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [['name', 'ASC']],
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar alunos.' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar aluno.' });
  }
};

const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar aluno.' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }
    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar aluno.' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }
    await student.destroy();
    res.json({ message: 'Aluno excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir aluno.' });
  }
};

const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    const students = await Student.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { ra: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      },
      order: [['name', 'ASC']],
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar alunos.' });
  }
};

const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const students = await Promise.all(
      data.map(async (row) => {
        // Verificar se os campos obrigatórios estão presentes
        if (!row.nome && !row.name && !row.Nome && !row.NAME) {
          throw new Error('Nome é obrigatório');
        }
        if (!row.ra && !row.RA && !row.Ra && !row.matricula && !row.Matricula) {
          throw new Error('RA é obrigatório');
        }
        if (!row.serie && !row.Serie && !row.SÉRIE && !row.série && !row.grade && !row.Grade) {
          throw new Error('Série é obrigatória');
        }

        return Student.create({
          name: row.nome || row.name || row.Nome || row.NAME,
          ra: row.ra || row.RA || row.Ra || row.matricula || row.Matricula,
          grade: row.serie || row.Serie || row.SÉRIE || row.série || row.grade || row.Grade,
        });
      })
    );

    res.status(201).json({
      message: `${students.length} alunos importados com sucesso.`,
      students,
    });
  } catch (error) {
    console.error('Erro ao importar alunos:', error);
    res.status(400).json({ 
      message: 'Erro ao importar alunos.',
      error: error.message 
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  importStudents,
}; 