import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bibliotech-kv95.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const getToken = () => {
  return localStorage.getItem('token');
};

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
        
        // Verifica se o token foi configurado corretamente
        const tokenConfigurado = localStorage.getItem('token');
        console.log('Token configurado no localStorage:', tokenConfigurado);
        
        if (!tokenConfigurado) {
          throw new Error('Erro ao configurar o token');
        }
        
        return response.data;
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error) {
      console.error('Erro detalhado no login:', error.response || error);
      setAuthToken(null);
      localStorage.removeItem('usuarioAtual');
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  register: async (userData) => {
    try {
      console.log('Enviando dados para registro:', userData);
      
      // Validação dos campos obrigatórios
      if (!userData.nome || !userData.email || !userData.senha || !userData.funcao) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Validação do formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Email inválido');
      }

      // Validação da senha
      if (userData.senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      const response = await api.post('/api/auth/register', userData);
      console.log('Resposta do registro:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw error.response.data;
      }
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
    const token = getToken();
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

  get: async (url) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      console.log('Fazendo requisição GET para:', url);
      console.log('Token atual:', token);

      // Configura o token no header da requisição
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await api.get(url, config);
      return response;
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      if (error.response?.status === 401) {
        setAuthToken(null);
        localStorage.removeItem('usuarioAtual');
        window.dispatchEvent(new Event('authError'));
      }
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      console.log('Fazendo requisição POST para:', url);

      // Configura o token no header da requisição
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await api.post(url, data, config);
      return response;
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      if (error.response?.status === 401) {
        setAuthToken(null);
        window.dispatchEvent(new Event('authError'));
      }
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