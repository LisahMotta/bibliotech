import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const authService = {
  login: async (email, senha) => {
    try {
      const response = await api.post('/api/auth/login', { email, senha });
      if (response.data) {
        localStorage.setItem('usuarioAtual', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  register: async (userData) => {
    try {
      console.log('Enviando dados para registro:', userData);
      const response = await api.post('/api/auth/register', userData);
      console.log('Resposta do registro:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erro ao cadastrar usuário' };
    }
  },

  recuperarSenha: async (email) => {
    try {
      const response = await api.post('/api/auth/recuperar-senha', { email });
      return response.data;
    } catch (error) {
      console.error('Erro na recuperação de senha:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Erro ao recuperar senha' };
    }
  },

  logout: () => {
    localStorage.removeItem('usuarioAtual');
  }
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual') || '{}');
    if (usuarioAtual.token) {
      config.headers.Authorization = `Bearer ${usuarioAtual.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };
export default api; 