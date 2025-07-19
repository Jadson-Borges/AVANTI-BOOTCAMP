//Rotas de itens

const express = require('express');
const prisma = require('../config/database');
const schemas = require('../validators/schemas');
const router = express.Router();

// Listar todos os itens ativos
router.get('/', async (req, res, next) => {
  try {
    const { categoria, page = 1, limit = 20, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      status_item: true,
      ...(categoria && { categoria }),
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { descricao: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [itens, total] = await Promise.all([
      prisma.itens.findMany({
        where,
        skip,
        take,
        include: {
          donoItem: {
            select: {
              cpf: true,
              nome: true,
              endereco: true
            }
          }
        },
        orderBy: { id_item: 'desc' }
      }),
      prisma.itens.count({ where })
    ]);

    res.json({
      itens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter item por ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const item = await prisma.itens.findUnique({
      where: { id_item: id },
      include: {
        donoItem: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Criar novo item
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schemas.criarItem.validate(req.body);
    if (error) return next(error);

    const item = await prisma.itens.create({
      data: {
        ...value,
        cpf_dono: req.user.cpf
      },
      include: {
        donoItem: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Item criado com sucesso',
      item
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar item (apenas o dono pode atualizar)
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { error, value } = schemas.atualizarItem.validate(req.body);
    if (error) return next(error);

    // Verificar se o item existe e pertence ao usuário
    const itemExistente = await prisma.itens.findUnique({
      where: { id_item: id }
    });

    if (!itemExistente) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (itemExistente.cpf_dono !== req.user.cpf) {
      return res.status(403).json({ error: 'Sem permissão para editar este item' });
    }

    const item = await prisma.itens.update({
      where: { id_item: id },
      data: value,
      include: {
        donoItem: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      }
    });

    res.json({
      message: 'Item atualizado com sucesso',
      item
    });
  } catch (error) {
    next(error);
  }
});

// Deletar item (apenas o dono pode deletar)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar se o item existe e pertence ao usuário
    const itemExistente = await prisma.itens.findUnique({
      where: { id_item: id }
    });

    if (!itemExistente) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (itemExistente.cpf_dono !== req.user.cpf) {
      return res.status(403).json({ error: 'Sem permissão para deletar este item' });
    }

    await prisma.itens.delete({
      where: { id_item: id }
    });

    res.json({ message: 'Item deletado com sucesso' });
  } catch (error) {
    next(error);
  }
});

// Listar meus itens
router.get('/meus/itens', async (req, res, next) => {
  try {
    const itens = await prisma.itens.findMany({
      where: { cpf_dono: req.user.cpf },
      orderBy: { id_item: 'desc' }
    });

    res.json(itens);
  } catch (error) {
    next(error);
  }
});

module.exports = router;