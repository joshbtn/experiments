/**
 * Game Configuration
 * Centralized settings for easy tuning without editing core game logic
 */

const GAME_CONFIG = {
  // Game Physics
  physics: {
    gravity: -0.018,
    groundLevel: 0,
    playerRadius: 0.3
  },

  // Game Difficulty
  difficulty: {
    baseSpeed: 0.25,
    maxSpeed: 0.4,
    speedAcceleration: 0.001
  },

  // Input Sensitivity
  input: {
    keyboardSteering: 0.15,
    vrHeadTilt: 0.008,
    jumpForce: 0.42
  },

  // World Generation
  world: {
    groundSpacing: 500,
    motionLineCount: 30,
    motionLineSpacing: 12
  },

  // Obstacle Spawning
  obstacles: {
    spawnInterval: 8,           // Distance units between spawns
    minSpacing: 15,             // Minimum distance between obstacles
    treeChance: 0.75,           // 75% trees, 25% jumps
    treeRadius: 0.8,
    rampWidth: 6,
    maxObstaclesActive: 150     // For performance
  },

  // Collision Tuning
  collision: {
    treeCollisionRadius: 1.1,   // Radius + player margin
    rampTriggerWidth: 3.2,      // Half width + player margin
    playerGroundThreshold: 0.5  // Height to test collision
  },

  // Visual Settings
  graphics: {
    fogNear: 20,
    fogFar: 120,
    skyColor: '#E0F6FF',
    groundColor: '#ffffff',
    motionLineColor: '#f0f0f0',
    motionLineOpacity: 0.4,
    ambientLightIntensity: 0.85,
    directionalLightIntensity: 0.8
  },

  // UI/UX
  ui: {
    vrFuseTimeout: 2000,        // Milliseconds to gaze-start
    startMessageVR: 'GAZE AT RED BOX or CLICK BUTTON to start',
    startMessageDesktop: 'Click button or press arrow keys',
    playingMessage: 'ARROW KEYS / HEAD TILT TO STEER | SPACEBAR TO JUMP',
    gameOverMessageFormat: '{reason}<br>Distance: {distance}m | Best: {best}m'
  },

  // Debug Settings
  debug: {
    enabled: false,
    logPhysics: false,
    logCollisions: false,
    showBoundingBoxes: false,
    showFPS: false,
    showCollisionLogs: false  // Show detailed collision check logs
  }
};

// Helper function to apply config
function applyGameConfig(game) {
  if (!game) return;
  
  // Apply physics config
  game.physics.gravity = GAME_CONFIG.physics.gravity;
  
  // Apply difficulty config
  game.config.baseSpeed = GAME_CONFIG.difficulty.baseSpeed;
  game.config.maxSpeed = GAME_CONFIG.difficulty.maxSpeed;
  game.config.speedAccel = GAME_CONFIG.difficulty.speedAcceleration;
  
  // Apply input config
  game.input.keyboardSensitivity = GAME_CONFIG.input.keyboardSteering;
  game.input.vrSensitivity = GAME_CONFIG.input.vrHeadTilt;
}

// Example: Easy difficulty
const DIFFICULTY_EASY = {
  difficulty: {
    baseSpeed: 0.15,
    maxSpeed: 0.25,
    speedAcceleration: 0.0005
  },
  obstacles: {
    spawnInterval: 12,
    minSpacing: 20
  }
};

// Example: Hard difficulty
const DIFFICULTY_HARD = {
  difficulty: {
    baseSpeed: 0.35,
    maxSpeed: 0.55,
    speedAcceleration: 0.0015
  },
  obstacles: {
    spawnInterval: 6,
    minSpacing: 12
  },
  physics: {
    gravity: -0.022
  }
};

// Merge difficulty preset into config
function mergeDifficulty(preset) {
  Object.assign(GAME_CONFIG, preset);
}
