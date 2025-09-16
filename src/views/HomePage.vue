<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <div class="home-container">
        
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="logo-container">
            <div class="logo-circle">
              <div class="logo">🎰</div>
            </div>
            <h1 class="app-title">University Slots</h1>
            <p class="app-subtitle">Gira, gana y disfruta descuentos exclusivos para estudiantes</p>
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

        <!-- Features Section -->
        <div class="features-section">
          <div class="feature-card gradient-red">
            <div class="feature-icon">🎯</div>
            <h3>Juega</h3>
            <p>Gira la ruleta universitaria y gana descuentos de hasta 25%</p>
          </div>
          
          <div class="feature-card gradient-blue">
            <div class="feature-icon">🎁</div>
            <h3>Gana</h3>
            <p>Obtén bebidas gratis y ofertas exclusivas para estudiantes</p>
          </div>
          
          <div class="feature-card gradient-green">
            <div class="feature-icon">⚡</div>
            <h3>Disfruta</h3>
            <p>Aplica tu descuento al instante en la cafetería universitaria</p>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="info-section">
          <div class="info-card">
            <div class="info-header">
              <div class="info-icon">📋</div>
              <h4>Cómo funciona</h4>
            </div>
            <div class="steps-container">
              <div class="step">
                <div class="step-number">1</div>
                <p>Escanea el código QR en tu mesa</p>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <p>Gira la ruleta para ganar descuentos</p>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <p>Muestra tu código al personal</p>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <p>¡Disfruta de tu descuento!</p>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <div class="info-icon">⏰</div>
              <h4>Normas del juego</h4>
            </div>
            <div class="rules-grid">
              <div class="rule-item">
                <div class="rule-dot"></div>
                <p>Una jugada cada <strong>24 horas</strong> por dispositivo</p>
              </div>
              <div class="rule-item">
                <div class="rule-dot"></div>
                <p>Códigos válidos por <strong>2 horas</strong></p>
              </div>
              <div class="rule-item">
                <div class="rule-dot"></div>
                <p>Los descuentos no son acumulables</p>
              </div>
              <div class="rule-item">
                <div class="rule-dot"></div>
                <p>Válido en bebidas y snacks del campus</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-section">
          <div class="footer-content">
            <p class="footer-text">Desarrollado para la comunidad estudiantil</p>
            <div class="footer-icons">
              <div class="footer-icon">🎓</div>
              <div class="footer-icon">📚</div>
              <div class="footer-icon">☕</div>
            </div>
          </div>
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
.home-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
}

.home-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.home-container {
  position: relative;
  z-index: 1;
  padding: 40px 20px 20px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 50px;
}

.logo-container {
  margin-bottom: 40px;
}

.logo-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.logo {
  font-size: 60px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.app-title {
  color: white;
  font-size: 42px;
  font-weight: 900;
  margin-bottom: 15px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  line-height: 1.5;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* CTA Buttons */
.cta-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 40px;
}

.primary-button, .secondary-button {
  border: none;
  border-radius: 50px;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  height: 60px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.primary-button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
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

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  padding: 30px 20px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.gradient-red { background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(238, 90, 82, 0.2)); }
.gradient-blue { background: linear-gradient(135deg, rgba(69, 183, 209, 0.2), rgba(103, 197, 227, 0.2)); }
.gradient-green { background: linear-gradient(135deg, rgba(0, 184, 148, 0.2), rgba(150, 206, 180, 0.2)); }

.feature-icon {
  font-size: 50px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.feature-card h3 {
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.feature-card p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* Info Section */
.info-section {
  margin-bottom: 30px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 25px;
  padding: 30px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.info-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.info-card h4 {
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

/* Steps Container */
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step-number {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.step p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
  font-size: 14px;
}

/* Rules Grid */
.rules-grid {
  display: grid;
  gap: 15px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.rule-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4ECDC4, #44A08D);
  margin-top: 6px;
  flex-shrink: 0;
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
  margin-top: auto;
  padding-top: 30px;
}

.footer-content {
  text-align: center;
}

.footer-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 15px 0;
}

.footer-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.footer-icon {
  font-size: 24px;
  opacity: 0.7;
  animation: bounce 2s ease-in-out infinite;
}

.footer-icon:nth-child(2) {
  animation-delay: 0.3s;
}

.footer-icon:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

/* Responsive */
@media (max-width: 768px) {
  .app-title {
    font-size: 32px;
  }
  
  .app-subtitle {
    font-size: 16px;
  }
  
  .logo-circle {
    width: 100px;
    height: 100px;
  }
  
  .logo {
    font-size: 50px;
  }
  
  .features-section {
    grid-template-columns: 1fr;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 30px 15px 15px;
  }
  
  .primary-button, .secondary-button {
    height: 55px;
    font-size: 16px;
  }
  
  .feature-card {
    padding: 25px 15px;
  }
  
  .info-card {
    padding: 25px 20px;
  }
}
</style>