<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>🎯 Juego de Descuentos</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="game-content">
      <div class="game-container">
        
        <!-- Estado: Puede jugar -->
        <div v-if="canPlay && !gameResult" class="play-state">
          <div class="wheel-container">
            <!-- La ruleta -->
            <div 
              class="game-wheel" 
              :class="{ 'spinning': isSpinning }"
              :style="{ transform: `rotate(${currentRotation}deg)` }"
            >
              <!-- Secciones de la ruleta -->
              <div 
                v-for="(section, index) in wheelSections" 
                :key="index"
                class="wheel-section"
                :style="{ 
                  transform: `rotate(${index * sectionAngle}deg)`,
                  background: section.color
                }"
              >
                <div class="section-content">
                  <div class="prize-emoji">{{ section.emoji }}</div>
                  <div class="prize-text">{{ section.text }}</div>
                  <div class="prize-value">{{ section.value }}</div>
                </div>
              </div>
            </div>
            
            <!-- Indicador/Flecha -->
            <div class="wheel-indicator">
              <div class="indicator-arrow"></div>
            </div>
            
            <!-- Centro de la ruleta -->
            <div class="wheel-center">
              <div class="center-button">
                <ion-icon :icon="giftOutline" class="center-icon"></ion-icon>
              </div>
            </div>
          </div>
          
          <!-- Información del juego -->
          <div class="game-info">
            <h1>🍹 ¡Gira la Ruleta!</h1>
            <p>Consigue descuentos increíbles en tus bebidas</p>
            
            <!-- Premios disponibles -->
            <div class="available-prizes">
              <div class="prize-tag" v-for="prize in availablePrizes" :key="prize.id">
                {{ prize.emoji }} {{ prize.displayText }}
              </div>
            </div>
          </div>
          
          <!-- Botón de jugar -->
          <ion-button
            expand="block"
            size="large"
            @click="spinWheel"
            :disabled="isSpinning"
            class="spin-button"
          >
            <ion-icon :icon="playCircle" slot="start"></ion-icon>
            {{ isSpinning ? 'Girando...' : '¡GIRAR RULETA!' }}
          </ion-button>
          
          <!-- Loading durante el giro -->
          <div v-if="isSpinning" class="spinning-message">
            <div class="spinner-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <p>¡La ruleta está girando!</p>
          </div>
        </div>

        <!-- Estado: Ya jugó recientemente -->
        <div v-if="!canPlay && !gameResult" class="cooldown-state">
          <div class="cooldown-card">
            <div class="cooldown-emoji">⏰</div>
            <h2>¡Ya jugaste hoy!</h2>
            <p>Podrás volver a jugar en:</p>
            
            <!-- Contador regresivo -->
            <div class="countdown-timer">
              <div class="time-block">
                <span class="time-number">{{ formattedTime.hours }}</span>
                <span class="time-label">h</span>
              </div>
              <div class="time-separator">:</div>
              <div class="time-block">
                <span class="time-number">{{ formattedTime.minutes }}</span>
                <span class="time-label">m</span>
              </div>
              <div class="time-separator">:</div>
              <div class="time-block">
                <span class="time-number">{{ formattedTime.seconds }}</span>
                <span class="time-label">s</span>
              </div>
            </div>
            
            <!-- Mostrar último premio y código -->
            <div v-if="lastGameResult" class="last-result-section">
              <div class="last-prize-info">
                <h3>🎁 Tu último premio:</h3>
                <div class="prize-display">
                  <div class="prize-icon">
                    {{ lastGameResult.prize.discount === 100 ? '🍹' : '🎯' }}
                  </div>
                  <div class="prize-details">
                    <span class="prize-name">{{ lastGameResult.prize.name }}</span>
                    <span class="prize-discount">
                      {{ lastGameResult.prize.discount === 100 ? 'BEBIDA GRATIS' : `${lastGameResult.prize.discount}% DESCUENTO` }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="discount-code-display">
                <h4>💳 Tu código de descuento:</h4>
                <div class="code-container" @click="copyLastCode">
                  <span class="discount-code">{{ lastGameResult.discountCode }}</span>
                  <ion-icon :icon="copyOutline" class="copy-icon"></ion-icon>
                </div>
                <p class="code-expiry">
                  Válido hasta {{ formatExpiryTime(lastGameResult.playTime) }}
                </p>
              </div>
            </div>
            
            <ion-button 
              expand="block" 
              fill="outline"
              @click="goToValidation"
              class="validate-button"
            >
              <ion-icon :icon="qrCodeOutline" slot="start"></ion-icon>
              Validar mi descuento
            </ion-button>
          </div>
        </div>

        <!-- Resultado del juego -->
        <DiscountResult 
          v-if="gameResult" 
          :result="gameResult"
          @play-again="resetGame"
          @validate="goToValidation"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, toastController
} from '@ionic/vue';
import { playCircle, qrCodeOutline, giftOutline, copyOutline } from 'ionicons/icons';
import { GameLogic, GAME_CONFIG } from '../utils/gameLogic';
import DiscountResult from './DiscountResult.vue';

