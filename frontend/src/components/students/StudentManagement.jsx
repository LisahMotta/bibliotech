import React, { useState, useRef, useEffect } from 'react';
import { studentService } from '../../services/api';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentService.getAll();
      if (response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar lista de alunos.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.search(searchTerm);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setError('Erro ao buscar alunos. Por favor, tente novamente.');
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
      console.log('Iniciando importação do arquivo:', file.name);
      const response = await studentService.importExcel(file);
      console.log('Resposta da importação:', response);

      if (response.data) {
        alert(response.data.message);
        await loadStudents(); // Recarrega a lista de alunos
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao importar alunos:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erro ao importar alunos. Verifique o formato do arquivo.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.exportExcel();
      
      // Criar um link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alunos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar alunos:', error);
      setError('Erro ao exportar alunos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Alunos</h2>
        <div className="space-x-4">
          <button className="btn btn-primary" onClick={() => console.log('Cadastrar aluno')}>
            Cadastrar Aluno
          </button>
          <label className="btn btn-secondary cursor-pointer">
            Importar Lista
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportExcel}
              disabled={loading}
            />
          </label>
          <button 
            className="btn btn-success"
            onClick={handleExportExcel}
            disabled={loading}
          >
            Exportar Lista
          </button>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Buscar por nome ou RA..."
              className="input flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Buscar
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Se o aluno não for encontrado, você pode cadastrá-lo clicando em "Cadastrar Aluno"
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Nome</th>
              <th className="px-6 py-3 border-b text-left">RA</th>
              <th className="px-6 py-3 border-b text-left">Série</th>
              <th className="px-6 py-3 border-b text-left">Email</th>
              <th className="px-6 py-3 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(searchResults.length > 0 ? searchResults : students).map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{student.name}</td>
                <td className="px-6 py-4 border-b">{student.ra}</td>
                <td className="px-6 py-4 border-b">{student.grade}</td>
                <td className="px-6 py-4 border-b">{student.email}</td>
                <td className="px-6 py-4 border-b">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
                  <button className="text-red-600 hover:text-red-800">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagement; 