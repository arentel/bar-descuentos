<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>🎯 Validar Descuento</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="validation-content">
      <div class="validation-container">
        <div class="validation-card">
          <div class="validation-header">
            <div class="validation-icon">🔍</div>
            <h2>Validación de Descuento</h2>
            <p>Introduce el código obtenido en el juego</p>
          </div>

          <div class="input-section">
            <ion-item class="code-input">
              <ion-label position="stacked">Código de descuento</ion-label>
              <ion-input
                v-model="codeInput"
                placeholder="Ej: 15ABC123DEF456"
                :clear-input="true"
                @input="validateInput"
                :class="{ 'valid': isValidFormat, 'invalid': codeInput && !isValidFormat }"
              ></ion-input>
            </ion-item>
            
            <ion-button
              expand="block"
              @click="validateCode"
              :disabled="!codeInput || !isValidFormat || isValidating"
              class="validate-btn"
            >
              <ion-icon :icon="checkmarkCircle" slot="start"></ion-icon>
              {{ isValidating ? 'Validando...' : 'Validar Código' }}
            </ion-button>
          </div>

          <!-- Resultado de validación -->
          <div v-if="validationResult" class="result-section">
            <div 
              class="result-card"
              :class="{ 
                'valid-result': validationResult.isValid, 
                'invalid-result': !validationResult.isValid 
              }"
            >
              <div class="result-icon">
                {{ validationResult.isValid ? '✅' : '❌' }}
              </div>
              
              <h3>
                {{ validationResult.isValid ? '¡Código Válido!' : 'Código Inválido' }}
              </h3>
              
              <div v-if="validationResult.isValid" class="valid-details">
                <div class="discount-info">
                  <span class="discount-label">Descuento:</span>
                  <span class="discount-value">
                    {{ validationResult.discount === 100 ? 'BEBIDA GRATIS' : `${validationResult.discount}% OFF` }}
                  </span>
                </div>
                
                <div class="instructions">
                  <h4>📋 Instrucciones para el camarero:</h4>
                  <ol>
                    <li>Verificar que el código mostrado coincida: <strong>{{ validationResult.code }}</strong></li>
                    <li v-if="validationResult.discount === 100">
                      Ofrecer una bebida gratuita de la carta básica
                    </li>
                    <li v-else>
                      Aplicar descuento del {{ validationResult.discount }}% al pedido
                    </li>
                    <li>Marcar el descuento como usado en el sistema</li>
                  </ol>
                </div>

                <div class="security-info">
                  <h4>🔒 Información de seguridad:</h4>
                  <p><strong>Código:</strong> {{ validationResult.code }}</p>
                  <p><strong>Generado:</strong> {{ formatValidationTime(validationResult.generatedTime) }}</p>
                  <p><strong>Válido hasta:</strong> {{ formatValidationTime(validationResult.expiryTime) }}</p>
                </div>
              </div>
              
              <div v-else class="invalid-details">
                <p>{{ validationResult.reason }}</p>
                <ul>
                  <li>El código puede haber expirado (máximo 2 horas de validez)</li>
                  <li>El formato del código no es correcto</li>
                  <li>El código puede haber sido modificado</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="info-section">
            <ion-card class="info-card">
              <ion-card-header>
                <ion-card-title>ℹ️ Información</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ul class="info-list">
                  <li>Los códigos son válidos por <strong>2 horas</strong> desde su generación</li>
                  <li>Cada dispositivo puede jugar <strong>una vez cada 24 horas</strong></li>
                  <li>Los códigos son únicos e irrepetibles</li>
                  <li>Solo el personal autorizado puede validar descuentos</li>
                </ul>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonItem, IonLabel, IonInput,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { GameLogic } from '../utils/gameLogic';

const codeInput = ref('');
const isValidating = ref(false);
const validationResult = ref(null);

const isValidFormat = computed(() => {
  if (!codeInput.value) return false;
  // Formato básico: al menos 10 caracteres, comienza con números
  const formatRegex = /^\d+[A-Z0-9]{6,}$/;
  return formatRegex.test(codeInput.value.toUpperCase());
});

const validateInput = () => {
  // Convertir a mayúsculas automáticamente
  codeInput.value = codeInput.value.toUpperCase();
  validationResult.value = null;
};

