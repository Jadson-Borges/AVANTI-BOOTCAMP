// routes/email.route.js
const express = require('express');
const router = express.Router();
const EmailService = require('../services/email.service'); // ajuste se sua estrutura for diferente

const emailService = new EmailService();

router.post('/enviar', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Campos "to", "subject" e "html" são obrigatórios.' });
  }

  try {
    const info = await emailService.enviarEmail(to, subject, html);
    res.status(200).json({ message: 'Email enviado com sucesso!', messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar e-mail.', details: error.message });
  }
});

module.exports = router;
