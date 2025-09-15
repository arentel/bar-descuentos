// src/utils/gameLogic.js
export const GAME_CONFIG = {
  COOLDOWN_HOURS: 24,
  STORAGE_KEY: 'discount_game_data',
  PRIZES: [
    { id: 1, name: '10% descuento', discount: 10, probability: 0.3 },
    { id: 2, name: '15% descuento', discount: 15, probability: 0.25 },
    { id: 3, name: '20% descuento', discount: 20, probability: 0.2 },
    { id: 4, name: '25% descuento', discount: 25, probability: 0.15 },
    { id: 5, name: 'Cubata gratis', discount: 100, probability: 0.05 },
    { id: 6, name: 'Sin premio', discount: 0, probability: 0.05 }
  ]
};

export class GameLogic {
  static canPlay() {
    const data = this.getGameData();
    if (!data.lastPlayTime) return true;
    
    const now = new Date().getTime();
    const timeDiff = now - data.lastPlayTime;
    const hoursPassed = timeDiff / (1000 * 60 * 60);
    
    return hoursPassed >= GAME_CONFIG.COOLDOWN_HOURS;
  }

  static getTimeUntilNextPlay() {
    const data = this.getGameData();
    if (!data.lastPlayTime) return 0;
    
    const now = new Date().getTime();
    const timeDiff = now - data.lastPlayTime;
    const hoursPassed = timeDiff / (1000 * 60 * 60);
    const hoursRemaining = GAME_CONFIG.COOLDOWN_HOURS - hoursPassed;
    
    return Math.max(0, hoursRemaining);
  }

  // IMPORTANTE: Esta función NO debe llamar a playGame internamente
  static selectRandomPrize() {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of GAME_CONFIG.PRIZES) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }

    return GAME_CONFIG.PRIZES[GAME_CONFIG.PRIZES.length - 1];
  }

  // Esta función guarda el resultado después de que se determine
  static saveGameResult(prize, discountCode) {
    const currentData = this.getGameData();
    const existingValidCodes = currentData.validCodes || [];
    
    const gameData = {
      ...currentData,
      lastPlayTime: new Date().getTime(),
      lastPrize: prize,
      lastDiscountCode: discountCode,
      validCodes: [...existingValidCodes, discountCode].filter(Boolean),
      gamesPlayed: (currentData.gamesPlayed || 0) + 1
    };

    this.saveGameData(gameData);
    console.log('💾 Resultado guardado:', gameData);
    
    return gameData;
  }

  static getGameData() {
    try {
      const data = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading game data:', error);
      return {};
    }
  }

  static saveGameData(data) {
    try {
      localStorage.setItem(GAME_CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  static getLastGameResult() {
    const data = this.getGameData();
    if (!data.lastPrize || !data.lastDiscountCode) return null;
    
    return {
      prize: data.lastPrize,
      discountCode: data.lastDiscountCode,
      playTime: data.lastPlayTime
    };
  }

  static generateDiscountCode(prize) {
    if (prize.discount === 0) return null;
    
    const timestamp = new Date().getTime();
    const timestampB36 = timestamp.toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Crear firma
    const secretKey = 'BAR_DESCUENTOS_SECRET_2024';
    const dataToSign = `${prize.discount}-${timestamp}-${random.toLowerCase()}`;
    
    let hash = 0;
    for (let i = 0; i < (dataToSign + secretKey).length; i++) {
      const char = (dataToSign + secretKey).charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const signature = Math.abs(hash).toString(36).substring(0, 4).toUpperCase();
    const discountCode = `${prize.discount}${timestampB36}${random}${signature}`;
    
    return discountCode;
  }

  static isValidGeneratedCode(code) {
    const data = this.getGameData();
    const validCodes = data.validCodes || [];
    return validCodes.includes(code);
  }

  static validateDiscountCode(code, currentTime = new Date().getTime()) {
    if (!code || code.length < 15) {
      console.log('❌ Código muy corto o vacío');
      return false;
    }
    
    try {
      console.log('🔍 Validando código:', code);
      
      // 1. Verificar que esté en nuestra lista de códigos válidos
      if (!this.isValidGeneratedCode(code)) {
        console.log('❌ Código no está en la lista de códigos válidos generados');
        return false;
      }
      
      // 2. Extraer y verificar descuento
      const discountMatch = code.match(/^(\d+)/);
      if (!discountMatch) {
        console.log('❌ Formato de código inválido');
        return false;
      }
      
      const discount = parseInt(discountMatch[1]);
      const validDiscounts = [10, 15, 20, 25, 100];
      if (!validDiscounts.includes(discount)) {
        console.log('❌ Descuento no válido:', discount);
        return false;
      }
      
      // 3. Verificar expiración
      const restOfCode = code.substring(discount.toString().length);
      const withoutSignature = restOfCode.slice(0, -4);
      
      for (let timestampLength = 8; timestampLength <= 9; timestampLength++) {
        if (withoutSignature.length >= timestampLength) {
          const timestampB36 = withoutSignature.substring(0, timestampLength);
          const timestamp = parseInt(timestampB36, 36);
          
          if (!isNaN(timestamp) && timestamp > 0) {
            const timeDiff = currentTime - timestamp;
            const hoursOld = timeDiff / (1000 * 60 * 60);
            
            if (hoursOld >= 0 && hoursOld <= 2) {
              console.log('✅ Código válido');
              return true;
            } else {
              console.log('❌ Código expirado. Horas:', hoursOld);
              return false;
            }
          }
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error validating code:', error);
      return false;
    }
  }

  static markCodeAsUsed(code) {
    const data = this.getGameData();
    const usedCodes = data.usedCodes || [];
    
    if (!usedCodes.includes(code)) {
      usedCodes.push(code);
      this.saveGameData({
        ...data,
        usedCodes: usedCodes
      });
    }
  }

  static isCodeUsed(code) {
    const data = this.getGameData();
    const usedCodes = data.usedCodes || [];
    return usedCodes.includes(code);
  }
}