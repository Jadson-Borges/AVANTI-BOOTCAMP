//Arquivo principal
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Importar rotas
const emailRoutes = require('./routes/email.route');
const authRoutes = require('./routes/auth.route');
const usuarioRoutes = require('./routes/usuarios.route');
const itemRoutes = require('./routes/itens.route');
const propostaRoutes = require('./routes/propostas.route');
const uploadRoutes = require('./routes/upload.route');

const app = express();

// ========================================
// Middlewares de Segurança
// ========================================

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(helmet()); // Segurança HTTP
app.use(compression()); // Compressão gzip
app.use(morgan('combined')); // Logging

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// ========================================
// Rotas
// ========================================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Troca de Itens - Online',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Rotas públicas
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);

// Rotas protegidas
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/itens', authMiddleware, itemRoutes);
app.use('/api/propostas', authMiddleware, propostaRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

module.exports = app;