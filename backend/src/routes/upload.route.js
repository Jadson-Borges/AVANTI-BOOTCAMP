//Rota para upload de imagens
const express = require('express');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Upload de imagem
router.post('/imagem', authMiddleware, upload.single('imagem'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Imagem enviada com sucesso',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
