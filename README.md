# BiblioTech

Sistema de gerenciamento de biblioteca escolar desenvolvido com React e Node.js.

## Estrutura do Projeto

```
bibliotech/
├── frontend/          # Aplicação React
└── backend/           # API Node.js
```

## Tecnologias Utilizadas

### Frontend
- React
- Vite
- React Router
- Axios
- TailwindCSS

### Backend
- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT para autenticação

## Como Executar

### Backend
1. Navegue até o diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias
4. Execute o servidor:
   ```bash
   npm run dev
   ```

### Frontend
1. Navegue até o diretório do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Funcionalidades

- Cadastro e gerenciamento de livros
- Controle de empréstimos
- Gestão de usuários
- Relatórios
- Interface responsiva

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 