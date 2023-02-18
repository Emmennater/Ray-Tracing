var fgShaderSrc = glsl`// #version 300 es

precision mediump float;

struct Wall {
  float x1, y1, x2, y2;
};

varying vec3 fragCol;
varying vec2 fragTex;

uniform float t;
uniform float aspect;
uniform float slider0;
uniform vec3 camera;
uniform vec2 camAngle;
uniform float walls[100 * 4];

#define PI 3.14159265358
#define TWO_PI PI * 2.0

#include ${shaderFunctions}
#include ${shaderMath}
#include ${shaderCollisions}
#include ${raytraceMath}

void main() {

  vec3 sky = rgb(0, 0, 0); // 155, 219, 232

  float x = (fragTex.s - 0.5);
  float y = (fragTex.t - 0.5) / aspect;
  float s0 = slider0;

  float FOV = s0;
  vec3 cam = vec3(camera.x, camera.y, camera.z);

  // Map x, y to yaw, pitch
  Direction d = fishEye(camAngle.x, camAngle.y, x, y, FOV);

  // Calculate ray
  float r = 0.0, g = 0.0, b = 0.0;
  float absorb = 1.0, light = 1.0;
  float raylength = 0.0;
  Ray ray = Ray(cam, d);
  for (int i=0; i<10; i++) {
    RayTrace tc = traceRay(ray, i, raylength);
    if (tc.B == 0.0) {
      r = lerp(r, sky.x, light);
      g = lerp(g, sky.y, light);
      b = lerp(b, sky.z, light);
      break;
    }

    // How much color is absorbed
    absorb = (1.0 - tc.reflect);
    float amt = absorb * light;
    r = lerp(r, tc.r, amt);
    g = lerp(g, tc.g, amt);
    b = lerp(b, tc.b, amt);
    
    // Absorb remaining light
    absorb = tc.reflect;
    light *= tc.reflect;
    if (light < 0.01) break;
    raylength += length(tc.next.pos - ray.pos);
    ray = tc.next;
  }

  // Pixel color
  vec3 c = vec3(r, g, b);

  // Set color
  gl_FragColor = vec4(c, 1);

}

`;

/*



























*/
