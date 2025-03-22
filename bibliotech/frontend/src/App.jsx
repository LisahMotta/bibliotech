import React, { useState, useRef, useEffect } from "react";
import "./App.css"; // Importando os estilos
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { authService } from './services/api';
import api from './services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PRAZO_EMPRESTIMO_DIAS = 14; // Prazo padrão de 14 dias para devolução

const App = () => {
  const [livros, setLivros] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [novoLivro, setNovoLivro] = useState({
    nome: '',
    autor: '',
    isbn: '',
    edicao: '',
    genero: '',
    numeroTombo: ''
  });
  const [novoAluno, setNovoAluno] = useState({
    nome: '',
    ra: '',
    serie: ''
  });
  const [novoEmprestimo, setNovoEmprestimo] = useState({
    alunoNome: '',
    alunoRA: '',
    alunoSerie: '',
    livroNome: '',
    dataEmprestimo: new Date().toISOString().split('T')[0],
    dataDevolucaoPrevista: new Date(Date.now() + (PRAZO_EMPRESTIMO_DIAS * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    dataDevolucao: '',
    status: 'emprestado'
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarLivros, setMostrarLivros] = useState(false);
  const [mostrarFormularioAluno, setMostrarFormularioAluno] = useState(false);
  const [mostrarAlunos, setMostrarAlunos] = useState(false);
  const [mostrarEmprestimos, setMostrarEmprestimos] = useState(false);
  const [pesquisaEmprestimo, setPesquisaEmprestimo] = useState('');
  const [filtroEmprestimo, setFiltroEmprestimo] = useState('aluno'); // 'aluno' ou 'livro'
  const fileInputRef = useRef(null);
  const fileInputAlunoRef = useRef(null);
  const [reservas, setReservas] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [pesquisaHistorico, setPesquisaHistorico] = useState('');
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [fichaEmprestimo, setFichaEmprestimo] = useState({
    alunoNome: '',
    alunoRA: '',
    alunoSerie: '',
    emprestimos: Array(20).fill().map(() => ({
      livro: '',
      dataEmprestimo: '',
      dataDevolucao: ''
    }))
  });
  const [serieSelecionada, setSerieSelecionada] = useState('');
  const [alunosFiltrados, setAlunosFiltrados] = useState([]);
  const [alunoSelecionadoFicha, setAlunoSelecionadoFicha] = useState(null);
  const [mostrarRelatorios, setMostrarRelatorios] = useState(false);
  const [buscaLivro, setBuscaLivro] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [tipoBusca, setTipoBusca] = useState('aluno'); // 'aluno' ou 'livro'
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarLogin, setMostrarLogin] = useState(true);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarRecuperarSenha, setMostrarRecuperarSenha] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [formLogin, setFormLogin] = useState({
    email: '',
    senha: ''
  });
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    funcao: ''
  });
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Verificar atrasos diariamente
  useEffect(() => {
    const verificarAtrasos = () => {
      const hoje = new Date();
      const emprestimosAtrasados = emprestimos.filter(emp => {
        if (emp.status === 'emprestado') {
          const dataPrevista = new Date(emp.dataDevolucaoPrevista);
          return dataPrevista < hoje;
        }
        return false;
      });

      const novasNotificacoes = emprestimosAtrasados.map(emp => ({
        id: Date.now() + Math.random(),
        tipo: 'atraso',
        mensagem: `O livro "${emp.livroNome}" emprestado para ${emp.alunoNome} está atrasado.`,
        data: hoje.toISOString()
      }));

      setNotificacoes(prev => [...prev, ...novasNotificacoes]);
    };

    verificarAtrasos();
    const intervalo = setInterval(verificarAtrasos, 24 * 60 * 60 * 1000); // Verificar a cada 24 horas

    return () => clearInterval(intervalo);
  }, [emprestimos]);

  // Função para buscar alunos do backend
  const buscarAlunos = async () => {
    try {
      console.log('Buscando alunos...');
      const response = await authService.get('/api/alunos');
      
      if (response?.data) {
        console.log('Alunos recebidos:', response.data);
        setAlunos(response.data);
      } else {
        console.error('Resposta inválida ao buscar alunos');
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      if (error.response?.status === 401) {
        console.log('Erro 401 ao buscar alunos. Fazendo logout...');
        setMensagemErro('Sua sessão expirou. Por favor, faça login novamente.');
        authService.logout();
        setUsuarioAtual(null);
        setMostrarLogin(true);
      } else {
        setMensagemErro('Erro ao carregar lista de alunos. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  // Função para buscar livros do backend
  const buscarLivros = async () => {
    try {
      console.log('Buscando livros...');
      const response = await authService.get('/api/livros');
      
      if (response?.data) {
        console.log('Livros recebidos:', response.data);
        setLivros(response.data);
      } else {
        console.error('Resposta inválida ao buscar livros');
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      if (error.response?.status === 401) {
        console.log('Erro 401 ao buscar livros. Fazendo logout...');
        setMensagemErro('Sua sessão expirou. Por favor, faça login novamente.');
        authService.logout();
        setUsuarioAtual(null);
        setMostrarLogin(true);
      } else {
        setMensagemErro('Erro ao carregar lista de livros. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  // Modificar a função de login
  const fazerLogin = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');
    
    try {
      console.log('Tentando fazer login...');
      const response = await authService.login(formLogin.email, formLogin.senha);
      console.log('Resposta do login:', response);
      
      if (response && response.token) {
        setUsuarioAtual(response);
        setMostrarLogin(false);
        setMensagemSucesso('Login realizado com sucesso!');
        
        // Aguarda um momento para garantir que o token foi configurado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          console.log('Iniciando busca de dados após login...');
          // Busca os dados em sequência para melhor tratamento de erros
          const alunosResponse = await authService.get('/api/alunos');
          if (alunosResponse?.data) {
            setAlunos(alunosResponse.data);
            console.log('Alunos carregados com sucesso');
          }
          
          const livrosResponse = await authService.get('/api/livros');
          if (livrosResponse?.data) {
            setLivros(livrosResponse.data);
            console.log('Livros carregados com sucesso');
          }
          
          console.log('Dados iniciais carregados com sucesso');
        } catch (error) {
          console.error('Erro ao buscar dados iniciais após login:', error);
          if (error.response?.status === 401) {
            setMensagemErro('Erro de autenticação. Por favor, faça login novamente.');
            authService.logout();
            setUsuarioAtual(null);
            setMostrarLogin(true);
          } else {
            setMensagemErro('Erro ao carregar dados. Por favor, tente novamente.');
          }
        }
      } else {
        setMensagemErro('Resposta inválida do servidor');
        setUsuarioAtual(null);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setMensagemErro(error.message || 'Email ou senha incorretos');
      setUsuarioAtual(null);
    }
  };

  // Atualizar o useEffect de verificação de usuário
  useEffect(() => {
    const verificarUsuario = async () => {
      console.log('Verificando usuário...');
      const usuario = authService.checkAuth();
      
      if (usuario) {
        console.log('Usuário autenticado encontrado:', usuario);
        setUsuarioAtual(usuario);
        setMostrarLogin(false);
        
        try {
          console.log('Iniciando busca de dados após verificação...');
          await buscarAlunos();
          await buscarLivros();
          console.log('Dados iniciais carregados com sucesso');
        } catch (error) {
          console.error('Erro ao buscar dados iniciais:', error);
          if (error.response?.status === 401) {
            console.log('Erro 401 ao buscar dados iniciais. Fazendo logout...');
            setMensagemErro('Sua sessão expirou. Por favor, faça login novamente.');
            authService.logout();
            setUsuarioAtual(null);
            setMostrarLogin(true);
          }
        }
      } else {
        console.log('Nenhum usuário autenticado encontrado');
        setMostrarLogin(true);
      }
    };

    verificarUsuario();

    // Adicionar listener para eventos de erro de autenticação
    const handleAuthError = () => {
      console.log('Evento de erro de autenticação recebido');
      setUsuarioAtual(null);
      setMostrarLogin(true);
      setMensagemErro('Sua sessão expirou. Por favor, faça login novamente.');
    };

    window.addEventListener('authError', handleAuthError);
    return () => window.removeEventListener('authError', handleAuthError);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoLivro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cadastrarLivro = (e) => {
    e.preventDefault();
    if (!novoLivro.nome || !novoLivro.autor || !novoLivro.numeroTombo) {
      alert('Por favor, preencha pelo menos o nome, autor e número de tombo.');
      return;
    }
    setLivros(prev => [...prev, { ...novoLivro, id: Date.now() }]);
    limparFormulario();
  };

  const limparFormulario = () => {
    setNovoLivro({
      nome: '',
      autor: '',
      isbn: '',
      edicao: '',
      genero: '',
      numeroTombo: ''
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const livrosImportados = jsonData.map(item => ({
            titulo: item.nome || item.Nome || item.NOME || '',
            autor: item.autor || item.Autor || item.AUTOR || '',
            genero: item.genero || item.Gênero || item.GENERO || '',
            ano: parseInt(item.ano || item.Ano || item.ANO || new Date().getFullYear()),
            disponivel: true
          }));

          const livrosValidos = livrosImportados.filter(livro => 
            livro.titulo && livro.autor && livro.genero && livro.ano
          );

          if (livrosValidos.length === 0) {
            alert('Nenhum livro válido encontrado no arquivo. Certifique-se de que o arquivo tem as colunas: nome, autor, gênero e ano.');
            return;
          }

          if (livrosValidos.length !== livrosImportados.length) {
            alert(`Atenção: ${livrosImportados.length - livrosValidos.length} livros foram ignorados por falta de dados obrigatórios.`);
          }

          // Enviar para o backend usando o serviço de API
          const response = await api.post('/api/livros/importar', livrosValidos);
          
          if (response.data) {
            alert(`${response.data.resultado.sucesso.length} livros importados com sucesso!`);
            
            // Atualizar a lista de livros
            const livrosResponse = await api.get('/api/livros');
            if (livrosResponse.data) {
              setLivros(livrosResponse.data);
            }
          }
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          const mensagemErro = error.response?.data?.message || 'Erro ao processar o arquivo. Certifique-se de que é um arquivo Excel válido.';
          alert(mensagemErro);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleInputChangeAluno = (e) => {
    const { name, value } = e.target;
    setNovoAluno(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cadastrarAluno = (e) => {
    e.preventDefault();
    if (!novoAluno.nome || !novoAluno.ra || !novoAluno.serie) {
      alert('Por favor, preencha todos os campos do aluno.');
      return;
    }
    setAlunos(prev => [...prev, { ...novoAluno, id: Date.now() }]);
    limparFormularioAluno();
  };

  const limparFormularioAluno = () => {
    setNovoAluno({
      nome: '',
      ra: '',
      serie: ''
    });
  };

  const handleFileUploadAluno = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const alunosImportados = jsonData.map(item => ({
            nome: item.nome || item.Nome || item.NOME || '',
            matricula: item.ra || item.RA || item.Ra || '',
            curso: item.serie || item.Série || item.SERIE || ''
          }));

          const alunosValidos = alunosImportados.filter(aluno => 
            aluno.nome && aluno.matricula && aluno.curso
          );

          if (alunosValidos.length === 0) {
            alert('Nenhum aluno válido encontrado no arquivo. Certifique-se de que o arquivo tem as colunas: nome, RA e série.');
            return;
          }

          if (alunosValidos.length !== alunosImportados.length) {
            alert(`Atenção: ${alunosImportados.length - alunosValidos.length} alunos foram ignorados por falta de dados obrigatórios.`);
          }

          try {
            // Enviar para o backend usando o serviço de API
            const response = await authService.post('/api/alunos/importar', alunosValidos);
            
            if (response.data) {
              alert(`${response.data.resultado.sucesso.length} alunos importados com sucesso!`);
              
              // Atualizar a lista de alunos
              const alunosResponse = await authService.get('/api/alunos');
              if (alunosResponse.data) {
                setAlunos(alunosResponse.data);
              }
            }
          } catch (error) {
            console.error('Erro ao enviar dados para o servidor:', error);
            if (error.response?.status === 401) {
              setMensagemErro('Sua sessão expirou. Por favor, faça login novamente.');
              authService.logout();
              setUsuarioAtual(null);
              setMostrarLogin(true);
            } else {
              alert('Erro ao enviar dados para o servidor. Verifique se o arquivo está no formato correto.');
            }
          }
          
          if (fileInputAlunoRef.current) {
            fileInputAlunoRef.current.value = '';
          }
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          alert('Erro ao processar o arquivo. Certifique-se de que é um arquivo Excel válido.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleInputChangeEmprestimo = (e) => {
    const { name, value } = e.target;
    
    if (name === 'alunoRA') {
      const aluno = alunos.find(a => a.ra === value);
      if (aluno) {
        setNovoEmprestimo(prev => ({
          ...prev,
          alunoRA: value,
          alunoNome: aluno.nome,
          alunoSerie: aluno.serie
        }));
      } else {
        setNovoEmprestimo(prev => ({
          ...prev,
          alunoRA: value,
          alunoNome: '',
          alunoSerie: ''
        }));
      }
    } else if (name === 'alunoNome') {
      const aluno = alunos.find(a => a.nome.toLowerCase() === value.toLowerCase());
      if (aluno) {
        setNovoEmprestimo(prev => ({
          ...prev,
          alunoNome: value,
          alunoRA: aluno.ra,
          alunoSerie: aluno.serie
        }));
      } else {
        setNovoEmprestimo(prev => ({
          ...prev,
          alunoNome: value,
          alunoRA: '',
          alunoSerie: ''
        }));
      }
    } else {
      setNovoEmprestimo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const selecionarAluno = (alunoId) => {
    const aluno = alunos.find(a => a._id === alunoId);
    if (aluno) {
      setNovoEmprestimo(prev => ({
        ...prev,
        alunoId: aluno._id,
        alunoNome: aluno.nome,
        alunoRA: aluno.matricula,
        alunoSerie: aluno.curso
      }));
    }
  };

  const selecionarLivro = (livroId) => {
    const livro = livros.find(l => l._id === livroId);
    if (livro) {
      setNovoEmprestimo(prev => ({
        ...prev,
        livroId: livro._id,
        livroNome: livro.titulo
      }));
    }
  };

  const cadastrarEmprestimo = (e) => {
    e.preventDefault();
    if (!novoEmprestimo.alunoNome || !novoEmprestimo.alunoRA || !novoEmprestimo.livroNome) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Verificar se o livro existe
    const livroExiste = livros.some(l => l.nome === novoEmprestimo.livroNome);
    if (!livroExiste) {
      alert('Livro não encontrado no cadastro.');
      return;
    }

    // Verificar se o aluno existe
    const alunoExiste = alunos.some(a => a.ra === novoEmprestimo.alunoRA);
    if (!alunoExiste) {
      alert('Aluno não encontrado no cadastro.');
      return;
    }

    // Verificar se o livro já está emprestado
    const livroEmprestado = emprestimos.some(
      e => e.livroNome === novoEmprestimo.livroNome && e.status === 'emprestado'
    );
    if (livroEmprestado) {
      const disponibilidade = verificarDisponibilidade(novoEmprestimo.livroNome);
      alert(`Este livro já está emprestado. Previsão de devolução: ${disponibilidade.previsaoDevolucao}. Deseja fazer uma reserva?`);
      return;
    }

    // Verificar se o aluno tem empréstimos em atraso
    const temAtraso = emprestimos.some(emp => 
      emp.alunoRA === novoEmprestimo.alunoRA && 
      emp.status === 'emprestado' && 
      new Date(emp.dataDevolucaoPrevista) < new Date()
    );
    if (temAtraso) {
      alert('Este aluno possui livros em atraso. Regularize a situação antes de fazer novo empréstimo.');
      return;
    }

    setEmprestimos(prev => [...prev, { ...novoEmprestimo, id: Date.now() }]);
    
    // Verificar e atualizar reservas
    const reservasPendentes = reservas.filter(
      r => r.livroNome === novoEmprestimo.livroNome && r.status === 'pendente'
    );
    if (reservasPendentes.length > 0) {
      const proximaReserva = reservasPendentes[0];
      setNotificacoes(prev => [...prev, {
        id: Date.now(),
        tipo: 'reserva',
        mensagem: `O livro "${novoEmprestimo.livroNome}" está disponível para ${proximaReserva.alunoNome}.`,
        data: new Date().toISOString()
      }]);
    }

    limparFormularioEmprestimo();
  };

  const limparFormularioEmprestimo = () => {
    setNovoEmprestimo({
      alunoNome: '',
      alunoRA: '',
      alunoSerie: '',
      livroNome: '',
      dataEmprestimo: new Date().toISOString().split('T')[0],
      dataDevolucaoPrevista: new Date(Date.now() + (PRAZO_EMPRESTIMO_DIAS * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      dataDevolucao: '',
      status: 'emprestado'
    });
  };

  const devolverLivro = (emprestimoId) => {
    const emprestimo = emprestimos.find(emp => emp.id === emprestimoId);
    const livrosSimilares = getLivrosSimilares(emprestimo.livroNome);
    
    setEmprestimos(prev => prev.map(emp => {
      if (emp.id === emprestimoId) {
        return {
          ...emp,
          dataDevolucao: new Date().toISOString().split('T')[0],
          status: 'devolvido'
        };
      }
      return emp;
    }));

    if (livrosSimilares.length > 0) {
      const sugestoes = livrosSimilares.map(l => `- ${l.nome} (${l.autor})`).join('\n');
      alert(`Sugestões de livros similares para ${emprestimo.alunoNome}:\n\n${sugestoes}`);
    }
  };

  const filtrarEmprestimos = () => {
    if (!pesquisaEmprestimo) return emprestimos;

    return emprestimos.filter(emp => {
      const termoPesquisa = pesquisaEmprestimo.toLowerCase();
      if (filtroEmprestimo === 'aluno') {
        return emp.alunoNome.toLowerCase().includes(termoPesquisa) ||
               emp.alunoRA.toLowerCase().includes(termoPesquisa);
      } else {
        return emp.livroNome.toLowerCase().includes(termoPesquisa);
      }
    });
  };

  const cadastrarReserva = (livroNome, alunoRA) => {
    const aluno = alunos.find(a => a.ra === alunoRA);
    if (!aluno) {
      alert('Aluno não encontrado.');
      return;
    }

    const livroExiste = livros.some(l => l.nome === livroNome);
    if (!livroExiste) {
      alert('Livro não encontrado.');
      return;
    }

    const jaReservado = reservas.some(
      r => r.livroNome === livroNome && r.alunoRA === alunoRA && r.status === 'pendente'
    );
    if (jaReservado) {
      alert('Você já tem uma reserva para este livro.');
      return;
    }

    const novaReserva = {
      id: Date.now(),
      livroNome,
      alunoRA,
      alunoNome: aluno.nome,
      dataReserva: new Date().toISOString().split('T')[0],
      status: 'pendente'
    };

    setReservas(prev => [...prev, novaReserva]);
    alert('Reserva realizada com sucesso!');
  };

  const cancelarReserva = (reservaId) => {
    setReservas(prev => prev.map(res => 
      res.id === reservaId ? { ...res, status: 'cancelada' } : res
    ));
  };

  const getHistoricoAluno = (ra) => {
    const historicoEmprestimos = emprestimos.filter(emp => emp.alunoRA === ra);
    const historicoReservas = reservas.filter(res => res.alunoRA === ra);
    
    return {
      emprestimos: historicoEmprestimos,
      reservas: historicoReservas
    };
  };

  const verificarDisponibilidade = (livroNome) => {
    const emprestado = emprestimos.some(
      emp => emp.livroNome === livroNome && emp.status === 'emprestado'
    );
    
    if (emprestado) {
      const reservas = getReservasLivro(livroNome);
      return {
        disponivel: false,
        posicaoFila: reservas.length + 1,
        previsaoDevolucao: emprestimos.find(
          emp => emp.livroNome === livroNome && emp.status === 'emprestado'
        ).dataDevolucaoPrevista
      };
    }

    return { disponivel: true };
  };

  const getReservasLivro = (livroNome) => {
    return reservas.filter(
      res => res.livroNome === livroNome && res.status === 'pendente'
    );
  };

  const filtrarHistorico = (historico) => {
    if (!pesquisaHistorico) {
      return historico;
    }

    const termoPesquisa = pesquisaHistorico.toLowerCase();
    return historico.filter(emp => {
      return emp.alunoRA.toLowerCase().includes(termoPesquisa) ||
             emp.alunoNome.toLowerCase().includes(termoPesquisa) ||
             emp.livroNome.toLowerCase().includes(termoPesquisa);
    });
  };

  const imprimirFicha = () => {
    window.print();
  };

  const atualizarFichaEmprestimo = (index, campo, valor) => {
    const novosEmprestimos = [...fichaEmprestimo.emprestimos];
    novosEmprestimos[index] = {
      ...novosEmprestimos[index],
      [campo]: valor
    };
    setFichaEmprestimo({
      ...fichaEmprestimo,
      emprestimos: novosEmprestimos
    });
  };

  const getSeriesUnicas = () => {
    return [...new Set(alunos.map(aluno => aluno.serie))].sort();
  };

  const filtrarAlunosPorSerie = (serie) => {
    return alunos.filter(aluno => aluno.serie === serie);
  };

  const selecionarAlunoFicha = (aluno) => {
    setFichaEmprestimo({
      ...fichaEmprestimo,
      alunoNome: aluno.nome,
      alunoRA: aluno.matricula,
      alunoSerie: aluno.serie
    });
    setAlunoSelecionadoFicha(aluno);
  };

  // Função para obter empréstimos da semana atual
  const getEmprestimosSemana = () => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    return emprestimos.filter(emp => {
      const dataEmprestimo = new Date(emp.dataEmprestimo);
      return dataEmprestimo >= inicioSemana && dataEmprestimo <= hoje;
    });
  };

  // Função para obter empréstimos do mês atual
  const getEmprestimosMes = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    return emprestimos.filter(emp => {
      const dataEmprestimo = new Date(emp.dataEmprestimo);
      return dataEmprestimo >= inicioMes && dataEmprestimo <= hoje;
    });
  };

  // Função para obter empréstimos do ano atual
  const getEmprestimosAno = () => {
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);

    return emprestimos.filter(emp => {
      const dataEmprestimo = new Date(emp.dataEmprestimo);
      return dataEmprestimo >= inicioAno && dataEmprestimo <= hoje;
    });
  };

  // Função para agrupar empréstimos por série
  const getEmprestimosPorSerie = () => {
    const emprestimosAtivos = emprestimos.filter(emp => emp.status === 'emprestado');
    const porSerie = {};
    
    emprestimosAtivos.forEach(emp => {
      porSerie[emp.alunoSerie] = (porSerie[emp.alunoSerie] || 0) + 1;
    });

    return porSerie;
  };

  // Adicionar nova função para buscar livros do mesmo gênero
  const getLivrosSimilares = (livroAtual) => {
    const livroOriginal = livros.find(l => l.nome === livroAtual);
    if (!livroOriginal) return [];
    
    return livros.filter(l => 
      l.genero === livroOriginal.genero && 
      l.nome !== livroAtual &&
      !emprestimos.some(e => e.livroNome === l.nome && e.status === 'emprestado')
    );
  };

  // Função para verificar situação do livro
  const getSituacaoLivro = (livroNome) => {
    const emprestimoAtivo = emprestimos.find(
      emp => emp.livroNome === livroNome && emp.status === 'emprestado'
    );

    if (emprestimoAtivo) {
      return {
        status: 'Emprestado',
        aluno: emprestimoAtivo.alunoNome,
        ra: emprestimoAtivo.alunoRA,
        serie: emprestimoAtivo.alunoSerie,
        dataEmprestimo: emprestimoAtivo.dataEmprestimo
      };
    }

    return { status: 'Disponível' };
  };

  // Modificar função de busca
  const buscarRegistros = () => {
    if (tipoBusca === 'aluno') {
      const resultados = emprestimos.filter(emp =>
        emp.alunoNome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        emp.alunoRA.includes(termoBusca)
      );
      setResultadosBusca(resultados);
    } else {
      const resultados = livros
        .filter(livro =>
          livro.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
          livro.autor.toLowerCase().includes(termoBusca.toLowerCase()) ||
          livro.genero.toLowerCase().includes(termoBusca.toLowerCase())
        )
        .map(livro => {
          const situacao = getSituacaoLivro(livro.nome);
          return {
            ...livro,
            situacao
          };
        });
      setResultadosBusca(resultados);
    }
  };

  // Função para cadastrar novo usuário
  const cadastrarUsuario = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    try {
      // Validação da confirmação de senha
      if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
        setMensagemErro('As senhas não coincidem');
        return;
      }

      // Validação do formato da senha (6 dígitos numéricos)
      if (!/^\d{6}$/.test(novoUsuario.senha)) {
        setMensagemErro('A senha deve conter exatamente 6 dígitos numéricos');
        return;
      }

      const response = await authService.register(novoUsuario);
      setMensagemSucesso('Usuário cadastrado com sucesso!');
      setMostrarCadastro(false);
      setMostrarLogin(true);
      setNovoUsuario({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        funcao: ''
      });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      setMensagemErro(error.message || 'Erro ao cadastrar usuário');
    }
  };

  // Função para recuperar senha
  const recuperarSenha = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    try {
      const response = await authService.recuperarSenha(emailRecuperacao);
      setMensagemSucesso(`Nova senha gerada: ${response.novaSenha}. Em produção, esta senha seria enviada por email.`);
      setMostrarRecuperarSenha(false);
      setMostrarLogin(true);
      setEmailRecuperacao('');
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao recuperar senha');
    }
  };

  // Função para fazer logout
  const fazerLogout = () => {
    authService.logout();
    setUsuarioAtual(null);
    setMostrarLogin(true);
    setMensagemSucesso('Logout realizado com sucesso!');
  };

  return (
    <div className="App">
      {mostrarLogin && !usuarioAtual && (
        <div className="login-container">
          <h2>Login</h2>
          {mensagemErro && <div className="mensagem erro">{mensagemErro}</div>}
          {mensagemSucesso && <div className="mensagem sucesso">{mensagemSucesso}</div>}
          <form onSubmit={fazerLogin} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={formLogin.email}
                onChange={(e) => setFormLogin(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Senha"
                value={formLogin.senha}
                onChange={(e) => setFormLogin(prev => ({ ...prev, senha: e.target.value }))}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Entrar</button>
              <button type="button" onClick={() => {
                setMostrarLogin(false);
                setMostrarCadastro(true);
                setMostrarRecuperarSenha(false);
              }}>
                Cadastrar
              </button>
              <button type="button" onClick={() => {
                setMostrarLogin(false);
                setMostrarCadastro(false);
                setMostrarRecuperarSenha(true);
              }}>
                Esqueci a Senha
              </button>
            </div>
          </form>
        </div>
      )}

      {mostrarCadastro && (
        <div className="cadastro-container">
          <h2>Cadastro de Usuário</h2>
          {mensagemErro && <div className="mensagem erro">{mensagemErro}</div>}
          {mensagemSucesso && <div className="mensagem sucesso">{mensagemSucesso}</div>}
          <form onSubmit={cadastrarUsuario} className="cadastro-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nome Completo"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Função"
                value={novoUsuario.funcao}
                onChange={(e) => setNovoUsuario(prev => ({ ...prev, funcao: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Senha (6 dígitos numéricos)"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario(prev => ({ ...prev, senha: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={novoUsuario.confirmarSenha}
                onChange={(e) => setNovoUsuario(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Cadastrar</button>
              <button type="button" onClick={() => {
                setMostrarCadastro(false);
                setMostrarLogin(true);
                setMostrarRecuperarSenha(false);
              }}>
                Voltar
              </button>
            </div>
          </form>
        </div>
      )}

      {mostrarRecuperarSenha && (
        <div className="recuperar-senha-container">
          <h2>Recuperar Senha</h2>
          {mensagemErro && <div className="mensagem erro">{mensagemErro}</div>}
          {mensagemSucesso && <div className="mensagem sucesso">{mensagemSucesso}</div>}
          <form onSubmit={recuperarSenha} className="recuperar-senha-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email cadastrado"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Enviar Nova Senha</button>
              <button type="button" onClick={() => {
                setMostrarRecuperarSenha(false);
                setMostrarLogin(true);
                setMostrarCadastro(false);
              }}>
                Voltar
              </button>
            </div>
          </form>
        </div>
      )}

      {usuarioAtual && (
        <>
          <header className="header">
            <div className="usuario-info">
              <span>Bem-vindo, {usuarioAtual.nome}</span>
              <span>Função: {usuarioAtual.funcao}</span>
              <button onClick={fazerLogout} className="logout-btn">Sair</button>
            </div>
            <h1>
              Biblio<span style={{ color: "#3498db" }}>TECH</span>
        </h1>
            <p>Sua Biblioteca na Nuvem</p>

        <div className="search-bar">
          <input type="text" placeholder="Buscar..." />
              <button>🔍</button>
        </div>

            <nav className="nav-buttons">
              <button onClick={() => {
                setMostrarFormulario(!mostrarFormulario);
                setMostrarLivros(false);
                setMostrarFormularioAluno(false);
                setMostrarAlunos(false);
                setMostrarEmprestimos(false);
              }}>
                {mostrarFormulario ? 'Fechar Cadastro' : 'Cadastrar Livro'}
              </button>
              <button onClick={() => {
                setMostrarLivros(!mostrarLivros);
                setMostrarFormulario(false);
                setMostrarFormularioAluno(false);
                setMostrarAlunos(false);
                setMostrarEmprestimos(false);
              }}>
                {mostrarLivros ? 'Fechar Lista' : 'Listar Livros'}
              </button>
              <button onClick={() => {
                setMostrarFormularioAluno(!mostrarFormularioAluno);
                setMostrarFormulario(false);
                setMostrarLivros(false);
                setMostrarAlunos(false);
                setMostrarEmprestimos(false);
              }}>
                {mostrarFormularioAluno ? 'Fechar Cadastro' : 'Cadastrar Aluno'}
              </button>
              <button onClick={() => {
                setMostrarAlunos(!mostrarAlunos);
                setMostrarFormulario(false);
                setMostrarFormularioAluno(false);
                setMostrarEmprestimos(false);
              }}>
                {mostrarAlunos ? 'Fechar Lista' : 'Listar Alunos'}
              </button>
              <button onClick={() => {
                setMostrarEmprestimos(!mostrarEmprestimos);
                setMostrarFormulario(false);
                setMostrarLivros(false);
                setMostrarFormularioAluno(false);
                setMostrarAlunos(false);
              }}>
                {mostrarEmprestimos ? 'Fechar Empréstimos' : 'Empréstimos'}
              </button>
              <button onClick={() => setMostrarHistorico(!mostrarHistorico)}>
                {mostrarHistorico ? 'Fechar Histórico' : 'Histórico'}
              </button>
              <button 
                className={`nav-btn ${mostrarFicha ? 'active' : ''}`}
                onClick={() => setMostrarFicha(!mostrarFicha)}
              >
                Ficha de Empréstimo
              </button>
              <button onClick={() => {
                setMostrarRelatorios(!mostrarRelatorios);
                setMostrarFormulario(false);
                setMostrarLivros(false);
                setMostrarFormularioAluno(false);
                setMostrarAlunos(false);
                setMostrarEmprestimos(false);
                setMostrarHistorico(false);
                setMostrarFicha(false);
              }}>
                {mostrarRelatorios ? 'Fechar Relatórios' : 'Relatórios'}
              </button>
            </nav>
          </header>

          <main className="main-content">
            {mostrarFormulario && (
              <div className="form-container">
                <h2>Cadastro de Livro</h2>
                
                <div className="import-section">
                  <h3>Importar Lista de Livros</h3>
                  <p>Faça upload de um arquivo Excel (.xls ou .xlsx)</p>
                  <input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="file-input"
                  />
                  <p className="import-info">
                    O arquivo deve conter as colunas: nome, autor, isbn, edição, gênero e número de tombo
                  </p>
        </div>

                <div className="separator">
                  <span>ou cadastre manualmente</span>
      </div>

                <form onSubmit={cadastrarLivro} className="livro-form">
                  <div className="form-group">
                    <input
                      type="text"
                      name="nome"
                      value={novoLivro.nome}
                      onChange={handleInputChange}
                      placeholder="Nome do Livro"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="autor"
                      value={novoLivro.autor}
                      onChange={handleInputChange}
                      placeholder="Autor"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="isbn"
                      value={novoLivro.isbn}
                      onChange={handleInputChange}
                      placeholder="ISBN"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="edicao"
                      value={novoLivro.edicao}
                      onChange={handleInputChange}
                      placeholder="Edição"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="genero"
                      value={novoLivro.genero}
                      onChange={handleInputChange}
                      placeholder="Gênero"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="numeroTombo"
                      value={novoLivro.numeroTombo}
                      onChange={handleInputChange}
                      placeholder="Número de Tombo"
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit">Cadastrar</button>
                    <button type="button" onClick={limparFormulario}>Limpar</button>
                  </div>
                </form>
              </div>
            )}

            {mostrarLivros && (
              <div className="livros-lista">
                <h2>Livros Cadastrados</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nº Tombo</th>
                        <th>Nome</th>
                        <th>Autor</th>
                        <th>ISBN</th>
                        <th>Edição</th>
                        <th>Gênero</th>
                      </tr>
                    </thead>
                    <tbody>
                      {livros.map(livro => (
                        <tr key={livro.id}>
                          <td>{livro.numeroTombo}</td>
                          <td>{livro.nome}</td>
                          <td>{livro.autor}</td>
                          <td>{livro.isbn}</td>
                          <td>{livro.edicao}</td>
                          <td>{livro.genero}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mostrarFormularioAluno && (
              <div className="form-container">
                <h2>Cadastro de Aluno</h2>
                
                <div className="import-section">
                  <h3>Importar Lista de Alunos</h3>
                  <p>Faça upload de um arquivo Excel (.xls ou .xlsx)</p>
                  <input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileUploadAluno}
                    ref={fileInputAlunoRef}
                    className="file-input"
                  />
                  <p className="import-info">
                    O arquivo deve conter as colunas: nome, RA e série
                  </p>
                </div>

                <div className="separator">
                  <span>ou cadastre manualmente</span>
                </div>

                <form onSubmit={cadastrarAluno} className="aluno-form">
                  <div className="form-group">
                    <input
                      type="text"
                      name="nome"
                      value={novoAluno.nome}
                      onChange={handleInputChangeAluno}
                      placeholder="Nome do Aluno"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="ra"
                      value={novoAluno.ra}
                      onChange={handleInputChangeAluno}
                      placeholder="RA"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="serie"
                      value={novoAluno.serie}
                      onChange={handleInputChangeAluno}
                      placeholder="Série"
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit">Cadastrar</button>
                    <button type="button" onClick={limparFormularioAluno}>Limpar</button>
                  </div>
                </form>
              </div>
            )}

            {mostrarAlunos && (
              <div className="alunos-lista">
                <h2>Alunos Cadastrados</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>RA</th>
                        <th>Série</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunos.map(aluno => (
                        <tr key={aluno._id}>
                          <td>{aluno.nome}</td>
                          <td>{aluno.matricula}</td>
                          <td>{aluno.curso}</td>
                          <td>{aluno.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mostrarEmprestimos && (
              <div className="emprestimos-container">
                {notificacoes.length > 0 && (
                  <div className="notificacoes">
                    <h3>Notificações</h3>
                    <ul>
                      {notificacoes.map(notif => (
                        <li key={notif.id} className={`notificacao ${notif.tipo}`}>
                          {notif.mensagem}
                          <button
                            onClick={() => setNotificacoes(prev => 
                              prev.filter(n => n.id !== notif.id)
                            )}
                            className="fechar-notificacao"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-container">
                  <h2>Novo Empréstimo</h2>
                  <form onSubmit={cadastrarEmprestimo} className="form-emprestimo">
                    <div className="form-group">
                      <label>Aluno:</label>
                      <select
                        value={novoEmprestimo.alunoId || ''}
                        onChange={(e) => selecionarAluno(e.target.value)}
                        required
                      >
                        <option value="">Selecione um aluno</option>
                        {alunos.map(aluno => (
                          <option key={aluno._id} value={aluno._id}>
                            {aluno.nome} - {aluno.matricula} - {aluno.curso}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Livro:</label>
                      <select
                        value={novoEmprestimo.livroId || ''}
                        onChange={(e) => selecionarLivro(e.target.value)}
                        required
                      >
                        <option value="">Selecione um livro</option>
                        {livros
                          .filter(livro => livro.disponivel)
                          .map(livro => (
                            <option key={livro._id} value={livro._id}>
                              {livro.titulo} - {livro.autor}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Data do Empréstimo:</label>
                      <input
                        type="date"
                        value={novoEmprestimo.dataEmprestimo}
                        onChange={(e) => setNovoEmprestimo(prev => ({
                          ...prev,
                          dataEmprestimo: e.target.value,
                          dataDevolucaoPrevista: new Date(new Date(e.target.value).getTime() + (PRAZO_EMPRESTIMO_DIAS * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                        }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Data de Devolução Prevista:</label>
                      <input
                        type="date"
                        value={novoEmprestimo.dataDevolucaoPrevista}
                        readOnly
                      />
                    </div>

                    <button type="submit" className="btn-cadastrar">Cadastrar Empréstimo</button>
                  </form>
                </div>

                <div className="emprestimos-lista">
                  <h2>Empréstimos</h2>
                  <div className="search-section">
                    <div className="search-controls">
                      <select 
                        value={tipoBusca}
                        onChange={(e) => {
                          setTipoBusca(e.target.value);
                          setTermoBusca('');
                          setResultadosBusca([]);
                        }}
                        className="search-type"
                      >
                        <option value="aluno">Buscar por Aluno</option>
                        <option value="livro">Buscar por Livro</option>
                      </select>
                      <input
                        type="text"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        placeholder={tipoBusca === 'aluno' ? "Digite o nome ou RA do aluno" : "Digite o nome, autor ou gênero do livro"}
                        className="search-input"
                      />
                      <button onClick={buscarRegistros} className="search-btn">
                        Buscar
                      </button>
                    </div>

                    {resultadosBusca.length > 0 && (
                      <div className="search-results">
                        {tipoBusca === 'aluno' ? (
                          <table>
                            <thead>
                              <tr>
                                <th>Aluno</th>
                                <th>RA</th>
                                <th>Série</th>
                                <th>Livro</th>
                                <th>Data Empréstimo</th>
                                <th>Data Devolução</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resultadosBusca.map((emp, index) => (
                                <tr key={index} className={emp.status === 'emprestado' ? 'emprestado' : 'devolvido'}>
                                  <td>{emp.alunoNome}</td>
                                  <td>{emp.alunoRA}</td>
                                  <td>{emp.alunoSerie}</td>
                                  <td>{emp.livroNome}</td>
                                  <td>{emp.dataEmprestimo}</td>
                                  <td>{emp.dataDevolucao || '-'}</td>
                                  <td>{emp.status === 'emprestado' ? 'Emprestado' : 'Devolvido'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <table>
                            <thead>
                              <tr>
                                <th>Livro</th>
                                <th>Autor</th>
                                <th>Gênero</th>
                                <th>Situação</th>
                                <th>Detalhes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resultadosBusca.map((livro, index) => (
                                <tr key={index} className={livro.situacao.status === 'Emprestado' ? 'emprestado' : 'disponivel'}>
                                  <td>{livro.nome}</td>
                                  <td>{livro.autor}</td>
                                  <td>{livro.genero}</td>
                                  <td>{livro.situacao.status}</td>
                                  <td>
                                    {livro.situacao.status === 'Emprestado' ? (
                                      <>
                                        Emprestado para: {livro.situacao.aluno}<br/>
                                        RA: {livro.situacao.ra}<br/>
                                        Série: {livro.situacao.serie}<br/>
                                        Data: {livro.situacao.dataEmprestimo}
                                      </>
                                    ) : 'Disponível para empréstimo'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mostrarHistorico && (
              <div className="historico-container">
                <h2>Histórico de Empréstimos e Reservas</h2>
                <div className="search-section historico-search">
                  <div className="search-group">
                    <input
                      type="text"
                      placeholder="Pesquisar por RA, nome do aluno ou livro..."
                      value={pesquisaHistorico}
                      onChange={(e) => {
                        setPesquisaHistorico(e.target.value);
                        const termoPesquisa = e.target.value.toLowerCase();
                        
                        // Encontrar aluno por RA ou nome
                        const alunoEncontrado = alunos.find(a => 
                          a.ra.toLowerCase().includes(termoPesquisa) ||
                          a.nome.toLowerCase().includes(termoPesquisa)
                        );

                        if (alunoEncontrado) {
                          setAlunoSelecionado({
                            ...alunoEncontrado,
                            ...getHistoricoAluno(alunoEncontrado.ra)
                          });
                        } else if (!termoPesquisa) {
                          setAlunoSelecionado(null);
                        }
                      }}
                    />
                  </div>
                </div>

                {alunoSelecionado && (
                  <div className="historico-aluno">
                    <h3>Histórico de {alunoSelecionado.nome}</h3>
                    
                    <div className="historico-section">
                      <h4>Empréstimos</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Livro</th>
                            <th>Data Empréstimo</th>
                            <th>Data Devolução</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtrarHistorico(alunoSelecionado.emprestimos).map(emp => (
                            <tr key={emp.id} className={emp.status}>
                              <td>{emp.livroNome}</td>
                              <td>{emp.dataEmprestimo}</td>
                              <td>{emp.dataDevolucao || emp.dataDevolucaoPrevista}</td>
                              <td>{emp.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="historico-section">
                      <h4>Reservas</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Livro</th>
                            <th>Data Reserva</th>
                            <th>Status</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alunoSelecionado.reservas.filter(res => 
                            !pesquisaHistorico || res.livroNome.toLowerCase().includes(pesquisaHistorico.toLowerCase())
                          ).map(res => (
                            <tr key={res.id}>
                              <td>{res.livroNome}</td>
                              <td>{res.dataReserva}</td>
                              <td>{res.status}</td>
                              <td>
                                {res.status === 'pendente' && (
                                  <button
                                    onClick={() => cancelarReserva(res.id)}
                                    className="cancelar-btn"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mostrarFicha && (
              <div className="ficha-container">
                <div className="ficha-actions">
                  <div className="ficha-filtros">
                    <select 
                      value={serieSelecionada} 
                      onChange={(e) => {
                        setSerieSelecionada(e.target.value);
                        setAlunosFiltrados(e.target.value ? alunos.filter(a => a.curso === e.target.value) : []);
                      }}
                    >
                      <option value="">Selecione a Série</option>
                      {[...new Set(alunos.map(a => a.curso))].sort().map(curso => (
                        <option key={curso} value={curso}>{curso}</option>
                      ))}
                    </select>

                    {serieSelecionada && (
                      <select
                        onChange={(e) => {
                          const alunoSelecionado = alunos.find(a => a._id === e.target.value);
                          if (alunoSelecionado) {
                            selecionarAlunoFicha(alunoSelecionado);
                          }
                        }}
                        value={alunoSelecionadoFicha?._id || ''}
                      >
                        <option value="">Selecione o Aluno</option>
                        {alunosFiltrados.map(aluno => (
                          <option key={aluno._id} value={aluno._id}>
                            {aluno.nome} - {aluno.matricula}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button 
                    className="imprimir-btn" 
                    onClick={imprimirFicha}
                    disabled={!alunoSelecionadoFicha}
                  >
                    Imprimir Ficha
                  </button>
                </div>
                <div className="ficha-emprestimo">
                  <div className="ficha-header">
                    <h2>Ficha de Empréstimo</h2>
                  </div>
                  <div className="ficha-aluno">
                    <div className="ficha-campo">
                      <label>Nome:</label>
                      <input
                        type="text"
                        value={fichaEmprestimo.alunoNome}
                        readOnly
                      />
                    </div>
                    <div className="ficha-campo">
                      <label>RA:</label>
                      <input
                        type="text"
                        value={fichaEmprestimo.alunoRA}
                        readOnly
                      />
                    </div>
                    <div className="ficha-campo">
                      <label>Série:</label>
                      <input
                        type="text"
                        value={fichaEmprestimo.alunoSerie}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="ficha-tabela">
                    <table>
                      <thead>
                        <tr>
                          <th>Nº</th>
                          <th>Livro</th>
                          <th>Data Empréstimo</th>
                          <th>Data Devolução</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fichaEmprestimo.emprestimos.map((emprestimo, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <input
                                type="text"
                                value={emprestimo.livro}
                                onChange={(e) => atualizarFichaEmprestimo(index, 'livro', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={emprestimo.dataEmprestimo}
                                onChange={(e) => atualizarFichaEmprestimo(index, 'dataEmprestimo', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={emprestimo.dataDevolucao}
                                onChange={(e) => atualizarFichaEmprestimo(index, 'dataDevolucao', e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {mostrarRelatorios && (
              <div className="dashboard-container">
                <h2>Dashboard de Empréstimos</h2>
                
                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <h3>Empréstimos por Período</h3>
                    <Bar
                      data={{
                        labels: ['Semana', 'Mês', 'Ano'],
                        datasets: [{
                          label: 'Quantidade de Empréstimos',
                          data: [
                            getEmprestimosSemana().length,
                            getEmprestimosMes().length,
                            getEmprestimosAno().length
                          ],
                          backgroundColor: [
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                          ],
                          borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Empréstimos por Período'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="dashboard-card">
                    <h3>Empréstimos por Série</h3>
                    <Pie
                      data={{
                        labels: Object.keys(getEmprestimosPorSerie()),
                        datasets: [{
                          data: Object.values(getEmprestimosPorSerie()),
                          backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)'
                          ],
                          borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          title: {
                            display: true,
                            text: 'Distribuição por Série'
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="dashboard-info">
                    <div className="info-card">
                      <h4>Total de Empréstimos</h4>
                      <p className="info-number">{emprestimos.length}</p>
                    </div>
                    <div className="info-card">
                      <h4>Empréstimos Ativos</h4>
                      <p className="info-number">
                        {emprestimos.filter(emp => emp.status === 'emprestado').length}
                      </p>
                    </div>
                    <div className="info-card">
                      <h4>Empréstimos do Mês</h4>
                      <p className="info-number">{getEmprestimosMes().length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer>
            <p>BiblioTech - 2025. Todos os direitos reservados.</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
