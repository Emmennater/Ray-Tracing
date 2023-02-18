
var rayCollision = glsl`

struct Sphere {
    vec3 center;
    float radius;
    float reflect;
};

struct Light {
    vec3 pos;
    float r, g, b;
    float strength;
    float radius;
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

struct Collision {
    Result result;
    Sphere sphereHit;
};

const int SPHERES = 7;

struct Spheres {
    Sphere spheres[SPHERES];
};

Collision collideSphere(vec3 rayOrigin, vec3 rayDirection) {
    // Spheres
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
        vec3 sphereCenter = spheres[i].center;
        float sphereRadius = spheres[i].radius;
        results[i] = intersectRaySphere(rayOrigin, rayDirection, sphereCenter, sphereRadius);
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

    return Collision(res, sphereHit);
}

Collision checkCollideSphere(vec3 rayOrigin, vec3 rayDirection, float len) {
    // Spheres
    const int SPHERES = 7;
    Sphere spheres[SPHERES];
    spheres[0] = Sphere(vec3(10.0, 0.0, 2.0), 2.0, 0.25);
    spheres[1] = Sphere(vec3(10.0, 0.0, 5.0), 1.5, 0.5);
    spheres[2] = Sphere(vec3(10.0, 0.0, 7.3), 1.0, 0.75);
    spheres[3] = Sphere(vec3(8.0, 6.0, 3.0), 3.0, 1.0);
    spheres[4] = Sphere(vec3(14.0, 4.0, 1.5), 1.5, 0.0);
    spheres[5] = Sphere(vec3(40.0, 40.0, 50.0), 50.0, 0.8);
    spheres[6] = Sphere(vec3(cos(t*0.01)*4.0+22.0, sin(t*0.01)*4.0-4.0, 2.0), 2.0, 1.0);

    float closestDist = 10000000.0;
    float farthestDist = 0.0;
    Result result = Result(false, 0.0, 0.0);
    Sphere sphere;
    for (int i=0; i<SPHERES; i++) {
        // Check for intersect with sphere
        Sphere s = spheres[i];
        vec3 sphereCenter = s.center;
        float sphereRadius = s.radius;
        Result r = intersectRaySphere(rayOrigin, rayDirection, sphereCenter, sphereRadius);
        if (r.exist && r.a < len) {
            // Sphere has intersected with ray
            return Collision(r, s);
        }
    }

    return Collision(result, sphere);
}

Collision calculateLight(vec3 intersectPoint, vec3 surfaceNormal, vec3 lightPos) {
    vec3 rayToLight = lightPos - intersectPoint;
    vec3 lightNormal = normalize(rayToLight);
    float d = length(rayToLight);
    
    // Shadows
    return checkCollideSphere(intersectPoint, lightNormal, d);
}

float calculateShadowIntensity(vec3 intersectPoint, vec3 lightNormal, float distToLight, float lightRadius) {
    // penumbra shadow mapping - contact hardening shadows
    
    // Spheres
    const int SPHERES = 7;
    Sphere spheres[SPHERES];
    spheres[0] = Sphere(vec3(10.0, 0.0, 2.0), 2.0, 0.25);
    spheres[1] = Sphere(vec3(10.0, 0.0, 5.0), 1.5, 0.5);
    spheres[2] = Sphere(vec3(10.0, 0.0, 7.3), 1.0, 0.75);
    spheres[3] = Sphere(vec3(8.0, 6.0, 3.0), 3.0, 1.0);
    spheres[4] = Sphere(vec3(14.0, 4.0, 1.5), 1.5, 0.0);
    spheres[5] = Sphere(vec3(40.0, 40.0, 50.0), 50.0, 0.8);
    spheres[6] = Sphere(vec3(cos(t*0.01)*4.0+22.0, sin(t*0.01)*4.0-4.0, 2.0), 2.0, 1.0);

    // Check for intersect with spheres
    float shadow = 0.0;
    for (int i=0; i<SPHERES; i++) {
        Sphere sphere = spheres[i];
        Result result = intersectRaySphere(intersectPoint, lightNormal, sphere.center, sphere.radius);
        // Sphere has intersected with ray
        if (result.exist && result.a < distToLight) {
            // Calculate shadow
            // Calculate edge angle
            vec3 rayToSphere = sphere.center - intersectPoint;
            float distToSphere = length(rayToSphere);
            float edgeAngle = distToSphere < lightRadius ?
                0.0 : asin(sphere.radius / distToSphere);

            // Calculate angle between intersect to light pos and sphere pos
            float angle = angleBetween(normalize(rayToSphere), lightNormal);

            // The intensity is how close the angle is to the edge angle
            float blend = min(distToLight - result.a + 1.0, 10.0);
            shadow += 1.0 - pow(angle / edgeAngle, blend); // * (result.a + 10.0) / (distToLight + 10.0);
        }
    }

    return 1.0 - shadow;
}

float calculateRayLightIntensity(vec3 intersectPoint, vec3 surfaceNormal, Light light, float luminance) {
    // Collision c = calculateLight(intersectPoint, surfaceNormal, light.pos);

    // Calculate light ray
    vec3 rayToLight = light.pos - intersectPoint;
    vec3 lightNormal = normalize(rayToLight);
    float distToLight = length(light.pos - intersectPoint);

    // Shadow is determined by distance from edge and distance to light
    float intensity = calculateShadowIntensity(intersectPoint, lightNormal, distToLight, light.radius);

    // float bright = 1.0;
    float bright = max(0.0, dot(lightNormal, surfaceNormal));
    bright *= 1.0 / (pow(distToLight, 2.0) / (luminance * light.strength) + 0.1);
    
    // Return intensity
    return bright * intensity;
}

`;

/* OLD CODE:

    // Cast serveral rays for soft shadows
    float randoff = t + fragTex.s * 10.0 + fragTex.t;
    for (int i=0; i<10; i++) {
        float ioff = rand(randoff);
        float joff = rand(randoff);
        float x = cos(joff) * cos(ioff);
        float y = cos(joff) * sin(ioff);
        float z = sin(joff);
        vec3 spherePoint = vec3(x, y, z) * light.radius + light.pos;
        calculations++;
        totalIntensity += 1.0 - float(calculateLight(intersectPoint, surfaceNormal, spherePoint));
    }

    // Old light math comments:
    // Calculate angle between angle to sphere and angle to sphereIntersect (surfaceNormal)
    // Use ratios: (angleBetween / edgeAngle) * (distToIntersect / distToLight)
    // to determine the intensity
    // intensity = (angle / edgeAngle) * (c.result.a / d);

*/
