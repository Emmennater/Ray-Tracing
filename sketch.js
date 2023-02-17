
function setup() {
  
  // Elements
  data = { t:0, camera: new Camera(0, 0, 2) };
  sliders = [];
  CANVAS = document.getElementById("mycanvas");
  CANVAS.addEventListener("contextmenu", (e) => e.preventDefault());
  initSliders();
  initElements();
  
  // Initializing webgl
  let webgl = setupWebgl(vtShaderSrc, fgShaderSrc);
  gl = webgl.gl;
  program = webgl.program;
  
  // Create buffer to store and render objects
  objbuffer = new Buffer(gl, program);
  
  // Add attributes
  objbuffer.addAttribute("vertPos", 2);
  objbuffer.addAttribute("vertTex", 2);
  
  // Setup buffer with these attributes
  objbuffer.saveAttribLocations();
  
  // Create a new shape with vertices: [x, y, tx, ty, tl, tr, br, bl]
  tri0 = new GLShape(objbuffer, 4);
  
  tri0.getVertex(0).attribs = [-1.0, -1.0,   0, 0];
  tri0.getVertex(1).attribs = [+1.0, -1.0,   1, 0];
  tri0.getVertex(2).attribs = [+1.0, +1.0,   1, 1];
  tri0.getVertex(3).attribs = [-1.0, +1.0,   0, 1];
  
  // Add triangle vertices to object buffer arrays
  tri0.appendAttribs();
  
  // Tell the buffer to load the new vertices
  objbuffer.loadVertices();
  
  data.tUniform = gl.getUniformLocation(program, "t");
  data.aspectUniform = gl.getUniformLocation(program, "aspect");
  data.slider0Uniform = gl.getUniformLocation(program, "slider0");
  data.cameraUniform = gl.getUniformLocation(program, "camera");
  data.camAngleUniform = gl.getUniformLocation(program, "camAngle");
  data.wallsUniform = gl.getUniformLocation(program, "walls");
  
  // updateWallsUniform();
  
  updateAspectRatio();
  
  function animate() {
  
    runKeys();
    data.camera.move();
    updateUniforms(gl, program);
    
    gl.viewport(0, 0, WIDTH, HEIGHT);
    
    // Clear background
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render objects  
    objbuffer.render();
    // objbuffer.renderWireframe();
    
    data.t++;
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}

function updateUniforms(gl, program) {
  gl.uniform1f(data.tUniform, data.t);
  gl.uniform3f(data.cameraUniform, data.camera.x, data.camera.y, data.camera.z);
  gl.uniform2f(data.camAngleUniform, data.camera.xRot, data.camera.yRot);
  gl.uniform1f(data.slider0Uniform, sliders[0].value()); 
}

function updateAspectRatio() {
  WIDTH = windowWidth;
  HEIGHT = windowHeight;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  gl.uniform1f(data.aspectUniform, WIDTH / HEIGHT);
}

function initSliders() {
  // FOV slider
  addSlider(0, PI*4, HALF_PI, 0.01);
}

function addSlider(min, max, val, step) {
  const slider = createSlider(min, max, val, step);
  slider.elt.style.left = sliders.length * 140 + "px";
  sliders.push(slider);
}

function updateWallsUniform() {
  // Not being used currently, just a proof of concept
  const OBJECT_SIZE = 4;
  const OBJECT_COUNT = 100;
  let objects = [
    { x1:1, y1:1, x2:1, y2:1 }
  ];
  
  const objectsData = new Float32Array(OBJECT_COUNT * OBJECT_SIZE);
  for (let i = 0; i < objects.length; i++) {
    objectsData[i * OBJECT_SIZE + 0] = objects[i].x1;
    objectsData[i * OBJECT_SIZE + 1] = objects[i].y1;
    objectsData[i * OBJECT_SIZE + 2] = objects[i].x2;
    objectsData[i * OBJECT_SIZE + 3] = objects[i].y2;
  }
  
  gl.uniform1fv(data.wallsUniform, objectsData);
}

/*



























*/
