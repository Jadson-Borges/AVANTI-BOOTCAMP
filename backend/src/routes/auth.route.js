//Rotas de autenticação

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const schemas = require('../validators/schemas');
const router = express.Router();

// Rate limiting específico para auth
const authLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

// Registrar usuário
router.post('/registro', async (req, res, next) => {
  try {
    const { error, value } = schemas.criarUsuario.validate(req.body);
    if (error) return next(error);

    const { cpf, nome, email, senha, endereco } = value;

    // Verificar se usuário já existe
    const usuarioExiste = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { cpf: cpf },
          { email: email }
        ]
      }
    });

    if (usuarioExiste) {
      return res.status(409).json({ 
        error: usuarioExiste.cpf === cpf ? 'CPF já cadastrado' : 'Email já cadastrado'
      });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar usuário
    const usuario = await prisma.usuarios.create({
      data: {
        cpf,
        nome,
        email,
        senha: senhaHash,
        endereco
      },
      select: {
        cpf: true,
        nome: true,
        email: true,
        endereco: true
      }
    });

    // Gerar token
    const token = jwt.sign(
      { cpf: usuario.cpf },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { error, value } = schemas.login.validate(req.body);
    if (error) return next(error);

    const { email, senha } = value;

    // Buscar usuário
    const usuario = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { cpf: usuario.cpf },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      usuario: {
        cpf: usuario.cpf,
        nome: usuario.nome,
        email: usuario.email,
        endereco: usuario.endereco
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;