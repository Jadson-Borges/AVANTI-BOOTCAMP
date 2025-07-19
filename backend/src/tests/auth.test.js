// src/tests/auth.test.js
const request = require('supertest');
const { generate } = require('cpf');
const prisma = require('../config/database'); // ajuste conforme seu caminho
const app = require('../app');

describe('Autenticação', () => {
  afterAll(async () => {
    await prisma.$disconnect(); // Boa prática para fechar a conexão do Prisma
  });

  test('Deve criar um novo usuário com CPF válido gerado', async () => {
    let cpfGerado;
    let usuarioExiste;

    // Gera CPF único
    do {
      cpfGerado = generate().replace(/\D/g, '');
      usuarioExiste = await prisma.usuarios.findFirst({
        where: { cpf: cpfGerado }
      });
    } while (usuarioExiste);

    const novoUsuario = {
      nome: 'Usuário Teste',
      email: `teste${Date.now()}@exemplo.com`,
      senha: '123456',
      cpf: cpfGerado,
      endereco: 'Rua Teste, 123'
    };

    const response = await request(app)
      .post('/api/auth/registro')
      .send(novoUsuario);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.usuario).toHaveProperty('cpf', novoUsuario.cpf);
    expect(response.body.usuario).not.toHaveProperty('senha');
  });
});
