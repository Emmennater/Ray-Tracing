var glsl = function() {
  // I have glsl mutliline string tag for syntax highlighting
  // but now I have to return whatever that string originally
  // was supposed to be... easier said then done because I am
  // using ${variables}
  let str = arguments[0];
  str = str.join('\n');

  let items, index = 1;
  for (let i=1; i<arguments.length; i++) {
    let includeIdx = str.indexOf("#include ");
    str = str.substring(0, includeIdx) + arguments[i] + str.substring(includeIdx+10);
  }

  return str;
}

{var shaderFunctions = glsl`
int modulo(int num, int divisor) {
    return (num - divisor * (num / divisor));
}

float fmod(float x, float y) {
    return x - y * floor(x / y);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float lerp(float a, float b, float v) {
  return a * (1.0 - v) + b * v;
}

float dist(float a, float b, float c, float d) {
  float e = c - a;
  float f = d - b;
  return sqrt(e * e + f * f);
}

bool xor(bool a, bool b) {
  return (a && !b) || (!a && b);
}

vec3 rgb(int r, int g, int b) {
  return vec3(
    float(r) / 255.0,
    float(g) / 255.0,
    float(b) / 255.0
  );
}

vec3 lerpCol(float r0, float g0, float b0, float r1, float g1, float b1, float v) {
  return vec3(
    lerp(r0, r1, v),
    lerp(g0, g1, v),
    lerp(b0, b1, v)
  );
}

vec3 lerpCol(vec3 c0, vec3 c1, float v) {
  return lerpCol(c0.x, c0.y, c0.z, c1.x, c1.y, c1.z, v);
}

vec2 hash( vec2 p ) // replace this by something better
{
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x); 
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
	vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}

/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return (dot(d, vec4(52.0)) + 1.0) / 2.0;
}

float noise2(float a, float b) {
  return (noise(vec2(a, b)) + 1.0) / 2.0;
}

float noise(float a) {
  return noise(vec2(a, 0.0));
}

vec3 rayTo(vec3 a, vec3 b) {
  return normalize(b - a);
}

vec3 reflectionRays(vec3 a, vec3 b) {
  return a - 2.0 * dot(a, b) * b;
}

`;}

