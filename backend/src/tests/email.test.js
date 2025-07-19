const EmailService = require('../services/email.service');

// Mock da função enviarEmail
jest.mock('../services/email.service', () => ({
  enviarEmail: jest.fn()
}));

describe('Serviço de Email', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve enviar um email de teste com sucesso', async () => {
    const emailPayload = {
      to: 'teste@exemplo.com',
      subject: 'Teste',
      text: 'Esse é um teste de envio.'
    };

    // Configura o retorno simulado
    EmailService.enviarEmail.mockResolvedValue('mocked-id');

    const resultado = await EmailService.enviarEmail(emailPayload);

    // Verifica se a função foi chamada com os dados certos
    expect(EmailService.enviarEmail).toHaveBeenCalledWith(emailPayload);
    expect(resultado).toBe('mocked-id');
  });

  it('deve lançar erro ao falhar no envio de email', async () => {
    const emailPayload = {
      to: 'falha@exemplo.com',
      subject: 'Erro',
      text: 'Teste de falha'
    };

    // Simula uma falha no envio
    EmailService.enviarEmail.mockRejectedValue(new Error('Falha no envio'));

    // Verifica se a exceção é capturada corretamente
    await expect(EmailService.enviarEmail(emailPayload))
      .rejects
      .toThrow('Falha no envio');

    expect(EmailService.enviarEmail).toHaveBeenCalledWith(emailPayload);
  });

});
