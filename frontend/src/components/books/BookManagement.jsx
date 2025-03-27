import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/api';

const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    edition: '',
    quantity: 1,
    location: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookService.getAll();
      if (response.data) {
        setBooks(response.data);
      }
    } catch (err) {
      setError('Erro ao carregar livros.');
      console.error('Erro ao carregar livros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await bookService.search(searchTerm);
      setSearchResults(response.data);
    } catch (err) {
      setError('Erro ao buscar livros. Por favor, tente novamente.');
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      await bookService.importExcel(file);
      alert('Importação realizada com sucesso!');
      loadBooks();
    } catch (err) {
      setError('Erro ao importar arquivo. Por favor, tente novamente.');
      console.error('Erro na importação:', err);
    } finally {
      setLoading(false);
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
      setShowForm(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: '',
        edition: '',
        quantity: 1,
        location: '',
        category: '',
        description: ''
      });
      loadBooks();
    } catch (err) {
      setError('Erro ao cadastrar livro. Por favor, tente novamente.');
      console.error('Erro ao cadastrar:', err);
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
            {showForm ? 'Cancelar' : 'Cadastrar Livro'}
          </button>
          <label className="btn btn-secondary cursor-pointer">
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

      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Buscar por título, autor ou ISBN..."
              className="input flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
        </form>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cadastrar Novo Livro</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  name="title"
                  value={newBook.title}
                  onChange={handleInputChange}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Autor</label>
                <input
                  type="text"
                  name="author"
                  value={newBook.author}
                  onChange={handleInputChange}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={newBook.isbn}
                  onChange={handleInputChange}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Editora</label>
                <input
                  type="text"
                  name="publisher"
                  value={newBook.publisher}
                  onChange={handleInputChange}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ano de Publicação</label>
                <input
                  type="number"
                  name="publicationYear"
                  value={newBook.publicationYear}
                  onChange={handleInputChange}
                  className="input mt-1"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Edição</label>
                <input
                  type="text"
                  name="edition"
                  value={newBook.edition}
                  onChange={handleInputChange}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                <input
                  type="number"
                  name="quantity"
                  value={newBook.quantity}
                  onChange={handleInputChange}
                  className="input mt-1"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Localização</label>
                <input
                  type="text"
                  name="location"
                  value={newBook.location}
                  onChange={handleInputChange}
                  className="input mt-1"
                  placeholder="Ex: Estante A, Prateleira 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <input
                  type="text"
                  name="category"
                  value={newBook.category}
                  onChange={handleInputChange}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  value={newBook.description}
                  onChange={handleInputChange}
                  className="input mt-1"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          {searchResults.length > 0 ? 'Resultados da Busca' : 'Livros Cadastrados'}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(searchResults.length > 0 ? searchResults : books).map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.isbn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Editar
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Excluir
                    </button>
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