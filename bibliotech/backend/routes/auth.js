const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware para validar dados do usuário
const validateUserData = (req, res, next) => {
  const { nome, email, senha, funcao } = req.body;

  if (!nome || !email || !senha || !funcao) {
    return res.status(400).json({ 
      message: 'Todos os campos são obrigatórios',
      fields: { nome, email, senha, funcao }
    });
  }

  if (senha.length < 6) {
    return res.status(400).json({ 
      message: 'A senha deve ter pelo menos 6 caracteres' 
    });
  }

  next();
};

// Rota para cadastro de usuário
router.post('/register', validateUserData, async (req, res) => {
  try {
    console.log('Recebendo requisição de registro:', req.body);
    const { nome, email, senha, funcao } = req.body;

    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Email já cadastrado:', email);
      return res.status(400).json({ message: 'Este email já está cadastrado' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    // Cria o novo usuário
    const user = await User.create({
      nome,
      email,
      senha: hashedSenha,
      funcao
    });

    console.log('Usuário criado com sucesso:', user._id);

    res.status(201).json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      funcao: user.funcao
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao cadastrar usuário',
      error: error.message 
    });
  }
});

// Rota para login
router.post('/login', async (req, res) => {
  try {
    console.log('Recebendo requisição de login:', req.body);
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Busca o usuário
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(400).json({ message: 'Email ou senha incorretos' });
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      console.log('Senha incorreta para o usuário:', email);
      return res.status(400).json({ message: 'Email ou senha incorretos' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, funcao: user.funcao },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );

    console.log('Login realizado com sucesso:', user._id);

    res.json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      funcao: user.funcao,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      message: 'Erro ao fazer login',
      error: error.message 
    });
  }
});

// Rota para recuperação de senha
router.post('/recuperar-senha', async (req, res) => {
  try {
    console.log('Recebendo requisição de recuperação de senha:', req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email é obrigatório' 
      });
    }

    // Busca o usuário
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Email não encontrado:', email);
      return res.status(400).json({ message: 'Email não encontrado' });
    }

    // Gera nova senha aleatória
    const novaSenha = Math.random().toString(36).slice(-8);
    
    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(novaSenha, salt);

    // Atualiza a senha do usuário
    user.senha = hashedSenha;
    await user.save();

    console.log('Senha recuperada com sucesso para:', email);

    res.json({ 
      message: 'Nova senha gerada com sucesso',
      novaSenha
    });
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    res.status(500).json({ 
      message: 'Erro ao recuperar senha',
      error: error.message 
    });
  }
});

module.exports = router; 