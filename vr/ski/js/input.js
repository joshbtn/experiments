/**
 * Input Handler
 * Manages keyboard, mouse, and VR input
 */

class InputHandler {
  constructor() {
    this.keys = {
      space: false
    };
    
    this.camera = null;
    this.vrSensitivity = 0.004; // Yaw sensitivity (degrees -> lateral steer)
    this.vrDeadzone = 2.0;       // Ignore tiny head yaw
    this.vrMaxSteer = 0.08;      // Clamp max steer per frame
    
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
    if (e.key === ' ') this.keys.space = true;
  }

  /**
   * Handle key up event
   */
  handleKeyUp(e) {
    if (e.key === ' ') this.keys.space = false;
  }

  /**
   * Set camera reference for VR input
   */
  setCamera(camera) {
    this.camera = camera;
  }

  /**
   * Calculate steering and forward factor from head yaw only
   * - Yaw steers laterally
   * - Forward factor slows descent based on turning angle
   */
  getSteeringAndHeading() {
    if (!this.camera) return { steering: 0, forwardFactor: 1 };

    const rotation = this.camera.getAttribute('rotation') || { y: 0, z: 0 };
    const yaw = rotation.y || 0; // degrees around vertical axis

    // Forward factor: 1 when looking straight downhill, 0 when 90° across
    const yawRad = yaw * Math.PI / 180;
    const forwardFactor = (Math.abs(yaw) >= 90) ? 0 : Math.max(0, Math.cos(yawRad));

    // Lateral steering proportional to yaw, with deadzone and clamp
    let steering = 0;
    const absYaw = Math.abs(yaw);
    if (absYaw > this.vrDeadzone) {
      // Invert sign so looking right steers right in world space
      const steerFromYaw = -yaw * this.vrSensitivity;
      steering = Math.max(-this.vrMaxSteer, Math.min(this.vrMaxSteer, steerFromYaw));
    }

    return { steering, forwardFactor };
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
