const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/database');

const db = {};
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  logging: dbConfig.logging,
});

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const modelExport = require(path.join(__dirname, file));
    // Skip Mongoose models (they export an object, not a factory function)
    if (typeof modelExport !== 'function') return;
    const model = modelExport(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
