//Tratamento de erros

const errorHandler = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', {
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  
    // Erro do Prisma - Violação de constraint única
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'campo';
      return res.status(409).json({
        error: `${field} já está em uso`,
        code: 'DUPLICATE_FIELD'
      });
    }
  
    // Erro do Prisma - Registro não encontrado
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro não encontrado',
        code: 'RECORD_NOT_FOUND'
      });
    }
  
    // Erro do Prisma - Violação de chave estrangeira
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Operação inválida - referência não encontrada',
        code: 'FOREIGN_KEY_VIOLATION'
      });
    }
  
    // Erro de validação do Joi
    if (err.isJoi) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: err.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        code: 'VALIDATION_ERROR'
      });
    }
  
    // Erro do Multer (upload)
    if (err instanceof multer.MulterError) {
      let message = 'Erro no upload do arquivo';
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Arquivo muito grande. Máximo 5MB permitido';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Muitos arquivos. Máximo 1 arquivo por vez';
      }
      
      return res.status(400).json({
        error: message,
        code: 'UPLOAD_ERROR'
      });
    }
  
    // Erro padrão
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: err.message || 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorHandler;