import React, { useState, useEffect } from 'react';
import { loanService, studentService, bookService } from '../../services/api';

const LoanManagement = () => {
  const [loanType, setLoanType] = useState('new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, booksRes, loansRes] = await Promise.all([
        studentService.getAll(),
        bookService.getAll(),
        loanService.getActive()
      ]);
      setStudents(studentsRes.data);
      setBooks(booksRes.data);
      setActiveLoans(loansRes.data);
    } catch (err) {
      setError('Erro ao carregar dados. Por favor, recarregue a página.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setShowSearchResults(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await bookService.search(searchTerm);
      setSearchResults(response.data.filter(book => book.availableQuantity > 0 && book.status === 'available'));
      setShowSearchResults(true);
    } catch (err) {
      setError('Erro ao buscar livros. Por favor, tente novamente.');
      console.error('Erro ao buscar livros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoan = (bookId) => {
    setSelectedBook(bookId);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook) {
      setError('Por favor, selecione um aluno e um livro.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loanService.create({
        studentId: selectedStudent,
        bookId: selectedBook,
        loanDate,
        dueDate
      });
      alert('Empréstimo registrado com sucesso!');
      setSelectedStudent('');
      setSelectedBook('');
      setLoanDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      loadData();
    } catch (err) {
      setError('Erro ao registrar empréstimo. Por favor, tente novamente.');
      console.error('Erro ao registrar empréstimo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    setLoading(true);
    setError(null);
    try {
      await loanService.return(loanId);
      alert('Devolução registrada com sucesso!');
      loadData();
    } catch (err) {
      setError('Erro ao registrar devolução. Por favor, tente novamente.');
      console.error('Erro ao registrar devolução:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Empréstimos</h2>
        <div className="space-x-4">
          <button
            className={`btn ${loanType === 'new' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLoanType('new')}
            disabled={loading}
          >
            Novo Empréstimo
          </button>
          <button
            className={`btn ${loanType === 'return' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLoanType('return')}
            disabled={loading}
          >
            Devolução
          </button>
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

      {loanType === 'new' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Novo Empréstimo</h3>
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar livro por título, autor ou ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input w-full pr-24"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                className="btn btn-secondary absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                Buscar
              </button>
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 hover:bg-gray-50 flex justify-between items-center border-b last:border-b-0"
                  >
                    <div>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-gray-600">
                        {book.author} - Disponíveis: {book.availableQuantity}
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickLoan(book.id)}
                      className="btn btn-primary btn-sm"
                      disabled={loading}
                    >
                      Emprestar
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && (
              <div className="mt-2 text-gray-600">
                Nenhum livro disponível encontrado.
              </div>
            )}
          </div>
          <form onSubmit={handleCreateLoan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aluno
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input w-full"
                  required
                  disabled={loading}
                >
                  <option value="">Selecione um aluno</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.ra} - {student.grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Livro
                </label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="input w-full"
                  required
                  disabled={loading}
                >
                  <option value="">Selecione um livro</option>
                  {books
                    .filter(book => book.availableQuantity > 0 && book.status === 'available')
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} - {book.author} ({book.availableQuantity} disponíveis)
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Empréstimo
                </label>
                <input
                  type="date"
                  value={loanDate}
                  onChange={(e) => {
                    setLoanDate(e.target.value);
                    const dueDate = new Date(e.target.value);
                    dueDate.setDate(dueDate.getDate() + 15);
                    setDueDate(dueDate.toISOString().split('T')[0]);
                  }}
                  className="input w-full"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Devolução Prevista
                </label>
                <input
                  type="date"
                  value={dueDate}
                  className="input w-full"
                  disabled
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Empréstimo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Empréstimos Ativos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data do Empréstimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Devolução
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
              {activeLoans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{loan.Student.name}</div>
                    <div className="text-sm text-gray-500">{loan.Student.ra} - {loan.Student.grade}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{loan.Book.title}</div>
                    <div className="text-sm text-gray-500">{loan.Book.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(loan.loanDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' :
                      loan.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.status === 'active' ? 'Ativo' :
                       loan.status === 'overdue' ? 'Atrasado' :
                       'Devolvido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {loan.status !== 'returned' && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={loading}
                      >
                        Devolver
                      </button>
                    )}
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

export default LoanManagement; 