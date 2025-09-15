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
                :key="section.id"
                class="wheel-section"
                :style="{ 
                  transform: `rotate(${index * sectionAngle}deg)`,
                  '--section-color-1': section.colors.primary,
                  '--section-color-2': section.colors.secondary
                }"
                :data-section-id="section.id"
                :data-discount="section.discount"
              >
                <div class="section-content">
                  <div class="prize-emoji">{{ section.emoji }}</div>
                  <div class="prize-text">{{ section.text }}</div>
                  <div class="prize-value">{{ section.value }}</div>
                </div>
                <!-- Línea divisoria -->
                <div class="section-divider"></div>
              </div>
            </div>
            
            <!-- Indicador/Flecha moderna -->
            <div class="wheel-indicator">
              <div class="indicator-arrow">
                <div class="arrow-glow"></div>
              </div>
            </div>
            
            <!-- Centro de la ruleta mejorado -->
            <div class="wheel-center">
              <div class="center-button">
                <div class="center-rings">
                  <div class="ring ring-1"></div>
                  <div class="ring ring-2"></div>
                  <div class="ring ring-3"></div>
                </div>
                <ion-icon :icon="giftOutline" class="center-icon"></ion-icon>
              </div>
            </div>
          </div>
          
          <!-- Información del juego -->
          <div class="game-info">
            <h1>🎰 ¡Gira la Ruleta de la Suerte!</h1>
            <p>Descuentos increíbles te esperan</p>
            
            <!-- Premios disponibles con nueva presentación -->
            <div class="available-prizes">
              <div class="prizes-header">
                <span class="prizes-title">🎁 Premios disponibles:</span>
              </div>
              <div class="prizes-grid">
                <div class="prize-tag" v-for="prize in availablePrizes" :key="prize.id">
                  <span class="prize-emoji">{{ prize.emoji }}</span>
                  <span class="prize-text">{{ prize.displayText }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Botón de jugar mejorado -->
          <ion-button
            expand="block"
            size="large"
            @click="spinWheel"
            :disabled="isSpinning"
            class="spin-button"
          >
            <ion-icon :icon="playCircle" slot="start"></ion-icon>
            {{ isSpinning ? 'Girando...' : '¡GIRAR RULETA!' }}
            <div v-if="!isSpinning" class="button-shine"></div>
          </ion-button>
          
          <!-- Loading durante el giro con nueva animación -->
          <div v-if="isSpinning" class="spinning-message">
            <div class="spinner-container">
              <div class="spinner-wheel">
                <div class="spinner-segment" v-for="n in 8" :key="n"></div>
              </div>
            </div>
            <p>¡La suerte está en movimiento!</p>
            <div class="excitement-text">
              <span class="excitement-word" v-for="(word, index) in excitementWords" :key="index">{{ word }}</span>
            </div>
          </div>
        </div>

        <!-- Estado: Ya jugó recientemente -->
        <div v-if="!canPlay && !gameResult" class="cooldown-state">
          <div class="cooldown-card">
            <div class="cooldown-icon">
              <div class="clock-container">
                <div class="clock-face">
                  <div class="clock-hand hour-hand"></div>
                  <div class="clock-hand minute-hand"></div>
                </div>
              </div>
            </div>
            <h2>¡Ya jugaste hoy!</h2>
            <p>Tu próxima oportunidad de ganar en:</p>
            
            <!-- Contador regresivo moderno -->
            <div class="countdown-timer">
              <div class="time-block">
                <div class="time-circle">
                  <span class="time-number">{{ formattedTime.hours }}</span>
                </div>
                <span class="time-label">horas</span>
              </div>
              <div class="time-separator">:</div>
              <div class="time-block">
                <div class="time-circle">
                  <span class="time-number">{{ formattedTime.minutes }}</span>
                </div>
                <span class="time-label">minutos</span>
              </div>
              <div class="time-separator">:</div>
              <div class="time-block">
                <div class="time-circle">
                  <span class="time-number">{{ formattedTime.seconds }}</span>
                </div>
                <span class="time-label">segundos</span>
              </div>
            </div>
            
            <!-- Mostrar último premio y código -->
            <div v-if="lastGameResult" class="last-result-section">
              <div class="last-prize-info">
                <h3>🏆 Tu último premio:</h3>
                <div class="prize-display">
                  <div class="prize-icon-large">
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
                <h4>🎫 Tu código de descuento:</h4>
                <div class="code-container" @click="copyLastCode">
                  <span class="discount-code">{{ lastGameResult.discountCode }}</span>
                  <ion-icon :icon="copyOutline" class="copy-icon"></ion-icon>
                  <div class="copy-tooltip">Toca para copiar</div>
                </div>
                <p class="code-expiry">
                  ⏰ Válido hasta {{ formatExpiryTime(lastGameResult.playTime) }}
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
const excitementWords = ref(['¡Emocionante!', '¡Increíble!', '¡Fantástico!', '¡Genial!']);

// Configuración de la ruleta - EXACTAMENTE sincronizada con GAME_CONFIG.PRIZES
// IMPORTANTE: Cada sección tiene un ID único que debe coincidir exactamente con GameLogic
const wheelSections = [
  { 
    id: 1, 
    discount: 10, 
    emoji: '🎯', 
    text: 'DESCUENTO', 
    value: '10%',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FF8E8E'
    },
    name: '10% descuento'
  },
  { 
    id: 2, 
    discount: 15, 
    emoji: '🎪', 
    text: 'DESCUENTO', 
    value: '15%',
    colors: {
      primary: '#4ECDC4',
      secondary: '#6EDDD6'
    },
    name: '15% descuento'
  },
  { 
    id: 3, 
    discount: 20, 
    emoji: '🎭', 
    text: 'DESCUENTO', 
    value: '20%',
    colors: {
      primary: '#45B7D1',
      secondary: '#67C5E3'
    },
    name: '20% descuento'
  },
  { 
    id: 4, 
    discount: 25, 
    emoji: '🎨', 
    text: 'DESCUENTO', 
    value: '25%',
    colors: {
      primary: '#96CEB4',
      secondary: '#A8D6C6'
    },
    name: '25% descuento'
  },
  { 
    id: 5, 
    discount: 100, 
    emoji: '🍹', 
    text: 'BEBIDA', 
    value: 'GRATIS',
    colors: {
      primary: '#FFEAA7',
      secondary: '#FFEBB9'
    },
    name: 'Cubata gratis'
  },
  { 
    id: 6, 
    discount: 0, 
    emoji: '😢', 
    text: 'SIN', 
    value: 'PREMIO',
    colors: {
      primary: '#DDA0DD',
      secondary: '#E6B2E6'
    },
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
    console.log('🎁 Premio seleccionado por GameLogic:', wonPrize);
    
    // 2. Generar el código de descuento
    const discountCode = GameLogic.generateDiscountCode(wonPrize);
    console.log('💳 Código generado:', discountCode);
    
    // 3. BUSCAR LA SECCIÓN EXACTA EN LA RULETA USANDO EL ID
    // Es crítico que el premio tenga el mismo ID que una sección de la ruleta
    let targetSection = wheelSections.find(section => section.id === wonPrize.id);
    
    if (!targetSection) {
      // Fallback: buscar por discount si no encontramos por ID
      targetSection = wheelSections.find(section => section.discount === wonPrize.discount);
      console.warn('⚠️ No se encontró sección por ID, usando fallback por discount');
    }
    
    if (!targetSection) {
      console.error('❌ ERROR CRÍTICO: No se encontró sección para el premio:', wonPrize);
      console.error('Secciones disponibles:', wheelSections.map(s => ({ id: s.id, discount: s.discount })));
      throw new Error('No se encontró la sección del premio');
    }
    
    const targetIndex = wheelSections.indexOf(targetSection);
    console.log('🎯 SINCRONIZACIÓN:', {
      wonPrize: {
        id: wonPrize.id,
        discount: wonPrize.discount,
        name: wonPrize.name
      },
      targetSection: {
        id: targetSection.id,
        discount: targetSection.discount,
        name: targetSection.name,
        value: targetSection.value
      },
      targetIndex: targetIndex
    });
    
    // 4. CÁLCULO CORREGIDO DE LA ROTACIÓN
    // La flecha apunta hacia arriba (0°)
    // Necesitamos que la flecha apunte al CENTRO de la sección ganadora
    
    const extraSpins = 5 + Math.random() * 3; // Entre 5 y 8 vueltas completas
    
    // Cada sección ocupa sectionAngle grados (60°)
    // La primera sección (index 0) va de 0° a 60°, su centro está en 30°
    // La segunda sección (index 1) va de 60° a 120°, su centro está en 90°
    // etc.
    const sectionCenterAngle = (targetIndex * sectionAngle) + (sectionAngle / 2);
    
    // Para que la flecha (que apunta a 0°) apunte al centro de la sección,
    // necesitamos rotar la ruleta para que ese ángulo quede en 0°
    // Como rotamos en sentido horario, necesitamos ir hacia atrás
    const targetRotation = 360 - sectionCenterAngle;
    
    // Rotación total: vueltas extra + rotación objetivo
    const totalRotation = (extraSpins * 360) + targetRotation;
    
    console.log('🔄 Cálculo de rotación:', {
      targetIndex,
      sectionAngle,
      sectionCenterAngle,
      targetRotation,
      extraSpins,
      totalRotation,
      currentRotation: currentRotation.value
    });
    
    // 5. Aplicar la rotación
    currentRotation.value += totalRotation;
    
    // 6. Verificación inmediata del cálculo
    const finalAngle = currentRotation.value % 360;
    const normalizedAngle = (360 - finalAngle) % 360;
    const calculatedSectionIndex = Math.floor(normalizedAngle / sectionAngle);
    
    console.log('🔍 Verificación inmediata:', {
      finalAngle,
      normalizedAngle,
      calculatedSectionIndex,
      targetIndex,
      matches: calculatedSectionIndex === targetIndex,
      willPointTo: wheelSections[calculatedSectionIndex]?.value || 'UNKNOWN'
    });
    
    // 7. Esperar a que termine la animación y luego guardar/mostrar resultado
    setTimeout(() => {
      console.log('✅ Animación terminada');
      
      // Verificación final después de la animación
      const finalAngleAfter = currentRotation.value % 360;
      const normalizedAngleAfter = (360 - finalAngleAfter) % 360;
      const finalSectionIndex = Math.floor(normalizedAngleAfter / sectionAngle);
      const pointedSection = wheelSections[finalSectionIndex];
      
      console.log('🎯 Verificación FINAL:', {
        finalAngleAfter,
        normalizedAngleAfter,
        finalSectionIndex,
        pointedSection: pointedSection ? {
          id: pointedSection.id,
          discount: pointedSection.discount,
          value: pointedSection.value
        } : 'NOT FOUND',
        expectedSection: {
          id: targetSection.id,
          discount: targetSection.discount,
          value: targetSection.value
        },
        MATCH: finalSectionIndex === targetIndex && pointedSection?.id === wonPrize.id
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
      color: 'success',
      cssClass: 'copy-toast'
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
  console.log('📋 Secciones de la ruleta:', wheelSections.map(s => ({ id: s.id, discount: s.discount, value: s.value })));
  checkGameState();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
/* ===== FONDO Y CONTENEDOR PRINCIPAL ===== */
.game-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
}

.game-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.play-state, .cooldown-state {
  text-align: center;
  width: 100%;
  max-width: 450px;
}

/* ===== RULETA MODERNA ===== */
.wheel-container {
  position: relative;
  width: 340px;
  height: 340px;
  margin: 0 auto 30px;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
}

.game-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  border: 6px solid #ffffff;
  box-shadow: 
    0 0 0 4px rgba(255, 255, 255, 0.3),
    0 0 50px rgba(0, 0, 0, 0.4),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  /* Transición suave y realista */
  transition: transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center center;
}

.game-wheel.spinning {
  transition: transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Secciones de la ruleta mejoradas */
.wheel-section {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  clip-path: polygon(0 0, 0 100%, 86.6% 50%);
  background: linear-gradient(135deg, var(--section-color-1), var(--section-color-2));
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.wheel-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 70%);
  pointer-events: none;
}

.wheel-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 70%);
  pointer-events: none;
}

.section-content {
  transform: rotate(30deg) translateY(-60px);
  text-align: center;
  color: white;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  position: relative;
  z-index: 2;
}

.prize-emoji {
  font-size: 28px;
  margin-bottom: 8px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.prize-text {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-family: 'Arial Black', sans-serif;
}

.prize-value {
  font-size: 16px;
  font-weight: 900;
  text-shadow: 
    3px 3px 6px rgba(0, 0, 0, 0.9),
    0 0 15px rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  font-family: 'Arial Black', sans-serif;
}

.section-divider {
  position: absolute;
  top: 0;
  right: -1px;
  width: 2px;
  height: 50%;
  background: linear-gradient(to bottom, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0.4) 50%, 
    transparent 100%);
  transform-origin: bottom;
  z-index: 3;
}

/* Indicador/Flecha moderna */
.wheel-indicator {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

.indicator-arrow {
  position: relative;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-top: 50px solid #ff3742;
  filter: drop-shadow(0 8px 15px rgba(255, 55, 66, 0.4));
  animation: arrowPulse 2s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 8px 15px rgba(255, 55, 66, 0.4));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 12px 25px rgba(255, 55, 66, 0.6));
  }
}

