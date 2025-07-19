//Rotas de propostas

const express = require('express');
const prisma = require('../config/database');
const schemas = require('../validators/schemas');
const router = express.Router();

// Criar nova proposta
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = schemas.criarProposta.validate(req.body);
    if (error) return next(error);

    const { item_ofertado, item_desejado } = value;

    // Verificar se os itens existem
    const [itemOfertado, itemDesejado] = await Promise.all([
      prisma.itens.findUnique({ where: { id_item: item_ofertado } }),
      prisma.itens.findUnique({ where: { id_item: item_desejado } })
    ]);

    if (!itemOfertado) {
      return res.status(404).json({ error: 'Item ofertado não encontrado' });
    }

    if (!itemDesejado) {
      return res.status(404).json({ error: 'Item desejado não encontrado' });
    }

    // Verificar se o item ofertado pertence ao usuário
    if (itemOfertado.cpf_dono !== req.user.cpf) {
      return res.status(403).json({ error: 'Você só pode oferecer seus próprios itens' });
    }

    // Verificar se não está tentando trocar com si mesmo
    if (itemDesejado.cpf_dono === req.user.cpf) {
      return res.status(400).json({ error: 'Não é possível fazer proposta para seus próprios itens' });
    }

    // Verificar se já existe uma proposta similar
    const propostaExiste = await prisma.proposta.findFirst({
      where: {
        item_ofertado,
        item_desejado,
        cpf_proponente: req.user.cpf,
        status_proposta: 'pendente'
      }
    });

    if (propostaExiste) {
      return res.status(409).json({ error: 'Já existe uma proposta pendente para estes itens' });
    }

    const proposta = await prisma.proposta.create({
      data: {
        item_ofertado,
        item_desejado,
        cpf_proponente: req.user.cpf,
        cpf_dono_item: itemDesejado.cpf_dono
      },
      include: {
        itemOfertado: true,
        itemDesejado: true,
        proponente: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        },
        DonoItem: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Proposta criada com sucesso',
      proposta
    });
  } catch (error) {
    next(error);
  }
});

// Listar propostas feitas pelo usuário
router.get('/feitas', async (req, res, next) => {
  try {
    const propostas = await prisma.proposta.findMany({
      where: { cpf_proponente: req.user.cpf },
      include: {
        itemOfertado: true,
        itemDesejado: true,
        DonoItem: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      },
      orderBy: { id_proposta: 'desc' }
    });

    res.json(propostas);
  } catch (error) {
    next(error);
  }
});

// Listar propostas recebidas pelo usuário
router.get('/recebidas', async (req, res, next) => {
  try {
    const propostas = await prisma.proposta.findMany({
      where: { cpf_dono_item: req.user.cpf },
      include: {
        itemOfertado: true,
        itemDesejado: true,
        proponente: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      },
      orderBy: { id_proposta: 'desc' }
    });

    res.json(propostas);
  } catch (error) {
    next(error);
  }
});

// Atualizar status da proposta (apenas o dono do item pode aceitar/rejeitar)
router.put('/:id/status', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { error, value } = schemas.atualizarStatusProposta.validate(req.body);
    if (error) return next(error);

    const { status_proposta } = value;

    // Verificar se a proposta existe
    const proposta = await prisma.proposta.findUnique({
      where: { id_proposta: id }
    });

    if (!proposta) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Verificar se o usuário é o dono do item desejado
    if (proposta.cpf_dono_item !== req.user.cpf) {
      return res.status(403).json({ error: 'Sem permissão para alterar esta proposta' });
    }

    // Verificar se a proposta está pendente
    if (proposta.status_proposta !== 'pendente') {
      return res.status(400).json({ error: 'Esta proposta já foi processada' });
    }

    const propostaAtualizada = await prisma.proposta.update({
      where: { id_proposta: id },
      data: { status_proposta },
      include: {
        itemOfertado: true,
        itemDesejado: true,
        proponente: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        },
        DonoItem: {
          select: {
            cpf: true,
            nome: true,
            endereco: true
          }
        }
      }
    });

    res.json({
      message: `Proposta ${status_proposta} com sucesso`,
      proposta: propostaAtualizada
    });
  } catch (error) {
    next(error);
  }
});

// Cancelar proposta (apenas o proponente pode cancelar)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar se a proposta existe
    const proposta = await prisma.proposta.findUnique({
      where: { id_proposta: id }
    });

    if (!proposta) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Verificar se o usuário é o proponente
    if (proposta.cpf_proponente !== req.user.cpf) {
      return res.status(403).json({ error: 'Sem permissão para cancelar esta proposta' });
    }

    // Verificar se a proposta está pendente
    if (proposta.status_proposta !== 'pendente') {
      return res.status(400).json({ error: 'Só é possível cancelar propostas pendentes' });
    }

    await prisma.proposta.delete({
      where: { id_proposta: id }
    });

    res.json({ message: 'Proposta cancelada com sucesso' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;