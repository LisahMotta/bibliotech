import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://bibliotech-kv95.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviços de Livros
export const bookService = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  search: (query) => api.get(`/books/search?q=${query}`),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/books/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Serviços de Alunos
export const studentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  search: (query) => api.get(`/students/search?q=${query}`),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  exportExcel: () => {
    return api.get('/students/export', {
      responseType: 'blob',
    });
  },
};

// Serviços de Empréstimos
export const loanService = {
  getAll: () => api.get('/loans'),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  return: (id) => api.post(`/loans/${id}/return`),
  getActive: () => api.get('/loans/active'),
  getByStudent: (studentId) => api.get(`/loans/student/${studentId}`),
  getByBook: (bookId) => api.get(`/loans/book/${bookId}`),
};

// Serviços de Relatórios
export const reportService = {
  getDailyStats: () => api.get('/reports/daily'),
  getWeeklyStats: () => api.get('/reports/weekly'),
  getMonthlyStats: () => api.get('/reports/monthly'),
  getYearlyStats: () => api.get('/reports/yearly'),
  getTopBooks: () => api.get('/reports/top-books'),
  getLoansByGrade: () => api.get('/reports/loans-by-grade'),
  exportReport: (type) => api.get(`/reports/export/${type}`, {
    responseType: 'blob',
  }),
};

// Serviços de Autenticação
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default api; 