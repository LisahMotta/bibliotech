const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const multer = require("multer");
const csv = require("csv-parse");
const fs = require("fs");
const xlsx = require('xlsx');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Middleware de autenticação
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, 'sua-chave-secreta');
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: 'Token inválido' });
  }
};

mongoose.connect("mongodb://localhost:27017/bibliotech", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 📚 Esquema do Livro
const LivroSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  isbn: String,
  editora: String,
  edicao: String,
  genero: String,
  tombo: String
});

const Livro = mongoose.model("Livro", LivroSchema);

// 📚 Cadastrar um novo livro
app.post("/cadastrar-livro", async (req, res) => {
  try {
    const novoLivro = new Livro(req.body);
    await novoLivro.save();
    res.status(201).json({ message: "📖 Livro cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "❌ Erro ao cadastrar livro" });
  }
});

// 🔍 Rota para buscar um livro pelo nome ou número de tombo
app.get("/buscar-livro-tombo", async (req, res) => {
  try {
    const { termo } = req.query;

    // Buscar no banco de dados por nome ou tombo
    const livro = await Livro.findOne({
      $or: [
        { titulo: new RegExp(termo, "i") }, // Busca pelo nome do livro (insensível a maiúsculas)
        { tombo: termo } // Busca pelo número de tombo
      ]
    });

    if (livro) {
      return res.json({ encontrado: true, origem: "banco", resultado: livro });
    } else {
      return res.json({ encontrado: false, mensagem: "📚 Nenhum livro encontrado." });
    }
  } catch (error) {
    return res.status(500).json({ erro: "❌ Erro ao buscar o livro no banco de dados." });
  }
});

// 👩‍🎓 Esquema do Aluno
const AlunoSchema = new mongoose.Schema({
  nome: String,
  numeroRegistro: String,
  serie: String,
});

const Aluno = mongoose.model("Aluno", AlunoSchema);

// 🔍 Rota de busca para Livros e Alunos
app.get("/buscar", async (req, res) => {
  const { termo } = req.query;

  try {
    // Buscar livro no banco
    const livroLocal = await Livro.findOne({ titulo: new RegExp(termo, "i") });
    
    if (livroLocal) {
      // Buscar empréstimo mais recente do livro
      const emprestimo = await Emprestimo.findOne({ 
        nomeLivro: livroLocal.titulo,
        tomboLivro: livroLocal.tombo 
      }).sort({ dataEmprestimo: -1 });

      // Buscar devolução correspondente
      let devolucao = null;
      if (emprestimo) {
        devolucao = await Devolucao.findOne({ 
          livroDevolvido: livroLocal.titulo 
        }).sort({ dataDevolucao: -1 });
      }

      return res.json({ 
        tipo: "livro", 
        encontrado: true, 
        origem: "banco", 
        resultado: {
          ...livroLocal.toObject(),
          emprestimo: emprestimo ? {
            dataEmprestimo: emprestimo.dataEmprestimo,
            nomeAluno: emprestimo.nomeAluno,
            serieAluno: emprestimo.serieAluno,
            raAluno: emprestimo.raAluno
          } : null,
          devolucao: devolucao ? {
            dataDevolucao: devolucao.dataDevolucao,
            nomeAluno: devolucao.nomeAluno
          } : null
        }
      });
    }

    // Buscar aluno no banco por nome, número de registro ou série
    const alunoLocal = await Aluno.findOne({
      $or: [
        { nome: new RegExp(termo, "i") },
        { numeroRegistro: new RegExp(termo, "i") },
        { serie: new RegExp(termo, "i") }
      ]
    });

    if (alunoLocal) {
      // Buscar empréstimos do aluno
      const emprestimosAluno = await Emprestimo.find({
        nomeAluno: alunoLocal.nome,
        raAluno: alunoLocal.numeroRegistro
      }).sort({ dataEmprestimo: -1 });

      // Buscar devoluções do aluno
      const devolucoesAluno = await Devolucao.find({
        nomeAluno: alunoLocal.nome
      }).sort({ dataDevolucao: -1 });

      return res.json({ 
        tipo: "aluno", 
        encontrado: true, 
        origem: "banco", 
        resultado: {
          ...alunoLocal.toObject(),
          emprestimos: emprestimosAluno,
          devolucoes: devolucoesAluno
        }
      });
    }

    // Buscar na internet se não encontrar localmente
    const resposta = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${termo}`);
    const livrosInternet = resposta.data.items?.map((item) => ({
      titulo: item.volumeInfo.title,
      autor: item.volumeInfo.authors?.join(", ") || "Desconhecido",
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || "N/A",
    })) || [];

    return res.json({ encontrado: false, origem: "internet", livros: livrosInternet });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao realizar a busca" });
  }
});

// 👩‍🎓 Cadastrar um novo aluno
app.post("/cadastrar-aluno", async (req, res) => {
  const { nome, numeroRegistro, serie } = req.body;
  const novoAluno = new Aluno({ nome, numeroRegistro, serie });
  await novoAluno.save();
  res.json({ mensagem: "🧑‍🎓 Aluno cadastrado com sucesso!" });
});

// 👨‍🎓 Listar todos os alunos
app.get("/alunos/listar", verificarToken, async (req, res) => {
  try {
    const alunos = await Aluno.find().sort({ nome: 1 });
    res.json(alunos);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    res.status(500).json({ erro: "Erro ao listar alunos" });
  }
});

const EmprestimoSchema = new mongoose.Schema({
  nomeAluno: String,
  nomeLivro: String,
  dataEmprestimo: String,
  tomboLivro: String,
  serieAluno: String,
  raAluno: String
});
const Emprestimo = mongoose.model("Emprestimo", EmprestimoSchema);

// 📖 Rota para realizar empréstimo
app.post("/emprestar-livro", async (req, res) => {
  try {
    const novoEmprestimo = new Emprestimo(req.body);
    await novoEmprestimo.save();
    res.status(201).json({ message: "📚 Empréstimo registrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "❌ Erro ao registrar o empréstimo." });
  }
});
const DevolucaoSchema = new mongoose.Schema({
  nomeAluno: String,
  livroDevolvido: String,
  dataDevolucao: String
});
const Devolucao = mongoose.model("Devolucao", DevolucaoSchema);

// 📖 Rota para registrar devolução
app.post("/devolver-livro", async (req, res) => {
  try {
    const novaDevolucao = new Devolucao(req.body);
    await novaDevolucao.save();
    res.status(201).json({ message: "📚 Devolução registrada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "❌ Erro ao registrar a devolução." });
  }
});

// 📊 Rota para gerar relatório de leitura
app.get("/relatorio-leitura", async (req, res) => {
  try {
    // Data atual
    const hoje = new Date();
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);

    // Buscar empréstimos da semana
    const emprestimosSemana = await Emprestimo.find({
      dataEmprestimo: { $gte: inicioSemana.toISOString() }
    });

    // Buscar empréstimos do mês
    const emprestimosMes = await Emprestimo.find({
      dataEmprestimo: { $gte: inicioMes.toISOString() }
    });

    // Buscar empréstimos do ano
    const emprestimosAno = await Emprestimo.find({
      dataEmprestimo: { $gte: inicioAno.toISOString() }
    });

    // Buscar série com mais leituras
    const emprestimosPorSerie = await Emprestimo.aggregate([
      { $group: { _id: "$serieAluno", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Buscar livro mais emprestado
    const livroMaisEmprestado = await Emprestimo.aggregate([
      { $group: { _id: "$nomeLivro", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    res.json({
      livrosSemana: emprestimosSemana.length,
      livrosMes: emprestimosMes.length,
      livrosAno: emprestimosAno.length,
      serieMaisLeituras: emprestimosPorSerie[0]?._id || "Nenhuma",
      livroMaisEmprestado: livroMaisEmprestado[0]?._id || "Nenhum"
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: "❌ Erro ao gerar relatório de leitura" });
  }
});

// Modelo de Usuário
const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  funcao: String,
  codigoRecuperacao: String,
  codigoExpiracao: Date
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// Rotas de autenticação
app.post("/cadastrar-usuario", async (req, res) => {
  try {
    const { nome, email, senha, funcao } = req.body;
    
    // Verificar se o email já existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar novo usuário
    const usuario = new Usuario({
      nome,
      email,
      senha: senhaCriptografada,
      funcao
    });

    await usuario.save();
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email, funcao: usuario.funcao },
      'sua-chave-secreta',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao
      }
    });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
});

app.get("/verificar-token", verificarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

app.post("/recuperar-senha", async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Gerar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracao = new Date(Date.now() + 30 * 60000); // 30 minutos

    // Salvar código
    usuario.codigoRecuperacao = codigo;
    usuario.codigoExpiracao = expiracao;
    await usuario.save();

    // Enviar email
    const mailOptions = {
      from: 'seu-email@gmail.com',
      to: email,
      subject: 'Recuperação de Senha - BiblioTech',
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Seu código de recuperação é: <strong>${codigo}</strong></p>
        <p>Este código expira em 30 minutos.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ mensagem: 'Código de recuperação enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao enviar código de recuperação' });
  }
});

// Rota para listar todos os livros
app.get('/listar-livros', verificarToken, async (req, res) => {
  try {
    const livros = await Livro.find().sort({ titulo: 1 });
    res.json(livros);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    res.status(500).json({ mensagem: 'Erro ao listar livros' });
  }
});

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    // Criar diretório de uploads se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Garantir que o nome do arquivo seja único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceitar arquivos CSV e Excel
    if (file.mimetype === 'text/csv' || 
        file.originalname.toLowerCase().endsWith('.csv') ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV e Excel são permitidos!'));
    }
  }
});

// Rota para importar alunos via CSV
app.post("/importar-alunos", verificarToken, upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    console.log("Arquivo recebido:", req.file.originalname);
    console.log("Caminho do arquivo:", req.file.path);
    console.log("Tipo do arquivo:", req.file.mimetype);

    const alunos = [];
    const parser = fs.createReadStream(req.file.path)
      .pipe(csv.parse({ 
        columns: true, 
        skip_empty_lines: true,
        delimiter: ';',
        trim: true,
        relax_quotes: true,
        relax_column_count: true
      }));

    for await (const row of parser) {
      console.log("Processando linha:", row);
      
      // Verifica se os campos necessários existem
      if (!row.nome || !row.numeroRegistro || !row.serie) {
        console.error("Linha inválida:", row);
        continue;
      }

      // Limpa os dados antes de adicionar
      const aluno = {
        nome: row.nome.trim(),
        numeroRegistro: row.numeroRegistro.trim(),
        serie: row.serie.trim()
      };

      // Validação adicional
      if (aluno.nome && aluno.numeroRegistro && aluno.serie) {
        alunos.push(aluno);
      }
    }

    console.log("Total de alunos processados:", alunos.length);

    if (alunos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: "Nenhum aluno válido encontrado no arquivo" });
    }

    // Verificar alunos existentes
    const numerosRegistro = alunos.map(a => a.numeroRegistro);
    const alunosExistentes = await Aluno.find({ numeroRegistro: { $in: numerosRegistro } });
    
    // Filtrar alunos que não existem no sistema
    const alunosNovos = alunos.filter(aluno => 
      !alunosExistentes.some(existente => existente.numeroRegistro === aluno.numeroRegistro)
    );

    if (alunosNovos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        erro: "Todos os alunos já existem no sistema",
        detalhes: "Nenhum novo aluno para importar"
      });
    }

    // Inserir apenas os alunos novos
    await Aluno.insertMany(alunosNovos);
    
    // Remove o arquivo após processamento
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      mensagem: `${alunosNovos.length} alunos importados com sucesso! (${alunos.length - alunosNovos.length} alunos ignorados por já existirem)`,
      alunos: alunosNovos,
      ignorados: alunos.length - alunosNovos.length
    });

  } catch (erro) {
    console.error("Erro ao importar alunos:", erro);
    
    // Remove o arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      erro: "Erro ao importar alunos",
      detalhes: erro.message,
      stack: process.env.NODE_ENV === 'development' ? erro.stack : undefined
    });
  }
});

// Rota para importar alunos via Excel
app.post("/importar-alunos-excel", verificarToken, upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    console.log("Arquivo recebido:", req.file.originalname);
    console.log("Caminho do arquivo:", req.file.path);
    console.log("Tipo do arquivo:", req.file.mimetype);

    // Ler o arquivo Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log("Dados do Excel:", data);

    // Processar os dados
    const alunos = data.map(row => ({
      nome: row.nome?.toString().trim() || '',
      numeroRegistro: row.numeroRegistro?.toString().trim() || '',
      serie: row.serie?.toString().trim() || ''
    })).filter(aluno => 
      aluno.nome && 
      aluno.numeroRegistro && 
      aluno.serie
    );

    console.log("Total de alunos processados:", alunos.length);

    if (alunos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: "Nenhum aluno válido encontrado no arquivo" });
    }

    // Verificar alunos existentes
    const numerosRegistro = alunos.map(a => a.numeroRegistro);
    const alunosExistentes = await Aluno.find({ numeroRegistro: { $in: numerosRegistro } });
    
    // Filtrar alunos que não existem no sistema
    const alunosNovos = alunos.filter(aluno => 
      !alunosExistentes.some(existente => existente.numeroRegistro === aluno.numeroRegistro)
    );

    if (alunosNovos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        erro: "Todos os alunos já existem no sistema",
        detalhes: "Nenhum novo aluno para importar"
      });
    }

    // Inserir apenas os alunos novos
    await Aluno.insertMany(alunosNovos);
    
    // Remove o arquivo após processamento
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      mensagem: `${alunosNovos.length} alunos importados com sucesso! (${alunos.length - alunosNovos.length} alunos ignorados por já existirem)`,
      alunos: alunosNovos,
      ignorados: alunos.length - alunosNovos.length
    });

  } catch (erro) {
    console.error("Erro ao importar alunos:", erro);
    
    // Remove o arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      erro: "Erro ao importar alunos",
      detalhes: erro.message,
      stack: process.env.NODE_ENV === 'development' ? erro.stack : undefined
    });
  }
});

// Rota para importar livros via CSV
app.post("/importar-livros", verificarToken, upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    console.log("Arquivo recebido:", req.file.originalname);
    console.log("Caminho do arquivo:", req.file.path);
    console.log("Tipo do arquivo:", req.file.mimetype);

    const livros = [];
    const parser = fs.createReadStream(req.file.path)
      .pipe(csv.parse({ 
        columns: true, 
        skip_empty_lines: true,
        delimiter: ';',
        trim: true,
        relax_quotes: true,
        relax_column_count: true
      }));

    for await (const row of parser) {
      console.log("Processando linha:", row);
      
      // Verifica se os campos necessários existem
      if (!row.titulo || !row.tombo) {
        console.error("Linha inválida:", row);
        continue;
      }

      // Limpa os dados antes de adicionar
      const livro = {
        titulo: row.titulo.trim(),
        autor: row.autor?.trim() || '',
        isbn: row.isbn?.trim() || '',
        editora: row.editora?.trim() || '',
        edicao: row.edicao?.trim() || '',
        genero: row.genero?.trim() || '',
        tombo: row.tombo.trim()
      };

      // Validação adicional
      if (livro.titulo && livro.tombo) {
        livros.push(livro);
      }
    }

    console.log("Total de livros processados:", livros.length);

    if (livros.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: "Nenhum livro válido encontrado no arquivo" });
    }

    // Verificar livros existentes
    const tombos = livros.map(l => l.tombo);
    const livrosExistentes = await Livro.find({ tombo: { $in: tombos } });
    
    // Filtrar livros que não existem no sistema
    const livrosNovos = livros.filter(livro => 
      !livrosExistentes.some(existente => existente.tombo === livro.tombo)
    );

    if (livrosNovos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        erro: "Todos os livros já existem no sistema",
        detalhes: "Nenhum novo livro para importar"
      });
    }

    // Inserir apenas os livros novos
    await Livro.insertMany(livrosNovos);
    
    // Remove o arquivo após processamento
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      mensagem: `${livrosNovos.length} livros importados com sucesso! (${livros.length - livrosNovos.length} livros ignorados por já existirem)`,
      livros: livrosNovos,
      ignorados: livros.length - livrosNovos.length
    });

  } catch (erro) {
    console.error("Erro ao importar livros:", erro);
    
    // Remove o arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      erro: "Erro ao importar livros",
      detalhes: erro.message,
      stack: process.env.NODE_ENV === 'development' ? erro.stack : undefined
    });
  }
});

// Rota para importar livros via Excel
app.post("/importar-livros-excel", verificarToken, upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    console.log("Arquivo recebido:", req.file.originalname);
    console.log("Caminho do arquivo:", req.file.path);
    console.log("Tipo do arquivo:", req.file.mimetype);

    // Ler o arquivo Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log("Dados do Excel:", data);

    // Processar os dados
    const livros = data.map(row => ({
      titulo: row.titulo?.toString().trim() || '',
      autor: row.autor?.toString().trim() || '',
      isbn: row.isbn?.toString().trim() || '',
      editora: row.editora?.toString().trim() || '',
      edicao: row.edicao?.toString().trim() || '',
      genero: row.genero?.toString().trim() || '',
      tombo: row.tombo?.toString().trim() || ''
    })).filter(livro => 
      livro.titulo && 
      livro.tombo
    );

    console.log("Total de livros processados:", livros.length);

    if (livros.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ erro: "Nenhum livro válido encontrado no arquivo" });
    }

    // Verificar livros existentes
    const tombos = livros.map(l => l.tombo);
    const livrosExistentes = await Livro.find({ tombo: { $in: tombos } });
    
    // Filtrar livros que não existem no sistema
    const livrosNovos = livros.filter(livro => 
      !livrosExistentes.some(existente => existente.tombo === livro.tombo)
    );

    if (livrosNovos.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        erro: "Todos os livros já existem no sistema",
        detalhes: "Nenhum novo livro para importar"
      });
    }

    // Inserir apenas os livros novos
    await Livro.insertMany(livrosNovos);
    
    // Remove o arquivo após processamento
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      mensagem: `${livrosNovos.length} livros importados com sucesso! (${livros.length - livrosNovos.length} livros ignorados por já existirem)`,
      livros: livrosNovos,
      ignorados: livros.length - livrosNovos.length
    });

  } catch (erro) {
    console.error("Erro ao importar livros:", erro);
    
    // Remove o arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      erro: "Erro ao importar livros",
      detalhes: erro.message,
      stack: process.env.NODE_ENV === 'development' ? erro.stack : undefined
    });
  }
});

// Rota para limpar cadastros vazios
app.post("/limpar-cadastros", verificarToken, async (req, res) => {
  console.log("🔍 Rota /limpar-cadastros acessada");
  try {
    // Deletar alunos vazios
    const resultadoAlunos = await Aluno.deleteMany({
      $or: [
        { nome: { $in: [null, "", undefined] } },
        { numeroRegistro: { $in: [null, "", undefined] } },
        { serie: { $in: [null, "", undefined] } }
      ]
    });
    console.log("✅ Alunos vazios deletados:", resultadoAlunos.deletedCount);

    // Deletar livros vazios
    const resultadoLivros = await Livro.deleteMany({
      $or: [
        { titulo: { $in: [null, "", undefined] } },
        { tombo: { $in: [null, "", undefined] } }
      ]
    });
    console.log("✅ Livros vazios deletados:", resultadoLivros.deletedCount);

    // Deletar empréstimos vazios
    const resultadoEmprestimos = await Emprestimo.deleteMany({
      $or: [
        { nomeAluno: { $in: [null, "", undefined] } },
        { nomeLivro: { $in: [null, "", undefined] } },
        { tomboLivro: { $in: [null, "", undefined] } }
      ]
    });
    console.log("✅ Empréstimos vazios deletados:", resultadoEmprestimos.deletedCount);

    // Deletar devoluções vazias
    const resultadoDevolucoes = await Devolucao.deleteMany({
      $or: [
        { nomeAluno: { $in: [null, "", undefined] } },
        { livroDevolvido: { $in: [null, "", undefined] } }
      ]
    });
    console.log("✅ Devoluções vazias deletadas:", resultadoDevolucoes.deletedCount);

    res.json({
      mensagem: "Limpeza concluída com sucesso!",
      detalhes: {
        alunos: resultadoAlunos.deletedCount,
        livros: resultadoLivros.deletedCount,
        emprestimos: resultadoEmprestimos.deletedCount,
        devolucoes: resultadoDevolucoes.deletedCount
      }
    });
  } catch (erro) {
    console.error("❌ Erro ao limpar cadastros:", erro);
    res.status(500).json({ 
      erro: "Erro ao limpar cadastros",
      detalhes: erro.message
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
