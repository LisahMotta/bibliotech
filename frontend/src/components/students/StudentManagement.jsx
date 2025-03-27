import React, { useState, useRef } from 'react';
import { studentService } from '../../services/api';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await studentService.search(searchTerm);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setError('Erro ao buscar alunos. Por favor, tente novamente.');
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log('Iniciando importação do arquivo:', file.name);
      const response = await studentService.importExcel(file);
      console.log('Resposta da importação:', response);

      if (response.data) {
        alert(response.data.message);
        
        // Atualizar a lista de alunos
        const studentsResponse = await studentService.getAll();
        if (studentsResponse.data) {
          setStudents(studentsResponse.data);
        }
      }

      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao importar alunos:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao importar alunos. Verifique o formato do arquivo.';
      alert(errorMessage);
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
            />
          </label>
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
            />
            <button type="submit" className="btn btn-primary">
              Buscar
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Se o aluno não for encontrado, você pode cadastrá-lo clicando em "Cadastrar Aluno"
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Lista de Alunos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Série</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.ra}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button className="text-red-600 hover:text-red-900">Excluir</button>
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

export default StudentManagement; 