const router = useRouter();

// Estados reactivos
const canPlay = ref(true);
const isSpinning = ref(false);
const gameResult = ref(null);
const timeRemaining = ref(0);
const currentRotation = ref(0);
const lastGameResult = ref(null);

// Configuración de la ruleta - EXACTAMENTE sincronizada con GAME_CONFIG.PRIZES
const wheelSections = [
  { 
    id: 1, 
    discount: 10, 
    emoji: '🎯', 
    text: 'DESCUENTO', 
    value: '10%',
    color: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
    name: '10% descuento'
  },
  { 
    id: 2, 
    discount: 15, 
    emoji: '🎪', 
    text: 'DESCUENTO', 
    value: '15%',
    color: 'linear-gradient(135deg, #4ECDC4, #6EDDD6)',
    name: '15% descuento'
  },
  { 
    id: 3, 
    discount: 20, 
    emoji: '🎭', 
    text: 'DESCUENTO', 
    value: '20%',
    color: 'linear-gradient(135deg, #45B7D1, #67C5E3)',
    name: '20% descuento'
  },
  { 
    id: 4, 
    discount: 25, 
    emoji: '🎨', 
    text: 'DESCUENTO', 
    value: '25%',
    color: 'linear-gradient(135deg, #96CEB4, #A8D6C6)',
    name: '25% descuento'
  },
  { 
    id: 5, 
    discount: 100, 
    emoji: '🍹', 
    text: 'BEBIDA', 
    value: 'GRATIS',
    color: 'linear-gradient(135deg, #FFEAA7, #FFEBB9)',
    name: 'Cubata gratis'
  },
  { 
    id: 6, 
    discount: 0, 
    emoji: '😢', 
    text: 'SIN', 
    value: 'PREMIO',
    color: 'linear-gradient(135deg, #DDA0DD, #E6B2E6)',
    name: 'Sin premio'
  }
];

const sectionAngle = 360 / wheelSections.length; // 60 grados por sección

// Computed properties
const availablePrizes = computed(() => 
  wheelSections.filter(section => section.discount > 0)
    .map(section => ({
      id: section.id,
      emoji: section.emoji,
      displayText: section.value === 'GRATIS' ? 'Bebida Gratis' : `${section.value} OFF`
    }))
);

const formattedTime = computed(() => {
  const hours = Math.floor(timeRemaining.value);
  const minutes = Math.floor((timeRemaining.value - hours) * 60);
  const seconds = Math.floor(((timeRemaining.value - hours) * 60 - minutes) * 60);
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  };
});

let countdownInterval = null;

// Funciones principales
const checkGameState = () => {
  canPlay.value = GameLogic.canPlay();
  console.log('🔍 checkGameState - canPlay:', canPlay.value);
  
  if (!canPlay.value) {
    timeRemaining.value = GameLogic.getTimeUntilNextPlay();
    // Cargar el último resultado del juego
    lastGameResult.value = GameLogic.getLastGameResult();
    console.log('📋 lastGameResult cargado:', lastGameResult.value);
    startCountdown();
  }
};

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  
  countdownInterval = setInterval(() => {
    timeRemaining.value = GameLogic.getTimeUntilNextPlay();
    
    if (timeRemaining.value <= 0) {
      clearInterval(countdownInterval);
      canPlay.value = true;
    }
  }, 1000);
};