const validateCode = async () => {
  if (!codeInput.value || !isValidFormat.value) return;
  
  isValidating.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    console.log('🔍 Iniciando validación:', codeInput.value);
    
    const currentTime = new Date().getTime();
    
    // Verificar si ya fue usado
    if (GameLogic.isCodeUsed(codeInput.value)) {
      validationResult.value = {
        isValid: false,
        code: codeInput.value,
        reason: 'Este código ya ha sido utilizado anteriormente.'
      };
      isValidating.value = false;
      return;
    }
    
    const isValid = GameLogic.validateDiscountCode(codeInput.value, currentTime);
    
    if (isValid) {
      const discountMatch = codeInput.value.match(/^(\d+)/);
      const discount = discountMatch ? parseInt(discountMatch[1]) : 0;
      
      // Extraer timestamp del código
      const restOfCode = codeInput.value.substring(discount.toString().length);
      const withoutSignature = restOfCode.slice(0, -4);
      
      let generatedTime = 0;
      for (let timestampLength = 8; timestampLength <= 9; timestampLength++) {
        if (withoutSignature.length >= timestampLength) {
          const timestampB36 = withoutSignature.substring(0, timestampLength);
          const possibleTime = parseInt(timestampB36, 36);
          if (!isNaN(possibleTime) && possibleTime > 0) {
            generatedTime = possibleTime;
            break;
          }
        }
      }
      
      const expiryTime = generatedTime + (2 * 60 * 60 * 1000);
      
      validationResult.value = {
        isValid: true,
        code: codeInput.value,
        discount: discount,
        generatedTime: generatedTime,
        expiryTime: expiryTime
      };
      
      // Marcar como usado
      GameLogic.markCodeAsUsed(codeInput.value);
      console.log('✅ Código validado y marcado como usado');
      
    } else {
      let reason = 'Este código no fue generado por nuestro sistema o ha sido modificado.';
      
      const discountMatch = codeInput.value.match(/^(\d+)/);
      if (discountMatch) {
        const discount = parseInt(discountMatch[1]);
        const validDiscounts = [10, 15, 20, 25, 100];
        if (!validDiscounts.includes(discount)) {
          reason = `Descuento ${discount}% no válido. Solo permitimos: 10%, 15%, 20%, 25% o bebida gratis.`;
        }
      }
      
      validationResult.value = {
        isValid: false,
        code: codeInput.value,
        reason: reason
      };
    }
  } catch (error) {
    console.error('Error validating code:', error);
    validationResult.value = {
      isValid: false,
      code: codeInput.value,
      reason: 'Error del sistema al validar el código'
    };
  }
  
  isValidating.value = false;
};

const formatValidationTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
</script>

<style scoped>
.validation-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.validation-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
}

.validation-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.validation-header {
  text-align: center;
  margin-bottom: 30px;
}

.validation-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.validation-header h2 {
  color: #333;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: bold;
}

.validation-header p {
  color: #666;
  font-size: 16px;
}

.input-section {
  margin-bottom: 30px;
}

.code-input {
  margin-bottom: 20px;
  --background: rgba(102, 126, 234, 0.1);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.code-input ion-input {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
}

.code-input.valid ion-input {
  --color: #2dd36f;
}

.code-input.invalid ion-input {
  --color: #eb445a;
}

.validate-btn {
  --background: linear-gradient(45deg, #4ecdc4, #44a08d);
  --background-hover: linear-gradient(45deg, #44a08d, #4ecdc4);
  --color: white;
  font-weight: bold;
  height: 55px;
  --border-radius: 27px;
  box-shadow: 0 4px 16px rgba(78, 205, 196, 0.4);
}

.validate-btn:disabled {
  --background: #ccc;
  box-shadow: none;
}

.result-section {
  margin-bottom: 30px;
}

.result-card {
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.valid-result {
  background: linear-gradient(135deg, #2dd36f, #2fdf75);
  color: white;
}

.invalid-result {
  background: linear-gradient(135deg, #eb445a, #f25454);
  color: white;
}

.result-icon {
  font-size: 50px;
  margin-bottom: 15px;
}

.result-card h3 {
  font-size: 22px;
  margin-bottom: 20px;
  font-weight: bold;
}

.valid-details, .invalid-details {
  text-align: left;
}

.discount-info {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
}

.discount-label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  opacity: 0.9;
}

.discount-value {
  font-size: 24px;
  font-weight: bold;
}

.instructions {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.instructions h4 {
  margin-bottom: 15px;
  font-size: 16px;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.security-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
}

.security-info h4 {
  margin-bottom: 10px;
  font-size: 14px;
}

.security-info p {
  margin-bottom: 5px;
  word-break: break-all;
}

.invalid-details p {
  margin-bottom: 15px;
  font-size: 16px;
}

.already-used-info, .general-error-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
  text-align: left;
}

.already-used-info h5, .general-error-info h5 {
  color: #FFE066;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: bold;
}

.already-used-info ul, .general-error-info ul {
  margin: 0;
  padding-left: 20px;
}

.already-used-info li, .general-error-info li {
  margin-bottom: 8px;
  line-height: 1.4;
  font-size: 14px;
}

.invalid-details ul {
  margin: 0;
  padding-left: 20px;
}

.invalid-details li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.info-section {
  margin-top: 20px;
}

.info-card {
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-list {
  margin: 0;
  padding-left: 20px;
}

.info-list li {
  margin-bottom: 8px;
  line-height: 1.4;
  color: #666;
}
</style>