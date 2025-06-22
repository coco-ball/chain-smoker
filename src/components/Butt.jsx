import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export default function Butt({ index, buttData, cigModel, ashModel }) {
  const burn = buttData.burn;
  //   const ashScale = buttData.ashScale;
  const time = buttData.time;

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [cloned, setCloned] = useState(null);
  const [ash, setAsh] = useState(null); // 🔹 ash 추가
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

    console.log("clone", clone.position);

    setClipPlane(plane);
    setPlaneHelper(helper);
    setCloned(clone);
  }, [cigModel, burn]);

  //   useEffect(() => {
  //     if (cloned && planeHelper) {
  //       cloned.add(planeHelper);
  //     }
  //   }, [cloned, planeHelper]);

  useEffect(() => {
    if (!ashModel) return;

    const ashClone = ashModel.clone(true);
    ashClone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });
    ashClone.position.set(-(-1.4 + burn), 0, 0);
    ashClone.scale.set(1, 0.3, 1);
    // ashClone.position.set(0, 1, 0);
    // ashClone.scale.set(5, 5, 5);
    ashClone.rotation.set(0, 0, Math.PI / 2);

    console.log(ashClone.position);
    console.log(ashModel.toJSON());
    console.log("ashModel", ashModel); // ashModel 전체 구조 보기

    setAsh(ashClone);
  }, [ashModel, burn]);

  useFrame(() => {
    // 로테이션
    // if (hovered && meshRef.current) {
    //   meshRef.current.rotation.y += 0.01;
    // }

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
    <>
      <group
        ref={meshRef}
        position={[index * 3 - 3, -1, 0]}
        scale={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={cloned} />
      </group>
      {ash && (
        <primitive
          object={ash}
          position={[index * 3 - 3 + -(-1.4 + burn), -1, 0]}
        />
      )}
      {hovered && (
        <Html center>
          <div className="timestamp">{new Date(time).toLocaleString()}</div>
        </Html>
      )}
    </>
  );
}
