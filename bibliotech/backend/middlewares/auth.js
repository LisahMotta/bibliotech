const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (!user.ativo) {
      return res.status(401).json({ message: 'Conta inativa' });
    }

    req.user = user;
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
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Não autorizado' });
  }
};

module.exports = { auth, adminAuth }; 