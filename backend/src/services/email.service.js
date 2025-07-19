const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,    // <-- adicione esta linha
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
  }

  async enviarEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      });

      console.log('Email enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async notificarNovaProposta(emailDono, dadosProposta) {
    const html = `
      <h2>Nova Proposta Recebida!</h2>
      <p>Você recebeu uma nova proposta para seu item: <strong>${dadosProposta.itemDesejado.nome}</strong></p>
      <p>Item oferecido: <strong>${dadosProposta.itemOfertado.nome}</strong></p>
      <p>Proponente: <strong>${dadosProposta.proponente.nome}</strong></p>
      <p>Acesse o sistema para visualizar e responder à proposta.</p>
    `;

    return this.enviarEmail(emailDono, 'Nova Proposta Recebida', html);
  }

  async notificarStatusProposta(emailProponente, dadosProposta) {
    const status = dadosProposta.status_proposta === 'aceita' ? 'ACEITA' : 'REJEITADA';
    const html = `
      <h2>Proposta ${status}</h2>
      <p>Sua proposta para o item <strong>${dadosProposta.itemDesejado.nome}</strong> foi ${status.toLowerCase()}.</p>
      ${
        dadosProposta.status_proposta === 'aceita'
          ? '<p>Entre em contato com o dono do item para combinar a troca!</p>'
          : '<p>Não desanime! Continue procurando outros itens interessantes.</p>'
      }
    `;

    return this.enviarEmail(emailProponente, `Proposta ${status}`, html);
  }
}

module.exports = EmailService;
