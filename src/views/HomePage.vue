<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <div class="home-container">
        <div class="welcome-section">
          <div class="logo-section">
            <div class="logo">🍹</div>
            <h1 class="app-title">Bar Descuentos</h1>
            <p class="app-subtitle">Juega y gana descuentos increíbles</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h3>Juega</h3>
              <p>Gira la ruleta y gana descuentos de hasta 25%</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🎁</div>
              <h3>Gana</h3>
              <p>Obtén bebidas gratis y descuentos exclusivos</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>Disfruta</h3>
              <p>Aplica tu descuento al instante en el bar</p>
            </div>
          </div>

          <div class="cta-section">
            <ion-button
              expand="block"
              size="large"
              @click="startGame"
              class="start-button"
            >
              <ion-icon :icon="playCircle" slot="start"></ion-icon>
              ¡Comenzar a Jugar!
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              @click="goToValidation"
              class="validate-button"
            >
              <ion-icon :icon="qrCode" slot="start"></ion-icon>
              Validar Descuento
            </ion-button>
          </div>

          <div class="info-section">
            <div class="info-card">
              <h4>📋 Cómo funciona</h4>
              <ol class="steps-list">
                <li>Escanea el código QR en tu mesa</li>
                <li>Gira la ruleta para ganar descuentos</li>
                <li>Muestra tu código al camarero</li>
                <li>¡Disfruta de tu descuento!</li>
              </ol>
            </div>

            <div class="info-card">
              <h4>⏰ Normas del juego</h4>
              <ul class="rules-list">
                <li>Cada dispositivo puede jugar <strong>una vez cada 24 horas</strong></li>
                <li>Los códigos son válidos por <strong>2 horas</strong></li>
                <li>Los descuentos no son acumulables</li>
                <li>Válido solo en bebidas del menú básico</li>
              </ul>
            </div>
          </div>

          <div class="footer-section">
            <p class="footer-text">
              Desarrollado con ❤️ para una experiencia única en el bar
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonButton, IonIcon
} from '@ionic/vue';
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
.home-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
}

.welcome-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.logo-section {
  text-align: center;
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
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin-bottom: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.cta-section {
  margin-bottom: 40px;
}

.start-button {
  --background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  --background-hover: linear-gradient(45deg, #ff5252, #e57373);
  --color: white;
  font-weight: bold;
  font-size: 18px;
  height: 60px;
  --border-radius: 30px;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
  margin-bottom: 15px;
}

.validate-button {
  --color: white;
  --border-color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  height: 50px;
  --border-radius: 25px;
}

.info-section {
  margin-bottom: 30px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-card h4 {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.steps-list, .rules-list {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  padding-left: 20px;
}

.steps-list li, .rules-list li {
  margin-bottom: 8px;
  line-height: 1.4;
}

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

/* Responsive design */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .app-subtitle {
    font-size: 16px;
  }
  
  .logo {
    font-size: 60px;
  }
}
</style>