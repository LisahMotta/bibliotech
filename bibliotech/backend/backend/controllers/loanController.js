const { Loan, Book, Student } = require('../models');
const { Op } = require('sequelize');

const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      include: [
        { model: Book, attributes: ['title', 'author', 'isbn'] },
        { model: Student, attributes: ['name', 'ra', 'grade'] },
      ],
      order: [['loanDate', 'DESC']],
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empréstimos.' });
  }
};

const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [
        { model: Book, attributes: ['title', 'author', 'isbn'] },
        { model: Student, attributes: ['name', 'ra', 'grade'] },
      ],
    });
    if (!loan) {
      return res.status(404).json({ message: 'Empréstimo não encontrado.' });
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empréstimo.' });
  }
};

const createLoan = async (req, res) => {
  try {
    const { bookId, studentId, loanDate, dueDate } = req.body;

    // Verifica se o livro está disponível
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Livro não está disponível para empréstimo.' });
    }
    if (book.availableQuantity <= 0) {
      return res.status(400).json({ message: 'Livro não disponível para empréstimo.' });
    }

    // Verifica se o aluno existe
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    // Cria o empréstimo
    const loan = await Loan.create({
      bookId,
      studentId,
      loanDate: loanDate || new Date(),
      dueDate: dueDate || new Date(new Date().setDate(new Date().getDate() + 15)),
    });

    // Atualiza a quantidade disponível do livro e seu status
    const newAvailableQuantity = book.availableQuantity - 1;
    await book.update({
      availableQuantity: newAvailableQuantity,
      status: newAvailableQuantity === 0 ? 'unavailable' : 'available'
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar empréstimo.' });
  }
};

const returnBook = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [{ model: Book }],
    });

    if (!loan) {
      return res.status(404).json({ message: 'Empréstimo não encontrado.' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Este livro já foi devolvido.' });
    }

    const { condition, notes } = req.body;
    const returnDate = new Date();

    // Calcula multa se houver atraso
    let fine = 0;
    if (returnDate > loan.dueDate) {
      const daysLate = Math.ceil((returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysLate * 0.5; // R$ 0,50 por dia de atraso
    }

    // Atualiza o empréstimo
    await loan.update({
      status: 'returned',
      returnDate,
      condition,
      notes,
      fine,
    });

    // Atualiza a quantidade disponível do livro e seu status
    const newAvailableQuantity = loan.Book.availableQuantity + 1;
    await loan.Book.update({
      availableQuantity: newAvailableQuantity,
      status: newAvailableQuantity > 0 ? 'available' : 'unavailable'
    });

    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao registrar devolução.' });
  }
};

const getActiveLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { status: 'active' },
      include: [
        { model: Book, attributes: ['title', 'author', 'isbn'] },
        { model: Student, attributes: ['name', 'ra', 'grade'] },
      ],
      order: [['dueDate', 'ASC']],
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empréstimos ativos.' });
  }
};

const getOverdueLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.lt]: new Date(),
        },
      },
      include: [
        { model: Book, attributes: ['title', 'author', 'isbn'] },
        { model: Student, attributes: ['name', 'ra', 'grade'] },
      ],
      order: [['dueDate', 'ASC']],
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empréstimos atrasados.' });
  }
};

const getStudentLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { studentId: req.params.studentId },
      include: [
        { model: Book, attributes: ['title', 'author', 'isbn'] },
        { model: Student, attributes: ['name', 'ra', 'grade'] },
      ],
      order: [['loanDate', 'DESC']],
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empréstimos do aluno.' });
  }
};

module.exports = {
  getAllLoans,
  getLoanById,
  createLoan,
  returnBook,
  getActiveLoans,
  getOverdueLoans,
  getStudentLoans,
}; 