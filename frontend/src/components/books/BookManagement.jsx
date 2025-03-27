import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/api';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    edition: '',
    quantity: 1,
    availableQuantity: 1,
    location: '',
    category: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookService.getAll();
      setBooks(response.data);
    } catch (err) {
      setError('Erro ao carregar livros. Por favor, recarregue a página.');
      console.error('Erro ao carregar livros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadBooks();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await bookService.search(searchTerm);
      setBooks(response.data);
    } catch (err) {
      setError('Erro ao buscar livros. Por favor, tente novamente.');
      console.error('Erro ao buscar livros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      await bookService.importExcel(file);
      alert('Livros importados com sucesso!');
      loadBooks();
    } catch (err) {
      setError('Erro ao importar livros. Por favor, verifique o arquivo e tente novamente.');
      console.error('Erro ao importar livros:', err);
    } finally {
      setLoading(false);
      event.target.value = null; // Limpa o input file
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await bookService.create(newBook);
      alert('Livro cadastrado com sucesso!');
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: '',
        edition: '',
        quantity: 1,
        availableQuantity: 1,
        location: '',
        category: '',
        description: '',
        status: 'available'
      });
      setShowForm(false);
      loadBooks();
    } catch (err) {
      setError('Erro ao cadastrar livro. Por favor, tente novamente.');
      console.error('Erro ao cadastrar livro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      await bookService.update(bookId, { status: newStatus });
      alert('Status do livro atualizado com sucesso!');
      loadBooks();
    } catch (err) {
      setError('Erro ao atualizar status do livro. Por favor, tente novamente.');
      console.error('Erro ao atualizar status do livro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Livros</h2>
        <div className="space-x-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
          >
            {showForm ? 'Cancelar' : 'Novo Livro'}
          </button>
          <label className="btn btn-secondary">
            Importar Lista
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
              disabled={loading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Novo Livro</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={newBook.title}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  name="author"
                  value={newBook.author}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={newBook.isbn}
                  onChange={handleInputChange}
                  className="input w-full"
                  pattern="^[\d-]{10,13}$"
                  title="ISBN deve ter entre 10 e 13 dígitos"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Editora
                </label>
                <input
                  type="text"
                  name="publisher"
                  value={newBook.publisher}
                  onChange={handleInputChange}
                  className="input w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano de Publicação
                </label>
                <input
                  type="number"
                  name="publicationYear"
                  value={newBook.publicationYear}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edição
                </label>
                <input
                  type="text"
                  name="edition"
                  value={newBook.edition}
                  onChange={handleInputChange}
                  className="input w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Total
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newBook.quantity}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Disponível
                </label>
                <input
                  type="number"
                  name="availableQuantity"
                  value={newBook.availableQuantity}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="0"
                  max={newBook.quantity}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  name="location"
                  value={newBook.location}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Ex: Estante A, Prateleira 3"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  name="category"
                  value={newBook.category}
                  onChange={handleInputChange}
                  className="input w-full"
                  disabled={loading}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={newBook.description}
                  onChange={handleInputChange}
                  className="input w-full"
                  rows="3"
                  disabled={loading}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Lista de Livros</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Buscar livros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              className="btn btn-secondary"
              disabled={loading}
            >
              Buscar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título/Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN/Editora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.isbn}</div>
                    <div className="text-sm text-gray-500">{book.publisher}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.availableQuantity} / {book.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      book.status === 'available' ? 'bg-green-100 text-green-800' :
                      book.status === 'unavailable' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {book.status === 'available' ? 'Disponível' :
                       book.status === 'unavailable' ? 'Indisponível' :
                       'Em Manutenção'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={book.status}
                      onChange={(e) => handleUpdateStatus(book.id, e.target.value)}
                      className="input text-sm"
                      disabled={loading}
                    >
                      <option value="available">Disponível</option>
                      <option value="unavailable">Indisponível</option>
                      <option value="maintenance">Em Manutenção</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookManagement; 