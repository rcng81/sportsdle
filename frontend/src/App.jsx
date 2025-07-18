import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BasketballHome, BasketballGame } from "./basketball";
import SportSelection from "./SportSelection";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SportSelection />} />
        <Route path="/basketball" element={<BasketballHome />} />
        <Route path="/basketball/daily" element={<BasketballGame mode="daily" />} />
        <Route path="/basketball/unlimited" element={<BasketballGame mode="unlimited" />} />
      </Routes>
    </Router>
  );
}

export default App;
