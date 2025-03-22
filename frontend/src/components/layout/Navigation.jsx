import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-4">
            <Link to="/books" className="btn btn-primary">
              Livros
            </Link>
            <Link to="/students" className="btn btn-primary">
              Alunos
            </Link>
            <Link to="/loans" className="btn btn-primary">
              Empréstimos
            </Link>
            <Link to="/reports" className="btn btn-primary">
              Relatórios
            </Link>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Pesquisar..."
              className="input w-64"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 