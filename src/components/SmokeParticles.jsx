import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function SmokeParticles({ position }) {
  const particles = useRef();

  const count = 30;
  const dummyPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.1;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return arr;
  }, []);

  const velocities = useRef(
    Array.from(
      { length: count },
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          0.01 + Math.random() * 0.01,
          (Math.random() - 0.5) * 0.01
        )
    )
  );

  useFrame(() => {
    if (!particles.current) return;
    const positions = particles.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx + 0] += velocities.current[i].x;
      positions[idx + 1] += velocities.current[i].y;
      positions[idx + 2] += velocities.current[i].z;

      // 연기 너무 올라가면 리셋
      if (positions[idx + 1] > 1) {
        positions[idx + 0] = (Math.random() - 0.5) * 0.1;
        positions[idx + 1] = 0;
        positions[idx + 2] = (Math.random() - 0.5) * 0.1;
      }
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particles} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={dummyPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#bbbbbb"
        opacity={0.5}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
