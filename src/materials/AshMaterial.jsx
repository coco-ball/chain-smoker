import * as THREE from "three";

export function createAshMaterial() {
  const uniforms = {
    time: { value: 0 },
    viewVector: { value: new THREE.Vector3() },

    // Noise 색상 팔레트 (Ashima 스타일 유사 구현)
    colorA: { value: new THREE.Color("#3F3F3F") },
    colorB: { value: new THREE.Color("#888888") },
    colorC: { value: new THREE.Color("#313131") },
    colorD: { value: new THREE.Color("#111111") },

    // Fresnel Glow Colors
    fresnelColor1: { value: new THREE.Color("#FFE390") },
    fresnelColor2: { value: new THREE.Color("#EB0000") },
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vPos;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = -mvPosition.xyz;
      vPos = position;

      // Displacement: Perlin-like (단순화된 흉내)
      float d = sin(position.x * 40.0 + position.z * 30.0) * 0.9;
      vec3 displaced = position + normal * d;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vPos;

    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform vec3 colorC;
    uniform vec3 colorD;
    uniform vec3 fresnelColor1;
    uniform vec3 fresnelColor2;

    // Hash function (GLSL noise 대체)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    // Fake noise (Ashima 유사)
    float pseudoNoise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 151.7182))) * 43758.5453);
    }

    vec3 getNoiseColor(vec3 pos) {
      float n = pseudoNoise(pos * 2.95); // Movement 값 적용
      if (n < 0.25) return colorA;
      else if (n < 0.5) return colorB;
      else if (n < 0.75) return colorC;
      else return colorD;
    }

    float fresnel(vec3 normal, vec3 viewDir, float bias, float scale, float power) {
      return bias + scale * pow(1.0 - dot(normalize(normal), normalize(viewDir)), power);
    }

    void main() {
      vec3 base = getNoiseColor(vPos);

      float f1 = fresnel(vNormal, vViewDir, 0.01, 0.3, 3.5);
      float f2 = fresnel(vNormal, vViewDir, 0.02, 0.3, 7.5);

      vec3 glow1 = fresnelColor1 * f1*1.5;
      vec3 glow2 = fresnelColor2 * f2*2.5;

      vec3 finalColor = base + glow1 + glow2;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    lights: false,
    transparent: false,
  });
}
