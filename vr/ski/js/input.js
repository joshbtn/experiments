/**
 * Input Handler
 * Manages keyboard, mouse, and VR input
 */

class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      space: false
    };
    
    this.camera = null;
    this.keyboardSensitivity = 0.15;
    this.vrSensitivity = 0.008;
    
    this.setupEventListeners();
  }

  /**
   * Setup keyboard event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  /**
   * Handle key down event
   */
  handleKeyDown(e) {
    if (e.key === 'ArrowLeft') this.keys.left = true;
    if (e.key === 'ArrowRight') this.keys.right = true;
    if (e.key === ' ') this.keys.space = true;
  }

  /**
   * Handle key up event
   */
  handleKeyUp(e) {
    if (e.key === 'ArrowLeft') this.keys.left = false;
    if (e.key === 'ArrowRight') this.keys.right = false;
    if (e.key === ' ') this.keys.space = false;
  }

  /**
   * Set camera reference for VR input
   */
  setCamera(camera) {
    this.camera = camera;
  }

  /**
   * Calculate steering input from both keyboard and VR
   */
  getSteering() {
    let steering = 0;

    // Keyboard input
    if (this.keys.left) steering -= this.keyboardSensitivity;
    if (this.keys.right) steering += this.keyboardSensitivity;

    // VR head tilt input
    if (this.camera) {
      const rotation = this.camera.getAttribute('rotation');
      steering -= rotation.z * this.vrSensitivity;
    }

    return steering;
  }

  /**
   * Check if player wants to jump (spacebar or in VR, gaze)
   */
  shouldJump() {
    return this.keys.space;
  }

  /**
   * Reset jump state
   */
  resetJump() {
    this.keys.space = false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputHandler;
}
