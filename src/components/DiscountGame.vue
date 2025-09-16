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
            <!-- La ruleta con SVG -->
            <div class="wheel-wrapper">
              <svg 
                class="game-wheel" 
                :class="{ 'spinning': isSpinning }"
                :style="{ transform: `rotate(${currentRotation}deg)` }"
                width="350" 
                height="350" 
                viewBox="0 0 350 350"
              >
                <!-- Secciones de la ruleta -->
                <g v-for="(section, index) in wheelSections" :key="section.id">
                  <defs>
                    <linearGradient :id="`gradient-${section.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" :stop-color="section.colors.primary" />
                      <stop offset="100%" :stop-color="section.colors.secondary" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="getSectionPath(index)"
                    :fill="`url(#gradient-${section.id})`"
                    stroke="white"
                    stroke-width="2"
                    class="wheel-section-svg"
                  />
                </g>
                
                <!-- Círculo del centro -->
                <circle cx="175" cy="175" r="50" fill="#667eea" stroke="white" stroke-width="4" class="center-circle"/>
              </svg>
              
              <!-- Icono del centro -->
              <div class="wheel-center">
                <div class="center-button">
                  <ion-icon :icon="giftOutline" class="center-icon"></ion-icon>
                </div>
              </div>
            </div>
            
            <!-- Indicador/Flecha elegante -->
            <div class="wheel-indicator">
              <div class="indicator-arrow">
                <div class="arrow-body"></div>
                <div class="arrow-tip"></div>
              </div>
            </div>
          </div>

          <!-- Leyenda de premios -->
          <div class="prize-legend">
            <h3 class="legend-title">🎁 Premios por color:</h3>
            <div class="legend-items">
              <div 
                v-for="section in wheelSections" 
                :key="section.id"
                class="legend-item"
              >
                <div 
                  class="legend-color"
                  :style="{ background: `linear-gradient(135deg, ${section.colors.primary}, ${section.colors.secondary})` }"
                ></div>
                <span class="legend-text">
                  {{ section.emoji }} 
                  <strong>{{ section.value === 'GRATIS' ? 'Bebida Gratis' : section.value }}</strong>
                </span>
              </div>
            </div>
          </div>
          
          <!-- Información del juego -->
          <div class="game-info">
            <h1>🎰 ¡Gira la Ruleta!</h1>
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

// Secciones de la ruleta en orden exacto
const wheelSections = [
  { 
    id: 1, 
    discount: 10, 
    emoji: '🎯', 
    value: '10%',
    colors: {
      primary: '#FF4757',
      secondary: '#FF6B6B'
    },
    name: '10% descuento'
  },
  { 
    id: 2, 
    discount: 15, 
    emoji: '🎪', 
    value: '15%',
    colors: {
      primary: '#00CEC9',
      secondary: '#4ECDC4'
    },
    name: '15% descuento'
  },
  { 
    id: 3, 
    discount: 20, 
    emoji: '🎭', 
    value: '20%',
    colors: {
      primary: '#0984E3',
      secondary: '#45B7D1'
    },
    name: '20% descuento'
  },
  { 
    id: 4, 
    discount: 25, 
    emoji: '🎨', 
    value: '25%',
    colors: {
      primary: '#00B894',
      secondary: '#96CEB4'
    },
    name: '25% descuento'
  },
  { 
    id: 5, 
    discount: 100, 
    emoji: '🍹', 
    value: 'GRATIS',
    colors: {
      primary: '#FDCB6E',
      secondary: '#FFEAA7'
    },
    name: 'Cubata gratis'
  },
  { 
    id: 6, 
    discount: 0, 
    emoji: '😢', 
    value: 'SIN PREMIO',
    colors: {
      primary: '#A29BFE',
      secondary: '#DDA0DD'
    },
    name: 'Sin premio'
  }
];

const sectionAngle = 360 / wheelSections.length; // 60 grados por sección

// Función para generar el path SVG de cada sección
const getSectionPath = (index) => {
  const centerX = 175;
  const centerY = 175;
  const radius = 165;
  const innerRadius = 50;
  
  const startAngle = (index * sectionAngle) * (Math.PI / 180);
  const endAngle = ((index + 1) * sectionAngle) * (Math.PI / 180);
  
  const x1 = centerX + Math.cos(startAngle) * innerRadius;
  const y1 = centerY + Math.sin(startAngle) * innerRadius;
  const x2 = centerX + Math.cos(startAngle) * radius;
  const y2 = centerY + Math.sin(startAngle) * radius;
  
  const x3 = centerX + Math.cos(endAngle) * radius;
  const y3 = centerY + Math.sin(endAngle) * radius;
  const x4 = centerX + Math.cos(endAngle) * innerRadius;
  const y4 = centerY + Math.sin(endAngle) * innerRadius;
  
  const largeArc = sectionAngle > 180 ? 1 : 0;
  
  return `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`;
};

