/**
 * World Manager
 * Handles terrain, ground planes, and world-level physics
 */

class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.groundPlanes = [];
    this.groundSpacing = 500;
    this.motionLines = [];
    this.motionLineOffset = 0;
  }

  /**
   * Initialize the world with ground and motion lines
   */
  initialize() {
    const world = document.getElementById('world');
    if (!world) return;

    // Clear existing ground
    this.groundPlanes = [];

    // Create ground planes centered around player origin
    this.spawnGroundPlane(0);      // Player's position
    this.spawnGroundPlane(-500);   // In front
    this.spawnGroundPlane(500);    // Behind

    // Create motion lines for visual feedback
    this.createMotionLines();
  }

  /**
   * Spawn a ground plane at specific z position (static, player-relative)
   */
  spawnGroundPlane(zPos) {
    const world = document.getElementById('world');
    if (!world) return;

    const planeId = `ground-${zPos}`;
    if (document.getElementById(planeId)) return; // Already exists

    const plane = document.createElement('a-plane');
    plane.setAttribute('id', planeId);
    plane.setAttribute('position', `0 -1 ${zPos}`);
    plane.setAttribute('rotation', '-90 0 0');
    plane.setAttribute('width', '200');
    plane.setAttribute('height', '2000');
    plane.setAttribute('color', '#ffffff');
    plane.setAttribute('static-body', '');

    world.appendChild(plane);
    this.groundPlanes.push({ id: planeId, z: zPos });
  }

  /**
   * Create motion lines for visual speed feedback
   */
  createMotionLines() {
    const world = document.getElementById('world');
    const motionLinesEntity = world.querySelector('#motion-lines');
    
    if (!motionLinesEntity) return;

    // Create horizontal lines across the slope
    for (let i = 0; i < 30; i++) {
      const line = document.createElement('a-plane');
      line.setAttribute('width', '200');
      line.setAttribute('height', '2');
      line.setAttribute('color', '#f0f0f0');
      line.setAttribute('opacity', '0.4');
      line.setAttribute('position', `0 -0.05 ${-100 + i * 12}`);
      line.setAttribute('rotation', '0 0 0');
      motionLinesEntity.appendChild(line);
      this.motionLines.push(line);
    }
  }

  /**
   * Update motion lines for visual effect
   */
  updateMotionLines(speed) {
    this.motionLineOffset += speed;

    this.motionLines.forEach((line, index) => {
      const baseZ = -100 + index * 12;
      const newZ = ((baseZ + this.motionLineOffset) % 360) - 180;
      line.setAttribute('position', `0 -0.05 ${newZ}`);
    });
  }

  /**
   * Update ground planes (static in player-relative world, so no updates needed)
   */
  updateGroundPlanes() {
    // Ground planes are static and tile infinitely
    // No updates needed in player-relative coordinate system
  }

  /**
   * Reset world state
   */
  reset() {
    const world = document.getElementById('world');
    if (world) {
      // Clear all ground planes except motion lines
      this.groundPlanes.forEach(plane => {
        const element = document.getElementById(plane.id);
        if (element) element.parentNode.removeChild(element);
      });
      this.groundPlanes = [];
      this.motionLineOffset = 0;
    }
    this.initialize();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorldManager;
}
