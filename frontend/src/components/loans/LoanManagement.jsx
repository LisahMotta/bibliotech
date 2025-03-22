import React, { useState } from 'react';

const LoanManagement = () => {
  const [loanType, setLoanType] = useState('new'); // 'new' ou 'return'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Empréstimos</h2>
        <div className="space-x-4">
          <button
            className={`btn ${loanType === 'new' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLoanType('new')}
          >
            Novo Empréstimo
          </button>
          <button
            className={`btn ${loanType === 'return' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLoanType('return')}
          >
            Devolução
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          {loanType === 'new' ? 'Cadastro de Empréstimo' : 'Registro de Devolução'}
        </h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aluno
              </label>
              <input
                type="text"
                placeholder="Buscar aluno..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Livro
              </label>
              <input
                type="text"
                placeholder="Buscar livro..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Série do Aluno
              </label>
              <input
                type="text"
                placeholder="Ex: 1º Ano A"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                className="input"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              {loanType === 'new' ? 'Registrar Empréstimo' : 'Registrar Devolução'}
            </button>
          </div>
        </form>
      </div>

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
                  Série
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data do Empréstimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Exemplo de linha - será preenchido dinamicamente */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Nome do Aluno</div>
                  <div className="text-sm text-gray-500">RA: 123456</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Título do Livro</div>
                  <div className="text-sm text-gray-500">Autor</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  1º Ano A
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  20/03/2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900">
                    Registrar Devolução
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanManagement; 