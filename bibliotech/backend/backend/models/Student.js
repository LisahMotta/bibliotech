const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ra: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING, // Ex: "A", "B", "C"
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    parentName: {
      type: DataTypes.STRING,
    },
    parentPhone: {
      type: DataTypes.STRING,
    },
    parentEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    photo: {
      type: DataTypes.STRING, // URL da foto
    },
  });

  return Student;
}; 