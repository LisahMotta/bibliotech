import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bibliotech-kv95.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const authService = {
  login: async (email, senha) => {
    try {
      console.log('Tentando fazer login com:', { email });
      const response = await api.post('/api/auth/login', { email, senha });
      console.log('Resposta do login:', response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('usuarioAtual', JSON.stringify(response.data));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return response.data;
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error) {
      console.error('Erro detalhado no login:', error.response || error);
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { message: 'Erro ao conectar com o servidor' };
      }
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
      return config;
    } catch (error) {
      console.error('Erro ao processar token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na resposta:', error.response || error);
    
    if (error.response?.status === 401) {
      const isLoginRequest = error.config.url.includes('/api/auth/login');
      
      if (!isLoginRequest) {
        localStorage.removeItem('usuarioAtual');
        delete api.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('authError'));
      }
    }
    return Promise.reject(error);
  }
);

// Inicializa o token se existir no localStorage
try {
  const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual') || '{}');
  if (usuarioAtual.token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${usuarioAtual.token}`;
  }
} catch (error) {
  console.error('Erro ao inicializar token:', error);
  localStorage.removeItem('usuarioAtual');
  delete api.defaults.headers.common['Authorization'];
}

export { api };
export default api; 