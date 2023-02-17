var raytraceMath = glsl`

struct Sphere {
  vec3 center;
  float radius;
  float reflect;
};

struct Light {
  vec3 pos;
  float r, g, b;
  float strength;
};

struct Ray {
  vec3 pos;
  Direction dir;
};

struct RayTrace {
  float r, g, b;
  float V, B;
  float reflect;
  Ray next;
};

RayTrace traceRay(Ray d, int iter, float raylength) {
  // Pixel Calculation
  float r = 1.0, g = 1.0, b = 1.0;
  float V = 1.0, B = 1.0;

  vec3 r_origin = d.pos;
  vec3 r_direction = d.dir.ray;
  
  float reflection = 0.0;
  Ray nextRay;

  // Spheres
  const int SPHERES = 7;
  Result results[SPHERES];
  Sphere spheres[SPHERES];
  spheres[0] = Sphere(vec3(10.0, 0.0, 2.0), 2.0, 0.25);
  spheres[1] = Sphere(vec3(10.0, 0.0, 5.0), 1.5, 0.5);
  spheres[2] = Sphere(vec3(10.0, 0.0, 7.3), 1.0, 0.75);
  spheres[3] = Sphere(vec3(8.0, 6.0, 3.0), 3.0, 1.0);
  spheres[4] = Sphere(vec3(14.0, 4.0, 1.5), 1.5, 0.0);
  spheres[5] = Sphere(vec3(40.0, 40.0, 50.0), 50.0, 0.8);
  spheres[6] = Sphere(vec3(cos(t*0.01)*4.0+22.0, sin(t*0.01)*4.0-4.0, 2.0), 2.0, 1.0);

  for (int i=0; i<SPHERES; i++) {
    // Check for intersect with sphere
    vec3 s_center = spheres[i].center;
    float s_radius = spheres[i].radius;
    results[i] = intersectRaySphere(r_origin, r_direction, s_center, s_radius);
  }

  // Find closest result
  float closestDist = 10000000.0;
  Sphere sphereHit;
  Result res = Result(false, 0.0, 0.0);
  for (int i=0; i<SPHERES; i++) {
    if (!results[i].exist) continue;
    if (results[i].a < closestDist) {
      closestDist = results[i].a;
      sphereHit = spheres[i];
      res = results[i];
    }
  }

  // Point light
  const int LIGHTS = 4;
  Light lights[LIGHTS];
  const float sp = 0.002;
  const float ns = 0.1;
  const float luminance = 100.0;
  const float dst = 50.0;
  lights[0] = Light(vec3(dst*noise(t*sp-10.0), dst*noise(t*sp-20.0), 30.0*noise(t*sp-30.0)+20.0), 1.0, 0.0, 0.0, 1.0);
  lights[1] = Light(vec3(dst*noise(t*sp+10.0), dst*noise(t*sp+20.0), 30.0*noise(t*sp+30.0)+20.0), 0.0, 1.0, 0.0, 1.0);
  lights[2] = Light(vec3(dst*noise(t*sp+40.0), dst*noise(t*sp+50.0), 30.0*noise(t*sp+60.0)+20.0), 0.0, 0.0, 1.0, 1.0);
  lights[3] = Light(vec3(-10.0, 0.0, 10.0), 1.0, 1.0, 1.0, 2.0);

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
      R1 = 0.0; G1 = 0.0; B1 = 0.0;
      for (int i=0; i<LIGHTS; i++) {
        Light light = lights[i];
        if (light.pos.z < 0.0) continue;
        vec3 rayToLight = light.pos - intersectPoint;
        float d = length(rayToLight);
        float bright = calculateBrightness(intersectPoint, sphereHit.center, light.pos);
        bright *= 1.0 / (d * d / (luminance * light.strength) + 0.1);
        R1 = max(R1, bright * light.r);
        G1 = max(G1, bright * light.g);
        B1 = max(B1, bright * light.b);
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
    // B = 1.0 / pow(pt.z, 0.2) + 0.1;
    // B = 1.0 / pt.z;
    if (pt.z > 0.0) {
      // V = ((tx > 0.1) && (ty > 0.1)) ? 0.2 : 0.3;
      V = xor((tx > 1.5), (ty > 1.5)) ? 0.4 : 0.7;
      // V *= (1.0 / (1.0 + pow((pt.z + raylength) / 10.0, 2.0)));
      // r = V; g = V; b = V;

      // Calculate normals
      vec3 intersectPoint = vec3(pt.x, pt.y, 0.0);
      vec3 surfaceNormal = vec3(0.0, 0.0, 1.0);
      vec3 reflectDir = reflectionRays(r_direction, surfaceNormal);

      // Calculate light
      r = 0.0; g = 0.0; b = 0.0;
      for (int i=0; i<LIGHTS; i++) {
        Light light = lights[i];
        if (light.pos.z < 0.0) continue;
        vec3 rayToLight = light.pos - intersectPoint;
        vec3 lightNormal = normalize(rayToLight);
        float d = length(rayToLight);
        float bright = max(0.0, dot(lightNormal, surfaceNormal));
        bright *= 1.0 / (d * d / (luminance * light.strength) + 0.1);
        r = max(r, bright * light.r);
        g = max(g, bright * light.g);
        b = max(b, bright * light.b);
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
