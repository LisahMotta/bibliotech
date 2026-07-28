import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/layout/Dashboard';
import BookManagement from './components/books/BookManagement';
import StudentManagement from './components/students/StudentManagement';
import LoanManagement from './components/loans/LoanManagement';
import Reports from './components/reports/Reports';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/books" element={<PrivateRoute><BookManagement /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><StudentManagement /></PrivateRoute>} />
          <Route path="/loans" element={<PrivateRoute><LoanManagement /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