// FUNCIÓN PRINCIPAL: "OJOS" QUE LEEN LA POSICIÓN VISUAL
const readVisualPosition = () => {
  // Obtener ángulo actual de la ruleta
  const currentAngle = currentRotation.value % 360;
  
  // Normalizar ángulo (asegurar que esté entre 0-360)
  const normalizedAngle = currentAngle >= 0 ? currentAngle : currentAngle + 360;
  
  console.log('👀 Leyendo posición visual:', {
    rotacionTotal: currentRotation.value,
    anguloNormalizado: normalizedAngle.toFixed(2)
  });
  
  // CREAR MAPA VISUAL DE SECCIONES
  // La flecha apunta hacia arriba (0°), las secciones se distribuyen así:
  const sectionMap = [
    { startAngle: 0,   endAngle: 60,  section: wheelSections[0] },   // Rojo 10%
    { startAngle: 60,  endAngle: 120, section: wheelSections[1] },   // Turquesa 15%
    { startAngle: 120, endAngle: 180, section: wheelSections[2] },   // Azul 20%
    { startAngle: 180, endAngle: 240, section: wheelSections[3] },   // Verde 25%
    { startAngle: 240, endAngle: 300, section: wheelSections[4] },   // Amarillo GRATIS
    { startAngle: 300, endAngle: 360, section: wheelSections[5] }    // Morado SIN PREMIO
  ];
  
  // LEER DÓNDE ESTÁ APUNTANDO LA FLECHA
  let detectedSection = null;
  
  for (const mapping of sectionMap) {
    if (normalizedAngle >= mapping.startAngle && normalizedAngle < mapping.endAngle) {
      detectedSection = mapping;
      break;
    }
  }
  
  // Caso especial para el límite 360°/0°
  if (!detectedSection && normalizedAngle >= 0 && normalizedAngle < 360) {
    detectedSection = sectionMap[0]; // Default a la primera sección
  }
  
  if (!detectedSection) {
    console.error('❌ Error en lectura visual: No se pudo determinar la sección');
    detectedSection = sectionMap[0]; // Fallback
  }
  
  console.log('📖 Resultado de lectura visual:', {
    anguloLeido: normalizedAngle.toFixed(2),
    rangoDetectado: `${detectedSection.startAngle}° - ${detectedSection.endAngle}°`,
    seccionDetectada: detectedSection.section.value,
    colorDetectado: detectedSection.section.colors.primary,
    validacion: `${normalizedAngle.toFixed(2)}° está en rango ${detectedSection.startAngle}°-${detectedSection.endAngle}°`
  });
  
  return {
    angle: normalizedAngle,
    section: detectedSection.section,
    range: `${detectedSection.startAngle}° - ${detectedSection.endAngle}°`,
    isValid: true
  };
};

// SISTEMA DE "OJOS" - LEE VISUALMENTE DÓNDE QUEDÓ LA FLECHA
const spinWheel = async () => {
  if (!canPlay.value || isSpinning.value) return;
  
  console.log('🎯 Iniciando giro con lectura visual...');
  isSpinning.value = true;

  try {
    // PASO 1: GENERAR GIRO COMPLETAMENTE ALEATORIO
    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = (extraSpins * 360) + randomAngle;
    
    console.log('🔄 Giro aleatorio generado:', {
      extraSpins: extraSpins.toFixed(2),
      randomAngle: randomAngle.toFixed(2),
      totalRotation: totalRotation.toFixed(2)
    });
    
    // PASO 2: APLICAR ROTACIÓN
    currentRotation.value += totalRotation;
    
    // PASO 3: ESPERAR A QUE TERMINE LA ANIMACIÓN
    setTimeout(() => {
      // PASO 4: AQUÍ EMPIEZAN LOS "OJOS" - LEER POSICIÓN VISUAL
      const visualReading = readVisualPosition();
      
      console.log('👁️ Lectura visual realizada:', visualReading);
      
      // PASO 5: OTORGAR EL PREMIO BASADO EN LA LECTURA VISUAL
      const wonPrize = {
        id: visualReading.section.id,
        discount: visualReading.section.discount,
        name: visualReading.section.name,
        emoji: visualReading.section.emoji
      };
      
      // PASO 6: GENERAR CÓDIGO Y FINALIZAR
      const discountCode = GameLogic.generateDiscountCode(wonPrize);
      
      console.log('🏆 Premio otorgado basado en lectura visual:', {
        lectura: `Flecha apunta a ${visualReading.angle.toFixed(2)}°`,
        seccionDetectada: visualReading.section.value,
        colorDetectado: visualReading.section.colors.primary,
        premioOtorgado: wonPrize.name
      });
      
      // Guardar y mostrar resultado
      GameLogic.saveGameResult(wonPrize, discountCode);
      
      gameResult.value = {
        ...wonPrize,
        discountCode,
        timestamp: new Date()
      };
      
      canPlay.value = false;
      isSpinning.value = false;
      
    }, 4000);
    
  } catch (error) {
    console.error('❌ Error en el sistema visual:', error);
    isSpinning.value = false;
    resetGame();
  }
};

