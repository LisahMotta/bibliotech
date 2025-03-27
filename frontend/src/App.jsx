import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Navigation from './components/layout/Navigation';
import BookManagement from './components/books/BookManagement';
import StudentManagement from './components/students/StudentManagement';
import LoanManagement from './components/loans/LoanManagement';
import Reports from './components/reports/Reports';
import Login from './components/auth/Login';
import './App.css';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const handleFileUploadAluno = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Arquivo selecionado:', file);
      try {
        console.log('Iniciando upload do arquivo...');
        const response = await studentService.importExcel(file);
        console.log('Resposta do servidor:', response);
        
        if (response.data) {
          alert(`${response.data.message}`);
          
          // Atualizar a lista de alunos
          console.log('Atualizando lista de alunos...');
          const alunosResponse = await studentService.getAll();
          console.log('Lista de alunos atualizada:', alunosResponse);
          
          if (alunosResponse.data) {
            setAlunos(alunosResponse.data);
          }
        }
        
        if (fileInputAlunoRef.current) {
          fileInputAlunoRef.current.value = '';
        }
      } catch (error) {
        console.error('Erro detalhado ao processar arquivo:', error);
        if (error.response?.status === 401) {
          setMensagemErro('Sua sessão expirou. Por favor, faça login novamente.');
          authService.logout();
          setUsuarioAtual(null);
          setMostrarLogin(true);
        } else {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao processar o arquivo. Certifique-se de que é um arquivo Excel válido com as colunas: nome, RA e série.';
          alert(errorMessage);
        }
      }
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Navigation />
                    <main className="flex-grow container mx-auto px-4 py-8">
                      <div>Página Inicial</div>
                    </main>
                    <Footer />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/books"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Navigation />
                    <main className="flex-grow container mx-auto px-4 py-8">
                      <BookManagement />
                    </main>
                    <Footer />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Navigation />
                    <main className="flex-grow container mx-auto px-4 py-8">
                      <StudentManagement />
                    </main>
                    <Footer />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Navigation />
                    <main className="flex-grow container mx-auto px-4 py-8">
                      <LoanManagement />
                    </main>
                    <Footer />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Navigation />
                    <main className="flex-grow container mx-auto px-4 py-8">
                      <Reports />
                    </main>
                    <Footer />
                  </>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
