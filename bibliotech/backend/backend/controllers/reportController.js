const { Loan, Book, Student } = require('../models');
const { Op } = require('sequelize');
const { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);

    // Empréstimos do dia
    const todayLoans = await Loan.count({
      where: {
        loanDate: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    // Empréstimos da semana
    const weekLoans = await Loan.count({
      where: {
        loanDate: {
          [Op.between]: [weekStart, weekEnd],
        },
      },
    });

    // Empréstimos do mês
    const monthLoans = await Loan.count({
      where: {
        loanDate: {
          [Op.between]: [monthStart, monthEnd],
        },
      },
    });

    // Empréstimos do ano
    const yearLoans = await Loan.count({
      where: {
        loanDate: {
          [Op.between]: [yearStart, yearEnd],
        },
      },
    });

    // Livros mais emprestados por série
    const mostLoanedBooksByGrade = await Loan.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Loan.id')), 'loanCount'],
      ],
      include: [
        {
          model: Book,
          attributes: ['title', 'author'],
        },
        {
          model: Student,
          attributes: ['grade'],
        },
      ],
      group: ['Student.grade', 'Book.id', 'Book.title', 'Book.author'],
      order: [[sequelize.fn('COUNT', sequelize.col('Loan.id')), 'DESC']],
      limit: 5,
    });

    // Empréstimos por mês (últimos 12 meses)
    const monthlyLoans = await Loan.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('loanDate')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        loanDate: {
          [Op.gte]: startOfMonth(new Date(today.setMonth(today.getMonth() - 11))),
        },
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('loanDate'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('loanDate')), 'ASC']],
    });

    // Top 10 livros mais emprestados
    const topBooks = await Loan.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Loan.id')), 'loanCount'],
      ],
      include: [
        {
          model: Book,
          attributes: ['title', 'author'],
        },
      ],
      group: ['Book.id', 'Book.title', 'Book.author'],
      order: [[sequelize.fn('COUNT', sequelize.col('Loan.id')), 'DESC']],
      limit: 10,
    });

    res.json({
      stats: {
        todayLoans,
        weekLoans,
        monthLoans,
        yearLoans,
      },
      mostLoanedBooksByGrade,
      monthlyLoans: monthlyLoans.map(loan => ({
        month: format(new Date(loan.getDataValue('month')), 'MMMM yyyy', { locale: ptBR }),
        count: loan.getDataValue('count'),
      })),
      topBooks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatório.' });
  }
};

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.body;

    let report = null;

    switch (reportType) {
      case 'loans':
        report = await Loan.findAll({
          where: {
            loanDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          include: [
            { model: Book, attributes: ['title', 'author', 'isbn'] },
            { model: Student, attributes: ['name', 'ra', 'grade'] },
          ],
          order: [['loanDate', 'DESC']],
        });
        break;

      case 'overdue':
        report = await Loan.findAll({
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
        break;

      case 'popular':
        report = await Loan.findAll({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('Loan.id')), 'loanCount'],
          ],
          include: [
            {
              model: Book,
              attributes: ['title', 'author', 'isbn'],
            },
          ],
          where: {
            loanDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          group: ['Book.id', 'Book.title', 'Book.author', 'Book.isbn'],
          order: [[sequelize.fn('COUNT', sequelize.col('Loan.id')), 'DESC']],
          limit: 20,
        });
        break;

      default:
        return res.status(400).json({ message: 'Tipo de relatório inválido.' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatório.' });
  }
};

module.exports = {
  getDashboardStats,
  generateReport,
}; 