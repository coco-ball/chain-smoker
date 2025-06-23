import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CigaretteScene from "./components/CigaretteScene";
import AshtrayScene from "./components/AshtrayScene";
import { useState, useRef } from "react";

export default function App() {
  const [mode, setMode] = useState("smoking");

  const burnAmount = useRef(0);
  const ashLengthScale = useRef(1); // 1일 때 길이 40

  const renderSmokingCanvas = () => (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ localClippingEnabled: true, toneMappingExposure: 1.0 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 10, 5]} intensity={2} />
      <directionalLight position={[10, 10, 0]} intensity={1} />
      <CigaretteScene
        mode={mode}
        setMode={setMode}
        burnAmount={burnAmount}
        ashLengthScale={ashLengthScale}
      />
      <OrbitControls />
    </Canvas>
  );

  const renderAshtrayCanvas = () => (
    <Canvas
      camera={{ position: [5, 10, 5], fov: 45 }}
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ localClippingEnabled: true, toneMappingExposure: 1.0 }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[40, 80, -40]} intensity={1.5} />
      <AshtrayScene />
      <OrbitControls />
    </Canvas>
  );

  return (
    <div className="canvas-container">
      {mode === "smoking" || mode === "dropping"
        ? renderSmokingCanvas()
        : renderAshtrayCanvas()}

      <button
        onClick={() => {
          if (mode === "ashtray") {
            window.location.reload(); // smoke로 돌아갈 때 강제 초기화
          } else {
            setMode("dropping");
          }
        }}
        className="ashtray-btn"
      >
        {mode === "smoking" ? "Ashtray" : "Smoke"}
      </button>
      <div className="title">Chain Smoker</div>
    </div>
  );
}
