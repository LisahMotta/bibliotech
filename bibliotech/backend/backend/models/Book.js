const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      unique: true,
    },
    publisher: {
      type: DataTypes.STRING,
    },
    publicationYear: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1900,
        max: new Date().getFullYear(),
      },
    },
    edition: {
      type: DataTypes.STRING,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    location: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    coverImage: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('available', 'unavailable', 'maintenance'),
      defaultValue: 'available',
    },
  });

  return Book;
};