const spinWheel = async () => {
  if (!canPlay.value || isSpinning.value) return;
  
  console.log('🎯 Iniciando juego...');
  isSpinning.value = true;

  try {
    // 1. Seleccionar el premio usando la lógica de probabilidades
    const wonPrize = GameLogic.selectRandomPrize();
    console.log('🎁 Premio seleccionado:', wonPrize);
    
    // 2. Generar el código de descuento
    const discountCode = GameLogic.generateDiscountCode(wonPrize);
    console.log('💳 Código generado:', discountCode);
    
    // 3. Encontrar la sección EXACTA en la ruleta
    let targetSection = wheelSections.find(section => {
      return section.id === wonPrize.id && section.discount === wonPrize.discount;
    });
    
    if (!targetSection) {
      targetSection = wheelSections.find(section => 
        section.discount === wonPrize.discount
      );
      
      if (!targetSection) {
        console.error('❌ No se encontró sección para el premio:', wonPrize);
        throw new Error('No se encontró la sección del premio');
      }
      
      console.warn('⚠️ Usando sección fallback para premio:', wonPrize);
    }
    
    const targetIndex = wheelSections.indexOf(targetSection);
    console.log('🎯 Sección objetivo encontrada:', {
      index: targetIndex,
      section: targetSection,
      premio: wonPrize
    });
    
    // 4. CÁLCULO CORREGIDO de la rotación
    // La flecha apunta hacia arriba (0°)
    // Las secciones empiezan desde la posición 0 y van en sentido horario
    // Necesitamos que la flecha apunte al centro de la sección ganadora
    
    const extraSpins = 5 + Math.random() * 3; // Entre 5 y 8 vueltas completas
    
    // Ángulo donde empieza la sección objetivo
    const sectionStartAngle = targetIndex * sectionAngle;
    
    // Queremos apuntar al centro de la sección
    const sectionCenterAngle = sectionStartAngle + (sectionAngle / 2);
    
    // Para que la flecha (que apunta a 0°) apunte al centro de la sección,
    // necesitamos rotar la ruleta para que ese ángulo quede en 0°
    // Como la ruleta gira en sentido horario, restamos el ángulo objetivo
    const targetRotation = 360 - sectionCenterAngle;
    
    // Rotación total: vueltas extra + rotación objetivo
    const totalRotation = (extraSpins * 360) + targetRotation;
    
    console.log('🔄 Cálculo detallado:', {
      targetIndex,
      sectionStartAngle,
      sectionCenterAngle,
      targetRotation,
      totalRotation,
      extraSpins
    });
    
    // 5. Aplicar la rotación
    currentRotation.value += totalRotation;
    
    // 6. Esperar a que termine la animación y luego guardar/mostrar resultado
    setTimeout(() => {
      console.log('✅ Animación terminada');
      
      // Verificación final: calcular dónde apunta la flecha
      const finalAngle = currentRotation.value % 360;
      const normalizedAngle = (360 - finalAngle) % 360; // Invertir porque la ruleta gira al revés
      const pointedSectionIndex = Math.floor(normalizedAngle / sectionAngle);
      
      console.log('🔍 Verificación final:', {
        finalAngle,
        normalizedAngle,
        pointedSectionIndex,
        targetIndex,
        coincide: pointedSectionIndex === targetIndex
      });
      
      // GUARDAR el resultado en localStorage
      GameLogic.saveGameResult(wonPrize, discountCode);
      
      // MOSTRAR resultado al usuario
      gameResult.value = {
        ...wonPrize,
        discountCode,
        timestamp: new Date()
      };
      
      canPlay.value = false;
      isSpinning.value = false;
      
      console.log('🎉 Resultado final mostrado:', gameResult.value);
    }, 4000);
    
  } catch (error) {
    console.error('❌ Error en el juego:', error);
    isSpinning.value = false;
    resetGame();
  }
};

const resetGame = () => {
  console.log('🔄 Reseteando juego...');
  gameResult.value = null;
  isSpinning.value = false;
  currentRotation.value = 0;
  checkGameState();
};

const goToValidation = () => {
  console.log('🔄 Navegando a validación...');
  router.push('/validate');
};

