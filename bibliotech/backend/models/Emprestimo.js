const mongoose = require('mongoose');

const EmprestimoSchema = new mongoose.Schema({
    aluno_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aluno',
        required: true
    },
    livro_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Livro',
        required: true
    },
    data_emprestimo: {
        type: Date,
        default: Date.now
    },
    data_devolucao: {
        type: Date
    },
    devolvido: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Emprestimo', EmprestimoSchema);
