import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CigaretteScene from "./components/CigaretteScene";
import AshtrayScene from "./components/AshtrayScene";
import { useState, useRef } from "react";
import * as THREE from "three";

export default function App() {
  const [mode, setMode] = useState("smoking");

  const burnAmount = useRef(0);
  const ashLengthScale = useRef(1); // 1일 때 길이 40

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        style={{ width: "100%", height: "100%" }}
        gl={{
          localClippingEnabled: true,
          toneMappingExposure: mode === "ashtray" ? 0.3 : 1.0,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 10, 5]} intensity={2} />
        <directionalLight position={[10, 10, 0]} intensity={1} />

        {mode === "smoking" || mode === "dropping" ? (
          <CigaretteScene
            // key={mode}
            mode={mode}
            setMode={setMode}
            burnAmount={burnAmount}
            ashLengthScale={ashLengthScale}
          />
        ) : (
          <AshtrayScene />
        )}
        {/* {mode === "smoking" && <OrbitControls />} */}
        <OrbitControls />
      </Canvas>

      <button
        onClick={() => {
          if (mode === "ashtray") {
            window.location.reload(); // smoke로 돌아갈 때 강제 새로고침
          } else {
            setMode("dropping");
          }
        }}
        className="ashtray-btn"
      >
        {mode === "smoking" ? "Ashtray" : "Smoke"}
      </button>
    </div>
  );
}
