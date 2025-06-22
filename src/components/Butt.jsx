//Butt.jsx
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";

export default function Butt({
  buttData,
  cigModel,
  ashModel,
  position,
  rotation,
  coverWrap,
  coverRoughness,
}) {
  const burn = buttData.burn;
  const time = buttData.time;

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [cloned, setCloned] = useState(null);
  const [ash, setAsh] = useState(null);
  const [clipPlane, setClipPlane] = useState(null);
  const [planeHelper, setPlaneHelper] = useState(null);

  const leafWrap = useTexture("/textures/leafWrap.png");
  leafWrap.magFilter = THREE.NearestFilter;
  leafWrap.anisotropy = 16;

  useEffect(() => {
    if (!cigModel) return;

    const clone = cigModel.clone(true);
    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -(-1.4 + burn));
    const helper = new THREE.PlaneHelper(plane, 0.3, 0xff0000);

    clone.traverse((child) => {
      if (child.isMesh && child.name === "Cover") {
        const mat = new THREE.MeshStandardMaterial({
          map: coverWrap,
          roughnessMap: coverRoughness,
          metalness: 0.1,
          roughness: 0.9,
          transparent: true,
          side: THREE.DoubleSide,
          clippingPlanes: [plane],
        });
        mat.map.wrapS = THREE.RepeatWrapping;
        mat.map.wrapT = THREE.RepeatWrapping;
        mat.map.anisotropy = 16;
        mat.roughnessMap.encoding = THREE.LinearEncoding;

        child.material = mat;
      } else if (child.isMesh && child.name === "Leaf") {
        const leafMaterial = new THREE.MeshStandardMaterial({
          map: leafWrap,
          transparent: true,
          side: THREE.DoubleSide,
          clippingPlanes: [plane],
        });
        leafMaterial.map.wrapS = THREE.RepeatWrapping;
        leafMaterial.map.wrapT = THREE.RepeatWrapping;
        child.material = leafMaterial;
      } else if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.side = THREE.DoubleSide;
        child.material.clippingPlanes = [plane];
      }
    });

    setClipPlane(plane);
    setPlaneHelper(helper);
    setCloned(clone);
  }, [cigModel, burn, coverWrap, leafWrap, coverRoughness]);

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
    ashClone.rotation.set(0, 0, Math.PI / 2);

    setAsh(ashClone);
  }, [ashModel, burn]);

  useFrame(() => {
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
        position={position}
        rotation={rotation}
        scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={cloned} />
        {hovered && (
          <Html center>
            <div className="timestamp">
              🕒 {new Date(time).toLocaleString()}
            </div>
          </Html>
        )}
      </group>
      {ash && (
        <primitive
          object={ash}
          position={new THREE.Vector3(...position)
            .add(new THREE.Vector3(-(-1.4 + burn), 0, 0))
            .toArray()}
        />
      )}
    </>
  );
}
