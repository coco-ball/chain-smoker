import { useGLTF, useTexture, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { createAshMaterial } from "../materials/AshMaterial";
import { useAshTimeUniform } from "../materials/updateShaderTime";

export default function CigaretteScene({
  mode,
  setMode,
  burnAmount,
  ashLengthScale,
}) {
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

  const growing = useRef(true);

  const dropFinished = useRef(false);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  const sessionStartRef = useRef(null); // 시작 시간 기록용

  //materials
  const coverWrap = useTexture("/textures/coverWrap.png");
  const leafWrap = useTexture("/textures/leafWrap.png");
  const coverRoughness = useTexture("/textures/coverRoughness.png");
  coverRoughness.encoding = THREE.LinearEncoding;
  coverWrap.minFilter = THREE.LinearMipMapLinearFilter;
  coverWrap.magFilter = THREE.NearestFilter;
  coverWrap.anisotropy = 16;
  leafWrap.magFilter = THREE.NearestFilter;
  leafWrap.anisotropy = 16;

  useEffect(() => {
    const onDown = () => {
      // burning.current = true;
      // if (sessionStartRef.current === null) {
      //   sessionStartRef.current = Date.now();
      // }
      if (!burning.current) {
        burning.current = true;
        if (sessionStartRef.current === null) {
          sessionStartRef.current = Date.now();
        }
      }
    };
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

  // useEffect(() => {
  //   const mats = [cover?.material, leaf?.material];
  //   for (const mat of mats) {
  //     if (!mat) continue;
  //     mat.transparent = true;
  //     mat.side = THREE.DoubleSide;
  //     mat.clippingPlanes = [burnClip.current];
  //   }
  // }, [cover, leaf]);

  //material
  useEffect(() => {
    if (!cover || !leaf) return;

    // Cover 머티리얼 설정
    const coverMaterial = new THREE.MeshStandardMaterial({
      map: coverWrap,
      metalness: 0.1,
      roughness: 0.9,
      roughnessMap: coverRoughness,
      transparent: true,
      side: THREE.DoubleSide,
      clippingPlanes: [burnClip.current],
    });
    coverMaterial.map.repeat.set(1, 1); // 필요시 조절
    coverMaterial.map.wrapS = THREE.RepeatWrapping;
    coverMaterial.map.wrapT = THREE.RepeatWrapping;
    // coverMaterial.map.offset.x = 0.9;
    cover.material = coverMaterial;

    // Leaf 머티리얼 설정 (노이즈 이미지 기반)
    const leafMaterial = new THREE.MeshStandardMaterial({
      map: leafWrap,
      transparent: true,
      side: THREE.DoubleSide,
      clippingPlanes: [burnClip.current],
    });
    leafMaterial.map.wrapS = THREE.RepeatWrapping;
    leafMaterial.map.wrapT = THREE.RepeatWrapping;
    leaf.material = leafMaterial;
  }, [cover, leaf, coverWrap, leafWrap]);

  //helper
  useEffect(() => {
    if (!cigaretteGroup.current) return;
    // const helper = new THREE.PlaneHelper(burnClip.current, 0.2, 0xff0000);
    // cigaretteGroup.current.add(helper);
  }, []);

  //Ash
  useEffect(() => {
    if (!ashRef.current) return;

    ashRef.current.position.set(-1.09, 0, 0);
    ashRef.current.scale.set(0.01, 0.01, 0.01);
    ashRef.current.rotation.set(0, 0, Math.PI / 2);

    const ashMaterial = createAshMaterial();
    ashMatRef.current = ashMaterial;

    ashRef.current.traverse((child) => {
      if (child.isMesh) {
        child.material = ashMaterial;
      }
    });
  }, []);

  const ashMatRef = useRef();

  //Ash Animation
  useAshTimeUniform(ashMatRef);
  useFrame((_, delta) => {
    if (ashRef.current) {
      ashRef.current.traverse((child) => {
        if (child.isMesh && child.material.uniforms?.time) {
          child.material.uniforms.time.value += delta;
        }
      });
    }
  });

  useFrame(() => {
    // dropping 애니메이션
    if (mode === "dropping") {
      console.log("dropping mode");

      if (cigaretteGroup.current) {
        const posY = cigaretteGroup.current.position.y;
        if (posY > -12) {
          cigaretteGroup.current.position.y -= 0.05;
        }

        const offset = burnAmount.current / 2;
        const target = new THREE.Vector3(offset, -2, 0);
        lookTarget.current.lerp(target, 0.05);
        camera.lookAt(lookTarget.current);

        if (posY <= -12 && !dropFinished.current) {
          dropFinished.current = true;
          const timestamp = new Date().toISOString();
          let duration = 0;
          if (sessionStartRef.current !== null) {
            duration = Date.now() - sessionStartRef.current;
          }
          // if (burning.current && sessionStartRef.current !== null) {
          //   duration = Date.now() - sessionStartRef.current;
          // }

          const existing = JSON.parse(localStorage.getItem("ashtray") || "[]");
          existing.push({
            burn: burnAmount.current,
            time: timestamp,
            duration,
          });
          localStorage.setItem("ashtray", JSON.stringify(existing));

          setMode("ashtray");
          console.log("ashtray mode");
          sessionStartRef.current = null;
        }
      }

      return;
    }

    if (!cigaretteGroup.current || !ashRef.current) return;

    // cigaretteGroup 클리핑
    if (burning.current && burnAmount.current <= MAX_BURN) {
      burnAmount.current += 0.002;
      burnClip.current.constant = -(INITIAL_OFFSET + burnAmount.current);
    }

    // console.log(burnAmount.current, growing.current);

    // Ash 조건부 표시 및 위치/스케일 업데이트
    if (
      (mode === "smoking" &&
        burning.current &&
        burnAmount.current > 0.31 &&
        ashLengthScale.current >= 0.3) ||
      mode === "dropping"
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
