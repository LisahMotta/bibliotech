const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    console.log('Verificando token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    console.log('Token decodificado:', decoded);

    const user = await User.findById(decoded.id);
    console.log('Usuário encontrado:', user);

    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (!user.ativo) {
      console.log('Conta inativa');
      return res.status(401).json({ message: 'Conta inativa' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.funcao !== 'admin') {
        console.log('Acesso negado: não é admin');
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
      }
      next();
    });
  } catch (error) {
    console.error('Erro na autenticação de admin:', error);
    res.status(401).json({ message: 'Não autorizado' });
  }
};

module.exports = { auth, adminAuth }; 