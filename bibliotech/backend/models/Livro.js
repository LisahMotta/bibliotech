// backend/models/Livro.js
const mongoose = require('mongoose');

const livroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'O título é obrigatório'],
    trim: true
  },
  autor: {
    type: String,
    required: [true, 'O autor é obrigatório'],
    trim: true
  },
  genero: {
    type: String,
    required: [true, 'O gênero é obrigatório'],
    trim: true
  },
  ano: {
    type: Number,
    required: [true, 'O ano é obrigatório'],
    min: [1000, 'Ano inválido'],
    max: [new Date().getFullYear(), 'Ano não pode ser maior que o atual']
  },
  disponivel: {
    type: Boolean,
    default: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
});

// Índices para melhorar a performance das buscas
livroSchema.index({ titulo: 1 });
livroSchema.index({ autor: 1 });
livroSchema.index({ genero: 1 });

module.exports = mongoose.model('Livro', livroSchema);
