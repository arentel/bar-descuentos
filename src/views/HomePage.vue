<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <div class="home-container">
        
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="logo-container">
            <div class="logo">🍹</div>
            <h1 class="app-title">Night Slots</h1>
            <p class="app-subtitle">Gira, gana y disfruta descuentos increíbles en tus bebidas</p>
          </div>
          
          <!-- CTA Buttons -->
          <div class="cta-section">
            <button @click="startGame" class="primary-button">
              <span class="button-content">
                <ion-icon :icon="playCircle" class="button-icon"></ion-icon>
                ¡Comenzar a Jugar!
              </span>
            </button>

            <button @click="goToValidation" class="secondary-button">
              <span class="button-content">
                <ion-icon :icon="qrCode" class="button-icon"></ion-icon>
                Validar Descuento
              </span>
            </button>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="info-section">
          <div class="info-card">
            <div class="info-header">
              <h4>📋 Cómo funciona</h4>
            </div>
            <div class="steps-container">
              <div class="step">
                <div class="step-number">1</div>
                <p>Escanea el <strong class="highlight">código QR</strong> en tu mesa</p>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <p>Gira la <strong class="highlight">ruleta</strong> para ganar descuentos</p>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <p>Muestra tu <strong class="highlight">código al camarero</strong></p>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <p>¡Disfruta de tu <strong class="highlight">descuento</strong>!</p>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <h4>⏰ Normas del juego</h4>
            </div>
            <div class="rules-list">
              <div class="rule-item">
                <p>Cada dispositivo puede jugar <strong class="highlight-yellow">una vez cada 24 horas</strong></p>
              </div>
              <div class="rule-item">
                <p>Los códigos son válidos por <strong class="highlight-yellow">2 horas</strong></p>
              </div>
              <div class="rule-item">
                <p>Los descuentos <strong class="highlight-red">no son acumulables</strong></p>
              </div>
              <div class="rule-item">
                <p>Válido solo en <strong class="highlight-green">bebidas del menú básico</strong></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-section">
          <p class="footer-text">
            Desarrollado con ❤️ para una experiencia única en el bar
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { playCircle, qrCode } from 'ionicons/icons';

const router = useRouter();

const startGame = () => {
  router.push('/game');
};

const goToValidation = () => {
  router.push('/validate');
};
</script>

<style scoped>
/* MISMO FONDO QUE EL JUEGO - CONSISTENCIA VISUAL */
.home-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  justify-content: center;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 50px;
}

.logo-container {
  margin-bottom: 40px;
}

.logo {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.app-title {
  color: white;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin-bottom: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* CTA Buttons - SIN RECUADROS */
.cta-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 40px;
}

.primary-button, .secondary-button {
  border: none;
  border-radius: 32px;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  height: 60px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  outline: none !important;
}

.primary-button:focus, .secondary-button:focus {
  outline: none !important;
  border: none !important;
}

.primary-button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.7);
}

.secondary-button {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.button-icon {
  font-size: 20px;
}

/* Info Section - MANTENIENDO ESTILO ANTERIOR */
.info-section {
  margin-bottom: 40px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-header h4 {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* Steps Container */
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.step p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
  font-size: 14px;
}

/* Rules List */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
  font-size: 14px;
}

.rule-item strong {
  color: #FFE066;
  font-weight: 700;
}

/* Footer */
.footer-section {
  text-align: center;
  margin-top: auto;
  padding-top: 20px;
}

.footer-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

/* Responsive design - IGUAL AL ANTERIOR */
@media (max-width: 768px) {
  .app-title {
    font-size: 28px;
  }
  
  .app-subtitle {
    font-size: 16px;
  }
  
  .logo {
    font-size: 60px;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .primary-button, .secondary-button {
    height: 55px;
    font-size: 16px;
  }
  
  .info-card {
    padding: 20px;
  }
}
</style>