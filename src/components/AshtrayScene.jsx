import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import Butt from "./Butt";

export default function AshtrayScene() {
  const [butts, setButts] = useState([]);
  const { scene: cigScene } = useGLTF("/models/cigarette.glb");
  const { scene: ashScene } = useGLTF("/models/ash.glb");
  const ash = ashScene.getObjectByName("Ash");

  useEffect(() => {
    if (!ashScene) return;

    const data = JSON.parse(localStorage.getItem("ashtray") || "[]");
    setButts(data);
    console.log(data);
    console.log("ashScene", ashScene.children);
    console.log("ash:", ash);
  }, []);

  return (
    <>
      {ashScene &&
        cigScene &&
        butts.map((data, i) => (
          <Butt
            key={i}
            index={i}
            buttData={data}
            cigModel={cigScene.clone()}
            ashModel={ash?.clone()}
          />
        ))}
    </>
  );
}
