import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Reports = () => {
  // Dados de exemplo para os gráficos
  const barData = [
    { name: '1º Ano', empréstimos: 45 },
    { name: '2º Ano', empréstimos: 38 },
    { name: '3º Ano', empréstimos: 52 },
    { name: '4º Ano', empréstimos: 41 },
  ];

  const lineData = [
    { name: 'Jan', empréstimos: 120 },
    { name: 'Fev', empréstimos: 150 },
    { name: 'Mar', empréstimos: 180 },
    { name: 'Abr', empréstimos: 160 },
    { name: 'Mai', empréstimos: 200 },
    { name: 'Jun', empréstimos: 190 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Relatórios e Estatísticas</h2>
        <div className="space-x-4">
          <button className="btn btn-primary">
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Livros Emprestados Hoje</h3>
          <p className="text-3xl font-bold text-primary-600">12</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Empréstimos na Semana</h3>
          <p className="text-3xl font-bold text-primary-600">45</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Empréstimos no Mês</h3>
          <p className="text-3xl font-bold text-primary-600">180</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Empréstimos no Ano</h3>
          <p className="text-3xl font-bold text-primary-600">1,250</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Livros Mais Emprestados por Série</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="empréstimos" fill="#0284c7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Empréstimos por Mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="empréstimos" stroke="#0284c7" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top 10 Livros Mais Emprestados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade de Empréstimos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Exemplo de linha - será preenchido dinamicamente */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  1
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Título do Livro</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Nome do Autor
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  150
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports; 