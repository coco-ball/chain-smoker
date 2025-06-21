import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CigaretteScene from "./components/CigaretteScene";

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      shadows
      style={{ width: "100vw", height: "100vh" }}
      gl={{ localClippingEnabled: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <CigaretteScene />
      <OrbitControls />
    </Canvas>
  );
}
