import React, { useState } from 'react';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Implementar busca de alunos
    console.log('Buscando por:', searchTerm);
  };

  const handleImportExcel = () => {
    // Implementar importação de Excel
    console.log('Importando lista de alunos...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Alunos</h2>
        <div className="space-x-4">
          <button className="btn btn-primary" onClick={() => console.log('Cadastrar aluno')}>
            Cadastrar Aluno
          </button>
          <button className="btn btn-secondary" onClick={handleImportExcel}>
            Importar Lista
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Ficha de Cadastro</h3>
          <p className="text-gray-600">
            Cadastre novos alunos com informações detalhadas
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Lista de Alunos</h3>
          <p className="text-gray-600">
            Visualize e gerencie todos os alunos cadastrados
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Importação em Lote</h3>
          <p className="text-gray-600">
            Importe uma lista de alunos através de arquivo Excel
          </p>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Resultados da Busca</h3>
          <div className="space-y-4">
            {searchResults.map((student) => (
              <div key={student.id} className="border-b pb-4">
                <h4 className="font-medium">{student.name}</h4>
                <p className="text-gray-600">RA: {student.ra}</p>
                <p className="text-sm text-gray-500">Série: {student.grade}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 