import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Game from "./Game";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<Game mode="daily" />} />
        <Route path="/unlimited" element={<Game mode="unlimited" />} />
      </Routes>
    </Router>
  );
}

export default App;