// FUNCIÓN DE CALIBRACIÓN - Para verificar que los "ojos" funcionan bien
const calibrateVisualSystem = () => {
  console.log('🔧 Calibrando sistema visual...');
  
  // Probar cada sección
  const testAngles = [30, 90, 150, 210, 270, 330]; // Centro de cada sección
  
  testAngles.forEach((testAngle, index) => {
    // Simular posición
    const originalRotation = currentRotation.value;
    currentRotation.value = testAngle;
    
    // Leer con los "ojos"
    const reading = readVisualPosition();
    
    console.log(`🧪 Test ángulo ${testAngle}°:`, {
      anguloTest: testAngle,
      seccionEsperada: wheelSections[index].value,
      seccionDetectada: reading.section.value,
      coincide: reading.section.value === wheelSections[index].value ? '✅' : '❌'
    });
    
    // Restaurar posición original
    currentRotation.value = originalRotation;
  });
  
  console.log('🔧 Calibración completada');
};

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
  
  if (!canPlay.value) {
    timeRemaining.value = GameLogic.getTimeUntilNextPlay();
    lastGameResult.value = GameLogic.getLastGameResult();
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

// Resto de funciones existentes
const resetGame = () => {
  gameResult.value = null;
  isSpinning.value = false;
  checkGameState();
};

const goToValidation = () => {
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
  }
};

const formatExpiryTime = (playTimestamp) => {
  const expiryTime = new Date(playTimestamp + (2 * 60 * 60 * 1000));
  return expiryTime.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Lifecycle hooks
onMounted(() => {
  console.log('🚀 Sistema visual de ruleta iniciado');
  console.log('📋 Mapa de secciones visuales:', wheelSections.map((s, i) => ({
    indice: i,
    premio: s.value,
    color: s.colors.primary,
    rango: `${i * 60}°-${(i + 1) * 60}°`
  })));
  
  checkGameState();
  
  // Calibrar el sistema al inicio (opcional)
  // calibrateVisualSystem();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

// Debug functions
if (process.env.NODE_ENV === 'development') {
  window.debugWheel = {
    readCurrent: readVisualPosition,
    calibrate: calibrateVisualSystem,
    testAngle: (angle) => {
      const original = currentRotation.value;
      currentRotation.value = angle;
      const result = readVisualPosition();
      currentRotation.value = original;
      return result;
    }
  };
}
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

/* RULETA CON SVG */
.wheel-container {
  position: relative;
  width: 350px;
  height: 350px;
  margin: 0 auto 30px;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 
    0 0 0 4px rgba(255, 255, 255, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.game-wheel {
  width: 100%;
  height: 100%;
  transition: transform 4s cubic-bezier(0.23, 1, 0.320, 1);
  transform-origin: center center;
}

.game-wheel.spinning {
  transition: transform 4s cubic-bezier(0.23, 1, 0.320, 1);
}

.wheel-section-svg {
  transition: opacity 0.3s ease;
}

.wheel-section-svg:hover {
  opacity: 0.8;
}

.center-circle {
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.3));
}

/* Indicador/Flecha elegante */
.wheel-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

.indicator-arrow {
  position: relative;
  filter: drop-shadow(0 8px 20px rgba(255, 55, 66, 0.5));
}

.arrow-body {
  width: 6px;
  height: 25px;
  background: linear-gradient(to bottom, #ff3742, #ff5252);
  border-radius: 3px;
  margin: 0 auto 2px;
}

.arrow-tip {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 25px solid #ff3742;
  position: relative;
}

.arrow-tip::after {
  content: '';
  position: absolute;
  top: -22px;
  left: -12px;
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 20px solid #ffffff;
}

/* Centro elegante */
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
  box-shadow: 
    0 0 0 2px rgba(255, 255, 255, 0.3),
    0 8px 25px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.center-button:hover {
  transform: scale(1.05);
  box-shadow: 
    0 0 0 2px rgba(255, 255, 255, 0.5),
    0 12px 35px rgba(0, 0, 0, 0.5);
}

.center-icon {
  font-size: 32px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* LEYENDA DE PREMIOS */
.prize-legend {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.legend-title {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.legend-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-text strong {
  font-weight: 700;
  color: #FFE066;
}

/* INFORMACIÓN DEL JUEGO */
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

/* BOTÓN DE GIRAR */
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

/* MENSAJE DE GIRO */
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

/* CONTADOR REGRESIVO */
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

/* BOTÓN DE VALIDACIÓN */
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

/* CÓDIGO DE DESCUENTO */
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
    width: 300px;
    height: 300px;
  }
  
  .legend-items {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .legend-item {
    padding: 10px 14px;
  }
  
  .legend-text {
    font-size: 13px;
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
    width: 270px;
    height: 270px;
  }
  
  .center-button {
    width: 80px;
    height: 80px;
  }
  
  .center-icon {
    font-size: 30px;
  }
  
  .prize-legend {
    padding: 20px;
  }
  
  .legend-title {
    font-size: 16px;
  }
}
</style>