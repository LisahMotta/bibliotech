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
    console.log('Iniciando importação de alunos...');
    console.log('Arquivo recebido:', req.file);

    if (!req.file) {
      console.log('Nenhum arquivo recebido');
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    console.log('Lendo arquivo Excel...');
    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log('Dados lidos do Excel:', data);

    const students = await Promise.all(
      data.map(async (row) => {
        console.log('Processando linha:', row);
        
        // Verificar se os campos obrigatórios estão presentes
        if (!row.nome && !row.name && !row.Nome && !row.NAME) {
          console.log('Erro: Nome não encontrado na linha:', row);
          throw new Error('Nome é obrigatório');
        }
        if (!row.ra && !row.RA && !row.Ra && !row.matricula && !row.Matricula) {
          console.log('Erro: RA não encontrado na linha:', row);
          throw new Error('RA é obrigatório');
        }
        if (!row.serie && !row.Serie && !row.SÉRIE && !row.série && !row.grade && !row.Grade) {
          console.log('Erro: Série não encontrada na linha:', row);
          throw new Error('Série é obrigatória');
        }

        const studentData = {
          name: row.nome || row.name || row.Nome || row.NAME,
          ra: row.ra || row.RA || row.Ra || row.matricula || row.Matricula,
          grade: row.serie || row.Serie || row.SÉRIE || row.série || row.grade || row.Grade,
        };

        console.log('Dados do aluno a serem criados:', studentData);
        return Student.create(studentData);
      })
    );

    console.log('Alunos importados com sucesso:', students);
    res.status(201).json({
      message: `${students.length} alunos importados com sucesso.`,
      students,
    });
  } catch (error) {
    console.error('Erro detalhado ao importar alunos:', error);
    res.status(400).json({ 
      message: 'Erro ao importar alunos.',
      error: error.message,
      stack: error.stack
    });
  }
};

const exportStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [['name', 'ASC']],
    });

    // Criar um novo workbook
    const workbook = xlsx.utils.book_new();
    
    // Converter os dados dos alunos para o formato do Excel
    const data = students.map(student => ({
      nome: student.name,
      RA: student.ra,
      série: student.grade,
      email: student.email || '',
      telefone: student.phone || '',
      endereço: student.address || '',
      nome_responsável: student.parentName || '',
      telefone_responsável: student.parentPhone || '',
      email_responsável: student.parentEmail || '',
      status: student.status
    }));

    // Criar uma nova planilha
    const worksheet = xlsx.utils.json_to_sheet(data);

    // Adicionar a planilha ao workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Alunos');

    // Gerar o buffer do arquivo Excel
    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Configurar os headers da resposta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=alunos.xlsx');

    // Enviar o arquivo
    res.send(excelBuffer);
  } catch (error) {
    console.error('Erro ao exportar alunos:', error);
    res.status(500).json({ message: 'Erro ao exportar alunos.' });
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
  exportStudents,
}; 