import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function CigaretteScene() {
  const { scene } = useGLTF("/models/cigarette.glb");
  const cover = scene.getObjectByName("Cover");
  const leaf = scene.getObjectByName("Leaf");

  const { camera } = useThree();
  const cigaretteGroup = useRef();
  const MAX_BURN = 2.3;
  const INITIAL_OFFSET = -1.3;
  const burnAmount = useRef(0);
  const burning = useRef(false);

  const burnClip = useRef(
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -INITIAL_OFFSET)
  );

  const mouse = useRef({ x: 0, y: 0 });

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
    const helper = new THREE.PlaneHelper(burnClip.current, 0.2, 0xff0000);
    cigaretteGroup.current.add(helper);
  }, []);

  useFrame(() => {
    if (!cigaretteGroup.current) return;

    // 클리핑 진행
    if (burning.current && burnAmount.current < MAX_BURN) {
      burnAmount.current += 0.002;
      burnClip.current.constant = -(INITIAL_OFFSET + burnAmount.current);
    }

    const rx = mouse.current.y * -2;
    const ry = mouse.current.x * -2;

    const radius = 4;
    const offset = burnAmount.current / 2; // 화면 중심 보정용 오프셋

    const targetX = Math.sin(ry) * radius - offset; // 카메라가 클리핑 방향으로 보정
    const targetZ = Math.cos(ry) * radius;
    const targetY = rx * 1.5;

    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
    camera.lookAt(offset, 0, 0); // 카메라 중심도 보정

    cigaretteGroup.current.position.set(0, 0, 0);
  });

  return <primitive object={scene} ref={cigaretteGroup} />;
}