const copyLastCode = async () => {
  if (!lastGameResult.value?.discountCode) return;
  
  try {
    await navigator.clipboard.writeText(lastGameResult.value.discountCode);
    
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

const formatExpiryTime = (playTimestamp) => {
  const expiryTime = new Date(playTimestamp + (2 * 60 * 60 * 1000)); // +2 horas
  return expiryTime.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Lifecycle hooks
onMounted(() => {
  console.log('🚀 Componente montado');
  checkGameState();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
/* Fondo y contenedor principal */
.game-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.play-state, .cooldown-state {
  text-align: center;
  width: 100%;
  max-width: 450px;
}

/* RULETA */
.wheel-container {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 0 auto 30px;
}

.game-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  border: 8px solid #ffffff;
  box-shadow: 
    0 0 30px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  /* Transición suave y realista */
  transition: transform 4s cubic-bezier(0.23, 1, 0.320, 1);
  transform-origin: center center;
}

.game-wheel.spinning {
  /* Aplicar la misma transición durante el giro */
  transition: transform 4s cubic-bezier(0.23, 1, 0.320, 1);
}

/* Secciones de la ruleta */
.wheel-section {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  /* Crear forma triangular para cada sección */
  clip-path: polygon(0 0, 0 100%, 86.6% 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.section-content {
  /* Rotar el contenido para que esté legible */
  transform: rotate(30deg) translateY(-50px);
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-weight: bold;
}

.prize-emoji {
  font-size: 24px;
  margin-bottom: 5px;
}

.prize-text {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.prize-value {
  font-size: 14px;
  font-weight: 900;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
}

/* Indicador/Flecha */
.wheel-indicator {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

.indicator-arrow {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 40px solid #ff4757;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
  position: relative;
}

.indicator-arrow::after {
  content: '';
  position: absolute;
  top: -35px;
  left: -16px;
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 30px solid #ffffff;
}

/* Centro de la ruleta */
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
}

.center-button {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 6px solid white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.center-button:hover {
  transform: scale(1.1);
}

.center-icon {
  font-size: 32px;
  color: white;
}

/* Información del juego */
.game-info {
  color: white;
  margin-bottom: 30px;
}

.game-info h1 {
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
  font-weight: 800;
}

.game-info p {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Premios disponibles */
.available-prizes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.prize-tag {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.4);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Botón de girar */
.spin-button {
  --background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  --background-hover: linear-gradient(45deg, #ff5252, #e57373);
  --color: white;
  font-weight: bold;
  font-size: 20px;
  height: 65px;
  --border-radius: 32px;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.spin-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.7);
}

.spin-button:disabled {
  --background: #cccccc;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

/* Mensaje de giro */
.spinning-message {
  color: white;
  margin-top: 20px;
}

.spinner-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.dot {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: dotPulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.3s;
}

.dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.spinning-message p {
  font-size: 18px;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

/* ESTADO DE COOLDOWN */
.cooldown-state {
  color: white;
}

.cooldown-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 25px;
  padding: 40px 30px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.cooldown-emoji {
  font-size: 100px;
  margin-bottom: 25px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.cooldown-card h2 {
  font-size: 28px;
  margin-bottom: 15px;
  font-weight: 700;
}

.cooldown-card p {
  font-size: 18px;
  margin-bottom: 25px;
  opacity: 0.9;
}

/* Contador regresivo */
.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 35px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.25);
  padding: 15px 12px;
  border-radius: 15px;
  min-width: 65px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.time-number {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.time-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 5px;
  font-weight: 600;
}

.time-separator {
  font-size: 28px;
  font-weight: bold;
  opacity: 0.7;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 50% { opacity: 0.7; }
  51%, 100% { opacity: 0.3; }
}

.validate-button {
  --color: white;
  --border-color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  height: 55px;
  --border-radius: 27px;
  font-size: 16px;
}

/* SECCIÓN DE ÚLTIMO RESULTADO */
.last-result-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  margin: 25px 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.last-prize-info {
  margin-bottom: 20px;
}

.last-prize-info h3 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 700;
  text-align: center;
}

.prize-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.prize-icon {
  font-size: 40px;
}

.prize-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.prize-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
}

.prize-discount {
  font-size: 18px;
  font-weight: 800;
  color: #FFE066;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.discount-code-display {
  text-align: center;
}

.discount-code-display h4 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 700;
}

.code-container {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.code-container:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.discount-code {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
  word-break: break-all;
}

.copy-icon {
  font-size: 20px;
  opacity: 0.8;
}

.code-expiry {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
  font-style: italic;
}

/* RESPONSIVE */
@media (max-width: 480px) {
  .wheel-container {
    width: 280px;
    height: 280px;
  }
  
  .game-info h1 {
    font-size: 28px;
  }
  
  .game-info p {
    font-size: 16px;
  }
  
  .countdown-timer {
    gap: 8px;
  }
  
  .time-block {
    min-width: 55px;
    padding: 12px 8px;
  }
  
  .time-number {
    font-size: 24px;
  }
  
  .spin-button {
    font-size: 18px;
    height: 60px;
  }
}

@media (max-width: 360px) {
  .wheel-container {
    width: 250px;
    height: 250px;
  }
  
  .prize-emoji {
    font-size: 20px;
  }
  
  .prize-text {
    font-size: 10px;
  }
  
  .prize-value {
    font-size: 12px;
  }
}
</style>