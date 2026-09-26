import { Routes, Route } from "react-router-dom";
import Categorias from "./pages/categorias";
function App() {
  return (
    <Routes>
      <Route path="/categorias" element={<Categorias />} />
    </Routes>
  );
}
export default App;
