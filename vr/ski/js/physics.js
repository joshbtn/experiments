/**
 * Physics Engine
 * Handles gravity, collision detection, and physics simulation
 */

class PhysicsEngine {
  constructor(config = {}) {
    this.gravity = config.gravity || -0.018;
    this.groundLevel = config.groundLevel || 0;
    this.bodies = [];
  }

  /**
   * Create a physics body for the player
   */
  createPlayerBody() {
    return {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      mass: 1,
      radius: 0.5,
      onGround: true
    };
  }

  /**
   * Create a static obstacle body
   */
  createObstacleBody(x, z, type = 'tree', radius = 0.8) {
    return {
      position: { x, z },
      type,
      radius,
      static: true
    };
  }

  /**
   * Update physics simulation
   */
  update(body, deltaTime = 1) {
    if (!body || body.static) return;

    // Apply gravity
    body.velocity.y += this.gravity * deltaTime;

    // Update position
    body.position.y += body.velocity.y * deltaTime;

    // Ground collision - keep player on ground
    if (body.position.y <= this.groundLevel) {
      body.position.y = this.groundLevel;
      body.velocity.y = 0;
      body.onGround = true;
    } else {
      body.onGround = false;
    }
  }

  /**
   * Check collision between player and obstacle
   */
  checkCollision(playerBody, obstacleBody, collisionDistance = 1.3) {
    const dx = playerBody.position.x - obstacleBody.position.x;
    const distance = Math.abs(dx);
    
    return distance < collisionDistance && playerBody.position.y < 0.5;
  }

  /**
   * Apply jump force
   */
  applyJump(body, jumpForce = 0.42) {
    if (body.onGround) {
      body.velocity.y = jumpForce;
      body.onGround = false;
    }
  }

  /**
   * Apply steering/horizontal force
   */
  applySteering(body, steerAmount) {
    body.position.x += steerAmount;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhysicsEngine;
}