.indicator-arrow::before {
  content: '';
  position: absolute;
  top: -45px;
  left: -20px;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 35px solid #ffffff;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.arrow-glow {
  position: absolute;
  top: -45px;
  left: -30px;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 55, 66, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Centro de la ruleta mejorado */
.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
}

.center-button {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 8px solid white;
  box-shadow: 
    0 0 0 4px rgba(255, 255, 255, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.center-button:hover {
  transform: scale(1.05);
  box-shadow: 
    0 0 0 4px rgba(255, 255, 255, 0.5),
    0 15px 40px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(255, 255, 255, 0.3);
}

.center-rings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.ring {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: ringRotate 4s linear infinite;
}

.ring-1 {
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  animation-duration: 4s;
}

.ring-2 {
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  animation-duration: 6s;
  animation-direction: reverse;
}

.ring-3 {
  top: 30px;
  left: 30px;
  right: 30px;
  bottom: 30px;
  animation-duration: 8s;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.center-icon {
  font-size: 40px;
  color: white;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* ===== INFORMACIÓN DEL JUEGO ===== */
.game-info {
  color: white;
  margin-bottom: 30px;
}

.game-info h1 {
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 
    3px 3px 6px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 255, 255, 0.3);
  font-weight: 800;
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-info p {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 25px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: 500;
}

/* Premios disponibles modernos */
.available-prizes {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-top: 20px;
}

.prizes-header {
  margin-bottom: 15px;
}

.prizes-title {
  font-size: 16px;
  font-weight: 700;
  color: #FFE066;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.prizes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.prize-tag {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.4);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.prize-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.prize-emoji {
  font-size: 18px;
}

.prize-text {
  flex: 1;
  text-align: left;
}

/* ===== BOTÓN DE GIRAR MEJORADO ===== */
.spin-button {
  --background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  --background-hover: linear-gradient(45deg, #ff5252, #e57373);
  --color: white;
  font-weight: bold;
  font-size: 20px;
  height: 70px;
  --border-radius: 35px;
  box-shadow: 
    0 8px 25px rgba(255, 107, 107, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.spin-button:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 35px rgba(255, 107, 107, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.spin-button:disabled {
  --background: linear-gradient(45deg, #cccccc, #aaaaaa);
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  opacity: 0.7;
}

.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

/* ===== MENSAJE DE GIRO MEJORADO ===== */
.spinning-message {
  color: white;
  margin-top: 20px;
}

.spinner-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.spinner-wheel {
  width: 60px;
  height: 60px;
  position: relative;
  animation: spinnerRotate 2s linear infinite;
}

.spinner-segment {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
}

.spinner-segment:nth-child(1) { transform: translate(-50%, -50%) rotate(0deg) translateY(-25px); }
.spinner-segment:nth-child(2) { transform: translate(-50%, -50%) rotate(45deg) translateY(-25px); }
.spinner-segment:nth-child(3) { transform: translate(-50%, -50%) rotate(90deg) translateY(-25px); }
.spinner-segment:nth-child(4) { transform: translate(-50%, -50%) rotate(135deg) translateY(-25px); }
.spinner-segment:nth-child(5) { transform: translate(-50%, -50%) rotate(180deg) translateY(-25px); }
.spinner-segment:nth-child(6) { transform: translate(-50%, -50%) rotate(225deg) translateY(-25px); }
.spinner-segment:nth-child(7) { transform: translate(-50%, -50%) rotate(270deg) translateY(-25px); }
.spinner-segment:nth-child(8) { transform: translate(-50%, -50%) rotate(315deg) translateY(-25px); }

@keyframes spinnerRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning-message p {
  font-size: 18px;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  margin-bottom: 15px;
}

.excitement-text {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.excitement-word {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: wordFloat 2s ease-in-out infinite;
}

.excitement-word:nth-child(2) { animation-delay: 0.5s; }
.excitement-word:nth-child(3) { animation-delay: 1s; }
.excitement-word:nth-child(4) { animation-delay: 1.5s; }

@keyframes wordFloat {
  0%, 100% { 
    transform: translateY(0px); 
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-5px); 
    opacity: 1;
  }
}

/* ===== ESTADO DE COOLDOWN MODERNO ===== */
.cooldown-state {
  color: white;
}

.cooldown-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: 40px 30px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.cooldown-icon {
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
}

.clock-container {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock-face {
  width: 80px;
  height: 80px;
  border: 4px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.clock-hand {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  transform-origin: bottom center;
  top: 50%;
  left: 50%;
}

.hour-hand {
  width: 3px;
  height: 25px;
  margin-left: -1.5px;
  margin-top: -25px;
  animation: clockRotate 4s linear infinite;
}

.minute-hand {
  width: 2px;
  height: 35px;
  margin-left: -1px;
  margin-top: -35px;
  animation: clockRotate 2s linear infinite;
}

@keyframes clockRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cooldown-card h2 {
  font-size: 28px;
  margin-bottom: 15px;
  font-weight: 700;
  background: linear-gradient(45deg, #FFE066, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cooldown-card p {
  font-size: 18px;
  margin-bottom: 25px;
  opacity: 0.9;
  font-weight: 500;
}

/* ===== CONTADOR REGRESIVO MODERNO ===== */
.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 35px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}

.time-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: conic-gradient(from 0deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
  animation: circleRotate 3s linear infinite;
}

@keyframes circleRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.time-number {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 2;
}

.time-label {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.time-separator {
  font-size: 32px;
  font-weight: bold;
  opacity: 0.7;
  animation: separatorBlink 1s ease-in-out infinite;
}

@keyframes separatorBlink {
  0%, 50% { opacity: 0.7; }
  51%, 100% { opacity: 0.3; }
}

/* ===== SECCIÓN DE ÚLTIMO RESULTADO ===== */
.last-result-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 25px;
  padding: 25px;
  margin: 25px 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.last-prize-info {
  margin-bottom: 25px;
}

.last-prize-info h3 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 700;
  text-align: center;
  color: #FFE066;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.prize-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.prize-icon-large {
  font-size: 50px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

.prize-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.prize-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.9;
}

.prize-discount {
  font-size: 20px;
  font-weight: 800;
  color: #FFE066;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* ===== CÓDIGO DE DESCUENTO ===== */
.discount-code-display {
  text-align: center;
}

.discount-code-display h4 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 700;
  color: #FFE066;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.code-container {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 18px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.code-container:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
  border-color: rgba(255, 255, 255, 0.7);
}

.code-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  transition: left 0.5s ease;
}

.code-container:hover::before {
  left: 100%;
}

.discount-code {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  word-break: break-all;
  position: relative;
  z-index: 2;
}

.copy-icon {
  font-size: 22px;
  opacity: 0.8;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.code-container:hover .copy-icon {
  opacity: 1;
  transform: scale(1.1);
}

.copy-tooltip {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
}

.code-container:hover .copy-tooltip {
  opacity: 1;
}

.code-expiry {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
  font-style: italic;
  color: #FFE066;
}

/* ===== BOTÓN DE VALIDACIÓN ===== */
.validate-button {
  --color: white;
  --border-color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  height: 55px;
  --border-radius: 27px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.validate-button:hover {
  --border-color: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
}

/* ===== TOAST PERSONALIZADO ===== */
.copy-toast {
  --background: linear-gradient(45deg, #4CAF50, #45a049);
  --color: white;
  font-weight: 600;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .wheel-container {
    width: 300px;
    height: 300px;
  }
  
  .game-info h1 {
    font-size: 28px;
  }
  
  .game-info p {
    font-size: 16px;
  }
  
  .countdown-timer {
    gap: 15px;
  }
  
  .time-circle {
    width: 70px;
    height: 70px;
  }
  
  .time-number {
    font-size: 20px;
  }
  
  .spin-button {
    font-size: 18px;
    height: 65px;
  }
  
  .prizes-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .prize-tag {
    padding: 10px;
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .wheel-container {
    width: 280px;
    height: 280px;
  }
  
  .center-button {
    width: 80px;
    height: 80px;
  }
  
  .center-icon {
    font-size: 32px;
  }
  
  .prize-emoji {
    font-size: 24px;
  }
  
  .prize-text {
    font-size: 11px;
  }
  
  .prize-value {
    font-size: 14px;
  }
  
  .time-circle {
    width: 60px;
    height: 60px;
  }
  
  .time-number {
    font-size: 18px;
  }
}

/* ===== ANIMACIONES ADICIONALES ===== */
@media (prefers-reduced-motion: no-preference) {
  .wheel-section {
    animation: sectionGlow 4s ease-in-out infinite;
  }
  
  .wheel-section:nth-child(odd) {
    animation-delay: 2s;
  }
}

@keyframes sectionGlow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.1);
  }
}
</style>