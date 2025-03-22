const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    loanDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'overdue'),
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    condition: {
      type: DataTypes.ENUM('good', 'damaged', 'lost'),
      defaultValue: 'good',
    },
    fine: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    finePaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    finePaymentDate: {
      type: DataTypes.DATE,
    },
    finePaymentMethod: {
      type: DataTypes.STRING,
    },
    finePaymentNotes: {
      type: DataTypes.TEXT,
    },
  }, {
    hooks: {
      beforeCreate: async (loan) => {
        // Define a data de vencimento como 15 dias após a data do empréstimo
        if (!loan.dueDate) {
          const dueDate = new Date(loan.loanDate);
          dueDate.setDate(dueDate.getDate() + 15);
          loan.dueDate = dueDate;
        }
      },
      beforeUpdate: async (loan) => {
        // Atualiza o status para 'overdue' se a data de vencimento passou
        if (loan.status === 'active' && loan.dueDate < new Date()) {
          loan.status = 'overdue';
        }
      },
    },
  });

  return Loan;
}; 