
function setupWebgl(vtShaderSrc, fgShaderSrc) {
  // Initializing webgl
  canvas = document.getElementById('mycanvas');
  var gl = canvas.getContext('webgl2');
  canvas.width = windowWidth;
  canvas.height = windowHeight;
  
  if (!gl) {
    console.log('webgl not supported, falling back on experimental');
    gl = canvas.getContext('experimental-webgl');
  }
  if (!gl) alert('Your browser does not support WebGL');
  
  // enable UNSIGNED_INT for drawElements
  var uints_for_indices = gl.getExtension("OES_element_index_uint");
  
  // setup version
  // gl.glutInitContextProfile(gl.GLUT_CORE_PROFILE | gl.GLUT_COMPATIBILITY_PROFILE);
  
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  /** SHADERS **/
  
  // Create Shaders
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  
  // Set the source code of vertex and frag shaders
  gl.shaderSource(vertexShader, vtShaderSrc);
  gl.shaderSource(fragmentShader, fgShaderSrc);
  
  // Compile the shaders
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
    return;
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
    return;
  }
  
  // Create program and attach shaders
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfo(program));
    return;
  }
  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program!', gl.getProgramInfo(program));
    return;
  }
  
  // Use program
  gl.useProgram(program);
  
  return {
    canvas: canvas,
    gl: gl,
    program: program
  };
}

/*






























*/
