import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CigaretteScene from "../components/CigaretteScene";
import { useNavigate } from "react-router-dom";

export default function SmokingPage() {
  const navigate = useNavigate();
  const handleStop = () => {
    navigate("/ashtray");
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
        <CigaretteScene />
        <OrbitControls />
      </Canvas>
      <button onClick={handleStop} className="ashtray-btn">
        Ashtray
      </button>
    </div>
  );
}
