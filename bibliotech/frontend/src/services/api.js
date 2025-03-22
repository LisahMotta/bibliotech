import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bibliotech-kv95.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    console.log('Token configurado:', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    console.log('Token removido');
  }
};

export const authService = {
  login: async (email, senha) => {
    try {
      console.log('Tentando fazer login com:', { email });
      
      // Limpa qualquer token anterior
      setAuthToken(null);
      
      const response = await api.post('/api/auth/login', { email, senha });
      console.log('Resposta do login:', response.data);
      
      if (response.data && response.data.token) {
        // Configura o token
        setAuthToken(response.data.token);
        
        // Salva os dados do usuário
        localStorage.setItem('usuarioAtual', JSON.stringify(response.data));
        
        // Configura o token para todas as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data;
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error) {
      console.error('Erro detalhado no login:', error.response || error);
      setAuthToken(null);
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
    setAuthToken(null);
    localStorage.removeItem('usuarioAtual');
    delete api.defaults.headers.common['Authorization'];
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const usuarioAtual = localStorage.getItem('usuarioAtual');
    
    if (token && usuarioAtual) {
      try {
        const usuario = JSON.parse(usuarioAtual);
        setAuthToken(token);
        // Configura o token para todas as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Token recuperado e configurado:', token);
        return usuario;
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        setAuthToken(null);
        return null;
      }
    }
    return null;
  }
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token adicionado à requisição:', config.url);
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
    console.error('Erro na resposta:', error.response || error);
    
    if (error.response?.status === 401) {
      const isLoginRequest = error.config.url.includes('/api/auth/login');
      
      if (!isLoginRequest) {
        console.log('Erro 401 detectado. Limpando dados de autenticação.');
        setAuthToken(null);
        localStorage.removeItem('usuarioAtual');
        window.dispatchEvent(new Event('authError'));
      }
    }
    return Promise.reject(error);
  }
);

// Inicializa o token se existir no localStorage
const token = localStorage.getItem('token');
if (token) {
  console.log('Inicializando token do localStorage');
  setAuthToken(token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export { api };
export default api; 