var vtShaderSrc = glsl`// #version 300 es

precision mediump float;

// Input variables
attribute vec2 vertPos;
attribute vec3 vertCol;
attribute vec2 vertTex;
attribute vec4 vertSha;

// Output variables
varying vec3 fragCol;
varying vec2 fragTex;
varying vec4 fragSha;

void main() {
  fragCol = vertCol;
  fragTex = vertTex;

  // Set shadows
  fragSha = vertSha;
  // ftl = vtl;
  // ftr = vtr;
  // fbr = vbr;
  // fbl = vbl;
  
  gl_Position = vec4(vertPos, 0.0, 1.0);
}

`;

/*















*/
