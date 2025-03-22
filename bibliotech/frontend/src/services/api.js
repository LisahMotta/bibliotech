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
      if (response.data && response.data.token) {
        localStorage.setItem('usuarioAtual', JSON.stringify(response.data));
        // Configura o token após o login bem-sucedido
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    try {
      const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual') || '{}');
      if (usuarioAtual.token) {
        config.headers.Authorization = `Bearer ${usuarioAtual.token}`;
      }
    } catch (error) {
      console.error('Erro ao processar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Verifica se a requisição é para a rota de login
      const isLoginRequest = error.config.url.includes('/api/auth/login');
      
      // Se não for uma requisição de login e houver um token, limpa o token
      if (!isLoginRequest) {
        const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual') || '{}');
        if (usuarioAtual.token) {
          localStorage.removeItem('usuarioAtual');
          delete api.defaults.headers.common['Authorization'];
          // Dispara um evento customizado para notificar o App.jsx
          window.dispatchEvent(new Event('authError'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Inicializa o token se existir no localStorage
const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual') || '{}');
if (usuarioAtual.token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${usuarioAtual.token}`;
}

export { api };
export default api; 