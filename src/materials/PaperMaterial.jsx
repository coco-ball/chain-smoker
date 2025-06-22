// Import 필요한 THREE.js 요소
import * as THREE from "three";

// ===== createPaperMaterial (pattern 제거 + wrap 레이어만 반영) =====
export function createPaperMaterial(textureLoader) {
  const paperTexture = textureLoader.load("./paper.png");
  paperTexture.wrapS = paperTexture.wrapT = THREE.RepeatWrapping;
  paperTexture.repeat.set(16, 4);

  const wrapTexture = textureLoader.load("./coverWrap.png");
  wrapTexture.wrapS = wrapTexture.wrapT = THREE.RepeatWrapping;
  wrapTexture.repeat.set(1, 1);
  wrapTexture.encoding = THREE.sRGBEncoding;

  const uniforms = {
    time: { value: 0 },
    paperTex: { value: paperTexture },
    coverWrapTex: { value: wrapTexture },

    // Noise color palette
    noiseA: { value: new THREE.Color("#727986") },
    noiseB: { value: new THREE.Color("#2B3655") },
    noiseC: { value: new THREE.Color("#404C7A") },
    noiseD: { value: new THREE.Color("#263C56") },

    fresnelColor: { value: new THREE.Color("#A0BDC6") },
    viewVector: { value: new THREE.Vector3() },
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vPos;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = -mvPosition.xyz;
      vPos = position;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vPos;

    uniform sampler2D paperTex;
    uniform sampler2D coverWrapTex;
    uniform vec3 noiseA, noiseB, noiseC, noiseD;
    uniform vec3 fresnelColor;
    uniform float time;

    float pseudoNoise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 151.7182))) * 43758.5453);
    }

    vec3 getNoiseColor(vec3 pos) {
      float n = pseudoNoise(pos + time * 0.2);
      if (n < 0.25) return noiseA;
      else if (n < 0.5) return noiseB;
      else if (n < 0.75) return noiseC;
      else return noiseD;
    }

    float fresnel(vec3 normal, vec3 viewDir, float bias, float scale, float power) {
      return bias + scale * pow(1.0 - dot(normalize(normal), normalize(viewDir)), power);
    }

    vec3 overlay(vec3 base, vec3 blend) {
      return mix(
        2.0 * base * blend,
        1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
        step(0.5, base)
      );
    }

    void main() {
      vec3 tex = texture2D(paperTex, vUv).rgb;
      vec3 wrap = texture2D(coverWrapTex, vUv).rgb;
      vec3 noise = getNoiseColor(vPos);

      float shade = dot(normalize(vNormal), normalize(vec3(0.4, 0.8, 1.0)));
      float f = fresnel(vNormal, vViewDir, 0.1, 1.0, 1.5);
      vec3 fresnelGlow = fresnelColor * f;

      vec3 finalColor = tex * 0.5;
      finalColor = overlay(finalColor, wrap);
      finalColor = mix(finalColor, noise, 0.5);
      finalColor *= shade * 0.8;
      finalColor = overlay(finalColor, fresnelGlow);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    clipping: true,
    clippingPlanes: [],
    lights: false,
    transparent: true,
  });
}
