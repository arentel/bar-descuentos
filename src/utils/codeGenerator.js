import CryptoJS from 'crypto-js';

// Clave secreta (en producción debería estar en variables de entorno)
const SECRET_KEY = 'your-secret-key-2024';

// Duración de validez del código en minutos
const CODE_VALIDITY_MINUTES = 15;

// Generar código de descuento seguro
export const generateDiscountCode = (discount) => {
  const timestamp = Date.now();
  const expirationTime = timestamp + (CODE_VALIDITY_MINUTES * 60 * 1000);
  
  // Crear payload con información del descuento
  const payload = {
    discount: discount,
    timestamp: timestamp,
    expires: expirationTime,
    random: Math.random().toString(36).substring(2, 15)
  };
  
  // Crear hash del payload
  const payloadString = JSON.stringify(payload);
  const hash = CryptoJS.HmacSHA256(payloadString, SECRET_KEY).toString();
  
  // Combinar payload y hash
  const fullCode = {
    payload: payload,
    signature: hash
  };
  
  // Codificar en Base64 para facilitar el uso
  const codeString = btoa(JSON.stringify(fullCode));
  
  // Crear código más legible (6 caracteres)
  const shortCode = codeString.substring(0, 6).toUpperCase();
  
  return {
    code: shortCode,
    fullCode: codeString,
    discount: discount,
    expiresAt: expirationTime,
    validFor: CODE_VALIDITY_MINUTES
  };
};

// Validar código de descuento
export const validateDiscountCode = (inputCode, fullCode) => {
  try {
    // Decodificar el código completo
    const decodedCode = JSON.parse(atob(fullCode));
    const { payload, signature } = decodedCode;
    
    // Verificar que el código ingresado coincida
    const expectedShortCode = btoa(JSON.stringify(decodedCode)).substring(0, 6).toUpperCase();
    if (inputCode.toUpperCase() !== expectedShortCode) {
      return {
        valid: false,
        reason: 'Código incorrecto'
      };
    }
    
    // Verificar la firma
    const payloadString = JSON.stringify(payload);
    const expectedHash = CryptoJS.HmacSHA256(payloadString, SECRET_KEY).toString();
    
    if (signature !== expectedHash) {
      return {
        valid: false,
        reason: 'Código alterado o inválido'
      };
    }
    
    // Verificar expiración
    const now = Date.now();
    if (now > payload.expires) {
      return {
        valid: false,
        reason: 'Código expirado'
      };
    }
    
    return {
      valid: true,
      discount: payload.discount,
      expiresAt: payload.expires,
      timeRemaining: payload.expires - now
    };
    
  } catch (error) {
    return {
      valid: false,
      reason: 'Código malformado'
    };
  }
};

// Formatear tiempo de expiración
export const formatExpirationTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};