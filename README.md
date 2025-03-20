# BiblioTech

Sistema de gerenciamento de biblioteca escolar desenvolvido com React e Node.js.

## 🚀 Funcionalidades

- Cadastro e gerenciamento de livros
- Cadastro e gerenciamento de alunos
- Controle de empréstimos e devoluções
- Geração de relatórios
- Importação de dados via CSV e Excel
- Sistema de autenticação

## 🛠️ Tecnologias Utilizadas

- Frontend: React.js
- Backend: Node.js
- Banco de Dados: MongoDB
- Bibliotecas: Axios, React Router

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/bibliotech.git
```

2. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

3. Instale as dependências do backend:
```bash
cd ../backend
npm install
```

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do backend
- Adicione as seguintes variáveis:
```
MONGODB_URI=sua_url_mongodb
JWT_SECRET=seu_segredo_jwt
PORT=5001
```

5. Inicie o servidor backend:
```bash
cd backend
npm start
```

6. Inicie o frontend:
```bash
cd frontend
npm start
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 