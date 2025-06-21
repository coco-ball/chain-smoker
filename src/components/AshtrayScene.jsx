import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import Butt from "./Butt";

export default function AshtrayScene() {
  const [butts, setButts] = useState([]);
  const { scene: cigScene } = useGLTF("/models/cigarette.glb");
  const { scene: ashScene } = useGLTF("/models/ash.glb");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("ashtray") || "[]");
    setButts(data);
    console.log(data);
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
            ashModel={ashScene.clone()}
          />
        ))}
    </>
  );
}
