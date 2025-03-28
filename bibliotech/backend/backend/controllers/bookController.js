const { Book } = require('../models');
const xlsx = require('xlsx');

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['title', 'ASC']],
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar livros.' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar livro.' });
  }
};

const createBook = async (req, res) => {
  try {
    console.log('📚 Dados recebidos:', req.body);
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    console.error('❌ Erro ao criar livro:', error);
    res.status(400).json({ message: 'Erro ao criar livro.', error: error.message });
  }
};
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    await book.update(req.body);
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar livro.' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }
    await book.destroy();
    res.json({ message: 'Livro excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir livro.' });
  }
};

const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { author: { [Op.like]: `%${q}%` } },
          { isbn: { [Op.like]: `%${q}%` } },
        ],
      },
      order: [['title', 'ASC']],
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar livros.' });
  }
};

const importBooks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const books = await Promise.all(
      data.map(async (row) => {
        return Book.create({
          title: row.title,
          author: row.author,
          isbn: row.isbn,
          publisher: row.publisher,
          publicationYear: row.publicationYear,
          edition: row.edition,
          quantity: row.quantity || 1,
          availableQuantity: row.availableQuantity || row.quantity || 1,
          location: row.location,
          category: row.category,
          description: row.description,
        });
      })
    );

    res.status(201).json({
      message: `${books.length} livros importados com sucesso.`,
      books,
    });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao importar livros.' });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  importBooks,
}; 
