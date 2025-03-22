const mongoose = require('mongoose');

const alunoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true
    },
    matricula: {
        type: String,
        required: [true, 'A matrícula é obrigatória'],
        unique: true,
        trim: true
    },
    curso: {
        type: String,
        required: [true, 'O curso é obrigatório'],
        trim: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

// Índices para melhorar a performance das buscas
alunoSchema.index({ nome: 1 });
alunoSchema.index({ matricula: 1 });
alunoSchema.index({ curso: 1 });

module.exports = mongoose.model('Aluno', alunoSchema); 