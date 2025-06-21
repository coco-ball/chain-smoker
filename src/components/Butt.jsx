import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export default function Butt({ index, buttData, cigModel }) {
  const burn = buttData.burn;
  //   const ashScale = buttData.ashScale;
  const time = buttData.time;

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [cloned, setCloned] = useState(null);
  const [clipPlane, setClipPlane] = useState(null);
  const [planeHelper, setPlaneHelper] = useState(null);

  useEffect(() => {
    if (!cigModel) return;

    const clone = cigModel.clone(true);
    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -(-1.4 + burn));
    const helper = new THREE.PlaneHelper(plane, 0.3, 0xff0000);

    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.side = THREE.DoubleSide;
        child.material.clippingPlanes = [plane];
      }
    });

    setClipPlane(plane);
    setPlaneHelper(helper);
    setCloned(clone);
  }, [cigModel, burn]);

  useEffect(() => {
    if (cloned && planeHelper) {
      cloned.add(planeHelper);
    }
  }, [cloned, planeHelper]);

  useFrame(() => {
    if (hovered && meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }

    // 클리핑 Plane 위치가 담배와 함께 회전하도록
    if (meshRef.current && clipPlane) {
      const worldMatrix = meshRef.current.matrixWorld;
      const newPlane = clipPlane.clone().applyMatrix4(worldMatrix);
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material?.clippingPlanes?.length > 0) {
          child.material.clippingPlanes = [newPlane];
        }
      });
      if (planeHelper) planeHelper.plane = newPlane;
    }
  });

  if (!cloned) return null;

  return (
    <group
      ref={meshRef}
      position={[index * 3 - 3, -1, 0]}
      scale={[1, 1, 1]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={cloned} />
      {hovered && (
        <Html center>
          <div className="timestamp">{new Date(time).toLocaleString()}</div>
        </Html>
      )}
    </group>
  );
}
