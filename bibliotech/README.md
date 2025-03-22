# BiblioTech - Sistema de Biblioteca

Sistema de gerenciamento de biblioteca escolar com controle de empréstimos, cadastro de livros e alunos.

## Funcionalidades

- Cadastro e gerenciamento de livros
- Cadastro e gerenciamento de alunos
- Controle de empréstimos
- Histórico de empréstimos
- Relatórios e estatísticas
- Sistema de login e controle de acesso
- Ficha de empréstimo impressível

## Tecnologias Utilizadas

- React.js
- Chart.js para gráficos
- XLSX para importação de dados
- CSS moderno com efeitos de glassmorphism

## Requisitos

- Node.js 14.x ou superior
- NPM 6.x ou superior

## Instalação

1. Clone o repositório:
```bash
git clone https://seu-repositorio/bibliotech.git
cd bibliotech
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## Deploy

### Opção 1: Vercel (Recomendada)

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login na sua conta Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Opção 2: Netlify

1. Instale o Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Faça login na sua conta Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy
```

### Opção 3: GitHub Pages

1. Adicione o pacote gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Adicione ao package.json:
```json
{
  "homepage": "https://seu-usuario.github.io/bibliotech",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

## Configuração de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:
```env
REACT_APP_API_URL=sua-url-api
```

2. Para produção, configure as variáveis de ambiente na plataforma de hospedagem.

## Segurança

- Todas as senhas são armazenadas com hash
- Implementado controle de acesso por função
- Validação de dados em todos os formulários
- Proteção contra XSS e CSRF

## Manutenção

Para atualizar o sistema:

1. Faça pull das alterações:
```bash
git pull origin main
```

2. Instale novas dependências:
```bash
npm install
```

3. Faça build e deploy:
```bash
npm run build
npm run deploy
```

## Suporte

Para suporte, entre em contato através do email: seu-email@exemplo.com

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes. 