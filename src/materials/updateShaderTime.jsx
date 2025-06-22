import { useFrame } from "@react-three/fiber";

export function useAshTimeUniform(materialRef) {
  useFrame((_, delta) => {
    if (materialRef.current) {
      const mat = materialRef.current;
      mat.uniforms.time.value += delta;
    }
  });
}
