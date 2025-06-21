import { Routes, Route } from "react-router-dom";
import SmokingPage from "./pages/SmokingPage";
import AshtrayPage from "./pages/AshtrayPage";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SmokingPage />} />
      <Route path="/ashtray" element={<AshtrayPage />} />
    </Routes>
  );
}
