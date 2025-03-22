// backend/models/Livro.js
const mongoose = require('mongoose');

const livroSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  genero: String,
  ano: Number,
});

module.exports = mongoose.model('Livro', livroSchema);
