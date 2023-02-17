

class Camera {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yRot = 0;
    this.xRot = 0;
    this.zRot = 0;
    this.FOV = 90 * Math.PI/180;
    this.sensitivity = 12;
    this.sprinting = false;
    this.viewVector = [0, 0, 0];
  }
  
  move() {
    let SPEED = 0.5;
    let movex = 0;
    let movey = 0;
    let movez = 0;
    let mult = 1;
    let moveX = movedX;
    let moveY = movedY;
    
    if (keys.w) {
      let bonus = this.sprinting ? 1.3 : 1;
      movex += Math.cos(this.xRot) * bonus * SPEED;
      movey += Math.sin(this.xRot) * bonus * SPEED;
    }
    if (keys.s) {
      movex += -Math.cos(this.xRot) * SPEED;
      movey += -Math.sin(this.xRot) * SPEED;
    }
    if (keys.a) {
      if (movex || movez) mult = 3 / 4;
      movex += Math.cos(this.xRot - Math.PI/2) * SPEED;
      movey += Math.sin(this.xRot - Math.PI/2) * SPEED;
    }
    if (keys.d) {
      if (movex || movez) mult = 3 / 4;
      movex += -Math.cos(this.xRot - Math.PI/2) * SPEED;
      movey += -Math.sin(this.xRot - Math.PI/2) * SPEED;
    }
    if (keys[' ']) {
      movez += SPEED;
    }
    if (keys.shift) {
      movez -= SPEED;
    }
    
    this.x += movex * SPEED;
    this.y += movey * SPEED;
    this.z += movez * SPEED;
    
    // Mouse
    if (focus) {
      this.xRot += moveX * this.sensitivity * 0.0002;
      this.yRot -= moveY * this.sensitivity * 0.0002;
    }
    // print(movedX);
    
    this.yRot = Math.min(Math.max(this.yRot, -Math.PI/2), Math.PI/2);
    this.xRot = (this.xRot * 100) / 100;
    this.yRot = (this.yRot * 100) / 100;
    
    this.viewVector = [
      Math.cos(this.xRot),
      Math.sin(this.xRot),
      0
    ];
    
  }
}

/*
























*/

