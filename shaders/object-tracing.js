var raytraceMath = glsl`

#include ${rayCollision}

RayTrace traceRay(Ray d, int iter, float raylength) {
  // Pixel Calculation
  float r = 1.0, g = 1.0, b = 1.0;
  float V = 1.0, B = 1.0;

  vec3 r_origin = d.pos;
  vec3 r_direction = d.dir.ray;
  
  float reflection = 0.0;
  Ray nextRay;

  // Sphere Collision
  Collision collision = collideSphere(r_origin, r_direction);
  Result res = collision.result;
  Sphere sphereHit = collision.sphereHit;

  // Point light
  const int LIGHTS = 4;
  Light lights[LIGHTS];
  const float sp = 0.002;
  const float ns = 0.1;
  const float luminance = 100.0;
  const float dst = 50.0;
  const float radius = 0.5;
  lights[0] = Light(vec3(dst*noise(t*sp-10.0), dst*noise(t*sp-20.0), 30.0*noise(t*sp-30.0)+20.0), 1.0, 0.0, 0.0, 1.0, radius);
  lights[1] = Light(vec3(dst*noise(t*sp+10.0), dst*noise(t*sp+20.0), 30.0*noise(t*sp+30.0)+20.0), 0.0, 1.0, 0.0, 1.0, radius);
  lights[2] = Light(vec3(dst*noise(t*sp+40.0), dst*noise(t*sp+50.0), 30.0*noise(t*sp+60.0)+20.0), 0.0, 0.0, 1.0, 1.0, radius);
  lights[3] = Light(vec3(-10.0, 0.0, 10.0), 1.0, 1.0, 1.0, 2.0, radius);

  // If collision exists calculate sphere lighting
  // otherwise calculate floor lighting
  if (res.exist) {
    float R1 = 1.0, G1 = 1.0, B1 = 1.0;
    float R2 = 1.0, G2 = 1.0, B2 = 1.0;
    B = 1.0 / pow(res.a, 0.2) + 0.1;
    vec3 intersectPoint = r_origin + r_direction * res.a;
    reflection = sphereHit.reflect;

    // If partially reflective reflect light
    if (reflection > 0.0 && iter < 10) {
      vec3 intersectNormal = rayTo(sphereHit.center, intersectPoint);
      vec3 reflectDir = reflectionRays(r_direction, intersectNormal);
      nextRay = Ray(intersectPoint, getDirection(reflectDir));
    }

    // If partially non-reflective absorb light
    if (reflection < 1.0) {

      // Calculate light
      vec3 surfaceNormal = normalize(intersectPoint - sphereHit.center);
      R1 = 0.0; G1 = 0.0; B1 = 0.0;
      for (int i=0; i<LIGHTS; i++) {
        Light light = lights[i];
        if (light.pos.z < 0.0) continue;
        
        float intensity = calculateRayLightIntensity(intersectPoint, surfaceNormal, light, luminance);

        R1 = max(R1, intensity * light.r);
        G1 = max(G1, intensity * light.g);
        B1 = max(B1, intensity * light.b);
      }

      // Ambient light
      V = 1.0 * 0.7 + 0.1;
    }

    // Calculate RGB
    r *= R1 * R2;
    g *= G1 * G2;
    b *= B1 * B2;
    
  } else {

    // Calculate floor / ceil intercept
    // If issues know that va is being change in here
    vec3 pt = intersectingRayFloor(d.pos, d.dir.va, d.dir.ha);
    float tx = fmod(pt.x, 3.0);
    float ty = fmod(pt.y, 3.0);

    // Calculate texture
    if (pt.z > 0.0) {
      V = xor((tx > 1.5), (ty > 1.5)) ? 0.4 : 0.7;

      // Calculate normals
      vec3 intersectPoint = vec3(pt.x, pt.y, 0.0);
      vec3 surfaceNormal = vec3(0.0, 0.0, 1.0);
      vec3 reflectDir = reflectionRays(r_direction, surfaceNormal);

      // Calculate light
      r = 0.0; g = 0.0; b = 0.0;
      for (int i=0; i<LIGHTS; i++) {
        Light light = lights[i];
        if (light.pos.z < 0.0) continue;
        
        float intensity = calculateRayLightIntensity(intersectPoint, surfaceNormal, light, luminance);

        r = max(r, intensity * light.r);
        g = max(g, intensity * light.g);
        b = max(b, intensity * light.b);
      }

      r *= V; g *= V; b *= V;

      // Reflective floor
      reflection = 0.1;
      nextRay = Ray(intersectPoint, getDirection(reflectDir));
    } else {
      V = 1.0;
      B = 0.0;
    }
  }

  return RayTrace(r, g, b, V, B, reflection, nextRay);
}

`;

/*























*/
