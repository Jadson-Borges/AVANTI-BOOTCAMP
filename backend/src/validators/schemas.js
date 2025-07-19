//Schemas de validação
const Joi = require('joi');

// Regex para validação de CPF (11 dígitos)
const cpfPattern = /^\d{11}$/;

const schemas = {
  // ========================================
  // Schemas de Usuário
  // ========================================
  criarUsuario: Joi.object({
    cpf: Joi.string()
      .pattern(cpfPattern)
      .required()
      .messages({
        'string.pattern.base': 'CPF deve conter exatamente 11 dígitos numéricos',
        'any.required': 'CPF é obrigatório'
      }),
    nome: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    email: Joi.string()
      .email()
      .max(100)
      .lowercase()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'string.max': 'Email deve ter no máximo 100 caracteres',
        'any.required': 'Email é obrigatório'
      }),
    senha: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 100 caracteres',
        'any.required': 'Senha é obrigatória'
      }),
    endereco: Joi.string()
      .min(5)
      .max(200)
      .trim()
      .required()
      .messages({
        'string.min': 'Endereço deve ter pelo menos 5 caracteres',
        'string.max': 'Endereço deve ter no máximo 200 caracteres',
        'any.required': 'Endereço é obrigatório'
      })
  }),

  atualizarUsuario: Joi.object({
    nome: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .optional(),
    email: Joi.string()
      .email()
      .max(100)
      .lowercase()
      .optional(),
    endereco: Joi.string()
      .min(5)
      .max(200)
      .trim()
      .optional()
  }).min(1), // Pelo menos um campo deve ser fornecido

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    senha: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha é obrigatória'
      })
  }),

  // ========================================
  // Schemas de Item
  // ========================================
  criarItem: Joi.object({
    nome: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'Nome do item deve ter pelo menos 2 caracteres',
        'string.max': 'Nome do item deve ter no máximo 100 caracteres',
        'any.required': 'Nome do item é obrigatório'
      }),
    descricao: Joi.string()
      .min(5)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'Descrição deve ter pelo menos 5 caracteres',
        'string.max': 'Descrição deve ter no máximo 100 caracteres',
        'any.required': 'Descrição é obrigatória'
      }),
    categoria: Joi.string()
      .max(50)
      .trim()
      .optional()
      .allow('')
      .messages({
        'string.max': 'Categoria deve ter no máximo 50 caracteres'
      }),
    imagem: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'URL da imagem deve ser válida'
      })
  }),

  atualizarItem: Joi.object({
    nome: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .optional(),
    descricao: Joi.string()
      .min(5)
      .max(100)
      .trim()
      .optional(),
    categoria: Joi.string()
      .max(50)
      .trim()
      .optional()
      .allow(''),
    imagem: Joi.string()
      .uri()
      .optional()
      .allow(''),
    status_item: Joi.boolean()
      .optional()
  }).min(1), // Pelo menos um campo deve ser fornecido

  // ========================================
  // Schemas de Proposta
  // ========================================
  criarProposta: Joi.object({
    item_ofertado: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Item ofertado deve ser um número',
        'number.integer': 'Item ofertado deve ser um número inteiro',
        'number.positive': 'Item ofertado deve ser um número positivo',
        'any.required': 'Item ofertado é obrigatório'
      }),
    item_desejado: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Item desejado deve ser um número',
        'number.integer': 'Item desejado deve ser um número inteiro',
        'number.positive': 'Item desejado deve ser um número positivo',
        'any.required': 'Item desejado é obrigatório'
      })
  }),

  atualizarStatusProposta: Joi.object({
    status_proposta: Joi.string()
      .valid('pendente', 'aceita', 'rejeitada')
      .required()
      .messages({
        'any.only': 'Status deve ser: pendente, aceita ou rejeitada',
        'any.required': 'Status da proposta é obrigatório'
      })
  }),

  // ========================================
  // Schemas de Query Parameters
  // ========================================
  queryItens: Joi.object({
    categoria: Joi.string().trim().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    search: Joi.string().trim().max(100).optional()
  }),

  queryPropostas: Joi.object({
    status: Joi.string().valid('pendente', 'aceita', 'rejeitada').optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional()
  })
};

module.exports = schemas;