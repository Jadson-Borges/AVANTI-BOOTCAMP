//Validador de CPF

/**
 * Valida um CPF brasileiro
 * @param {string} cpf - CPF a ser validado (apenas números)
 * @returns {boolean} - true se válido, false se inválido
 */
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.toString().replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais (casos inválidos como 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    
    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
    
    // Verifica o primeiro dígito
    if (parseInt(cpf.charAt(9)) !== digitoVerificador1) {
      return false;
    }
    
    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
    
    // Verifica o segundo dígito
    return parseInt(cpf.charAt(10)) === digitoVerificador2;
  }
  
  /**
   * Formata um CPF para exibição
   * @param {string} cpf - CPF a ser formatado
   * @returns {string} - CPF formatado (XXX.XXX.XXX-XX)
   */
  function formatarCPF(cpf) {
    cpf = cpf.toString().replace(/\D/g, '');
    
    if (cpf.length !== 11) {
      return cpf;
    }
    
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  /**
   * Remove formatação do CPF
   * @param {string} cpf - CPF formatado
   * @returns {string} - CPF apenas com números
   */
  function limparCPF(cpf) {
    return cpf.toString().replace(/\D/g, '');
  }
  
  module.exports = {
    validarCPF,
    formatarCPF,
    limparCPF
  };