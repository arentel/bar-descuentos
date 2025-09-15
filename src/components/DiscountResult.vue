<template>
  <div class="result-container">
    <div class="result-card" :class="{ 'no-prize': result.discount === 0 }">
      <div class="result-icon">
        {{ result.discount > 0 ? '🎉' : '😢' }}
      </div>
      
      <h2 class="result-title">
        {{ result.discount > 0 ? '¡Felicidades!' : '¡Suerte para la próxima!' }}
      </h2>
      
      <div class="prize-info">
        <h3>{{ result.name }}</h3>
        <div v-if="result.discount > 0" class="discount-details">
          <div class="discount-percentage">
            {{ result.discount === 100 ? 'GRATIS' : `${result.discount}% OFF` }}
          </div>
        </div>
      </div>

      <div v-if="result.discountCode" class="discount-code-section">
        <p class="code-label">Código de descuento:</p>
        <div class="discount-code" @click="copyCode">
          <span>{{ result.discountCode }}</span>
          <ion-icon :icon="copyOutline" class="copy-icon"></ion-icon>
        </div>
        <p class="code-info">
          Válido hasta {{ formatExpiryTime() }}
        </p>
        <p class="code-instruction">
          📱 Muestra este código al camarero para aplicar tu descuento
        </p>
      </div>

      <div class="action-buttons">
        <ion-button 
          v-if="result.discount > 0"
          expand="block"
          @click="$emit('validate')"
          class="validate-button"
        >
          <ion-icon :icon="qrCode" slot="start"></ion-icon>
          Ir a validación
        </ion-button>
        
        <ion-button
          expand="block"
          fill="outline"
          @click="$emit('playAgain')"
          class="play-again-button"
        >
          <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
          Volver al inicio
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { IonButton, IonIcon, toastController } from '@ionic/vue';
import { qrCode, copyOutline, refreshOutline } from 'ionicons/icons';

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['playAgain', 'validate']);

const { result } = toRefs(props);

const formatExpiryTime = () => {
  const expiryTime = new Date(result.value.timestamp.getTime() + (2 * 60 * 60 * 1000)); // +2 horas
  return expiryTime.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const copyCode = async () => {
  if (!result.value.discountCode) return;
  
  try {
    await navigator.clipboard.writeText(result.value.discountCode);
    
    const toast = await toastController.create({
      message: '¡Código copiado al portapapeles!',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    
    await toast.present();
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    const toast = await toastController.create({
      message: 'No se pudo copiar el código',
      duration: 2000,
      position: 'top',
      color: 'warning'
    });
    
    await toast.present();
  }
};
</script>

<style scoped>
.result-container {
  width: 100%;
  max-width: 400px;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.result-card.no-prize {
  background: rgba(255, 255, 255, 0.9);
}

.result-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.result-title {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

.prize-info h3 {
  color: #555;
  font-size: 20px;
  margin-bottom: 15px;
}

.discount-details {
  margin-bottom: 30px;
}

.discount-percentage {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 15px 25px;
  border-radius: 50px;
  font-size: 24px;
  font-weight: bold;
  display: inline-block;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
}

.discount-code-section {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin: 25px 0;
}

.code-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.discount-code {
  background: #667eea;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.discount-code:hover {
  background: #5a67d8;
  transform: scale(1.02);
}

.copy-icon {
  font-size: 20px;
}

.code-info {
  color: #666;
  font-size: 12px;
  margin-bottom: 10px;
}

.code-instruction {
  color: #444;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 235, 59, 0.3);
  padding: 10px;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 25px;
}

.validate-button {
  --background: linear-gradient(45deg, #4ecdc4, #44a08d);
  --background-hover: linear-gradient(45deg, #44a08d, #4ecdc4);
  --color: white;
  font-weight: bold;
  height: 50px;
  --border-radius: 25px;
}

.play-again-button {
  --color: #667eea;
  --border-color: #667eea;
  font-weight: 500;
  height: 50px;
  --border-radius: 25px;
}
</style>