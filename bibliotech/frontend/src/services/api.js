import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bibliotech-kv95.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Função para gerenciar o token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token configurado:', token);
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token removido');
  }
};

// Função para criar uma nova instância do axios com o token
const createAuthenticatedApi = (token) => {
  const authenticatedApi = axios.create({
    baseURL: 'https://bibliotech-kv95.onrender.com',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  // Adiciona interceptor de resposta para esta instância
  authenticatedApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('Erro 401 detectado em requisição autenticada');
        setAuthToken(null);
        window.dispatchEvent(new Event('authError'));
      }
      return Promise.reject(error);
    }
  );

  return authenticatedApi;
};

export const authService = {
  login: async (email, senha) => {
    try {
      console.log('Tentando fazer login com:', { email });
      
      // Remove qualquer token anterior
      setAuthToken(null);
      
      const response = await api.post('/api/auth/login', { email, senha });
      console.log('Resposta do login:', response.data);
      
      if (response.data && response.data.token) {
        // Configura o token
        setAuthToken(response.data.token);
        
        // Salva os dados do usuário
        localStorage.setItem('usuarioAtual', JSON.stringify(response.data));
        
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
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const usuarioAtual = localStorage.getItem('usuarioAtual');
    
    if (token && usuarioAtual) {
      try {
        const usuario = JSON.parse(usuarioAtual);
        setAuthToken(token);
        return usuario;
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        setAuthToken(null);
        return null;
      }
    }
    return null;
  },

  // Funções auxiliares para requisições autenticadas
  getAuthenticatedApi: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token não encontrado');
    }
    return createAuthenticatedApi(token);
  },

  get: async (url) => {
    try {
      const authenticatedApi = authService.getAuthenticatedApi();
      return await authenticatedApi.get(url);
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      const authenticatedApi = authService.getAuthenticatedApi();
      return await authenticatedApi.post(url, data);
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      throw error;
    }
  }
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Requisição para:', config.url);
      console.log('Headers da requisição:', config.headers);
    } else {
      console.log('Nenhum token encontrado para a requisição:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
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
}

export { api };
export default api; 