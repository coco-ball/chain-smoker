// Butt.jsx
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
  const { burn, time, duration } = buttData;
  const isNew = !duration || duration <= 0;
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [cloned, setCloned] = useState(null);
  const [ash, setAsh] = useState(null);
  const clipPlaneRef = useRef(null);

  const leafWrap = useTexture("/textures/leafWrap.png");
  leafWrap.magFilter = THREE.NearestFilter;
  leafWrap.anisotropy = 16;

  // coverWrap = useTexture(
  //   isNew ? "/textures/coverWrap.png" : "/textures/coverWrapBurnt.png"
  // );

  useEffect(() => {
    if (!cigModel) return;

    const clone = cigModel.clone(true);
    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -(-1.4 + burn));
    clipPlaneRef.current = plane;

    clone.traverse((child) => {
      if (!child.isMesh) return;

      if (child.name === "Cover") {
        child.material = new THREE.MeshStandardMaterial({
          map: coverWrap,
          roughnessMap: coverRoughness,
          metalness: 0.1,
          roughness: 0.9,
          transparent: true,
          side: THREE.DoubleSide,
          clippingPlanes: [plane],
        });
      } else if (child.name === "Leaf") {
        child.material = new THREE.MeshStandardMaterial({
          map: leafWrap,
          transparent: true,
          side: THREE.DoubleSide,
          clippingPlanes: [plane],
        });
      } else if (child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.side = THREE.DoubleSide;
        child.material.clippingPlanes = [plane];
      }
    });

    setCloned(clone);
  }, [cigModel, burn, coverWrap, coverRoughness, leafWrap]);

  useEffect(() => {
    if (!ashModel) return;

    const ashClone = ashModel.clone(true);
    ashClone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });

    ashClone.scale.set(1, 0.3, 1);
    ashClone.rotation.set(0, 0, Math.PI / 2);
    ashClone.position.set(-(-1.4 + burn), 0, 0);

    setAsh(ashClone);
  }, [ashModel, burn]);

  useFrame(() => {
    const plane = clipPlaneRef.current;
    if (!meshRef.current || !plane) return;

    const worldMatrix = meshRef.current.matrixWorld;
    const newPlane = plane.clone().applyMatrix4(worldMatrix);

    meshRef.current.traverse((child) => {
      if (child.isMesh && child.material?.clippingPlanes?.length > 0) {
        child.material.clippingPlanes = [newPlane];
      }
    });
  });

  if (!cloned) return null;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={cloned} />
      {ash && (
        <primitive
          object={ash}
          position={[...position].map((v, i) =>
            i === 0 ? v + -(-1.4 + burn) : v
          )}
        />
      )}
      {hovered && (
        <Html center>
          <div className="timestamp">
            🕒 {new Date(time).toLocaleString()} <br />
            {isNew
              ? "New one!"
              : `You smoked this butt for ${(duration / 1000).toFixed(
                  1
                )} seconds.`}
          </div>
        </Html>
      )}
    </group>
  );
}
