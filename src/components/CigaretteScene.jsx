import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function CigaretteScene({ burnAmount, ashLengthScale }) {
  const { scene: cigScene } = useGLTF("/models/cigarette.glb");
  const cover = cigScene.getObjectByName("Cover");
  const leaf = cigScene.getObjectByName("Leaf");

  const { scene: ashScene } = useGLTF("/models/ash.glb");
  const ash = ashScene.getObjectByName("Ash");

  const { camera } = useThree();
  const cigaretteGroup = useRef();
  const ashRef = useRef();

  const MAX_BURN = 2.5;
  const INITIAL_OFFSET = -1.4;
  //   const burnAmount = useRef(0);
  const burning = useRef(false);

  const burnClip = useRef(
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -INITIAL_OFFSET)
  );

  const mouse = useRef({ x: 0, y: 0 });

  //   const ashLengthScale = useRef(1);
  const growing = useRef(true);

  useEffect(() => {
    const onDown = () => (burning.current = true);
    const onUp = () => (burning.current = false);
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    const mats = [cover?.material, leaf?.material];
    for (const mat of mats) {
      if (!mat) continue;
      mat.transparent = true;
      mat.side = THREE.DoubleSide;
      mat.clippingPlanes = [burnClip.current];
    }
  }, [cover, leaf]);

  useEffect(() => {
    if (!cigaretteGroup.current) return;
    // const helper = new THREE.PlaneHelper(burnClip.current, 0.2, 0xff0000);
    // cigaretteGroup.current.add(helper);
  }, []);

  useEffect(() => {
    if (!ashRef.current) return;
    ashRef.current.position.set(-1.1, 0, 0);
    ashRef.current.scale.set(0.01, 0.01, 0.01);
    ashRef.current.rotation.set(0, 0, Math.PI / 2);
  }, []);

  useFrame(() => {
    if (!cigaretteGroup.current || !ashRef.current) return;

    // cigaretteGroup 클리핑
    if (burning.current && burnAmount.current <= MAX_BURN) {
      burnAmount.current += 0.002;
      burnClip.current.constant = -(INITIAL_OFFSET + burnAmount.current);
    }

    // console.log(burnAmount.current, growing.current);

    // Ash 조건부 표시 및 위치/스케일 업데이트
    if (
      burning.current &&
      burnAmount.current > 0.3 &&
      ashLengthScale.current >= 0.3
    ) {
      const newX = INITIAL_OFFSET + burnAmount.current;
      ashRef.current.position.x = newX;

      if (burnAmount.current >= MAX_BURN) {
        growing.current = false;
      }

      if (growing.current) {
        ashLengthScale.current += 0.002;
        if (ashLengthScale.current >= 1.3) {
          growing.current = false;
        }
      } else {
        ashLengthScale.current -= 0.002;
        if (ashLengthScale.current <= 0.5 && burnAmount.current < MAX_BURN) {
          growing.current = true;
        }
      }

      ashRef.current.scale.set(0.01, 0.01 * ashLengthScale.current, 0.01);
    }

    // 카메라 회전
    const rx = mouse.current.y * -2;
    const ry = mouse.current.x * -2;

    const radius = 4;
    const offset = burnAmount.current / 2;

    const targetX = Math.sin(ry) * radius - offset;
    const targetZ = Math.cos(ry) * radius;
    const targetY = rx * 1.5;

    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
    camera.lookAt(offset, 0, 0);

    cigaretteGroup.current.position.set(0, 0, 0);
  });

  return (
    <>
      <primitive object={cigScene} ref={cigaretteGroup} />
      {ash && <primitive object={ash} ref={ashRef} />}
    </>
  );
}
