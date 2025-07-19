//Rotas de usuários

const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const schemas = require('../validators/schemas');
const router = express.Router();

// Obter perfil do usuário logado
router.get('/perfil', async (req, res, next) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { cpf: req.user.cpf },
      select: {
        cpf: true,
        nome: true,
        email: true,
        endereco: true,
        _count: {
          select: {
            itens: true,
            propostasFeitas: true,
            propostasRecebidas: true
          }
        }
      }
    });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

// Atualizar perfil
router.put('/perfil', async (req, res, next) => {
  try {
    const { error, value } = schemas.atualizarUsuario.validate(req.body);
    if (error) return next(error);

    // Verificar se email já existe (se estiver sendo alterado)
    if (value.email) {
      const emailExiste = await prisma.usuarios.findFirst({
        where: {
          email: value.email,
          cpf: { not: req.user.cpf }
        }
      });

      if (emailExiste) {
        return res.status(409).json({ error: 'Email já está em uso' });
      }
    }

    const usuarioAtualizado = await prisma.usuarios.update({
      where: { cpf: req.user.cpf },
      data: value,
      select: {
        cpf: true,
        nome: true,
        email: true,
        endereco: true
      }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      usuario: usuarioAtualizado
    });
  } catch (error) {
    next(error);
  }
});

// Listar todos os usuários (para fins de desenvolvimento/admin)
router.get('/', async (req, res, next) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        cpf: true,
        nome: true,
        email: true,
        endereco: true,
        _count: {
          select: {
            itens: true
          }
        }
      }
    });

    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

module.exports = router;