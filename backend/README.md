# Backend - Sistema de Troca de Itens

## Descrição

Backend desenvolvido em Node.js com Express para um sistema de troca de itens entre usuários. O sistema permite que usuários cadastrem itens, façam propostas de troca e gerenciem suas transações.

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação via tokens
- **bcryptjs** - Criptografia de senhas
- **Joi** - Validação de dados
- **Multer** - Upload de arquivos
- **Helmet** - Segurança HTTP
- **CORS** - Controle de acesso
- **Rate Limiting** - Limitação de requisições

## Funcionalidades

### Autenticação
- ✅ Registro de usuários com validação de CPF
- ✅ Login com email e senha
- ✅ Autenticação via JWT
- ✅ Rate limiting para tentativas de login

### Usuários
- ✅ Perfil do usuário
- ✅ Atualização de dados
- ✅ Listagem de usuários

### Itens
- ✅ Cadastro de itens
- ✅ Listagem com paginação e filtros
- ✅ Busca por nome/descrição
- ✅ Edição e exclusão (apenas pelo dono)
- ✅ Upload de imagens
- ✅ Categorização

### Propostas
- ✅ Criação de propostas de troca
- ✅ Listagem de propostas feitas e recebidas
- ✅ Aceitar/rejeitar propostas
- ✅ Cancelamento de propostas pendentes

## Configuração

### 1. Instalação das dependências

```bash
npm install
```

### 2. Configuração do banco de dados

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/troca_itens_db"
JWT_SECRET="seu_jwt_secret_super_seguro_aqui_com_pelo_menos_32_caracteres"
NODE_ENV="development"
PORT="3000"
FRONTEND_URL="http://localhost:3000"
```

### 3. Executar migrations do Prisma

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Iniciar o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Estrutura do Projeto

```
src/
├── app.js                 # Arquivo principal
├── config/
│   └── database.js        # Configuração do Prisma
├── middleware/
│   ├── auth.js           # Middleware de autenticação
│   ├── errorHandler.js   # Tratamento de erros
│   └── upload.js         # Upload de arquivos
├── routes/
│   ├── auth.js           # Rotas de autenticação
│   ├── usuarios.js       # Rotas de usuários
│   ├── itens.js          # Rotas de itens
│   ├── propostas.js      # Rotas de propostas
│   └── upload.js         # Rotas de upload
├── validators/
│   └── schemas.js        # Schemas de validação
├── utils/
│   └── cpfValidator.js   # Validador de CPF
├── services/
│   └── emailService.js   # Serviço de email
└── tests/
    └── auth.test.js      # Testes de autenticação
```

## API Endpoints

### Autenticação

```
POST   /api/auth/registro     # Criar conta
POST   /api/auth/login        # Fazer login
```

### Usuários (protegidas)

```
GET    /api/usuarios/perfil   # Obter perfil
PUT    /api/usuarios/perfil   # Atualizar perfil
GET    /api/usuarios          # Listar usuários
```

### Itens (protegidas)

```
GET    /api/itens             # Listar itens (com filtros)
GET    /api/itens/:id         # Obter item por ID
POST   /api/itens             # Criar item
PUT    /api/itens/:id         # Atualizar item
DELETE /api/itens/:id         # Deletar item
GET    /api/itens/meus/itens  # Meus itens
```

### Propostas (protegidas)

```
POST   /api/propostas         # Criar proposta
GET    /api/propostas/feitas  # Propostas feitas
GET    /api/propostas/recebidas # Propostas recebidas
PUT    /api/propostas/:id/status # Aceitar/rejeitar
DELETE /api/propostas/:id     # Cancelar proposta
```

### Upload (protegidas)

```
POST   /api/upload/imagem     # Upload de imagem
```

## Segurança Implementada

- **Rate Limiting**: Limitação de requisições por IP
- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origem cruzada
- **JWT**: Tokens seguros para autenticação
- **bcrypt**: Hash seguro de senhas
- **Validação rigorosa**: Validação de todos os inputs
- **Autorização**: Verificação de permissões

## Validações

- **CPF**: Validação de formato e dígitos verificadores
- **Email**: Formato válido e unicidade
- **Senhas**: Mínimo 6 caracteres
- **Uploads**: Apenas imagens, máximo 5MB
- **Dados obrigatórios**: Validação de campos requeridos

## Tratamento de Erros

- Middleware global de tratamento de erros
- Respostas padronizadas
- Logging de erros
- Códigos HTTP apropriados

## Testes

Execute os testes com:

```bash
npm test
```

## Deploy

1. Configure as variáveis de ambiente no servidor
2. Execute as migrations: `npm run prisma:migrate`
3. Inicie o servidor: `npm start`

## Melhorias Futuras

- [ ] Sistema de notificações em tempo real
- [ ] Avaliação de usuários
- [ ] Chat interno
- [ ] Geolocalização
- [ ] Integração com serviços de email
- [ ] Cache com Redis
- [ ] Logs estruturados
- [ ] Monitoramento e métricas
- [ ] Backup automático do banco
- [ ] API de terceiros para validação de CPF

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.