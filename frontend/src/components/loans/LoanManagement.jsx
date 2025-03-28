import React, { useState, useEffect } from 'react';
import { loanService, studentService, bookService } from '../../services/api';

const LoanManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchType, setSearchType] = useState('books'); // 'books', 'students', 'internet'
  const [internetSearchResults, setInternetSearchResults] = useState([]);
  const [selectedInternetBook, setSelectedInternetBook] = useState(null);
  
  // Estados para o modal de empréstimo
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Estados para o modal de cadastro de livro da internet
  const [showInternetBookModal, setShowInternetBookModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    year: '',
    quantity: 1,
    location: '',
    description: '',
    coverUrl: ''
  });

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
      let response;
      switch (searchType) {
        case 'books':
          response = await bookService.search(searchTerm);
          setSearchResults(response.data);
          break;
        case 'students':
          response = await studentService.search(searchTerm);
          const studentsWithLoans = response.data.map(student => ({
            ...student,
            activeLoans: activeLoans.filter(loan => loan.studentId === student.id)
          }));
          setSearchResults(studentsWithLoans);
          break;
        case 'internet':
          // Aqui você implementaria a chamada para a API de livros da internet
          // Por exemplo, usando a API do Google Books
          const googleBooksResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}`
          );
          const data = await googleBooksResponse.json();
          setInternetSearchResults(data.items || []);
          setSearchResults([]);
          break;
      }
      setShowSearchResults(true);
    } catch (err) {
      setError('Erro ao buscar. Por favor, tente novamente.');
      console.error('Erro ao buscar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoan = (book) => {
    setSelectedBook(book);
    setShowLoanModal(true);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const handleStudentSearch = (value) => {
    setStudentSearchTerm(value);
    if (!value.trim()) {
      setStudentSearchResults([]);
      return;
    }

    const searchValue = value.toLowerCase();
    const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(searchValue) ||
      student.ra.toLowerCase().includes(searchValue)
    );
    setStudentSearchResults(filteredStudents);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearchTerm(`${student.name} - ${student.ra} - ${student.grade}`);
    setStudentSearchResults([]);
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
        studentId: selectedStudent.id,
        bookId: selectedBook.id,
        loanDate,
        dueDate
      });
      alert('Empréstimo registrado com sucesso!');
      setShowLoanModal(false);
      resetLoanForm();
      loadData();
    } catch (err) {
      setError('Erro ao registrar empréstimo. Por favor, tente novamente.');
      console.error('Erro ao registrar empréstimo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInternetBook = (book) => {
    setSelectedInternetBook(book);
    setNewBook({
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : '',
      isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
      publisher: book.volumeInfo.publisher || '',
      year: book.volumeInfo.publishedDate?.split('-')[0] || '',
      quantity: 1,
      location: '',
      description: book.volumeInfo.description || '',
      coverUrl: book.volumeInfo.imageLinks?.thumbnail || ''
    });
    setShowInternetBookModal(true);
  };

  const handleSaveInternetBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await bookService.create(newBook);
      alert('Livro cadastrado com sucesso!');
      setShowInternetBookModal(false);
      setSelectedInternetBook(null);
      loadData();
    } catch (err) {
      setError('Erro ao cadastrar livro. Por favor, tente novamente.');
      console.error('Erro ao cadastrar livro:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetLoanForm = () => {
    setSelectedBook(null);
    setSelectedStudent(null);
    setStudentSearchTerm('');
    setLoanDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
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

      <div className="card">
        <div className="mb-4 flex space-x-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="input w-48"
          >
            <option value="books">Livros Cadastrados</option>
            <option value="students">Alunos Cadastrados</option>
            <option value="internet">Buscar na Internet</option>
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={
              searchType === 'books' ? 'Buscar livro por título, autor ou ISBN...' :
              searchType === 'students' ? 'Buscar aluno por nome ou RA...' :
              'Buscar livro na internet...'
            }
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
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-gray-50 border-b last:border-b-0"
              >
                {searchType === 'books' ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-600">
                        {item.author} - Disponíveis: {item.availableQuantity}
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickLoan(item)}
                      className="btn btn-primary btn-sm"
                      disabled={loading}
                    >
                      Emprestar
                    </button>
                  </div>
                ) : searchType === 'students' ? (
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.ra} - {item.grade}
                    </div>
                    {item.activeLoans.length > 0 && (
                      <div className="mt-2 text-sm">
                        <div className="font-medium text-gray-700">Livros Emprestados:</div>
                        {item.activeLoans.map(loan => (
                          <div key={loan.id} className="text-gray-600">
                            {loan.Book.title} - Devolver até: {new Date(loan.dueDate).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {searchType === 'internet' && internetSearchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
            {internetSearchResults.map((book) => (
              <div
                key={book.id}
                className="p-3 hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="flex items-start space-x-4">
                  {book.volumeInfo.imageLinks?.thumbnail && (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{book.volumeInfo.title}</div>
                    <div className="text-sm text-gray-600">
                      {book.volumeInfo.authors?.join(', ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {book.volumeInfo.publisher} - {book.volumeInfo.publishedDate}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectInternetBook(book)}
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                  >
                    Cadastrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Empréstimo */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Empréstimo</h3>
              <button
                onClick={() => {
                  setShowLoanModal(false);
                  resetLoanForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Livro Selecionado
                </label>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{selectedBook?.title}</div>
                  <div className="text-sm text-gray-600">
                    {selectedBook?.author} - Disponíveis: {selectedBook?.availableQuantity}
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar Aluno
                </label>
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  placeholder="Digite o nome ou RA do aluno..."
                  className="input w-full"
                  required
                />
                {studentSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-40 overflow-y-auto">
                    {studentSearchResults.map((student) => (
                      <div
                        key={student.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.ra} - {student.grade}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Empréstimo
                  </label>
                  <input
                    type="date"
                    value={loanDate}
                    onChange={(e) => {
                      setLoanDate(e.target.value);
                      const newDueDate = new Date(e.target.value);
                      newDueDate.setDate(newDueDate.getDate() + 15);
                      setDueDate(newDueDate.toISOString().split('T')[0]);
                    }}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Devolução
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input w-full"
                    required
                    min={loanDate}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoanModal(false);
                    resetLoanForm();
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !selectedStudent}
                >
                  {loading ? 'Registrando...' : 'Fazer Empréstimo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Livro da Internet */}
      {showInternetBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cadastrar Livro</h3>
              <button
                onClick={() => {
                  setShowInternetBookModal(false);
                  setSelectedInternetBook(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInternetBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Editora
                  </label>
                  <input
                    type="text"
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="text"
                    value={newBook.year}
                    onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({ ...newBook, quantity: parseInt(e.target.value) })}
                    className="input w-full"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={newBook.location}
                    onChange={(e) => setNewBook({ ...newBook, location: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="input w-full"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInternetBookModal(false);
                    setSelectedInternetBook(null);
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Livro'}
                </button>
              </div>
            </form>
          </div>
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