import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <header className="bg-primary-600 text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Bibliotech</h1>
            <p className="text-xl text-primary-100">Sua Biblioteca na Nuvem</p>
          </div>
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-primary-600 font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-white">{user?.name || 'Usuário'}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  showMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  {user?.email}
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 