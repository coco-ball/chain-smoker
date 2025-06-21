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

  const finishSmoking = () => {
    const timestamp = new Date().toISOString();

    const buttData = {
      burn: burnAmount.current,
      // ashScale: ashLengthScale.current,
      time: timestamp,
    };

    const existing = JSON.parse(localStorage.getItem("ashtray") || "[]");
    existing.push(buttData);

    localStorage.setItem("ashtray", JSON.stringify(existing));

    setMode("ashtray");
  };

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        style={{ width: "100%", height: "100%" }}
        gl={{ localClippingEnabled: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        {mode === "smoking" ? (
          <CigaretteScene
            burnAmount={burnAmount}
            ashLengthScale={ashLengthScale}
          />
        ) : (
          <AshtrayScene />
        )}
        <OrbitControls />
      </Canvas>

      {mode === "smoking" && (
        <button onClick={finishSmoking} className="ashtray-btn">
          Ashtray
        </button>
      )}
    </div>
  );
}
