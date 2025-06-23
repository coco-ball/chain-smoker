// AshtrayScene.jsx
import { useEffect, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import Butt from "./Butt";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function AshtrayScene() {
  const [butts, setButts] = useState([]);
  const { scene: cigScene } = useGLTF("/models/cigarette.glb");
  const { scene: ashScene } = useGLTF("/models/ash.glb");
  const ash = ashScene.getObjectByName("Ash");

  // const coverWrap = useTexture("/textures/coverWrapBurnt.png");
  // const coverRoughness = useTexture("/textures/coverRoughness.png");
  // coverRoughness.encoding = THREE.LinearEncoding;
  // coverWrap.encoding = THREE.sRGBEncoding;
  // coverWrap.minFilter = THREE.LinearMipMapLinearFilter;
  // coverWrap.magFilter = THREE.NearestFilter;
  // coverWrap.anisotropy = 16;

  const totalDuration = butts.reduce((sum, b) => sum + (b.duration || 0), 0);

  const { camera } = useThree();
  const pileCenter = new THREE.Vector3(0, 5, 0);

  const cameraTarget = {
    position: new THREE.Vector3(0, 7, 0),
    fov: 10,
    lookAt: pileCenter,
  };

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  useEffect(() => {
    if (!ashScene) return;

    const data = JSON.parse(localStorage.getItem("ashtray") || "[]");
    setButts(data.slice(-20)); // 최대 25개

    // 카메라 이동 애니메이션
    let frame = 0;
    const totalFrames = 80;
    const initialPos = camera.position.clone();
    const initialFov = camera.fov;

    const animate = () => {
      if (frame >= totalFrames) return;
      frame++;
      const t = easeInOutQuad(frame / totalFrames);

      camera.position.lerpVectors(initialPos, cameraTarget.position, t);
      camera.fov = initialFov + (cameraTarget.fov - initialFov) * t;
      camera.lookAt(cameraTarget.lookAt);
      camera.updateProjectionMatrix();

      requestAnimationFrame(animate);
    };

    animate();
  }, [ashScene]);

  const getRandomAroundPile = () =>
    pileCenter.clone().add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 3, // X
        (Math.random() - 0.5) * 0.6, // Y: 약 -0.3 ~ +0.3
        (Math.random() - 0.5) * 4 // Z
      )
    );

  const getRandomRotation = () =>
    new THREE.Euler(
      (Math.random() - 0.5) * 0.2, // X: -0.1 ~ 0.1
      Math.random() * Math.PI * 2, // Y: 자유롭게
      (Math.random() - 0.5) * 0.2 // Z: -0.1 ~ 0.1
    );

  return (
    <>
      {ashScene &&
        cigScene &&
        butts.map((data, i) => {
          const pos = getRandomAroundPile();
          const rot = getRandomRotation();
          return (
            <Butt
              key={i}
              index={i}
              buttData={data}
              cigModel={cigScene.clone()}
              ashModel={ash?.clone()}
              position={pos.toArray()}
              rotation={rot.toArray()}
              // coverWrap={coverWrap}
              // coverRoughness={coverRoughness}
            />
          );
        })}
      <Html center>
        <div className="total-time">
          You smoked for {(totalDuration / 1000).toFixed(1)} seconds
        </div>
      </Html>
    </>
  );
}