{var shaderMath = glsl`
vec3 intersectingRayFloor(vec3 initialPosition, float verticalAngle, float horizontalAngle) {
    verticalAngle += PI/2.0;
    float t = initialPosition.z / cos(verticalAngle);
    float d = initialPosition.z * tan(verticalAngle);
    float x = cos(horizontalAngle) * d + initialPosition.x;
    float y = sin(horizontalAngle) * d + initialPosition.y;
    vec3 pt = vec3( x, y, t );
    return pt;
}

vec2 getAngles(float x, float y, float n) {
  // Calculate horizontal angle
  float horizontalAngle = atan(x / n);

  // Calculate vertical angle
  float verticalAngle = atan(y / n);

  // Pack the angles into a single float value
  return vec2((horizontalAngle + 1.0) / 2.0, verticalAngle / PI);
}

float atan2(float a, float b) {
    float angle = asin(a) > 0.0 ? acos(b) : -acos(b);
    return angle;
}

float atan2approx(float y, float x)
{
    //http://pubs.opengroup.org/onlinepubs/009695399/functions/atan2.html
    //Volkan SALMA

    float ONEQTR_PI = PI / 4.0;
	float THRQTR_PI = 3.0 * PI / 4.0;
	float r, angle;
	float abs_y = abs(y) + 0.000000001;      // kludge to prevent 0/0 condition
	if ( x < 0.0 ) {
		r = (x + abs_y) / (abs_y - x);
		angle = THRQTR_PI;
	} else {
		r = (x - abs_y) / (x + abs_y);
		angle = ONEQTR_PI;
	}
	angle += (0.1963 * r * r - 0.9817) * r;
	if ( y < 0.0 )
		return( -angle );     // negate if in quad III or IV
	else
		return( angle );
}

// Variables:
// camera pos
// camera angle
// near dist
// x, y on plane
// Process:
// - create vector from camera to plane at x, y
// - get angle of vector
// - return the x, y, z position of vector
//   and the angle

vec3 rotateVector(vec3 v, float pitch, float yaw) {
  mat3 rotX = mat3(
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, cos(pitch), -sin(pitch)),
    vec3(0.0, sin(pitch), cos(pitch))
  );

  mat3 rotY = mat3(
    vec3(cos(yaw), 0.0, sin(yaw)),
    vec3(0.0, 1.0, 0.0),
    vec3(-sin(yaw), 0.0, cos(yaw))
  );

  return rotY * (rotX * v);
}

vec3 rotateVector2(vec3 vector, float radians, int axis) {
    vec3 result;
    if (axis == 0) {
        result.x = vector.x;
        result.y = vector.y * cos(radians) - vector.z * sin(radians);
        result.z = vector.y * sin(radians) + vector.z * cos(radians);
    } else if (axis == 1) {
        result.x = vector.x * cos(radians) + vector.z * sin(radians);
        result.y = vector.y;
        result.z = -vector.x * sin(radians) + vector.z * cos(radians);
    } else {
        result = vector;
    }
    return result;
}

vec3 rotateVector3(vec3 vector, float pitchRadians, float yawRadians) {
    vec3 result;
    result.x = vector.x * cos(yawRadians) + vector.z * sin(yawRadians);
    result.y = vector.y * cos(pitchRadians) - vector.z * sin(pitchRadians);
    result.z = vector.x * sin(yawRadians) - vector.y * sin(pitchRadians) * cos(yawRadians) + vector.z * cos(pitchRadians) * cos(yawRadians);
    return result;
}

vec3 anglesToVec3(float horizontalAngle, float verticalAngle) {
  vec3 direction;
  direction.x = cos(verticalAngle) * cos(horizontalAngle);
  direction.y = cos(verticalAngle) * sin(horizontalAngle);
  direction.z = sin(verticalAngle);
  return direction;
}

vec2 vec3ToAngles(vec3 vector) {
  vec2 angles;
  angles.x = atan2approx(vector.y, vector.x);
  angles.y = asin(vector.z);
  return angles;
}

vec2 angleToSquareEdge(float angle) {
  const float size = 1.0;

  // Calculate the x and y coordinates of the point on the unit circle at the given angle
  float x = cos(angle);
  float y = sin(angle);

  // Calculate the absolute values of x and y to simplify the calculations
  float abs_x = abs(x);
  float abs_y = abs(y);
  float edge_distance;
  
  // Determine which edge of the square the point is closest to based on the angle
  if (abs_x > abs_y) {
    // Point is closest to left or right edge
    edge_distance = size / (2.0 * abs_x);
  } else {
    // Point is closest to top or bottom edge
    edge_distance = size / (2.0 * abs_y);
  }

  // Multiply the x and y coordinates by the edge distance to get the final x and y distances to the square edge
  float x_distance = x * edge_distance;
  float y_distance = y * edge_distance;

  return vec2(x_distance, y_distance);
}

vec2 squareToCircle(float x, float y) {
  // Calculate the angle (theta) of the point (x, y) relative to the center of the circle
  float theta = atan(x / y);
  vec2 d = angleToSquareEdge(theta);
  float r = 0.5;
  float x0 = cos(theta) * r;
  float y0 = sin(theta) * r;
  float x1 = x * d.x / x0;
  float y1 = y * d.y / y0;
  
  return vec2(x1, y1);
}

struct Direction {
  vec3 ray;
  float ha;
  float va;
};

Direction fishEye(float ha, float va, float x, float y, float FOV) {

  float HFOV = FOV;
  float VFOV = FOV;

  // Z Rotation Matrix
  float sin0 = sin(-ha);
  float cos0 = cos(-ha);
  mat3 matrixRotateZ = mat3(
    vec3(cos0, -sin0, 0.0),
    vec3(sin0, cos0, 0.0),
    vec3(0.0, 0.0, 1.0)
  );
  
  // Y Rotation Matrix
  sin0 = sin(va);
  cos0 = cos(va);
  mat3 matrixRotateY = mat3(
    vec3(cos0, 0.0, sin0),
    vec3(0.0, 1.0, 0.0),
    vec3(-sin0, 0.0, cos0)
  );

  // Convert to vector
  // vec2 dir = squareToCircle(x, y);
  // vec2 dir = vec2(x, y);
  // vec3 ray = anglesToVec3(dir.x * HFOV, dir.y * VFOV);
  
  const float near = 0.7;
  vec3 ray = normalize(vec3(near, x * HFOV, y * VFOV));

  // Rotate vectors
  ray = matrixRotateY * ray;
  ray = matrixRotateZ * ray;
    
  // Convert to angles
  vec2 rot = vec3ToAngles(ray);

  return Direction(ray, rot.x, rot.y);
}

Direction getDirection(vec3 ray) {
  // Convert to angles
  vec2 rot = vec3ToAngles(ray);
  return Direction(ray, rot.x, rot.y);
}

`;}

{var shaderCollisions = glsl`

struct Result {
  bool exist;
  float a;
  float b;
};

float dot(float f, vec3 v) {
    return f * v.x + f * v.y + f * v.z;
}

Result intersectRaySphere(vec3 rayOrigin, vec3 rayDirection, vec3 sphereCenter, float sphereRadius) {
  // Calculate the vector from the ray origin to the sphere center
  vec3 centerToRay = rayOrigin - sphereCenter;

  // Calculate the coefficients of the quadratic equation
  float a = dot(rayDirection, rayDirection);
  float b = 2.0 * dot(centerToRay, rayDirection);
  float c = dot(centerToRay, centerToRay) - sphereRadius * sphereRadius;

  // Calculate the discriminant
  float discriminant = b * b - 4.0 * a * c + 0.000000001;

  if (discriminant < 0.0) {
    // No intersection
    return Result(false, 0.0, 0.0);
  } else {
    // Two intersections
    float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
    if (t1 < 0.0) return Result(false, 0.0, 0.0);
    return Result(true, t1, 0.0);
  }
}


float calculateBrightness(vec3 intersectPoint, vec3 sphereCenter, vec3 pointLight) {
  // Calculate the normal vector at the intersection point
  vec3 normal = intersectPoint - sphereCenter;
  
  // Normalize the normal vector
  float normalLength = length(normal);
  vec3 normalizedNormal = normalize(normal);

  // Calculate the vector from the intersection point to the point light
  vec3 toLight = pointLight - intersectPoint;

  // Calculate the cosine of the angle between the normal vector and the vector to the point light
  float cosTheta = dot(normalizedNormal, normalize(toLight));

  // Calculate the brightness using the cosine of the angle
  float brightness = pow(max(cosTheta, 0.0), 1.5);

  return brightness;
}

`;}

/*






















*/
