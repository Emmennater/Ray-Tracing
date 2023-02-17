let WIDTH = 800;
let HEIGHT = 800;
const keys = {};

focus = false;

let pointerLockActivatedAt = -2000;

function windowResized() {
  updateAspectRatio();
}

function mousePressed() {
  
  busy = mouseY <= 20;
  if (busy) return;
  
  if (mouseButton == LEFT) {
    if (performance.now() - pointerLockActivatedAt < 2000) {
      return;
    }

    CANVAS.requestPointerLock();
    pointerLockActivatedAt = performance.now();
  } else if (mouseButton == RIGHT) {
    exitPointerLock();
    pointerLockActivatedAt -= 2000;
  }
}

function mouseDragged() {}

function keyPressed() {
  keys[key.toLowerCase()] = true;
}

function keyReleased() {
  keys[key.toLowerCase()] = false;
}

function runKeys() {
  
}

function initElements() {
  
  function lockChangeAlert() {
    focus = (document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas);
  }
  
  function canvasLoop(e) {
    var movementX = e.movementX || e.mozMovementX || 0;
    var movementY = e.movementY || e.mozMovementY ||  0;
    moveX = movementX;
    moveY = movementY;
  }
  
  // pointer lock event listeners
  // Hook pointer lock state change events for different browsers
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
}

/*




















*/
