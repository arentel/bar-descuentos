// Constantes
export const GAME_STORAGE_KEY = 'discount_game_data';
export const COOLDOWN_HOURS = 24;

// Obtener datos del juego
export const getGameData = () => {
  try {
    const data = localStorage.getItem(GAME_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al leer datos del juego:', error);
    return null;
  }
};

// Guardar datos del juego
export const setGameData = (data) => {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Error al guardar datos del juego:', error);
    return false;
  }
};

// Verificar si el usuario puede jugar
export const canUserPlay = () => {
  const gameData = getGameData();
  
  if (!gameData) {
    return true; // Primera vez
  }
  
  const now = Date.now();
  const timePassed = now - gameData.timestamp;
  const hoursInMs = COOLDOWN_HOURS * 60 * 60 * 1000;
  
  return timePassed >= hoursInMs;
};

// Obtener tiempo restante para volver a jugar
export const getTimeUntilNextPlay = () => {
  const gameData = getGameData();
  
  if (!gameData) {
    return 0;
  }
  
  const now = Date.now();
  const timePassed = now - gameData.timestamp;
  const hoursInMs = COOLDOWN_HOURS * 60 * 60 * 1000;
  const timeRemaining = hoursInMs - timePassed;
  
  return timeRemaining > 0 ? timeRemaining : 0;
};

// Formatear tiempo restante
export const formatTimeRemaining = (milliseconds) => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};