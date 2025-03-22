import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/api';

const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError('Erro ao importar arquivo. Por favor, tente novamente.');
      console.error('Erro na importação:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Livros</h2>
        <div className="space-x-4">
          <button className="btn btn-primary" onClick={() => console.log('Cadastrar livro')}>
            Cadastrar Livro
          </button>
          <label className="btn btn-secondary cursor-pointer">
            Importar Lista
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
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
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <div className="text-sm text-gray-600">
            Se o livro não for encontrado, você pode cadastrá-lo clicando em "Cadastrar Livro"
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Livro Tombo</h3>
          <p className="text-gray-600">
            Gerencie o registro de tombo dos livros da biblioteca
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cadastro Manual</h3>
          <p className="text-gray-600">
            Cadastre novos livros manualmente no sistema
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Importação em Lote</h3>
          <p className="text-gray-600">
            Importe uma lista de livros através de arquivo Excel
          </p>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Resultados da Busca</h3>
          <div className="space-y-4">
            {searchResults.map((book) => (
              <div key={book.id} className="border-b pb-4">
                <h4 className="font-medium">{book.title}</h4>
                <p className="text-gray-600">{book.author}</p>
                <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                <div className="mt-2 space-x-2">
                  <button className="text-sm text-primary-600 hover:text-primary-800">
                    Editar
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-800">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement; 